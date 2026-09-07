"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SeeMoreButton } from "./ImpactAtGlanceClient";

/* ─────────────────────────────────────────────────────────
   Blogs listing — featured note + category/search filter bar +
   a bordered card grid whose rules each draw themselves as they come into
   view. Every card is a link marked with a corner arrow;
   the navy pill is now only the search control.
   ───────────────────────────────────────────────────────── */

/* .jpeg, not .png — the file on disk is skyscrappers.jpeg, so the old path
   404'd and every placeholder card rendered a broken image. */
const BLOG_IMAGE = "/images/indicorns/skyscrappers.jpeg";

export interface Blog {
  id: number;
  image: string;
  author: string;
  readTime: string;
  category: string;
  title: string;
  excerpt: string;
  href: string;
  /** Pills above the meta line. Optional — a post with none simply omits them. */
  tags?: string[];
}

const CATEGORIES = [
  "Investment Theses",
  "Founder Playbooks",
  "Portfolio News",
  "Titan View",
];

const makeBlog = (id: number): Blog => ({
  id,
  image: BLOG_IMAGE,
  author: "Kunal Bahl",
  readTime: "12 Min Read",
  category: "Investment Thesis",
  title: "The India D2C Playbook: What 50 Investments Taught Us",
  excerpt:
    "The Patterns, The Misfires, And The Counterintuitive Lessons From A Decade Of Backing Consumer Brands In India.",
  href: "#",
  tags: ["D2C", "Consumer Brand", "IPO 2023"],
});

/* Placeholders, used only until posts exist in Sanity. */
const FALLBACK_POSTS: Blog[] = Array.from({ length: 9 }, (_, i) => makeBlog(i));

/** What the listing receives from Sanity — see allBlogPostsQuery. */
export interface BlogPostCard {
  slug?: string;
  title?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  readTime?: string;
  category?: string;
  publishedAt?: string;
  /** "left" | "right" | "none" — see the `placement` field in blogPost. */
  placement?: string;
  /** Superseded by `placement`; still read as a fallback. */
  featured?: boolean;
}

/** Sanity shape -> the shape the cards already expect. */
export function toBlog(p: BlogPostCard, i: number): Blog {
  return {
    id: i,
    image: p.coverImage || BLOG_IMAGE,
    author: p.author || "",
    readTime: p.readTime || "",
    category: p.category || "",
    title: p.title || "",
    excerpt: p.excerpt || "",
    // Trim stray slashes: a slug typed as "/bobabhai" would otherwise build
    // "/blogs//bobabhai", which is not the route and 404s.
    href: p.slug?.replace(/^\/+|\/+$/g, "") ? `/blogs/${p.slug.replace(/^\/+|\/+$/g, "")}` : "#",
    tags: p.tags,
  };
}

/** ONE cover shape for every picture on this page — featured note, the cards
 *  beside it and the grid below — so the page reads as a single set. The page
 *  used to hold two: 16/10 up top and 16/11 in the grid. */
const CARD_IMAGE_ASPECT = "16 / 11";

/* ── Side-card geometry ──
   The share of the card's width the picture takes. Antler's equivalent card
   gives it 48%; ours needs more, because our copy carries more than theirs
   does, and a taller picture is what pays for it. */
const SIDE_IMAGE_SHARE = 0.57;
/* The CARD's own shape, derived from the two numbers above rather than typed
   out — this is what removes the gap. Fix the card's ratio and its height no
   longer depends on how long the copy runs: the picture fills its column
   exactly, top to bottom, and the copy is centred in what is left. Changing
   either constant above keeps this correct. */
const SIDE_CARD_ASPECT = 16 / 11 / SIDE_IMAGE_SHARE;

/* ── HOW MUCH OF THE GRID IS SHOWN AT ONCE ──
   Three rows of the three-column grid, and one more helping of the same size
   per click of Load More. Counted in CARDS rather than rows because the grid
   drops to a single column below md, where "three rows" would be three posts
   — the archive is the same archive whatever width it is read at. */
const PAGE_ROWS = 3;
const PAGE_SIZE = PAGE_ROWS * 3;

const STORY_GAP = "calc(var(--section-px-wide) * 0.4)";
// No outer inset — the grid aligns to the same left/right gutter as the
// featured card and the filter bar; only the internal dividers show.
const BORDER_PADDING = "0px";
const NAVY = "#001A4D";
/* The team page's blob blue, sampled from /images/team/blob-blue.png rather
   than eyeballed — 99.8% of that image's opaque pixels are exactly this. It is
   already a house colour: the testimonial's highlight bar uses the same. */
const TAG_BLUE = "#D3E2FF";
/* One step deeper, same hue, so the pill has an edge without the old beige
   border reading as a different family against the blue. */
const TAG_BLUE_EDGE = "#C2D4FF";

/* ── THE CARD'S AFFORDANCE, in place of a "Read Note" button ──
   A bare ↗ at the card's edge, the way the Antler insights cards mark
   theirs. The WHOLE CARD is the link now, so this is a mark rather than a
   target — which is the point of the change: a labelled pill is a small
   click area sitting inside a large one that did nothing.

   It leans out on hover, on the house curve, so the card still says it is
   clickable without a word on it. `group-hover` and not its own hover state,
   for that reason — it answers to the card, not to itself. */
function CardArrow({ size = 22 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center text-[#0E0E0E] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <path
          d="M7 17L17 7M17 7H8.6M17 7V15.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ── Cursor-fill pill ──
   Same interaction as JoinPortfolio's CursorFillButton: a white fill grows
   from the cursor's entry point and the label flips to navy. The cards used
   to carry one of these as "Read Note"; the search control is the only one
   left, so this no longer has a link form. */
function NavyPill({
  label,
  onClick,
  small,
}: {
  label: string;
  onClick?: () => void;
  small?: boolean;
}) {
  const [origin, setOrigin] = useState("50% 50%");
  const [hovered, setHovered] = useState(false);

  const track = (e: React.MouseEvent<HTMLElement>, next: boolean) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setHovered(next);
  };

  const cls =
    "relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap font-['Poppins',_sans-serif] font-medium transition-colors duration-300";
  const style: React.CSSProperties = {
    padding: small ? "8px 20px" : "12px 30px",
    fontSize: small ? "clamp(12px, 1vw, 14px)" : "clamp(13px, 1.05vw, 15px)",
    borderRadius: 9999,
    background: NAVY,
    border: `1px solid ${NAVY}`,
    color: hovered ? NAVY : "#fff",
  };

  const inner = (
    <>
      <span
        className="absolute inset-0 bg-white transition-transform duration-[400ms] ease-out"
        style={{ transformOrigin: origin, transform: hovered ? "scale(1)" : "scale(0)", borderRadius: "inherit" }}
      />
      <span className="relative z-10">{label}</span>
    </>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={(e) => track(e, true)}
      onMouseLeave={(e) => track(e, false)}
      className={cls}
      style={style}
    >
      {inner}
    </button>
  );
}

function MetaLine({ blog, reserve }: { blog: Blog; reserve?: boolean }) {
  /* Built from whatever is actually filled in. Joining unconditionally left a
     post with no author or read time opening on bare separators and a dangling
     "Category:" — the separator belongs BETWEEN parts, so there is no line at
     all when there are no parts.

     `reserve` is for the grid, where cards sit side by side: there the empty
     line still has to occupy its row, or the card without a byline pulls every
     line below it up out of step with its neighbours. */
  /* NO CATEGORY HERE ANY MORE — it reads as a pill alongside the tags, which
     is where a label belongs; as prose it produced the dangling
     "Category: Investment News" line that was the card's only meta. */
  const meta = [blog.author, blog.readTime].filter(Boolean).join(" · ");
  if (!meta) return reserve ? <p className="m-0" style={{ fontSize: "clamp(11px, 0.9vw, 13px)", lineHeight: "150%" }}>&nbsp;</p> : null;
  return (
    <p
      className="m-0 font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
      style={{ fontSize: "clamp(11px, 0.9vw, 13px)", lineHeight: "150%" }}
    >
      {meta}
    </p>
  );
}

/* ── Tag pills ── */
function Tags({
  tags,
  category,
  small,
  oneLine,
  reserve,
}: {
  tags?: string[];
  /** THE POST'S CATEGORY BECOMES A PILL, automatically and in front of the
      rest, so setting one in Sanity is all it takes for it to show — nothing
      to also type into the tag list. Deduped case-insensitively, so a post
      that already carries its category as a tag does not get it twice. */
  category?: string;
  small?: boolean;
  /** One row, at most two pills — for the narrow side-card column. A third
      pill does not fit there and was being sliced through the middle of its
      own word, which reads as a bug rather than as a deliberate cut. */
  oneLine?: boolean;
  /** Hold the row's height even with nothing in it — for the grid, where a
      post with no pills would otherwise start its headline a line above the
      card beside it. Same job `reserve` does on MetaLine. */
  reserve?: boolean;
}) {
  const cat = category?.trim();
  const all = [
    ...(cat ? [cat] : []),
    ...(tags ?? []).filter((t) => t.trim().toLowerCase() !== cat?.toLowerCase()),
  ];
  const shown = oneLine ? all.slice(0, 2) : all;

  const pillClass =
    "inline-flex shrink-0 items-center whitespace-nowrap rounded-full font-['Poppins',_sans-serif] font-normal text-[#3d3d3d]";
  const pillStyle: React.CSSProperties = {
    padding: small ? "5px 12px" : "7px 18px",
    fontSize: small ? "clamp(10px, 0.78vw, 12px)" : "clamp(11px, 0.9vw, 13px)",
    background: TAG_BLUE,
    border: `1px solid ${TAG_BLUE_EDGE}`,
  };

  if (!shown.length) {
    /* An invisible REAL pill, not a guessed height — the row then measures
       exactly what a filled one would. */
    return reserve ? (
      <div className="flex" style={{ gap: small ? "6px" : "8px" }}>
        <span className={`${pillClass} invisible`} style={pillStyle} aria-hidden>
          &nbsp;
        </span>
      </div>
    ) : null;
  }

  return (
    <div
      className={oneLine ? "flex flex-nowrap overflow-hidden" : "flex flex-wrap"}
      style={{ gap: small ? "6px" : "8px" }}
    >
      {shown.map((t) => (
        <span key={t} className={pillClass} style={pillStyle}>
          {t}
        </span>
      ))}
    </div>
  );
}

/* ── The two cards stacked beside the featured note.
      Image on the left, copy on the right — a landscape card, where the
      featured one is a portrait. Below md it drops to the same stacked shape
      as the grid cards, because a 44% image column at phone width leaves the
      copy in a gutter too narrow to read. ── */
function SideCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={blog.href}
      className="group flex w-full flex-col bg-white sm:min-h-0 sm:flex-row sm:[aspect-ratio:var(--side-card-ar)]"
      style={{ "--side-card-ar": `${SIDE_CARD_ASPECT}` } as React.CSSProperties}
    >
      {/* THE PICTURE SETS THE CARD'S HEIGHT, and everything below follows from
          that. It was the other way round — the image column was stretched to
          whatever height the copy needed, so the picture had no shape of its
          own; and once it was given a fixed ratio, the copy still ran taller
          and left white space beneath it.

          This is how the Antler cards are built: two near-equal columns, the
          picture a plain rectangle, and the card's height taken from the
          picture rather than the text. Here the ratio lives on the CARD, so
          `h-full` + a 57% column IS 16/11 by construction — the picture fills
          its column corner to corner and nothing can push the card taller. */}
      <div
        className="relative w-full shrink-0 self-start overflow-hidden sm:h-full sm:w-[57%] sm:self-auto"
        style={{ aspectRatio: CARD_IMAGE_ASPECT }}
      >
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          sizes="(max-width: 640px) 100vw, 24vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      {/* No VERTICAL padding from sm up: the copy is centred against the
          picture's full height, and every pixel of it is needed. Horizontal
          padding stays — text has to be held off the card's white edge. */}
      <div
        className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden p-[clamp(16px,1.5vw,26px)] sm:h-full sm:px-[clamp(13px,1.15vw,20px)] sm:py-0"
        style={{ gap: "clamp(4px, 0.4vw, 7px)" }}
      >
        {/* Tags, headline, description — no byline. The read time and category
            belong to the featured note and the grid cards; in a column this
            narrow they wrapped to two lines and crowded out the copy.
            One row of pills, and any that do not fit are cut rather than
            stacking three-high. */}
        <Tags tags={blog.tags} category={blog.category} small oneLine />
        {/* Clamped, because in a column this narrow a long headline would
            otherwise run to five lines and burst the card. */}
        <h3
          className="m-0 overflow-hidden font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
          style={{
            fontSize: "clamp(17px, 1.45vw, 23px)",
            lineHeight: "132%",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}
        >
          {blog.title}
        </h3>
        <p
          className="m-0 overflow-hidden font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
          style={{
            fontSize: "clamp(12px, 1vw, 14px)",
            lineHeight: "158%",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
        >
          {blog.excerpt}
        </p>
        <div className="flex items-center justify-end">
          <CardArrow size={20} />
        </div>
      </div>
    </Link>
  );
}

/* ── Card used in the grid ──
   Exported because the article page's "Explore Blog" band renders the SAME
   card, so a card there can never drift from a card on the listing. It takes
   its own surface: beige on the white grid, white on the beige Explore band —
   each is the inverse of what it sits on. ── */
export function BlogCard({
  blog,
  surface = "#FBF7F0",
}: {
  blog: Blog;
  surface?: string;
}) {
  return (
    <Link
      href={blog.href}
      className="group flex h-full w-full flex-col"
      style={{ background: surface }}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: CARD_IMAGE_ASPECT }}>
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div
        className="flex flex-1 flex-col"
        style={{
          padding: "clamp(16px, 1.4vw, 22px) clamp(16px, 1.4vw, 22px) clamp(20px, 1.7vw, 28px)",
          gap: "clamp(8px, 0.9vw, 14px)",
        }}
      >
        {/* EVERY ROW OF A CARD LINES UP WITH THE SAME ROW OF ITS NEIGHBOURS.
            `reserve` keeps the meta line's height on a post that has no author
            or category, so its title does not ride up while the card beside it
            starts a line lower. */}
        <Tags tags={blog.tags} category={blog.category} small reserve />
        <MetaLine blog={blog} reserve />
        <h3
          className="m-0 font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
          style={{
            fontSize: "clamp(18px, 1.5vw, 22px)",
            lineHeight: "130%",
            /* EXACTLY two lines, always. The min-height stops a one-line title
               starting its description a line above its neighbour; the clamp
               stops a three-line title pushing it a line below. Together they
               make the block a fixed size, which is what lets every card in
               the grid agree on where the copy sits. */
            minHeight: "2.6em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog.title}
        </h3>
        <p
          className="m-0 font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
          style={{
            fontSize: "clamp(13px, 1.05vw, 15px)",
            lineHeight: "160%",
            /* Three lines, same reasoning. Without this one long excerpt made
               its row 973px against the others' 613px — and every other row
               was then stretched to match it. */
            minHeight: "4.8em",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog.excerpt}
        </p>
        {/* `mt-auto` takes up whatever slack the card has, so the arrow sits
            on the card's floor rather than wherever the copy happened to end.
            This is what the equal-height rows above are for. */}
        <div
          className="flex items-center justify-end"
          style={{ marginTop: "auto", paddingTop: "clamp(10px, 1.1vw, 18px)" }}
        >
          <CardArrow size={22} />
        </div>
      </div>
    </Link>
  );
}

export default function BlogsClient({ posts }: { posts?: BlogPostCard[] | null }) {
  /* Derived in ONE memo, so the arrays are referentially stable. The filter
     below depends on `BLOGS`, and rebuilding these on every render would make
     that memo recompute every time — which is what the lint rule catches. */
  const { FEATURED, FEATURED_SIDE, BLOGS, categories } = useMemo(() => {
    /* Sanity when there is any, placeholders otherwise — so the page never
       renders as an empty shell while the team is still filling it in. */
    const all: Blog[] = posts?.length ? posts.map(toBlog) : FALLBACK_POSTS;

    /* ── WHO SITS WHERE IN THE SPOTLIGHT ──
       The editor now says it outright, per post: "left" takes the large card,
       "right" joins the scrolling column. `featured` is still honoured for
       posts written before that field existed — the first of them takes the
       left, the rest fall to the right — so nothing has to be re-flagged for
       the block to keep working.

       EVERY SLOT IS THEN TOPPED UP from the remaining posts in date order, so
       a half-set choice (or none at all) still fills the block rather than
       collapsing it. */
    const pick = (want: string) =>
      posts?.length ? all.filter((_, i) => posts[i]?.placement === want) : [];
    const legacy = posts?.length
      ? all.filter((_, i) => posts[i]?.featured && !posts[i]?.placement)
      : all.slice(0, 5);

    const chosenLeft = pick("left")[0] ?? legacy[0];
    const chosenRight = [
      ...pick("right"),
      ...legacy.filter((b) => b !== chosenLeft),
    ];

    const spoken = new Set([chosenLeft, ...chosenRight].filter(Boolean));
    const rest = all.filter((b) => !spoken.has(b));

    const left = chosenLeft ?? rest[0];
    const side = [...chosenRight, ...rest.filter((b) => b !== left)].slice(0, 4);

    return {
      FEATURED: left,
      FEATURED_SIDE: side,
      /* EVERY post, including the three above. The grid used to get only the
         leftovers, so a site with three posts or fewer showed "No notes match
         your search" under the filter bar — and searching could never reach a
         featured post. The header is a spotlight, not a subtraction. */
      BLOGS: all,
      /* Categories come from the posts themselves rather than a hardcoded
         list, so adding one in Sanity is enough — nothing to keep in step. */
      categories: posts?.length
        ? Array.from(new Set(all.map((b) => b.category).filter(Boolean)))
        : CATEGORIES,
    };
  }, [posts]);

  const [category, setCategory] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");

  /* Search matches title or author; category narrows on top of it. The
     category filter used to be display-only because every sample post shared
     one category — with real data it does something, so it is wired up. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOGS.filter(
      (b) =>
        (!q ||
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)) &&
        (!category || b.category === category)
    );
  }, [query, category, BLOGS]);

  /* Reset to the first page whenever the result set changes. Without this,
     narrowing to a category while six rows are open would show six rows of a
     shorter list — or every match at once, which is not what "load more"
     means. */
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );
  const hasMore = filtered.length > visible.length;

  /* From what is ON SCREEN, not from the whole result set. The dividers below
     are placed by dividing the grid's height into `rows` equal parts, so a
     count that included the hidden cards would scatter them across the cards
     that are actually drawn. */
  const rows = Math.max(1, Math.ceil(visible.length / 3));

  /* ── THE GRID'S DIVIDERS ──
     EVERY RULE DRAWS ITSELF, when it personally reaches the viewport.

     IT USED TO BE ONE GLOBAL SCALE, driven by `useScroll` across the whole
     section and shared by every rule. That cannot work for a grid that grows,
     and measurement showed it failing in three separate ways:

       - the first row sat on screen with the rules at 0.004 — the section is
         so tall that 30% of its travel is most of a screen past the first row,
         so the borders were invisible exactly when the cards were not;
       - they only reached full 759px BELOW the grid's top, then shrank back to
         0.73 on the way out;
       - Load More was worst: the six new rules appeared already at whatever
         the global value happened to be (0.182), never animating at all, while
         the vertical rule doubled from 310px to 626px of drawn length in a
         single frame. Framer did not re-measure the taller section either, so
         the shared value was stale on top of everything else.

     Per-rule reveal fixes all three at once, and Load More comes for free: the
     rules for the new rows are new elements, so they mount at zero and draw in
     as they are scrolled to, exactly like the first three rows did.

     The cost, stated plainly: these no longer un-draw when you scroll back up,
     the way the founders-story grid's do. A rule that reverses has to be a
     function of scroll position, and a scroll-linked value cannot also be
     "already correct" for rows that did not exist when the reader passed them. */
  const gridRef = useRef<HTMLDivElement>(null);

  /* One row's height, in the grid's own terms. It resolves to the same pixel
     value whatever `rows` is — rows are equal-height — which is what keeps the
     existing rules perfectly still when Load More adds more. */
  const rowTrack = `((100% - 2 * var(--bp) - ${rows - 1} * var(--gap)) / ${rows})`;

  const vLineLefts = [1, 2].map(
    (j) =>
      `calc(var(--bp) + ${j} * ((100% - 2 * var(--bp) - 2 * var(--gap)) / 3) + ${j - 0.5} * var(--gap))`
  );

  /* THE TRIGGER HAS TO HAVE AREA. Each row's rules live inside a band that
     covers the row, and the BAND is what is watched — the rules themselves
     cannot be.

     A rule is `width: 0` with a left border, or `height: 0` with a top border,
     and it starts at scale 0. That is a box of zero area, and an
     IntersectionObserver cannot reason about one: with `amount: 0.2` the row
     rules never fired at all, and even at threshold 0 the column rules were
     measured still undrawn with a third of the first row on screen, only
     snapping in once the grid was most of the way up the viewport. Watching a
     band with real width and height removes the guesswork entirely.

     Each band owns its row's two column segments and the divider ABOVE it.

     ABOVE, and that is the whole point — it used to own the one BELOW, which
     broke Load More in a way that only showed on the second page. With
     `once: true` a band stops watching after it fires. The band that was last
     had no divider; adding rows gave it one, and that new rule mounted into a
     band whose trigger had already run, so nothing ever animated it: measured
     at 100% visible with its columns drawn, its divider sat at 0 permanently.
     That was the horizontal line missing above each newly loaded first row.

     Owning the boundary above means no rule is ever added to an existing band.
     Rows 1..n-1 each bring their own top divider and animate it in; row 0 has
     nothing above it, and the last row needs no special case at all. */
  const bands = Array.from({ length: rows }, (_, r) => ({
    top: `calc(var(--bp) + ${r} * (${rowTrack} + var(--gap)))`,
    height: `calc(${rowTrack} + var(--gap))`,
    dividerAbove: r > 0,
  }));

  const RULE_TWEEN = { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const };
  const V_RULE = {
    hidden: { scaleY: 0 },
    visible: { scaleY: 1, transition: RULE_TWEEN },
  };
  const H_RULE = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { ...RULE_TWEEN, delay: 0.12 } },
  };

  return (
    <>
    <section
      className="relative w-full bg-[#FBF7F0]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        {/* ══════════ FEATURED NOTE ══════════
            One tall card on the left, two landscape cards stacked beside it.
            The two halves are independent columns rather than one grid of
            rows: the left card's height is set by its own image and copy, and
            forcing the right pair onto shared row tracks would either stretch
            their images or leave the left one short. `items-start` keeps each
            column measuring itself. */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid w-full grid-cols-1 items-start lg:grid-cols-2"
          style={{ gap: "clamp(20px, 2vw, 34px)" }}
        >
          {/* ── The big one. PINNED on desktop: it holds while the four beside
                it scroll past, which is what makes the right-hand column read
                as its own reel rather than a second stack of cards.
                `items-start` on the grid is what lets this work — the grid AREA
                still spans the full row height, so the pin has the side
                column's whole run to hold against. Below lg the two columns are
                stacked, where pinning one over the other would trap the page. ── */}
          <Link
            href={FEATURED.href}
            className="group flex w-full flex-col overflow-hidden bg-white lg:sticky lg:top-[calc(var(--nav-height,80px)+clamp(16px,2vw,32px))]"
          >
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: CARD_IMAGE_ASPECT }}
            >
              <Image
                src={FEATURED.image}
                alt={FEATURED.title}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div
              className="flex flex-1 flex-col"
              style={{
                padding: "clamp(20px, 2vw, 34px)",
                gap: "clamp(12px, 1.2vw, 20px)",
              }}
            >
              <Tags tags={FEATURED.tags} category={FEATURED.category} />
              <MetaLine blog={FEATURED} />
              <h2
                className="m-0 font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
                style={{
                  fontSize: "clamp(24px, min(2.5vw, 3.6vh), 36px)",
                  lineHeight: "125%",
                }}
              >
                {FEATURED.title}
              </h2>
              <p
                className="m-0 font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
                style={{
                  fontSize: "clamp(14px, min(1.25vw, 1.8vh), 18px)",
                  lineHeight: "160%",
                }}
              >
                {FEATURED.excerpt}
              </p>
              <div
                className="flex items-center justify-end"
                style={{ marginTop: "clamp(6px, 0.8vw, 12px)" }}
              >
                <CardArrow size={26} />
              </div>
            </div>
          </Link>

          {/* ── The four beside it, which do the scrolling ── */}
          <div className="flex w-full flex-col" style={{ gap: "clamp(20px, 2vw, 34px)" }}>
            {FEATURED_SIDE.map((blog, i) => (
              <div key={blog.id} className="flex w-full flex-col">
                {/* Rule between the pair, drawn from the left on entrance —
                    the site's rule that every divider scales rather than
                    fades. Only between them, never above the first. */}
                {i > 0 && (
                  <motion.div
                    aria-hidden
                    className="h-[1px] w-full origin-left"
                    style={{
                      background: "#0E0E0E",
                      marginBottom: "clamp(20px, 2vw, 34px)",
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  />
                )}
                <SideCard blog={blog} />
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>

    {/* ══════════ CARD GRID — ITS OWN SECTION ══════════
        White, where the featured block above is beige, so the two read as
        separate bands rather than one long field. The cards invert with it:
        beige on white here, white on beige there. */}
    <section
      className="relative w-full bg-white"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        {/* ══════════ FILTER BAR ══════════ */}
        <div
          className="relative z-30 flex w-full flex-col gap-[16px] md:flex-row md:items-center md:justify-between"
        >
          {/* Category dropdown */}
          <div className="relative w-full md:w-auto">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-[40px] rounded-[4px] font-['Poppins',_sans-serif] font-medium text-[#0E0E0E] md:w-auto"
              style={{ fontSize: "clamp(15px, 1.2vw, 18px)" }}
            >
              <span>{category ?? "Category"}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" stroke="#0E0E0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-[calc(100%+12px)] z-40 flex w-[260px] flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
              >
                {categories.map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(active ? null : cat);
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-[14px] px-[20px] py-[14px] text-left font-['Poppins',_sans-serif] font-normal text-[#0E0E0E] transition-colors duration-200 hover:bg-[#F5F1EA]"
                      style={{ fontSize: "clamp(14px, 1.05vw, 16px)" }}
                    >
                      <span
                        className="inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border"
                        style={{ borderColor: active ? NAVY : "#c9c9c9" }}
                      >
                        {active && <span className="h-[8px] w-[8px] rounded-full" style={{ background: NAVY }} />}
                      </span>
                      {cat}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Search */}
          <div
            /* Beige, not white. The bar moved onto the white grid section, and
               a white field on a white ground is invisible — the border alone
               was doing all the work. It now matches the cards it filters. */
            className="flex w-full items-center rounded-full bg-[#FBF7F0] md:w-[clamp(360px,32vw,460px)]"
            style={{ padding: "6px 6px 6px 20px", border: "1px solid #E6E1D8" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="11" cy="11" r="7" stroke="#6b6b6b" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Company name"
              className="min-w-0 flex-1 bg-transparent px-[12px] font-['Poppins',_sans-serif] font-normal text-[#0E0E0E] outline-none placeholder:text-[#9a9a9a]"
              style={{ fontSize: "clamp(14px, 1.05vw, 16px)" }}
            />
            <NavyPill label="Search" onClick={() => { /* filter is live via query state */ }} small />
          </div>
        </div>
        <div
          ref={gridRef}
          className="relative w-full overflow-hidden"
          style={{
            marginTop: "clamp(24px, min(2.6vw, 3.8vh), 44px)",
            padding: BORDER_PADDING,
            "--bp": BORDER_PADDING,
            "--gap": STORY_GAP,
          } as React.CSSProperties}
        >
          {filtered.length === 0 ? (
            <p
              className="w-full py-[60px] text-center font-['Poppins',_sans-serif] text-[#6b6b6b]"
              style={{ fontSize: "clamp(14px, 1.2vw, 18px)" }}
            >
              No notes match your search.
            </p>
          ) : (
            <>
              {/* EQUAL ROWS, and that is load-bearing twice over.
                  The dividers below are placed by dividing the grid's height
                  into `rows` equal parts in CSS. Auto-sized rows are each as
                  tall as their own tallest card, so the real boundaries drift
                  from the even split and the rule was landing across the next
                  row's images. `1fr` auto-rows makes every row the height of
                  the tallest card in the grid, which is the assumption that
                  calc was making all along. It is also what lets a card
                  stretch, so `mt-auto` can pin every card's arrow to a common
                  baseline. */}
              <div
                className="grid w-full grid-cols-3 max-md:!grid-cols-1 max-md:!gap-[28px]"
                style={{ gap: STORY_GAP, gridAutoRows: "1fr" }}
              >
                {visible.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>

              {/* One band per row — see `bands`. Absolutely positioned and
                  `pointer-events-none`, so it lies over the cards without
                  touching them. Percentages inside a band resolve against the
                  BAND, which is why the divider below sits at
                  `100% - gap/2` rather than repeating the row arithmetic. */}
              {bands.map((band, r) => (
                <motion.div
                  key={`band-${r}`}
                  aria-hidden
                  className="pointer-events-none absolute left-0 right-0 max-md:!hidden z-20"
                  style={{ top: band.top, height: band.height }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.12 }}
                >
                  {vLineLefts.map((left, idx) => (
                    <motion.div
                      key={`v-${idx}`}
                      className="absolute"
                      style={{ top: 0, left, width: 0, height: "100%", borderLeft: "1px solid #000", transformOrigin: "top" }}
                      variants={V_RULE}
                    />
                  ))}
                  {/* The row boundary above this band, drawn from both outer
                      edges toward the centre — the founders-story direction.
                      It sits half a gap ABOVE the band's own top edge, which
                      is the centre of the gap between the two rows. */}
                  {band.dividerAbove && (
                    <>
                      <motion.div
                        className="absolute"
                        style={{ top: "calc(-1 * var(--gap) / 2)", left: "var(--bp)", width: "calc(50% - var(--bp))", height: 0, borderTop: "1px solid #000", transformOrigin: "left" }}
                        variants={H_RULE}
                      />
                      <motion.div
                        className="absolute"
                        style={{ top: "calc(-1 * var(--gap) / 2)", right: "var(--bp)", width: "calc(50% - var(--bp))", height: 0, borderTop: "1px solid #000", transformOrigin: "right" }}
                        variants={H_RULE}
                      />
                    </>
                  )}
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* ── LOAD MORE ──
            OUTSIDE the divider container above, deliberately. Those rules are
            positioned against that box's height ("100% - 2 * var(--bp)"), so a
            button inside it would be counted as grid and stretch the vertical
            rules down past the last row of cards.

            The same component the founders-story grid uses, so the pill, the
            label fade and the timing are identical rather than merely alike —
            only the mark in the circle differs. It disappears once the last
            post is on screen. */}
        {hasMore && (
          <motion.div
            className="flex w-full justify-center"
            style={{ marginTop: "min(3.47vw, 5.37vh)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SeeMoreButton
              label="Load More"
              icon="plus"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            />
          </motion.div>
        )}
      </div>
    </section>
    </>
  );
}
