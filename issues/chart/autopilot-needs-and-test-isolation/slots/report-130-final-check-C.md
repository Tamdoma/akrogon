# Final-shape check: report-130, slot C

The shape holds; each correction is folded in correctly:

- Criterion 1: now states fixture behavior with the proof synchronizing on teardown-while-seat-live, not a launch offset. That is exactly the demonstrated red (conc-*.log 7 s/10 s fails vs 3 s pass). Holds.
- Consumer list: names config `repos`, `setPrefixes`, the hcCore discovery document, seat names/labels and their expectations, `leafSlice` call sites, `startSeat`'s slice arg through the product unchanged. Holds — this matches where the name actually flows (helpers.ts `fixture`, hc-fixture `recordedDoc`, seat.ts `seatName`/`--slice`, scope.ts `leafSlice`, hc-identity's `rp-hi-find-a` assertion).
- Per-fixture uniqueness derived from the fixture home: removes the collision across verifies and suite files; per-suite or per-slug wouldn't. Holds.
- Criterion 2: scoped to the leaf's changed tests with hc-listener handled via `--known-red`, not this leaf. Holds — it can't be blocked by unrelated flakes.

One residual guess, small: "no literal `repo` or `rp-` where a test reaches host-global state or asserts a derived name" covers the asserted names, but a test also *supplies* the name in places that assert nothing — `setSeat`/`setPrefixes` maps and leaf `repo` fields in `state.yaml` fixtures (e.g. `leaf(f, slug, phase)` writes and `expect(readState(path).repo)` if any assert `repo` literally). An implementer should sweep for the literal `'repo'` and `'rp'` across tests/, not only the named consumers — the phrasing almost says this ("carried consistently to every consumer") but a literal `repo` in a supplier-side map is easy to miss because nothing visibly breaks when it's wrong: it just hashes to a slice nothing else shares, which is still safe. So this is completeness-only, not a correctness risk; flag so the sweep is deliberate.

No correctness gap remains. The done-criteria are behavioral, no wall-seconds, and no product file is touched — consistent with signpost 2a.
