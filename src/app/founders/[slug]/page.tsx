import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import BackLink from "@/components/ui/BackLink";

import InstagramIcon from "@/components/icons/InstagramIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";
import Footer from "@/components/sections/Footer";
import { sanityFetch } from "@/sanity/lib/client";
import { allFoundersQuery } from "@/sanity/lib/queries";
import { BLOB_ASPECT } from "@/lib/blobPhotoStyle";
import { founderSlug } from "@/lib/founderSlug";
import { buildMetadata } from "@/sanity/lib/seo";
import { HERO_BODY_CLASS, HERO_BODY_STYLE } from "@/styles/heroTypography";

import type { FounderProfile } from "@/components/sections/LedByFoundersClient";

/**
 * /founders/[slug] — detail page for a Titan Capital founder.
 *
 * Mirrors /ourTeam/[slug]: same blob-cutout portrait, same type scale, same
 * bio card. The one difference is the socials — these two use Instagram
 * rather than email.
 */

async function getFounders(): Promise<FounderProfile[]> {
  try {
    const rows = await sanityFetch<FounderProfile[] | null>({
      query: allFoundersQuery,
      tags: ["ledByFounders"],
    });
    return rows || [];
  } catch (err) {
    console.error("[founders/[slug]] Sanity fetch failed:", err);
    return [];
  }
}

/** Resolve by the explicit slug when one is set, else derive it from the
 *  name — so the route works before anyone fills the slug field in Sanity. */
async function getFounder(slug: string): Promise<FounderProfile | null> {
  const founders = await getFounders();
  return (
    founders.find((f) => (f.slug || founderSlug(f.name)) === slug) ?? null
  );
}

export async function generateStaticParams() {
  const founders = await getFounders();
  return founders.map((f) => ({ slug: f.slug || founderSlug(f.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = await buildMetadata("ourteam");
  const founder = await getFounder(slug);
  if (!founder) return base;
  return {
    ...base,
    title: founder.role ? `${founder.name} — ${founder.role}` : founder.name,
    description: (founder.longBio || founder.bio)?.slice(0, 160) || base.description,
  };
}

function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

export default async function FounderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const founder = await getFounder(slug);
  if (!founder) notFound();

  const linkedinHref = founder.linkedin || undefined;
  const instagramHref = founder.instagram || undefined;
  const twitterHref = founder.twitter || undefined;
  const hasSocials = Boolean(linkedinHref || instagramHref || twitterHref);

  /* The section shows the photo WITH its background; this page clips a cut-out
     into the blob. Fall back to the section photo so the page still renders
     before the cut-out is uploaded — it just won't mask cleanly. */
  const photo = founder.imageNoBg || founder.image;
  const bio = founder.longBio || founder.bio;

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
            <BackLink
              fallbackHref="/ourTeam"
              ariaLabel="Back to our team"
              className="group inline-flex cursor-pointer items-center bg-transparent transition-transform duration-300 hover:scale-105 hover:opacity-80"
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
            </BackLink>

            <p
              className="m-0 font-['Poppins',_sans-serif] text-black"
              style={{
                fontSize: "clamp(14px, min(1.25vw, 1.83vh), 18px)",
                lineHeight: "150%",
              }}
            >
              <Link
                href="/ourTeam"
                className="font-light transition-opacity duration-200 hover:opacity-70"
              >
                About
              </Link>
              <span className="font-light"> / </span>
              <span className="font-medium">{founder.name}</span>
            </p>
          </div>

          {/* ── Row 2: Photo  +  Name/Role/Icons  (bio card overlaps) ── */}
          <div
            className="relative flex w-full flex-col max-lg:items-center lg:flex-row lg:items-start"
            style={{
              marginTop: "clamp(20px, min(2.2vw, 3.2vh), 40px)",
              gap: "clamp(28px, min(3vw, 4.5vh), 56px)",
            }}
          >
            {/* Portrait with cream blob */}
            <div className="relative z-0 shrink-0">
              <div
                className="relative"
                style={{
                  width: "clamp(280px, min(35.9vw, 52vh), 517px)",
                  // Must match the team grid — see BLOB_ASPECT.
                  aspectRatio: BLOB_ASPECT,
                }}
              >
                <img
                  src="/images/team/blob-cream.png"
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="absolute h-full w-full select-none"
                  // `fill`, not `contain`: the mask stretches to 100% 100%, so a
                  // letterboxed blob paints a different shape from the cutout.
                  style={{ top: "6%", left: "5%", objectFit: "fill" }}
                />
                {photo && (
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
                      style={{ bottom: "0", left: "0", width: "75%", height: "85%" }}
                    >
                      <Image
                        src={cdnImageSrc(photo, 1000)}
                        alt={founder.name}
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

            {/* Right column: name, role, socials, bio */}
            <div className="relative z-10 flex w-full flex-1 flex-col max-lg:mt-2 max-lg:items-center lg:pt-12">
              <h1
                className="m-0 font-['Poppins',_sans-serif] font-medium text-[#0E0E0E] max-lg:!text-center"
                style={{
                  fontSize: "clamp(28px, min(3.33vw, 4.88vh), 48px)",
                  lineHeight: "158%",
                }}
              >
                {founder.name}
              </h1>

              {founder.role && (
                <p
                  className="m-0 whitespace-pre-line font-['Poppins',_sans-serif] font-normal capitalize text-[#0E0E0E] max-lg:!text-center"
                  style={{
                    fontSize: "clamp(20px, min(2.22vw, 3.25vh), 32px)",
                    lineHeight: "158%",
                  }}
                >
                  {founder.role}
                </p>
              )}

              {/* Socials — LinkedIn + Instagram (these two don't use email) */}
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
                      aria-label={`${founder.name} on LinkedIn`}
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

                  {instagramHref && (
                    <a
                      href={instagramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${founder.name} on Instagram`}
                      className="inline-block transition-transform duration-200 hover:scale-110"
                      style={{
                        width: "clamp(32px, min(3.33vw, 4.88vh), 48px)",
                        height: "clamp(32px, min(3.33vw, 4.88vh), 48px)",
                        aspectRatio: "1 / 1",
                      }}
                    >
                      <InstagramIcon className="h-full w-full" />
                    </a>
                  )}

                  {twitterHref && (
                    <a
                      href={twitterHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${founder.name} on X`}
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

              {/* Bio card — overlaps the portrait, same as the team pages */}
              {bio && (
                <div
                  className="relative z-10 box-border flex self-stretch max-lg:mt-8 max-lg:w-full lg:-ml-[clamp(80px,8vw,140px)] lg:mt-24 lg:w-[calc(100%+clamp(80px,8vw,140px))] lg:self-end xl:mt-36"
                  style={{
                    background: "#FBF7F0",
                    borderRadius: "2px",
                    padding: "clamp(20px, min(2.36vw, 3.45vh), 34px)",
                    maxWidth: "clamp(420px, 85vw, 1035px)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <p
                    className={`m-0 w-full whitespace-pre-line text-black ${HERO_BODY_CLASS}`}
                    style={HERO_BODY_STYLE}
                  >
                    {bio}
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
