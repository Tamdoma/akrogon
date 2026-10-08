# Opening map brief (chart-issues door, blind peer exchange)

You are a charting peer. Slot letter is given in the prompt. Work blind: do not read other slots' map files in this directory.

## Task

Write an independent territory map for the intake below, per the "Blind peer exchange" and "Drain" rules in
/home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md and /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md.

Cover: the material forks (questions whose answer changes the outcome), practitioner questions, pitfalls over the work's
lifetime, and what each option could break or invite later. Ground every claim in inspected files with path:line. For
outside practice, name the source or say the search found nothing. Do not edit any repo file. Do not ask the operator anything.

Return only your map to the return path for your slot:

- A: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/d6811aa5-a3e8-4fc4-9e08-c29cd9020034/scratchpad/chart-open/map-A.md
- B: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/d6811aa5-a3e8-4fc4-9e08-c29cd9020034/scratchpad/chart-open/map-B.md
- C: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/d6811aa5-a3e8-4fc4-9e08-c29cd9020034/scratchpad/chart-open/map-C.md

## Intake (operator note, verbatim, 2026-10-08)

> Great, we also need to chart one thing. I was thinking about something like a non-handoff mode where all of the gating and all of the charting is done, but then after that what actually happens is that the consultant slots do the implementation. This would be done only for smaller issues that dont need the entire process. Is that doable? Consult with slot B and slot C, they're both active here in this tab. I need you to understand what I want. My intent is to have a mode that is not gonna be default mode, but that can be changed in the settings of the Aprogon Repo or whatever other repo is consuming. Aprogon system. So what happens is that this mode would enable the consultants to do the actual implementation themselves. This is for smaller issues that don't need multiple issues or multiple leaves, etc. The main charting session would also be able to advise at the end, just like it advises for debate. It could also advise on whether to use the full life cycle or whether to just do it immediately now. We would only have slot , which is who I'm talking to right now, and slot B involved as the reviewer. So slot A would be the implementer, and slot B would be the reviewer. Very similar to what's happening inside of the life cycle.

("Aprogon"/"Akrogon" = akrogon. "Consultant slots" = the chart door's peer panes. "Slot A" = the chart door session itself.)

## Context

Earlier in the same session the operator asked the door to skip charting and implement a small status-display change
directly; the door implemented it in place on main with tests, with no reviewer. That is the informal version of this mode.

## Live surface to inspect

- /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md (Handoff section: debate question, preflight, handoff markers)
- /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/shapes.md, questions.md, standing-design.md
- /home/ivan/Work/infra/akrogon/skills/implement-issue/SKILL.md, check-issue/SKILL.md, merge-issue/SKILL.md, broadcast-issue/SKILL.md
- /home/ivan/Work/infra/akrogon/src/config.ts (repo config schema, `issues/config.yaml`), src/routing.ts, src/phase.ts, src/next.ts
- /home/ivan/Work/infra/akrogon/issues/config.yaml
- /home/ivan/Work/infra/akrogon/docs/ (operator guide)

## Existing locks

None recorded for this chart.
