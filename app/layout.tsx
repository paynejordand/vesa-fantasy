import type { Metadata } from "next";
import { getUser } from "@/app/lib/dal";
import Link from "next/link";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import {
  DiscordSignIn,
  DiscordSignOut,
} from "@/app/components/header/discord-account";
import vesaLogo from "@/public/VESA-Logo.png";
import vesaLogoBlack from "@/public/VESA-Logo-Black.png";
import { SessionUser } from "@/app/db/definitions";
import { Nav } from "@/app/components/header/layout-nav";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";
import { MobileMenu } from "./components/mobile-menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "VESA Fantasy - %s",
    default: "VESA Fantasy",
  },
  description:
    "Weekly fantasy draft for the VESA esports league. Compete against your friends and climb the leaderboard each week!",
};

function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src={vesaLogoBlack}
        alt="Vesa Logo"
        width={100}
        className="block dark:hidden"
      />
      <Image
        src={vesaLogo}
        alt="Vesa Logo"
        width={100}
        className="hidden dark:block"
      />
    </Link>
  );
}

function Account({ session }: { session: SessionUser | null }) {
  if (!session) return <DiscordSignIn />;
  return <DiscordSignOut />;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUser();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="flex-1">
            <Logo />
          </div>

          {/* Desktop Nav - centered */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-6">
            <Nav />
          </div>

          {/* Account - right justified */}
          <div className="hidden md:flex flex-1 items-center justify-end">
            <Account session={session} />
          </div>

          {/* Mobile */}
          <MobileMenu nav={<Nav />} account={<Account session={session} />} />
        </header>
        <main>
          {children}
          <SpeedInsights />
          <Analytics />
        </main>
      </body>
    </html>
  );
}
