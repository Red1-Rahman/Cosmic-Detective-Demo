export type ToolId = 'inspect' | 'blink' | 'difference' | 'multiband' | 'lightcurve';

export interface Level {
  rank: number;
  title: string;
  tool: ToolId;
  toolLabel: string;
  description: string;
  xpToNext: number; // XP needed to finish this rank
}

export const LEVELS: Level[] = [
  {
    rank: 1,
    title: 'Visual Inspection',
    tool: 'inspect',
    toolLabel: 'Inspect',
    description: 'Scan the sky grid and look for anything unusual.',
    xpToNext: 40,
  },
  {
    rank: 2,
    title: 'Blink Comparison',
    tool: 'blink',
    toolLabel: 'Blink comparator',
    description: 'Toggle between two epochs and spot what moved.',
    xpToNext: 60,
  },
  {
    rank: 3,
    title: 'Difference Imaging',
    tool: 'difference',
    toolLabel: 'Difference image',
    description: 'Subtract a reference frame to reveal only what changed.',
    xpToNext: 80,
  },
  {
    rank: 4,
    title: 'Multi-band Visualization',
    tool: 'multiband',
    toolLabel: 'Band viewer',
    description: 'View the same region across different infrared wavelengths.',
    xpToNext: 100,
  },
  {
    rank: 5,
    title: 'Light Curve',
    tool: 'lightcurve',
    toolLabel: 'Light curve',
    description: 'Graph brightness over time to separate real signals from noise.',
    xpToNext: Infinity,
  },
];

export function levelForXp(xp: number): Level {
  let current = LEVELS[0];
  let cumulative = 0;
  for (const lvl of LEVELS) {
    if (xp < cumulative + lvl.xpToNext) return lvl;
    cumulative += lvl.xpToNext;
    current = lvl;
  }
  return current;
}

export function xpFloorFor(rank: number): number {
  let total = 0;
  for (const lvl of LEVELS) {
    if (lvl.rank >= rank) break;
    total += lvl.xpToNext;
  }
  return total;
}

export function toolUnlocked(tool: ToolId, rank: number): boolean {
  const required = LEVELS.find((l) => l.tool === tool);
  return required ? rank >= required.rank : false;
}
