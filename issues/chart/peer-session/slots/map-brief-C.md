# Opening map brief, seat C

You are consultant seat C for a chart-issues door run by seat A. Work blind: do not read any other seat's map. Write nothing in the repo; write only your return file.

## Task

Produce an independent territory map for the intake below: the forks that change the outcome, questions a practitioner would ask, and pitfalls over the work's lifetime, including what each option could break or invite later, not only now. Ground every claim in inspected surfaces (path:line) or a named outside source with date. Proportional to the work.

For each fork: the question, the options, your pick with reason and cost, each rejected option with reason, evidence (tier: operator / practitioner / better-than-training / model-knowledge, source, date), pitfalls with what removes each. End with fog (in-scope work whose question is not sharp yet) and any human-only prerequisites or external operations that would need a real proof call before handoff.

## Intake

- /home/ivan/Work/infra/akrogon/issues/chart/peer-session/INTAKE.md and /home/ivan/Work/infra/akrogon/issues/chart/peer-session/CHART.md (Destination and Fog).
- Sibling chart already handed off, whose locks this chart must stay consistent with: the Taken sections of /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/forks/session-address.md, stopped-and-ambiguous.md, cross-session-reads.md and call-coverage.md, and the leaf contracts under /home/ivan/Work/infra/akrogon/issues/open/herdr-session/ (session-routing delivers the shared resolver and argv builder with an executable parameter).

## Live surface

- Repo: /home/ivan/Work/infra/akrogon (registered key akrogon, default branch main). Tracked sources: skills/chart-issues/scripts/{peer-ask,peer-wait,peer-restart,peer-create,door-reset}.ts and their tests, skills/chart-issues/SKILL.md, skills/chart-issues/assets/questions.md. Installed copies under ~/.akrogon/releases/ are not edited.
- herdr 0.9.1: `herdr session list --json`, global `--session <name>` beats HERDR_SOCKET_PATH, ids are per server. Docs: https://herdr.dev/llms.txt
- Grounding: /home/ivan/Work/infra/akrogon/docs/reference-index.md, learnings/LESSONS.md.

## Constraints

Make no herdr mutation and run no akrogon command. These scripts are running this exchange; do not run them.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work (here: the scripts above). Reads name sections, never line ranges.

## Return

Write your map to exactly: /home/ivan/Work/infra/akrogon/issues/chart/peer-session/slots/map-C.md
