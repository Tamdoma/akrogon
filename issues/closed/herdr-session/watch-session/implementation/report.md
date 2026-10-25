# Report: watch-session

Serial-solo run: one wave, one unit, implemented by A. No workers, no sub-briefs.

## Changes

- `skills/watch-issues/scripts/observe.ts` — resolves the repo session through `readRepo` + `repoSession({ exe: herdrBin })` before any output; throws the refusal reason on `!resolved.ok`; prints `session=<name>` as stdout line 1; `agent list` runs through `herdrArgv(['agent','list'], { session, exe: herdrBin })` under the existing run helper, preserving its error strings.
- `skills/watch-issues/SKILL.md` — documents the `session=<name>` first line and the resolution-refusal failure shape; every acting `herdr` command (`agent read|send-keys|wait|prompt`, `notification show`) carries `--session <name>`.
- `skills/watch-issues/scripts/observe.test.ts` — session-dispatching herdr stub (session list / per-session workspace list / agent list, OBSERVE_HERDR_LOG call log), `issues/config.yaml` (`grounding: none`) in test roots, `session=sess` first-line expectations, and new tests T1–T4 plus recorded-fixture parse tests.
- `skills/watch-issues/scripts/observe-log-tail.test.ts` — same stub and config updates, `session=` first line.
- `skills/watch-issues/scripts/fixtures/herdr-session-list.json`, `fixtures/herdr-workspace-list.json` — verbatim herdr 0.9.1 captures (2026-10-24).

Base: `e0a57bd732` (origin/main). Head: `edb1028` (`fix: observe resolves the repo session and lists agents inside it`). Tests committed first in `c12cdbbf`.

## Criterion proofs

All run from `skills/watch-issues/` through `akrogon run-check`, each under a minute:

- C1 (seats read from resolved session, same-id pane in another session not reported): `bun test scripts/observe.test.ts -t 'reports seats from the resolved session'` — green on edb1028 (same tree as a9f84cd). Log: `implementation/check-observe-c1-1792868765596-694506.log`.
- C2 (missing/duplicate/unreadable workspace → non-zero, stderr refusal, no stdout): `bun test scripts/observe.test.ts -t 'resolution refusal'` — green on edb1028 (same tree as a9f84cd), four scenarios. Log: `implementation/check-observe-c2-1792868765933-694709.log`.
- C3 (OBSERVE_HERDR reaches every herdr call): `bun test scripts/observe.test.ts -t 'OBSERVE_HERDR covers every herdr call'` — green on edb1028 (same tree as a9f84cd); call log holds exactly `session list --json`, `--session sess-x workspace list`, `--session sess-x agent list`; PATH bypass shim untouched. Log: `implementation/check-observe-c3-1792868769054-695362.log`.
- C4 (SKILL.md contract): `bun test scripts/observe.test.ts -t 'SKILL.md'` — green on edb1028 (same tree as a9f84cd). Log: `implementation/check-observe-c4-1792868769179-695536.log`.
- Whole skill suite: `bun test scripts` — 54 pass, 0 fail. Log: `implementation/check-observe-skill-suite-1792868771682-695696.log`.

## checks

`akrogon verify` on edb1028 (receipt keyed by tree, identical to a9f84cd): green (`format` 0, `test` 0, `typecheck` 0). Final logs: `check-format-1792868776012-698126.log`, `check-test-1792872506998-2076049.log` (1135 pass, 0 fail, 238s), `check-typecheck-1792872510254-2076049.log`. Wall time for the `test` command (minutes-sized): ~7 min across runs; receipt is the green run's.

## Retries and known-red judgment

The first two `verify test` runs and one `verify --known-red` head run went red on 42–53 timeouts in unrelated suites (`next.test.ts`, `batch-dispatch.test.ts`, `leaf-stop.test.ts`, `worktree-store.test.ts`, `status.test.ts`) while host load average was 60–104 from other leaves' browser/test runs. Only 3 of 42 head-red names overlapped the contemporaneous base-red run, confirming flake not defect: head and base failed different tests. A later `verify --known-red` base run went fully green in 190s and the retried head run went fully green in 238s as load dropped. The leaf diff touches only `skills/watch-issues/`, whose suite test (`tests/watch-issues-scripts.test.ts`) passed in every head run. Both earlier red runs logged real test names; no inconsistent check marks — the reds cleared on retry.

## Limitations / unverified

- A session that stops after the observer's session list surfaces as a herdr/read error, never a silent retarget (locked design).
- No real herdr call was made by this leaf's tests; all runs are stub-bound per design.
- The `session=` line prints even with an empty inventory (resolution precedes the early return); the failure tests that used `herdrFail` now cover resolution failure instead of agent-list failure — same failure shape, earlier stage.

## Notes

- `issues/config.yaml` in test roots requires `grounding: none` — `repoSchema` makes `grounding` required; `{}` fails union validation. Recorded for reviewers of the test fixtures.
- `notification show` was scoped to `--session <name>` in SKILL.md to match akrogon's own post-session-routing usage (`src/next.ts`, `src/phase.ts`); the brief named only the agent verbs, so this is recorded as a plan-level decision (D6).
