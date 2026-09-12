import Phaser from 'phaser';
import { toDisplayNumber } from '../util/displayNumber';
import { SKILL_TREE } from '../data/skillTreeData';

type SkillNodeView = {
  id: string;
  name: string;
  cost: number;
  owned: boolean;
  afford: boolean;
};

// Every HUD button/line here is 11px text with no padding -- an actual
// measured tap target of roughly 12px tall, well under the ~44px minimum
// mobile guidance calls for. Rather than growing the font (which would
// force a whole HUD relayout), every tappable text gets an invisible
// padded hit area this many px larger on each side, applied identically
// to both the interactive hitArea (so it's actually easier to tap) and
// the click-guard bounds in isPointOverUI (so a tap inside the padding
// is excluded from steering the flame too -- both must agree on the same
// region or a tap near a button's edge would both hit it AND steer).
const TAP_PAD_X = 16;
const TAP_PAD_Y = 16;

// flame-balance-tuner finding (2026-09-12): TAP_PAD_Y=16 gives every
// standalone button (TILT/SOUND) a generous, non-overlapping ~44px target
// since nothing else sits within that radius of them. It does NOT work for
// any *vertically stacked list* (the skill tree button + its 7 lines, 18px
// apart; the settings button + its 2 lines, 20px apart) -- a 16px pad on
// both sides of two neighbors only 18-20px apart makes their padded hit
// boxes overlap by ~26px, so a real tap square in the middle of one line's
// own visible text can still resolve to a *different* line's (or the
// button's) pointerdown handler. Confirmed via `scene.input.hitTestPointer()`
// and a real click that purchased 'kindling-heart' while aimed at 'Ember
// Reach' text. This smaller pad is sized to the tightest gap in either list
// (18px pitch - ~12px text height = 6px gap => pad*2 <= 6) with a 2px safety
// margin against font-metric rounding, so adjacent padded boxes in a list
// never touch. This does make those specific targets smaller than the
// ~44px mobile-tap guidance the comment above already flags as an existing
// shortfall -- widening the list's own row pitch instead (a layout change,
// not a numeric-constant one) is the real fix for that and is flagged to
// BACKLOG.md's [visual]/[mobile-perf] sections rather than done here.
const LIST_TAP_PAD_Y = 2;

// Phase 12: all manually-positioned HUD chrome lives here now, running in
// parallel with FlameScene ('flame'). FlameScene pushes state changes via
// this.game.events ('ui:*' events); this scene pushes user intent back the
// same way ('ui:request*' events) and lets FlameScene own the actual
// mutation. The one exception is the skill-tree list open/closed toggle,
// which has no gameplay effect and is handled entirely locally.
export class UIScene extends Phaser.Scene {
  title!: Phaser.GameObjects.Text;
  subtitle!: Phaser.GameObjects.Text;
  stageLabel!: Phaser.GameObjects.Text;
  levelLabel!: Phaser.GameObjects.Text;
  tiltButton!: Phaser.GameObjects.Text;
  soundButton!: Phaser.GameObjects.Text;
  skillTreeButton!: Phaser.GameObjects.Text;
  skillTreeLines: Phaser.GameObjects.Text[] = [];
  // Phase 14: top-center is the one open fixed HUD position -- top-left has
  // title/subtitle, top-right has stage/level. Same bare-bones
  // button-toggles-a-list pattern as the skill tree button/lines below,
  // just with exactly two always-visible lines (no owned/afford states).
  settingsButton!: Phaser.GameObjects.Text;
  colorblindLine!: Phaser.GameObjects.Text;
  reducedMotionLine!: Phaser.GameObjects.Text;

  listOpen = false;
  latestPoints = 0;
  latestNodes: SkillNodeView[] = [];
  settingsOpen = false;
  colorblindOn = false;
  reducedMotionOn = false;

  constructor(){ super('ui'); }

  // Replaces the bare `.setInteractive({ useHandCursor: true })` calls --
  // the hitArea is in the object's own local space (0,0 at its top-left
  // before origin is applied), so padding it out symmetrically enlarges
  // the tappable region without moving the visible text at all.
  //
  // flame-balance-tuner finding (2026-09-12): every caller of this method
  // re-invokes it whenever an object's text (and therefore obj.width)
  // changes, on the assumption that setInteractive() picks up the new,
  // wider-or-narrower hitArea. It doesn't: Phaser's InputPlugin.enable()
  // (what GameObject.setInteractive() delegates to) only calls setHitArea()
  // the *first* time a Game Object is made interactive -- every subsequent
  // call with an already-interactive object just flips `.input.enabled`
  // back to true and silently keeps whatever hitArea was built at that
  // first call. Every skillTreeLine is created with empty text (''), so
  // its real, frozen-forever hit area was a ~0-width box anchored at the
  // line's origin corner -- nowhere near where the line's actual rendered
  // text (set moments later, and every time afterward) visually sits. That
  // made a real click on a skill-tree line's own visible text area silently
  // miss every time (confirmed via `scene.input.hitTestPointer()` returning
  // zero hits at the line's own getBounds() center) -- skill point purchases
  // were unclickable in practice before this fix, not just when this trickle
  // change made points reachable in a short session. The fix: once an
  // object is already interactive, update its existing hitArea in place
  // instead of relying on setInteractive() to rebuild it.
  private makeTappable(obj: Phaser.GameObjects.Text, padY: number = TAP_PAD_Y){
    const hitArea = new Phaser.Geom.Rectangle(
      -TAP_PAD_X, -padY, obj.width + TAP_PAD_X * 2, obj.height + padY * 2
    );
    if(obj.input){
      obj.input.hitArea = hitArea;
    } else {
      obj.setInteractive({ hitArea, hitAreaCallback: Phaser.Geom.Rectangle.Contains, useHandCursor: true });
    }
  }

  // Same padding, but in screen space (matching getBounds()) for the
  // click-guard in isPointOverUI -- must stay in sync with makeTappable
  // above, or a tap landing in the padding would both hit the button and
  // fall through to steer the flame underneath it. padY must match
  // whatever the same object's makeTappable() call used.
  private paddedBounds(obj: Phaser.GameObjects.Text, padY: number = TAP_PAD_Y): Phaser.Geom.Rectangle {
    const b = obj.getBounds();
    return new Phaser.Geom.Rectangle(b.x - TAP_PAD_X, b.y - padY, b.width + TAP_PAD_X * 2, b.height + padY * 2);
  }

  create(){
    this.title = this.add.text(24, 22, 'THE FLAME', {
      fontFamily:'Inter, sans-serif', fontSize:'12px', color:'#ffffff'
    }).setScrollFactor(0).setDepth(10).setAlpha(.72);

    this.subtitle = this.add.text(24, 43, 'move • touch • burn • grow', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffffff'
    }).setScrollFactor(0).setDepth(10).setAlpha(.34);

    this.stageLabel = this.add.text(this.scale.width - 24, 22, 'SPARK', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10).setAlpha(.65);

    this.levelLabel = this.add.text(this.scale.width - 24, 43, `LV ${toDisplayNumber(1)}`, {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10).setAlpha(.5);

    this.tiltButton = this.add.text(24, this.scale.height - 32, 'TILT: OFF', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347'
    }).setScrollFactor(0).setDepth(10).setAlpha(.6);
    this.makeTappable(this.tiltButton);
    this.tiltButton.on('pointerdown', () => this.game.events.emit('ui:requestToggleControlMode'));

    // Bottom-center -- bottom-left (TILT) and bottom-right (SKILL TREE) are
    // already taken. Same fixed-screen-position/click-guard pattern as both.
    this.soundButton = this.add.text(this.scale.width / 2, this.scale.height - 32, 'SOUND: ON', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10).setAlpha(.6);
    this.makeTappable(this.soundButton);
    this.soundButton.on('pointerdown', () => this.game.events.emit('ui:requestToggleMute'));

    this.skillTreeButton = this.add.text(this.scale.width - 24, this.scale.height - 32, 'SKILL TREE: 0 PTS', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10).setAlpha(.6).setVisible(false);
    this.makeTappable(this.skillTreeButton, LIST_TAP_PAD_Y);
    this.skillTreeButton.on('pointerdown', () => {
      this.listOpen = !this.listOpen;
      this.renderSkillTreeLines();
    });

    for(let i = 0; i < SKILL_TREE.length; i++){
      const line = this.add.text(this.scale.width - 24, this.scale.height - 32, '', {
        fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffffff'
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(10).setVisible(false);
      this.makeTappable(line, LIST_TAP_PAD_Y);
      // nodeId is bound after the first 'ui:skillTreeChanged' event arrives
      // (see renderSkillTreeLines) -- the listener reads it fresh each time
      // via this.latestNodes rather than being rebuilt per-node.
      const index = i;
      line.on('pointerdown', () => {
        const node = this.latestNodes[index];
        if(node) this.game.events.emit('ui:requestPurchase', { nodeId: node.id });
      });
      this.skillTreeLines.push(line);
    }

    this.settingsButton = this.add.text(this.scale.width / 2, 22, 'SETTINGS', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10).setAlpha(.6);
    this.makeTappable(this.settingsButton, LIST_TAP_PAD_Y);
    this.settingsButton.on('pointerdown', () => {
      this.settingsOpen = !this.settingsOpen;
      this.renderSettingsLines();
    });

    this.colorblindLine = this.add.text(this.scale.width / 2, 22, 'Colorblind: OFF', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffffff'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10).setAlpha(.6).setVisible(false);
    this.makeTappable(this.colorblindLine, LIST_TAP_PAD_Y);
    this.colorblindLine.on('pointerdown', () => this.game.events.emit('ui:requestToggleColorblind'));

    this.reducedMotionLine = this.add.text(this.scale.width / 2, 22, 'Reduced Motion: OFF', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffffff'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10).setAlpha(.6).setVisible(false);
    this.makeTappable(this.reducedMotionLine, LIST_TAP_PAD_Y);
    this.reducedMotionLine.on('pointerdown', () => this.game.events.emit('ui:requestToggleReducedMotion'));

    this.layout();

    this.game.events.on('ui:levelChanged', this.onLevelChanged, this);
    this.game.events.on('ui:controlModeChanged', this.onControlModeChanged, this);
    this.game.events.on('ui:skillTreeUnlocked', this.onSkillTreeUnlocked, this);
    this.game.events.on('ui:skillTreeChanged', this.onSkillTreeChanged, this);
    this.game.events.on('ui:audioMuteChanged', this.onAudioMuteChanged, this);
    this.game.events.on('ui:colorblindChanged', this.onColorblindChanged, this);
    this.game.events.on('ui:reducedMotionChanged', this.onReducedMotionChanged, this);

    this.scale.on('resize', () => this.layout());

    this.events.once('shutdown', () => {
      this.game.events.off('ui:levelChanged', this.onLevelChanged, this);
      this.game.events.off('ui:controlModeChanged', this.onControlModeChanged, this);
      this.game.events.off('ui:skillTreeUnlocked', this.onSkillTreeUnlocked, this);
      this.game.events.off('ui:skillTreeChanged', this.onSkillTreeChanged, this);
      this.game.events.off('ui:audioMuteChanged', this.onAudioMuteChanged, this);
      this.game.events.off('ui:colorblindChanged', this.onColorblindChanged, this);
      this.game.events.off('ui:reducedMotionChanged', this.onReducedMotionChanged, this);
    });
  }

  onLevelChanged = ({ level, stageName }: { level: number; stageName: string }) => {
    this.levelLabel.setText(`LV ${toDisplayNumber(level)}`);
    this.stageLabel.setText(stageName);
  };

  onControlModeChanged = ({ label }: { label: string }) => {
    this.tiltButton.setText(label);
    this.makeTappable(this.tiltButton);
  };

  onSkillTreeUnlocked = () => {
    this.skillTreeButton.setVisible(true);
  };

  onAudioMuteChanged = ({ label }: { label: string }) => {
    this.soundButton.setText(label);
    this.makeTappable(this.soundButton);
  };

  onColorblindChanged = ({ on }: { on: boolean }) => {
    this.colorblindOn = on;
    this.renderSettingsLines();
  };

  onReducedMotionChanged = ({ on }: { on: boolean }) => {
    this.reducedMotionOn = on;
    this.renderSettingsLines();
  };

  renderSettingsLines(){
    this.colorblindLine.setText(`Colorblind: ${this.colorblindOn ? 'ON' : 'OFF'}`).setVisible(this.settingsOpen);
    this.reducedMotionLine.setText(`Reduced Motion: ${this.reducedMotionOn ? 'ON' : 'OFF'}`).setVisible(this.settingsOpen);
    // ON/OFF differ in width by a few px -- keep the padded hit area exact.
    this.makeTappable(this.colorblindLine, LIST_TAP_PAD_Y);
    this.makeTappable(this.reducedMotionLine, LIST_TAP_PAD_Y);
  }

  onSkillTreeChanged = ({ points, nodes }: { points: number; nodes: SkillNodeView[] }) => {
    this.latestPoints = points;
    this.latestNodes = nodes;
    this.skillTreeButton.setText(`SKILL TREE: ${toDisplayNumber(points)} PTS`);
    this.makeTappable(this.skillTreeButton, LIST_TAP_PAD_Y);
    this.renderSkillTreeLines();
  };

  renderSkillTreeLines(){
    this.latestNodes.forEach((node, i) => {
      const line = this.skillTreeLines[i];
      if(!line) return;
      line.setText(`${node.name} — ${toDisplayNumber(node.cost)}${node.owned ? ' (owned)' : ''}`);
      // Text length varies per node/state, so the padded hit area (sized
      // off obj.width at makeTappable-call time) needs recomputing every
      // time the text actually changes -- it started at width 0 (line was
      // created with empty text) and would otherwise stay wrong forever.
      // LIST_TAP_PAD_Y (not the default TAP_PAD_Y), see that constant's
      // comment -- these lines are only 18px apart, too tight for the
      // standalone-button padding without adjacent hit areas overlapping.
      this.makeTappable(line, LIST_TAP_PAD_Y);
      line.setVisible(this.listOpen);
      line.setAlpha(node.owned ? 0.35 : node.afford ? 0.9 : 0.45);
      line.setColor(node.owned ? '#7fffb0' : node.afford ? '#ffb347' : '#888888');
    });
  }

  // Deliberate narrow exception to the event-only communication rule -- see
  // the comment at the call site in FlameScene.aimAt for the reasoning.
  isPointOverUI(x: number, y: number): boolean {
    if(this.tiltButton.visible && Phaser.Geom.Rectangle.Contains(this.paddedBounds(this.tiltButton), x, y)) return true;
    if(this.soundButton.visible && Phaser.Geom.Rectangle.Contains(this.paddedBounds(this.soundButton), x, y)) return true;
    if(this.skillTreeButton.visible && Phaser.Geom.Rectangle.Contains(this.paddedBounds(this.skillTreeButton, LIST_TAP_PAD_Y), x, y)) return true;
    for(const line of this.skillTreeLines){
      if(line.visible && Phaser.Geom.Rectangle.Contains(this.paddedBounds(line, LIST_TAP_PAD_Y), x, y)) return true;
    }
    if(Phaser.Geom.Rectangle.Contains(this.paddedBounds(this.settingsButton, LIST_TAP_PAD_Y), x, y)) return true;
    if(this.colorblindLine.visible && Phaser.Geom.Rectangle.Contains(this.paddedBounds(this.colorblindLine, LIST_TAP_PAD_Y), x, y)) return true;
    if(this.reducedMotionLine.visible && Phaser.Geom.Rectangle.Contains(this.paddedBounds(this.reducedMotionLine, LIST_TAP_PAD_Y), x, y)) return true;
    return false;
  }

  layout(){
    this.stageLabel.setPosition(this.scale.width - 24, 22);
    this.levelLabel.setPosition(this.scale.width - 24, 43);
    this.tiltButton.setPosition(24, this.scale.height - 32);
    this.soundButton.setPosition(this.scale.width / 2, this.scale.height - 32);
    this.skillTreeButton.setPosition(this.scale.width - 24, this.scale.height - 32);
    for(let i = 0; i < this.skillTreeLines.length; i++){
      const fromBottom = this.skillTreeLines.length - i;
      this.skillTreeLines[i].setPosition(this.scale.width - 24, this.scale.height - 32 - fromBottom * 18);
    }
    this.settingsButton.setPosition(this.scale.width / 2, 22);
    this.colorblindLine.setPosition(this.scale.width / 2, 22 + 20);
    this.reducedMotionLine.setPosition(this.scale.width / 2, 22 + 40);
  }
}
