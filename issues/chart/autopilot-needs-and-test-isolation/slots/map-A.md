# Opening map, slot A

Main 49d2c916 = origin/main (fetched 2026-11-09). Installed chart-issues = repo copy (`diff -rq` same).

## #131 hc-identity pinned schema

- Evidence: `tests/hc-identity.test.ts` "the parts of hc schema akrogon parses match the pinned copy" builds `hcCore(f)` and calls `core.hc(['schema'])`, with a comment naming the operator-core failure. Commit 47186f90 (2026-11-08 10:06 CET). Report base 75f61f00 is its ancestor; report leaf head 6d6ef4bc is not (branch predates the fix).
- Observed 2026-11-09: test passes on main (70 ms), and again with `HC_SESSION=default` exported. Installed client `hc 0.1.19`.
- Fork F-131: is the report fully delivered by 47186f90 (close naming it), or does a gap remain (another spawn in the suite that reaches the operator core)? Signpost 3a limits the reach to the boundary this test implies.
- Pitfall: closing on one green run on an idle host. Removed by citing the mechanism (own core), not the green run.

## #130 hc-delivery "a working seat gets no send"

- Evidence: test passes on main in 14.9 s at load 1.5. The report measured 17.5 s alone, 28.8 to 30 s at load 10 to 22. 97034315 (test cores in own runtime dir, no hc units) removed the unit-leak load (lesson 2026-11-08-hc-shutdown-unit-leak), not the test's own waits.
- The test makes 4 CLI passes (`next`, `phase ... implement`, `next`, `next`) plus one `hc send` and waits; two passes send to an `idle` stand-in that never starts a turn. Fixture sets `AKROGON_START_PROOF_MS=3000` and `AKROGON_PANE_WAIT_MS=2000` (tests/hc-fixture.ts). The rest of the idle time is hc's own send confirmation per never-starting send (`hc send` "waits for a person to pause"; hc-owned, no client flag) plus process starts. Not isolated per step: low confidence on which wait dominates.
- Fork F-130a: how is the time removed? Options: (1) split the test into one test per behavior, each its own 30 s budget (no product change; the never-starting sends stay real); (2) shorten the fixture's own windows further via the existing env knobs, if a measured step is fixture-owned; (3) make the stand-in start where the behavior under test does not need a never-starting seat. Signpost 2a rules out raising the timeout and changing product waits.
- Fork F-130b: what done-criterion proves "does not depend on load"? A load demonstration at charting (free, signpost 6a) of the current test, and a criterion naming a measured margin on the same host, not a wall-second cap (shapes: guessed caps refused).
- Pitfall: splitting multiplies hc core starts (each `setup` starts a core); total suite time may rise. Pitfall: other tests in the same file share the pattern (hd-silent makes 6 tasks); signpost 3a keeps them recorded only unless the same fix covers them for free.

## #129 autopilot needs before charting

- Surfaces: SKILL.md `## Autopilot` (first reply's best-guess list excludes approvals; the wait list: grant approval, retention, secret-save, new-chart proposal, approval, paid/mutating proof, missing need, prerequisite), `## Take` (needs sheet "after the forks settle and before the door's proof calls"; grants recorded "during charting ... before the first covered proof"), `## Drain` (move-on rule), `## Open` (signposts round; close command per delivered identity), assets/questions.md (signposts round shape), assets/shapes.md (`wait:` line), docs/use/autopilot.md:21 (restates the best-guess list).
- Fork F-129a: where does the one upfront ask sit: in the signposts round (operator direction 2026-11-05 names it as the latest point), and what does it hold (needs, grant approvals, paid budget, closes, prerequisites)? Under full autopilot A answers the signposts questions but cannot answer approvals: the sheet is shown to the operator and waited for? Or presented and charting continues on everything not gated?
- Fork F-129b: what happens to something found later anyway: parks visibly (and how it reaches the operator: a message, not a pass-end line), or the contract is cut. Today's cut rule (Take) parks scope cuts for the operator.
- Fork F-129c: the close case (#129's 4th example: a park on "an operator yes to `akrogon close`"). SKILL.md Open says the door runs close itself for delivered identities; find what made a door ask. Low confidence.
- Pitfall: a foreseeing rule cannot foresee everything; a rule saying "nothing after signposts" with no late-find rule invites silent cuts. Pitfall: docs/use/autopilot.md and any other restatement drifting (lesson 2026-09-11 stale rule in docs). Pitfall: this skill change reaches doors only at the next release link.

## Proposed split

- #131: verification and close, no leaf (if F-131 finds no gap).
- #130: one leaf, tests only.
- #129: one leaf, skill text plus the docs restatements.
- Two independent leaves in one destination (akrogon): an epic with two issues, or one issue with two parallel leaves. No dependency between them.
