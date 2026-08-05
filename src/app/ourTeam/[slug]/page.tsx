import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import GmailIcon from "@/components/icons/GmailIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";
import Footer from "@/components/sections/Footer";
import { sanityFetch } from "@/sanity/lib/client";
import {
  allTeamMemberSlugsQuery,
  teamMemberBySlugQuery,
} from "@/sanity/lib/queries";
import { buildMetadata } from "@/sanity/lib/seo";

import type { TeamMember } from "@/components/sections/OurTeamClient";

export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[] | null>({
      query: allTeamMemberSlugsQuery,
      tags: ["ourTeam"],
    });
    return (slugs || []).map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = await buildMetadata("ourteam");
  const member = await getMember(slug);
  if (!member) return base;
  return {
    ...base,
    title: member.title ? `${member.name} — ${member.title}` : member.name,
    description: member.bio?.slice(0, 160) || base.description,
  };
}

async function getMember(slug: string): Promise<TeamMember | null> {
  try {
    return await sanityFetch<TeamMember | null>({
      query: teamMemberBySlugQuery,
      params: { slug },
      tags: ["ourTeam", `ourTeam:${slug}`],
    });
  } catch (err) {
    console.error("[ourteam/[slug]] Sanity fetch failed:", err);
    return null;
  }
}

function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

/* ─────────────────────────────────────────────────────────
   Detail page layout
   ───────────────────────────────────────────────────────── */
export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getMember(slug);
  if (!member) notFound();

  // Show only what's filled in — empty fields are omitted from Sanity, so we
  // render nothing for them (no placeholder title/bio, no dead social icons).
  const linkedinHref = member.linkedinUrl || undefined;
  const twitterHref = member.twitterUrl || undefined;
  const emailHref = member.emailUrl
    ? member.emailUrl.startsWith("mailto:")
      ? member.emailUrl
      : `mailto:${member.emailUrl}`
    : undefined;
  const hasSocials = Boolean(linkedinHref || twitterHref || emailHref);

  return (
    <main className="flex min-h-screen w-full flex-col bg-white">
      <section
        className="relative flex w-full flex-col"
        style={{
          paddingTop: "clamp(78px, min(8.33vw, 12.22vh), 140px)",
          paddingBottom: "clamp(40px, min(5vw, 7vh), 96px)",
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1330px] flex-col">
          {/* ── Row 1: Back  ⟂  About/<Name> ── */}
          <div className="flex w-full flex-row items-center justify-between">
            <Link
              href="/ourTeam"
              aria-label="Back to our team"
              className="group inline-flex items-center transition-transform duration-300 hover:scale-105 hover:opacity-80"
              style={{ gap: "clamp(8px, min(0.8vw, 1.2vh), 14px)" }}
            >
              
              <span
                className="font-['Poppins',_sans-serif] font-light text-black"
                style={{
                  fontSize: "clamp(14px, min(1.25vw, 1.83vh), 18px)",
                  lineHeight: "150%",
                }}
              >
                Back
              </span>
            </Link>

            <p
              className="m-0 font-['Poppins',_sans-serif] text-black"
              style={{
                fontSize: "clamp(14px, min(1.25vw, 1.83vh), 18px)",
                lineHeight: "150%",
              }}
            >
              <Link
                href="/ourteam"
                className="font-light transition-opacity duration-200 hover:opacity-70"
              >
                About
              </Link>
              <span className="font-light"> / </span>
              <span className="font-medium">{member.name}</span>
            </p>
          </div>

          {/* ── Row 2: Photo  +  Name/Title/Icons  (Bio card overlaps) ── */}
          <div
            className="relative flex w-full flex-col max-lg:items-center lg:flex-row lg:items-start"
            style={{
              marginTop: "clamp(20px, min(2.2vw, 3.2vh), 40px)",
              gap: "clamp(28px, min(3vw, 4.5vh), 56px)",
            }}
          >
            {/* Photo with cream blob */}
            <div className="relative shrink-0 z-0">
              <div
                className="relative"
                style={{
                  width: "clamp(280px, min(35.9vw, 52vh), 517px)",
                  aspectRatio: "11 / 12",
                }}
              >
                <img
                  src="/images/team/blob-cream.png"
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="absolute h-full w-full select-none"
                  style={{
                    top: "6%",
                    left: "5%",
                    objectFit: "contain",
                  }}
                />
                {member.image && (
                  <div
                    className="absolute h-full w-full"
                    style={{
                      top: "6%",
                      left: "5%",
                      WebkitMaskImage: "url(/images/team/blob-cream.png)",
                      maskImage: "url(/images/team/blob-cream.png)",
                      WebkitMaskSize: "100% 100%",
                      maskSize: "100% 100%",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                    }}
                  >
                    <div
                      className="absolute"
                      style={{
                        bottom: "0",
                        left: "0",
                        width: "75%",
                        height: "85%",
                      }}
                    >
                      <Image
                        src={cdnImageSrc(member.image, 1000)}
                        alt={member.name}
                        fill
                        sizes="(max-width: 1024px) 60vw, 517px"
                        priority
                        className="object-cover object-bottom"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: name, title, icons, bio 
                Added max-lg:-mt-12 to create negative vertical padding between photo and text on mobile.
                Added lg:pt-12 to align Name with the face on desktop rather than the high blob edge. */}
            <div className="flex w-full flex-1 flex-col max-lg:items-center max-lg:mt-2 lg:pt-12 relative z-10">
              <h1
                className="m-0 font-['Poppins',_sans-serif] font-medium text-[#0E0E0E] max-lg:!text-center"
                style={{
                  fontSize: "clamp(28px, min(3.33vw, 4.88vh), 48px)",
                  lineHeight: "158%",
                }}
              >
                {member.name}
              </h1>
              
              {/* Title (hidden when empty) — whitespace-pre-line respects line breaks */}
              {member.title && (
                <p
                  className="m-0 font-['Poppins',_sans-serif] font-normal capitalize text-[#0E0E0E] whitespace-pre-line max-lg:!text-center"
                  style={{
                    fontSize: "clamp(20px, min(2.22vw, 3.25vh), 32px)",
                    lineHeight: "158%",
                  }}
                >
                  {member.title}
                </p>
              )}

              {/* Social Icons — each rendered only if its link exists */}
              {hasSocials && (
                <div
                  className="flex items-center max-lg:justify-center"
                  style={{
                    gap: "clamp(10px, min(1.1vw, 1.6vh), 18px)",
                    marginTop: "clamp(16px, min(1.7vw, 2.5vh), 28px)",
                  }}
                >
                  {linkedinHref && (
                    <a
                      href={linkedinHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="inline-block transition-transform duration-200 hover:scale-110"
                      style={{
                        width: "clamp(32px, min(3.33vw, 4.88vh), 48px)",
                        height: "clamp(32px, min(3.33vw, 4.88vh), 48px)",
                        aspectRatio: "1 / 1",
                      }}
                    >
                      <LinkedInIcon className="h-full w-full" />
                    </a>
                  )}

                  {emailHref && (
                    <a
                      href={emailHref}
                      aria-label={`Email ${member.name}`}
                      className="inline-block transition-transform duration-200 hover:scale-110"
                      style={{
                        width: "clamp(32px, min(3.33vw, 4.88vh), 48px)",
                        height: "clamp(32px, min(3.33vw, 4.88vh), 48px)",
                        aspectRatio: "1 / 1",
                      }}
                    >
                      <GmailIcon className="h-full w-full" />
                    </a>
                  )}

                  {twitterHref && (
                    <a
                      href={twitterHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on X`}
                      className="inline-block transition-transform duration-200 hover:scale-110"
                      style={{
                        width: "clamp(32px, min(3.33vw, 4.88vh), 48px)",
                        height: "clamp(32px, min(3.33vw, 4.88vh), 48px)",
                        aspectRatio: "1 / 1",
                      }}
                    >
                      <XIcon className="h-full w-full" />
                    </a>
                  )}
                </div>
              )}

              {/* Bio card (hidden when empty) — overlaps the image and shifts down. */}
{member.bio && (
<div
  className="relative z-10 box-border flex self-stretch lg:self-end max-lg:mt-8 lg:mt-24 xl:mt-36 max-lg:w-full lg:-ml-[clamp(80px,8vw,140px)] lg:w-[calc(100%+clamp(80px,8vw,140px))]"
  style={{
    background: "#FBF7F0",
    borderRadius: "2px",
    padding: "clamp(20px, min(2.36vw, 3.45vh), 34px)",
    maxWidth: "clamp(420px, 85vw, 1035px)",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  {/* Added w-full to the className and removed the maxWidth from style */}
  <p
    className="m-0 w-full whitespace-pre-line font-['Poppins',_sans-serif] font-normal text-black"
    style={{
      fontSize: "clamp(14px, min(1.67vw, 2.44vh), 24px)",
      lineHeight: "150%",
    }}
  >
    {member.bio}
  </p>
</div>
)}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}