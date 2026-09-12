import { SKILL_TREE, SKILL_TREE_TRICKLE, SkillEffect, SkillNode } from '../data/skillTreeData';

// Narrow, self-contained state owner (WorldManager-shaped, not a Host
// interface) -- it never needs to call back into FlameScene, only to be
// read from and purchased into by it. Purchases are permanent for the
// session; there is no respec (Phase 11 scope, not a live-balance feature).
export class SkillTreeManager {
  unlocked = false;
  points = 0;
  purchased = new Set<string>();

  // Returns true exactly when this call is the one that transitions
  // unlocked false -> true, so callers (FlameScene) know whether to fire the
  // one-shot 'ui:skillTreeUnlocked' event. Unlocking on *any* positive award
  // -- not just a world-clear one -- is deliberate: since the burn trickle
  // (awardBurnTrickle below) exists specifically to route around the
  // multi-hour wait for a full world clear, gating the ability to *spend*
  // those trickle points behind that same rare event would silently defeat
  // the point of adding them. See skillTreeData.ts's SKILL_TREE_TRICKLE
  // comment and BACKLOG.md's [balance] pacing item for the full reasoning.
  award(amount: number): boolean {
    const wasUnlocked = this.unlocked;
    this.points += amount;
    if(amount > 0) this.unlocked = true;
    return !wasUnlocked && this.unlocked;
  }

  // The Idle-Slayer-style continuous drip: call once per fuel burn (parallel
  // to how a world clear calls award() with its own computed amount) --
  // small and flat rather than scaled to that burn's xpYield, see
  // SKILL_TREE_TRICKLE's comment for why.
  awardBurnTrickle(): boolean {
    return this.award(SKILL_TREE_TRICKLE.pointsPerBurn);
  }

  canAfford(node: SkillNode): boolean {
    return this.unlocked && !this.purchased.has(node.id) && this.points >= node.cost;
  }

  purchase(node: SkillNode): boolean {
    if(!this.canAfford(node)) return false;
    this.points -= node.cost;
    this.purchased.add(node.id);
    return true;
  }

  private sumEffect(effect: SkillEffect): number {
    let total = 0;
    for(const node of SKILL_TREE){
      if(node.effect === effect && this.purchased.has(node.id)) total += node.magnitude;
    }
    return total;
  }

  contactRadiusBonus(){ return this.sumEffect('contactRadius'); }
  heatRiseReductionBonus(){ return this.sumEffect('heatRiseReduction'); }
  stabilityFloorBonus(){ return this.sumEffect('stabilityFloor'); }
  cascadeChanceBonus(){ return this.sumEffect('cascadeChance'); }
  speedBonus(){ return this.sumEffect('speed'); }
  xpYieldBonus(){ return this.sumEffect('xpYield'); }
  pointsYieldBonus(){ return this.sumEffect('pointsYield'); }
}
