# Review A: flaky-merge-flips

Base: `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444` — reviewed head: `a57063475d576449f03006d5437487533f6ebbcd` (branch diff: `src/verify.ts` +14, `src/flaky.ts` +106/−9, `tests/flaky-merge.test.ts` +402, four doc files +5/−5).

## Verification evidence

- `akrogon verify` green on the reviewed head: `verify leaf a5706347: green` (format, typecheck, `test` 1270 pass), receipt in `implementation/check-test-1795292845815-112941.log`.
- Live smoke: new `flips` on the live repo ledger (522 runs) produced the identical 138 lines as the pre-change build — same-tree behavior preserved, no eager git calls.
- `git patch-id --stable` on a multi-file and on a binary+mode-only diff each emits exactly one stable id — the single-field take in `ownPatchId` is correct.
- `git merge-base` exits 128 for an absent ref and 1 for unrelated history; `command()` throws on any nonzero → the F1 defect below.
- `Test-Change:` trailers in `4f5e3fd2..HEAD`: one, `tests/flaky-merge.test.ts prettier whitespace reflow only; no expectation changed` — verified: the a5706347 diff of that file is whitespace-only.

## Fix

- **F1 — `verify` now fails the whole pass before any check when `git merge-base` cannot resolve.** `ownPatchId` runs `command(['git','merge-base', sha, trackingRef(repo)])`, which throws on nonzero. `merge-base` exits 1 for a valid commit on unrelated history and 128 when `refs/remotes/<remote>/<branch>` is absent (preflight's C3 state is exactly this — a repo whose tracking ref is missing until the first fetch). Realistic source: `akrogon verify --sha <detached/unrelated commit>` (a documented flag) or `akrogon verify`/`verify --attempt` on a repo lacking the tracking ref — previously these ran checks and wrote receipts; now the pass dies inside `runOnce` before `createSparseWorktree`, leaving only the receipt stub and no receipt the phase gates accept. Consequence today: a documented command path and a documented repository state break on a metadata probe unrelated to check behavior; the field's contract (absent = cannot prove unchanged) already covers exactly this case. Criterion/gap: the design's row-schema change ("a new optional field recorded at run time") plus the brief's criterion 1, which requires the field only where it tells own commits apart — a merge-base-less run cannot prove unchanged either way and should record nothing. Suggested repair (check.repair's call): take merge-base through `run()` and treat nonzero as `undefined` — no `patch_id`, same as an empty own diff; keep `command()` for the `git diff` since `rev-parse` already proved the sha.

## Nits

- **N1 — `broken()` scans `completed` per pair.** `flips` runs the between-scan (with possible log reads per entry) once per cross-tree green resolution. Ledger sizes make this trivial today; deferred because no measurable cost is shown. Promotion evidence: a slow `akrogon flaky` run profile on a large ledger.
- **N2 — `pair()` keeps dead guards.** `prior.run.scope !== 'merge'` / `prior.run.compares !== undefined` cannot trigger via `mergeRed`, and `prior.run.leaf !== green.run.leaf` cannot trigger via either map key. Harmless defense-in-depth; deferred as a readability matter only.

## Docs and tests

- Docs reviewed: `files.md` (row + Flaky report section), `commands.md`, `checks.md` `flaky` lines, `src/AREA.md` verify bullet — all match the code's rule: merge-scope non-`compares` consecutive pairs, `patch_id` equality, nameless names same-tree only, `compares`-or-ancestor between-guard. No other doc or skill file describes the flaky rule (grep over README/docs/skills clean). `tests/AREA.md` groups files and never names `flaky.test.ts` — no line owed.
- `src/AREA.md` names `src/flaky.ts`, `src/verify.ts`, `src/verify-pass.ts`, `src/run-check.ts`, `src/evidence.ts`, `src/config.ts`, `src/preflight.ts`, `src/state.ts`, `src/guard.ts`, `src/hc.ts`, `src/notice.ts`, `src/next.ts`, `src/batch.ts`, `src/shell.ts`, `src/timing*.ts`, `src/seat.ts`, `src/transcript.ts`, `src/listen.ts`, `src/admission.ts`, `src/scope.ts`, `src/stop*.ts`, `src/evidence.ts`, `src/pack*.ts`, `src/flock.ts`, `src/reconcile.ts`, `tests/helpers.ts` — all exist (checked from repo root).
- Planned tests vs criteria: all three done-criteria have running proofs (`tests/flaky-merge.test.ts` 7/7 green on head inside the green verify; `tests/flaky.test.ts` 8/8 green). Deliberate-break evidence recorded in `plan.md` for the same-tree-ignores-`patch_id` condition. No missing or mocking test. The test file's `pair`/`run` helpers construct valid rows; `seedRun` covers the parse path through `verifyRunSchema`.
- Report matches the artifacts; count audit trivially clean (no covered launches, no `Missing:` lines).
- No `learnings/LESSONS.md` change claimed.

## Verdict

`fix` — F1.

## Operator actions

None.
