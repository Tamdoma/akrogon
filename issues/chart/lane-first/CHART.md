# Chart: lane-first

## Destination

The land run and its verify pass get a higher CPU share than leaf work inside akrogon.slice, slice memory limits are host-relative, and a repo's merge waiters hold back its new starts.

Route: direct (operator words, see lean-akrogon Autopilot breach line)

## Forks taken

- [Signposts](forks/signposts.md): taken (operator), copy
- [Test limit](forks/test-limit.md): taken (A)
- [Design](forks/design.md): taken (A), from B and C designs

## Open forks

- none

## Fog

none

## Off route

See issues/chart/lean-akrogon/slots/map-merged.md "Held" and "Dropped".

## Pending steps

- before landing, no suite running: stop empty akrogon-l*.slice units matching no leaf of this home (design 5) Done 2026-11-23 (488 stopped earlier, 0 at landing).
- seeds N1, N4 filed 2026-11-23: Tamdoma/tamdoma-framework#849 (N1, nested suite times out at 300 s under merge load), #850 (N4, 15 s spawn timeout under load). Done.

## Mode record

- mode 2026-11-22T18:15:17Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/5d8542a8-366c-477b-b80b-1a7c0cdf14df.jsonl: on full autopilot, split from lean-akrogon; reviewer D at execution

## Autopilot

- switch-on: issues/chart/lean-akrogon/INTAKE.md operator source
- consultant: B t350, C t351
- signposts: A, original in issues/chart/lean-akrogon
- route: direct

## Direct attempt: run line display

Landed 9656cd1f 2026-11-22, see direct/report-runline.md.

## Direct attempt: one-test-cap

Landed f2318498 2026-11-22, see direct/report-caps.md.

## Direct attempt: flaky-two

Landed fa3663e6 2026-11-23: seven flaky-test causes (shared leaf temp, cores left across files, door-reset deadline and start-prompt race, hc heartbeat, listener refusing-socket follow, hc-start slice gap). D rounds 1-2 fix, round 3 ready; verify green 1351/1351.

## Direct attempt: agy-reset

Landed 16c85dae 2026-11-23: the door-reset stand-in opens its transcript before reporting working (top flake, 16 recorded fails). D round 1 ready.

## Direct attempt: flaky-three

Landed f323d9fcc63ab43e802c96c82a23ff13876d1e4a 2026-11-23: door wait tests read each wait end from its code file; watch-timer stops its second core (one leaked herdr-core per run). D round 1 fix (shared reader), fixed as proposed. R1 (next.test new tab scratch: an outside slice stop) still open, stopper not found.

## Direct attempts

- 2026-11-23 landed 079d4447 (D rounds 1-15, ready at round 15, cgroup-truth redesign from round 10); deployed; `akrogon install` linked akrogon-land.slice.
