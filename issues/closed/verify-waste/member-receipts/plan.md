# Plan: member-receipts

Brief and design agree. `debate: no`, so this plan synthesizes the brief and the locked design directly.

## Decisions

- **D1 Two stages, one worktree.** `runOnce` splits the expected list: `checks` entries (minus `merge_covers` at merge scope) run sequentially first; `merge_checks` entries run concurrently through `Promise.allSettled(checkedRun(...))`. Each member keeps its own `checkedRun`, so its own `run <id>` admission, systemd scope, `akrogon stop-run` handle, log and timing events. `sweepStale` skips live tokens and `writeRecord` names files by token hash, so same-process members are admission-safe. A thrown member rethrows after `allSettled` returns: the `finally` in `runOnce` writes the record with `end` unset and removes `run.path` only then, so siblings settle first.
- **D2 Red `checks` entry blocks the member stage.** Members get a not-run entry mirroring the first red sequential entry: `{ name, command, exit: blocker.exit, log: blocker.log }`, the same shape a failed setup produces today. Non-zero exit means never green, never reusable. Marker files in the criterion tests prove the member script never ran.
- **D3 Per-command reuse.** Before each command runs (setup must be 0), the ledger is searched for a completed run (`end` set, `setup === 0`) on the same `tree` and `scope` holding the same `name` and `command` with `exit === 0`. A reused entry copies the source entry's `exit` and `log` and gains `reused: <source run id>`. Entries write into `ran[]` in `verifyCommands` order regardless of completion order. `greenRun` keeps its fast path; a run whose entries are all reused is a completed green run.
- **D4 Schema.** `reused: z.string().optional()` on the commands entry in `verifyRunSchema`. Optional, so old ledger lines parse for `readVerifyRuns`, `land.ts`, `reconcile.ts` and `flaky.ts` untouched.
- **D5 `requireGreenReceipt` per command.** Passes when at least one completed run exists on the tree under the scope and every expected command has `exit === 0` in some completed run on it, else per-command known-red cover. The single-all-green-run requirement dies.
- **D6 Per-command known-red.** For each expected command with no head-tree green entry: some completed head run holds it red with extractable `(fail)` names, and some completed base run with `compares ===` that head run, `sha === merge-base` and `scope` equal holds the same command with `exit !== 0` and every head name. A base entry at `exit === 0` never covers, whatever its log says. `verify --known-red` keeps its flow (newest red head run, fresh base `runOnce` comparing it) but prints pass/fail from `knownRedReceipt` over the whole ledger, so older pairs can cover other commands.
- **D7 Notices and flaky skip reused entries.** `newRedUnits` ignores entries carrying `reused`, both as red candidates and as green resolvers; the source run's own entry carries the evidence. `flips` in `src/flaky.ts` skips `reused` entries likewise.
- **D8 No-notice on reuse.** A base member that never ran on the head cannot be covered (its mirrored log names the blocker's tests, not its own, or the base member is green), so criterion 3 stays a hard merge refusal, per design.
- **D9 Out of scope.** `merge_covers` meaning, framework config, `package.json`, the root-state guard (framework leaf), `run-check`, `--scope merge` (suite-refusal leaf).

## Read first

- `src/verify.ts` — `verifyRunSchema`, `verifyCommands`, `completed`, `greenRun`, `redRun`, `baseCoversHead`, `knownRedReceipt`, `newRedUnits`, `runOnce`, `verify`, `requireGreenReceipt`, `reportRun`.
- `src/run-check.ts` — `checkedRun` contract: `{ code, log }`, `PublishRefusedError` on early/late owner refusal.
- `src/admission.ts` — `withAdmission` starts at once, `sweepStale` live-token skip.
- `src/flaky.ts` — `flips`, `flakyLines`, `failedTests`.
- `src/config.ts` — `merge_checks`, `merge_covers`, `setupCommand`.
- `tests/verify.test.ts`, `tests/flaky.test.ts`, `tests/helpers.ts` — fixtures, `seedRun`, `greenReceipt`, `callerWorktree`, `spawnFiles`/`finishCaptured` for the live-CLI throw test.
- `docs/reference-index.md` → `docs/reference/checks.md`, `commands.md`, `config.md`, `files.md`, `docs/use/merge-and-announce.md`, `src/AREA.md`.
- Skill lines promising a fresh base: `skills/merge-issue/SKILL.md:79`, `skills/check-issue/SKILL.md:69`, `skills/implement-issue/SKILL.md:40`, `skills/chart-issues/SKILL.md:113`.
- `learnings/LESSONS.md` — no line contradicts this design.

## Interfaces

- `VerifyRun['commands'][number]` gains `reused?: string`. All writers live in `runOnce`; all readers tolerate absence.
- `knownRedReceipt(repo, sha, scope)` becomes the per-command evaluator; `baseCoversHead` is no longer the exit-code authority for `verify --known-red`.
- New private helpers in `src/verify.ts`: per-command green lookup for reuse and gate use; a `coveringBase(runs, head, command, baseSha)`-style predicate.
- `verify` stdout for a reused entry: `verify <name>: reused <run-id> <log>`; for a blocked member: `verify <name>: blocked by <name> (<exit>) <log>`.

## Waves

Wave 1, two units, disjoint owned paths and no shared test resources:

- **U1 — code and tests.** `src/verify.ts`, `src/flaky.ts`. Implements D1–D8. Tests are already committed (`d294f2e`, red evidence below); U1 also fixes any test defect the red run exposed beyond the missing behavior.
- **U2 — docs and skill lines.** `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/config.md` merge_checks row, `docs/reference/files.md` (receipt row, flaky note), `docs/use/merge-and-announce.md` step 1, `src/AREA.md` verify paragraphs (lines ~19 and ~32), `tests/AREA.md` verify line, and the four SKILL.md base-run lines. New wording: merge members run at the same time after the `checks` stage, a green entry on the same tree is reused per command and its receipt names the source run, and `--known-red` reads base-side green receipts instead of rerunning every base command.

Doc files affected: the list in U2 is the complete checklist, one line each. No other doc names verify semantics.

## Criterion → proof map

All test proof commands run through the leaf worktree's `bun test` inside `akrogon run-check`. Red evidence recorded at commit `d294f2e` in `check member-receipts-criterion-tests: 1 implementation/check-member-receipts-criterion-tests-1792878824313-423154.log` (12 fail, 2 pass: the pre-existing merge-covers test and the incomplete-run guard).

| # | Criterion | Proof | Size | Rerun trigger |
|---|---|---|---|---|
| 1 | Concurrent merge_checks | `tests/verify.test.ts` "merge_checks members start before any ends" — m1 sleeps then requires `m2.start` before `m1.done`; m2 requires no `m1.done`. Both exit 0 only under concurrency. | seconds | `src/verify.ts` stage code |
| 2 | Red member doesn't stop siblings | Same file, "a red merge_checks member does not stop its siblings" — `bad` exits 4 instantly, m1 ends at 0.8 s, m2 green only while m1 running; exits `[0,4,0,0]`, own logs, `end` set. | seconds | stage code |
| 3 | Red checks blocks members | "a red checks command blocks every merge_checks member" — exits `[0,5,5,5]`, member logs equal the blocker's log, `*.ran` markers absent. | seconds | stage order, block path |
| 4 | Thrown member | "a thrown member leaves the run incomplete" — owner dir removed mid-run forces `PublishRefusedError` late-refusal; run `end` unset, `m2.done` proves the sibling finished before `run.path` was removed. | seconds | `allSettled` handling, `finally` |
| 5 | Same-tree rerun repays only the red | "a same-tree rerun runs only the red command" (sequential `checks` + blocked member) and "a rerun reuses green merge members" — `reused` names the source run, logs copied, counters prove one execution each. | seconds | reuse lookup, entry shape |
| 6 | Incomplete run never sources reuse | "a result is never reused when its run did not complete" — seeds with `end` unset and `setup: 3` are ignored by reuse and the gate; fresh run has no `reused`. Green today by construction (no reuse exists); it is the required guard for the new filter. | seconds | `completed()` uses in reuse |
| 7 | Changed command text rekeys | "changing one command text keeps sibling results reusable" — command `two` reused, `one` reruns after its text changes. | seconds | reuse key |
| 8 | Old ledger lines parse | "the receipt schema accepts both old entries and entries carrying a reused source run" — `verifyRunSchema` accepts absent and present `reused`. | seconds | schema |
| 9 | Gate across runs | "requireGreenReceipt passes when commands turned green across different runs" — merge scope, c1 green in run A + m1 green in run B passes; empty ledger refuses. | seconds | `requireGreenReceipt` |
| 10 | Known-red pass, mixed runs | "known-red passes when the red head member is covered by a fresh base run" — merge scope, unit head-green in another run, member red in the newest head run; base run reuses green `unit` and reruns member fresh failing `alpha`; exit 0, gate passes. | seconds | per-command cover |
| 11 | Known-red refusal | "known-red refuses when the only base result is green" covers the green-base leg; missing-name, unlinked and incomplete legs stay proven by the seeded table in "a linked pair fails to satisfy requireGreenReceipt" (same evaluator now). | seconds | cover predicate |
| 12 | Base green reused, still refuse | Same test as 11: seeded all-green base run, member entry exits 0 `reused`, log contains `(fail) alpha`, exit 1. | seconds | `exit !== 0` cover rule |
| 13 | flaky ignores reused | `tests/flaky.test.ts` "a reused green entry adds no flip" — skipped reused green, real green still counts once. | seconds | `flips` filter |
| 14 | Docs and skill lines | `akrogon run-check --name 'member-receipts-docs' -- sh -c 'for f in skills/merge-issue/SKILL.md skills/check-issue/SKILL.md skills/implement-issue/SKILL.md skills/chart-issues/SKILL.md; do ! grep -q "runs the base fresh" "$f" && grep -q reuse "$f"; done && grep -q "at the same time" docs/reference/checks.md docs/reference/commands.md'` plus `bun test tests/docs-links.test.ts`. | seconds | doc edits |

`akrogon verify` at implement end supplies the repo `checks` (format, test, typecheck) as its own receipt; no `merge_checks` run is needed since this leaf's `merge_checks` set is empty at AKROGON_BASE.

## Evidence notes

- Red run 2 (latest): `check member-receipts-criterion-tests: 1 implementation/check-member-receipts-criterion-tests-1792878824313-423154.log`.
- The concurrency tests are deterministic: marker files plus sleeps, never wall-time assertions.
- T4 polls `m2.start` for 300 ms after `m1.start`; sequential execution lands `m2.start` only after `m1.done`, so it is red today for the missing concurrency, and green only if the sibling outlives the throw.
- Criterion 6's guard is green today because nothing reuses yet; it exists so the new lookup cannot regress on incomplete runs.
