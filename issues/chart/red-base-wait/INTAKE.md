# Intake: red-base-wait

## Scope
Destination akrogon. What leaves before merge do when main is proven red on a check no leaf owns (#76), and when recorded base-red evidence stops being reusable (#77). Grouped with busy-seat-notice (#78) at the operator note only; separate chart.

## Provenance
- GitHub: Tamdoma/akrogon#76
- GitHub: Tamdoma/akrogon#77
- Operator: 2026-10-10 chart-issues args

## Source: operator 2026-10-10
3 new issues about the systemic problem we had encountered today. Let's chart it out and fix it. Use slot B consultant (active right now).

## Source: Tamdoma/akrogon#76
# Red main fails leaves one by one at implement and check.review: each reruns a full verify to find it, nothing tells the operator main is red

Source: Tamdoma/akrogon#76
URL: https://github.com/Tamdoma/akrogon/issues/76

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-10. Main `5cb74c3c6` was red on two checks the leaves did not touch. Seven leaves were running in `merge-gate` and `formspark-api`.
- `bun run hooks:selftest` C8 (video-intake ffmpeg-static) failed on base. Three leaves (`cheap-checks`, `fail-fast`, `page-measure-full-id`) each ran their own base comparison, reproduced it, and went `failed` (`blocked@implement` or `blocked@check.review`). Their `implementation/report.md` files record a full `framework:verify` of about 15 min each.
- `test:motion-probe` (`MISMATCH reveal/reveal-section after.visible`) failed identically on base. `spawn-deadlines` stopped on it (`failed`, `blocked@implement`). `selected-check` recorded the same failure in its report.
- Nothing told the operator that main itself was red. The signal was only in the failed leaves' reports and the `failure.reason` of each.
- The operator moved two of the failed leaves back to `check.review` by hand (`failed -> check.review`, no seat slot, 0.3 s apart in `issues/log.jsonl`) after the root `node_modules` was edited. `fail-fast` was moved separately. `cheap-checks` then failed again at `check.review` on the same cause.

## Location
akrogon phase handling for a leaf whose base comparison is red (`failed` with `cause=blocked`), the watch/operator notification path, and the base-run rule in `skills/check-issue/SKILL.md`. Consumer: `Tamdoma/tamdoma-framework`, `issues/open/merge-gate/*`.

## Reproduction
1. Main turns red on a check no leaf owns (here: a root `bun install` made C8's package-hiding ineffective for worktrees under `issues/worktrees/`).
2. Several leaves reach implement or check.review and run the full gate.
3. Each reproduces the red on base and moves to `failed`.
Seen once on 2026-10-10 with 4 of 9 leaves. Frequency otherwise not provided.

## Expected behavior
When a leaf finds the same base failure another leaf already recorded, it waits instead of rerunning the full gate and failing. The operator is told once that main is red and which check, rather than per leaf. Leaves held by a red base resume when main is green, without a manual `phase` move.

## Urgency
Medium-high. Each affected leaf lost one full verify run (about 15 min wall) and stopped, and the operator had to recover leaves by hand. No known workaround except fixing main and moving each leaf manually.

## Suspected cause
Agent view. No akrogon step tracks main health across leaves. #67 pauses the merge queue while main is red and #64 resumes bounced leaves, but both act at the merge turn. Leaves before merge treat a red base as their own stop condition (`failed`), so every leaf rediscovers it separately and none shares it. The two base reds are consumer defects (a test that depends on directory layout, and a probe/Playwright mismatch not yet diagnosed), so only the handling is claimed to be akrogon's.
Files read: `issues/open/merge-gate/{page-measure-full-id,spawn-deadlines,selected-check}/implementation/report.md`, `issues/log.jsonl`, `observe.ts` output; gh issues #67 and #64 bodies. akrogon source not re-read for this report.
Not inspected: how `check-issue` decides `blocked` vs red, and whether `src/pause.ts` can be driven by a base-red signal.
Related: Tamdoma/akrogon#67 (red main stalls merge queue, closed, merge turn only), #64 (bounced leaf not resumed after main fixed, closed), #47 and #50 (base failures attributed at handoff and check evidence, closed). Consumer report Tamdoma/tamdoma-framework#207 (merge bounces, different repo, not read).

## Source: Tamdoma/akrogon#77
# Moving a base-failed leaf back to check.review reuses its recorded base-red evidence: reviewers fail it again within minutes without a fresh run

Source: Tamdoma/akrogon#77
URL: https://github.com/Tamdoma/akrogon/issues/77

Unverified intake.

## Observation
Consumer `Tamdoma/tamdoma-framework`, 2026-10-10. `cheap-checks` and `fail-fast` had failed at check.review with `selftest` red on base. An operator moved both back to `check.review` by hand (`failed -> check.review`, `issues/log.jsonl`, 13:44:44 and 13:45:13 UTC) after removing the cause from the root `node_modules` (13:44:39 UTC). Both went `check.review -> failed` by seat B again, `cheap-checks` after 4 min 4 s (13:48:48) and `fail-fast` after 6 min 27 s (13:51:40), with the same reason.
`fail-fast/review-B.md` says it reused saved logs: "Both saved logs were inspected to their terminal results" (`implementation/ff-leaf-selftest.log` and `ff-base-selftest.log`) and "Existing completed evidence is reused without another full suite". The `cheap-checks` review text is the earlier F1 with the leaf log `/tmp/akrogon-1000/cheap-checks-8809b3689156/cheap-checks-B-leaf-selftest.7eOPHp.log`. Its reported selftest runs took 7 min 5 s (leaf report) and 189 to 227 s (fail-fast), so the 4 min re-review likely did not rerun both.

## Location
akrogon `check-issue` skill (the base-red stop rule and the evidence reuse rule), and what `akrogon phase <slug> check.review` carries over from a failed pass.

## Reproduction
1. A leaf fails at check.review on a base-red check.
2. Fix the base cause outside akrogon.
3. `akrogon phase <slug> check.review` then `akrogon next <slug>`.
Seen twice in the same session. Frequency otherwise not provided.

## Expected behavior
After a leaf re-enters check.review from `failed`, base-red evidence recorded before the move is not reusable. The reviewer reruns the red check on the current head and base before it stops the leaf again.

## Urgency
Medium. Each recovery attempt costs a seat turn and a notification, and the leaf stays failed after the cause is fixed. Workaround: delete the recorded logs and review file before the move, which an operator should not need to do.

## Suspected cause
Agent view, partly confirmed. The check rule lets a reviewer reuse completed evidence "rather than repeating completed broad checks", and the red-on-base stop applies to recorded runs. Nothing marks that evidence stale when the leaf re-enters check.review or when main or the environment changes. Confirmed for `fail-fast` by its own text. Likely for `cheap-checks` from timing only.
Files read: `fail-fast/review-B.md` lines 16-30, `cheap-checks/review-B.md` lines 23-40, `issues/log.jsonl` records for both. Not read: the `check-issue` skill source.
Related: Tamdoma/akrogon#64 (bounced leaf not resumed after main fixed, closed), #47 and #50 (base failure attribution and check evidence, closed), #76 (red main fails leaves one by one, open, filed today).

## Agent findings
See slots/map-merged.md (M1-M4, M7-M9) and the fork files.
