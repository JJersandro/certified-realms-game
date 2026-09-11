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
    }).setScrollFactor(0).setDepth(10).setAlpha(.6)
      .setInteractive({ useHandCursor: true });
    this.tiltButton.on('pointerdown', () => this.game.events.emit('ui:requestToggleControlMode'));

    // Bottom-center -- bottom-left (TILT) and bottom-right (SKILL TREE) are
    // already taken. Same fixed-screen-position/click-guard pattern as both.
    this.soundButton = this.add.text(this.scale.width / 2, this.scale.height - 32, 'SOUND: ON', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10).setAlpha(.6)
      .setInteractive({ useHandCursor: true });
    this.soundButton.on('pointerdown', () => this.game.events.emit('ui:requestToggleMute'));

    this.skillTreeButton = this.add.text(this.scale.width - 24, this.scale.height - 32, 'SKILL TREE: 0 PTS', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffb347'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10).setAlpha(.6)
      .setInteractive({ useHandCursor: true }).setVisible(false);
    this.skillTreeButton.on('pointerdown', () => {
      this.listOpen = !this.listOpen;
      this.renderSkillTreeLines();
    });

    for(let i = 0; i < SKILL_TREE.length; i++){
      const line = this.add.text(this.scale.width - 24, this.scale.height - 32, '', {
        fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffffff'
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(10)
        .setInteractive({ useHandCursor: true }).setVisible(false);
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
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10).setAlpha(.6)
      .setInteractive({ useHandCursor: true });
    this.settingsButton.on('pointerdown', () => {
      this.settingsOpen = !this.settingsOpen;
      this.renderSettingsLines();
    });

    this.colorblindLine = this.add.text(this.scale.width / 2, 22, 'Colorblind: OFF', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffffff'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10).setAlpha(.6).setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.colorblindLine.on('pointerdown', () => this.game.events.emit('ui:requestToggleColorblind'));

    this.reducedMotionLine = this.add.text(this.scale.width / 2, 22, 'Reduced Motion: OFF', {
      fontFamily:'Inter, sans-serif', fontSize:'11px', color:'#ffffff'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10).setAlpha(.6).setVisible(false)
      .setInteractive({ useHandCursor: true });
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
  };

  onSkillTreeUnlocked = () => {
    this.skillTreeButton.setVisible(true);
  };

  onAudioMuteChanged = ({ label }: { label: string }) => {
    this.soundButton.setText(label);
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
  }

  onSkillTreeChanged = ({ points, nodes }: { points: number; nodes: SkillNodeView[] }) => {
    this.latestPoints = points;
    this.latestNodes = nodes;
    this.skillTreeButton.setText(`SKILL TREE: ${toDisplayNumber(points)} PTS`);
    this.renderSkillTreeLines();
  };

  renderSkillTreeLines(){
    this.latestNodes.forEach((node, i) => {
      const line = this.skillTreeLines[i];
      if(!line) return;
      line.setText(`${node.name} — ${toDisplayNumber(node.cost)}${node.owned ? ' (owned)' : ''}`);
      line.setVisible(this.listOpen);
      line.setAlpha(node.owned ? 0.35 : node.afford ? 0.9 : 0.45);
      line.setColor(node.owned ? '#7fffb0' : node.afford ? '#ffb347' : '#888888');
    });
  }

  // Deliberate narrow exception to the event-only communication rule -- see
  // the comment at the call site in FlameScene.aimAt for the reasoning.
  isPointOverUI(x: number, y: number): boolean {
    if(this.tiltButton.visible && Phaser.Geom.Rectangle.Contains(this.tiltButton.getBounds(), x, y)) return true;
    if(this.soundButton.visible && Phaser.Geom.Rectangle.Contains(this.soundButton.getBounds(), x, y)) return true;
    if(this.skillTreeButton.visible && Phaser.Geom.Rectangle.Contains(this.skillTreeButton.getBounds(), x, y)) return true;
    for(const line of this.skillTreeLines){
      if(line.visible && Phaser.Geom.Rectangle.Contains(line.getBounds(), x, y)) return true;
    }
    if(Phaser.Geom.Rectangle.Contains(this.settingsButton.getBounds(), x, y)) return true;
    if(this.colorblindLine.visible && Phaser.Geom.Rectangle.Contains(this.colorblindLine.getBounds(), x, y)) return true;
    if(this.reducedMotionLine.visible && Phaser.Geom.Rectangle.Contains(this.reducedMotionLine.getBounds(), x, y)) return true;
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
