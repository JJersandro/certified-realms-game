import { MATTER } from '../data/matterData';
import { MASTERY } from '../data/masteryData';
import { FOCUS } from '../data/focusData';

// PROGRESSION_QUEUE.md item 3: Mastery domain counters -- tracking-only for
// now, no thresholds/rewards/UI yet (those are items 4/10/11). Narrow,
// constructor-independent state object, SkillTreeManager-shaped: no Host
// dependency, no callback into FlameScene -- FlameScene (and, for the three
// counters that need a real gameplay hook, MatterRegistry's existing Host
// callback pattern) calls straight into these record*/add* methods at the
// exact point each thing becomes true, the same way SkillTreeManager.award()
// is called at the exact point points are actually earned.
//
// Per progressionDomainsData.ts's Mastery entry: these track what the flame
// has actually *done* during play, not anything it has accumulated (energy/
// points already cover that -- see the Economy entry there).
export class MasteryTracker {
  // One counter per MATTER tier, indexed by (tier.id - 1) so array order
  // matches MATTER's own declared order (kindling..embercore) rather than a
  // separate hand-maintained mapping. Length is MATTER.length (7) by
  // construction, not a hardcoded literal, so this can't silently drift out
  // of sync if a tier is ever added/removed.
  burnsPerTier: number[] = new Array(MATTER.length).fill(0);

  // Count of cascade *events*, not fuels caught: incremented once per
  // ignition (direct contact or a successful risky-ignition hold) whose
  // resulting MatterRegistry.tryCascade() call caught at least one further
  // fuel -- not once per fuel a chain catches, and not once per recursive
  // continuation within the same chain. See MatterRegistry.tryCascade's
  // comment for exactly where this is decided.
  cascadesTriggered = 0;

  // Incremented at the exact point CHOICES.riskyIgnition's hold-to-force
  // mechanic (MatterRegistry.updateFuel) is already known to have succeeded
  // (fuel.forceProgress crosses holdMs and the forced ignition actually
  // fires) -- "survived" here means "completed," not "avoided a failure
  // state," since the risky-ignition mechanic has no separate fail
  // condition today (releasing contact early just resets forceProgress to 0
  // with no penalty, so there is nothing to "survive" there).
  riskyIgnitionsSurvived = 0;

  // A separate counter from FlameScene.worldsCleared -- that field drives
  // ENDGAME's escalation formula (first-clear vs. random-range multiplier)
  // and is not itself a Mastery concept; this one exists purely for the
  // Mastery domain's own future threshold rewards, even though both
  // increment at the same real-world moment (WorldManager's regenerate()
  // path via FlameScene.checkWorldConsumed()).
  worldsCleared = 0;

  // Cumulative scalar path length in world pixels, not displacement --
  // moving out and back to the same spot adds distance both ways, matching
  // "distance traveled" rather than "distance from start."
  distanceTraveled = 0;

  // PROGRESSION_QUEUE.md item 4: first Mastery Point earn condition. Plain
  // count, not a currency object -- items 10/11/12 (spending it) are their
  // own separate, later, one-at-a-time items.
  masteryPoints = 0;

  // PROGRESSION_QUEUE.md item 7: tier ids of the last
  // FOCUS.recentBurnWindow completed burns, oldest first -- the only input
  // to focusedTierId() below.
  recentBurnTiers: number[] = [];

  // tierId is MatterTier.id (1..MATTER.length), matching a burned fuel's
  // own fuel.tier.id -- guarded so an out-of-range id (shouldn't happen,
  // but this is the one place a bad id could silently grow/misindex the
  // array) is a no-op instead of throwing or corrupting a neighboring
  // counter.
  recordBurn(tierId: number){
    const index = tierId - 1;
    if(index < 0 || index >= this.burnsPerTier.length) return;
    this.burnsPerTier[index]++;

    // Item 4's own "the first time a threshold is crossed" wording, not
    // "every N burns" -- burnsPerTier only ever increments by exactly 1
    // here, so checking equality (not >=) fires exactly once, the instant
    // the threshold is crossed, with no separate "already awarded" flag
    // needed.
    if(index === 0 && this.burnsPerTier[0] === MASTERY.kindlingBurnThreshold){
      this.masteryPoints += MASTERY.kindlingBurnReward;
    }

    this.recentBurnTiers.push(tierId);
    if(this.recentBurnTiers.length > FOCUS.recentBurnWindow) this.recentBurnTiers.shift();
  }

  // Item 7 ("Hunter" analog): the tier burned most within the recent
  // window, recomputed on every call (never cached) so it tracks what the
  // player is hunting right now. Strict > while scanning ascending means a
  // tie goes to the lowest tier id. null until the first burn -- no focus
  // is earned before the flame has burned anything.
  focusedTierId(): number | null {
    if(this.recentBurnTiers.length === 0) return null;
    const counts = new Array(MATTER.length).fill(0);
    for(const tierId of this.recentBurnTiers) counts[tierId - 1]++;
    let best = 0;
    for(let i = 1; i < counts.length; i++){
      if(counts[i] > counts[best]) best = i;
    }
    return best + 1;
  }

  recordCascadeTriggered(){
    this.cascadesTriggered++;
  }

  recordRiskyIgnitionSurvived(){
    this.riskyIgnitionsSurvived++;
  }

  recordWorldCleared(){
    this.worldsCleared++;
  }

  // Guards against a negative/NaN delta silently corrupting a counter
  // that's meant to only ever grow -- a caller passing raw
  // Phaser.Math.Distance.Between output can never produce a negative value
  // in practice, but this keeps the invariant explicit rather than assumed.
  addDistance(delta: number){
    if(!(delta > 0)) return;
    this.distanceTraveled += delta;
  }
}
