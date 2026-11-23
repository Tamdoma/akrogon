# Chart: land-own-reds

## Destination

A home stops or deletes only the leaf slices, run units, temp folders and store dirs it owns, and a red land reruns its failing units once with the repo's own rerun command before exiting, each save recorded and visible in akrogon flaky.

Route: direct (operator words, see lean-akrogon Autopilot breach line)

## Forks taken

- [Seed decision #149](forks/seed-149-decision.md): taken at import
- [Design](forks/design.md): taken (A), final shape checked by B and C; Q4 (temp and store sweep) added from INTAKE F-temp, B pick after B and C checks
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

## Direct attempts: land-own-reds and run-scratch

Landed 2026-11-23: release 1 8eef2d0b+4da466f5 (own-home slices, rerun key), release 2 abd525c1+dc426cd7 (rerun of named failures, own temp/store names), run-scratch c4cf74a7 (remove every run root, AKROGON_EVIDENCE, run_root key). 46 kept roots (15 GB) removed by hand first. #151 closed. #148 stays open: the run_root reader is not shipped.
