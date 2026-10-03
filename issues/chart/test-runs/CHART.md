# Chart: akrogon

## Destination
A leaf is stopped as "red on base" only from a completed, comparable base run.

## Forks taken
- [Timeout cause](forks/timeout-cause.md): #53 was the capture race fixed by framework 2cb00d537, not load.
- [Heavy run slot](forks/heavy-run-slot.md): ruled out, not built.
- [Base red rule](forks/base-red-rule.md): stop only on completed comparable runs with a recorded shared cause; killed run = incomplete stop; longest harness run mode; keep the command's own exit status.

## Open forks

## Fog
None.

## Off route
- Heavy-run slot, `akrogon heavy`, slot count and leftover-process cleanup: ruled out 2026-10-02 (timeout-cause Q2 2a). #53 was a capture bug, not load. Reopen only on a traced load failure.
- Affected-test selection and the full suite before release: chart framework-test-scope (destination framework).
- Recording failure reasons in log.jsonl: owned by chart leaf-readiness.
- Browser capture fixes: framework chart capture-hang (2cb00d537, leaf capture-asset-bytes). Timeout increases and Bun test concurrency: not in scope.

Handed off 2026-10-03
