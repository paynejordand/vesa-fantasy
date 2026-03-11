"use client";

import { useState } from "react";

interface AdminTab {
  label: string;
  component: React.ReactNode;
}

interface AdminPageProps {
  tabs: AdminTab[];
}

export function AdminPage({ tabs }: AdminPageProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col p-4 gap-4">
      {/* Tab Bar */}
      <div className="flex gap-6 border-b border-dashed border-zinc-300 dark:border-zinc-700 pb-2 justify-center">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActiveIndex(index)}
            className={`text-sm font-medium transition-colors pb-2 -mb-2.5 border-b-2 ${
              activeIndex === index
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Component */}
      <div>{tabs[activeIndex].component}</div>
    </div>
  );
}
