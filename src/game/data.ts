/**
 * DEMO DATA ONLY.
 *
 * These tiles are procedurally generated stand-ins for SPHEREx Level 2
 * cutouts. They exist so the frontend concept demo can run without a
 * backend. They are NOT real observations and must never be presented as
 * such. The real pipeline (GDD sections 5.2-5.3, 10.1) replaces this module.
 */

export type TileKind = 'star' | 'noise' | 'artifact' | 'mover';

export interface Star {
  x: number; // 0..1 within tile
  y: number;
  r: number; // radius px
  b: number; // brightness 0..1
}

export interface Tile {
  id: string;
  label: string;          // e.g. "T-01"
  coord: string;          // fake sky coordinate string for HUD
  seed: number;
  stars: Star[];          // epoch A positions
  // Mover: present only on tiles with a real moving source.
  mover?: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    b: number;
    r: number;
  };
  // Artifact: glow/halo that should be rejected by the verification pipeline.
  halo?: { x: number; y: number; r: number };
  kind: TileKind;
  // Ground truth used by the verification pipeline for the demo.
  truth: 'mover' | 'stationary' | 'halo';
  metaDate: [string, string]; // two epochs, months apart
}

// Deterministic PRNG so the same seed always yields the same sky.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeStars(rand: () => number, count: number): Star[] {
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: rand(),
      y: rand(),
      r: 0.6 + rand() * 1.8,
      b: 0.25 + rand() * 0.75,
    });
  }
  return out;
}

interface TileSpec {
  kind: TileKind;
  seed: number;
  truth: Tile['truth'];
  coordIndex: number;
  dates: [string, string];
}

// First tile is the guaranteed-correct tutorial tile (GDD 8.2).
const specs: TileSpec[] = [
  { kind: 'mover', seed: 101, truth: 'mover', coordIndex: 0, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'star', seed: 202, truth: 'stationary', coordIndex: 1, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'artifact', seed: 303, truth: 'halo', coordIndex: 2, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'star', seed: 404, truth: 'stationary', coordIndex: 3, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'mover', seed: 505, truth: 'mover', coordIndex: 4, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'noise', seed: 606, truth: 'stationary', coordIndex: 5, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'star', seed: 707, truth: 'stationary', coordIndex: 6, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'artifact', seed: 808, truth: 'halo', coordIndex: 7, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'star', seed: 909, truth: 'stationary', coordIndex: 8, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'noise', seed: 1010, truth: 'stationary', coordIndex: 9, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'mover', seed: 1111, truth: 'mover', coordIndex: 10, dates: ['2025-03-14', '2025-09-02'] },
  { kind: 'star', seed: 1212, truth: 'stationary', coordIndex: 11, dates: ['2025-03-14', '2025-09-02'] },
];

const COORDS = [
  'RA 17h 42m  DEC -28° 11′',
  'RA 17h 44m  DEC -28° 09′',
  'RA 17h 45m  DEC -28° 14′',
  'RA 17h 47m  DEC -28° 17′',
  'RA 17h 48m  DEC -28° 05′',
  'RA 17h 50m  DEC -28° 21′',
  'RA 17h 51m  DEC -28° 08′',
  'RA 17h 53m  DEC -28° 13′',
  'RA 17h 54m  DEC -28° 19′',
  'RA 17h 56m  DEC -28° 02′',
  'RA 17h 58m  DEC -28° 24′',
  'RA 17h 59m  DEC -28° 16′',
];

export function buildTiles(): Tile[] {
  return specs.map((s, i) => {
    const rand = mulberry32(s.seed);
    const stars = makeStars(rand, 90 + Math.floor(rand() * 60));
    const tile: Tile = {
      id: `tile-${i + 1}`,
      label: `T-${String(i + 1).padStart(2, '0')}`,
      coord: COORDS[s.coordIndex],
      seed: s.seed,
      stars,
      kind: s.kind,
      truth: s.truth,
      metaDate: s.dates,
    };
    if (s.kind === 'mover') {
      tile.mover = {
        from: { x: 0.2 + rand() * 0.2, y: 0.25 + rand() * 0.5 },
        to: { x: 0.6 + rand() * 0.2, y: 0.25 + rand() * 0.5 },
        b: 0.95,
        r: 2.6,
      };
    }
    if (s.kind === 'artifact') {
      tile.halo = { x: 0.35 + rand() * 0.3, y: 0.35 + rand() * 0.3, r: 0.22 };
    }
    return tile;
  });
}

/** Simple lookup: the mover tile for the tutorial is always index 0. */
export const TUTORIAL_TILE_INDEX = 0;
