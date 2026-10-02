# Chart: akrogon

## Destination
akrogon leaves spend minutes less per pass on tests: the suite runs in about 10 s instead of 80 s, through `bunfig.toml` so every seat and worker gets it, without new random failures.

## Forks taken
- [Suite speed](forks/suite-speed.md): 1a 2a 3b, all tests run side by side through `bunfig.toml` with a 30 s per-test timeout in a preload file, two shell tests serial; measured 9.3-9.6 s
- [Implement mode](forks/implement-mode.md): 1a, keep subagents and the one-unit worker rule; look again after the fast suite lands

## Open forks

## Fog

## Off route
- [Check lifetime](forks/check-lifetime.md): the 120 s tool limit no longer bites with a 9-27 s suite (operator 2a).
- [Changed-tests duplicate](forks/changed-tests-duplicate.md): the duplicate run now costs about 10 s (operator 2a).
- Check-record reuse across seats (hydrozoa-style tree markers): off route under `issues/chart/check-reruns/`.
- Fewer required proofs or checks: the check-reruns lock stands.
- Who repairs review findings: `issues/chart/reviewer-repair/`.
- Model and effort choice for slots.

Handed off 2026-10-02
