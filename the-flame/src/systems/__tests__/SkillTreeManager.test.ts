import { describe, it, expect } from 'vitest';
import { SkillTreeManager } from '../SkillTreeManager';
import { SKILL_TREE, SKILL_TREE_TRICKLE } from '../../data/skillTreeData';

describe('SkillTreeManager.award', () => {
  it('unlocks on the first positive award and returns true only that once', () => {
    const tree = new SkillTreeManager();
    expect(tree.unlocked).toBe(false);
    expect(tree.award(1)).toBe(true);
    expect(tree.unlocked).toBe(true);
    expect(tree.award(5)).toBe(false); // already unlocked -- no second transition
  });

  it('does not unlock on a zero or negative amount', () => {
    const tree = new SkillTreeManager();
    expect(tree.award(0)).toBe(false);
    expect(tree.unlocked).toBe(false);
  });

  it('accumulates points across multiple awards', () => {
    const tree = new SkillTreeManager();
    tree.award(3);
    tree.award(4);
    expect(tree.points).toBe(7);
  });
});

describe('SkillTreeManager.awardBurnTrickle', () => {
  it('awards exactly SKILL_TREE_TRICKLE.pointsPerBurn', () => {
    const tree = new SkillTreeManager();
    tree.awardBurnTrickle();
    expect(tree.points).toBe(SKILL_TREE_TRICKLE.pointsPerBurn);
  });

  it('unlocks the tree on the first trickle, same as a world-clear award', () => {
    const tree = new SkillTreeManager();
    expect(tree.awardBurnTrickle()).toBe(true);
    expect(tree.unlocked).toBe(true);
  });
});

describe('SkillTreeManager.canAfford / purchase', () => {
  it('requires the tree to be unlocked first', () => {
    const tree = new SkillTreeManager();
    tree.points = 999;
    expect(tree.canAfford(SKILL_TREE[0])).toBe(false);
  });

  it('cannot afford a node costing more than current points', () => {
    const tree = new SkillTreeManager();
    tree.award(1);
    const expensive = [...SKILL_TREE].sort((a, b) => b.cost - a.cost)[0];
    expect(tree.canAfford(expensive)).toBe(false);
  });

  it('purchase deducts cost, marks purchased, and cannot be bought twice', () => {
    const tree = new SkillTreeManager();
    const node = SKILL_TREE[0];
    tree.award(node.cost);
    expect(tree.purchase(node)).toBe(true);
    expect(tree.points).toBe(0);
    expect(tree.purchased.has(node.id)).toBe(true);
    expect(tree.purchase(node)).toBe(false); // already owned
  });

  it('purchase fails and leaves state unchanged when unaffordable', () => {
    const tree = new SkillTreeManager();
    tree.award(1);
    const node = SKILL_TREE.find(n => n.cost > 1)!;
    expect(tree.purchase(node)).toBe(false);
    expect(tree.points).toBe(1);
    expect(tree.purchased.has(node.id)).toBe(false);
  });
});

describe('SkillTreeManager bonus getters', () => {
  it('sum magnitudes only from purchased nodes matching the effect', () => {
    const tree = new SkillTreeManager();
    const xpNode = SKILL_TREE.find(n => n.effect === 'xpYield')!;
    tree.award(xpNode.cost);
    tree.purchase(xpNode);
    expect(tree.xpYieldBonus()).toBeCloseTo(xpNode.magnitude);
    expect(tree.cascadeChanceBonus()).toBe(0); // nothing purchased for this effect
  });

  it('every node maps to exactly one known effect getter', () => {
    // Regression guard: if skillTreeData.ts ever adds a node with a new
    // SkillEffect value, this fails loudly instead of the bonus silently
    // never being summed anywhere.
    const knownEffects = new Set([
      'contactRadius', 'heatRiseReduction', 'stabilityFloor',
      'cascadeChance', 'speed', 'xpYield', 'pointsYield'
    ]);
    for(const node of SKILL_TREE){
      expect(knownEffects.has(node.effect)).toBe(true);
    }
  });
});
