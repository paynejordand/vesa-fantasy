"use client";

import { useState, useEffect } from "react";

interface MobileMenuProps {
  nav: React.ReactNode;
  account: React.ReactNode;
}

export function MobileMenu({ nav, account }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        className="flex flex-col gap-1.5 z-50 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span
          className={`block h-0.5 w-6 bg-black dark:bg-white transition-transform ${isOpen ? "translate-y-2 rotate-45" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 bg-black dark:bg-white transition-opacity ${isOpen ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 bg-black dark:bg-white transition-transform ${isOpen ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 z-50 flex flex-col gap-6 p-6 transition-transform duration-150 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          className="self-end"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
        {nav}
        {account}
      </div>
    </div>
  );
}
