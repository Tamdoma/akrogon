# Implementation report: solo-turns

Base: e522c1865538294dc1f65a90c7bcb5309a667513 (`origin/main`, unchanged at the refresh, so no rebase).
Committed head: 71d022710db27ca397bdd450e574a5144f5ac2c2.
Mode: subagents, one wave W1 = {U1 src, U2 docs}. Both worker worktrees are removed.

## Commits

- 7f349b4f, 1d1e652c: planned criterion tests and A's fixture cleanup, each with `Test-Change` trailers.
- 6e7a33ff (U1, from worker 467de00c): member stacking deleted from `src/`.
- 0c71acd4 (U2, from worker 85512872): skills, `src/AREA.md` and guide docs describe the holder alone.
- 2d6de7f0 (A): `docs/guide/merge.md:11` "stack top" and `docs/guide/phases.md:14` "one stack" made current. `src/AREA.md` trimmed from 44 to 40 lines by joining four related bullet pairs, with no content dropped.
- 55538551, 71d02271 (A): `readState` throws a `z.ZodRealError` with an added `Invalid state <abs>/state.yaml` issue (plan Implementation notes, D1 refined).

## Changed files and reasons

- `src/state.ts`: `batchMemberSchema`, `BatchMember` and `batchSchema.members` are gone. `readState` drops `batch.members` only when it is `[]`. A schema failure stays a `ZodError` and names the file.
- `src/batch.ts`: `pickMembers` is gone. `buildStack(repo, builtOn, holderHead, retirementHead)` rebases the holder only and returns `{ok, top}`.
- `src/attempts.ts`: `redMemberHeads` is gone. `appendAttempt` writes no `members`. Old lines still parse.
- `src/next.ts`: `mergeTurn` builds once with no rebuild loop. `mergeContext` is `attempt=<id> top=<sha>|solo`. `reconcileBatch` loses its member logic, its second lock block and the `global` parameter.
- `src/phase.ts`: the member branches of `requireBatchTop`, `batchCheck`, `batchPush`, `restack`, `finishPush` and `check.fix` are gone, along with imports that became unused.
- `skills/merge-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `src/AREA.md`, `docs/guide/{merge,next,state,files,phases}.md`: describe the holder alone.

## Proofs and checks

| Criterion | Command | Commit | Result |
|---|---|---|---|
| C1–C4 (merge flows, restack, lost push, empty members) | `bun test --timeout=30000 tests/batch-dispatch.test.ts tests/batch-merge.test.ts tests/merge-attempts.test.ts tests/batch.test.ts tests/next.test.ts tests/phase.test.ts tests/timing.test.ts` | 2d6de7f0 | `check c1-c4-merge-suites: 0 .../implementation/check-c1-c4-merge-suites-1792421800900-2178421.log` (392 pass) |
| C4–C6 (old lines, refused members, no member code, docs) | `bun test --timeout=30000 tests/solo-turns.test.ts` | 2d6de7f0 | `check c1-c6-solo: 0 .../implementation/check-c1-c6-solo-1792421729428-2175132.log` (4 pass) |
| C4 after the D1 refinement | `bun test --timeout=30000 tests/state.test.ts tests/status.test.ts tests/solo-turns.test.ts tests/next.test.ts` | 71d02271 (working tree before commit, same content) | `check state-fix: 0 .../implementation/check-state-fix-1792422413749-3694547.log` (308 pass) |
| C6 docs | `bun test --timeout=30000 tests/docs-links.test.ts tests/hold-retired.test.ts tests/log-reader.test.ts tests/lessons.test.ts tests/run-permit.test.ts` | 2d6de7f0 | `check docs-tests: 0 .../implementation/check-docs-tests-1792421730702-2175378.log` (31 pass) |
| All checks | `akrogon verify` | 71d02271 | green: format 0, test 0 (1053 pass, 0 fail, `check-test-1792422572621-3857322.log`), typecheck 0. Wall time 2m33s. |

The full suite in the final verify includes every criterion test above, so every criterion is green on 71d02271.

Earlier red verify runs, all caused by the diff and repaired:
- 2d6de7f0: 4 fail in `tests/state.test.ts` and `tests/status.test.ts`, because the plain `Error` wrap broke the `ZodError` catches (`check-test-1792421953596-2391159.log`).
- 55538551: 2 fail in the `next` capacity tests, because a bare `new z.ZodError` is not `instanceof Error` (`check-test-1792422312396-3263471.log`).

Worker returns:
- U1: typecheck, solo-turns subset and merge suites all exit 0 (`check-typecheck-1792421542526-1954133.log`, `check-solo-turns-1792421542772-1954344.log`, `check-merge-suites-1792421603609-1955027.log`). No limitations reported.
- U2: the three docs checks exit 0. It flagged `src/AREA.md` at 44 lines (fixed by A in 2d6de7f0). A found the merge.md:11 and phases.md:14 stale lines (fixed in 2d6de7f0).

## Known limitations

- D8: the four `docs/guide` files were added beyond the brief's named docs, to avoid stale docs. This is a note for review.
- Deploy timing: merge must confirm that no leaf in any registered repo holds a `batch` with non-empty `members` at merge time. If one does, `readState` refuses that leaf loudly by design (5a, no upgrade code).
- 4a (parallel next-leaf testing) stays deferred.
- `docs/guide/phases.md` already failed `prettier --check` at base. It is outside the `format` check's paths and was left alone.

## Unverified criteria

None.

## check.fix (2026-10-19)

Prior reviewed base and head: e522c186 / 71d02271. Handed-off base and head: e522c186 / abfee125. The refresh fetched `origin`, and main had not moved (e522c186), so no rebase was needed.

Input: review-B `Handed to A`, F1 only. Review A had no Fixes.

- 4dd9de4d: deleted the 'merge docs describe the holder alone' test in `tests/solo-turns.test.ts`, which was a prose word ban. It carries a `Test-Change` trailer citing review-B F1. plan.md criterion 6 now names reviewer reading as its proof (Implementation notes, check.fix).
- abfee125: restored the `src/AREA.md` archive "member" wording that the deleted test had forced to "entry". The `pack.ts` line now matches base, and the file is still 40 lines.

Proofs on abfee125:
- `bun test --timeout=30000 tests/solo-turns.test.ts`: `check c4-c5-solo: 0 .../implementation/check-c4-c5-solo-1792422890749-149322.log` (3 pass).
- `akrogon verify`: green. setup 0, format 0, test 0 (1052 pass, 0 fail, `check-test-1792423044779-149522.log`), typecheck 0. Wall time 2m36s.
- Corrected-rule check: `grep -c 'SKILL.md\|AREA.md\|docs/guide' tests/solo-turns.test.ts` printed 0.

Criterion 6 is proven by reviewer reading. Review A and review B both confirmed the docs match the code.

## Merge prerequisite — 2026-10-19

Immediately before landing attempt `d0f07f8b-d0cd-44c3-9b15-da0ba11a06b2`, scanned every state.yaml under issues/ in all 11 registered repositories. Of 896 states, only this holder has a batch, with `members: []`. No non-empty or malformed batch.members exists. Deployment prerequisite 5a is satisfied. Evidence: `check merge-prerequisite: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-merge-prerequisite-1792423151826-628407.log`, read back with `akrogon log`.
