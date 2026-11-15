# Chart: autopilot-needs-and-test-isolation

## Destination

Two independent outcomes in akrogon: (1) chart-issues asks every need and approval up front, by the signposts round, and a later find reaches the operator visibly (#129); (2) concurrent test runs on one host never stop each other's slices (#130). #131 closed as delivered by 47186f90.

Map: slots/map-merged.md.

Route: lifecycle

## Forks taken

- [Signposts](forks/signposts.md): A's picks 1a 2a 3a 4a 5a 6a
- [Report #131](forks/report-131.md): delivered by 47186f90, closed, no leaf
- [Report #130](forks/report-130.md): leak channel delivered by 97034315; one tests-only leaf gives each fixture a unique repo identity so teardowns never stop another run's slice
- [Needs before charting](forks/needs-before-charting.md): one session needs sheet by the signposts round, operator-answered in every mode; a late find parks with one notice; one skill-text leaf changes every restatement

## Open forks


## Fog

## Off route

- A suite-wide audit of env-less spawns (tests/door-agent.ts, door-exchange.test.ts, hc-observe.test.ts): signpost 3a, recorded only.
- Shortening hd-send's ~15 s fixed waiting: hc client behavior, no observed failure (signpost 2a).

## Pending steps

none

## Mode record

- mode 2026-11-09T09:05:16Z t15 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/70154c62-73f9-47a5-8e8e-e3f78f692cf8.jsonl: on full autopilot (signposts: A); handed Tamdoma/akrogon#129, #130, #131 consolidated in this chart; consultants B codex, C pi (door-created); route lifecycle

- mode 2026-11-09T09:36:31Z t15 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/70154c62-73f9-47a5-8e8e-e3f78f692cf8.jsonl: off (every handed chart handed off)

## Autopilot

- switch-on: INTAKE.md `## Source: operator door t15 2026-11-09`
- signposts: A — this chart holds the original
- route: lifecycle
- consultant: B codex gpt-6.1-sol high (t10p), C pi devin/swe-2-max-lightning high (t10q), door-created; no loss
- handed off: issues/open/early-needs/needs-sheet-at-signposts (Tamdoma/akrogon#129); issues/open/host-safe-tests/fixture-repo-identity (Tamdoma/akrogon#130)
- usage: A 66999, B 26372, C unmeasured output tokens; 27.8 min (USAGE.md)
- main step: closed Tamdoma/akrogon#131 by 47186f90 (akrogon close, 2026-11-09)
- recorded only: full `test` check 2026-11-09 red on 2 hc-listener tests (slots/evidence/full-test-2026-11-09.log)
- friction: the #130 rebuttal brief also carried the final-shape check of A's proposed shape; a separate focused check followed after the pick
- recorded only: 21 `akrogon flaky` tests (2026-10-17..24) outside the handed list; Unpacked notices for issues/chart/herdr-panels and issues/chart/tasks-panel

Handed off 2026-11-09
