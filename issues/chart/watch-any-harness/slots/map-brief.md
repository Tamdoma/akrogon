# Brief: blind territory map (slot B or C)

You are a consultant to a chart door (slot A) that turns an operator request into a settled implementation contract. A and each consultant map the territory independently; you will not see the others' maps until all finish.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source is allowed when it is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## Intake and locks

- /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/INTAKE.md
- Locks: /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/forks/signposts.md `## Taken` (operator answers 1a-6a and N1, verbatim). In short: one shared timer script under the watch-issues skill's scripts folder for every harness, Claude cron removed; ticks stop on stop, agent exit or terminal reuse, an in-conversation reset caught where the harness shows it and a stated limit where not; no expiry; one watch per repo; change only in the skill folder plus reuse of akrogon src helpers, inside hc only, no listener/herdr/harness change; E2E on real claude, codex, pi and agy with use cases covering every function of today's Claude-only watch, no regressions.
- Live surface: /home/ivan/Work/infra/akrogon/skills/watch-issues/ (SKILL.md, scripts/), /home/ivan/Work/infra/akrogon/tests/e2e/watch-check.e2e.ts, /home/ivan/Work/infra/akrogon/docs/use/watch-while-away.md, /home/ivan/Work/infra/akrogon/src/hc.ts, /home/ivan/Work/infra/akrogon/src/transcript.ts, /home/ivan/Work/infra/akrogon/src/install.ts (skill links), commit 3fdf8cd2, `hc --skill` and `hc <cmd> --help`. How each harness takes a typed skill invocation (claude `/name`, pi, codex, agy) is part of the map.

## Task

Map the territory, proportional to the work: the forks that change the outcome (each as one sharp question with its options), practitioner questions, and pitfalls over the work's lifetime — what each option could break or invite later, not only now — grounded in inspected surfaces with path and function. Include a regression inventory: every function today's Claude-only watch has (start, duplicate report, tick, queued ticks, stop, /clear detection, paused repo, expiry, session loss) and how each maps onto the new design. Name any external operation a leaf would rely on that needs a real observation before handoff. Keep it under 90 lines. Read-only: edit nothing outside your return file and start no agents.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/slots/map-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"
