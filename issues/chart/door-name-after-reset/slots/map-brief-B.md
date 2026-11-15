# Brief: opening map, slot B

You are slot B. Work alone, start no agents except the throwaway probes allowed below, change no file except your return file, and do not read other slots' map files (map-A.md, map-B.md, map-C.md) under /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/slots/.

## Task

Map the territory for this chart, blind and in your own view: the forks that change the outcome, the questions a practitioner would ask, and the pitfalls over the work's lifetime (what each option could break or invite later). For each fork give the options and your pick with evidence. Stay proportional: this is one small change. Under 90 lines.

The session's direction is set: read /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/forks/signposts.md, section Taken. In short: at the door's handover reset the helper puts the name back, the session's own name first, the tab name when the session has none, on claude, nothing stored, a logged skip on failure.

Things A wants your independent view on, among whatever else you find:
- where exactly the helper reads the session's own name and the tab name, with the inspected code or command;
- the order of steps around the reset (rename before the reset, after it, or both) and its failure cases;
- how the existing stand-in test (tests/door-reset.test.ts, tests/door-agent.ts) can prove it;
- what codex 0.169.0 and pi 1.5.2 do with a session name across /new.

## Context

- /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/INTAKE.md
- /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/forks/signposts.md
- /home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/door-reset.ts, /home/ivan/Work/infra/akrogon/src/hc.ts, /home/ivan/Work/infra/akrogon/src/transcript.ts, /home/ivan/Work/infra/akrogon/tests/door-reset.test.ts, /home/ivan/Work/infra/akrogon/tests/door-agent.ts
- /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/handover.md and SKILL.md section Handover

Probes: read-only inspection is free. You may not start paid agent sessions; A runs those. Type no keys into any terminal.

Reading rule: read process text (skill files) by named section for the step you are answering. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once. A section you have not read, content that changed, and content lost to compaction stay readable. The full source stays allowed when the source is the subject of the work. Name sections, never line ranges.

## Return

Write your map to /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/slots/map-B.md, then run:

hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/door-name-after-reset/slots/map-B.md"
