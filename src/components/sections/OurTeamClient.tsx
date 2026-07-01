"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import GmailIcon from "@/components/icons/GmailIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (OurTeam.tsx).
   ───────────────────────────────────────────────────────── */
export interface TeamMember {
  name: string;
  /** URL slug — also drives /ourteam/<slug> detail page. */
  slug?: string;
  title: string;
  bio?: string;
  image?: string;
  linkedinUrl?: string;
  emailUrl?: string;
  twitterUrl?: string;
}

export interface OurTeamData {
  headingFirst?: string;
  headingSecond?: string;
  corporateTeam?: TeamMember[];
  seedTeam?: TeamMember[];
  winnerFundTeam?: TeamMember[];
}

/* Slug helper for fallback data + safety net when a Sanity entry
   forgets its slug. Lowercase, alphanumeric joined by hyphens. */
export function teamSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ─────────────────────────────────────────────────────────
   Fallback content — rendered when Sanity returns null or
   the doc hasn't been populated yet. Editors replace by
   creating the "Our Team Page" document in Studio.
   Placeholder URLs (#) ensure all three social icons render
   so the layout matches the design even before real links
   are added in Studio.
   ───────────────────────────────────────────────────────── */
const FALLBACK_HEADING_FIRST = "Meet The";
const FALLBACK_HEADING_SECOND = "Full Team.";

function fallback(name: string, title: string): TeamMember {
  return {
    name,
    slug: teamSlug(name),
    title,
    linkedinUrl: "#",
    emailUrl: "info@titancapital.vc",
    twitterUrl: "#",
  };
}

const FALLBACK_CORPORATE: TeamMember[] = [
  fallback("Chetan Rana", "CFO"),
  fallback("Aakriti Kakkar", "Vice President — Corporate Development"),
  fallback("Supriya Gupta", "Community Marketing Lead"),
  fallback("Aditi Jain", "Associate Investment Director"),
  fallback("Manya Awasthi", "Manager — Investment Operations"),
  fallback("Ram Damani", "Manager — Finance and Operations"),
  fallback("Aashray Satija", "Corporate Development"),
];
const FALLBACK_SEED: TeamMember[] = [
  fallback("Manik Pasricha", "Vice President"),
  fallback("Utpal Sharma", "Vice President"),
  fallback("Preetit Singhi", "Associate"),
  fallback("Chiragh Cariappa", "Investment Analyst"),
  fallback("Aditya Jaikumar", "Investment Analyst"),
  fallback("Geetansh Popli", "Investment Analyst"),
];
const FALLBACK_WINNER: TeamMember[] = [
  fallback("Shiv Kapoor", "Vice President"),
  fallback("Vrinda Gupta", "Investment Analyst"),
  fallback("Vatsal Singh", "Investment Analyst"),
];

/* ─────────────────────────────────────────────────────────
   Sanity CDN transform helper.
   ───────────────────────────────────────────────────────── */
function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

/* ─────────────────────────────────────────────────────────
   Reusable organic blob path — used as both the background
   decoration AND the clip-path for the photo. Two SVG defs
   live at the top of the section; cards reference them by id.
   The viewBox is 254×250 so transforms can use clipPathUnits
   ="objectBoundingBox" by scaling 1/254 × 1/250.
   ───────────────────────────────────────────────────────── */
/* Blue blob asset — the actual design-ref vector saved as PNG with
   transparent surrounding. The native dimensions are 440×436; the
   image is used as both the colour BG and the mask on the photo
   so the photo takes the exact same organic shape. */
const BLOB_SRC = "/images/team/blob-blue.png";
const BLOB_VIEWBOX_W = 440;
const BLOB_VIEWBOX_H = 436;

/* No-op kept for layout parity — defs are no longer needed since we
   mask the photo with the PNG itself (mask-image). */
function BlobDefs() {
  return null;
}

/* Social icons live in /components/icons — single source of truth,
   reused on the slug page as well. */

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-block transition-transform duration-200 hover:scale-110"
      style={{
        width: "clamp(22px, min(2vw, 3vh), 30px)",
        height: "clamp(22px, min(2vw, 3vh), 30px)",
        aspectRatio: "1 / 1",
      }}
    >
      {children}
    </a>
  );
}

/* ─────────────────────────────────────────────────────────
   Single team-member card — blob background + clipped photo
   (monochrome by default, colour on hover) + name + title
   + social icons.
   ───────────────────────────────────────────────────────── */
function TeamCard({
  member,
  rotateBlob,
}: {
  member: TeamMember;
  /** Small rotation applied to the bg blob for extra organic variety. */
  rotateBlob: number;
}) {
  const slug = member.slug || teamSlug(member.name);

  // Normalise the email link — accept either a plain address or a
  // pre-formed mailto:.
  const emailHref =
    member.emailUrl &&
    (member.emailUrl.startsWith("mailto:")
      ? member.emailUrl
      : `mailto:${member.emailUrl}`);

  return (
    <motion.div
      // w-full anchors the whole card to its flex slot width.
      // Without it the card was sizing to its widest text child,
      // so cards with longer titles ended up visibly wider than
      // cards with short titles ("CFO" vs "Vice President — …").
      className="group flex w-full flex-col items-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {/* ── PHOTO + BLOB — wrapped in a Link to /ourteam/<slug>.
            Hover scales the whole card subtly and reveals the
            colour photo (monochrome → colour). ── */}
      <Link
        href={`/ourTeam/${slug}`}
        aria-label={`${member.name} — ${member.title}`}
        className="block w-full focus:outline-none"
      >
        <div
          className="relative w-full transition-transform duration-300 ease-out group-hover:-translate-y-1"
          // Photo card fills 100 % of its flex slot (no maxWidth cap)
          // so the blob is the same constant size for every card and
          // the grid reaches the same left/right extent as the hero,
          // LedByFounders, and Footer (≈ 1440 inner wrapper).
          style={{
            aspectRatio: `${BLOB_VIEWBOX_W} / ${BLOB_VIEWBOX_H}`,
          }}
        >
          {/* ── BG BLOB — the design-ref PNG asset, offset & rotated
                  for visual halo around the photo. ── */}
          <img
            src={BLOB_SRC}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute h-full w-full select-none"
            style={{
              top: "6%",
              left: "5%",
              transform: `rotate(${rotateBlob}deg)`,
              transformOrigin: "center",
              objectFit: "contain",
            }}
          />

          {/* ── PHOTO — outer mask container matches the blob img's
                  exact offset (top 6 %, left 5 %) and full size so
                  the cutout takes the blob shape. Inside, the image
                  container is smaller (75 % × 85 %) and anchored to
                  the mask's top-left corner, so the photo renders
                  SMALLER and pushed to the LEFT of the blob, with the
                  person's head aligned to the blob's head. ── */}
          <div
            className="absolute h-full w-full"
            style={{
              top: "6%",
              left: "5%",
              WebkitMaskImage: `url(${BLOB_SRC})`,
              maskImage: `url(${BLOB_SRC})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          >
            {member.image ? (
              <div
                className="absolute"
                style={{ bottom: "0", left: "0", width: "75%", height: "85%" }}
              >
                <Image
                  src={cdnImageSrc(member.image, 600)}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 300px"
                  className="object-cover object-bottom transition-[filter] duration-500 ease-out [filter:grayscale(1)] group-hover:[filter:grayscale(0)]"
                />
              </div>
            ) : (
              <div
                className="flex h-full w-full items-end justify-start bg-[#E5E5E5] font-['Poppins',_sans-serif] text-[#9A9A9A]"
                style={{ fontSize: "clamp(28px, 4vw, 56px)" }}
              >
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* ── NAME — reserve a fixed 1-line slot so cards
              never differ in height because of name wrapping. ── */}
        <h3
          className="m-0 text-center font-['Poppins',_sans-serif] font-medium text-[#0E0E0E]"
          style={{
            fontSize: "clamp(18px, min(2.5vw, 3.67vh), 36px)",
            lineHeight: "158%",
            marginTop: "clamp(12px, min(1.4vw, 2vh), 24px)",
            maxWidth: "359px",
            // 1 line tall = 1.58em (line-height) — long names that
            // still wrap will push past this naturally.
            minHeight: "1.58em",
          }}
        >
          {member.name}
        </h3>

        {/* ── TITLE — reserve a fixed 2-line slot.
              Without this, cards with short titles ("CFO") were
              shorter than cards with long titles ("Vice President
              — Corporate Development"), which is what made the
              grid look uneven. ── */}
        <p
          className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
          style={{
            fontSize: "clamp(13px, min(1.67vw, 2.44vh), 24px)",
            lineHeight: "158%",
            marginTop: "clamp(2px, 0.4vw, 8px)",
            maxWidth: "421px",
            // 2 lines tall = 2 × 1.58em line-height.
            minHeight: "calc(2 * 1.58em)",
          }}
        >
          {member.title}
        </p>
      </Link>

      {/* ── SOCIAL ICONS — outside the Link so each icon is its
            own focusable, navigable anchor. ── */}
      {(member.linkedinUrl || emailHref || member.twitterUrl) && (
        <div
          className="flex items-center justify-center"
          style={{
            gap: "clamp(8px, min(0.83vw, 1.22vh), 14px)",
            marginTop: "clamp(10px, min(1.1vw, 1.6vh), 16px)",
          }}
        >
          {member.linkedinUrl && (
            <SocialLink
              href={member.linkedinUrl}
              label={`${member.name} on LinkedIn`}
            >
              <LinkedInIcon />
            </SocialLink>
          )}
          {emailHref && (
            <SocialLink href={emailHref} label={`Email ${member.name}`}>
              <GmailIcon />
            </SocialLink>
          )}
          {member.twitterUrl && (
            <SocialLink
              href={member.twitterUrl}
              label={`${member.name} on X`}
            >
              <XIcon />
            </SocialLink>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Team group — sub-section heading + responsive grid of
   cards. 3 cols desktop, 2 cols tablet, 1 col mobile.
   ───────────────────────────────────────────────────────── */
const BLOB_ROTATIONS = [-6, 4, -2, 8, -10, 5, -4];

function TeamGroup({
  title,
  members,
}: {
  title: string;
  members: TeamMember[];
}) {
  if (members.length === 0) return null;
  return (
    <div
      className="flex w-full flex-col items-center"
      style={{ gap: "clamp(28px, min(3.33vw, 4.89vh), 56px)" }}
    >
      <motion.h2
        className="m-0 text-center font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D] max-md:!text-[24px]"
        style={{
          fontSize: "clamp(24px, min(3.06vw, 4.48vh), 44px)",
          lineHeight: "120%",
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {title}
      </motion.h2>

      {/* Mobile: single-column grid so each row has exactly one card
            (per the mobile design). Desktop md+: 3-col grid where the
            first card aligns to the left content edge and the third
            to the right, with the columnGap providing the visible
            gutter between them. Grid columns handle "third card
            matches Footer right edge" implicitly — the rightmost
            column always ends at max-w-[1440px]. */}
      <div
        className="grid w-full grid-cols-1 md:grid-cols-3"
        style={{
          rowGap: "clamp(36px, min(4vw, 6vh), 72px)",
          columnGap: "clamp(20px, min(3vw, 4.5vh), 96px)",
        }}
      >
        {members.map((member, i) => (
          <TeamCard
            key={`${title}-${i}-${member.name}`}
            member={member}
            rotateBlob={BLOB_ROTATIONS[i % BLOB_ROTATIONS.length]}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component.
   ───────────────────────────────────────────────────────── */
export default function OurTeamClient({
  data,
}: {
  data?: OurTeamData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const corporate =
    data?.corporateTeam && data.corporateTeam.length > 0
      ? data.corporateTeam
      : FALLBACK_CORPORATE;
  const seed =
    data?.seedTeam && data.seedTeam.length > 0
      ? data.seedTeam
      : FALLBACK_SEED;
  const winner =
    data?.winnerFundTeam && data.winnerFundTeam.length > 0
      ? data.winnerFundTeam
      : FALLBACK_WINNER;

  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-white"
      style={{
        // Site-wide section rhythm — identical to Footer + HeroClient.
        // No nav-height offset: this section is the third on /ourTeam,
        // not the hero, so the navbar is already cleared upstream.
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      {/* SVG defs for the blob clip-path (must live somewhere in
          the DOM for url(#…) references in this section to work). */}
      <BlobDefs />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">
        {/* ── PAGE HEADING — italic phrase first on a light-blue
              pill, regular phrase after. Same scaleX + variants
              pattern WinnersHero uses. ── */}
        <motion.div
          className="flex flex-row flex-wrap items-baseline justify-center text-center"
          style={{
            gap: "clamp(8px, min(1vw, 1.5vh), 18px)",
            marginBottom: "clamp(48px, min(6vw, 9vh), 120px)",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[10px] py-[6px] md:px-[14px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left", borderRadius: "4px" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.6, ease: "easeInOut", delay: 0.5 },
                },
              }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-[120%] text-[#001A4D] max-md:!text-[32px]"
              style={{ fontSize: "var(--heading-xl)" }}
            >
              {headingFirst}
            </span>
          </motion.div>

          <motion.h1
            className="m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[120%] text-[#001A4D] max-md:!text-[32px]"
            style={{ fontSize: "var(--heading-xl)" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
              },
            }}
          >
            {headingSecond}
          </motion.h1>
        </motion.div>

        {/* ── THREE TEAM GROUPS ── */}
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: "clamp(60px, min(8vw, 12vh), 140px)" }}
        >
          <TeamGroup title="Corporate Team" members={corporate} />
          <TeamGroup title="Seed Team" members={seed} />
          <TeamGroup title="Winner Fund Team" members={winner} />
        </div>
      </div>
    </section>
  );
}
