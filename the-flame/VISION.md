# The Flame -- vision & standing direction

This file exists because reactive bug-fixing (see `BACKLOG.md`) does not by itself guarantee
the game matches what it's actually supposed to be. `BACKLOG.md` tracks "found something
broken/thin, fixed it." This file tracks "here's the actual target," so every agent run
checks against real stated intent, not just its own internal design principles.

**Every agent in `.claude/agents/flame-*.md` should read this file, not just `BACKLOG.md`,
before starting a real (non-dry-run) pass.** If something in the shipped game contradicts a
line below, that's a finding worth raising even if nothing is technically "broken."

## Direct feedback from the project owner, in their own words

- *"It is very static and not dynamic and the design is not visually appealing. This game
  gives me hole.io feels."* -- the baseline complaint that started this whole process. Note
  what this does NOT mean: hole.io itself is a fine, successful game at being hole.io. The
  problem is The Flame promises more (a 7-tier/77-level skill progression, a permanent skill
  tree) than hole.io ever claims to have, so looking/feeling like hole.io reads as a mismatch
  between ambition and execution, not as "make it look different for its own sake."
- *"The xp, the skill tree, the unique skill tree, the sp, hp, points. The leveling. All that
  needs to be balanced and fixed and improved and checked and loop."* -- explicitly named
  every progression system as needing real attention, not just the one thing that happened to
  be measurably broken first (XP pacing). Note "unique skill tree" specifically -- worth
  checking whether the 7 nodes read as meaningfully distinct playstyle investments or as
  generic percentage-bonus rows that happen to have different names (see "Open questions"
  below).
- *"Just like Idle Slayer game for iPhone"* -- given as the concrete model for fixing skill
  point pacing (continuous small currency from ordinary play, a bigger/rarer event layered on
  top, not the only income source). This is the one place a specific reference game was named
  directly -- worth treating as a real design touchstone for progression *feel* generally, not
  just the one pacing number it was originally invoked for.
- The agent-team process itself (this file, `BACKLOG.md`, `.claude/agents/flame-*.md`) exists
  because the owner explicitly asked for the game's ongoing design/balance/visual work to be
  driven by a team of specialized agents rather than ad hoc single-session fixes -- *"agents in
  here helping you design and create the game"*, explicitly **not** an in-game feature.
- Most recently: a direct instruction that agent work must be checked against the *whole*
  stated vision, not just "does the function exist and run" -- explicitly calling out that
  positioning, color, and other visual/layout choices may not yet have been discussed at all,
  and that's a gap, not a non-issue.

## Open questions (do not guess at these -- ask)

Per the project owner's own standing instruction earlier this session: *"let me decide even if
I didn't immediately [ask]"* -- open creative/design decisions go back to them, not picked
unilaterally by an agent. Known open items as of 2026-09-13:

- Whether the skill tree's 7 nodes should feel more distinctly "unique" (different mechanics,
  not just different percentage bonuses) -- flagged by the "unique skill tree" phrasing above,
  not yet confirmed as an actual ask.
- HUD/element positioning and color choices beyond what's already been fixed reactively
  (tap-target sizing, ribbon visibility, palette contrast for colorblind mode) -- explicitly
  named by the owner as an area "haven't been spoken about," meaning real opinions likely exist
  that no agent run has surfaced yet.

## How to use this file

- Read it alongside `BACKLOG.md` before a real pass, not instead of it.
- If a change you're considering would move the game further from something stated here,
  don't make it without flagging that conflict.
- If you find a concrete mismatch between shipped behavior and something stated here, log it
  in `BACKLOG.md` under the relevant section, same as any other finding -- reference this file
  so the reasoning traces back to an actual quote, not a guess.
- Do not add your own inferred "the owner probably also wants X" entries to this file --
  append them to `BACKLOG.md` as open questions instead, so a real answer (not an assumption)
  is what eventually lands here.
