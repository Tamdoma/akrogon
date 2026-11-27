# Opening map brief, slot C

You are slot C, an independent consultant for a chart door (slot A, hc address t126). Work alone. Do not read other seats' map files in /home/ivan/Work/infra/akrogon/issues/chart/watch-one-read/slots/.

## Task

Map the territory for this outcome, grounded in inspected code: Tamdoma/akrogon#160. The watch-issues skill reads `akrogon status` at the start of every check only to learn whether the repo is paused, while `observe.ts` already prints every leaf line. A watcher filtered the noisy status output and went blind for six ticks. Intended direction (signposts below): the tick reads one minimal artifact.

Return, in plain compact notes:
1. Material forks: each design question that changes the outcome, with options, what each could break or invite later, and your pick with reason.
2. Practitioner questions a seasoned engineer would ask.
3. Pitfalls over the work's lifetime and what removes each.
4. Every consumer of the current observe.ts output format and every place that names `akrogon status` in the watch path (file and function or test name), and what must change.
5. Proof: which existing tests reach each property (free vs paid live runs), and what new proof is needed.
6. Anything surprising or contradicting the intake, flagged.
Cite file paths and function or test names for every claim. Mark low-confidence items.

## Inputs

- Intake (read whole): /home/ivan/Work/infra/akrogon/issues/chart/watch-one-read/INTAKE.md
- Signposts, binding direction: /home/ivan/Work/infra/akrogon/issues/chart/watch-one-read/forks/signposts.md (section Taken)
- Live surfaces: /home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md (sections Invocations, Observe, Judge), skills/watch-issues/scripts/observe.ts, repo.ts, start.ts, tick.ts, src/pause.ts, src/next.ts (isPaused uses), src/status.ts (paused output), tests/hc-observe.test.ts, tests/watch-timer.test.ts, tests/e2e/watch-live.e2e.ts, tests/e2e/watch-tier.ts, tests/e2e/watch-consults-body.ts, tests/AREA.md.
- Locks: none beyond the signposts.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source stays allowed when the source is the subject of the work (here: the watch-issues skill and its scripts). Name sections, never line ranges, when citing process text.

Do not edit any file outside your return path. Do not run paid or live model sessions. Free local commands (grep, bun test on a single file) are fine.

## Report step

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/watch-one-read/slots/map-C.md, then run:
hc send t126 "done C: /home/ivan/Work/infra/akrogon/issues/chart/watch-one-read/slots/map-C.md"
