# Design: frozen-test-guard

## Binding decisions, verbatim

From `issues/chart/busy-seat-notice/forks/test-authorship.md`, Taken:

Operator 2026-10-10, verbatim: "1a | 2a | 3 - I don't want anything to move over to next issues. Can we make it work inside of the same leaf / runtime?"

- Q1 1a: seat A writes the criterion tests in plan.synthesis as the first commit on the leaf branch, each shown red on the intended break; workers, implement A and repair seats never write or edit them. Binding with the agreed rules: tests_head recorded at the implement move; guard over tests_head...HEAD counting added files; frozen set covers the plan's proof directory, expected fixtures, runner entry and skip config; accepted suite runs through the planned command; B judges every Test-Change trailer (check-issue/SKILL.md:47). Count rule: a test exists only as a criterion proof or a real-bug reproduction. No rig built inside a product leaf; missing independently provable machinery is a prerequisite leaf proven by one good case green and one deliberate break red, else the criterion is narrowed at charting; required live evidence stays real. Unsuitable machinery or environment stops the pass with a reason. Partial reporting and selective reruns stay.
- Q2 2a: A alone fixes one wrong expectation in its own commit with a Test-Change trailer citing the brief line or real output; B judges it at review; a worker reports a mismatch and waits; a wrong criterion stops with a reason (implement-issue/SKILL.md:34).
- Door correction 2026-10-10, for peer check in the leaf-review exchange: a recorded `tests_head` sha does not survive leaf rebases (src/phase.ts:666,700; merge-issue/SKILL.md:49-53 solo rebase), so the plan.synthesis→implement move records each path the branch changed during planning with its content id. A later move refuses a recorded path whose content changed or vanished, and a test-file path added outside the record, unless a Test-Change trailer names it. Same function as Taken Q1, rebase-safe.
- Q4 1a (operator 2026-10-10: "1a"): for a proven bug, the fixing seat writes one reproduction test before the fix, the only exception to Q1's no-repair-seat-tests rule. Binding: the test is shown red on the head before the fix, its Test-Change trailer cites the realistic source from the review finding, and the freeze guard refuses an added test without that trailer. check-issue/SKILL.md:79 stays, narrowed to this rule. B held 1b (A writes it first), C held 1a.

Exclusions: who may write tests, the count rule, Q2's and Q4's authorship rules, Q3's review rules, the planned-command and runner-config review check, and every proof-machinery rule belong to `test-proof-rules`, which owns `implement-issue/SKILL.md:84` whole (A,C). This leaf owns only the mechanical refusal and the lines that describe it.

## Standing design

`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf: the property is a CLI refusal, so the cheapest sufficient proof is the existing `tests/phase.test.ts` style, driving `akrogon phase` against a real temporary git repo and worktree. No mocks of git. Each criterion gets one case at that boundary, plus one deliberate break (the guard disabled) turning it red. The rebase case (criterion 5) needs a real rebase in the fixture repo, including one where the target also changed a recorded path. No live run, no outside call.

## Leaf architecture

- Record: a new optional state field, command-owned like `worktree`, added to the command-owned list in `skills/chart-issues/assets/shapes.md:276` (A,B). Suggested name `frozen`, a map from repo-relative path to git blob id or an explicit absent value (for example `null`) for a path deleted during planning (A,B). Built from `git diff --no-renames --name-status <target>...HEAD` plus each path's blob at HEAD. An empty map is valid and different from a missing field.
- Written on every `plan.synthesis` → `implement` move, replacing any earlier record, so a leaf replanned after `failed` → `plan.synthesis` (`src/routing.ts:37-50`) gets a fresh record of its new tests (A,C).
- Check: inside `requireTestChangeCitations` or a sibling called at the same place (`src/phase.ts:282`), only when the state has the record. For each recorded path, compare HEAD's blob (or absence) with the record. For each `A` line in `<target>...HEAD` matched by `testFile()` and not in the record, require a citation. Keep the existing `M`, `D`, `T` pass unchanged.
- Citation: a path is cited only by a `Test-Change` trailer naming it in the last commit in `<target>..HEAD` that touched the path, or in a later commit (`git log <target>..HEAD -- <path>` gives that commit). Trailers in earlier commits, including the planner's, do not count, so a planning trailer cannot authorize later edits (A,B,C).
- Rebase: when a rebase changes a recorded path's content because the target also changed it, HEAD differs from the record and no later leaf commit touched the path, so the move is refused until a trailer-only commit names it, the exception `implement-issue/SKILL.md:64` and `merge-issue/SKILL.md:51` already allow (A,C).
- Merge paths (`src/phase.ts:421,427,904`) call the existing function with explicit ranges and no state. Keep them unchanged.
- Format: the planner runs the leaf's `checks` before committing its tests (`test-proof-rules`). A later formatter rewrite of a recorded file counts as a change and needs a trailer. That is intended.
- Not in scope: hooks, file permissions, hidden test suites, checking trailer text quality (B judges it, `check-issue/SKILL.md:47`).

## Held disagreements

- B F2: B asked that unchanged runner entries, expected fixtures and skip configuration also enter the record through a declared frozen list. A holds the record to paths the planner changed: a declared list needs a new contract field and a second owner, and an unchanged config edit is visible in the diff B reviews. `test-proof-rules` criterion 6 has B check that no change since planning skips, filters or disables a planned test or its runner configuration.
- B F3: B asked that carried stack members, which enter `merged` through `commitMove` and skip `transition` (`src/phase.ts:498-500,763-765`), get the new check before push. A holds the merge path unchanged: each member's last seat move already passed this guard, and a command restack replays the member's own commits onto the new tip without adding a leaf edit, while a conflicting member is restored and excluded (`merge-issue/SKILL.md:47`).
