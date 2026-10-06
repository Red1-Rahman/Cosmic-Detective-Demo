import type { Tile } from './data';

export const BAND_COUNT = 6;
export const EPOCH_COUNT = 24;
/** Bands with index >= this are on SPHEREx's long-wavelength side (bands 4 to 6). */
const LONG_BAND_START = 3;
const VARIABLE_PERIOD = 6; // epochs per cycle for periodic variables
const SPIKE_AMPLITUDE = 0.7;

/**
 * Approximate display bands. SPHEREx covers 0.75 to 5.0 um across two detector
 * sides; these ranges are simplified for the demo and labelled "approx." in the UI.
 */
export const BANDS: { label: string; range: string }[] = [
  { label: 'B1', range: '0.75-1.4 µm' },
  { label: 'B2', range: '1.4-2.0 µm' },
  { label: 'B3', range: '2.0-2.44 µm' },
  { label: 'B4', range: '2.40-3.4 µm' },
  { label: 'B5', range: '3.4-4.2 µm' },
  { label: 'B6', range: '4.2-5.0 µm' },
];

/**
 * DEMO science model. Not real photometry. Each tile's sources are classified
 * deterministically so the same tile always has the same answers.
 *  - normal:   steady in every band and epoch
 *  - cold:     faint in short bands, bright only in long bands (multi-band target)
 *  - variable: repeating brightness pattern over epochs (light-curve target)
 *  - spike:    one-off glitch at a single epoch (light-curve decoy)
 */
export type SourceKind = 'normal' | 'cold' | 'variable' | 'spike';

function hash(a: number, b: number): number {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const kindCache = new WeakMap<Tile, SourceKind[]>();

export function sourceKinds(tile: Tile): SourceKind[] {
  const cached = kindCache.get(tile);
  if (cached) return cached;

  const kinds: SourceKind[] = tile.stars.map(() => 'normal');
  const ranked = tile.stars
    .map((_, i) => ({ i, r: hash(tile.seed, i) }))
    .sort((a, b) => a.r - b.r);

  const plan: SourceKind[] = ['cold', 'cold', 'variable', 'variable', 'spike'];
  plan.forEach((kind, n) => {
    const entry = ranked[n];
    if (entry) kinds[entry.i] = kind;
  });

  kindCache.set(tile, kinds);
  return kinds;
}

/** Flux of one source in one band (0 to ~1). */
export function bandFlux(tile: Tile, idx: number, band: number): number {
  const star = tile.stars[idx];
  const kind = sourceKinds(tile)[idx];
  if (kind === 'cold') {
    return band >= LONG_BAND_START ? 0.75 : 0.02;
  }
  return star.b * (0.9 + (0.1 * band) / (BAND_COUNT - 1));
}

/** Flux of every band for one source, used by the spectrum panel. */
export function bandSpectrum(tile: Tile, idx: number): number[] {
  return Array.from({ length: BAND_COUNT }, (_, b) => bandFlux(tile, idx, b));
}

/** Flux of one source at one epoch. */
export function epochFlux(tile: Tile, idx: number, epoch: number): number {
  const star = tile.stars[idx];
  const kind = sourceKinds(tile)[idx];
  const noise = (hash(tile.seed + 17, idx * 131 + epoch) - 0.5) * 0.05;

  if (kind === 'variable') {
    const phase = hash(tile.seed, idx) * Math.PI * 2;
    return star.b * (1 + 0.4 * Math.sin((2 * Math.PI * epoch) / VARIABLE_PERIOD + phase)) + noise;
  }
  if (kind === 'spike') {
    const spikeAt = Math.floor(hash(tile.seed + 3, idx) * EPOCH_COUNT);
    return star.b + noise + (epoch === spikeAt ? SPIKE_AMPLITUDE : 0);
  }
  return star.b + noise;
}

/** Brightness of one source across all epochs, used by the light curve chart. */
export function epochSeries(tile: Tile, idx: number): number[] {
  return Array.from({ length: EPOCH_COUNT }, (_, t) => epochFlux(tile, idx, t));
}
