# Brief: merge-conflict-route

## What
One code condition, one test, three skill lines and five guide sentences.

1. `src/phase.ts` counter. `fix_rounds` rises by one only when the move is check.review → check.fix. Merge → check.fix leaves it unchanged. The failed → implement reset stays.
2. `src/phase.ts` cap. The cap check fails the leaf only when the move to check.fix comes from check.review. A move from merge never produces `moved failed`, so the `moved failed` sentence at merge-issue:37 becomes dead text; it stays for L4, which owns the failed-diagnosis rule.
3. Re-review after a merge-origin repair. `requiredSlots` keeps reading `fix_rounds`, so a repair that came from merge with no earlier review fix is re-reviewed by A and B like an initial review, and one with an earlier review fix by A alone. No routing change. Skill and guide wording says "re-reviewed" without naming the slot.
4. `tests/phase.test.ts`. The `conflict` case asserts merge → check.fix leaves `fix_rounds` at its prior value, and one new case shows a leaf in merge with `fix_rounds` equal to the cap still moves to check.fix rather than failed. The log row keys stay as listed.
5. merge-issue. On a rebase conflict A resolves it in the worktree keeping both true sides, completes the rebase, records the rebase target, the prior reviewed head, the resolved head and a `git range-diff` of the reviewed patch against the rebased one in review-A.md, then runs every `checks` command as the existing line already says. Only red checks route to check.fix, in its own sentence on its own line: A appends the failing output, the rebase target commit and the rebased head to review-A.md, calls `akrogon phase <slug> check.fix --slot A` and prints the repair footer. The same-line index rule keeps its content without "during repair". The push, non-fast-forward retry and lost-reply lines stay.
6. implement-issue check.fix. The merge-conflict sentence becomes: a repair requested from merge starts at the rebased head A recorded in review-A.md and treats the failing output as the finding.
7. check-issue re-check. The baseline reads the prior reviewed head or the rebased head A recorded at merge; the words "rebase/conflict baseline" go.
8. Guide. phases.html check.fix entry counts review → fix loops; the merge entry says A resolves a rebase conflict and only a red check goes to check.fix. problems.html merge-conflict row, in-practice.html "Two leaves touched the same lines" and the last sentence of merge.html say A resolves the conflict in the merge, records it in review-A.md and reruns the checks; where they said "A re-checks" they say the repair is re-reviewed. problems.html:68, the akrogon sync row, is about the operator's checkout and stays. setup.html:67 and state.html:85 already describe review → fix loops and stay.

## Why
Since 2026-09-11 the three repos merged 137 leaves and sent 25 back from merge to check.fix. 23 were rebase conflicts, every recorded resolution a both-true union, one was red checks, one has no record. Each trip costs B repair, A re-check and a second merge pass, and raises the fail counter: tree-preflight reached 3 from conflicts alone. The kernel maintainer handbook has the integrator resolve conflicts; merge queues return them to a human author with context, which B is not. Operator answers 2026-09-14: 12a, 13a, 14a, 15a.

## Done-criteria
1. `bun test tests/phase.test.ts` passes with a case where a leaf in merge moves to check.fix and `fix_rounds` is unchanged, and a case where a leaf in merge with `fix_rounds` equal to the repo cap moves to check.fix, not failed.
2. `git diff --stat` shows `src/state.ts`, `src/status.ts`, `src/log.ts` and `src/routing.ts` unchanged; `grep -rn merge_rounds src/ tests/` is empty.
3. `grep -n "check.fix" skills/merge-issue/SKILL.md` returns only the red-check line, the dead `moved failed` line 37 and the repair-move footer line; `grep -n -i conflict skills/merge-issue/SKILL.md` returns lines that all describe A resolving and recording, none containing `check.fix` or preserving an unfinished rebase for B.
4. The merge-issue conflict sentence names, in order, the four recorded items: rebase target, prior reviewed head, resolved head, range-diff.
5. `grep -n -i "conflict" docs/guide/phases.html docs/guide/problems.html docs/guide/in-practice.html docs/guide/merge.html` returns, apart from problems.html:68, lines that name A resolving; none of them sends a conflict to check.fix. phases.html:63 says review → fix loops raise `fix_rounds`.
6. implement-issue and check-issue name the rebased head A recorded at merge and no longer say "merge-conflict findings" or "rebase/conflict baseline".
7. `bun test`, `bun run typecheck` and `bun run format` pass.
8. (B) Verification artifact: `bash -o pipefail -c 'bun test tests/phase.test.ts 2>&1 | tee /tmp/akrogon-merge-conflict-route-phase.log'` exits 0 and the report records the path.
