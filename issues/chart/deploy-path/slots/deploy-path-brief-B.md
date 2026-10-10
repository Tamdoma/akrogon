# Fork notes brief, slot B: deploy-path

Blind notes. Do not read other slots' files in /tmp/claude-1000/-home-ivan-Work-infra-akrogon/0f21842f-d038-46f1-a1db-ba2b3c8ebb07/scratchpad/chart except this brief. Read-only except your return file. Note definition: /home/ivan/.claude/skills/chart-issues/assets/questions.md "Blind peer exchange" (five parts per question: pick with reason and cost; each rejected option with reason; evidence with tier, source, date; pitfalls with what removes each; questions the fork does not ask).

## Intake
Operator note: "make the system faster, more efficient, cheaper and move faster ... system thinking ... reinforcing and balancing loops ... stock and flow ... change systematically without making the system work worse." Reports: /home/ivan/Work/infra/akrogon/issues/seeds/{63,69,73,75}-*.md

## Verified fact behind this fork (A, 2026-10-10)
- ~/.local/bin/akrogon -> /home/ivan/Work/infra/akrogon/src/akrogon.ts (the root checkout). docs/guide/install.md:37-41 "The links point back to this checkout. Update it with: git pull".
- Root main is behind origin/main by 52 commits (git status -sb). Today's merged leaves (red-main-hold, bounce counting, queue order, attempt records, batch limit, culprit eject, lesson-write-rule, seed-owner-routing) are on origin only; src/attempts.ts and src/hold.ts are absent locally.
- Root also has uncommitted edits not on origin: src/next.ts (dispatchLeaf waiting change), tests/next.test.ts, tests/batch-dispatch.test.ts, tests/pause-next.test.ts, skills/chart-issues/scripts/peer-wait.ts, skills/chart-issues/assets/questions.md, docs/guide/next.md, learnings/LESSONS.md. So the live command runs untested local code on a stale base.
- Merge model: leaves push from worktrees to origin; skill text says the root checkout is never reset. Lesson learnings/LESSONS.md:18 (2026-09-27, stale door checkout) recorded the same lag for the chart door; no guard followed.
- Framework consumer measured (A): bounce rate 0-15%/day before 2026-10-02, 31-67%/day from 10-02 (framework commit ab700d4cc put framework:verify in merge_checks); merge residence median 16-276 min/day since; merge = 58% of framework leaf wall time (C). The landed akrogon throughput fixes target exactly this, but are not live.

## Question
Q1. How should landed akrogon work reach the command, skills and plugin that every seat and consumer repo actually runs, so "merged" means "in effect" without a manual step, and without making a bad landing or a mid-leaf change worse?
Candidate options (add or reject): (a) a dedicated deploy checkout that install links point to, fast-forwarded by the command right after it pushes an akrogon leaf, root stays a dev checkout; (b) the command fast-forwards the root checkout after an akrogon push when clean, warns otherwise; (c) warn only: next/status print how far the installed command is behind origin; (d) status quo, operator pulls by hand.
Also note: timing of the switch relative to running seats, rollback, and the uncommitted root edits (human prerequisite: who reconciles them).

## Carries / locks
- Existing charts handed off today: /home/ivan/Work/infra/akrogon/issues/chart/{clean-merge-gate,merge-load-flakes,lesson-guards}, closed merge-throughput. Do not reopen them.
- Inspect origin/main for code (git show origin/main:<path>), not local main.

## Return
/tmp/claude-1000/-home-ivan-Work-infra-akrogon/0f21842f-d038-46f1-a1db-ba2b3c8ebb07/scratchpad/chart/deploy-path-B.md
