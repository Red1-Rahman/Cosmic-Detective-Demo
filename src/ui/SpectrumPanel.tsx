import type { Palette } from '../theme';
import { fonts } from '../theme';
import { BANDS, BAND_COUNT } from '../game/science';

interface Props {
  palette: Palette;
  spectrum: number[] | null;
  band: number;
  onBand: (band: number) => void;
}

export function SpectrumPanel({ palette: p, spectrum, band, onBand }: Props) {
  const values = spectrum ?? Array.from({ length: BAND_COUNT }, () => 0);
  const max = Math.max(...values, 0.01);

  return (
    <section style={{ background: p.panel, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: p.accent, letterSpacing: 1 }}>BAND VIEWER</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginTop: 10 }}>
        {BANDS.map((b, i) => (
          <button
            key={b.label}
            onClick={() => onBand(i)}
            aria-pressed={band === i}
            title={`${b.label}: ${b.range} (approx.)`}
            style={{
              background: band === i ? p.accent : p.bg,
              color: band === i ? '#0b0f17' : p.text,
              border: `1px solid ${p.border}`,
              borderRadius: 6,
              padding: '6px 0',
              fontFamily: fonts.mono,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: p.muted, marginTop: 6, fontFamily: fonts.mono }}>
        {BANDS[band].label} · {BANDS[band].range} (approx.)
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
        {values.map((v, i) => (
          <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div
              style={{
                width: '100%',
                height: `${(v / max) * 100}%`,
                minHeight: 2,
                background: i === band ? p.accent : p.known,
                borderRadius: 3,
                transition: 'height 200ms ease',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: p.muted, lineHeight: 1.45 }}>
        {spectrum
          ? 'Brightness of the selected source across six bands.'
          : 'Click a source on the tile to read its spectrum.'}
      </div>
    </section>
  );
}
