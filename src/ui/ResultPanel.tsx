import type { Palette } from '../theme';
import { fonts } from '../theme';
import type { Tile } from '../game/data';
import type { Verdict } from '../game/verify';

interface Props {
  palette: Palette;
  tile: Tile | null;
  steps?: Verdict[];
}

const LABEL: Record<Verdict['status'], string> = {
  'rejected-stationary': 'REJECTED · STATIONARY',
  'rejected-halo': 'REJECTED · HALO / ARTIFACT',
  known: 'KNOWN OBJECT',
  candidate: 'CANDIDATE · FOR FOLLOW-UP',
};

export function ResultPanel({ palette: p, tile, steps }: Props) {
  const colorFor = (s: Verdict['status']) =>
    s === 'known' ? p.known
    : s === 'candidate' ? p.candidate
    : s === 'rejected-halo' || s === 'rejected-stationary' ? p.reject
    : p.info;

  return (
    <section style={{ background: p.panel, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16, minHeight: '100%' }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: p.accent, letterSpacing: 1 }}>TILE REPORT</div>

      {!tile && <p style={{ color: p.muted, fontSize: 13, marginTop: 10 }}>Select a tile in the scanner to inspect it.</p>}

      {tile && (
        <>
          <h3 style={{ margin: '8px 0 4px', fontSize: 16 }}>{tile.label}</h3>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: p.muted }}>{tile.coord}</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: p.muted, marginTop: 4 }}>
            {tile.metaDate[0]} → {tile.metaDate[1]}
          </div>

          {!steps && (
            <p style={{ color: p.muted, fontSize: 13, marginTop: 14 }}>
              Use the blink comparator to check for motion, then flag the tile if you find an anomaly.
            </p>
          )}

          {steps && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${colorFor(s.status)}`, paddingLeft: 10 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 11, color: colorFor(s.status), fontWeight: 600 }}>
                    {i + 1}. {LABEL[s.status]}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4, color: p.text, lineHeight: 1.45 }}>{s.reason}</div>
                  {s.status === 'known' && (
                    <div style={{ fontSize: 12, marginTop: 4, color: p.muted }}>{s.catalogName}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
