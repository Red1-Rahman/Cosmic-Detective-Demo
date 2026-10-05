import type { Palette } from '../theme';
import { fonts } from '../theme';

interface Props {
  palette: Palette;
  xp: number;
  rank: number;
  tilesReviewed: number;
}

const RANK_XP_TARGET = 60; // demo threshold to reach Rank 2

export function RankBar({ palette: p, xp, rank, tilesReviewed }: Props) {
  const pct = Math.min(100, (xp / RANK_XP_TARGET) * 100);
  return (
    <section style={{ background: p.panel, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: fonts.mono, fontSize: 11, color: p.muted }}>
        <span>RANK {rank} · {rank === 1 ? 'LEARNER' : 'FIELD ANALYST'}</span>
        <span>{tilesReviewed} REVIEWED</span>
      </div>
      <div style={{ marginTop: 10, height: 10, borderRadius: 6, background: p.border, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: p.accent, transition: 'width 300ms ease' }} />
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: p.muted }}>
        {xp} XP · {Math.max(0, RANK_XP_TARGET - xp)} XP to Rank 2
      </div>
    </section>
  );
}
