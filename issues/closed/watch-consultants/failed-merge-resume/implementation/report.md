# Implementation report: failed-merge-resume

Serial-solo run (plan.md Wave 1, unit U1 — `implement: subagents` with every wave holding one unit).

## Base and head

- Base: `1502fbdf362e2b6dc3c721722532d6fce8a9b622` (`AKROGON_BASE` at plan and implement; `git fetch` showed the branch already on the remote tip, no rebase movement).
- Head: `e9836c91790f9c1e70c915d99b0b1f1502878eae`
- Commits: `f0cd0f50` test (red-first, plan.synthesis), `e9836c91` product fix + doc clause.

## Changed files

- `src/phase.ts` — `commitMove` computes `resumedBatch`: on `leavingFailed`, a batch whose `candidate === undefined` is dropped (`batch: undefined`); a candidate-holding batch keeps `{...batch, notified: undefined}` exactly as before; all other moves unchanged. Root cause: `mergeTurn`'s `reconcileBatch` returns early for an applied batch without a candidate (`inMerge && !(applied && candidate)`), so a leaf resumed `failed -> merge` after the base moved was dispatched on the stale attempt/top by `dispatchMergeLeaf`. A cleared batch makes the leaf an ordinary merge leaf and `mergeTurn` builds a fresh batch on `localBase` after fetch. Placement chosen over `reconcileBatch` per plan.md D1: the reconcile path appends a `red` row to `issues/merge-attempts.jsonl` naming the stale attempt, which the criterion's "no prompt or attempt names the stale attempt or top" forbids under the strict reading; the `commitMove` clear discards the record like the existing discarded interrupted build.
- `docs/reference/state-and-phases.md` — one clause in the `batch` paragraph: a record with no `candidate` is dropped when the leaf leaves `failed`, so the merge turn rebuilds on the current base. No agent doc affected.
- `tests/batch-dispatch.test.ts` — new test `a failed holder with no candidate is rebuilt on the new base, never dispatched on its stale attempt` (committed at plan.synthesis with its `Test-Change:` trailer): real `next --all` builds the applied batch on the base tip, the leaf is written `failed` with a `blocked` failure and `owner: 'seat'`, `pushMain` moves `origin/main`, then `akrogon phase aa merge` + `akrogon next aa`. Assertions: fresh `batch.attempt`, `built_on = <newTip>`, `top` descends from `<newTip>`, no prompt or `merge-attempts.jsonl` row names the stale attempt or top, and a handoff to the seat dispatches the fresh `attempt`/`top` prompt.

## Commands run (kept output)

- `check plan-test-c1-red: 1 …/implementation/check-plan-test-c1-red-1795285429058-250788.log` — pre-fix run, intended red: `expect(state.batch?.attempt).not.toBe(staleAttempt)` failed (`Expected: not "560cbb7e-…"`); 25 pass / 1 fail in the file. (plan.synthesis)
- `check impl-c1: 0 …/implementation/check-impl-c1-1795285467697-279802.log` — `bun test --timeout=30000 --parallel=4 --no-isolate tests/batch-dispatch.test.ts` on `e9836c91`: 26 pass / 0 fail. Proves criterion 1 (new test green) and criterion 2 (existing landed-candidate test green, unchanged). ~5 s.
- `check impl-batch-files: 1 …/implementation/check-impl-batch-files-1795285491490-298852.log` — batch-merge/batch/green-merge/merge-attempts/phase/next files: 339 pass / 1 fail, `a throwing self-update still lets phase merged commit and next dispatch` (selfUpdateCli path, unrelated to the diff).
- `check impl-batch-files-retry: 0 …/implementation/check-impl-batch-files-retry-1795285523803-415455.log` — same command, retry: 340 pass / 0 fail. The single failure is recorded `inconsistent` (no cause in the leaf's diff; green on retry).
- `akrogon verify` on `e9836c91` — three runs. Run 1: 5 ×15 s per-test timeouts in `batch-dispatch.test.ts` under verify's fresh-checkout run. Run 2: 1 fail, `next --all, --resume and manual next record the registered or selected repos before dispatch` (selfUpdateCli, same file that flaked in the narrower run). Run 3: `verify leaf e9836c91790f9c1e70c915d99b0b1f1502878eae: green` — setup 0, format 0, typecheck 0, test 0 (1245 pass / 0 fail); kept log `…/implementation/check-test-1795286777608-2631781.log`. Each ~2.5 min.
- `akrogon verify --known-red` on `e9836c91` — head run reused (completed red rows exist), base `1502fbdf` run green (1244 pass / 0 fail), verdict `fail`. Head/base log judgment (A): every red name on the head is a real test title, but none of them fail on the green base, so no cover is established — the head reds are read as `inconsistent` noise: three verify runs on the same committed head produced three disjoint failure sets (5 timeouts, 1 selfUpdateCli flake, 2 transcript/tab flakes) that never repeat, each passing in the sibling run, and the criterion files passed green in both narrower runs and the final verify. The leaf's diff is two product lines in `commitMove` plus a doc clause; it cannot reach `tests/next.test.ts`'s self-update wrapper, transcript fixtures, or timer timeouts. A base-red is not filed: the base run is green, so there is no red on the base to file.
- Grant/count lines: no paid or live launches were made or needed; no credentials were required (`akrogon status` showed no `Missing:` lines, `env_names: []`).

## Done-criteria

1. Red-first stale-resume criterion — proven: red on `f0cd0f50`-era base (log above), green on `e9836c91` (`check impl-c1`), and green inside the final whole-suite verify (`check-test-1795286777608-2631781.log`). The test asserts every clause: fresh attempt, `built_on` on the new remote tip, `top` a descendant of it, no prompt or attempts-ledger row naming the stale attempt or top.
2. Landed-candidate reconcile unchanged — proven: `a failed holder with a landed candidate is told to move back, then reconciles without run or push` stays green unmodified in `check impl-c1` and the green verify.

## check.fix (merge attempt d8d2cbd7)

Merge rebase target `eb4d64e9b3fd27307cce1f9ac794a5211b72433b`; rebased head `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444` (range-diff unchanged per review-B.md). The rejected land run's `bun test` failed on `tests/door-reset.test.ts:270` — `agy: the reset helper runs its stages in order` saw only `started` where six stages were expected — twice (`check-test-1795287110530-3430450.log`, retry `check-test-1795287307162-3775166.log`), `--known-red` `fail` with the case green on base.

- Reproducing command: `bun test --timeout=30000 --parallel=4 --no-isolate tests/door-reset.test.ts` on the rejected head `4f5e3fd2`.
- `check fix-repro: 0 …/implementation/check-fix-repro-1795287364694-4130243.log` — 16/16 green on the rejected head; the assertion's observed stages depend on the stand-in agy's timing, so the merge-run failure is the same transient transcript flake seen in the implement-end verify runs. No repair needed and none made (no product change commits).
- `akrogon verify` on `4f5e3fd2`: setup 0, format 0, typecheck 0, test 0 — `verify leaf 4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444: green`, 1263 pass / 0 fail (`check-test-1795287533223-4134218.log`).
- Reproducing-command rerun: `check fix-repro-rerun: 0 …/implementation/check-fix-repro-rerun-1795287542612-289987.log` — 16/16 green.
- Both done-criteria stay proven by this verify's green suite (their test file is unchanged since `impl-c1` and ran green inside it).

## Known limitations / unverified criteria

- None. The `inMerge` sibling of the defect (an applied, candidate-less batch already in `merge` after a push error) is out of this leaf's locked scope; it remains reachable but is not the resumed-from-`failed` path the criterion names.
