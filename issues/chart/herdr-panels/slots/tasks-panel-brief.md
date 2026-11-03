# Fork brief: Tasks panel (A4)

You are a consultant seat (letter in the one-line prompt). Work alone; you will not see the other seats' notes. Edit no file except your return file. Do not contact the operator. Read-only commands are fine; do not send text to any terminal.

## Context

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md. Read "Source: operator 2026-11-03", "Round 1", "Default layout", "Round 2".
- Locks: the Tasks panel is a herdr mod shipped by akrogon (the rest of the panels live in /home/ivan/Work/infra/herdr-setup). It reads only a new `akrogon status --json` and shows everything `akrogon status` shows (paused, stopped, blocked-by, Missing:, deploy failed, broadcast pending, slow merge, merge queue), so the operator never needs to run the command. It lives in the right-hand panel of the `flat` layout, reached by a button beside Files and Changes (and Needs you). The operator: "I don't want to be complicating the existing interfaces. I like what they are today." Look via theme() tokens and Program icons only. A window sees only its own session's terminals.
- Today's akrogon status: source /home/ivan/Work/infra/akrogon/src/status.ts (and src/akrogon.ts for flags); run `akrogon status` and `akrogon status <slug>` read-only to see the real output; leaf state in each registered repo's issues/open/**/state.yaml (src/state.ts); merge queue order src/turn.ts; slow-merge rule src/verify.ts (decideSlow); timing records issues/timings.jsonl; registered repos via `akrogon config`. akrogon still starts leaf seats in the old herdr until its herdr-app port lands (/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md).
- Earlier seat positions on Tasks are in /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/map-merged.md ("Where seats differ" 1-3) and map-rebuttal-*.md; your own seat's map is yours to reuse.

## Questions for your notes

1. What does one row show, and how are rows grouped (by repo, by phase, by attention)? Include where paused, stopped, blocked-by, missing keys, deploy failed, broadcast pending and the merge queue appear.
2. When should a job be marked as taking too long, and who computes it (akrogon in `--json`, or the panel)?
3. What does clicking a row do today (seats still in old herdr) and after akrogon's herdr-app port?
4. Is Tasks the panel that shows by default, and what does that mean given the shipped `tabs` mod remembers a panel per space (/home/ivan/.config/herdr-app/mods/tabs/main.js) and the operator wants existing interfaces unchanged?
5. Which repos does it show (all registered, or the current space's repo first), and what must the `--json` output contain for all of the above (field list)?

## Notes format

For each question, your own position, not a review of anyone: (1) your pick with its reason and cost; (2) each rejected option with its reason; (3) evidence with tier (operator, practitioner, better-than-training, model-knowledge with the searches you ran), source and date; (4) pitfalls and what removes each (an option choice, a probe before handoff, a done-criterion, or an operator step); (5) any question you would ask that this fork does not. Name any probe that must run before building.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text; cite code by path:line.

## Return

Write to exactly: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/tasks-panel-<YOUR LETTER>.md

Then, as your last action, run exactly (with your letter):
hc send t15 "done <YOUR LETTER>: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/tasks-panel-<YOUR LETTER>.md"
