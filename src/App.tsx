import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Phaser from 'phaser';
import { buildTiles, TUTORIAL_TILE_INDEX, type Tile } from './game/data';
import { verifyFlag, finalVerdict, type Verdict } from './game/verify';
import { createGame } from './game/createGame';
import type { ScannerScene } from './game/scenes/ScannerScene';
import { palettes, fonts, type DisplayMode } from './theme';
import { Brief } from './ui/Brief';
import { RankBar } from './ui/RankBar';
import { ResultPanel } from './ui/ResultPanel';
import { Guide } from './ui/Guide';

const LEVEL_TILE_COUNT = 12;

export default function App() {
  const [mode, setMode] = useState<DisplayMode>('dark');
  const [tiles] = useState<Tile[]>(() => buildTiles().slice(0, LEVEL_TILE_COUNT));
  const [selected, setSelected] = useState<number>(-1);
  const [blink, setBlink] = useState(false);
  const [flagged, setFlagged] = useState<Record<string, Verdict[]>>({});
  const [xp, setXp] = useState(0);
  const [guideStep, setGuideStep] = useState<number | null>(0);
  const [tutorialDone, setTutorialDone] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<ScannerScene | null>(null);

  const p = palettes[mode as keyof typeof palettes];

  // Boot Phaser once. The scene is registered on READY, so poll until it is live.
  useEffect(() => {
    if (!mountRef.current) return;
    const game = createGame(mountRef.current, tiles, {
      onSelect: (i) => setSelected(i),
    });
    gameRef.current = game;
    let cancelled = false;
    const poll = () => {
      if (cancelled) return;
      const s = game.scene.getScene('ScannerScene') as ScannerScene | undefined;
      if (s && s.scene.isActive()) {
        sceneRef.current = s;
        return;
      }
      window.setTimeout(poll, 50);
    };
    poll();
    return () => {
      cancelled = true;
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [tiles]);

  // Push React state into the Phaser scene.
  useEffect(() => {
    sceneRef.current?.setSelected(selected);
  }, [selected]);

  useEffect(() => {
    sceneRef.current?.setBlink(blink);
  }, [blink]);

  const current = selected >= 0 ? tiles[selected] : null;
  const currentVerdicts = current ? flagged[current.id] : undefined;
  const verdict = currentVerdicts ? finalVerdict(currentVerdicts) : null;

  const flaggedCount = Object.keys(flagged).length;
  function flagCurrent() {
    if (!current || currentVerdicts) return;
    const steps = verifyFlag(current);
    setFlagged((prev) => ({ ...prev, [current.id]: steps }));
    const v = finalVerdict(steps);
    const gained = v.status === 'known' || v.status === 'candidate' ? 25 : 5;
    setXp((x) => x + gained);
    // Advance tutorial when the guaranteed tutorial tile is flagged.
    if (guideStep === 3 && current.id === tiles[TUTORIAL_TILE_INDEX].id) {
      setGuideStep(4);
    }
  }

  // Guide step transitions driven by real actions (GDD 8.1).
  useEffect(() => {
    if (guideStep === 1 && selected >= 0) setGuideStep(2);
    if (guideStep === 2 && blink) setGuideStep(3);
    if (guideStep === 4 && verdict) setGuideStep(5);
    if (guideStep === 5 && xp > 0) setGuideStep(6);
    if (guideStep === 6) {
      setGuideStep(null);
      setTutorialDone(true);
    }
  }, [guideStep, selected, blink, verdict, xp]);

  // Tutorial starts by pointing at the tutorial tile.
  useEffect(() => {
    if (guideStep === 1 || guideStep === 2 || guideStep === 3 || guideStep === 4) {
      if (selected < 0) setSelected(TUTORIAL_TILE_INDEX);
    }
  }, [guideStep, selected]);

  const rank = xp >= 60 ? 2 : 1;

  return (
    <div style={{ width: '100vw', height: '100vh', background: p.bg, color: p.text, fontFamily: fonts.ui, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: `1px solid ${p.border}`, background: p.panel }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.accent }} aria-hidden />
          <strong style={{ letterSpacing: 0.5 }}>Cosmic Detective</strong>
          <span style={{ color: p.muted, fontSize: 12 }}>Case 01 · The Training Grounds</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['dark', 'light', 'colorblind'] as DisplayMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              style={btn(p, mode === m)}
            >
              {m === 'dark' ? 'Dark' : m === 'light' ? 'Light' : 'Colorblind safe'}
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: 14, padding: 14, flex: 1, minHeight: 0 }}>
        {/* Left: narrative */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <Brief palette={p} />
          <RankBar palette={p} xp={xp} rank={rank} tilesReviewed={flaggedCount} />
        </aside>

        {/* Centre: Phaser scanner */}
        <main style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: p.muted, fontSize: 12, fontFamily: fonts.mono }}>
            <span>ANOMALY SCANNER · {tiles.length} TILES</span>
            <span>{current ? `${current.label} · ${current.coord}` : 'Select a tile'}</span>
          </div>
          <div
            ref={mountRef}
            style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${p.border}`, background: '#070910' }}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setBlink((b) => !b)}
              aria-pressed={blink}
              style={btn(p, blink)}
              disabled={selected < 0}
            >
              {blink ? 'Stop blink' : 'Blink comparator'}
            </button>
            <button onClick={flagCurrent} disabled={!current || !!currentVerdicts} style={btn(p, true, p.reject)}>
              Flag tile
            </button>
            {tutorialDone && <span style={{ color: p.muted, fontSize: 12 }}>Tutorial complete. Replay from settings.</span>}
          </div>
        </main>

        {/* Right: result */}
        <aside style={{ minHeight: 0, overflow: 'auto' }}>
          <ResultPanel palette={p} tile={current} steps={currentVerdicts} />
        </aside>
      </div>

      {guideStep !== null && (
        <Guide palette={p} step={guideStep} onSkip={() => { setGuideStep(null); setTutorialDone(true); }} />
      )}
    </div>
  );
}

function btn(p: { panel: string; text: string; border: string; accent: string }, active: boolean, activeColor?: string): CSSProperties {
  const bg = active ? activeColor ?? p.accent : p.panel;
  return {
    background: bg,
    color: active ? '#0b0f17' : p.text,
    border: `1px solid ${p.border}`,
    borderRadius: 8,
    padding: '8px 14px',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: fonts.ui,
  };
}
