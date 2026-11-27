# Observe carries the paused state

## Question

- Q1 Where does observe.ts print the paused state: line 2 always, final line always, line 1 suffix, only when paused?
- Q2 What does a paused observe print: header only, or the full inventory?
- Q3 How are a failed pause read, a non-zero exit and a missing paused line handled, and do re-observations follow the same rule?
- Q4 What proves it: which free tests, which paid live cell, and how the check is counted once `akrogon status` leaves the tick?

### Carries

- Signposts S1a, S2a, S3a, S4a, S5a, S6a (forks/signposts.md).
- Intake: INTAKE.md, Tamdoma/akrogon#160.

## Findings

Blind notes: slots/map-A.md, map-B.md, map-C.md (the opening maps answered this fork). Merged: slots/observe-paused-merged.md. Proposed shape: slots/observe-paused-proposed.md. Rebuttals: slots/observe-paused-rebuttal-B.md, slots/observe-paused-rebuttal-C.md.

- Research, better-than-training (inspected code, 2026-11-25): `src/next.ts` nextCommand passes `isAutomatic: false` for `next <slug>` and `next --all`, so neither honors pause (tests/pause-next.test.ts "manual next all dispatches a paused repo and stays paused"). The watch's own check is the only pause guard. (A,B,C)
- `src/pause.ts` readPaused treats a missing paused.yaml as empty and throws PauseStateError on bad YAML or schema; `globalHome()` reads `AKROGON_HOME`. (A,B,C)
- tests/watch-timer.test.ts `watchUp` and tests/e2e/watch-live.e2e.ts `launchEnvFor` omit `AKROGON_HOME` from the watcher env, so observe.ts would read the wrong paused.yaml, in the live e2e the operator's real one. (B,C)
- tests/fixtures/watch-hook.sh and watch-agent.sh run `akrogon status` and then `next --all` on any output without "paused", ignoring exit code and leaf rows. (A,B,C)
- The paid live cell never pauses. A paused-due proof on an empty or already-failed board passes even when a model ignores pause. `akrogon unpause` runs its own unpausePass. (B,C)
- Intake correction: at a registered root the plain `akrogon status` leaf table and nags are scoped to that repo, and only the run-line block (lineRuns) shows other repos. The two-source cause stands. (B,C)
- Free charting observations: slots record in `## Charting proofs` below.
- Leaf review (slots/leaf-review-B.md, leaf-review-C.md): stand-in gating, shell shape, fresh leaf before each dispatch assertion, transcript read at the paused due, no-read proof by shim-log comparison, grant effects naming the tier core paths and pi transcripts, adopted into the drafts. C proposed `--session-dir` under the tier root; A kept the launch and named ~/.pi/agent/sessions in the grant, since changing launch flags extends proof machinery and every paid pi cell already writes there.
- Differences: Q1 line 2 (A,B) vs final line (C). Q2 header only (A,B) vs full inventory (C).

## Taken

A's pick under full autopilot, 2026-11-25T17:52Z, not operator words:

1. Q1: line 1 `session=<name>` unchanged; line 2 always exactly `paused=true` or `paused=false`; then the existing leaf and unreadable lines with formats unchanged. Reason: S4a keeps line 1 and row formats for watchers on old skill text, and the bit is read before the rows it governs. Rejected: final line (C; the bit comes after the rows it governs), line 1 suffix (breaks HC_SESSION parsing and observeReady), only-when-paused (absence as signal), non-zero exit for paused (paused is a normal state). Standing dissent: C preferred the final line.
2. Q2: paused prints only the two header lines, reads no inventory, seats or transcripts, and exits 0. Reason: S1a, a paused check has no rows to act on and makes no hc seat reads, matching today's "paused observes nothing". The pause rule in the skill is what forbids action (C's correction), and the short-circuit removes the rows that invite it. Rejected: full inventory while paused (C). Standing dissent: C preferred full inventory, and named the short-circuit as right if the no-seat-read rule binds, which it does.
3. Q3: observe.ts calls `isPaused(<repo key>)` from src/pause.ts before writing any stdout. A failed read exits non-zero with empty stdout and stderr naming the file. In the skill, a check is valid only when observe exits 0 and line 2 is exactly `paused=true` or `paused=false`; a non-zero exit or a missing or different line 2 is a failed check that reports the error and acts on nothing (C's correction). `paused=true` reports paused and acts on nothing. Every re-observation in `## Judge` and `## Consult` follows the same rules. Rejected: a default when the read fails (S2a), pause in `akrogon config` (a corrupt paused.yaml would break stop.ts), `status --json` or a new CLI verb (a second source).
4. Q4: free proof in tests/hc-observe.test.ts (paused, unpaused, unpause restores, malformed paused.yaml), the stand-ins switched to observe.ts and acting only on exit 0, `paused=false` and at least one eligible `slug=` row (B's correction), watch-timer and stand-in live cells counting and holding checks on an observe-only marker with zero `akrogon status` calls, a free case where a leaf staged after an empty check is acted on at the next due, the doc test flipped, `AKROGON_HOME` in both watcher envs. Paid proof: one live pi watcher cell (the incident harness) showing one observe check per accepted due with no `akrogon status`, no `next` at a paused due while a dispatchable leaf is on disk (B, C correction), and a watcher-attributed `next` for a leaf staged after an empty check. Docs: docs/use/watch-while-away.md, docs/pictures/watch-loop.svg, skills/AREA.md. Reason: S6a, scripts are free-testable, and the model's reading of the new check is model behavior. Rejected: free tests only (cannot show a model stops calling status).

Corrections from the rebuttals (C1 failed-check rule, B2 stand-in gating, B1/C3 dispatchable leaf at the paused due, B3/C4 intake wording) are adopted here. Their focused check is the leaf-review exchange, where B and C review the drafts as implementers.

## Charting proofs

- `bun test tests/hc-observe.test.ts tests/pause-next.test.ts` via `akrogon run-check --holder <chart>/direct --name hc-observe`: 30 pass, log direct/check-hc-observe-1795627739270-3854659.log, 2026-11-25, identity: operator's local account, no outside system. Limits: proves today's observe output and that manual next ignores pause; not the new output.
- `env AKROGON_E2E=watch-preflight AKROGON_E2E_KIND=pi ... bun test tests/e2e/watch-live.e2e.ts --test-name-pattern preflight` via `akrogon run-check --holder <chart>/direct --name pi-preflight`: 1 pass, log direct/check-pi-preflight-1795627734191-3851371.log, 2026-11-25, pi harness launched with real flags in the throwaway tier, no prompt sent, temp root removed. Limits: proves the pi cell launches and lists the skill; not a paid model turn.
- Recorded paid pi shell runs in issues/timings.jsonl: greens at 119520, 186698, 203433, 233341 ms (watch-timer leaf, 2026-11-21). Limits: the old status-based cell.
