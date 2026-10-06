import Phaser from 'phaser';
import type { Tile } from '../data';
import type { ToolId } from '../levels';

export interface ScannerEvents {
  onSelect: (index: number) => void;
}

/**
 * Anomaly Scanner. Each tool changes only how the tile is shown:
 * - inspect: single epoch, no overlay
 * - blink: alternates epochs
 * - difference: shows only the mover's change
 * - multiband: tints by simulated band (presentation only)
 * - lightcurve: shows a brightness readout (presentation only)
 * Selection and flagging are unchanged across all tools.
 */
export class ScannerScene extends Phaser.Scene {
  private tiles: Tile[] = [];
  private selectedIndex = -1;
  private epoch: 'A' | 'B' = 'A';
  private tool: ToolId = 'inspect';
  private blinkTimer?: Phaser.Time.TimerEvent;
  private gridGfx!: Phaser.GameObjects.Graphics;
  private events_!: ScannerEvents;
  private tileRects: { x: number; y: number; w: number; h: number }[] = [];

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

  /** Called from React when the active tool changes. */
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
    this.draw();
  }

  setSelected(index: number) {
    this.selectedIndex = index;
    this.draw();
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

      this.drawTile(tile, x, y, w, h);
    });
  }

  private drawTile(tile: Tile, x: number, y: number, w: number, h: number) {
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
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(x + tile.halo.x * w, y + tile.halo.y * h, 2.2 * scale);
    }

    if (tile.mover) {
      const m = tile.mover;
      if (this.tool === 'difference') {
        // Show only the change: the "from" and "to" points, with the static field removed.
        const from = m.from;
        const to = m.to;
        g.fillStyle(0xd9685a, 0.9);
        g.fillCircle(x + from.x * w, y + from.y * h, m.r * scale);
        g.fillStyle(0x6fbf8e, 0.9);
        g.fillCircle(x + to.x * w, y + to.y * h, m.r * scale);
      } else {
        const pos = this.epoch === 'A' ? m.from : m.to;
        g.fillStyle(0xffffff, m.b);
        g.fillCircle(x + pos.x * w, y + pos.y * h, m.r * scale);
      }
    }

    if (this.tool === 'lightcurve') {
      // Simple brightness trace in the tile's lower strip.
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
  }

  private handlePointer(p: Phaser.Input.Pointer) {
    const idx = this.tileRects.findIndex(
      (r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h,
    );
    if (idx >= 0) this.events_.onSelect(idx);
  }
}
