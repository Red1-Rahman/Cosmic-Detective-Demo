import type { Palette } from '../theme';
import { fonts } from '../theme';

export function Brief({ palette: p }: { palette: Palette }) {
  return (
    <section style={{ background: p.panel, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: p.accent, letterSpacing: 1 }}>MISSION BRIEF</div>
      <h2 style={{ margin: '8px 0 10px', fontSize: 18 }}>Case 01: Unexplained motion</h2>
      <p style={{ margin: 0, color: p.text, lineHeight: 1.55, fontSize: 14 }}>
        Survey telemetry from NASA's SPHEREx mission has flagged a region of sky where a point of light may
        have moved between two observations taken months apart. Review the tiles, compare the two epochs, and
        decide which signals are real motion and which are noise.
      </p>
      <p style={{ margin: '10px 0 0', color: p.muted, lineHeight: 1.55, fontSize: 13 }}>
        A rejected tile is useful progress. Stay precise: no finding is claimed until it survives every check.
      </p>
      <div style={{ marginTop: 12, fontFamily: fonts.mono, fontSize: 11, color: p.muted }}>
        Epoch A: 2025-03-14 · Epoch B: 2025-09-02
      </div>
    </section>
  );
}
