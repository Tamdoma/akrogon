# tests area

## Commands

- `bun test` runs the command suite rooted at `tests/` by `bunfig.toml`.
- `bun test tests/phase.test.ts` isolates lifecycle transition scenarios.

## Key files

- `tests/helpers.ts` supplies temporary repos, CLI invocations and leaf fixtures; `tests/deploy-fixture.ts` builds the deployed-release fixture (seed repo, release stub, `deployedPair`).
- `tests/isolation.ts` is the `bunfig.toml` `[test]` preload: per-worker scratch HOME and leaf-temp, a subreaper plus descendant sweep so the suite never reaches real HOME or `/var/tmp/akr-<uid>` and leaves no process.
- `tests/phase.test.ts` checks real transitions, races and handoff refusal.
- `tests/command-reference.test.ts` checks README command argument contracts against the dispatched verbs.
- `tests/docs-links.test.ts` checks relative links and heading anchors in README and the guide.
- `tests/watch-issues-scripts.test.ts` is the `skills/watch-issues` gate, running its scripts tests and typecheck.
- `tests/guard.test.ts` checks the `akrogon guard` ancestor and own-modules refusals.
- `tests/run-permit.test.ts` checks runs start at once: concurrent runs, nested `run-check`/`verify`, `status` showing no waiter lines, missing `memory.stat` ignored and unmatched `AKROGON_RUN` tokens. `tests/run-units.test.ts` checks run-unit boxing, `stop-run` authority, wrapper-death reaping, verify units, immediate admission, the stale sweep and the skills' `stop-run` wording, with real units under `akrogon-test-*.slice`.
- `tests/verify.test.ts` checks the fresh checkout, every command run past a red one, the receipt, env and cleanup of `verify`.
- `tests/receipt-gates.test.ts` checks the `check.review`, `merged --check` and direct-guards receipt gates.
- `tests/seat-containment.test.ts` checks pane boxing, restore replacement and the bus cut through `next`, with `tests/fake-busctl.ts`, the fake proc root in `tests/fake-proc.ts` and fake herdr `pane process-info`/`pane close`.
- `tests/reconcile.test.ts` checks reconciler removal, refusal and old-root migration against real worktrees.
- `tests/leaf-slices.test.ts` checks finished-leaf slice stopping, the tab/run-record/own-slice keeps, unmatched empty slices, guard CollectMode and failed-unit clearing with real units and `tests/fake-systemctl.ts`.
- `tests/leaf-stop.test.ts` checks stop, start, the dispatch and merge gates and status marks with a test-local fake systemctl.
- `tests/merge-attempts.test.ts` checks `issues/merge-attempts.jsonl` lines per ending, including a legacy `held` line that still parses.
- `tests/timing.test.ts` checks the timing record end to end through real `next`/`phase`/`run-check` calls, worker and verify runs, wait dedup and the unwritable-file negative case.
- `tests/timing-report.test.ts` checks `akrogon timing` against fixture records: visit decomposition, expected-event flags and cohort verdicts.
- `tests/pause-status.test.ts` checks pause marks on the board, targeted status and chart headings.
- `tests/log-reader.test.ts` checks `akrogon log` byte output, archive members, outside-repo resolution and the skill/doc mentions.
- `tests/hold-retired.test.ts` checks the retired merge verbs refuse, a legacy hold record stays inert, and the docs carry no retired surface.
- `tests/close-pack.test.ts` checks the `.closing` marker, packing `*.log` into `evidence.tar.zst`, sync exclusions, init log ignores and the run-check closed/closing refusal; `tests/folder-pack.test.ts` checks `akrogon pack` on chart `direct/` and closed owners, tracked-log refusals, `.closing` retries and refusal forms.
- `tests/rollback.test.ts` checks `akrogon rollback` end to end: flip and hold, the held-deploy loop, the manual README path on a broken release, the no-previous and bad-config refusals, and link restore with its failure leaving `current` on the previous release.

## Non-obvious patterns

- CLI fixtures isolate machine configuration through the environment.
- Each fixture creates a real Git repository and removes it after the test; registered temp dirs are also swept at process exit.
- `bunfig.toml` runs every test file concurrently, and tests that share global state use `test.serial`.
- The 30 s test timeout comes from `--timeout=30000` in the `checks` commands of `issues/config.yaml`.

## See also

- `src/shell.ts` defines command results and failure context used by tests.
- `docs/reference-index.md` links the other repository areas.
