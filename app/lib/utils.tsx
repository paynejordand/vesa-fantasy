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

export function parseCSV(text: string) {
  const teams = [];
  const lines = text.trim().split("\n");

  for (let i = 0; i < lines.length; i++) {
    const row = lines[i].split(",").map((v) => v.trim());
    if (row.length < 3) continue;

    while (row.length < 7) row.push("");

    const teamName = row[0].replace(/'/g, "");
    if (!teamName) continue;

    const players = [
      { name: row[1].replace(/'/g, ""), link: row[2] },
      { name: row[3].replace(/'/g, ""), link: row[4] },
      { name: row[5].replace(/'/g, ""), link: row[6] },
    ].map((p) => {
      if (!p.name && !p.link) return null;
      const sanitized = sanitizeOSLink(p.link);
      if (!p.name || !sanitized) return null;
      return { name: p.name, link: sanitized };
    });

    const validPlayers = players.filter(Boolean);
    if (validPlayers.length === 0) continue;

    teams.push({ teamName, players });
  }

  return teams;
}