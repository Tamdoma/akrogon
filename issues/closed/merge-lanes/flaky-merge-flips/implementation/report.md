# Report: flaky-merge-flips

## What was built

`akrogon flaky` now counts a named unit red-then-green across a rebase: every `verify` receipt records `patch_id` (the `merge-base..sha` stable patch id of the verified commit's own diff), and `flips` pairs a leaf's consecutive merge-scope runs on different trees when the ids match and no base (`compares`) or landed-main run failed that unit between them. Same-tree and nameless behavior are unchanged.

## Base and head

- Base (AKROGON_BASE, origin/main at refresh): `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444` — refresh ran before the wave and again after all commits; branch was already up to date both times (no move).
- Committed head: `a57063475d576449f03006d5437487533f6ebbcd`
- Branch commits: `11500af8` tests (plan.synthesis), `1267ee9d` code (u1 cherry-pick of `6bf8305`), `1998a00e` docs (u2 cherry-pick, reflow pruned by A), `a5706347` prettier format of touched files.

## Changed files and reasons

- `src/verify.ts` — `patch_id` optional on `verifyRunSchema`; `ownPatchId` (merge-base vs tracking ref, `git diff | git patch-id --stable` via `sh -c` args); `runOnce` records it, absent on empty diff.
- `src/flaky.ts` — `flips` reworked: pending entries carry `{item, run}`; same-tree key gains `run.leaf`; merge-scope consecutive sequence per `leaf\0name\0command` pairs across trees on equal `patch_id` with the nameless filter and the between-guard (`compares` or ancestor-of-tip red run ending strictly between); `cat-file -e` guards evicted shas, tip resolved lazily once.
- `tests/flaky-merge.test.ts` — the leaf's 7-test proof file (plan.synthesis commit, prettier-formatted at `a5706347`, whitespace only).
- `docs/reference/files.md`, `docs/reference/commands.md`, `docs/reference/checks.md`, `src/AREA.md` — the cross-tree rule and the `patch_id` field.

## Worker returns (wave 1, two workers, both landed)

- u1 (code): commit `6bf8305` → cherry-picked `1267ee9d`. `check flaky-merge: 0` (7 pass), `check flaky-existing: 0` (8 pass), tsc clean.
- u2 (docs): commit `b51ed5d6` → A pruned a prettier reflow of two files outside the repo's format set before landing as `d87929a3` → cherry-picked `1998a00e`. `check docs-format: 0`.
- Both worker worktrees removed after landing.

## Commands run and results

| Command | Commit | Result | Log |
| --- | --- | --- | --- |
| `akrogon run-check --name flaky-merge -- bun test tests/flaky-merge.test.ts` | `1267ee9d` | exit 0, 7 pass | `check-flaky-merge-1795292673831-101856.log` |
| `akrogon run-check --name flaky-existing -- bun test tests/flaky.test.ts` | `1998a00e` | exit 0, 8 pass | `check-flaky-existing-1795292676472-104908.log` |
| `akrogon verify` (format, typecheck, test on fresh checkout) | `a5706347` | green receipt; `verify leaf a5706347: green`; test leg 1270 pass / 86 files / 148.56 s (~2.5 min) | `check-test-1795292845815-112941.log` and sibling `check-format`/`check-typecheck` logs |
| earlier `akrogon verify` | `1998a00e` | red: `format` exit 1 — prettier flagged `src/flaky.ts` and `tests/flaky-merge.test.ts`; `test` recorded `blocked`; repaired by `prettier --write` + commit `a5706347`, rerun green | `check-format-1795292682084-107454.log` |

## Done-criterion proof

1. Cross-tree red→green counts one flip — proven by `a named unit red then green on the leaf's next merge run across a rebase lists one flip` (flakyLines + `akrogon flaky` CLI on seeded rows) and `a verify receipt records the merge-base..sha patch id, and none on an empty own diff` (real verify pass, `patch_id` equals independently recomputed value; `check flaky-merge: 0` on `1267ee9d`).
2. Exclusions (nameless, changed own commits, different leaf, fieldless row, non-consecutive pair, breaking base/landed-main run, non-breaking variants) — proven by the five guard tests in `tests/flaky-merge.test.ts` (`check flaky-merge: 0` on `1267ee9d`).
3. Same-tree counts as today and pre-change rows parse and count — `same-tree pairs count as today, with or without the new field` plus the unchanged `tests/flaky.test.ts` suite (`check flaky-existing: 0` on `1998a00e`), all inside the green `verify test` leg on `a5706347`.

## Known limitations

- A run whose own diff is empty records no `patch_id`, so an empty-diff leaf can only flip same-tree (as planned).
- A rebase that resolves conflicts differently changes `patch_id` — the pair reads as "own commits changed" (intended per the brief).
- `run.leaf` for `--holder` runs is `checkout`; holder merge pairs group under that slug, same as today under the tree key.
- `git merge-base` failure (unrelated history) propagates and fails the verify pass — same shape as `treeOf`.

## Unverified criteria

None.

## Grants, env, lessons

- `readiness.yaml` empty, no `Missing:` lines on `akrogon status`; no covered launches, no count lines.
- No `.env` reads or writes. No lesson found; `learnings/LESSONS.md` untouched.
- No model-choice reading: every criterion is mechanical.

## check.fix pass (2026-11-21)

B's `check.repair` repaired all findings on head `e68a8ad7` and handed A one item under the test-expectation exception: the writer test's expected hash still used `git patch-id --stable` while the repaired writer records `git diff --unified=0 --inter-hunk-context=0 | git patch-id --verbatim` (B F2, commits `ad071c8e`/`f81f40b3`).

- Prior reviewed head: `a5706347`; handed-off head: `a722f947`; refresh after the commit: branch already up to date on `4f5e3fd2` (no move).
- A's commit `a722f947`: single expectation change in `tests/flaky-merge.test.ts` with `Test-Change:` trailer; no other expectation touched.
- `akrogon run-check --name flaky-merge -- bun test tests/flaky-merge.test.ts` on `a722f947`: exit 0, 12 pass — `check-flaky-merge-1795293646316-1473426.log`.
- `akrogon verify` on `a722f947`: `verify leaf a722f947: green`, 1275 tests / 86 files / 144.47 s (~2.5 min) — `check-test-1795293820091-1476879.log` and sibling format/typecheck logs.

## check.fix pass 2 (2026-11-21, F5 handoff)

B's second `check.repair` (F5) replaced the context-free hash with a replay-proven identity: receipts record `patch_base` (the run's merge-base, absent when none or when the tree equals it) and `patch_id` (the run id, or the previous same-leaf merge run's id when `git merge-tree` replay in both directions reproduces both trees). B handed A one item: correct the writer test's expectation to the new record.

- Prior reviewed head `a722f947`; handed-off head `35e305a9`. A's commit `35e305a9`: the writer test now asserts `patch_base` equals the fixture's real merge-base and `patch_id` equals the first receipt's own run id, with the empty-diff case asserting both fields absent. `Test-Change:` trailer cites the handoff and writer commits. Refresh after the commit: branch already up to date on `4f5e3fd2` (no move).
- `akrogon run-check --name flaky-merge -- bun test tests/flaky-merge.test.ts` on `35e305a9`: exit 0, 13 pass — `check-flaky-merge-1795294577876-3366730.log`.
- `akrogon verify` on `35e305a9` (run `1e151b1e`): red in the `test` leg — one hc-listener test `a cleared foreground from the real core keeps the listener alive through restart` failed at 15 s; no cause in the leaf's diff (`git diff 4f5e3fd2...HEAD` touches `src/verify.ts`, `src/flaky.ts`, docs and this test file's expectation). One retry of the same command, `sh -c 'bun test --timeout=30000 --parallel=4 --no-isolate'`, in the leaf worktree: exit 0, 1276 pass — `check-test-retry-1795295040144-3990782.log`. Recorded **inconsistent**.
- Second `akrogon verify` on `35e305a9` (run `4ec8473f`): red in `test` on a different pre-existing flake, `next --all, --resume and manual next record the registered or selected repos before dispatch` (0.66 s) — `git diff` still carries no cause. `akrogon verify --known-red` judged `fail` (correct: the merge-base tree holds a whole-green row `83b19acd`, so a green base can never cover a red head).
- Third `akrogon verify` on `35e305a9`: `verify leaf 35e305a9: green`, 1276 pass / 86 files / 145.73 s (~2.4 min) — `check-test-1795295717110-534032.log`. Both earlier reds are recorded inconsistent with the two green full-suite runs (`check-test-retry-1795295040144-3990782.log`, this receipt) as their evidence; the leaf's own done-criterion proofs pass on their own (13/13 on `35e305a9`). No base red was filed: both flaky failures greened on retry, which the lifecycle filing rule excludes.

## Files changed this pass

- `tests/flaky-merge.test.ts` — writer-test expectation only (`a722f947`, `35e305a9`).
