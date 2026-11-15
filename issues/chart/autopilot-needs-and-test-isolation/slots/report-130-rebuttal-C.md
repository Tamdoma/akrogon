# Rebuttal: report-130, slot C

I agree with the merged notes — A adopted the collision finding and the conc-*.log staggers (7 s/10 s → deterministic line-145 fails; 3 s → both pass) confirm the mechanism. Disagreements and gaps, all in A's proposed final shape:

## Disagreements

1. **Done-criterion (1) is probabilistic as written.** "The second started while the first is mid-run" is satisfied by a 3 s offset, which A's own runs show passes pre-fix (teardowns coincide). Red-before needs the first run's teardown to land inside the second's run — the 7–10 s stagger that failed twice. The criterion must name that condition ("second's mid-run overlaps the first's teardown") or a scripted stagger in that window, or an implementer can meet it with an offset that never collided.
   Evidence: better-than-training, slots/evidence/conc-*.log + tests/hc-delivery.test.ts teardown, 2026-11-09.

2. **Done-criterion (2) can be blocked by unrelated reds.** The shape's "configured `test` check passes the leaf's own changed tests" is ambiguous: the full run A recorded already has 2 hc-listener fails (`hc-listener.test.ts:73`, two cases). If `test` must be green for verify, this leaf can be red on flakes it didn't touch — same class of blocker as #130. The criterion should scope to the tests the leaf changes, or name hc-listener known-red handling.
   Evidence: measured, slots/evidence/full-test-2026-11-09.log, 2026-11-09.

## What an implementer would have to guess

3. **Where the unique name flows.** "Every test fixture registers a repo name unique to that fixture" leaves the seam unstated. The name feeds `repos` config (helpers.ts:76), `setPrefixes` callers (`{repo: 'rp'}` → prefix `rp`), `leafSlice` inputs in 8 files, terminal-name assertions (`hc-identity` expects `rp-hi-find-a` literally), and `startSeat`'s `--slice=` arg plus the `/proc/<pid>/cgroup` check. Literal `rp-` assertions break under a per-run name unless they compute it. The shape should say: uniqueness source is the fixture (mkdtemp home is already unique), every name-reading site derives it from the fixture, no literal stays.
   Evidence: better-than-training, tests/helpers.ts `fixture`/`setPrefixes`, tests/hc-identity.test.ts `rp-hi-find-a`, src/seat.ts `startSeat` `--slice`, 2026-11-09.

4. **Same-name feeds other host-global resources.** The merged notes carry this as "Open for the plan" — it should be decided in the round, not deferred: `runSlice`/`runUnitBase` (run-check units), `leafTemp`, notice ids. If any derive from `repo.name` into host-global state, they're in the same boundary; if not, say so. An implementer guessing here widens or narrows the leaf silently.
   Evidence: better-than-training, src/scope.ts `runSlice`/`runUnitBase`, src/seat.ts `leafTemp`, 2026-11-09.

5. Minor: the merged "the 30 s timeout channel itself is delivered by 97034315" is right but incomplete — the original leaf verifies failed under *concurrent verifies*, which is the collision channel, not pure load. Wording should say both channels existed; the leak channel is delivered, the collision channel is the leaf.
