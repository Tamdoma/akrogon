# Slot B territory map

## Cause

**F1. Proven from transcripts: 21 leaf runs hit Pi's 120-second shell-tool timeout.** Twenty omitted the tool `timeout`; watch-session explicitly set `timeout: 120`. I joined each unfinished leaf receipt to its preceding Pi bash call and matching tool result. Receipt lines: 19, 55, 76, 78, 83, 84, 88, 114, 132, 145, 148, 150, 154, 158, 184, 186, 189, 193, 194, 247, 264 in `issues/verify-runs.jsonl`.

Recheckable examples under `/home/ivan/.pi/agent/sessions/`:

- `--home-ivan-.akrogon-worktrees-akrogon-identical-ignored--/2026-10-19T17-13-07-423Z_01a15527-165e-724b-9bb1-eb29f6c92fed.jsonl`: calls/results 147–150 time out twice, then call 151 sets tool timeout 900. Later calls omit it again.
- `--home-ivan-.akrogon-worktrees-akrogon-state-home--/2026-10-15T23-03-02-858Z_01a141ce-03c9-701f-9416-da2e46a9d095.jsonl`: 277–280 repeat the timeout. Call 281 adds shell `timeout 300`, which does not extend the enclosing tool's limit.
- `--home-ivan-.akrogon-worktrees-akrogon-watch-session--/2026-10-24T18-47-41-645Z_01a16f3d-774d-733e-a0fa-35349413bbed.jsonl`: call/result 214–215 explicitly use 120, then 216 uses 1800.

The live cause of the default is `/home/ivan/.pi/agent/extensions/tamdoma-pi-tweaks/shell-timeout.ts`, `boundShellTimeout`, injected into bash calls by `index.ts`'s `tool_call` handler. It already tells seats to raise the timeout for suites. `akrogon config` supplies native claude/codex/pi launch templates without a shell timeout override. No Codex caller is implicated in these 25 receipts.

**F2. Proven from transcripts: the four checkout runs were deliberately stopped Claude background tasks.** In `/home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/bacd17ee-47fd-4d72-9f7c-ee61ee8698cf.jsonl`, launches/stops are:

| Receipt line | Task | Launch line | TaskStop line | Stop UTC |
| --- | --- | --- | --- | --- |
| 235 | bj9mv3l96 | 2234 | 2364 | 15:39:03 |
| 240 | bes04a3xx | 3361 | 3445 | 16:27:40 |
| 241 | bc3g0jrtg | 3452 | 3534 | 16:30:44 |
| 242 | b0l43eetd | 3617 | 3806 | 16:50:46 |

These occurred on October 24. Line 2360 explicitly says the first verify tested an old head, so the seat stopped it before rebasing. This was cancellation, not a two-minute Claude timeout.

**F3. Proven ledger correction:** the current 301 receipts contain 25 unfinished records: **21 leaf, four merge**. The intake's 24 leaf plus four merge is inconsistent. Three checkout records never reached a `test` check_start: timings lines 7223–7226, 7233–7236 and 7244–7247 contain only completed setup/format. The contemporaneous Claude transcript shows a full-suite queue. Therefore unfinished receipts and unmatched check starts are not a one-to-one population.

**F4. Proven code mechanism, supported by a runtime probe:** `src/verify.ts:runOnce` appends an empty receipt before checkout and writes setup/results only in `finally`; `end` is assigned only on normal completion. There are no termination handlers on this path. A file-free Bun try/await/finally probe exited on SIGTERM, SIGHUP and SIGKILL without running finally. Thus this shape does not identify SIGKILL specifically. Ordinary exceptions can also leave no `end`, although finally normally saves their accumulated results. Exact historical kill signals and native harness kill internals remain unproven.

**F5. Proven journal behavior: no sustained surviving test scope in this cohort.** Queried all 21 Pi test scope IDs from their unmatched timings and the first checkout test scope. Their terminal systemd journal records occur in the same second as the corresponding timeout/TaskStop. Examples: `akrogon-run-5e9e2ddc-d082-4316-8fc1-529aedf5e247.scope` ends at 2026-10-19 17:26:30 UTC; `akrogon-run-3acbe0bc-4394-43c1-92e4-424034df9639.scope` at October 24 17:17:52; checkout `b02386f3-404a-4363-880e-823c1915b4d6` at 15:39:04. Journal commands must give explicit UTC input; displayed local times are two hours later. This proves unit termination, not the precise signal or which killer won the race.

**F6. Existing safeguards, inspected in code:** `checkedRun` starts `scope.ts:startRunGuard`, whose independent service watches the wrapper PID and stops its scope. `admission.ts:sweepStale` also stops stale run units. `reconcile.ts`'s registered `verify-*` branch removes dead-owner copies, subject to live-pane/process vetoes; `reconcileHost` clears failed run units. None finalizes abandoned receipts. `verify.ts:completed`, `reuseSource` and `requireGreenReceipt` exclude incomplete runs. Tests explicitly cover wrapper SIGTERM/SIGKILL cleanup and rejection of incomplete reuse (`tests/run-units.test.ts`, `tests/verify.test.ts`). I inspected these tests, not reran them.

## Forks

**D1. Prevention ownership.** Options: correct seat tool invocations; change Pi's global default; move verification into a detached supervisor. Pick caller correction first. Replace the existing wait instruction with concrete harness-specific tool usage at the verify entry points, covering implement/check.fix, check.review/check.repair, merge retries and chart direct. Pi needs the bash **tool** timeout above the complete run budget, including queue wait and head/base verification. Codex yielding requires continuing to wait on the same session. Claude should keep the task alive until completion or intentionally cancel it. Cost: small skill change plus a representative live run beyond 120 seconds. Limitation: instructions remain probabilistic. Removing Pi's global timeout affects unrelated commands in another repo; a supervisor adds ownership, polling and cancellation machinery. Do not add command-string detection to akrogon to guess the parent tool's budget.

**D2. Receipt meaning.** Options: retain absent `end` as incomplete; catch signals; persist stages and mark dead owners abandoned. Pick existing semantics for this fix. This truthfully refuses cancelled evidence and avoids schema changes. Cost: historical cause remains in transcripts/journal. If durable interruption reporting is required, use the existing dead-owner reconciliation path and receipt lock, preserve completed-only reuse, and record discovery as abandonment rather than inventing the original stop time or signal. Signal handlers alone cannot cover SIGKILL or host loss. Incremental writes alone neither prevent wasted suite time nor make incomplete greens reusable.

**D3. Cleanup.** Options: add another guardian; rely on current guard/admission/reconcile. Pick current mechanisms. Cost: cleanup remains eventual and may be kept by live-process/pane vetoes. The inspected cohort does not justify another process lifetime mechanism. Never remove a checkout while a surviving process uses it.

## Practitioner questions

**Q1.** Is success fewer accidental cancellations, durable explanations for every abandoned receipt, or both? Only the first has a demonstrated caller defect here; D2 is separate scope.

**Q2.** What full invocation budget covers admission waiting, sequential checks, parallel merge members and a possible head/base pair? A single suite duration is insufficient (`withAdmission`, `runOnce`, `verify --known-red`). Avoid turning 900 seconds into a universal runtime promise.

**Q3.** Is a deliberate obsolete-head cancellation acceptable? The first Claude stop says exactly that. Preserve cancellation as incomplete evidence, then verify the final head. Do not count all four as preventable two-minute waste.

## Pitfalls

**R1. Duplicate instruction without changing behavior.** `skills/implement-issue/SKILL.md`, Shared context, already requires foreground execution and a sufficient tool timeout. Pi's extension also already warns. Remove ambiguity by replacing that instruction with actual tool-field guidance and judging a live result, not adding another general warning or exact-word test.

**R2. Losing exit status through reporting pipelines.** Historical calls pipe verify into tail/grep. Existing implementation rules already require preserving the command's status. Use that rule; a quiet pipe or successful tail cannot establish verification success.

**R3. Mistaking cleanup for successful verification.** Guard shutdown, reset-failed and checkout removal cannot recover missing test evidence. Keep `completed` gating unchanged. Existing reuse already avoids rerunning commands proven green by completed same-tree/scope/name/command records.

## Proposed split

**L1. One small caller-workflow leaf**, limited to the four existing invoking skills. Replace ambiguous waiting guidance, cover the tool timeout versus shell timeout distinction and deliberate cancellation, and validate a real foreground verify that exceeds 120 seconds through the affected Pi tool. Include a known-red/queued budget review without launching unnecessary full suites. No receipt schema or cleanup rewrite. No dependency.

**L2. Conditional abandonment reporting leaf**, only if A selects the additional outcome in Q1. Reuse dead-owner reconciliation and the receipt lock, with evidence that a live verify is untouched, an abandoned verify stays ineligible for reuse, and cleanup still honors surviving processes. Independent of L1, but does not satisfy L1's prevention objective. Do not create a new sweeper or claim an unknowable kill reason.
