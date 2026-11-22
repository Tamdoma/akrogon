# Brief: opening territory map (slot B or C), blind

You map independently. Do not read any other slot's map file under this chart's slots/ folder.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source is allowed when it is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## Intake and locks

- /home/ivan/Work/infra/akrogon/issues/chart/run-check-kept-evidence/INTAKE.md
- Direction (binding for every pick): /home/ivan/Work/infra/akrogon/issues/chart/run-check-kept-evidence/forks/signposts.md `## Taken`
- Live surface: /home/ivan/Work/infra/akrogon/src/run-check.ts (`checkedRun`, `constructedEnv`), src/reconcile.ts (scratch-root run-root sweep, leaf temp release, ownTemps for checkout/self-update), src/verify.ts (`checkedRun` callers), src/leftovers.ts, src/status.ts, src/config.ts (`leafTemp`, `ensureLeafTemp`), tests/ for run-check and reconcile run-root cases, learnings/LESSONS.md (run-check lines).
- Operator's goal verbatim: "Think about it from the system's perspective how we can resolve it without destroying the other parts or ruining them. I want the simplest, most elegant solution."

## Task

Map the territory for the smallest fix: the material forks (each as a question with 2-3 options, what each option could break or invite later, and your pick with reason), practitioner questions, and pitfalls over the work's lifetime with what removes each. Name each consumer of the run root's existence (file and function) the change touches. Say which existing tests pin today's behavior. Cite path and function for code claims. Under 80 lines.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/run-check-kept-evidence/slots/map-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"
