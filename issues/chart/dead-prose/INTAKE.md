# Intake: dead-prose

## Scope
Two prose groups the operator named on 2026-09-14, charted together, likely two leaves in akrogon.

L4, lifecycle skills: "Peer-question paragraph, `Next:` line, failed-diagnosis rule, check's ponytail copy, lesson removal rule, reviewers committing lessons. One prose leaf." Later restated: reviewers committing lessons becomes lessons written in the registered checkout and the operator commits.

L5, chart skill: "Small rounds may be small, corrections are dated additions, fog empty at handoff as preflight check, Forks open removed, standing-design read not copied into design.md, state.yaml written last within a leaf." Also fixes the shapes.md template phase line.

## Provenance
Operator 2026-09-14 leaf order L1, L3, L2, L4+L5. Astra audit F6 "Let a small operator question be small" (drop invariant full-round presentation, keep decision-bearing content and explicit operator resolution) and F7 "Share the identical Ponytail source without adding a common-context loader" (one canonical file, the other a relative symlink, no loader).

## Agent findings, all on origin/main unless noted
1. Peer-question paragraphs: broadcast-issue:25, check-issue:45, implement-issue:25, merge-issue:21, plan-issue:27. Each asks once through herdr in Question/Option form and waits on `<leaf>/questions/<id>.md`. Fired: zero `questions/` folders across 133 closed leaves in akrogon and framework.
2. Footer blocks: every skill prints `Last operation:` and `Next:` (broadcast:50-54, chart:62-63, check:54-60, implement:62-68, init:82-83, merge:52-58, plan:62-68, seed:66-67). Five carry a "scrambled context" paragraph saying the other pane's first 50–100 words may confirm what happened but cannot establish slot, phase, readiness, completion or a peer answer. The `Next:` line is printed only; the command dispatches from state.yaml, never from the footer.
3. Failed-diagnosis rule: merge-issue:37 "If that repair request prints `moved failed`, append A's diagnosis paragraph to `plan.md`"; check-issue:47 has the same clause. After the merge-conflict-route leaf a merge move can never print `moved failed`. Diagnosis text appears in 2 closed plan.md files; the three logged failures came from plan.positions, implement and plan.synthesis, none from a review cap.
4. Ponytail: implement-issue/ponytail.md and check-issue/ponytail.md are byte-identical (same md5). check-issue:14 and implement-issue:14 each read their own copy. Installer links whole skill folders.
5. Lesson rules: implement-issue:29, check-issue:41, merge-issue:27, plan-issue:31 each restate the one-line-plus-history shape; plan-issue:25 says lessons describe what happened, not rules; chart-issues:27 offers a prune. Lesson commits: akrogon 6 "Record ... lesson" commits, framework 5, each made by the merging slot A on the leaf branch or by the operator. `learnings/LESSONS.md` lives in the registered checkout, outside leaf worktrees.
6. Chart skill: questions.md:27 "Every round uses this exact shape ... never cut"; shapes.md:26 `## Forks open`, :29 `## Fog`, :15 charts have no state.yaml; :142 design template copies the standing block; :160 state.yaml sample; SKILL.md:45 record answers and reasons, :51-53 handoff and B exchange, :55 audit and preflight. The three charts this session (command-deletions, plan-is-contract, merge-conflicts-a) each copied the standing block verbatim into design.md and listed Forks open then emptied it.
7. Local checkout is two commits behind origin/main (plan-is-contract-skills merged). Line numbers above are from origin/main.

## Practitioners
Not yet gathered; each fork carries its own research.
