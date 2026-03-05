import js from '@eslint/js'
// @eslint/js: ESLint's official JavaScript rule set.
// Provides js.configs.recommended — a curated set of rules that catch common
// JavaScript errors (no-undef, no-unused-vars, no-dupe-keys, etc.).

import globals from 'globals'
// globals: A dictionary of known global variables grouped by environment.
// We use globals.browser to tell ESLint that window, document, console, fetch, etc.
// are valid globals — otherwise it would flag them as "undefined".

import reactHooks from 'eslint-plugin-react-hooks'
// eslint-plugin-react-hooks: Facebook's official ESLint plugin for React hooks.
// Enforces the Rules of Hooks (no conditional hooks, hooks only in components/custom hooks)
// and the exhaustive-deps rule (all dependencies in useEffect/useMemo/useCallback).

import reactRefresh from 'eslint-plugin-react-refresh'
// eslint-plugin-react-refresh: Ensures components are exported in a way that's
// compatible with Vite's Fast Refresh (HMR). Warns if you export non-components
// from a component file, which would break hot module replacement.

import tseslint from 'typescript-eslint'
// typescript-eslint: The bridge between TypeScript and ESLint.
// Provides a TypeScript parser (so ESLint can understand TS syntax) and
// a set of TS-specific rules (no-explicit-any, no-floating-promises, etc.).

import { defineConfig, globalIgnores } from 'eslint/config'
// defineConfig: Helper that provides type hints for the ESLint flat config format.
// globalIgnores: Utility to define file patterns ESLint should completely skip.

export default defineConfig([
  // defineConfig: Takes an array of config objects. ESLint's "flat config" format
  // (introduced in ESLint 9) replaces the old .eslintrc cascading system.
  // Each object in the array can target specific files and apply different rules.

  globalIgnores(['dist']),
  // globalIgnores: Tell ESLint to completely skip the dist/ directory.
  // Built output files shouldn't be linted — they're generated, minified,
  // and don't follow source code conventions.

  {
    files: ['**/*.{ts,tsx}'],
    // files: This config block only applies to TypeScript and TSX files.
    // JavaScript files (like this eslint.config.js itself) are not linted by these rules.

    extends: [
      js.configs.recommended,
      // js.configs.recommended: Base JavaScript rules — catches common errors like
      // unreachable code, duplicate object keys, and invalid typeof comparisons.

      tseslint.configs.recommended,
      // tseslint.configs.recommended: TypeScript-specific rules layered on top.
      // Includes the TS parser and rules like no-unused-vars (TS-aware version),
      // no-explicit-any, and no-non-null-assertion.

      reactHooks.configs.flat.recommended,
      // reactHooks flat recommended: Enables rules-of-hooks (error) and
      // exhaustive-deps (warning). These are critical for correct React hook usage.

      reactRefresh.configs.vite,
      // reactRefresh vite config: Configures the react-refresh plugin for Vite.
      // Ensures components are exported correctly for Fast Refresh to work.
    ],

    languageOptions: {
      ecmaVersion: 2020,
      // ecmaVersion: The ECMAScript version ESLint uses to parse your code.
      // 2020 supports optional chaining (?.), nullish coalescing (??), and BigInt.
      // This only affects parsing — the actual compilation target is set in tsconfig.

      globals: globals.browser,
      // globals: Register browser globals (window, document, navigator, fetch, etc.)
      // as known variables so ESLint doesn't report them as "not defined".
    },
  },
])
