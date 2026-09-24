import Link from "next/link";

import Footer from "@/components/sections/Footer";
import BlogArticle, { type BlogPostData } from "@/components/sections/BlogArticle";
import { sanityFetch } from "@/sanity/lib/client";
import {
  allBlogPostsQuery,
  blogPostBySlugQuery,
  blogPostSlugsQuery,
} from "@/sanity/lib/queries";
import type { BlogPostCard } from "@/components/sections/BlogsClient";
import { buildMetadata } from "@/sanity/lib/seo";

/**
 * /blogs/[slug] — the article, entirely Sanity-driven.
 *
 * Every part of the layout hides itself when its content is empty, so the page
 * renders BlogArticle unconditionally and lets it decide. An unknown slug shows
 * a plain "not published" state rather than falling back to another post.
 */

export const revalidate = 60;

async function getPost(slug: string): Promise<BlogPostData | null> {
  try {
    return await sanityFetch<BlogPostData | null>({
      query: blogPostBySlugQuery,
      params: { slug },
      revalidate: 60,
    });
  } catch (err) {
    console.error(`[blog] fetch failed for "${slug}":`, err);
    return null;
  }
}

/** The other posts, for the Explore band — never the one being read. */
async function getMore(slug: string): Promise<BlogPostCard[]> {
  try {
    const all = await sanityFetch<BlogPostCard[] | null>({
      query: allBlogPostsQuery,
      revalidate: 60,
    });
    return (all ?? []).filter((p) => p.slug !== slug).slice(0, 3);
  } catch {
    /* The band hides itself on an empty list, so this is safe. */
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[] | null>({
      query: blogPostSlugsQuery,
      revalidate: 60,
    });
    return (slugs ?? []).map((slug) => ({ slug }));
  } catch {
    /* Empty is safe — routes still render on demand. */
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = await buildMetadata("blogs");
  const post = await getPost(slug);
  if (!post) return base;
  /* The post's own SEO fields win, then the fields it has always reused —
     the headline and the card excerpt — then the Blogs page defaults. A
     post with no keywords of its own inherits the Blogs page's, which is
     what `base.keywords` already holds. */
  return {
    ...base,
    title: post.metaTitle || post.title || base.title,
    description: post.metaDescription || post.excerpt || base.description,
    keywords: post.keywords?.length ? post.keywords : base.keywords,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <main className="flex min-h-screen w-full flex-col bg-white">
        <section
          className="flex w-full flex-1 flex-col items-center justify-center text-center"
          style={{
            paddingTop: "calc(var(--nav-height) + var(--section-py))",
            paddingBottom: "var(--section-py)",
            paddingLeft: "var(--section-px-wide)",
            paddingRight: "var(--section-px-wide)",
            minHeight: "60svh",
          }}
        >
          <h1
            className="m-0 font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
            style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: "140%" }}
          >
            This note isn&apos;t published yet.
          </h1>
          <Link
            href="/blogs"
            className="mt-[24px] font-['Poppins',_sans-serif] font-medium text-[#001A4D] underline underline-offset-4"
          >
            Back to all notes
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  const more = await getMore(slug);

  return (
    <main className="flex min-h-screen w-full flex-col bg-white">
      <BlogArticle post={post} more={more} />
      <Footer />
    </main>
  );
}
