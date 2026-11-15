# Report #130: hd-send timing under load

## Question

Q1. Is Tamdoma/akrogon#130 delivered on main (by 97034315 or another change), so it closes naming that change, or does a cause remain that a test leaf must remove?

Q2. If a leaf remains: what does it change (split scenarios, a controlled negative reply where a real-core proof exists elsewhere, trimming fixed per-pass cost with every assertion kept), is sibling `hd-silent` in scope, and what done-criterion proves the result does not depend on machine load without a guessed wall-second cap?

### Carries

Signposts 2a (no timeout raise, no product wait change for a test), 3a (reported test plus the boundary it directly implies), 4a (already fixed: prove, record, close), 6a (local load demonstration allowed, no paid calls). Map: slots/map-merged.md `## #130`. Related: forks/report-131.md (closed). Lesson: learnings/history/2026-11-08-hc-shutdown-unit-leak.md.

## Findings

Merged notes: slots/report-130-merged.md; rebuttals slots/report-130-rebuttal-B.md, slots/report-130-rebuttal-C.md; blind notes slots/report-130-{A,B,C}.md.

- Two channels existed (C rebuttal 5). The leak channel (hc-shutdown units slowing every systemctl pass, lesson 2026-11-08-hc-shutdown-unit-leak) is delivered by 97034315: A's runs 2026-11-09 show 14.9-16.4 s idle and 15.4 s under 32 CPU burners on 32 cores (load 19-30), the full check (--parallel=4, 55 s) passing the test, host unit count 1109 before and after (A,B,C).
- The collision channel remains (C; A,B after evidence): every fixture registers its repo as `repo` (tests/helpers.ts `fixture`), `leafSlice` hashes `repo.name/slug` (src/scope.ts), and test teardowns stop `leafSlice({ name: 'repo' }, slug)` in the real user manager. Observation, A, 2026-11-09, main 49d2c916 (slots/evidence/conc-*.log): two runs of "a working seat", second started 3 s later, pass twice (teardowns coincide); started 7 s and 10 s later, the second fails both times at hc-delivery.test.ts:145 (`cli` exit 3) in 11.4 s and 8.8 s. Limits: a launch delay, not a synchronized overlap; shows the mechanism, not its frequency in real verifies.
- `leafSlice` is the only host-global name built from `repo.name` (A, grep 2026-11-09): notice ids live in per-session folders, `runSlice`/`runUnitBase` use run ids.
- Per-fixture over per-suite uniqueness: a unique suite id (tests/isolation.ts `suiteRoot`) would also separate two verifies (B R3); per-fixture also separates fixtures inside one suite, so it is the stronger boundary.
- B's controlled-reply rejection was "unnecessary without a demonstrated native cause", not "inherently circular" (B R4).
- Recorded only: the full check's 2 hc-listener failures (B; outside the handed list).

## Taken

A's pick under full autopilot, 2026-11-09: #130 stays open; one tests-only leaf removes the collision channel. Reason: demonstrated cause (conc-*.log), signpost 2a (remove the cause), 3a (the boundary the report implies: the run's host-global state). Rejected: close naming 97034315 (leaves the collision live; B's first pick, withdrawn in B's rebuttal); scenario split and controlled reply (no demonstrated cause they remove); timeout raise or product wait change (2a). `hd-silent` and other files change only through the shared boundary. No standing dissent.

Final shape (focused check: B agree, C agree with one completeness note, slots/report-130-final-check-{B,C}.md):
- Outcome: each test fixture gets a repo identity unique to that fixture, derived from the fixture (its unique home), carried consistently to every consumer: the global config `repos` key, `setPrefixes` maps, `hcCore`'s discovery document repo, seat names and labels and their expectations, `leafSlice` inputs in every test teardown and slice lookup, and `startSeat`'s slice argument through the product as it is. No literal `repo` or `rp-` identity remains where a test reaches host-global state or asserts a derived name. No product file changes.
- Done-criterion 1: when one fixture's teardown stops its slices while another fixture with the same leaf slug still has a live seat, that other seat survives and completes its delivery sequence (red before: the line-145 failure; the proof synchronizes on the first fixture's teardown landing while the second's seat is live, not a launch delay).
- Done-criterion 2: the leaf's changed tests pass in the configured `test` command; known reds outside the leaf (the hc-listener pair) are judged by the existing `--known-red` path, not by this leaf.
- The plan sweeps tests/ for the literal `'repo'` and `'rp'` identity on the supplying side too (config maps, `setSeat`/`setPrefixes`, leaf state fixtures), not only the named consumers (C final check).
- sources: [Tamdoma/akrogon#130].
