# tests area

## Commands

- `bun test` runs the command suite rooted at `tests/` by `bunfig.toml`.
- `bun test tests/phase.test.ts` isolates lifecycle transition scenarios.

## Key files

- `tests/helpers.ts` supplies temporary repos, CLI invocations and leaf fixtures.
- `tests/phase.test.ts` checks real transitions, races and handoff refusal.
- `tests/command-reference.test.ts` checks README command argument contracts.
- `tests/docs-links.test.ts` checks relative links and heading anchors in README and the guide.

## Non-obvious patterns

- CLI fixtures isolate machine configuration through the environment.
- Each fixture creates a real Git repository and removes it after the test.

## See also

- `src/shell.ts` defines command results and failure context used by tests.
- `docs/reference-index.md` links the other repository areas.
