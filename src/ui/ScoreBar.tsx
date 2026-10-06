import type { Palette } from '../theme';
import { fonts } from '../theme';

interface Props {
  palette: Palette;
  score: number;
  correct: number;
  attempts: number;
  streak: number;
}

export function ScoreBar({ palette: p, score, correct, attempts, streak }: Props) {
  const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
  const stat = (label: string, value: string | number) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={{ fontFamily: fonts.mono, fontSize: 10, color: p.muted, letterSpacing: 1 }}>{label}</span>
      <span style={{ fontFamily: fonts.mono, fontSize: 16, color: p.text, fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <section
      aria-label="Score"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        background: p.panel,
        border: `1px solid ${p.border}`,
        borderRadius: 10,
        padding: '10px 16px',
      }}
    >
      {stat('SCORE', score.toLocaleString())}
      {stat('ACCURACY', `${accuracy}%`)}
      {stat('STREAK', streak)}
      {stat('CASES', attempts)}
    </section>
  );
}
