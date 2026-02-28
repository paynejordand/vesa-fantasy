export function sanitizeOSLink(url: string): string {
  const match = url.match(/^https:\/\/overstat\.gg\/player\/(\d+)/);
  if (!match) throw new Error(`Invalid OS Link: ${url}`);
  return `https://overstat.gg/player/${match[1]}`;
}

export function parseMatchLinkID(url: string): string {
  const match = url.match(
    /^https:\/\/overstat\.gg\/tournament\/vesa(?:\w|%20)?league\/(\d+)/i,
  );
  if (!match) throw new Error(`Invalid Match Link: ${url}`);
  return match[1];
}

export async function getOverstatStatsFromMatchID(id: string) {
  const apiLink = `https://overstat.gg/api/stats/${id}/overall`;
  const overstatData = await (await fetch(apiLink)).json();
  return overstatData;
}

export function clamp(min: number, max: number, x:number) : number
{
  return Math.min(Math.max(x, min), max);
}