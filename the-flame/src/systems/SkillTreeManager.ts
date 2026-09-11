import { SKILL_TREE, SkillEffect, SkillNode } from '../data/skillTreeData';

// Narrow, self-contained state owner (WorldManager-shaped, not a Host
// interface) -- it never needs to call back into FlameScene, only to be
// read from and purchased into by it. Purchases are permanent for the
// session; there is no respec (Phase 11 scope, not a live-balance feature).
export class SkillTreeManager {
  unlocked = false;
  points = 0;
  purchased = new Set<string>();

  award(amount: number){
    this.points += amount;
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
