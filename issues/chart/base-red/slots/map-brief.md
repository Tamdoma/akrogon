# Opening map brief, slot B

You are slot B in a chart-issues door run by slot A (pane w8:pNP). Write your own independent territory map. Do not read any other slot's map. Do not edit any file except your return file.

## Return path

Write your map to exactly: /home/ivan/.claude/jobs/6a0d8d81/tmp/chart2/map-B.md (moved to this folder after the exchange)

## Intake (read verbatim)

- /home/ivan/Work/infra/akrogon/issues/seeds/96-watch-issues-re-classifies-a-failed-leaf.md (Tamdoma/akrogon#96)
- /home/ivan/Work/infra/akrogon/issues/seeds/97-watch-issues-busy-loop-bar-is-counted-by.md (Tamdoma/akrogon#97)
- /home/ivan/Work/infra/akrogon/issues/seeds/98-base-turns-red-without-a-commit-and.md (Tamdoma/akrogon#98)

Operator note for this pass, verbatim: "I've pulled the new issues in. Please let's chart them out."

## Live surface to start from (inspect, then follow one hop)

- #96: /home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md, src/state.ts (failureSchema), src/phase.ts (failure write and announcement), every seat skill that writes a failure (grep `failed` / `--reason` in skills/)
- #97: skills/watch-issues/SKILL.md, skills/watch-issues/scripts/log-tail.ts
- #98: skills/implement-issue/SKILL.md, skills/check-issue/SKILL.md, skills/merge-issue/SKILL.md, src/verify.ts, src/next.ts, src/admission.ts, issues/closed/red-base-wait/ (the replaced known-red flow), `git show ac50164`, issues/log.jsonl, issues/verify-runs.jsonl, tests/ real-clock use

Local `main` is 2 commits behind `origin/main`; the difference touches only src/status.ts and two status tests, none of the surfaces above.

## Existing locks

- Chart issues/chart/jev-classifier (closed 2026-10-17): no classifier model API is added to akrogon. #96 and #97 were filed from that chart as plain-code ideas; the operator chose to seed them, not chart them then. They are now charted.
- Autopilot chart (issues/chart/autopilot): only the operator flips autopilot; no new timers or polling. Leaves autopilot-mode and any-consultants are in check.review now.

## Task

Map the territory for all three seeds, proportional to each:

1. Split: which seeds share a destination (one chart) and which are separate charts, and why. Order of work.
2. Per destination: the material forks (questions whose answer changes the outcome), each with the options you see, what each option could break or invite later, not only now.
3. Questions an experienced practitioner would ask, and pitfalls over the work's lifetime, each with what removes it.
4. Whether any seed should not be built (state the reason and the evidence), and any part that is a step on main rather than leaf work.
5. Evidence: cite file:line for every claim about this repo; name outside sources with date for anything outside it, or say what you searched and found nothing.

Keep it compact. Notes, not prose.
