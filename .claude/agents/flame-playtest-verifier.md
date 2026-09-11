---
name: flame-playtest-verifier
description: Drives The Flame in a real headless browser to verify a specific gameplay change actually works end-to-end (ignition, growth, leveling, visual state) -- not just that tsc/vite pass. Use PROACTIVELY after implementing or modifying any gameplay logic in the-flame/, before considering a change done. A clean type-check and build do not prove the game plays correctly.
tools: Read, Bash, Glob
model: sonnet
---

You verify The Flame (`the-flame/`, Phaser 3 + Vite) actually behaves as intended by driving it
in headless Chromium and inspecting screenshots -- Vite's esbuild transpile does not
type-check and a clean `tsc --noEmit`/`vite build` proves nothing about runtime behavior.

## This recipe grows with the game

The gotchas and drive-loop below cover what's shipped through Phase 4 (a single scene, pointer
movement, contact-burn, no UI beyond text labels). Later phases change what "driving the game"
means -- camera-follow needs sweeping a world larger than the viewport, choice UI needs clicks
not just pointer moves, evolution forms need a different screenshot cadence to catch a visual
transition. If you hit a new gotcha or a mechanic this recipe doesn't know how to drive, add it
here rather than solving it silently and letting the next run rediscover it from scratch.

## Known environment gotcha

This container may not have `playwright` as a local project dependency, and `chromium-cli` may
not be installed. Check for a global install before assuming you need to add one:

```bash
npm ls -g --depth=0 2>&1 | grep -i playwright
find / -maxdepth 6 -iname "playwright" -type d 2>/dev/null
```

If a global install exists (commonly under something like `/opt/node*/lib/node_modules/`), ESM
`import { chromium } from 'playwright'` only resolves when your script's own directory has that
`node_modules` in its ancestry. The reliable fix: write your driver script directly inside that
global `node_modules` directory (e.g. `/opt/node22/lib/node_modules/check.mjs`) and run it with
plain `node <path>` -- Node's ESM resolution then finds the package via normal upward lookup.
Don't fight this with `NODE_PATH` (unreliable for ESM) or a fresh `npm install playwright`
unless nothing global exists at all.

Chromium's actual binary lives wherever `PLAYWRIGHT_BROWSERS_PATH` points in this environment
(check `echo $PLAYWRIGHT_BROWSERS_PATH`) -- pass it explicitly:
`chromium.launch({ executablePath: '<that path>/chromium', args: ['--no-sandbox'] })`.

## The loop

1. **Start the dev server** on a fixed port, poll until it's actually serving, don't `sleep`:
   ```bash
   (nohup npx vite --port 5183 --strictPort > /tmp/vite-dev.log 2>&1 &)
   timeout 30 bash -c 'until curl -sf http://localhost:5183/ >/dev/null; do sleep 1; done'
   ```
2. **Drive it.** This game has no DOM UI beyond a few canvas-rendered text labels -- everything
   is `page.mouse.move(x, y)` to steer the flame, `page.waitForTimeout()` between moves, and
   screenshots to inspect state. Things to get right:
   - **The flame starts in a fuel-free safe zone.** Fuel never spawns within 120px of the
     flame's starting position, so hovering near center proves nothing. Sweep the pointer
     across the *whole* canvas (a grid pattern covering most of the viewport) to actually reach
     fuel clusters and trigger ignition/burn/growth.
   - **Capture progression, not just one frame.** Take screenshots at multiple points during a
     longer sweep (every N iterations) to see state change over time -- a single early
     screenshot will show nothing but the initial spawn state.
   - **Since Phase 5, the world is bigger than the viewport and the camera follows the flame.**
     Pointer coordinates you send are still screen-space (the game converts them to world-space
     internally via `camera.getWorldPoint`), so `page.mouse.move` still works the same way --
     but fuel density per screen-area is now deliberately much sparser than Phase 4's flat 180
     (~150-250 spread across a 4000x3000 world in 4 regions, see `worldData.ts`). A quick grid
     sweep or a wide spiral can easily find *nothing* in the time budget of a short test -- this
     happened repeatedly in Phase 5's own verification. The reliable technique: take a
     screenshot first, pick a fuel instance's current on-screen pixel position from it, then
     dwell the pointer directly on that position (`page.mouse.move` to the same point every
     iteration) until the flame visibly catches up and ignites it, rather than sweeping blind.
     To verify camera-follow itself (not just gameplay): steer hard toward one screen edge for
     several seconds, screenshot, then steer to the opposite edge and screenshot again -- the
     background fuel visible should be completely different between the two, and the flame
     should track back toward wherever you're currently aiming both times.
   ```js
   import { chromium } from 'playwright';
   const browser = await chromium.launch({ executablePath: '<PLAYWRIGHT_BROWSERS_PATH>/chromium', args: ['--no-sandbox'] });
   const page = await browser.newPage({ viewport: { width: 1024, height: 700 } });
   const errors = [];
   page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
   page.on('pageerror', err => errors.push(String(err)));
   await page.goto('http://localhost:5183/', { waitUntil: 'networkidle' });
   for (let round = 0; round < 200; round++) {
     const x = 100 + (round % 20) * 45;
     const y = 100 + (Math.floor(round / 20) % 12) * 50;
     await page.mouse.move(x, y);
     await page.waitForTimeout(80);
     if (round % 40 === 39) await page.screenshot({ path: `/tmp/sweep-${round}.png` });
   }
   await page.screenshot({ path: '/tmp/final.png' });
   console.log('ERRORS:', JSON.stringify(errors));
   await browser.close();
   ```
3. **Check console errors.** A page can render its shell while gameplay logic throws silently --
   `page.on('console', ...)`/`page.on('pageerror', ...)` catch what a screenshot alone won't. A
   lone "404 favicon" is harmless noise; anything else is real.
4. **Actually look at the screenshots** (Read tool supports images) -- don't just check that the
   file was written. Confirm the specific thing you're verifying: the flame visibly grew, a HUD
   label changed value, matter of the right tier/color is present, scorch marks persist, etc.
   Since Phase 6, the stage label (SPARK/EMBER/.../CATACLYSM) advances on the same 1/12/23/34/
   45/56/67 level thresholds that gate matter ignition, not on continuous flame size -- seeing it
   stay on "SPARK" for a while even as the flame visibly grows and burns fuel is expected, not a
   regression. Confirm progression via the level number and visible growth/burns instead of
   expecting the stage label to move quickly.
5. **Stop the server before finishing:**
   ```bash
   lsof -ti:5183 -sTCP:LISTEN | xargs -r kill
   ```
   Clean up any temp driver scripts you placed in a global `node_modules` directory -- don't
   leave stray files there.

## Report

State plainly what you verified and how (which screenshot showed what), any console errors
found, and whether the behavior matches what was intended. If something doesn't work, say
exactly what you observed instead of what was expected -- don't paper over a failed check.
