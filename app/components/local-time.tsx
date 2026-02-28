"use client";

export function LocalTime() {
  const estDate = new Date("2024-01-01T20:00:00-05:00");
  const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const userTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: userTZ,
  }).format(estDate);

  const formattedTZ = userTZ.replace(/_/g, " ");

  return (
    <span>
      {userTime} local time ({formattedTZ})
    </span>
  );
}
