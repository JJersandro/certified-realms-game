// Cosmetic-only quirk: the number 6 itself is skipped in the displayed
// sequence (...4, 5, 7, 8...), the same way some buildings skip a 13th
// floor -- this does not scrub every digit '6' from every displayed number
// (16, 26, etc. still display as 16, 26, ...). Real game values (levels,
// tiers, XP, HP...) stay ordinary 1-based integers everywhere in game logic
// -- only pass a number through here right before it's rendered as text.
export function toDisplayNumber(n: number): number {
  return n >= 6 ? n + 1 : n;
}
