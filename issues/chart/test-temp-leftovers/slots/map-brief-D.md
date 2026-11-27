# Map brief, slot D: test-temp-leftovers

You are slot D, a consultant to the chart door (slot A, hc terminal t126). This is a blind exchange: write your own territory map. Do not read any other slot's map file under /home/ivan/Work/infra/akrogon/issues/chart/test-temp-leftovers/slots/ (map-A.md, map-B.md, map-C.md, map-D.md) until this exchange ends.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. You still choose your own evidence and may locate other needed sections under the same rule.

## What this chart is

akrogon's own test suite (`bun test` in /home/ivan/Work/infra/akrogon, the repo's `test` check in issues/config.yaml) leaves host temp behind on every run: `/var/tmp/akr-1000/<hash4>/<hash8>` dirs and empty `~/.akrogon/worktrees/akrogon-XXXXXX` dirs. In two days about 2,900 host dirs and 35 empty worktree-store dirs piled up; the door cleaned them this morning and 59 second-level dirs under /var/tmp/akr-1000 were back by 12:01Z. Outcome: a test run leaves no host dir under the leaf temp root and no dir under the real worktree store behind.

## Inputs

- Intake (source verbatim, findings): /home/ivan/Work/infra/akrogon/issues/chart/test-temp-leftovers/INTAKE.md
- Locks, never re-argued: session signposts (A's picks), /home/ivan/Work/infra/akrogon/issues/chart/test-temp-leftovers/forks/signposts.md, section `## Taken` (fix the mechanism that fails, free tests at the real boundary, extend existing records, one leaf unless a part is useful alone, old records keep parsing).
- Earlier charts on temp by this door, all closed or handed off; read their Destination and Off route sections and the closed leaves they name to find which mechanism each left uncovered: /home/ivan/Work/infra/akrogon/issues/chart/{test-hygiene,run-scratch,test-time-and-temp,temp-release,leaf-temp,framework-temp-owners}/CHART.md, /home/ivan/Work/infra/akrogon/issues/closed/temp-release.
- Lessons touching this area: /home/ivan/Work/infra/akrogon/learnings/LESSONS.md lines on run-check TMPDIR.
- Live surfaces: /home/ivan/Work/infra/akrogon/src/config.ts (leafTempRoot, leafTemp, ensureLeafTemp, worktreeStore, globalHome, AKROGON_LEAF_TEMP_ROOT, AKROGON_HOME), /home/ivan/Work/infra/akrogon/src/reconcile.ts (host sweep over leafTempRoot, retired temp root), /home/ivan/Work/infra/akrogon/src/seat.ts (TMPDIR=leafTemp), /home/ivan/Work/infra/akrogon/src/run-check.ts (run root, TMPDIR), /home/ivan/Work/infra/akrogon/src/self-update.ts, /home/ivan/Work/infra/akrogon/tests/ (fixture homes, helpers that set AKROGON_HOME or AKROGON_LEAF_TEMP_ROOT, bunfig/preload if any), and the `test` check command in /home/ivan/Work/infra/akrogon/issues/config.yaml.

## Task

Write a proportional territory map:

1. Find the actual sources: which tests or code paths create `/var/tmp/akr-<uid>/...` and which create `~/.akrogon/worktrees/akrogon-XXXXXX` during `bun test`, by file and function, and why the existing fixture isolation does not catch them. A free observation is best (for example run one suspect test file with a scratch HOME or watch the dirs before and after).
2. The material forks, each with options and what each option could break or invite later (not only now). At least: where isolation belongs (one test preload that points AKROGON_HOME, AKROGON_LEAF_TEMP_ROOT and HOME at a per-run scratch removed at exit; per-test fixes; or making the product refuse an unset root under test), how a leftover is detected so the class cannot return (a guard that fails the run, or nothing), and whether the product's own host sweep should play any part.
3. Practitioner questions and pitfalls over the work's lifetime, grounded in inspected files (path and function) or primary docs (Bun test preload/bunfig docs, URL and date read). Mark model knowledge as such with the searches that found nothing stronger.
4. Your recommended direction and its cost, how a free test at the real boundary proves it, and what you would ask that the intake does not settle.

Free observations are welcome: throwaway dirs you create yourself, cleaned up after. Do not run the whole suite in the main checkout more than once. Never signal, move or stop a process or terminal you did not create, never delete a dir you did not create, and change no file outside your return path. Record each observation with command, version, date, result, cleanup and limits.

## Return

Write your map to /home/ivan/Work/infra/akrogon/issues/chart/test-temp-leftovers/slots/map-D.md, then run:

```bash
hc send t126 "done D: /home/ivan/Work/infra/akrogon/issues/chart/test-temp-leftovers/slots/map-D.md"
```
