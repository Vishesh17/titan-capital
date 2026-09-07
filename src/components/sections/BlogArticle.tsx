"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import BackLink from "@/components/ui/BackLink";
import { BlogCard, toBlog, type BlogPostCard } from "./BlogsClient";
import StoryBlocks, { type StoryBlock } from "./FounderStoryBlocks";
import {
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
} from "@/styles/heroTypography";

/**
 * /blogs/[slug] — the article.
 *
 * THE HEADER IS FIXED and lives here: the meta line, the title, the one-liner
 * and the cover, in that order on every post. Everything below it is composed
 * by the editor and rendered by StoryBlocks — the SAME renderer and the same
 * block types the founder stories use, so the two layouts cannot drift apart.
 *
 * TYPE SCALE of the header, by level:
 *   title         LEVEL 4
 *   one-liner     LEVEL 5
 *   meta line     LEVEL 6
 */

export interface BlogPostData {
  slug?: string;
  title?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  readTime?: string;
  category?: string;
  /** Everything below the header, in the order the editor arranged it. */
  blocks?: StoryBlock[];
}

const COLUMN = "1200px";

const RISE = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ═══════════════════════════════════════════════════════════
   1. HEADER — meta, title, one-liner, cover
   ═══════════════════════════════════════════════════════════ */
function BlogHeader({ post }: { post: BlogPostData }) {
  /* The line ABOVE the title: author and category, at level 6. Built from
     whatever is filled in, so a post with no author still reads properly
     rather than opening on a stray separator. */
  const meta = [post.author, post.category && `Category: ${post.category}`]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <section
      className="relative w-full bg-white"
      style={{
        paddingTop: "calc(var(--nav-height) + clamp(24px, min(3vw, 4.4vh), 56px))",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full flex-col" style={{ maxWidth: COLUMN }}>
        {/* ── Back / breadcrumb ── */}
        <div className="flex w-full flex-row items-center justify-between">
          {/* history.back(), NOT a <Link href="/blogs">. A Link is a FORWARD
              navigation: the browser has no scroll position for it, so it
              landed the reader at the top of the listing every time — which,
              once Load More has been pressed, also drops them back to the
              first nine posts. The other three detail pages already use this
              component; the article was the one still using a plain link. */}
          <BackLink
            fallbackHref="/blogs"
            className="font-['Poppins',_sans-serif] font-light text-black transition-opacity duration-200 hover:opacity-70"
            style={LABEL_STYLE}
          >
            Back
          </BackLink>
          <p className="m-0 font-['Poppins',_sans-serif] text-black" style={LABEL_STYLE}>
            <Link
              href="/blogs"
              className="font-light transition-opacity duration-200 hover:opacity-70"
            >
              Blogs
            </Link>
            <span className="font-light"> / </span>
            {/* THE SLUG, which is the URL segment this crumb stands for —
                /blogs/lane reads "Blogs / lane". It was `category || title`,
                so the one post in Sanity carrying a category (lane) showed
                "Blogs / Investment News": a crumb naming a page that does not
                exist, while every other post fell through to its full title.
                The slug is the only field that is always set here — the route
                matched on it to find this post — so the crumb can never be
                empty and never disagrees with the address bar. */}
            <span className="font-medium">{post.slug || post.title}</span>
          </p>
        </div>

        <motion.div
          className="flex w-full flex-col"
          style={{ marginTop: "clamp(28px, min(3.2vw, 4.6vh), 62px)" }}
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {meta && (
            <motion.p
              variants={RISE}
              className="m-0 font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
              style={LABEL_STYLE}
            >
              {meta}
            </motion.p>
          )}

          {post.title && (
            <motion.h1
              variants={RISE}
              className={`m-0 font-semibold text-[#0E0E0E] ${SUBHEADING_CLASS}`}
              style={{
                ...SUBHEADING_STYLE,
                lineHeight: 1.28,
                marginTop: "clamp(8px, min(0.9vw, 1.3vh), 16px)",
              }}
            >
              {post.title}
            </motion.h1>
          )}

          {post.excerpt && (
            <motion.p
              variants={RISE}
              className={`m-0 font-normal text-[#3d3d3d] ${HERO_BODY_CLASS}`}
              style={{
                ...HERO_BODY_STYLE,
                lineHeight: 1.6,
                marginTop: "clamp(12px, min(1.4vw, 2vh), 24px)",
              }}
            >
              {post.excerpt}
            </motion.p>
          )}

          {post.coverImage && (
            <motion.div
              variants={RISE}
              className="relative w-full overflow-hidden bg-[#f0f0f0]"
              style={{
                marginTop: "clamp(24px, min(2.8vw, 4vh), 52px)",
                aspectRatio: "16 / 9",
                borderRadius: "2px",
              }}
            >
              <Image
                src={post.coverImage}
                alt={post.title || ""}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover object-center"
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   The article
   ═══════════════════════════════════════════════════════════ */
export default function BlogArticle({
  post,
  more = [],
}: {
  post: BlogPostData;
  /** Other posts for an Explore block, already excluding this one. */
  more?: BlogPostCard[];
}) {
  return (
    <>
      <BlogHeader post={post} />
      {/* THE SAME RENDERER THE FOUNDER STORIES USE, from the same block types.
          The only thing this page supplies of its own is the cards for an
          Explore block — blog cards here, founder cards there — so the two
          layouts cannot drift apart. White on the cream band, the inverse of
          the listing where cream cards sit on white. */}
      <StoryBlocks
        blocks={post.blocks}
        cards={more
          .slice(0, 3)
          .map((p, i) => (
            <BlogCard key={`${p.slug}-${i}`} blog={toBlog(p, i)} surface="#FFFFFF" />
          ))}
      />
    </>
  );
}
