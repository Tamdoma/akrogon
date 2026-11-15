# Design: fixture-repo-identity

## Binding decisions, verbatim

### Signposts (issues/chart/autopilot-needs-and-test-isolation/forks/signposts.md), A's picks under full autopilot, 2026-11-09

- 2a: Remove the cause in the test or its fixture. No raised per-test timeout (233d01ca added 90 s, 75f61f00 reverted it), no product delivery wait changed to satisfy a test. Foreclosed: a raised timeout or a narrow product change.
- 3a: The two reported tests plus the shared boundary they directly imply; other host-dependent tests recorded only. Foreclosed: a suite-wide sweep for host and load dependence.
- 6a: No paid calls and no live mutations.

### Report #130 (forks/report-130.md), A's pick, 2026-11-09, checked by B and C

#130 stays open; one tests-only leaf removes the collision channel. Reason: demonstrated cause, signpost 2a (remove the cause), 3a (the boundary the report implies: the run's host-global state). Rejected: close naming 97034315 (leaves the collision live); scenario split and controlled reply (no demonstrated cause they remove); timeout raise or product wait change (2a). `hd-silent` and other files change only through the shared boundary.

Final shape:
- Each test fixture gets a repo identity unique to that fixture, derived from the fixture (its unique home), carried consistently to every consumer: the global config `repos` key, `setPrefixes` maps, `hcCore`'s discovery document repo, seat names and labels and their expectations, `leafSlice` inputs in every test teardown and slice lookup, and `startSeat`'s slice argument through the product as it is. No literal `repo` or `rp-` identity remains where a test reaches host-global state or asserts a derived name. No product file changes.
- Per-fixture over per-suite uniqueness: a unique suite id (tests/isolation.ts `suiteRoot`) would also separate two verifies; per-fixture also separates fixtures inside one suite, so it is the stronger boundary.
- The plan sweeps tests/ for the literal `'repo'` and `'rp'` identity on the supplying side too (config maps, `setSeat`/`setPrefixes`, leaf state fixtures), not only the named consumers.
- `leafSlice` is the only host-global name built from `repo.name` (notice ids live in per-session folders; `runSlice`/`runUnitBase` use run ids).

Excluded here: the #129 skill-text decisions (owned by leaf needs-sheet-at-signposts); shortening hd-send's ~15 s fixed waiting (hc client behavior, Off route); the env-less spawn audit (recorded only).

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: no product change, so auth, mutation and secret lines do not apply. Criterion 1 is proven by one test at the real boundary (two real fixture cores and the real user manager's slices), which is the cheapest test that catches the collision; it is a bug fix, so it shows red on the base and green after. No new machinery: two fixtures inside one test use the existing `fixture`, `hcCore` and teardown helpers. Tests that compared a literal identity read it from the fixture instead of keeping a hand-copied name.

## Leaf architecture

- Owned surfaces: tests/helpers.ts (`fixture`, `setPrefixes`, any identity helper), tests/hc-fixture.ts (`hcCore`, `recordedDoc`, `setSeat`), and the test files that pass or assert the identity, including the eight calling `leafSlice({ name: 'repo' }, ...)`: hc-window-calls, hc-teardown, hc-identity, leaf-slices, green-merge, hc-start, hc-delivery, store-sweep-safety, plus every file the sweep finds supplying or asserting the literal identity, including supplier-side reads such as `readRepo('repo', ...)` and `repo: 'repo'` leaf-state fixtures (tests/batch.test.ts, tests/batch-merge.test.ts, tests/config.test.ts and others the sweep finds). (A,C)
- State changed: the fixture's registered repo name and prefix. Consumers relying on it: src/config.ts repo resolution (reads `repos` from the fixture's config.yaml), src/hc.ts session discovery (`hcCore`'s discovery document), src/seat.ts `startSeat` (`--slice=` from `leafSlice`) and `firstTask`'s `/proc/<pid>/cgroup` check, src/scope.ts `leafSlice`. All read the identity from config at run time; the product needs no change. Open for the plan: whether a prefix must stay two letters or match a pattern (src/config.ts prefixes schema) and how the per-fixture prefix is derived to satisfy it.
- No two fixture homes share a registered identity. A test that needs two sessions or cores of one repo builds them inside one fixture under that fixture's identity; a cross-fixture shared identity is not allowed by this contract. (A,B)
- Exclusions: src/ (no product change); issues/ (none).
- Dependencies: none.
