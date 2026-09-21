# Intake: fork-rounds

## Scope
One leaf in repository akrogon editing the chart-issues skill text (`skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, possibly `assets/shapes.md`) and its human docs, so forks are taken one per round with research redone between rounds.

## Provenance
- GitHub: Tamdoma/akrogon#27
- Operator: 2026-09-21 door note

## Source: Tamdoma/akrogon#27
# chart-issues: per-fork question rounds lost in the 2026-09-11 rewrite

Source: Tamdoma/akrogon#27
URL: https://github.com/Tamdoma/akrogon/issues/27

Unverified intake.

## Observation
Operator statement (2026-09-21): "when we were working on the akrogon repo itself, there were tons of rounds and tons of questions for each fork on the road, but now the questions are few and in between, and only in one round. I want it back, with the updated (new) naming. The per-fork depth got lost in the wording, and we need to fix it. The whole point is to have the chart-issues process be detailed when it needs to be so we avoid all pitfalls, and we do proper research and planning. If there's only one fork for smaller problems, that's okay, I just need it to be as robust as before so we cover all possible angles. Minimum changes: simplicity, clarity, elegance."

Supporting facts gathered in the session, unverified as a diagnosis:
- Skill history (~/.claude/skills/chart-issues, commits c547564 2026-09-08, 308d5ed 2026-09-11, 0a6ea42 2026-09-13, f466617 2026-09-14). The 09-08 version settled one decision per session in typed passes. The 09-11 rewrite ("unified intake door") dropped that and kept "present all currently material questions in one complete round". The 09-13 commit renamed vocabulary only. The 09-14 commit added "a small round keeps the parts that carry the decision".
- SKILL.md Take section still sends B "the current Question and carries" per fork, but no sentence says a fork is taken in its own round.
- Chart shapes: issues/closed/akrogon-loop has 30 fork files, each with its own round and operator answer line. Recent charts (repo-slots, seat-prompt-delivery, framework charts after 09-14) have one or two forks and a single round.

## Location
Repository akrogon, skill chart-issues (SKILL.md Drain and Take sections, assets/questions.md). Observed on framework charts and on akrogon charts after 2026-09-11.

## Reproduction
Open /chart-issues on a multi-fork destination after 2026-09-11. The map is followed by one round covering every fork, then handoff. Compare with issues/closed/akrogon-loop/chart/forks/*.md. Every time.

## Expected behavior
Forks are taken one at a time, each in its own full-detail round with its own research, so a large destination gets as many rounds as it has forks and a small one gets one. Same naming as today (forks, taken, fog, off route). Minimal wording change.

## Urgency
Charts hand off with shallow first rounds and depth arrives only through operator corrections. Workaround: the operator asks follow-up questions per fork by hand.

## Source: operator 2026-09-21
I've pulled 3 issues. I want you to categorize all of them, but I want us to start with the most recent one from a couple of minutes ago. It's important for me to restore the detail orientedness of the old way of charting, but updated for the new naming conventions.

## Agent findings
- The 2026-09-08 skill (commit c547564, `skills/chart-issues/SKILL.md` lines 226-236) ran a work lane of one decision per session: pick the open decision that unblocks the most others, research it, run one grilling round, record it, unblock dependents, graduate `## Not Yet Specified` into fresh decision files, stop. It said "Settling several decisions in one session defeats the point: each answer reshapes what is still unknown."
- The same version's `assets/question-authoring.md` already said "Gather all currently material questions into one batch." Batching was never the difference. The unit of a round was the decision, so a batch held that decision's questions only.
- Commit 308d5ed (2026-09-11) removed the work lane and kept the batch sentence, now `assets/questions.md` line 29: "Present all currently material questions in one complete round". Commits 0a6ea42 and f466617 did not touch this rule. Installed skill matches the repo copy.
- The B exchange in `SKILL.md` Take still assumes per-fork rounds: "send B the intake, current Question and carries, related fork paths". Nothing in Drain or Take says a fork is taken in its own round.
- Fork depth per chart: akrogon-loop 30 forks over 45 recorded dates; loop-hardening 13 forks on 2026-09-11; dead-prose 12 forks on 2026-09-14; every chart opened after 2026-09-14 has 1 or 2 forks and one date, and seven of them have no `### Q` heading in any fork file.
- `assets/shapes.md` already fixes fork = one screen: "One fork file holds one or more questions that are always presented together on one screen." Making round = fork closes the gap with one sentence.
