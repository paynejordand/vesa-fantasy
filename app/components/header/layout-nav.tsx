"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function Nav() {
  const pathname = usePathname();
  const links = [
    { href: "/draft", label: "Draft" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={clsx(
            "text-med font-medium transition-colors hover:text-black dark:hover:text-white",
            pathname.startsWith(link.href)
              ? "text-blue-500"
              : "text-zinc-600  dark:text-zinc-400",
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}
