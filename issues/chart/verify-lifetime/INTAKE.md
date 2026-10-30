# Intake: verify-lifetime

## Scope

A verify run's lifetime stops depending on the seat command that waits for it, so a seat's tool timeout or cancellation no longer throws away a running full suite. One akrogon leaf, no dependency.

## Provenance

- GitHub: Tamdoma/akrogon#119
- Operator: door pane w8:pNP, 2026-10-27, chart-issues arguments.

## Source: Tamdoma/akrogon#119

# akrogon verify leaves 25 receipts without an end: each run stopped during the full test suite about 2 minutes in, then the seat started a new verify

Source: Tamdoma/akrogon#119
URL: https://github.com/Tamdoma/akrogon/issues/119

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

25 of 276 receipts in `issues/verify-runs.jsonl` have no `end`, no `setup` and empty `commands`. They span 2026-10-15 to 2026-10-24 (6 on 2026-10-24), 24 at leaf scope and 4 at merge scope on `checkout`.

For every one of them, `issues/timings.jsonl` shows the verify's `setup` and `format` checks starting, then a `test` check starting 2 to 5 seconds after the receipt's `start` with no matching `check_end`. Across the whole timings file there are exactly 25 `check_start` events without a `check_end` (23 `test`, 1 `pick-next-tests`, 1 `u4-next`).

The same leaf's next verify receipt starts about 2 minutes after each stopped one (4 to 6 minutes for three of the `checkout` merge runs, 20 minutes for one). A green full suite currently takes about 190 to 235 seconds, so each stopped run threw away about 2 minutes of suite time.

## Location

`akrogon verify` (`src/verify.ts`, `runOnce`) as called by leaf seats and the merge path; records in `issues/verify-runs.jsonl` and `issues/timings.jsonl`.

## Reproduction

Not provided. Seen 25 times over 10 days in the ledgers, often in bursts on one leaf (identical-ignored 5 times on 2026-10-19 within 15 minutes, state-home 4 times on 2026-10-15/16, checkout 4 times on 2026-10-24).

## Expected behavior

Not provided. Presumably a verify run either completes and writes `end`, or its receipt records why it stopped, and the full suite is not cut off and restarted.

## Urgency

Each occurrence wastes about 2 minutes of full-suite time plus the rerun. 25 runs is about 10% of completed verify runs in the window. Stopped runs also make before/after verify measurements harder to read. No known workaround.

## Suspected cause

Suspected: the process running `akrogon verify` is killed from outside about 2 minutes in, before the roughly 3 minute suite ends, for example by the calling seat's shell-command timeout, and the seat then starts verify again. `runOnce` appends the receipt with empty `commands` before checkout and only rewrites it with `setup`, `commands` and `end` in its `finally` block, so a kill that skips `finally` (such as SIGKILL) leaves exactly this record shape. The steady gap of about 2 minutes from one receipt's start to the next one's start fits a fixed caller timeout better than a test hang.
Whose view: agent.
Files read: `src/verify.ts` (`runOnce` receipt append, `finally` rewrite), `issues/verify-runs.jsonl`, `issues/timings.jsonl`.
Not inspected, or would disprove: which harness and tool timeout each seat used, seat transcripts around these times, systemd journal for the `akrogon-run-*` units, and whether the test run units outlived the killed verify. A transcript showing verify ending on its own would disprove the timeout theory.
Related reports: none found. Searched Tamdoma/akrogon, states all, own reports since 2026-10-23 (limit 30) and "verify receipt end" (limit 8). #118 (full suites without a host-wide bound) and #98 (base turns red) are about other failures.

## Source: operator 2026-10-27 w8:pNP

First turn arguments: "Tell me what the one issue pulled is all about. What will the fix bring"

Switch-on arguments: "chart the issue. Use slot b (codex gpt 6.1 sol high effort) consultant. Do it on autopilot."

## Agent findings

Map files: [A](slots/map-A.md), [B](slots/map-B.md).

- Cause, leaf scope (A,B): 21 of the 25 receipts are pi seats whose bash tool hit the 120 s default of `~/.pi/agent/extensions/tamdoma-pi-tweaks/shell-timeout.ts` `DEFAULT_TIMEOUT_S` (20 omitted `timeout`, watch-session set 120). Example: pi session `--home-ivan-.akrogon-worktrees-akrogon-identical-ignored--/2026-10-19T17-13-07-423Z_01a15527-...jsonl` messages 147-152.
- Cause, merge scope (B): the 4 checkout receipts are Claude background tasks the door session bacd17ee stopped on purpose (TaskStop), the first because it tested an old head. Not a timeout.
- Ledger correction (B): 21 leaf plus 4 merge, not 24 plus 4; three checkout receipts never reached a `test` check_start.
- Prior fix (A): the operator's overnight-recs D3 answer (2026-10-15, pi-extensions commit 7ec041d) kept the 120 s default and rewrote implement-issue Shared context step 3 to set the tool timeout above the run time. All 25 stopped receipts start after it.
- No orphan suites (A,B): `src/scope.ts` `startRunGuard` stops each run scope when the verify process dies (journal 2026-10-19, 2026-10-24).
- Receipt shape (A,B): `src/verify.ts` `runOnce` writes `setup`, `commands`, `end` only in `finally`; Bun skips `finally` on SIGTERM, SIGHUP and SIGKILL (B probe), so the shape does not name the signal.
