# Opening map, slot A (written before reading map-B and map-C)

Evidence: slots/census-A.md (better-than-training, measured 2026-10-26).

## M1 Which cost to cut

Per akrogon run in tests: about 300 ms wall, of which fake herdr calls about 160 ms, git about 32 ms, the rest bun start, module load and akrogon logic. Full suite: 17.7k herdr calls (about 13 ms CPU each, about 230 CPU-s, about 19% of 1,187 CPU-s), 42k git calls (about 1 ms each, about 4%), 2k+ akrogon CLI starts, 938 fake busctl runs from source (about 27 ms CPU each, about 2%).

- Pick: cut herdr calls per akrogon run first, then memoize run-fixed git facts. Reason: herdr calls are the largest share in tests and about 30 spawns per `next` in production; both changes help the real tool too.
- Rejected: cheaper fake herdr only (compiled binary or a server). Helps tests only, adds a second fake shape, and leaves product call counts as they are. Kept as a fallback if product cuts fall short.
- Rejected: replace bun for the CLI. Largest unknown and a stack change for about 20 ms per start.

## M2 What may be reused within one run

- herdr: one pass reads `pane list`, `workspace list`, `tab list`, `pane get`, `pane process-info` many times. A per-pass snapshot must be refreshed after akrogon's own mutations (tab create, pane split, agent start, prompt) and must never span a wait.
- git: `rev-parse --git-common-dir`, `remote get-url`, `rev-parse --git-path <name>`, `symbolic-ref` of the registered checkout are fixed for a process; `rev-parse HEAD`, merge-base and fetch results move during a run (C P2) and stay uncached.
- Pitfall: a stale snapshot dispatches to a pane that closed. Removed by scoping reuse to one read phase and by the existing next.test.ts scenarios, which already exercise pane death, tab loss and re-entry.

## M3 Tests that read call logs

tests/fake-herdr.ts writes `.calls`; door-reset, peer-ask, pause-next, leaf-slices, batch-dispatch, install, close read call logs. Fewer calls may change recorded sequences. Pitfall: changing expectations to fit. Removed by the Test-Change rule: an expectation changes only where the brief names the reduced call as the outcome.

## M4 Proof ("proper testing")

- Census before and after on the same host: herdr and git calls per `next`, full suite user plus sys CPU.
- Full suite green; two suites at once in at least 8 pairs with zero fails on a quiet host, plus three at once recorded.
- The re-entering test keeps its sequence (F29).

## Split

One issue, leaves in parallel: L-herdr (per-pass herdr snapshot), L-git (process memo of run-fixed git facts), L-fakes (fake busctl bundled like fake herdr). Measurement leaf not needed; the census method is in census-A.md.
