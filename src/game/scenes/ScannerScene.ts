import Phaser from 'phaser';
import type { Tile } from '../data';

export interface ScannerEvents {
  onSelect: (index: number) => void;
}

/**
 * Anomaly Scanner: a grid of tiles. Each tile is drawn procedurally from its
 * stars and optional mover/halo. Selection is reported back to React.
 */
export class ScannerScene extends Phaser.Scene {
  private tiles: Tile[] = [];
  private selectedIndex = -1;
  private epoch: 'A' | 'B' = 'A';
  private blink = false;
  private currentEpochLabel: 'A' | 'B' = 'A';
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
    this.scale.on('resize', () => this.layout());
    this.layout();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.handlePointer(p));
  }

  /** Called from React when the player toggles the Blink Comparator. */
  setBlink(on: boolean) {
    this.blink = on;
    this.blinkTimer?.remove();
    if (on) {
      this.blinkTimer = this.time.addEvent({
        delay: 700,
        loop: true,
        callback: () => {
          this.epoch = this.epoch === 'A' ? 'B' : 'A';
          this.draw();
        },
      });
    } else {
      this.epoch = 'A';
      this.draw();
    }
  }

  /** Current epoch shown on screen, for the HUD. */
  getEpochLabel(): 'A' | 'B' {
    return this.currentEpochLabel;
  }

  setSelected(index: number) {
    this.selectedIndex = index;
    this.draw();
  }

  private layout() {
    this.draw();
  }

  private gridDims(): { cols: number; rows: number; cell: number; ox: number; oy: number } {
    const cols = 4;
    const rows = Math.ceil(this.tiles.length / cols);
    const pad = 16;
    const availW = this.scale.width - pad * 2;
    const availH = this.scale.height - pad * 2;
    const cell = Math.min(availW / cols, availH / rows);
    const gridW = cell * cols;
    const gridH = cell * rows;
    return {
      cols,
      rows,
      cell,
      ox: (this.scale.width - gridW) / 2,
      oy: (this.scale.height - gridH) / 2,
    };
  }

  private draw() {
    if (!this.gridGfx || this.tiles.length === 0) return;
    // Only the mover shifts while blinking; the epoch is driven by the timer.
    const showingEpochB = this.blink && this.epoch === 'B';
    this.currentEpochLabel = showingEpochB ? 'B' : 'A';
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

      // Frame
      const isSel = i === this.selectedIndex;
      this.gridGfx.fillStyle(0x0b1220, 1);
      this.gridGfx.fillRect(x, y, w, h);
      this.gridGfx.lineStyle(isSel ? 3 : 1, isSel ? 0xe0a24a : 0x1f2a3d, 1);
      this.gridGfx.strokeRect(x, y, w, h);

      this.drawTile(tile, x, y, w, h);
    });
  }

  private drawTile(tile: Tile, x: number, y: number, w: number, h: number) {
    const g = this.gridGfx;
    // Stars: in epoch B, a stationary star keeps position; only the mover shifts.
    for (const s of tile.stars) {
      const sx = x + s.x * w;
      const sy = y + s.y * h;
      g.fillStyle(0xffffff, s.b);
      g.fillCircle(sx, sy, s.r * (w / 220));
    }
    if (tile.halo) {
      g.fillStyle(0xffe9b0, 0.12);
      g.fillCircle(x + tile.halo.x * w, y + tile.halo.y * h, tile.halo.r * w);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(x + tile.halo.x * w, y + tile.halo.y * h, 2.2 * (w / 220));
    }
    if (tile.mover) {
      const m = tile.mover;
      const pos = this.epoch === 'A' ? m.from : m.to;
      g.fillStyle(0xffffff, m.b);
      g.fillCircle(x + pos.x * w, y + pos.y * h, m.r * (w / 220));
    }
  }

  /** Pointer hit-test against the drawn grid cells. */
  private handlePointer(p: Phaser.Input.Pointer) {
    const idx = this.tileRects.findIndex(
      (r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h,
    );
    if (idx >= 0) this.events_.onSelect(idx);
  }
}
