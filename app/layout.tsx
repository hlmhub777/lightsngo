import type { Metadata } from "next";
import { Rajdhani, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieNotice from "@/components/CookieNotice";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "LightsNGo — find your people, race weekend after race weekend",
  description:
    "A community for F1 fans: race-day chat rooms, city guides written by people who've actually been, and a contact list for the fans you meet along the way.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-body min-h-screen">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CookieNotice />
      </body>
    </html>
  );
}
