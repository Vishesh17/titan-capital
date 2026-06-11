import type { Metadata, Viewport } from "next";
import { Geist, Libre_Baskerville, Poppins, Inter, Plus_Jakarta_Sans, Montserrat, DM_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "Titan Capital",
    template: "%s - Titan Capital",
  },
  description:
    "Titan Capital invests behind world class entrepreneurs looking to create wide-scale positive impact on India and the World.",
  keywords: [
    "Titan Capital",
    "venture capital",
    "early stage",
    "seed funding",
    "Kunal Bahl",
    "Rohit Bansal",
    "startup investment",
    "India VC",
  ],
  authors: [{ name: "Titan Capital" }],
  creator: "Titan Capital",
  metadataBase: new URL("https://titan-capital-puce.vercel.app"),
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Titan Capital",
    title: "Titan Capital",
    description:
      "Titan Capital invests behind world class entrepreneurs looking to create wide-scale positive impact on India and the World.",
    url: "https://titan-capital-puce.vercel.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Titan Capital",
    description:
      "Titan Capital invests behind world class entrepreneurs looking to create wide-scale positive impact on India and the World.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-TileImage": "/icon-192.png",
  },
};

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
        <Navbar />
        {/* FIX: Removed pt-[115px]. The Hero section now handles its own overlap padding to prevent gaps. */}
        <main className="flex-1 w-full m-0 p-0">{children}</main>
      </body>
    </html>
  );
}