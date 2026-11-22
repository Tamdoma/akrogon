# Brief: blind territory map (slot B or C)

You are a consultant to a chart door (slot A) that turns an operator request into a settled implementation contract. A and each consultant map the territory independently; you will not see the others' maps until all finish.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source is allowed when it is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## Intake and locks

- /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/INTAKE.md
- Lock 1: /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/forks/seed-decision.md `## Taken` (operator decision on #146, verbatim).
- Lock 2: /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/forks/signposts.md `## Taken` (operator answers verbatim plus A's reading). In short: consult on every case the watch now only notifies on, one consult per root cause; the consultant may fix (worktree edits and commits, push a base fix to main), the watch may move leaves out of failed; operator stops are credentials/logins, money past a grant, changing an operator decision or lock, host tooling installs or downgrades, force pushes or history rewrites, and a fix that completely changes what was decided before; the watch waits with no give-up time and every exchange goes over `hc send`; one consultant alive per watch, no total cap, watch and consultant are peers; real paid proof in a throwaway repo. Default recipe in `~/.akrogon/config.yaml`: agy neon high.
- Live surface: /home/ivan/Work/infra/akrogon/skills/watch-issues/ (SKILL.md, scripts/ — timer.ts, tick.ts, stop.ts, observe.ts), /home/ivan/Work/infra/akrogon/src/config.ts (`globalSchema`, `repoSchema`), /home/ivan/Work/infra/akrogon/src/akrogon.ts (`seat` case), /home/ivan/Work/infra/akrogon/src/seat.ts (`startConsultant`, `firstTask`), /home/ivan/Work/infra/akrogon/src/hc.ts (`consultantName`), /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md (Open: consultant start, restart, column helper) and assets/questions.md (Blind peer exchange), /home/ivan/Work/infra/akrogon/skills/merge-issue/SKILL.md (how a red base is handled today), /home/ivan/Work/infra/akrogon/docs/ (watch and config docs), `hc --skill`, `hc wait --help`, `hc send --help`.

## Task

Map the territory, proportional to the work: the forks that change the outcome (each as one sharp question with its options), practitioner questions, and pitfalls over the work's lifetime — what each option could break or invite later, not only now — grounded in inspected surfaces with path and function. Cover at least: how the watch tells two failures share one root cause; what the consultant receives and returns; how a consultant fix reaches main and how leaves resume after it (merge-issue, `akrogon phase`); how the Never list and "Answer a seat" change; who records consult decisions for the operator's later review; config shape and what happens when the recipe is absent; consultant naming collisions with chart doors (`<prefix>-slot-<x>`); cleanup on stop and on watcher exit; and what a no-time-limit wait does to queued ticks and to a consultant that stops silently. Name every external operation a leaf would rely on that needs a real observation before handoff. Keep it under 90 lines. Read-only: edit nothing outside your return file and start no agents.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/watch-consultants/slots/map-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"
