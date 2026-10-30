# Opening map brief, slot B (2026-10-29): peer-session and pull-gh-path

You are slot B, a consultant to the chart door (slot A) in repo /home/ivan/Work/infra/akrogon. Your context was restarted. Map independently; A's map is withheld until you finish.

Reading rule: read process text by named section for the step you answer; locate a section before reading it, batch independent reads in one call with output bounded to those sections, read content you already hold at most once per session. A section not read yet, content changed since you read it and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. Choose your own evidence otherwise.

## Intake (read in full)

- /home/ivan/Work/infra/akrogon/issues/chart/peer-session/INTAKE.md and its CHART.md; its earlier map (2026-10-24, A, B, C) in /home/ivan/Work/infra/akrogon/issues/chart/peer-session/slots/map-merged.md
- /home/ivan/Work/infra/akrogon/issues/chart/pull-gh-path/INTAKE.md and its CHART.md
- Origin of both: /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/CHART.md and INTAKE.md `## Source: Tamdoma/akrogon#117` (delivered; leaves in issues/closed/herdr-session)

Operator words 2026-10-29: "chart them out with the consultant slot b on autopilot. Systems thinking, less code is always better, function over form, simplicity, clarity and elegance."

## Live surface

- skills/chart-issues/scripts/*.ts (peer-ask, peer-wait, peer-restart, peer-create, door-reset) and the installed copy under /home/ivan/.akrogon/current/skills/chart-issues/scripts
- src/shell.ts (herdrArgv, herdr, sessionPanes, repoSession), src/scope.ts (paneShell, shellPid), src/pull.ts, src/akrogon.ts top-level error flow
- The live environment as it is now: the herdr sessions running (`herdr session list`), this machine's PATH and how each tool akrogon spawns resolves (gh especially), the herdr server processes' environment, plugin/pull.sh
- The door's earlier 2026-10-24 findings are in each INTAKE.md `## Agent findings`; check whether they still hold today.

## Existing locks

- herdr-session forks (issues/chart/herdr-session/forks/*.md, Taken): lifecycle callers discover the repo's session by workspace label and never trust the ambient socket; that chart split the peer scripts out as peer-session.
- Lock 2026-09-18 (issues/chart/seat-stall-detection/forks/no-akrogon-detector.md, Taken): no hidden watchdogs, clocks or polling.

## Task

Write a proportional territory map: for each chart, whether the problem still exists today (with the evidence), the material forks with options, what each option could break or invite later, pitfalls with what removes each, the smallest change that removes the problem class (including "no code" when the problem is already gone or lives outside akrogon), and any external operation a leaf would need proven. Ground each claim in an inspected path or named outside source with tier. Include questions you would ask that the intakes do not.

Return: write your map to /home/ivan/Work/infra/akrogon/issues/chart/peer-session/slots/map-2026-10-29-B.md and end your turn. Do not edit any repo file.
