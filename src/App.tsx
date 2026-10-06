import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Phaser from 'phaser';
import { buildTiles, TUTORIAL_TILE_INDEX, type Tile } from './game/data';
import { verifyFlag, finalVerdict, type Verdict } from './game/verify';
import { createGame } from './game/createGame';
import type { ScannerScene } from './game/scenes/ScannerScene';
import { LEVELS, levelForXp, toolUnlocked, type ToolId } from './game/levels';
import { palettes, fonts, type DisplayMode } from './theme';
import { Brief } from './ui/Brief';
import { RankBar } from './ui/RankBar';
import { ResultPanel } from './ui/ResultPanel';
import { Guide } from './ui/Guide';
import { ScoreBar } from './ui/ScoreBar';

const LEVEL_TILE_COUNT = 12;

export default function App() {
  const [mode, setMode] = useState<DisplayMode>('dark');
  const [tiles] = useState<Tile[]>(() => buildTiles().slice(0, LEVEL_TILE_COUNT));
  const [selected, setSelected] = useState<number>(-1);
  const [tool, setTool] = useState<ToolId>('inspect');
  const [flagged, setFlagged] = useState<Record<string, Verdict[]>>({});
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [guideStep, setGuideStep] = useState<number | null>(0);
  const [tutorialDone, setTutorialDone] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<ScannerScene | null>(null);

  const p = palettes[mode];
  const rank = levelForXp(xp).rank;
  const level = LEVELS.find((l) => l.rank === rank) ?? LEVELS[0];

  // Boot Phaser once.
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

  useEffect(() => {
    sceneRef.current?.setSelected(selected);
  }, [selected]);

  useEffect(() => {
    sceneRef.current?.setTool(tool);
  }, [tool]);

  // If the player's rank drops below the active tool's rank, fall back to Inspect.
  useEffect(() => {
    if (!toolUnlocked(tool, rank)) setTool('inspect');
  }, [rank, tool]);

  const current = selected >= 0 ? tiles[selected] : null;
  const currentVerdicts = current ? flagged[current.id] : undefined;
  const verdict = currentVerdicts ? finalVerdict(currentVerdicts) : null;
  const flaggedCount = Object.keys(flagged).length;

  function flagCurrent() {
    if (!current || currentVerdicts) return;
    const steps = verifyFlag(current);
    setFlagged((prev) => ({ ...prev, [current.id]: steps }));
    const v = finalVerdict(steps);
    const isGood = v.status === 'known' || v.status === 'candidate';

    setAttempts((a) => a + 1);
    if (isGood) {
      setCorrect((c) => c + 1);
      setStreak((s) => s + 1);
      setScore((s) => s + 100 + streak * 10);
      setXp((x) => x + 25);
    } else {
      setStreak(0);
      setScore((s) => s + 10);
      setXp((x) => x + 5);
    }

    if (guideStep === 3 && current.id === tiles[TUTORIAL_TILE_INDEX].id) {
      setGuideStep(4);
    }
  }

  // Guide step transitions driven by real actions.
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

  const tools: { id: ToolId; label: string }[] = [
    { id: 'inspect', label: 'Inspect' },
    { id: 'blink', label: 'Blink' },
    { id: 'difference', label: 'Difference' },
    { id: 'multiband', label: 'Multi-band' },
    { id: 'lightcurve', label: 'Light curve' },
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', background: p.bg, color: p.text,
