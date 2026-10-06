import type { ToolId } from './levels';

export interface Quest {
  rank: number;
  tool: ToolId;
  target: number;
  instruction: string;
}

export const QUESTS: Quest[] = [
  { rank: 1, tool: 'inspect', target: 3, instruction: 'Scan the grid. Click three bright sources.' },
  { rank: 2, tool: 'blink', target: 3, instruction: 'Blink the epochs. Click three objects that jump between them.' },
  { rank: 3, tool: 'difference', target: 3, instruction: 'Use difference imaging. Click three residual signals.' },
  { rank: 4, tool: 'multiband', target: 3, instruction: 'Switch bands. Click sources that appear only in the long-wavelength bands, then log them.' },
  { rank: 5, tool: 'lightcurve', target: 3, instruction: 'Click sources to plot their brightness. Log three that repeat a pattern, not one-off spikes.' },
];

export function questFor(rank: number): Quest {
  return QUESTS.find((q) => q.rank === rank) ?? QUESTS[0];
}
