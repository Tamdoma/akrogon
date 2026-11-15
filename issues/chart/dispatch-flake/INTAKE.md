# Intake: dispatch-flake

## Scope

Find why the dependent-dispatch test flips (2 flips, latest 2026-11-09; the same tree ran red in 64.43 s and green in 65.09 s; the red log shows attempts.A 0 where 1 was expected), then fix the cause, which may be a product race and not the test.

## Provenance

- Operator: door t11v, 2026-11-09T19:45Z, chart-issues invocation note (survey chart `issues/chart/factory-wins`)
- Operator: door t126, 2026-11-10, split round reply "1a | 2a | … | 4a" recorded in `issues/chart/factory-wins/forks/split.md`

## Source: operator 2026-11-09T19:45Z

I need you to go through the akrogon software factory, and find me some big and small wins. Think about the problem as a systems thinker (feedback loops, reinforcing, balancing, stock and flow analysis). Is there something we can change or fix to make the factory more elegant, faster, more efficient (tokens, speed) without removing the core functionality or by making the functionality even better? I'm open for anything, as long as it's backed by research and your knowledege.

## Agent findings

- Map item W3 in `issues/chart/factory-wins/slots/map-merged.md` (slot B's M7 in `issues/chart/factory-wins/slots/map-B.md`). Root cause not established.
- Shared opening map and both slots' blind maps: `issues/chart/factory-wins/slots/`.
