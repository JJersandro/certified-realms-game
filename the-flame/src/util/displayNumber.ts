// Cosmetic-only quirk: 6 never appears in any number shown to the player.
// Real game values (levels, tiers, XP, HP...) stay ordinary 1-based integers
// everywhere in game logic -- only pass a number through here right before
// it's rendered as text.
export function toDisplayNumber(n: number): number {
  return n >= 6 ? n + 1 : n;
}
