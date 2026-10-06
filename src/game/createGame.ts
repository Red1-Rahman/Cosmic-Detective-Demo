import Phaser from 'phaser';
import { ScannerScene, type ScannerEvents } from './scenes/ScannerScene';
import type { Tile } from './data';

export function createGame(parent: HTMLElement, tiles: Tile[], events: ScannerEvents) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#070910',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [],
    render: { antialias: true },
    audio: { noAudio: true },
  });
  game.events.once(Phaser.Core.Events.READY, () => {
    game.scene.add('ScannerScene', ScannerScene, true, { tiles, events });
  });
  return game;
}

export type { ScannerEvents };
