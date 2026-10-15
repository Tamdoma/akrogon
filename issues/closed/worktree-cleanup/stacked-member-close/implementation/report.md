# Report: stacked-member-close

Serial-solo run (plan has one unit). Implemented by A directly, no workers.

## Changed files

- `src/next.ts` — `reconcileBatch` collects `closable` members under the lock (`batch.members` at phase `merged` not in `moved`) and after the lock runs close-then-dispatch for `moved` + `closable`. Restores the pre-6640ab5 `closableMembers` step, plus dependent dispatch per the brief.
- `src/phase.ts` — `finishPush`'s landed branch saves `candidate: pending.candidate` (alongside `top`). Without it the record had no `candidate`, so `reconcileBatch` read the landed stack as red and cleared it — the recovery route (criterion 2) could never reach the member-close step.
- `docs/guide/merge.md` — reconcile paragraph now states the pass closes each merged member's tab and dispatches its dependents.
- `tests/batch-dispatch.test.ts` — the two planned criterion cases (committed before product code), plus one assertion correction by A (see below).

## Commits (base → head)

- Base: `f3557d8` (= origin/main at implement; branch was already current, refresh was a no-op)
- `c414386` test: stacked member tabs and dependents left behind (red-first, `Test-Change`)
- `a4662f2` fix: record the landed candidate on push-result recovery
- `98331e6` fix: close merged stacked members and dispatch their dependents in the merge pass
- `24dd2b5` test: assert member tab ids rather than the whole tab list (A's one-correction exception, `Test-Change` trailer citing real output: dependent dispatch creates new tabs `w1:t14`/`w1:t18` in the same wake, so member-close is asserted by member tab ids, not whole-list equality)

## Proof per done-criterion

Command: `akrogon run-check --name 'test batch-dispatch' -- bun test tests/batch-dispatch.test.ts` on head `24dd2b5` → **30 pass, 0 fail**.

1. Normal landed push closes member tabs and dispatches dependents, no hook event → `a landed stack closes each member tab and wakes member dependents at once` (pass).
2. Lost-reply push confirmed by later fetch → `a push reported lost but landed closes member tabs in the recovery wake` (pass); drove out the `finishPush` candidate bug, now fixed.
3. Holder tab stays for idle close → `toContain(aaTab)` assertions in both tests (pass).
4. Dependent started once → second `next --all` after merge keeps `plan-issue` prompt count at 2 (pass).

`akrogon verify` on `24dd2b5`: **green** — 847 tests pass, 0 fail, typecheck clean (receipt `verify leaf 24dd2b5...: green`).

## Commands run

- `akrogon run-check --name 'plan stacked-member-close member tabs' -- bun test tests/batch-dispatch.test.ts -t "closes"` (pre-implementation, red): member tabs still present, intended red recorded in plan.md.
- `akrogon run-check --name 'test batch-dispatch' -- bun test tests/batch-dispatch.test.ts` (post-implementation): 30 pass, 0 fail (~15s).
- `akrogon verify`: green (~170s test stage + typecheck), ~3m wall time.

## Known limitations

- A member that reaches `merged` with no tab is collected but closes nothing (guarded); matches pre-6640ab5 semantics.
- A member still in `merge` on a drifted branch is not collected; its tab closes when its own merge lands — unchanged semantics.
- Members `moved` and `closable` get identical treatment (close + dispatch); the old code never dispatched closable dependents — this is the brief's added requirement, not a regression.

## Unverified criteria

None.
