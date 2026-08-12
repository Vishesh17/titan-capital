"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { blobPhotoStyle, BLOB_ASPECT } from "@/lib/blobPhotoStyle";

import GmailIcon from "@/components/icons/GmailIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface TeamMember {
  name: string;
  slug?: string;
  title: string;
  bio?: string;
  image?: string;
  linkedinUrl?: string;
  emailUrl?: string;
  twitterUrl?: string;
  /** Framing of the portrait inside the blob — see @/lib/blobPhotoStyle. */
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
}

export interface OurTeamData {
  headingFirst?: string;
  headingSecond?: string;
  corporateTeam?: TeamMember[];
  seedTeam?: TeamMember[];
  winnerFundTeam?: TeamMember[];
}

export function teamSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ─────────────────────────────────────────────────────────
   Fallback content
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

function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

/* ─────────────────────────────────────────────────────────
   Reusable organic blob path
   ───────────────────────────────────────────────────────── */
const BLOB_SRC = "/images/team/blob-blue.png";
const BLOB_VIEWBOX_W = 440;
const BLOB_VIEWBOX_H = 436;

function BlobDefs() {
  return null;
}

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
        width: "clamp(22px, min(1.92vw, 2.64vh), 29px)",
        height: "clamp(22px, min(1.92vw, 2.64vh), 29px)",
        aspectRatio: "1 / 1",
      }}
    >
      {children}
    </a>
  );
}

/* ─────────────────────────────────────────────────────────
   Single team-member card 
   ───────────────────────────────────────────────────────── */
function TeamCard({
  member,
  rotateBlob,
}: {
  member: TeamMember;
  rotateBlob: number;
}) {
  const slug = member.slug || teamSlug(member.name);

  const linkedinHref = member.linkedinUrl || undefined;
  const emailHref = member.emailUrl
    ? member.emailUrl.startsWith("mailto:")
      ? member.emailUrl
      : `mailto:${member.emailUrl}`
    : undefined;
  const twitterHref = member.twitterUrl || undefined;
  const hasSocials = Boolean(linkedinHref || emailHref || twitterHref);

  return (
    <motion.div
      className="group flex w-full flex-col items-start max-md:!items-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <Link
        href={`/ourTeam/${slug}`}
        aria-label={`${member.name} — ${member.title}`}
        className="flex w-full flex-col items-start focus:outline-none max-md:!items-center"
      >
        <div
          // max-w-full on mobile (was 45vw, sized for the old two-up grid):
          // with one card per row the blob fills the column, so its left and
          // right edges land on the section's own gutters.
          className="relative w-full transition-transform duration-300 ease-out group-hover:-translate-y-1 max-md:!max-w-[60%]"
          style={{
            maxWidth: "80%",
            aspectRatio: BLOB_ASPECT,
          }}
        >
          <div
            className="absolute h-full w-full"
            style={{
              top: "6%",
              left: "5%",
              transform: `rotate(${rotateBlob}deg)`,
              transformOrigin: "center",
            }}
          >
            <img
              src={BLOB_SRC}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 h-full w-full select-none"
              style={{ objectFit: "fill" }}
            />

            <div
              className="absolute inset-0 h-full w-full"
              style={{
                WebkitMaskImage: `url(${BLOB_SRC})`,
                maskImage: `url(${BLOB_SRC})`,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `rotate(${-rotateBlob}deg)`,
                  transformOrigin: "center",
                }}
              >
                {member.image ? (
                  <div
                    className="absolute"
                    style={{
                      bottom: "0",
                      left: "0",
                      width: "75%",
                      height: "85%",
                      ...blobPhotoStyle(member),
                    }}
                  >
                    <Image
                      src={cdnImageSrc(member.image, 600)}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 240px"
                      className="object-cover object-bottom transition-[filter] duration-500 ease-out [filter:grayscale(1)] group-hover:[filter:grayscale(0)]"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-full w-full items-end justify-start bg-[#E5E5E5] pb-6 pl-8 font-['Poppins',_sans-serif] text-[#9A9A9A]"
                    style={{ fontSize: "clamp(24px, 3.5vw, 48px)" }}
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
          </div>
        </div>

        <div className="flex w-full flex-col pl-[10%] xl:pl-[12%] max-md:!items-center max-md:!pl-0 max-md:!text-center">
          {/* ── NAME ── */}
          <h3
            /* Level 5, semibold. Weight stated here rather than taken from a
               token, since levels 4-7 carry size only now. */
            className={`m-0 text-left font-semibold text-[#0E0E0E] max-md:!text-center ${HERO_BODY_CLASS}`}
            style={{
              ...HERO_BODY_STYLE,
              // INCREASED PADDING HERE
              marginTop: "clamp(28px, min(3vw, 4vh), 40px)",
              maxWidth: "300px",
            }}
          >
            {member.name}
          </h3>

          {/* ── TITLE ── */}
          {member.title && (
            <p
              /* Level 6 — LABEL_STYLE is the level-6 size token. */
              className="m-0 text-left font-['Poppins',_sans-serif] font-normal text-[#323232] max-md:!text-center"
              style={{
                ...LABEL_STYLE,
                lineHeight: "158%",
                marginTop: "clamp(4px, 0.5vw, 8px)",
                maxWidth: "280px",
              }}
            >
              {member.title}
            </p>
          )}
        </div>
      </Link>

      {/* ── SOCIAL ICONS ── */}
      {hasSocials && (
        <div
          className="flex w-full items-center justify-start pl-[10%] xl:pl-[12%] max-md:!justify-center max-md:!pl-0"
          style={{
            gap: "clamp(8px, min(0.83vw, 1.22vh), 12px)",
            marginTop: "clamp(8px, min(1vw, 1.5vh), 12px)",
          }}
        >
          {linkedinHref && (
            <SocialLink href={linkedinHref} label={`${member.name} on LinkedIn`}>
              <LinkedInIcon />
            </SocialLink>
          )}
          {emailHref && (
            <SocialLink href={emailHref} label={`Email ${member.name}`}>
              <GmailIcon />
            </SocialLink>
          )}
          {twitterHref && (
            <SocialLink href={twitterHref} label={`${member.name} on X`}>
              <XIcon />
            </SocialLink>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Team group
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
      style={{ gap: "clamp(40px, min(4.5vw, 6vh), 64px)" }}
    >
      {/* ── Subheading with Flex-1 Horizontal Lines ── */}
      <div className="flex w-full flex-row items-center justify-center gap-[clamp(16px,2vw,32px)]">
        <motion.div
          className="h-[1px] flex-1 bg-black/30"
          style={{ transformOrigin: "right" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.8 }}
          variants={{
            hidden: { scaleX: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
            visible: { scaleX: 1, transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] } },
          }}
        />

        <motion.h3
          className={`font-medium m-0 whitespace-nowrap text-center text-black ${SUBHEADING_CLASS}`}
          style={SUBHEADING_STYLE}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {title}
        </motion.h3>

        <motion.div
          className="h-[1px] flex-1 bg-black/30"
          style={{ transformOrigin: "left" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.8 }}
          variants={{
            hidden: { scaleX: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
            visible: { scaleX: 1, transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] } },
          }}
        />
      </div>

      {/* ── GRID ── */}
      <div
        // One member per row below sm — the two-up grid left each card at
        // roughly half width, so the blobs were small. At one per row the
        // card can take the full column and sit flush to both gutters.
        className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          rowGap: "clamp(48px, min(5.5vw, 8vh), 80px)",
          columnGap: "clamp(16px, min(2vw, 3vh), 40px)",
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
      className="relative flex w-full flex-col items-center overflow-hidden bg-white max-md:!mt-0 max-md:!rounded-t-[min(6.66vw,10.30vh)]"
      style={{
        borderTopLeftRadius: "min(4.44vw, 7.30vh)",
        borderTopRightRadius: "min(4.44vw, 7.30vh)",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        zIndex: 20,
        marginTop: "min(-4.44vw, -7.30vh)",
        paddingTop: "clamp(60px, min(8vw, 10vh), 120px)",
        paddingBottom: "clamp(60px, min(8vw, 10vh), 120px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      <BlobDefs />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">
        {/* ── MAIN HEADING ── */}
        <motion.div
          className="flex w-full flex-col items-center justify-center text-center max-md:!mb-[clamp(32px,6dvh,48px)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          <motion.h2
            className={`m-0 text-black ${SECTION_HEADING_CLASS}`}
            style={{
              ...SECTION_HEADING_STYLE,
            }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            {headingFirst} {headingSecond}
          </motion.h2>
        </motion.div>

        {/* ── THREE TEAM GROUPS ── */}
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: "clamp(80px, min(10vw, 15vh), 160px)" }}
        >
          <TeamGroup title="Corporate Team" members={corporate} />
          <TeamGroup title="Seed Investment Team" members={seed} />
          <TeamGroup title="Early-growth Investment Team" members={winner} />
        </div>
      </div>
    </section>
  );
}