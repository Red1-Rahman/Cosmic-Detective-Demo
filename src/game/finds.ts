import type { Tile } from './data';
import type { ToolId } from './levels';

export interface Target {
  x: number; // 0..1 within tile
  y: number;
  label: 'mover' | 'decoy' | 'source';
}

/** Click-to-find targets for Inspect, Blink, and Difference (Ranks 1 to 3). */
export function targetsFor(tile: Tile, tool: ToolId): Target[] {
  const out: Target[] = [];

  if (tool === 'inspect') {
    const brightest = [...tile.stars].sort((a, b) => b.b - a.b)[0];
    if (brightest) out.push({ x: brightest.x, y: brightest.y, label: 'source' });
  }

  if ((tool === 'blink' || tool === 'difference') && tile.mover) {
    out.push({ x: tile.mover.from.x, y: tile.mover.from.y, label: 'mover' });
    out.push({ x: tile.mover.to.x, y: tile.mover.to.y, label: 'mover' });
  }

  if (tool === 'difference' && tile.halo) {
    out.push({ x: tile.halo.x, y: tile.halo.y, label: 'decoy' });
  }

  return out;
}
