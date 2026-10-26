# Final shape check: suite-shape (slot B)

You are slot B. Same reading rule as /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/suite-shape-brief-B.md.

The operator answered. Read /home/ivan/Work/infra/akrogon/issues/chart/suite-time/forks/suite-shape.md section Taken. Then check this proposed leaf shape once, as an implementer. Return only disagreements with evidence, or "none".

## Proposed shape

- One leaf, one outcome: the full `test` check is at least 20% faster in wall time.
- issues/config.yaml `checks.test` becomes `bun test --timeout=30000 --parallel=4 --no-isolate`. tests/AREA.md line about the 30 s timeout stays true.
- tests/next.test.ts "named target equivalence" becomes nine tests (3 owners x 3 working directories), same fixtures, comparisons and cleanup.
- tests/peer-wait.test.ts: every test-supplied '11' budget shortens, the carried-exchange double wait included, each new budget above measured subprocess startup, every outcome, exchange and signal assertion kept.
- Done: (1) paired quiet-host runs of the exact check command, serial before and new after, at least 20% faster, same test and expect counts, load and user+sys CPU recorded per run; (2) three suites of the new command at once, all green, no new failures. If (2) fails at 4 workers, retry at 2 workers and re-prove (1) and (2).
- Proposed fallback end: if (2) also fails at 2 workers, the leaf does not invent a discovery-deadline seam. It stops as failed with every run recorded, and the chart reopens O1c (the 10 s discovery-deadline tests) as a new fork.
- Off this leaf: O1c, the prebuilt fake herdr, akrogon's own git calls (chart issues/chart/git-calls), plain hand `bun test` (stays serial).

Write to /home/ivan/Work/infra/akrogon/issues/chart/suite-time/slots/suite-shape-final-check-B.md. No whole-suite runs. Short.
