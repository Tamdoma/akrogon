# Adopt a retro concept

## Question
1. Which retro concept, if any, does Akrogon adopt?
2. When the door finds a lesson that a check could cover, where does that go?

### Carries
- No locks. leaf-run-stalls/CHART.md:4 rejected new phases and state for stalls, which informs but does not bind this chart.
- Peer maps and rebuttals: slots/map-A.md, map-B.md, map-C.md, map-merged.md, map-rebuttal-B.md, map-rebuttal-C.md.

## Findings
Research: practitioner · Matt Pocock, mattpocock/skills `skills/engineering/retro/SKILL.md` and `skills/engineering/ask-matt/SKILL.md` at a7d038f (2026-09-24), read 2026-10-04 · retro reads one session and routes each mistake: mechanical to a deterministic check, judgment to a reviewer rule, steering kept to navigation pointers · it changed the question from "add a retro" to "which routing rule is missing".
Research: better-than-training · skills/chart-issues/SKILL.md:29, learnings/LESSONS.md:5,10,17, src/phase.ts:270-271,327, src/config.ts:9, skills/watch-issues/scripts/log-tail.ts:486 · the chart-open prune only removes, one active lesson is fully enforced in code, one is fixed in one place only.
Merged map: slots/map-merged.md. All slots reject a retro skill, phase, lesson field, standards file or log-reading mode. A and C recommend lesson triage at open. B recommends a conditional prevention scan for charts that investigate a session or process incident.

Q1 reopened round, 2026-10-05 (slots/adopt-A.md, adopt-B.md, adopt-C.md, adopt-merged.md, adopt-rebuttal-B.md, adopt-rebuttal-C.md):
- (A,B,C) Today's open-time prune offer (chart-issues/SKILL.md:29) is already the distraction. Triage at open, in a lifecycle seat, or on a schedule is rejected: seats cannot ask for accept/decline (skills/AREA.md:23), a scheduler still needs starting and its guard evidence goes stale (C, watch-issues/SKILL.md:3,12).
- (C) A triage pass through the door inherits chart machinery: territory map (SKILL.md:37), chart folder (:43) and pull (:27). The door option needs an exemption sentence.
- (A) That exemption makes chart-issues a two-mode door, which every later door edit must remember. A short separate skill keeps each job single.
- (B,C) Prefer the door pass: a tenth workflow costs install links and docs (docs/reference-index.md:5, src/install.ts:11). C switches to a separate skill if the exemption needs more than one sentence.
- (B) Stale lessons can still mislead plans; delayed triage is an accepted cost, not zero-cost. Removal-only (drop the offer, adopt nothing) is a valid option.

## Taken
2026-10-05, operator: `1a | 2a`

1. 1a: lesson triage at chart open. The existing prune offer sorts each active lesson into already guarded (remove the line), checkable (offer a seed) or stays (default). A line counts as already guarded only when the guard covers the lesson's mechanism everywhere it can recur, verified on the relevant code path, with the guard's file:line cited. A fix in one place with the pattern still reachable elsewhere is checkable. Reason: cheapest option, sits in an existing step, fixes observed drift (LESSONS.md:10 enforced at src/phase.ts:270-271 and still active). Foreclosed: 1b conditional prevention scan, 1c both, 1d nothing.
2. 2a: a checkable lesson becomes an offered `/seed-issue` line the operator accepts or declines. Reason: keeps the current chart on its destination and lets a later chart weigh the check's per-pass cost. Foreclosed: 2b fork in the current chart.

Correction 2026-10-05, operator: "The only problem is, it becomes a distraction from the main chart that I want to pursue."
Question 1 is reopened. 1a is not binding until re-answered. Answer 2 (2a) stands for whichever option still produces seeds.

Correction 2026-10-05, operator: "1a - but the name should be better and contain "issues" or "issue", to make it consistent with the rest of the stack"
1. 1a binding: lesson triage moves to its own small operator-invoked skill, run only when the operator starts it, with no chart, map, pull or handoff. chart-issues stops offering a lesson prune at open and keeps reading LESSONS.md as a resource. The triage rules from the first answer (three outcomes, guard must cover the mechanism everywhere it can recur, checkable lesson becomes an offered seed the operator accepts or declines, default stays) move into that skill. The skill name contains "issue" or "issues", matching the verb-issue(s) stack. Exact name pending. Foreclosed: 1b door pass with a note, 1c removal only, 1d keep today's offer, triage at open, scheduled run, lifecycle seat.

Correction 2026-10-05, operator: "continue, reping C. I like the skill name."
Name: `learn-issues` (A,B,C). Final-shape check (slots/final-check-B.md, final-check-C.md) adds these binding details (C, B no defect):
- X1 The skill edits `learnings/LESSONS.md` at the registered repo root from `akrogon config`, never a worktree copy (skills/check-issue/SKILL.md:59, skills/merge-issue/SKILL.md:35).
- X2 An already-guarded removal is an applied lesson: remove the active line and date its history file with the guard's file:line, without rewriting the historical case (skills/implement-issue/SKILL.md:31).
- X3 The skill does not depend on LESSONS.md header text. Other repos' headers are out of the leaf's scope: pi-extensions carries "pruned at chart open" and gets an optional operator edit; the other eight do not.
- X4 An offered seed line names the lesson and the reachable case, never the check to build (skills/seed-issue/SKILL.md:26).

## Proofs
- `akrogon config`, read-only, identity: local user ivan, akrogon at 7bac4c1, 2026-10-05. From the repo root, from `src/` and from worktree `issues/worktrees/test-change-check`: `repo: akrogon` and `repos.akrogon: /home/ivan/Work/infra/akrogon`. From `/tmp`: `repo: none`. Cleanup: none needed. Limits: proves resolution of the registered root from root, subdirectory and worktree on this machine; does not prove behavior for other registered repos or other harnesses.

Correction 2026-10-05, operator: "one more thing, make sure to see if Matt Pockock's retro ideas are good material for the skill on what needs to be done. So you can put them in without mentioning him. But only if some of those ideas are good enough to be a part of the skill, in the context of what we're actually doing inside of akrogon."
Then: "then continue creating the handoff, sorry for interruption"
Taken into the skill without attribution (A,B,C; slots/ideas-A.md, draft-review-B.md, draft-review-C.md): fixed-pattern test for checkable; a guard counts only when reached from blocking `checks` or the command path, and an unwired check leaves the line checkable; each lesson's history and current mechanism are read before sorting; the pass stays scoped to active lessons (B); output grouped by outcome (C). Left out: session-log reading, navigation, tool economy, information access, steering size, reviewer-owned standards, building checks directly, missing hook or CI as a finding. Not added: a fourth "referent gone" outcome (A,C flag; C recommends stays), the operator can delete such a line by hand.
Draft review (B,C): already-guarded removals happen after the sorted list is shown without a further question, the uncommitted diff is the operator's review (C); criterion fixes for cheat.md form, cheat.md:128, learn.md wording, dry-walk evidence and the checks criterion (B,C).
