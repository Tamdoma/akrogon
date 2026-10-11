# tests area

## Commands

- `bun test` runs the command suite rooted at `tests/` by `bunfig.toml`.
- `bun test tests/phase.test.ts` isolates lifecycle transition scenarios.

## Key files

- `tests/helpers.ts` supplies temporary repos, CLI invocations and leaf fixtures.
- `tests/phase.test.ts` checks real transitions, races and handoff refusal.
- `tests/command-reference.test.ts` checks README command argument contracts.
- `tests/docs-links.test.ts` checks relative links and heading anchors in README and the guide.
- `tests/watch-issues-scripts.test.ts` is the `skills/watch-issues` gate, running its scripts tests and typecheck.
- `tests/guard.test.ts` checks the `akrogon guard` ancestor and own-modules refusals.
- `tests/base-run.test.ts` checks the base checkout, record line, env and cleanup of `base-run`.
- `tests/compare.test.ts` checks the comparison record, red record and `--compare` flag.
- `tests/red-docs.test.ts` checks the skills and guide carry the retry, comparison and `known-red` rules.
- `tests/reconcile.test.ts` checks reconciler removal, refusal and old-root migration against real worktrees.

## Non-obvious patterns

- CLI fixtures isolate machine configuration through the environment.
- Each fixture creates a real Git repository and removes it after the test; registered temp dirs are also swept at process exit.
- `bunfig.toml` runs every test file concurrently, and tests that share global state use `test.serial`.
- The 30 s test timeout comes from `--timeout=30000` in the `checks` commands of `issues/config.yaml`.

## See also

- `src/shell.ts` defines command results and failure context used by tests.
- `docs/reference-index.md` links the other repository areas.
