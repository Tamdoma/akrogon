# Brief: signposts missed angles (slot B or C)

You are a consultant to a chart door (slot A) that turns an issue report into a settled implementation contract. This exchange only adds missed angles to the session's direction questions before any design work.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source is allowed when it is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## Intake

- /home/ivan/Work/infra/akrogon/issues/chart/run-check-kept-evidence/INTAKE.md (the report verbatim, the operator's words, agent findings).
- Live surface: /home/ivan/Work/infra/akrogon/src/run-check.ts, /home/ivan/Work/infra/akrogon/src/reconcile.ts, /home/ivan/Work/infra/akrogon/src/AREA.md (run-check and reconcile lines).

## Draft direction questions (A's)

1. What does this session optimize first? (a) the smallest change that stops kept evidence from vanishing, (b) a general evidence-retention feature for every wrapped run. Rec: a.
2. Which existing temp contracts are hard limits? (a) success-path cleanup, per-leaf temp ownership and reconcile's sweep stay exactly as they behave today; only the failed-run path may change, (b) any temp behavior may change if simpler overall. Rec: a.
3. Where may the fix live? (a) akrogon only, removing the class for every wrapped driver, (b) also change framework drivers' default evidence roots. Rec: a.
4. How is the fix proven? (a) free local runs only, no paid capture, (b) one paid capture rerun. Rec: a.
5. What happens to the two lessons that describe this mechanism? (a) the stopping leaf retires both lines, (b) leave lessons to /learn-issues. Rec: a.

## Task

Do not answer the questions. Return only what is missing: direction questions an experienced practitioner would add because they change several later picks and evidence cannot settle them, and any draft question that is wrong, immaterial or mis-optioned, each with a one-line reason and, where you inspected code, path and function. Keep it under 40 lines.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/run-check-kept-evidence/slots/signposts-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"
