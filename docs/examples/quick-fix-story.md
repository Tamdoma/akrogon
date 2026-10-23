# Quick fix story

This page tells how one real bug in a web framework project went through the direct route, from the operator's request to the fix on the main branch. The rules behind each step are in [Quick fix](../use/quick-fix.md).

![Ways to run a chart: an attended chart ends in the direct route when small and eligible or in a lifecycle handoff, an autopilot chart ends only in a lifecycle handoff, and an optional watch runs beside the handed-off leaves.](../pictures/ways-to-run.svg)

This story took the direct route branch of the picture.

## The bug

The project ships agent commands, called skills. A guard checks each skill before it runs and refuses one that lacks a fixed effort setting. An earlier project decision said a small group of shipped skills should run without that setting. The guard still refused them, so those skills could not run at all. Two GitHub issues reported the same problem.

## The operator's notes

The operator had copied the open GitHub issues into the repo with `akrogon pull` ([commands.md](../reference/commands.md#run-work)). Then the operator opened the chart door with [chart-issues](../../skills/chart-issues/SKILL.md) and asked it to chart every pulled issue that had no chart yet. Two consultant panes, B and C, worked beside the door. See [Open a chart](../use/plan-work.md#open-a-chart).

The door, B and C each wrote a blind map of the open issues, and the door merged them. The map grouped the issues into destinations, one chart each. This bug got its own chart. The map noted that the earlier decision already set the direction of the fix. See [Read the territory map](../use/plan-work.md#read-the-territory-map).

## One fork

One question was still open, so the door wrote one fork file under `forks/` ([files.md](../reference/files.md#layout-of-issues)). It had two parts:

- Which skills must carry the effort setting? Only skills that run in their own forked context, or all of them?
- If a skill that is not forked still carries the setting, does it count?

B and C researched blind, the door merged their notes, and each wrote a rebuttal. They agreed on the first part and split on the second. The operator answered both: only forked skills need the setting, and a stray setting on any other skill counts nowhere. The door recorded the answers and reasons in the fork's `Taken` section. The second GitHub issue was folded into the same chart. See [Answer one fork per round](../use/plan-work.md#answer-one-fork-per-round).

## The door offers the direct route

With no open fork and no fog left, the door showed the handoff review. The chart had one outcome, no keys or live runs, and B was named, so it was eligible. The route question offered direct, and the operator chose it. The door wrote `Route: direct` in `CHART.md` ([skills.md](../reference/skills.md#chart-issues)). See [When the door offers it](../use/quick-fix.md#when-the-door-offers-it) and [Review the handoff](../use/plan-work.md#review-the-handoff).

## The draft brief and design

No separate brief or design file was written. The fork's `Taken` section held the settled rules, and that served as the contract. The door made a branch and a worktree and started the `Direct attempt` section in `CHART.md`. See [What happens when you pick direct](../use/quick-fix.md#what-happens-when-you-pick-direct).

## A implements

The door, as seat A, ran [implement-issue](../../skills/implement-issue/SKILL.md) in its direct form ([skills.md](../reference/skills.md#implement-issue)). It wrote `direct/plan.md` with five done-criteria. For example, a shipped skill without the setting is admitted, and a forked skill without it is still refused.

A wrote the tests first and committed them, then the code. A first probe showed that the code change alone turned 55 old tests red. Their fixtures gave skills an effort setting without marking them forked, which the settled rules no longer allow. A fixed those fixtures in the same tests commit. Four new tests failed on the old code and passed on the new code. A kept each check's output with `akrogon run-check --holder` and wrote `direct/report.md` with the proof for each criterion. See [Keep output with akrogon run-check](../reference/checks.md#keep-output-with-akrogon-run-check).

## B reviews

B reviewed the change as seat B with [check-issue](../../skills/check-issue/SKILL.md) and wrote `slots/review-B-1.md` ([skills.md](../reference/skills.md#check-issue)). The verdict was ready, with no fixes and no nits.

## One repair round

Before landing, the door rebased onto the main branch and ran `akrogon verify --holder` on the rebased commit ([checks.md](../reference/checks.md#prove-a-commit-with-akrogon-verify)). The run was red. Three tests in another file failed. Their fixtures built the skill text piece by piece, so A's search for the old pattern had missed them. The cause was in the change itself, so the door counted it as repair round 1 of the repo's `fix_rounds` ([config.md](../reference/config.md#repo-issuesconfigyaml)).

A marked those fixtures as forked in one more test commit. B checked only the repair and accepted it, but returned fix in `slots/review-B-2.md`, because the full verify had not passed yet. The door ran `akrogon verify --holder` again on the repaired commit. It passed. B read the log, saw the three tests pass, and returned ready in `slots/review-B-3.md`. See [When it stops](../use/quick-fix.md#when-it-stops) for what happens when rounds run out.

## Landing on main

The door then:

- pushed the exact tested commit to the main branch on the first push attempt, without force
- closed both GitHub issues with `akrogon close --by` ([commands.md](../reference/commands.md#run-work))
- posted an update to both configured targets with [broadcast-issue](../../skills/broadcast-issue/SKILL.md)
- removed the worktree and the branch
- packed the check logs into `direct/evidence.tar.zst` with `akrogon pack` ([commands.md](../reference/commands.md#records-and-releases))
- wrote the landed commit into `Direct attempt` and marked the chart `Closed`

The whole fix used one repair round and no leaf files.

Next: [Quick fix](../use/quick-fix.md)
