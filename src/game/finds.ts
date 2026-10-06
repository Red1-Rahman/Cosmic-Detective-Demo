import type { Tile } from './data';
import type { ToolId } from './levels';

export interface Target {
  x: number; // 0..1 within tile
  y: number;
  label: string;
}

/**
 * Which targets each tool can reveal on a tile. Targets come from the tile's
 * actual features (demo data), so a correct find always corresponds to something real.
 */
export function targetsFor(tile: Tile, tool: ToolId): Target[] {
  const out: Target[] = [];
  if (tile.mover) {
    if (tool === 'blink' || tool === 'difference') {
      out.push({ x: tile.mover.from.x, y: tile.mover.from.y, label: 'mover' });
      out.push({ x: tile.mover.to.x, y: tile.mover.to.y, label: 'mover' });
    }
    if (tool === 'lightcurve' || tool === 'multiband') {
      out.push({ x: tile.mover.to.x, y: tile.mover.to.y, label: 'signal' });
    }
  }
  if (tile.halo && (tool === 'difference' || tool === 'multiband')) {
    // A halo is a decoy: clicking it counts as a wrong find.
    out.push({ x: tile.halo.x, y: tile.halo.y, label: 'decoy' });
  }
  if (tool === 'inspect') {
    // Bright stars are valid inspection targets.
    const brightest = [...tile.stars].sort((a, b) => b.b - a.b).slice(0, 1);
    for (const s of brightest) out.push({ x: s.x, y: s.y, label: 'source' });
  }
  return out;
}

/** Returns the target under a normalized point, or null. */
export function hitTarget(targets: Target[], nx: number, ny: number, radius = 0.05): Target | null {
  return targets.find((t) => Math.hypot(t.x - nx, t.y - ny) <= radius) ?? null;
}
