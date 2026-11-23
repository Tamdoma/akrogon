# Chart: k1-compile-cache

## Destination

Land, check and verify runs never write a Node compile cache: NODE_DISABLE_COMPILE_CACHE=1 is set once in run-check's always-set child env and the land unit env, and the copy-if-set and verify forward are gone.

Route: direct (operator words, see lean-akrogon Autopilot breach line)

## Forks taken

- [Seed decision #148](forks/seed-148-decision.md): taken at import
- [Signposts](forks/signposts.md): taken (A), copy

## Open forks

- none

## Fog

none

## Off route

See issues/chart/lean-akrogon/slots/map-merged.md "Held" and "Dropped".

## Pending steps

none

## Mode record

- mode 2026-11-22T18:15:17Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/5d8542a8-366c-477b-b80b-1a7c0cdf14df.jsonl: on full autopilot, split from lean-akrogon; reviewer D at execution

## Autopilot

- switch-on: issues/chart/lean-akrogon/INTAKE.md operator source
- consultant: B t350, C t351
- signposts: A, original in issues/chart/lean-akrogon
- route: direct

## Direct attempt

- branch: k1-compile-cache
- worktree: /home/ivan/.akrogon/worktrees/akrogon/k1-compile-cache
- base: f08d7e9c
- head: 0383d6008b79a38dfebed59d671ab09dbd22b205
- rounds used: 3 D rounds
- push attempts: 1 / 2
- done: destination met (direct/report.md); D ready (slots/review-D-3.md); akrogon verify merge green on 0383d600; direct guards passed; pushed to origin/main
- not done: none; #148 stays open for run-scratch
- trigger: none
- review files: slots/review-D-1.md (fix), slots/review-D-2.md (fix), slots/review-D-3.md (ready)
- landed SHA: 0383d6008b79a38dfebed59d671ab09dbd22b205

Closed 2026-11-22
