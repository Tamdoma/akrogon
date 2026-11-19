# Signposts angles brief, slot B

You are slot B, consultant to the akrogon chart door (slot A, terminal t126) in /home/ivan/Work/infra/akrogon. Work alone: read no other file under /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/slots/ except the ones named here. Edit nothing outside your return file.

Reading rule (binds every consultant): read process text by named section for the step you are answering. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text.

## Inputs

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/INTAKE.md (report Tamdoma/akrogon#144 verbatim, the operator's words, agent findings).
- A's signposts draft: /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/slots/signposts-draft.md.
- Worked example, read only: `gh issue view 714 -R Tamdoma/tamdoma-framework`.

## Task

Signposts are the session's direction: ranked priorities, hard limits, and the scope of the work. They steer every later pick in this chart. Read the intake and the draft, then return:

1. Missed angles: up to three signposts questions the draft lacks, each one that changes several later picks and that evidence cannot settle. Give options, your pick and what it steers.
2. Disagreements: any draft question whose recommended option you would not pick, with your reason.
3. Needs: any operator-only need (a key, login, paid launch, human action, approval) you foresee, or "none".

Under 50 lines. Plain words.

## Return and report

Write to /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/slots/signposts-B.md, then run:
hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/slots/signposts-B.md"
