import type { Palette } from '../theme';
import { fonts } from '../theme';
import { LEVELS, xpFloorFor } from '../game/levels';

interface Props {
  palette: Palette;
  xp: number;
  rank: number;
  tilesReviewed: number;
}

export function RankBar({ palette: p, xp, rank, tilesReviewed }: Props) {
  const level = LEVELS.find((l) => l.rank === rank) ?? LEVELS[0];
  const floor = xpFloorFor(rank);
  const ceiling = level.xpToNext === Infinity ? floor : floor + level.xpToNext;
  const pct = level.xpToNext === Infinity ? 100 : Math.min(100, ((xp - floor) / (ceiling - floor)) * 100);
  const toNext = level.xpToNext === Infinity ? 0 : Math.max(0, ceiling - xp);

  return (
    <section style={{ background: p.panel, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: fonts.mono, fontSize: 11, color: p.muted }}>
        <span>RANK {rank} · {level.title.toUpperCase()}</span>
        <span>{tilesReviewed} FILED</span>
      </div>
      <div style={{ marginTop: 10, height: 10, borderRadius: 6, background: p.border, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: p.accent, transition: 'width 300ms ease' }} />
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: p.muted }}>
        {xp} XP{level.xpToNext === Infinity ? ' · Highest rank' : ` · ${toNext} XP to next rank`}
      </div>
    </section>
  );
}
