# Brief: known-red-pass

## What
`akrogon verify --known-red` runs the caller's current command set on a fresh checkout of the tested commit's exact base and records that base run linked to the completed red head run of the same tree and scope. `requireGreenReceipt` accepts such a linked pair, wherever it accepts a green receipt, when every head command that exited nonzero has a non-empty set of failing test names and every one of them is also failing in the same command on the base. The implement, check and merge seat skills and the chart door's direct landing use it after a red retry with no cause in the diff, in place of the sentence that such a red is never a base defect. (A,B,C)

## Why
Three times in ten days (10-08, 10-10, 10-17) a red main stopped every leaf that ran verify: each leaf ran a full red suite, went `failed`, and needed a manual `akrogon phase` move. The operator's 10-10 decision was that a leaf never fails or waits because main is red. dc2e2b0 removed the earlier known-red flow; this restores the outcome with existing receipts and the existing failing-test extraction, no wait state and no new record file.

## Done-criteria
1. A leaf head whose `test` command fails only on tests that also fail on a fresh run of its exact base (`git merge-base <head> <remote>/<default_branch>`) gets exit 0 from `akrogon verify --known-red`, a base run record linked to its head run in `issues/verify-runs.jsonl`, and a successful `akrogon phase <slug> check.review` on that head.
2. A head with one failing test that passes on the base gets a nonzero `akrogon verify --known-red` exit, and `check.review` still refuses with the no-green-receipt error.
3. No linked pair passes when a head command that exited nonzero yields no failing test names (as `typecheck` and `format` do, or a missing log), when either run did not complete or had setup exit other than 0, or when the base run used a different command set.
4. The base side always runs fresh: an earlier green or red receipt for the base tree is never reused as the base half of a pair.
5. The same qualifying pair at merge scope lets `akrogon phase <slug> merged --check`, the batch push gate and `skills/chart-issues/scripts/direct-guards.ts` proceed, and a non-qualifying pair stops each of them as today.
6. `akrogon verify` without `--known-red` behaves as before: green reuse, fresh run, exit 1 on red.
7. skills/implement-issue/SKILL.md, skills/check-issue/SKILL.md and skills/merge-issue/SKILL.md tell the seat, after the one retry stays red and the diff shows no cause, to run `akrogon verify --known-red` (with `--attempt <id>` in merge), read the head and base logs of each red command for runner completeness and causal fit, record that judgment in the implementation report or review beside the kept logs, and treat a known-red exit 0 as passing only when that judgment agrees; none of them says a no-cause red is never a base defect. (A,C)
8. skills/chart-issues/SKILL.md's direct landing, after a red `akrogon verify --holder <chart>/direct` on the rebased head, has the door retry once on the same head, judge the diff for a cause, and on a no-cause red run `akrogon verify --holder <chart>/direct --known-red` before direct-guards; only a failing known-red result counts as a blocking landing-check failure. (A,B,C)
