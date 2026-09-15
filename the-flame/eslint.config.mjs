// Loose end from the mobile-perf/bundle audit pass: the-flame previously had
// no lint step at all -- only the root Next.js app (an unrelated project
// sharing this repo) has its own eslint.config.mjs. This is intentionally
// minimal: typescript-eslint's own recommended rules, no framework-specific
// plugins (no React/Next here), scoped to src/ only.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      // This codebase's own established convention (see BACKLOG.md,
      // PROGRESSION_QUEUE.md): unused destructured/positional params are
      // sometimes kept for signature-shape consistency across Host-style
      // callback interfaces. Flag genuinely unused locals/imports, but
      // don't fight unused function args.
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }]
    }
  },
  {
    // Ambient module shims (e.g. src/types/phaser-arcade-physics.d.ts) that
    // describe a CJS/UMD module's shape legitimately need `import X =
    // require(...)`/`export =` -- there's no ESM equivalent for that
    // pattern, so the no-require-imports rule doesn't apply to .d.ts files.
    files: ['src/**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
);
