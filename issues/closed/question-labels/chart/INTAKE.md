# Intake: question-labels

## Scope
One destination: chart-issues operator rounds always label questions and options as `1a`, `1b`, `2a`. One leaf in akrogon, owning `skills/chart-issues/assets/questions.md`.

## Provenance
- Operator: 2026-09-28 /chart-issues note with screenshot https://i.ibb.co/qF9TnBTz/screenshot.png

## Source: operator 2026-09-28
https://i.ibb.co/qF9TnBTz/screenshot.png <- I don't like it how that every time a new fork opens up or there is a new set of questions, the question format is different. For example, look at this, what is this QM, QN, etc.? Can we always stick to the 1A, 1b, 1c, 2a, 2b, 2c, etc? I understand if these have some meaning, but can we have it at least consistent like this in some way or form? I need the simplest, most elegant solution. I don't want to overcomplicate the skill itself for this.

## Agent findings
- Screenshot (framework chart session): the question is headed `QQ ·`, options are `O1`, `O2`, `O3`, the footer reads "awaiting your QQ answer", the operator replies `qq a`.
- `skills/chart-issues/assets/questions.md:8,14,21` label the question `Q1`, the options `A`/`B`, and the reply key `1-A 2-B`. Three separate schemes in one template.
- `questions.md:27` restarts numbering at 1 each round.
- `~/.claude/CLAUDE.md` Reference Points tells the agent to code questions `Q1`, options `O1`, keep codes across the conversation, and invent new codes. Restarting at `Q1` collides with codes already used earlier in the conversation, so the agent invents new ones (`QQ`, `O1`). This collision is the cause.
- Recorded answers already drift: `1-A` (status-empty-open), `Q1-A` (chart-peer-panes), `1c` (failed-leaf-routing).
