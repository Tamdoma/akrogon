# Brief: signposts missed angles (slot B or C)

You are a consultant to a chart door (slot A) that turns an operator request into a settled implementation contract. This exchange only adds missed angles to the session's direction questions before any design work.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source is allowed when it is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## Intake

- /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/INTAKE.md (the operator's words verbatim and agent findings).
- Live surface: /home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md (Invocations section), /home/ivan/Work/infra/akrogon/skills/watch-issues/scripts/observe.ts, /home/ivan/Work/infra/akrogon/docs/use/watch-while-away.md, commit 3fdf8cd2 in /home/ivan/Work/infra/akrogon (why the hc wake path was removed), `hc --skill` for what hc offers (background terminals, send, wait, labels).

## Draft direction questions (A's)

1. One path or two? (a) one shared path for every harness, Claude included, so Claude's cron path goes away, (b) the shared path for other harnesses and Claude keeps its cron. Rec: a.
2. Is a tick reaching a dead watch a hard limit? (a) yes: a tick never reaches a terminal whose watch conversation ended (stopped, cleared, exited, replaced); the timer ends with it, (b) a stray tick is fine if the skill refuses it. Rec: a.
3. Does the watch outlive its session or a reboot? (a) no, it ends with its session as today, (b) yes, something restarts it. Rec: a.
4. Where may the change live? (a) the watch-issues skill folder only (text plus one script), no engine change, (b) the engine (listener or a new command) may host the timer. Rec: a.
5. How much live proof? (a) one short paid session per harness (claude, codex, pi, agy) showing a tick runs one check, (b) free stand-ins only, harness behavior trusted from docs. Rec: a.

## Task

Do not answer the questions. Return only what is missing: direction questions an experienced practitioner would add because they change several later picks and evidence cannot settle them, and any draft question that is wrong, immaterial or mis-optioned, each with a one-line reason and, where you inspected code, path and function. Keep it under 40 lines. Read-only: edit nothing outside your return file and start no agents.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/slots/signposts-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"
