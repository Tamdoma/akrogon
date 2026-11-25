# Design: verify-test-facts

## Binding decisions, verbatim

### Signposts, from forks/signposts.md


A's picks under full autopilot (operator: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."), not operator words:

1. 1a. Removing the failure class beats guarding it (operator value: simplicity, removing over adding).
2. 2a. Free tests catch these mechanical bugs at lower cost (operator values: speed and price).
3. 3a. Fewest moving parts (operator value: simplicity).
4. 4a. Fewest leaves to dispatch and review (operator value: simplicity).
5. 5a. #157 stalls unattended runs and holds capacity; #153 is the widest change and gains from the others landing first.
6. 6a. No migration step to run or get wrong (operator value: simplicity).

Account: the session prioritizes fixing each mechanism in akrogon itself, proving it with free tests, and reusing existing records. It gives up per-repo config knobs, live-run evidence and new record kinds unless a chart shows no other way.

### Test facts, from forks/test-facts.md


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

## Standing design

/home/ivan/.akrogon/releases/085f2f88c3a1920732e10afbc0bad190cf32d540/skills/chart-issues/assets/standing-design.md (reached through ~/.claude/skills/chart-issues). Interpretation for this leaf:

- Every done-criterion is mechanical behavior with one right answer (parsed names, integer ms, subset relations, field presence by scope), proven by own tests at the real boundary: the `akrogon verify` CLI in a temp repo, the same harness tests/verify.test.ts already uses (`a red row stores its failure names when its published log is deleted before any later git call`, `--attempt from the repo root verifies the merge leaf worktree HEAD`). No paid model launch, no live run, no new machinery.
- Command output in tests comes from small shell or bun scripts that print the recorded Bun line shapes (forks/test-facts.md `### Charting proofs` P1, P2), including wrapper chains, interleaving and a `(pass)` line with no `[<n>ms]` suffix. (C) Fixture text copies the observed shapes; it is never re-derived from a regex.
- Each new behavior shows one deliberate break turning its test red (for example, dropping the stream check makes the interleaved timeout test fail).
- The 20 is a storage bound fixed in code, not a check on model output.
- No test keeps a hand-copied list of another file's entries.

## Leaf architecture

Owned surfaces: src/verify.ts (`verifyRunSchema`, `commandRow`, `runOnce`), src/flaky.ts (the Bun line parse beside `failureNames`), their tests, docs/reference/files.md's `verify-runs.jsonl` row.

Interfaces (literal):

- Command row and its `rerun` object gain `timeouts?: string[]` (non-empty, unique, every name in the same leg's `failures`) and `durations?: {name: string, ms: number}[]` (`ms` a non-negative integer, names unique). The run gains `attempt?: string`. All optional, so `z.strictObject` still accepts old rows.
- Names in `durations` and `timeouts` use failureNames' naming exactly (bare title; `(unnamed) <innermost stream token>`), so a failure name joins its timeout and duration entries by string equality.
- Stream identity for timeout attachment is the wrapper chain before Bun's `|`, tokenized the way `chain` in src/flaky.ts tokenizes it. A timeout line attaches only to the immediately preceding line of the same chain when that line is a `(fail)`.

Consumers of changed state:

- `failures`: read by src/flaky.ts `flips`, src/verify.ts known-red cover and main-red matching, src/land.ts `taken8Trigger`. Unchanged for every input (binding decision 6).
- `sameCommands` and `greenRun` in src/verify.ts compare `name` and `command`, so new fields never change reuse. Green-receipt reuse writes no row. A command row marked `blocked` gets neither new field (binding decision 1). No writer has set `reused` on a command row since 37d5975e ("drop per-command reuse"); only legacy rows carry it, and only `commandRow` writes the new fields, so a reused row cannot gain them. (B,C,D)
- `runOnce` appends the receipt at pass start and rewrites the whole file at pass end. `attempt` goes into the first append (from `passCaller(record).attempt`), so a pass that crashes still carries it.

Exclusions: no change to `samePass` (binding decision 5); no change to src/attempts.ts or merge-attempts rows; no log retention change (b9fe5027 stays); no change to how verify-runs.jsonl is stored or rewritten; durations at leaf scope stay out (binding decision 4); no config knob for the 20.

Open for the plan: whether `failureNames` and the new parse become one scan or the new parse reuses failureNames' line grammar beside it (binding decision 6).
