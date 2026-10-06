import Phaser from 'phaser';
import type { Tile } from '../data';
import type { ToolId } from '../levels';
import { targetsFor, type Target } from '../finds';
import { bandFlux, epochFlux, EPOCH_COUNT } from '../science';

export interface ScannerEvents {
  onSelect: (index: number) => void;
  onFind: (tileIndex: number, target: Target | null) => void;
  onStarClick: (tileIndex: number, starIndex: number) => void;
  onEpoch: (epoch: number) => void;
}

const ANALYSIS_TOOLS: ToolId[] = ['multiband', 'lightcurve'];
const BAND_TINT = [0xcfe6ff, 0xbfd9ff, 0xf5e6c8, 0xffd29a, 0xffb27a, 0xff9a6a];
const EPOCH_MS = 350;
const MIN_VISIBLE_FLUX = 0.08;
const STAR_PICK_RADIUS = 0.035;

export class ScannerScene extends Phaser.Scene {
  private tiles: Tile[] = [];
  private selectedIndex = -1;
  private inspectedStar = -1;
  private tool: ToolId = 'inspect';
  private band = 0;
  private epoch = 0;
  private epochA: 'A' | 'B' = 'A';
  private blinkTimer?: Phaser.Time.TimerEvent;
  private epochTimer?: Phaser.Time.TimerEvent;
  private gridGfx!: Phaser.GameObjects.Graphics;
  private events_!: ScannerEvents;
  private tileRects: { x: number; y: number; w: number; h: number }[] = [];
  private hints: Target[] = [];
  private foundKeys = new Set<string>();

  constructor() {
    super('ScannerScene');
  }

  init(data: { tiles: Tile[]; events: ScannerEvents }) {
    this.tiles = data.tiles;
    this.events_ = data.events;
  }

  create() {
    this.gridGfx = this.add.graphics();
    this.scale.on('resize', () => this.draw());
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.handlePointer(p));
    this.draw();
  }

  setTool(tool: ToolId) {
    this.tool = tool;

    this.blinkTimer?.remove();
    this.blinkTimer = undefined;
    this.epochTimer?.remove();
    this.epochTimer = undefined;
    this.epochA = 'A';
    this.epoch = 0;

    if (tool === 'blink' || tool === 'difference') {
      this.blinkTimer = this.time.addEvent({
        delay: 700,
        loop: true,
        callback: () => {
          this.epochA = this.epochA === 'A' ? 'B' : 'A';
          this.draw();
        },
      });
    }

    if (tool === 'lightcurve') {
      this.epochTimer = this.time.addEvent({
        delay: EPOCH_MS,
        loop: true,
        callback: () => {
          this.epoch = (this.epoch + 1) % EPOCH_COUNT;
          this.events_.onEpoch(this.epoch);
          this.draw();
        },
      });
    }

    this.refreshHints();
    this.draw();
  }

  setSelected(index: number) {
    this.selectedIndex = index;
    this.inspectedStar = -1;
    this.refreshHints();
    this.draw();
  }

  setBand(band: number) {
    this.band = band;
    this.draw();
  }

  setInspected(starIndex: number) {
    this.inspectedStar = starIndex;
    this.draw();
  }

  /** Marks a click-to-find target as claimed so it can't be scored twice. */
  markFound(tileIndex: number, target: Target) {
    this.foundKeys.add(`${tileIndex}:${target.x.toFixed(3)}:${target.y.toFixed(3)}`);
    this.draw();
  }

  private isAnalysis(): boolean {
    return ANALYSIS_TOOLS.includes(this.tool);
  }

  private refreshHints() {
    const tile = this.tiles[this.selectedIndex];
    this.hints = tile && !this.isAnalysis() ? targetsFor(tile, this.tool) : [];
  }

  private gridDims() {
    const cols = 4;
    const rows = Math.ceil(this.tiles.length / cols);
    const pad = 16;
    const availW = this.scale.width - pad * 2;
    const availH = this.scale.height - pad * 2;
    const cell = Math.min(availW / cols, availH / rows);
    return {
      cols,
      cell,
      ox: (this.scale.width - cell * cols) / 2,
      oy: (this.scale.height - cell * rows) / 2,
    };
  }

  private draw() {
    if (!this.gridGfx || this.tiles.length === 0) return;
    this.gridGfx.clear();
    this.tileRects = [];
    const { cols, cell, ox, oy } = this.gridDims();
    const inset = 6;

    this.tiles.forEach((tile, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = ox + col * cell + inset;
      const y = oy + row * cell + inset;
      const w = cell - inset * 2;
      const h = cell - inset * 2;
      this.tileRects.push({ x, y, w, h });

      const isSel = i === this.selectedIndex;
      this.gridGfx.fillStyle(0x0b0c18, 1);
      this.gridGfx.fillRect(x, y, w, h);
      this.gridGfx.lineStyle(isSel ? 3 : 1, isSel ? 0xd9a441 : 0x2a2b45, 1);
      this.gridGfx.strokeRect(x, y, w, h);

      this.drawTile(tile, i, x, y, w, h, isSel);
    });
  }

  private drawTile(tile: Tile, tileIndex: number, x: number, y: number, w: number, h: number, isSelected: boolean) {
    const g = this.gridGfx;
    const scale = w / 220;
    const analysis = this.isAnalysis();

    if (this.tool === 'multiband') {
      // Each source is drawn at its brightness in the chosen band. Faint
      // sources in short bands are hidden, so the player must switch bands.
      tile.stars.forEach((s, idx) => {
        const f = bandFlux(tile, idx, this.band);
        if (f < MIN_VISIBLE_FLUX) return;
        g.fillStyle(BAND_TINT[this.band], Math.min(1, f));
        g.fillCircle(x + s.x * w, y + s.y * h, s.r * scale);
      });
    } else if (this.tool === 'lightcurve') {
      // Sources pulse with their brightness at the current epoch.
      tile.stars.forEach((s, idx) => {
        const f = Math.max(0, epochFlux(tile, idx, this.epoch));
        g.fillStyle(0xffffff, Math.min(1, f));
        g.fillCircle(x + s.x * w, y + s.y * h, s.r * scale);
      });
    } else {
      tile.stars.forEach((s) => {
        g.fillStyle(0xffffff, s.b);
        g.fillCircle(x + s.x * w, y + s.y * h, s.r * scale);
      });
    }

    if (tile.halo && !analysis) {
      g.fillStyle(0xffe9b0, 0.12);
      g.fillCircle(x + tile.halo.x * w, y + tile.halo.y * h, tile.halo.r * w);
    }

    if (tile.mover && !analysis) {
      const m = tile.mover;
      if (this.tool === 'difference') {
        g.fillStyle(0xd9685a, 0.9);
        g.fillCircle(x + m.from.x * w, y + m.from.y * h, m.r * scale);
        g.fillStyle(0x6fbf8e, 0.9);
        g.fillCircle(x + m.to.x * w, y + m.to.y * h, m.r * scale);
      } else {
        const pos = this.epochA === 'A' ? m.from : m.to;
        g.fillStyle(0xffffff, m.b);
        g.fillCircle(x + pos.x * w, y + pos.y * h, m.r * scale);
      }
    }

    // Ring the inspected source in analysis modes.
    if (analysis && isSelected && this.inspectedStar >= 0) {
      const s = tile.stars[this.inspectedStar];
      if (s) {
        g.lineStyle(1.5, 0xd9a441, 1);
        g.strokeCircle(x + s.x * w, y + s.y * h, 8 * scale);
      }
    }

    // Click-to-find hint rings on the open tile (Ranks 1 to 3).
    if (isSelected && !analysis) {
      for (const t of this.hints) {
        const key = `${tileIndex}:${t.x.toFixed(3)}:${t.y.toFixed(3)}`;
        if (this.foundKeys.has(key)) continue;
        g.lineStyle(1, 0xd9a441, 0.5);
        g.strokeCircle(x + t.x * w, y + t.y * h, 9 * scale);
      }
    }
  }

  private nearestVisibleStar(tile: Tile, nx: number, ny: number): number {
    let best = -1;
    let bestDist = STAR_PICK_RADIUS;
    tile.stars.forEach((s, idx) => {
      if (this.tool === 'multiband' && bandFlux(tile, idx, this.band) < MIN_VISIBLE_FLUX) return;
      const d = Math.hypot(s.x - nx, s.y - ny);
      if (d <= bestDist) {
        bestDist = d;
        best = idx;
      }
    });
    return best;
  }

  private handlePointer(p: Phaser.Input.Pointer) {
    const idx = this.tileRects.findIndex(
      (r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h,
    );
    if (idx < 0) return;

    // Clicking a closed tile opens it.
    if (idx !== this.selectedIndex) {
      this.events_.onSelect(idx);
      return;
    }

    const r = this.tileRects[idx];
    const nx = (p.x - r.x) / r.w;
    const ny = (p.y - r.y) / r.h;

    if (this.isAnalysis()) {
      // Analysis modes: clicking selects a source to inspect (-1 clears it).
      this.events_.onStarClick(idx, this.nearestVisibleStar(this.tiles[idx], nx, ny));
      return;
    }

    const hit = this.hints.find((t) => Math.hypot(t.x - nx, t.y - ny) <= 0.05) ?? null;
    this.events_.onFind(idx, hit);
  }
}
