# Fork brief: agent questions (Needs-you A5 and decision buttons A6)

You are a consultant seat (letter in the one-line prompt). Work alone; you will not see the other seats' notes. Edit no file except your return file. Do not contact the operator. Read-only commands are fine; do not send text to any terminal.

## Context

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md. Read "Source: operator 2026-11-03", "Round 1", "Default layout". A5 and A6 are in "Agent findings".
- Locks already settled: panels live in /home/ivan/Work/infra/herdr-setup (the operator's herdr-app setup repo, linked into ~/.config/herdr-app) and go into the `flat` layout only, which is the default layout everywhere. Look only via theme() tokens and Program icons. Tasks reads `akrogon status --json` (not this fork).
- Related evidence: the opening maps and rebuttals in /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/ (map-*.md, map-rebuttal-*.md). Your own seat's map is yours to reuse.
- Facts A verified 2026-11-03 (better-than-training): `hc send --help` lists `--force`, `--json`, `--if <idle|working>`, `--wait`, `--timeout`; there is no `--raw`. `hc schema`: Status has `state` (idle, working, done, blocked, error), `kind` (permission, question or auth, blocked only, when the program said), `msg`, `title`; `terminal.send` "Paste text and press Enter, once nobody has typed for ~3 s ... Refuses a blocked program unless `force`"; `ReadResult` has `text`, `complete`, `how` (screen, history, stitched), `why`; the core also has `doc.get` / `doc.set` (opaque JSON documents, at most 1 MiB, versioned, emitting a doc event to `events.subscribe` subscribers). A seat that finished its last task shows `done` until someone looks, then `idle`; `hc send --if idle` refuses `done`.
- The operator's own reply shapes in two weeks of prompts: "1a | 2a | 3b", "a1 - note | a3 - note", "go 01b", "1a 2b", and the alias "elid" (263 uses). Chart-door rounds follow /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md (section "Operator questions and peer exchange"): options as `- **1a (recommended)** ...`, ending with a line "Reply `1a 2b`, or a numbered free-text answer."

## Questions for your notes

1. What should count as "an agent needs you" in the Needs-you list, and what text should a row show?
2. How should the decision buttons (A6) find the current question's options reliably?
3. How should a reply be delivered, for an agent that is idle/done versus one that is blocked (permission, question, auth)?
4. Should the decision strip have shortcut buttons beyond the options (for example "all recommended", "elid"), and should a click send at once or build an editable draft?

## Notes format

For each question, your own position, not a review of anyone: (1) your pick with its reason and cost; (2) each rejected option with its reason; (3) evidence with tier (operator, practitioner, better-than-training, model-knowledge with the searches you ran), source and date; (4) pitfalls and what removes each (an option choice, a probe before handoff, a done-criterion, or an operator step); (5) any question you would ask that this fork does not. Name any probe you think must run before this can be built (what to run, what result settles it).

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text; cite code by path:line.

## Return

Write to exactly: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/agent-questions-<YOUR LETTER>.md

Then, as your last action, run exactly (with your letter):
hc send t15 "done <YOUR LETTER>: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/agent-questions-<YOUR LETTER>.md"
