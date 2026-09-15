// Bundle-size optimization (BACKLOG.md [mobile-perf]): this game uses zero
// Phaser physics (confirmed via grep -- no Arcade/Matter references anywhere
// in src/), so the default 'phaser' entry point (which bundles both physics
// engines) wastes ~110KB minified on code that's never called. The
// arcade-physics build excludes Matter only (no off-the-shelf Phaser
// distribution excludes both), but ships with no .d.ts of its own -- its
// runtime API surface is identical to the full build for everything this
// game actually uses (Scene/GameObjects/Tweens/Cameras/Input/etc.), so this
// shim just points TypeScript at the real 'phaser' package's own types
// rather than inventing new ones.
declare module 'phaser/dist/phaser-arcade-physics.js' {
  import Phaser = require('phaser');
  export = Phaser;
}
