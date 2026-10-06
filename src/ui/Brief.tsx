import type { Palette } from '../theme';
import { fonts } from '../theme';
import { LEVELS } from '../game/levels';

export function Brief({ palette: p, rank }: { palette: Palette; rank: number }) {
  const level = LEVELS.find((l) => l.rank === rank) ?? LEVELS[0];
  return (
    <section style={{ background: p.panel, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16, position: 'relative' }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: p.accent, letterSpacing: 2 }}>
        CASE FILE · CLASSIFIED
      </div>
      <h2 style={{ margin: '8px 0 4px', fontSize: 18, fontFamily: fonts.ui }}>
        A light that will not stay still
      </h2>
      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: p.muted, marginBottom: 10 }}>
        Clearance: Rank {rank} · {level.title}
      </div>
      <p style={{ margin: 0, color: p.text, lineHeight: 1.6, fontSize: 14 }}>
        Telemetry from the SPHEREx survey has logged something strange in a quiet patch of sky. Two observations, taken months apart, do not quite agree. Somewhere in the noise is a point of light that has moved, or a shadow that should not be there.
      </p>
      <p style={{ margin: '10px 0 0', color: p.muted, lineHeight: 1.6, fontSize: 13, fontStyle: 'italic' }}>
        Trust the evidence, not the first impression. A dismissed lead is still progress.
      </p>
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${p.border}`, fontSize: 12, color: p.muted }}>
        <strong style={{ color: p.text }}>Current method:</strong> {level.description}
      </div>
    </section>
  );
}
