import type { Viewport } from "next";
import { Geist, Libre_Baskerville, Poppins, Inter, Plus_Jakarta_Sans, Montserrat, DM_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import LenisProvider from "@/components/layout/LenisProvider";
import { buildMetadata } from "@/sanity/lib/seo";
import "./globals.css";

export async function generateMetadata() {
  return buildMetadata();
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
        <LenisProvider>
          <Navbar />
          <main className="w-full m-0 p-0">{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}