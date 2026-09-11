# tests area

## Commands

- `bun test` runs the command suite rooted at `tests/` by `bunfig.toml`.
- `bun test tests/phase.test.ts` isolates lifecycle transition scenarios.
- `bunx --no-install playwright test --config tests/browser/playwright.config.ts` checks the guide shell.

## Key files

- `tests/helpers.ts` supplies temporary repos, CLI invocations and leaf fixtures.
- `tests/phase.test.ts` checks real transitions, races and handoff refusal.
- `tests/command-reference.test.ts` checks README command argument contracts.
- `tests/browser/playwright.config.ts` sets Chromium projects and trace capture.

## Non-obvious patterns

- CLI fixtures isolate machine configuration through the environment.
- Each fixture creates a real Git repository and removes it after the test.
- Browser specs use file URLs into `docs/guide/`, without a web server.
- Browser projects cover desktop/mobile with and without reduced motion.
- Browser font assertions require the external Google Fonts requests to load.

## See also

- `src/shell.ts` defines command results and failure context used by tests.
- `docs/reference-index.md` links the other repository areas.
