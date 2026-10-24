# Chart: host-run-load

## Destination

A repo's full suite result does not depend on which other repos' suites run on the host at the same time, while targeted and cheap checks still start without long waits.

Route: direct (operator "do it yourself here", 2026-10-24)

## Forks taken

none

## Open forks

pending map

## Fog

pending map

## Off route

none

## Pending steps

- Unpause akrogon and lingua-relay (`~/.akrogon/paused.yaml`) after the fix lands. Owner: door (A) under autopilot, or operator. Status: done 2026-10-24 (paused.yaml {}).

## Mode record

- mode 2026-10-24T15:20:34Z w8:pNP bacd17ee-47fd-4d72-9f7c-ee61ee8698cf: on handed [host-run-load]; route direct by operator words "do it yourself here"; consultants B w8:pV5, C w8:pV6

## Autopilot

- switch-on: INTAKE.md "Source: operator 2026-10-24"
- consultant: B w8:pV5 codex, C w8:pV6 pi

## Landed

- f474544bc334f4510d03d1057a3c0b7900e1b161 on main (push attempt 1/2). B review-B-3 ready. Green merge receipt 5e086cce.
- Deployed f474544b (deploy.yaml ok, previous 0ed00de6).
- `full:` added to issues/config.yaml (working copy, uncommitted) in akrogon [test], framework [verify], lingua-relay [test], lens [test], Himne [test], blepsis [test].
- Tamdoma/akrogon#118 closed, delivered by host-run-load f474544b.

Closed 2026-10-24
