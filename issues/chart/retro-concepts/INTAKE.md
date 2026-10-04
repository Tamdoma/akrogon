# Intake: retro-concepts

## Scope
Decide whether concepts from Matt Pocock's `retro` skill would meaningfully improve Akrogon's process, where they would fit, whether they complement the existing lessons mechanism or widen the mental model, and whether any change is worth making. Destination repo: akrogon.

## Provenance
- Operator: chart-issues invocation, 2026-10-04
- Practitioner source: github.com/mattpocock/skills, `skills/engineering/retro/SKILL.md` and `skills/engineering/ask-matt/SKILL.md`, commit a7d038f (2026-09-24), read 2026-10-04; copies in `slots/source-retro-SKILL.md` and `slots/source-ask-matt-SKILL.md`

## Source: operator 2026-10-04
Look up the "retro" skill by Matt Pockock. See if any of its concepts could be used to improve Akrogon in some way. What does the skill actually do? Where does it have a place that would make a meaningful improvement in Akrogon's process? Would it complement the existing system, or would we have to expand on it without creating new complexity and a harder mental model? Even so, if we had to do it, would it be worth it? Consult with slot b (codex) and slot c (claude using fable 5.1 medium) which you will have to spawn.

## Agent findings
- Lessons today: each phase seat (plan, implement, check, merge) may write one mechanism/date/history line to `learnings/LESSONS.md` plus a history file; chart-issues offers a prune at open (`skills/chart-issues/SKILL.md:29`, `skills/merge-issue/SKILL.md:35`, `docs/guide/learn.md`).
- `learnings/LESSONS.md` holds 15 active lines, `learnings/history/` holds 40 files.
- Session-log reading already exists: `skills/watch-issues/scripts/log-tail.ts` parses claude and codex logs.
