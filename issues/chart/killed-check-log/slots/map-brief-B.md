# Opening map brief, slot B

You are slot B, an independent consultant to the chart door (slot A) for the akrogon repo at /home/ivan/Work/infra/akrogon. You map independently. Do not read anything under /home/ivan/Work/infra/akrogon/issues/chart/killed-check-log/ except this brief and INTAKE.md `## Source: Tamdoma/akrogon#120`. Do not edit any file except your return file.

## Reading rule

Read process text by named section for the step you answer: locate the section first, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges, when citing process text. Code you cite gets file and function names.

## Intake

/home/ivan/Work/infra/akrogon/issues/chart/killed-check-log/INTAKE.md, section `## Source: Tamdoma/akrogon#120` only (the report itself).

## Live surfaces

- /home/ivan/Work/infra/akrogon/src/run-check.ts (`checkedRun`, `spawnLogged`, `runCheck`, `ownerRefusal`)
- /home/ivan/Work/infra/akrogon/src/shell.ts (`spawnFiles`, `spawnCaptured`)
- /home/ivan/Work/infra/akrogon/src/scope.ts (`startRunGuard`, `runUnitArgv`)
- /home/ivan/Work/infra/akrogon/src/reconcile.ts (run-root sweep, `.owner` handling)
- /home/ivan/Work/infra/akrogon/src/next.ts (`observeBusy`, `STALL_MS`)
- /home/ivan/Work/infra/akrogon/plugin/herdr-plugin.toml, plugin/next.sh
- /home/ivan/Work/infra/akrogon/skills/implement-issue/SKILL.md (step that tells seat A how to run slow commands)
- Other callers of `checkedRun` (find them yourself), and `akrogon pack` / log readers that consume kept check logs.
- pi 1.4.0 at /home/ivan/.local/share/mise/installs/pi/1.4.0/pi (how a timed-out bash tool call is killed)

## Existing locks

- Operator, 2026-09-18 (/home/ivan/Work/infra/akrogon/issues/chart/seat-stall-detection/forks/no-akrogon-detector.md and stall-detection.md, `## Taken`): no clocks, polls or watchdogs anywhere; a stall produced by pure silence stays invisible by accepted consequence; forecloses a systemd timer, a long-lived `akrogon watch` and any elapsed-time stall trigger.
- Operator correction, 2026-09-18 (/home/ivan/Work/infra/akrogon/issues/chart/stall-notifier-removal/forks/delete-notifier.md, `## Taken (correction, 2026-09-18)`): keep `observeBusy`, `STALL_MS`, `busy_since`, `busy_notified` unchanged.
- Operator values for picks: simplicity, function over form, removing over adding, systems thinking, speed and price.

## Task

Write a proportional territory map for this report:
1. The observable outcomes in scope and whether they are one leaf or several independent leaves (only a real dependency orders them).
2. The material forks, each with options, your pick, and what each option could break or invite later, not only now.
3. Questions an experienced practitioner would ask.
4. Pitfalls over the work's lifetime and what removes each.
5. Whether any part of the report is foreclosed by the locks, and any zero-clock mechanism you find that would not violate them.
6. Evidence lines with tier (operator, practitioner, better-than-training, model-knowledge), source path or URL and date.

Return file (write exactly here): /home/ivan/Work/infra/akrogon/issues/chart/killed-check-log/slots/map-B.md
