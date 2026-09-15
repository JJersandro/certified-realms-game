import Phaser from 'phaser/dist/phaser-arcade-physics.js';
import { FLAME_VISUAL } from '../data/flameVisualData';

// Phase 15: minimal title/start screen, first in the game config's scene
// array so it auto-starts and boots before anything else runs (Phaser only
// auto-starts index 0 of a scene array -- see SceneManager.add). 'flame' and
// 'ui' are still instantiated at Game boot (their class fields run), but
// neither scene's create() executes until this screen hands off via
// this.scene.start('flame') -- so no gameplay simulates or renders a single
// frame until the player taps through. Deliberately no restart/replay logic
// anywhere in this scene or the game: once 'flame' starts, the session runs
// continuously exactly as it always has (a browser refresh is how a player
// starts over).
export class TitleScene extends Phaser.Scene {
  titleText!: Phaser.GameObjects.Text;
  promptText!: Phaser.GameObjects.Text;
  glowCircle!: Phaser.GameObjects.Arc;

  constructor(){ super('title'); }

  create(){
    this.cameras.main.setBackgroundColor('#080604');

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Small, cheap atmospheric touch -- one soft pulsing circle with the
    // same Phaser postFX Glow API Phase 14 introduced. This is a title
    // card, not a second flame preview, so nothing else (ribbons,
    // particles, palette blending) is reproduced here.
    this.glowCircle = this.add.circle(cx, cy, 46, FLAME_VISUAL.palette.orange, 0.16).setDepth(1);
    this.glowCircle.postFX?.addGlow(FLAME_VISUAL.palette.orange, 0, 1.2, false, 0.1, 14);

    this.titleText = this.add.text(cx, cy - 34, 'THE FLAME', {
      fontFamily: 'Inter, sans-serif', fontSize: '34px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(2).setAlpha(0.92);

    this.promptText = this.add.text(cx, cy + 30, 'tap to begin', {
      fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#ffb347'
    }).setOrigin(0.5).setDepth(2).setAlpha(0.55);

    this.tweens.add({
      targets: this.glowCircle,
      scale: { from: 0.9, to: 1.15 },
      alpha: { from: 0.16, to: 0.26 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.tweens.add({
      targets: this.promptText,
      alpha: { from: 0.32, to: 0.72 },
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    this.input.once('pointerdown', () => {
      // The title tap is the session's actual first user gesture, so
      // unlocking audio here (rather than relying solely on the player's
      // first in-game pointer move) means the ambient drone is audible from
      // the moment gameplay begins. AudioManager is constructed as a class
      // field on FlameScene, so the instance already exists at this point
      // (Phaser instantiates every configured scene at boot -- only this
      // scene's create() runs immediately, see the comment above) even
      // though FlameScene.create() itself hasn't run yet. FlameScene's own
      // unlock() call in its pointerdown handler (Phase 13) still fires too
      // once gameplay starts -- unlock() is idempotent, so this is
      // deliberately redundant rather than a restructuring.
      const flame = this.scene.get('flame') as Phaser.Scene & { audio?: { unlock: () => void } };
      flame.audio?.unlock();
      this.scene.start('flame');
    });

    this.scale.on('resize', () => this.layout());
  }

  layout(){
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.glowCircle.setPosition(cx, cy);
    this.titleText.setPosition(cx, cy - 34);
    this.promptText.setPosition(cx, cy + 30);
  }
}
