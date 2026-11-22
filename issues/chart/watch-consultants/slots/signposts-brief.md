# Brief: signposts missed angles (slot B or C)

You are a consultant to a chart door (slot A) that turns an operator request into a settled implementation contract. This exchange only adds missed angles to the session's direction questions before any design work.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source is allowed when it is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## Intake and locks

- /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/INTAKE.md (the seed report, the operator's words verbatim and agent findings).
- Lock: /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/forks/seed-decision.md `## Taken` is the operator's decision. It is not up for debate; questions build around it.
- Live surface: /home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md (Judge and Never sections), /home/ivan/Work/infra/akrogon/skills/watch-issues/scripts/ (timer.ts, tick.ts), /home/ivan/Work/infra/akrogon/src/akrogon.ts (`seat` case), /home/ivan/Work/infra/akrogon/src/seat.ts (`startConsultant`), /home/ivan/Work/infra/akrogon/src/config.ts (`globalSchema`), /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md (Blind peer exchange: how the door asks, waits and collects), `hc --skill`.

## Draft direction questions (A's)

1. What may the watch do with a consultant's answer? (a) only what the watch can already do (`next`, `phase` recover, one steer prompt, notice); the answer picks among them and the Never list stays, (b) also hand fix work onward, for example write a fix seed or chart prompt, (c) also make fixes itself (edit code on main, edit leaf state). Rec: a. Steers: Never list, blast radius, proof size.
2. What counts as "truly needs the operator"? (a) only credentials or logins, money beyond a recorded grant, and changing an operator decision or lock; everything else is the consultant's call, (b) also any change outside the leaf's own scope. Rec: a. Steers: when notice fires, how often the watch stops.
3. How many consultants and how long do they live? (a) one consultant per hard failure, closed after its answer is acted on, (b) one standing consultant per watch reused across failures. Rec: a. Steers: cost per watch, context drift, cleanup.
4. Bound on consultant launches? (a) a fixed limit per failure and per watch, past which the watch notifies, (b) no limit. Rec: a. Steers: spend, loop risk.
5. Where may the change live? (a) watch-issues skill plus small akrogon src changes (config consultant entry, `akrogon seat --slot` reading it), (b) skill only, recipe read by a skill script. Rec: a. Steers: leaf count, review size.
6. How much live proof? (a) one real watch run where a staged hard failure starts a real consultant, its answer comes back over hc send and the watch acts, (b) free stand-in programs as the consultant, harness behavior from the merged watch-any-harness proofs. Rec: a. Steers: paid grant.

## Task

Do not answer the questions. Return only what is missing: direction questions an experienced practitioner would add because they change several later picks and evidence cannot settle them, and any draft question that is wrong, immaterial, mis-optioned or against the lock, each with a one-line reason and, where you inspected code, path and function. Keep it under 40 lines. Read-only: edit nothing outside your return file and start no agents.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/slots/signposts-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"
