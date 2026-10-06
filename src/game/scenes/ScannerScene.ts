import Phaser from 'phaser';
import type { Tile } from '../data';
import type { ToolId } from '../levels';
import { targetsFor, type Target } from '../finds';

export interface ScannerEvents {
  onSelect: (index: number) => void;
  onFind: (tileIndex: number, target: Target | null) => void;
}

export class ScannerScene extends Phaser.Scene {
  private tiles: Tile[] = [];
  private selectedIndex = -1;
  private epoch: 'A' | 'B' = 'A';
  private tool: ToolId = 'inspect';
  private blinkTimer?: Phaser.Time.TimerEvent;
  private gridGfx!: Phaser.GameObjects.Graphics;
  private hintGfx!: Phaser.GameObjects.Graphics;
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
    this.hintGfx = this.add.graphics();
    this.scale.on('resize', () => this.draw());
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.handlePointer(p));
    this.draw();
  }

  setTool(tool: ToolId) {
    this.tool = tool;
    this.blinkTimer?.remove();
    this.blinkTimer = undefined;
    this.epoch = 'A';
    if (tool === 'blink' || tool === 'difference') {
      this.blinkTimer = this.time.addEvent({
        delay: 700,
        loop: true,
        callback: () => {
          this.epoch = this.epoch === 'A' ? 'B' : 'A';
          this.draw();
        },
      });
    }
    this.refreshHints();
    this.draw();
  }

  setSelected(index: number) {
    this.selectedIndex = index;
    this.refreshHints();
    this.draw();
  }

  /** Marks a find as already claimed so it can't be scored twice. */
  markFound(tileIndex: number, target: Target) {
    this.foundKeys.add(`${tileIndex}:${target.x.toFixed(3)}:${target.y.toFixed(3)}`);
    this.draw();
  }

  /** Hints are only shown for the open tile and the active tool. */
  private refreshHints() {
    const tile = this.tiles[this.selectedIndex];
    this.hints = tile ? targetsFor(tile, this.tool) : [];
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
    this.hintGfx.clear();
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

      this.drawTile(tile, x, y, w, h, isSel);
    });
  }

  private drawTile(tile: Tile, x: number, y: number, w: number, h: number, isSelected: boolean) {
    const g = this.gridGfx;
    const scale = w / 220;
    const tint = this.tool === 'multiband' ? 0xbfd8ff : 0xffffff;

    for (const s of tile.stars) {
      g.fillStyle(tint, s.b);
      g.fillCircle(x + s.x * w, y + s.y * h, s.r * scale);
    }

    if (tile.halo) {
      g.fillStyle(0xffe9b0, 0.12);
      g.fillCircle(x + tile.halo.x * w, y + tile.halo.y * h, tile.halo.r * w);
    }

    if (tile.mover) {
      const m = tile.mover;
      if (this.tool === 'difference') {
        g.fillStyle(0xd9685a, 0.9);
        g.fillCircle(x + m.from.x * w, y + m.from.y * h, m.r * scale);
        g.fillStyle(0x6fbf8e, 0.9);
        g.fillCircle(x + m.to.x * w, y + m.to.y * h, m.r * scale);
      } else {
        const pos = this.epoch === 'A' ? m.from : m.to;
        g.fillStyle(0xffffff, m.b);
        g.fillCircle(x + pos.x * w, y + pos.y * h, m.r * scale);
      }
    }

    if (this.tool === 'lightcurve') {
      g.lineStyle(1, 0xd9a441, 0.9);
      g.beginPath();
      for (let i = 0; i <= 20; i++) {
        const px = x + (i / 20) * w;
        const py = y + h * 0.9 - Math.sin(i * 0.6 + tile.seed) * h * 0.05;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.strokePath();
    }

    // Hint rings only on the open tile, so the player has to look for them.
    if (isSelected) {
      const tileIndex = this.tiles.indexOf(tile);
      for (const t of this.hints) {
        const key = `${tileIndex}:${t.x.toFixed(3)}:${t.y.toFixed(3)}`;
        if (this.foundKeys.has(key)) continue;
        this.hintGfx.lineStyle(1, 0xd9a441, 0.5);
        this.hintGfx.strokeCircle(x + t.x * w, y + t.y * h, 9 * scale);
      }
    }
  }

  private handlePointer(p: Phaser.Input.Pointer) {
    const idx = this.tileRects.findIndex(
      (r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h,
    );
    if (idx < 0) return;

    const r = this.tileRects[idx];
    // Clicking a tile that isn't open just opens it.
    if (idx !== this.selectedIndex) {
      this.events_.onSelect(idx);
      return;
    }
    // Clicking the open tile checks for a target under the pointer.
    const nx = (p.x - r.x) / r.w;
    const ny = (p.y - r.y) / r.h;
    const hit = this.hints.find(
      (t) => Math.hypot(t.x - nx, t.y - ny) <= 0.05,
    ) ?? null;
    this.events_.onFind(idx, hit);
  }
}
