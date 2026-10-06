import type { ToolId } from './levels';

/** Each rank requires a number of correct finds using that rank's tool. */
export interface Quest {
  rank: number;
  tool: ToolId;
  target: number;      // finds needed to complete this rank
  instruction: string;
}

export const QUESTS: Quest[] = [
  { rank: 1, tool: 'inspect', target: 3, instruction: 'Scan the grid. Click three bright sources.' },
  { rank: 2, tool: 'blink', target: 3, instruction: 'Blink the epochs. Click three objects that jump between them.' },
  { rank: 3, tool: 'difference', target: 3, instruction: 'Use difference imaging. Click three residual signals.' },
  { rank: 4, tool: 'multiband', target: 3, instruction: 'Compare bands. Click three sources that brighten in one band only.' },
  { rank: 5, tool: 'lightcurve', target: 3, instruction: 'Read the light curves. Click three signals with a repeating pattern.' },
];

export function questFor(rank: number): Quest {
  return QUESTS.find((q) => q.rank === rank) ?? QUESTS[0];
}
