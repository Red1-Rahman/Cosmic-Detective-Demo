import type { Tile } from './data';

export type Verdict =
  | { status: 'rejected-stationary'; reason: string }
  | { status: 'rejected-halo'; reason: string }
  | { status: 'known'; reason: string; catalogName: string }
  | { status: 'candidate'; reason: string };

/**
 * Mirrors GDD 5.3 verification steps. Each check's result is returned so the
 * UI can show it to the player. Confirmed language is never produced here.
 */
export function verifyFlag(tile: Tile): Verdict[] {
  const steps: Verdict[] = [];

  // 1. Stationary source check
  if (tile.truth === 'stationary' || tile.kind === 'star' || tile.kind === 'noise') {
    steps.push({
      status: 'rejected-stationary',
      reason: 'Same source in both epochs. No real motion detected.',
    });
    return steps;
  }

  // 2. Blend and halo check
  if (tile.truth === 'halo' || tile.kind === 'artifact') {
    steps.push({
      status: 'rejected-halo',
      reason: 'Glow from a bright neighbour. Image artifact, not a real object.',
    });
    return steps;
  }

  // 3. Catalog cross match. Demo catalog: first mover tile is a known body.
  if (tile.mover && tile.id === 'tile-1') {
    steps.push({
      status: 'known',
      reason: 'Position matches a catalogued small body.',
      catalogName: 'Demo Catalog · Known Small Body (placeholder)',
    });
    return steps;
  }

  // 4. No remaining match: candidate for follow-up, never "confirmed".
  steps.push({
    status: 'candidate',
    reason: 'No catalog match. Queued for professional follow-up. Not a confirmed discovery.',
  });
  return steps;
}

export function finalVerdict(steps: Verdict[]): Verdict {
  return steps[steps.length - 1];
}
