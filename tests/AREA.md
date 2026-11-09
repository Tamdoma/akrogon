# tests area

## Commands

- `bun test` runs the command suite rooted at `tests/` by `bunfig.toml`.
- `bun test tests/phase.test.ts` isolates lifecycle transition scenarios.

## Key files

- `tests/helpers.ts` supplies temporary repos, CLI invocations and leaf fixtures; each `fixture()` registers a repo identity derived from its own home (`f.repo`/`f.prefix`) so a teardown's slice stop never reaches another fixture; `tests/deploy-fixture.ts` builds the deployed-release fixture (seed repo, release stub, `deployedPair`); `tests/phase.test.ts` checks real transitions, races and handoff refusal; `tests/fixture-repo-identity.test.ts` proves one fixture's teardown leaves a same-slug seat of another fixture alive.
- `tests/isolation.ts` is the `bunfig.toml` `[test]` preload: per-worker scratch HOME, leaf-temp and `XDG_RUNTIME_DIR` (no hc sessions), a subreaper plus descendant sweep so the suite never reaches real HOME or `/var/tmp/akr-<uid>` and leaves no process.
- `tests/hc-fixture.ts` starts a real herdr-core core per test (`hcCore`: unique `akt<pid36>-<n>` session on the real runtime dir, akrogon given a scratch runtime holding only that socket's link, plus `bus` and `systemd`), with `tests/stand-in.sh` as the seat program (modes by `--model`, task log per terminal), `tests/fake-herdr-app.ts` as the strict window fake and `tests/hc-shim.sh` recording hc calls; `hcFixture` adds prefix `rp`, stand-in seats and a fake systemctl for engine tests; `noticeFolder`, `noticeFiles` and `blockNotices` read a core's notice folder or make its writes fail; `tests/notices.test.ts` checks the notice file contract; the `tests/hc-*.test.ts` files prove the hc engine criteria and `tests/e2e/` holds the attended window and paid kinds tiers.
- `tests/door-exchange.test.ts` and `tests/door-reset.test.ts` prove the chart door's consultant wait and handover reset on a fixture core; `tests/door-agent.ts` is the stand-in door A that writes claude, codex or pi transcripts where the resolver looks.
- `tests/command-reference.test.ts` checks the command table in `docs/reference/commands.md` against the dispatched verbs and their argument contracts; `tests/docs-links.test.ts` checks relative links, heading anchors and image references in README, every Markdown page under `docs/` and the skills.
- `tests/watch-issues-scripts.test.ts` is the `skills/watch-issues` gate, running its scripts tests and typecheck; `tests/hc-observe.test.ts` checks observe's lines on a real core, and `tests/e2e/watch-stop.e2e.ts` and `watch-check.e2e.ts` (setup in `watch-tier.ts`) are the attended watcher runs; `tests/guard.test.ts` checks the `akrogon guard` ancestor and own-modules refusals.
- `tests/run-permit.test.ts` checks runs start at once: concurrent runs, nested `run-check`/`verify`, `status` showing no waiter lines, missing `memory.stat` ignored and unmatched `AKROGON_RUN` tokens; plus the per-repo `full` line: same-repo listed runs queue in arrival order, other repos and unlisted names start at once, listed-in-listed nests, killed runs never block, `stop-run` cancels a waiter and the `full` config refuses unknown names. `tests/run-units.test.ts` checks run-unit boxing, `stop-run` authority, wrapper-death reaping, the killed-run abandoned-pair refusal under the real unit, verify units, immediate admission, the stale sweep and the skills' `stop-run` wording, with real units under `akrogon-test-*.slice`.
- `tests/verify.test.ts` checks the fresh checkout, every command run past a red one, concurrent `merge_checks` members behind a green `checks` stage, `full` checks ordered after the other `checks` and recorded `blocked` after a red, whole-receipt reuse across scopes, old `reused` receipt rows still parsing, per-head-row known-red cover, and the receipt, env and cleanup of `verify`; `tests/receipt-gates.test.ts` checks the `check.review`, `check.repair`, `merged --check` and direct-guards receipt gates.
- `tests/session-routing.test.ts` checks engine calls resolve the repo's hc session and space (refused, stopped, unreadable and slow sessions refuse or skip), and that notices land in the notice folder of the core holding the repo space.
- `tests/session-reads.test.ts` checks capacity with unreadable sessions, cross-session reconcile vetoes, fresh seat reads, manual runs ignoring inherited `HC_TERMINAL_ID`, and `logMove` attribution to the slot's transcript.
- `tests/reconcile.test.ts` checks reconciler removal, refusal and old-root migration against real worktrees.
- `tests/leaf-slices.test.ts` checks finished-leaf slice stopping, the tab/run-record/own-slice keeps (a `waiting` run record counts as live), unmatched empty slices, guard CollectMode and failed-unit clearing with real units and `tests/fake-systemctl.ts`.
- `tests/leaf-stop.test.ts` checks stop, start, the dispatch and merge gates and status marks with a test-local fake systemctl.
- `tests/merge-attempts.test.ts` checks `issues/merge-attempts.jsonl` lines per ending, including a legacy `held` line that still parses; `tests/green-merge.test.ts` checks the command-run green merge through `akrogon land`, its B handoffs, the broadcast handoff, an outside recorded broadcast seat's re-boxing and recovery.
- `tests/timing.test.ts` checks the timing record end to end through real `next`/`phase`/`run-check` calls, worker and verify runs, wait dedup and the unwritable-file negative case; `tests/timing-report.test.ts` checks `akrogon timing` against fixture records: visit decomposition, expected-event flags and cohort verdicts.
- `tests/pause-status.test.ts` checks pause marks on the board, targeted status and chart headings; `tests/log-reader.test.ts` checks `akrogon log` byte output, archive members, outside-repo resolution and the skill/doc mentions.
- `tests/hold-retired.test.ts` checks the retired merge verbs refuse, a legacy hold record stays inert, and the docs carry no retired surface; `tests/slow-merge.test.ts` checks the merge-slow comparison, the episode lifecycle, the notice retry and the status line.
- `tests/durable-capture.test.ts` checks live `capture-` files stream stdout and stderr, a killed run leaves them readable through `akrogon log` with no completed check (a pair stays live while a descendant holds capture-out's stdout fd under the shared flock, per `tests/abandoned-capture.test.ts`, which also checks the abandoned-pair refusal of non-failed phase moves and its release by a non-blank `cleared-<run>.md`), and `pack` and owner completion wait on the owner `.lock` or refuse `inside run-check run <uuid>` from inside that owner's capture; `tests/close-pack.test.ts` checks the `.closing` marker, packing `*.log` into `evidence.tar.zst`, sync exclusions, init log ignores and the run-check closed/closing refusal; `tests/folder-pack.test.ts` checks `akrogon pack` on chart `direct/` and closed owners, tracked-log refusals, `.closing` retries and refusal forms.
- `tests/deploy-shapes.test.ts` runs `selfUpdate` in-process on the deploy fixture, reads the systemctl calls in order and asserts no herdr call through the recording `herdrStub`; `tests/rollback.test.ts` checks `akrogon rollback` end to end: flip and hold, the held-deploy loop, the manual README path on a broken release, the no-previous and bad-config refusals, and link restore with its failure leaving `current` on the previous release.

## Non-obvious patterns

- CLI fixtures isolate machine configuration through the environment.
- Each fixture creates a real Git repository and removes it after the test; registered temp dirs are also swept at process exit.
- `bunfig.toml` runs every test file concurrently, and tests that share global state use `test.serial`.
- The 30 s test timeout comes from `--timeout=30000` in the `checks` commands of `issues/config.yaml`.

## See also

- `src/shell.ts` defines command results and failure context used by tests.
- `docs/reference-index.md` links the other repository areas.
