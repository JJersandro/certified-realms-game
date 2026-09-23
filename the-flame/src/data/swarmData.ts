// PROGRESSION_QUEUE.md item 9 ("Swarm" analog): every fuel in a cascade
// chain -- the one the flame lit plus everything the chain caught -- burns
// for +xpBonusPerLink XP per fuel caught, capped at maxLinks (so at most
// +50%). Multiplicative with the other XP bonuses (risky ignition, skill
// tree, item 7 focus), like everything else in finishBurn(). Conservative
// starting constants, real balance pass later.
export const SWARM = {
  xpBonusPerLink: 0.10,
  maxLinks: 5
} as const;
