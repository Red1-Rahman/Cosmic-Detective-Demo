import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { buildTiles, TUTORIAL_TILE_INDEX, type Tile } from './game/data';
import { verifyFlag, finalVerdict, type Verdict } from './game/verify';
import { createGame } from './game/createGame';
import type { ScannerScene } from './game/scenes/ScannerScene';
import { LEVELS, toolUnlocked, type ToolId } from './game/levels';
import { QUESTS, questFor } from './game/quests';
import type { Target } from './game/finds';
import { bandSpectrum, epochSeries, sourceKinds } from './game/science';
import { palettes, fonts, type DisplayMode } from './theme';
import { Brief } from './ui/Brief';
import { RankBar } from './ui/RankBar';
import { ResultPanel } from './ui/ResultPanel';
import { Guide } from './ui/Guide';
import { ScoreBar } from './ui/ScoreBar';
import { QuestBar } from './ui/QuestBar';
import { SpectrumPanel } from './ui/SpectrumPanel';
import { LightCurve } from './ui/LightCurve';

const LEVEL_TILE_COUNT = 12;
const FIND_XP = 15;
const FIND_POINTS = 50;
const WRONG_LOG_PENALTY = 10;

const TOOLS: { id: ToolId; label: string }[] = [
  { id: 'inspect', label: 'Inspect' },
  { id: 'blink', label: 'Blink' },
  { id: 'difference', label: 'Difference' },
  { id: 'multiband', label: 'Multi-band' },
  { id: 'lightcurve', label: 'Light curve' },
];

export default function App() {
  const [mode, setMode] = useState<DisplayMode>('dark');
  const [tiles] = useState<Tile[]>(() => buildTiles().slice(0, LEVEL_TILE_COUNT));
  const [selected, setSelected] = useState<number>(-1);
  const [tool, setTool] = useState<ToolId>('inspect');
  const [flagged, setFlagged] = useState<Record<string, Verdict[]>>({});
  const [finds, setFinds] = useState<number>(0);
  const [totalFinds, setTotalFinds] = useState<number>(0);
  const [wrongClicks, setWrongClicks] = useState<number>(0);
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [guideStep, setGuideStep] = useState<number | null>(0);
  const [tutorialDone, setTutorialDone] = useState(false);
  const [rank, setRank] = useState(1);
  const [band, setBand] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [inspectedStar, setInspectedStar] = useState<number | null>(null);
  const [logged, setLogged] = useState<Record<string, boolean>>({});

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ScannerScene | null>(null);

  const p = palettes[mode];
  const level = LEVELS.find((l) => l.rank === rank) ?? LEVELS[0];
  const quest = questFor(rank);
  const isLastRank = rank === QUESTS[QUESTS.length - 1].rank;
  const current = selected >= 0 ? tiles[selected] : null;
  const currentVerdicts = current ? flagged[current.id] : undefined;
  const verdict = currentVerdicts ? finalVerdict(currentVerdicts) : null;
  const flaggedCount = Object.keys(flagged).length;
  const isAnalysisTool = tool === 'multiband' || tool === 'lightcurve';
  const spectrum = current && inspectedStar !== null ? bandSpectrum(current, inspectedStar) : null;
  const series = current && inspectedStar !== null ? epochSeries(current, inspectedStar) : null;

  // Phaser callbacks are created once, so they call through this ref to reach
  // the latest state (quest, rank, streak) instead of a stale closure.
  const latest = useRef({
    handleFind: (_t: number, _g: Target | null) => {},
    handleStarClick: (_t: number, _s: number) => {},
  });

  function credit() {
    setTotalFinds((t) => t + 1);
    setStreak((s) => s + 1);
    setScore((s) => s + FIND_POINTS + streak * 5);
    setXp((x) => x + FIND_XP);
    const next = finds + 1;
    if (next >= quest.target && !isLastRank) {
      setFinds(0);
      setRank((r) => r + 1);
    } else {
      setFinds(next);
    }
  }

  function handleFind(tileIndex: number, target: Target | null) {
    if (!target || target.label === 'decoy') {
      setWrongClicks((w) => w + 1);
      setStreak(0);
      setScore((s) => Math.max(0, s - (target ? 10 : 5)));
      return;
    }
    sceneRef.current?.markFound(tileIndex, target);
    credit();
  }

  function handleStarClick(_tileIndex: number, starIndex: number) {
    setInspectedStar(starIndex >= 0 ? starIndex : null);
  }

  function logSource() {
    if (!current || inspectedStar === null || !isAnalysisTool) return;
    const key = `${selected}:${inspectedStar}:${tool}`;
    if (logged[key]) return;
    setLogged((prev) => ({ ...prev, [key]: true }));

    const kind = sourceKinds(current)[inspectedStar];
    const wanted = tool === 'multiband' ? 'cold' : 'variable';
    if (kind === wanted) {
      credit();
    } else {
      setWrongClicks((w) => w + 1);
      setStreak(0);
      setScore((s) => Math.max(0, s - WRONG_LOG_PENALTY));
    }
  }

  latest.current = { handleFind, handleStarClick };

  // Boot Phaser once per tile set.
  useEffect(() => {
    if (!mountRef.current) return;
    const game = createGame(mountRef.current, tiles, {
      onSelect: (i) => setSelected(i),
      onFind: (t, g) => latest.current.handleFind(t, g),
      onStarClick: (t, s) => latest.current.handleStarClick(t, s),
      onEpoch: (e) => setEpoch(e),
    });
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
      sceneRef.current = null;
    };
  }, [tiles]);

  useEffect(() => {
    setInspectedStar(null);
    sceneRef.current?.setSelected(selected);
  }, [selected]);

  useEffect(() => {
    sceneRef.current?.setTool(tool);
  }, [tool]);

  useEffect(() => {
    sceneRef.current?.setBand(band);
  }, [band]);

  useEffect(() => {
    sceneRef.current?.setInspected(inspectedStar ?? -1);
  }, [inspectedStar]);

  // Drop back to Inspect if the active tool is locked. Blink stays available during the tutorial.
  useEffect(() => {
    const tutorialBlink = guideStep !== null && tool === 'blink';
    if (!toolUnlocked(tool, rank) && !tutorialBlink) setTool('inspect');
  }, [rank, tool, guideStep]);

  // Switch to the current quest's tool when a new rank begins.
  useEffect(() => {
    setTool(quest.tool);
  }, [quest.tool]);

  function flagCurrent() {
    if (!current || currentVerdicts) return;
    const steps = verifyFlag(current);
    setFlagged((prev) => ({ ...prev, [current.id]: steps }));
    const v = finalVerdict(steps);
    const isGood = v.status === 'known' || v.status === 'candidate';
    if (isGood) {
      setScore((s) => s + 100);
      setXp((x) => x + 25);
    } else {
      setScore((s) => s + 10);
      setXp((x) => x + 5);
    }
    if (guideStep === 3 && current.id === tiles[TUTORIAL_TILE_INDEX].id) {
      setGuideStep(4);
    }
  }

  // Guide steps advance only on real actions.
  useEffect(() => {
    if (guideStep === 1 && selected >= 0) setGuideStep(2);
    if (guideStep === 2 && tool === 'blink') setGuideStep(3);
    if (guideStep === 4 && verdict) setGuideStep(5);
    if (guideStep === 5 && xp > 0) setGuideStep(6);
    if (guideStep === 6) {
      setGuideStep(null);
      setTutorialDone(true);
    }
  }, [guideStep, selected, tool, verdict, xp]);

  useEffect(() => {
    if (guideStep !== null && guideStep >= 1 && guideStep <= 4 && selected < 0) {
      setSelected(TUTORIAL_TILE_INDEX);
    }
  }, [guideStep, selected]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: p.bg, color: p.text, fontFamily: fonts.ui, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: `1px solid ${p.border}`, background: p.panel }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${p.accent}`, background: `radial-gradient(circle, ${p.accent} 0%, transparent 70%)` }} aria-hidden />
          <strong style={{ letterSpacing: 2, fontFamily: fonts.mono, fontSize: 13 }}>COSMIC DETECTIVE</strong>
          <span style={{ color: p.muted, fontSize: 12, fontFamily: fonts.mono }}>RANK {rank} · {level.title.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['dark', 'light', 'colorblind'] as DisplayMode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} style={btn(p, mode === m)}>
              {m === 'dark' ? 'Night' : m === 'light' ? 'Parchment' : 'Colorblind safe'}
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: 14, padding: 14, flex: 1, minHeight: 0 }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, overflow: 'auto' }}>
          <Brief palette={p} rank={rank} />
          <QuestBar palette={p} quest={quest} found={finds} />
          <RankBar palette={p} xp={xp} rank={rank} tilesReviewed={flaggedCount} />
          <ScoreBar palette={p} score={score} correct={totalFinds} attempts={wrongClicks} streak={streak} />
        </aside>

        <main style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: p.muted, fontSize: 12, fontFamily: fonts.mono }}>
            <span>SKY GRID · {tiles.length} TILES</span>
            <span>{current ? `${current.label} · ${current.coord}` : 'Open a tile to begin'}</span>
          </div>
          <div
            ref={mountRef}
            style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${p.border}`, background: '#06070E' }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {TOOLS.map((t) => {
              const unlocked = toolUnlocked(t.id, rank) || (guideStep !== null && t.id === 'blink');
              return (
                <button
                  key={t.id}
                  onClick={() => unlocked && setTool(t.id)}
                  disabled={!unlocked}
                  aria-pressed={tool === t.id}
                  title={unlocked ? '' : 'Unlocks at a higher rank'}
                  style={{ ...btn(p, tool === t.id), opacity: unlocked ? 1 : 0.4 }}
                >
                  {unlocked ? t.label : `🔒 ${t.label}`}
                </button>
              );
            })}
            {isAnalysisTool && (
              <button
                onClick={logSource}
                disabled={!current || inspectedStar === null || !!logged[`${selected}:${inspectedStar}:${tool}`]}
                style={{ ...btn(p, true, p.pass), marginLeft: 'auto' }}
              >
                Log source
              </button>
            )}
            <button
              onClick={flagCurrent}
              disabled={!current || !!currentVerdicts}
              style={{ ...btn(p, true, p.reject), marginLeft: isAnalysisTool ? 0 : 'auto' }}
            >
              File this lead
            </button>
          </div>
          {tutorialDone && <span style={{ color: p.muted, fontSize: 12 }}>Tutorial complete. Replay from settings.</span>}
        </main>

        <aside style={{ minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tool === 'multiband' && (
            <SpectrumPanel palette={p} spectrum={spectrum} band={band} onBand={setBand} />
          )}
          {tool === 'lightcurve' && (
            <LightCurve palette={p} series={series} epoch={epoch} />
          )}
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
