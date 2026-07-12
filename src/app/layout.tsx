import type { Viewport } from "next";
import { Geist, Libre_Baskerville, Poppins, Inter, Plus_Jakarta_Sans, Montserrat, DM_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import LenisProvider from "@/components/layout/LenisProvider";
import { buildMetadata } from "@/sanity/lib/seo";
import "./globals.css";

/**
 * Sitewide metadata — fetched from Sanity at build/request time. The
 * fields managed in Studio under "SEO — Sitewide Defaults" populate the
 * defaults that every page inherits unless it sets its own override.
 */
export async function generateMetadata() {
  return buildMetadata();
}

/*
  FONTS:
  - Geist: Used for body text (clean, modern)
  - Libre Baskerville: Used for nav links (elegant, italic serif)
*/
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["600"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["800"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["800"],
});

/*
  VIEWPORT META — required for responsive CSS to work correctly on mobile.
  Without `width=device-width, initial-scale=1` mobile browsers render at
  ~980px and zoom out, breaking every vw / clamp / breakpoint we wrote.
  Next.js adds this by default; we declare it explicitly so it's intentional.
*/
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#001A4D",
  // Allow user zoom — disabling it (maximumScale: 1) hurts accessibility.
};

/*
  ROOT LAYOUT:
*/
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${libreBaskerville.variable} ${poppins.variable} ${inter.variable} ${plusJakartaSans.variable} ${montserrat.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col m-0 p-0">
        {/* Site-wide smooth scrolling (Lenis). Wraps everything so
            every page inherits the same weighted scroll feel. */}
        <LenisProvider>
          <Navbar />
          {/* FIX: Removed pt-[115px]. The Hero section now handles its own overlap padding to prevent gaps. */}
          <main className="flex-1 w-full m-0 p-0">{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}