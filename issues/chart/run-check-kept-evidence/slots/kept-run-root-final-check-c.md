none

Checked all four [changed] items against consumers:
- Leaving `.owner` on `.akrogon-kept` roots while checking `.akrogon-kept` before `.owner` in `reconcile` and `ownerKeeps` (`src/reconcile.ts`) avoids pid-reuse vetoes, avoids the 60s ownerless-run gap, degrades cleanly to dead-owner cleanup on older akrogon binaries, and breaks no `.owner` scan in `src/` or `tests/` (`tests/durable-capture.test.ts` and `tests/abandoned-capture.test.ts` run in fresh fixtures).
- Adding the `src/AREA.md` run-check line and keeping both `learnings/LESSONS.md` lines match items 1–4 and break no test or consumer.
