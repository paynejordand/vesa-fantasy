import type { Metadata } from "next";
import { getUser } from "@/app/lib/dal"
import Link from "next/link";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { DiscordSignIn, DiscordSignOut } from "@/app/components/header/discord-account";
import vesaLogo from "@/public/VESA-Logo.png"
import { SessionUser } from "@/app/db/definitions";
import { Nav } from "@/app/components/header/layout-nav";
import "@/app/globals.css";


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
  description: "Weekly fantasy draft for the VESA esports league. Compete against your friends and climb the leaderboard each week!",
};

function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <span className="text-xl font-bold tracking-tight text-black dark:text-white">
        <Image src={vesaLogo} alt="Vesa Logo" width={100}/>
      </span>
    </Link>
  );
}

function Account({ session }: { session: SessionUser | null }) {
  if (!session) return <DiscordSignIn />;
  return <DiscordSignOut />

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
          <Logo />
          <Nav />
          <Account session={session} />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
