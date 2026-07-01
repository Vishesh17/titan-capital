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
    title: `${member.name} — ${member.title}`,
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
   Detail page layout (1440 design ref):
     • Row 1: Back (left)  ⟂  About/<Name> (right)
     • Row 2: Photo (517×564 on blob) left  +  Name / Title /
       Social icons right
     • Bio card (835 wide, cream) overlaps the bottom-right
       of the photo column and is right-aligned in the grid.
   All dimensions clamp proportionally from the 1440 baseline.
   ───────────────────────────────────────────────────────── */
export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getMember(slug);
  if (!member) notFound();

  const emailHref =
    member.emailUrl &&
    (member.emailUrl.startsWith("mailto:")
      ? member.emailUrl
      : `mailto:${member.emailUrl}`);

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 57 57"
                fill="none"
                style={{
                  width: "clamp(28px, min(2.5vw, 3.6vh), 36px)",
                  height: "clamp(28px, min(2.5vw, 3.6vh), 36px)",
                  aspectRatio: "1 / 1",
                }}
              >
                <path
                  d="M5.34375 28.5C5.34375 41.2883 15.7117 51.6562 28.5 51.6562C41.2883 51.6562 51.6562 41.2883 51.6562 28.5C51.6562 15.7117 41.2883 5.34375 28.5 5.34375C15.7117 5.34375 5.34375 15.7117 5.34375 28.5ZM29.0177 18.3291C29.1838 18.4938 29.3158 18.6897 29.4062 18.9055C29.4966 19.1212 29.5436 19.3527 29.5445 19.5867C29.5455 19.8206 29.5003 20.0525 29.4116 20.269C29.3229 20.4854 29.1925 20.6824 29.0277 20.8484L23.203 26.7188H38.0742C38.5466 26.7188 38.9997 26.9064 39.3338 27.2405C39.6678 27.5745 39.8555 28.0276 39.8555 28.5C39.8555 28.9724 39.6678 29.4255 39.3338 29.7595C38.9997 30.0936 38.5466 30.2812 38.0742 30.2812H23.203L29.0277 36.1516C29.1925 36.3178 29.3229 36.5149 29.4115 36.7315C29.5001 36.9481 29.5452 37.1801 29.5441 37.4141C29.5431 37.6482 29.496 37.8797 29.4055 38.0956C29.3149 38.3114 29.1828 38.5073 29.0166 38.6721C28.8503 38.8368 28.6533 38.9672 28.4367 39.0558C28.22 39.1445 27.9881 39.1895 27.754 39.1885C27.52 39.1875 27.2884 39.1403 27.0726 39.0498C26.8568 38.9593 26.6609 38.8271 26.4961 38.6609L17.6578 29.7547C17.3267 29.421 17.1409 28.97 17.1409 28.5C17.1409 28.03 17.3267 27.579 17.6578 27.2453L26.4961 18.3391C26.6609 18.1726 26.8569 18.0403 27.0729 17.9497C27.2889 17.8591 27.5206 17.812 27.7548 17.8111C27.989 17.8102 28.2211 17.8554 28.4378 17.9443C28.6545 18.0332 28.8516 18.1639 29.0177 18.3291Z"
                  fill="black"
                />
              </svg>
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
              <span className="font-light">/</span>
              <span className="font-medium">{member.name}</span>
            </p>
          </div>

          {/* ── Row 2: Photo  +  Name/Title/Icons  (Bio card overlaps) ── */}
          <div
            className="relative flex w-full flex-col lg:flex-row lg:items-start"
            style={{
              marginTop: "clamp(20px, min(2.2vw, 3.2vh), 40px)",
              gap: "clamp(28px, min(3vw, 4.5vh), 56px)",
            }}
          >
            {/* Photo with cream blob (688×664 native PNG used for both
                the colour BG and as the alpha mask on the photo) */}
            <div className="relative shrink-0">
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
                    // Mask container matches the blob img's exact offset
                    // (top 6 %, left 5 %) and full size, same as the team
                    // section — so the cutout takes the blob shape.
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
                    {/* Inner container is 75 % × 85 %, anchored to the
                        mask's BOTTOM-left — same as OurTeamClient — so
                        the photo renders smaller, pushed to the left,
                        starting from the bottom of the blob. */}
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

            {/* Right column: name, title, icons */}
            <div className="flex w-full flex-1 flex-col">
              <h1
                className="m-0 font-['Poppins',_sans-serif] font-medium text-[#0E0E0E]"
                style={{
                  fontSize: "clamp(28px, min(3.33vw, 4.88vh), 48px)",
                  lineHeight: "158%",
                }}
              >
                {member.name}
              </h1>
              <p
                className="m-0 font-['Poppins',_sans-serif] font-normal capitalize text-[#0E0E0E]"
                style={{
                  fontSize: "clamp(20px, min(2.22vw, 3.25vh), 32px)",
                  lineHeight: "158%",
                }}
              >
                {member.title}
              </p>

              {(member.linkedinUrl || emailHref || member.twitterUrl) && (
                <div
                  className="flex items-center"
                  style={{
                    gap: "clamp(10px, min(1.1vw, 1.6vh), 18px)",
                    marginTop: "clamp(16px, min(1.7vw, 2.5vh), 28px)",
                  }}
                >
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
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
                  {member.twitterUrl && (
                    <a
                      href={member.twitterUrl}
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

              {/* Bio card — on mobile flows below the icons in normal
                  order. On lg+ it gets pulled left + up via negative
                  margins so the left edge overlaps the photo and the
                  card sits in the lower half of the row. */}
              {member.bio && (
                <div
                  className="relative z-10 box-border flex w-full self-stretch lg:self-end"
                  style={{
                    background: "#FBF7F0",
                    borderRadius: "12px",
                    boxShadow: "0 0 46.7px 0 rgba(157, 157, 157, 0.25)",
                    padding:
                      "clamp(20px, min(2.36vw, 3.45vh), 34px) clamp(16px, min(2vw, 3vh), 28px)",
                    marginTop: "clamp(24px, min(3vw, 4.4vh), 56px)",
                    maxWidth: "clamp(320px, min(58vw, 100%), 835px)",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <p
                    className="m-0 whitespace-pre-line font-['Poppins',_sans-serif] font-normal text-black"
                    style={{
                      fontSize: "clamp(14px, min(1.67vw, 2.44vh), 24px)",
                      lineHeight: "150%",
                      maxWidth: "clamp(280px, min(51.3vw, 100%), 739px)",
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
