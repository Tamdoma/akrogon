# Test facts in the verify row

## Question

Q1. Which per-test durations does a finished verify command row keep, so the merge path still answers "how long did this test run at merge" after the log is deleted at leaf close?
- a. The K slowest named tests of the command as `{name, ms}` (failures included), K fixed in code.
- b. Every test as `{name, ms, outcome}`.
- c. Per-file totals, or tests over a duration floor.
- d. Keep the merge verify log itself past leaf completion (undo b9fe5027 for merge scope).

Q2. How is "this failure was a timeout" recorded?
- a. Optional `timeouts: string[]`, the subset of `failures` whose own stream prints Bun's `this test timed out after <n>ms` line, with the same split inside `rerun`.
- b. `failures` entries become objects `{test, ms, timed_out}`.
- c. Inferred from a duration at or above the test timeout.

Q3. How does a land attempt join to its verify runs?
- a. Optional `attempt` on the verify-runs row, written from the pass caller the pass already carries.
- b. A verify run id (or list) on the merge-attempts row.
- c. Both.

Q4. Which runs keep durations?
- a. Every command row with test output, any scope.
- b. Merge-scope runs only (the scope the seed asks about).

### Carries

- Seed: Tamdoma/akrogon#154, copied verbatim in INTAKE.md. Outcome: after a leaf closes, its merge verify record still answers which failures were timeouts and how long tests ran, and a land attempt joins to its verify run.
- Signposts (A's picks, full autopilot), issues/chart/merge-test-facts/forks/signposts.md `## Taken`: 1a fix in the mechanism that fails; 2a free tests at the real boundary; 3a extend existing records with the smallest field, no new record kinds; 4a one leaf per chart; 6a old records keep parsing with no migration.
- Operator instruction (door message 2026-11-24, all handed charts): "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."
- Related: issues/chart/seat-turn-idle/slots/map-merged.md `## merge-test-facts (#154)` and `## Shared facts` (the shared opening map). Another door's open chart issues/chart/footprint (minimal disk footprint, deleted the logs in b9fe5027) is related, not the same outcome.
- No seed decision section; no operator answer on this fork.

## Findings

Exchange files: slots/fork-test-facts-{A,B,C,D}.md (blind), -merged.md, -rebuttal-{B,C,D}.md, -final-shape.md, -final-check-{B,C,D}.md.

- Agreed (A,B,C,D): Q1a bounded slowest list, Q2a `timeouts` subset list, Q3a `attempt` on the verify row. Merged evidence and pitfalls in slots/fork-test-facts-merged.md.
- Sizes (C,D measured 2026-11-25, framework merge logs, bun 1.4.5): every test ~1.5 MB per row; per-file ~65 KB; K=20 ~2.4 KB (cutoff 17.9 s median over 17 logs, C; ~40 s median over 11 logs including 2026-11-22 load days, D); K=50 ~5.8 KB; K=100 ~11.5 KB. verify-runs.jsonl is parsed whole by 11 `readVerifyRuns` call sites and rewritten whole at each pass end; framework ~54 merge rows/day recently.
- Watched test (C,D): capture-review.test.ts ran 121-427 s on 2026-11-22 (rank 2-19) and 6.3-6.7 s on 2026-11-24/25 (rank 46-53).
- Differences kept after rebuttals: K (B 20, C 50, D 100); rerun placement (B,C full-run list at top level, A,D per leg); duration scope (D every scope); `samePass` gains attempt (C yes, A,B,D no; D: a merge pass median 471 s would run twice).
- Final-shape check: B no defect. C: item 5's "recoverable by tree" is false for a red joined pass (attempt rows carry no tree, and `tested_top` is written only after a green verify; 91 of 92 red framework attempts since 2026-11-21 lack it). D: item 2's timeout line must allow the stream chain prefix (every framework timeout line is chain-prefixed). Both adopted as restatements; neither adds a mechanism.

### Charting proofs

- P1 Bun output lines. Command: `bun test ./p.test.ts > out.log 2>&1` on a scratch file with a 0 ms pass, a 1200 ms pass, an assertion failure and a 50 ms-limit test sleeping 500 ms, run twice: with the door's env (CLAUDECODE=1) and with `env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT`. Identity: local user, no credential. Version: bun 1.4.5. Date: 2026-11-25. Result: without CLAUDECODE, `(pass) fast pass [0.01ms]`, `(pass) slow pass [1200.83ms]`, `(fail) assert fail [0.18ms]`, `(fail) times out [50.07ms]` then `  ^ this test timed out after 50ms.`; with CLAUDECODE=1, no `(pass)` lines print at all; a thrown error with the same words prints `error: this test timed out after 50ms.` before its `(fail)` line, never the `  ^` form. Cleanup: scratch folder removed, verified. Limits: one unwrapped file; says nothing about wrapper chains or interleaving (P2 covers that); a future bun version may change the format.
- P2 Real framework merge logs (read-only, 2026-11-25, bun 1.4.5): check-verify-1795568767546-3477817.log holds 12,077 chain-prefixed `(pass) <title> [<n>ms]` lines; check-verify-1795549654908-735600.log and check-verify-1795566622096-2368929.log hold `<chain> |   ^ this test timed out after <n>ms.` right after the same chain's `(fail)` line, repeated in the end summary (D, B scan: 2 pairs, 0 separated). Passes too fast to time print no bracket: 123 and 130 unbracketed `(pass)` lines in check-verify-1795487484756-1065562.log and check-verify-1795553672666-2146688.log (C, leaf review 2026-11-25); C's probe saw sub-0.005 ms passes print `(pass) <title>` alone, while A's 0.01 ms pass printed `[0.01ms]`. Cleanup: none needed. Limits: framework's wrapper format only.
- P3 Agent-env exposure: akrogon src/run-check.ts `constructedEnv` copies only an allow-list plus repo `env`/`pass_env`, so verify commands do not inherit CLAUDECODE; P2's 12,077 pass lines confirm pass lines print on the merge path. Limits: a repo listing CLAUDECODE in `pass_env` would lose its pass lines and so its green durations.

## Taken

A's pick under full autopilot, 2026-11-25, not operator words: 1a (K = 20, failures always included), 2a, 3a, 4b, rerun facts per leg, `samePass` unchanged.

Binding decisions:

1. Durations (Q1a). Each finished command row built from its own output gets optional `durations: {name, ms}[]`: the 20 slowest Bun-timed tests of that output plus every name in that leg's `failures` that has a timed line. `ms` is a rounded non-negative integer. Names follow failureNames' rule exactly (bare title, `(unnamed) <innermost stream token>`); a name seen twice keeps its max ms. Only anchored Bun lines `[<chain> | ](pass|fail) <title> [<n>ms]` count; a line with no bracket stores nothing. Absent when no timed line parses. Blocked and reused rows never get the field.
2. Timeouts (Q2a). Optional `timeouts: string[]`, non-empty, unique, a subset of the same leg's `failures`: names whose own stream prints `[<chain> | ]  ^ this test timed out after <n>ms.` as the next line of that same chain after its `(fail)` line. `(script)` and `(no test name)` never enter it. `failures` stays byte-identical to today. Written in every scope.
3. Rerun legs. Each leg's facts sit beside its own log: the first (full) run's `durations` and `timeouts` inside `rerun`, the rerun leg's own at top level; top-level `timeouts` is a subset of top-level `failures`. A reader wanting the full-suite list reads `rerun.durations` when `rerun` exists, else `durations`.
4. Scope (Q4b). `durations` only on merge-scope rows, base comparison (`compares`) rows included. Stated limit: in a repo whose leaf and merge command sets match, a green leaf row reused as the merge receipt carries no durations.
5. Join (Q3a). Optional `attempt` on the verify-runs row, copied in `runOnce` from the pass record's caller when present. Meaning: the attempt that launched the pass. `samePass` is unchanged. Stated limit: a later attempt that joins a live pass gets no row with its own id; when that pass ends green its attempt row's `tested_top` joins it by sha, and when it ends red only the attempt row's holder and start/end window against the verify row's leaf and start/end join it. A reused green receipt writes no row; `tested_top` joins it by sha.
6. One rule for names: failureNames stays the name source, or one scan returns names, timeouts and durations together (Open for the plan); either way `failures` output is unchanged for every input.
7. Old rows parse unchanged: every new field optional (signpost 6a). Readers that compare commands (`sameCommands`, reuse) ignore the new fields.

Reasons: signpost 3a (smallest field) and the operator's speed-and-price value set K = 20: a relapse of a watched test from 6 s to 88 s is visible (it enters the list), and an absent test is known to sit below the cutoff. Failures always included so a fast-limit timeout keeps its time (B,C,D). Per-leg rerun facts keep the existing rule that every fact sits beside its own log (A,D). Merge scope only because leaf rows are 57% of rows and no one asks about leaf durations (A,B,C). `samePass` unchanged because adding attempt would rerun a ~8 minute suite concurrently on overlap, adding the load this chart's seed is about (A,B,D).

Rejected: 1b, 1c, 1d (size, unbounded, footprint); 2b (changes an existing field's type, against 6a); 2c (Bun overshoots limits and one command mixes four limits); 3b, 3c (nine scattered writers, two copies can disagree); 4a (2.4x bytes for no consumer).

Pick against recommendation: A's blind notes said K = 10, failures not included and `slowest` following the split; the merged evidence moved A to K = 20 with failures included.

Standing dissent: C and D hold a larger K (50, 100) so the watched test at ~6.5 s stays in the list. B and C hold the full-run duration list at top level with none in `rerun`. D holds durations in every scope. C holds `attempt` in `samePass`.
