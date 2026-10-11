# tests area

## Commands

- `bun test` runs the command suite rooted at `tests/` by `bunfig.toml`.
- `bun test tests/phase.test.ts` isolates lifecycle transition scenarios.

## Key files

- `tests/helpers.ts` supplies temporary repos, CLI invocations and leaf fixtures.
- `tests/phase.test.ts` checks real transitions, races and handoff refusal.
- `tests/command-reference.test.ts` checks README command argument contracts against the dispatched verbs.
- `tests/docs-links.test.ts` checks relative links and heading anchors in README and the guide.
- `tests/watch-issues-scripts.test.ts` is the `skills/watch-issues` gate, running its scripts tests and typecheck.
- `tests/guard.test.ts` checks the `akrogon guard` ancestor and own-modules refusals.
- `tests/base-run.test.ts` checks the base checkout, record line, env and cleanup of `base-run`.
- `tests/compare.test.ts` checks the comparison record, red record and `--compare` flag.
- `tests/red-docs.test.ts` checks the skills and guide carry the retry, comparison and `known-red` rules, the merge skill's `--compare` contract and the retired `red on base` stop wording's absence.
- `tests/reconcile.test.ts` checks reconciler removal, refusal and old-root migration against real worktrees.

- `tests/merge-attempts.test.ts` checks `issues/merge-attempts.jsonl` lines per ending, including a legacy `held` line that still parses.
- `tests/merge-compare.test.ts` checks the merge `--compare` binding, red-entry notices and resolve on landing.
- `tests/pause-status.test.ts` checks pause marks on the board, targeted status and chart headings.
- `tests/hold-retired.test.ts` checks the retired merge verbs and flags refuse, a legacy hold record stays inert, and the docs carry no retired surface.

## Non-obvious patterns

- CLI fixtures isolate machine configuration through the environment.
- Each fixture creates a real Git repository and removes it after the test; registered temp dirs are also swept at process exit.
- `bunfig.toml` runs every test file concurrently, and tests that share global state use `test.serial`.
- The 30 s test timeout comes from `--timeout=30000` in the `checks` commands of `issues/config.yaml`.

## See also

- `src/shell.ts` defines command results and failure context used by tests.
- `docs/reference-index.md` links the other repository areas.
