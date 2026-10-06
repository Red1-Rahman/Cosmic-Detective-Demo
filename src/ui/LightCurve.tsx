import type { Palette } from '../theme';
import { fonts } from '../theme';
import { EPOCH_COUNT } from '../game/science';

interface Props {
  palette: Palette;
  series: number[] | null;
  epoch: number;
}

const W = 260;
const H = 130;
const PAD = 20;

export function LightCurve({ palette: p, series, epoch }: Props) {
  let path = '';
  let points: { x: number; y: number }[] = [];
  let minV = 0;
  let maxV = 1;

  if (series) {
    minV = Math.min(...series);
    maxV = Math.max(...series);
    const span = Math.max(0.01, maxV - minV);
    const xAt = (t: number) => PAD + (t / (EPOCH_COUNT - 1)) * (W - PAD * 2);
    const yAt = (v: number) => H - PAD - ((v - minV) / span) * (H - PAD * 2);
    points = series.map((v, t) => ({ x: xAt(t), y: yAt(v) }));
    path = points.map((pt, t) => `${t === 0 ? 'M' : 'L'}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
  }

  return (
    <section style={{ background: p.panel, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: p.accent, letterSpacing: 1 }}>LIGHT CURVE</div>

      {!series ? (
        <div style={{ marginTop: 10, fontSize: 12, color: p.muted, lineHeight: 1.45 }}>
          Click a source on the tile to plot its brightness across epochs.
        </div>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Brightness over time" style={{ marginTop: 10 }}>
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={p.border} />
            <path d={path} fill="none" stroke={p.known} strokeWidth={2} />
            {points.map((pt, t) => (
              <circle
                key={t}
                cx={pt.x}
                cy={pt.y}
                r={t === epoch ? 4 : 1.8}
                fill={t === epoch ? p.accent : p.known}
              />
            ))}
            <text x={PAD} y={H - 4} fontSize={9} fill={p.muted}>epoch 1</text>
            <text x={W - PAD} y={H - 4} fontSize={9} fill={p.muted} textAnchor="end">epoch {EPOCH_COUNT}</text>
          </svg>
          <div style={{ marginTop: 8, fontSize: 12, color: p.muted, lineHeight: 1.45 }}>
            Look at the shape across time, not one moment. A single isolated point is not the same as a pattern.
          </div>
        </>
      )}
    </section>
  );
}
