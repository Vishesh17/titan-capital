import type { Viewport } from "next";
import Script from "next/script";
import { Geist, Libre_Baskerville, Poppins, Inter, Plus_Jakarta_Sans, Montserrat, DM_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import LenisProvider from "@/components/layout/LenisProvider";
import { buildMetadata } from "@/sanity/lib/seo";
import "./globals.css";

/** Google Analytics 4 measurement ID. */
const GA_ID = "G-VYL28XGCNQ";

export async function generateMetadata() {
  /* The Search Console tag goes through the Metadata API rather than being
     pasted into the markup: Next renders it into <head> itself, and because
     only the root layout sets it, it appears exactly once per page — which is
     what Google asks for. */
  return {
    ...(await buildMetadata()),
    verification: {
      google: "-kZApt_vc1Z1tMbEgd4ebCtjMLJgFJ9PLxoAyQRpxkg",
    },
  };
}

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
  weight: ["300", "400", "500", "600", "700", "900"],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#001A4D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      /* REMOVED: 'h-full'. Lenis needs the HTML tag to flow naturally */
      className={`${geistSans.variable} ${libreBaskerville.variable} ${poppins.variable} ${inter.variable} ${plusJakartaSans.variable} ${montserrat.variable} ${dmSans.variable} antialiased`}
    >
      {/* REMOVED: 'min-h-full flex flex-col'. Forcing flex on the body causes height-calculation glitches with smooth scroll engines. */}
      <body className="m-0 p-0">
        {/* Google Analytics. `next/script` rather than raw <script> tags:
            Next hoists these into the document and guarantees they run once,
            where a hand-written tag in a client-navigated app can re-execute
            on every route change. `afterInteractive` loads it once the page is
            usable, so analytics never delays first paint. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>

        <LenisProvider>
          <Navbar />
          <main className="w-full m-0 p-0">{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}