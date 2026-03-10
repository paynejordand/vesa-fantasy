// components/LocalTime.tsx
"use client";

interface LocalTimeProps {
  date: Date;
}

export function LocalTime({ date }: LocalTimeProps) {
  return (
    <span>
      {new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      })}
    </span>
  );
}
