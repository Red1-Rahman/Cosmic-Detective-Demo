import type { Palette } from '../theme';
import { fonts } from '../theme';

const STEPS: { title: string; body: string }[] = [
  { title: 'Read the brief', body: 'Survey telemetry has flagged a possible moving source. The guide will walk you through one tile.' },
  { title: 'Open the tile', body: 'The highlighted tile is selected. Tap any tile to inspect it.' },
  { title: 'Blink the epochs', body: 'Turn on the blink comparator. A moving object will jump between the two exposures.' },
  { title: 'Flag the anomaly', body: 'You have spotted motion. Flag the tile to submit it for verification.' },
  { title: 'Read the verdict', body: 'Each check is shown, including the reason for any rejection.' },
  { title: 'Collect XP', body: 'Verified work earns experience. Progress toward Rank 2 is in the left panel.' },
];

export function Guide({ palette: p, step, onSkip }: { palette: Palette; step: number; onSkip: () => void }) {
  const s = STEPS[Math.min(step, STEPS.length - 1)];
  return (
    <div role="dialog" aria-label="Tutorial" style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: 'min(560px, 92vw)', background: p.panel, border: `1px solid ${p.accent}`, borderRadius: 12, padding: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.45)', zIndex: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: fonts.mono, fontSize: 11, color: p.accent }}>
        <span>GUIDE · STEP {step + 1} / {STEPS.length}</span>
        <button onClick={onSkip} style={{ background: 'none', border: 'none', color: p.muted, cursor: 'pointer', fontSize: 12 }}>Skip tutorial</button>
      </div>
      <div style={{ fontWeight: 700, marginTop: 6 }}>{s.title}</div>
      <div style={{ color: p.text, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{s.body}</div>
    </div>
  );
}
