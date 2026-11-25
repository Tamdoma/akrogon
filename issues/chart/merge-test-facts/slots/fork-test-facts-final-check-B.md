# Final-shape check: slot B, fork test-facts, round 1, 2026-11-25

no defect

Checked against code and logs read 2026-11-25 (verify.ts, verify-pass.ts, flaky.ts, land.ts, attempts.ts, run-check.ts, config.ts; framework merge verify logs under issues/open/):

- Item 1's "failures always included" is not contradicted by C's sub-ms probe: every observed framework `(fail)` line carries a `[<n>ms]` bracket, including 0.09 ms and 0.25 ms failures (check-verify-1795545488370-3840724.log, read 2026-11-25); the no-bracket case exists only for `(pass)` lines, which are irrelevant to the slowest-20 anyway. Per-test lines print ms even at 195–300 s (akrogon chart logs, framework logs; the `[<n>s]` form appears only in `Ran N tests` summary lines, which the grammar does not match).
- Item 2's pairing rule matches the observed byte order: `killed N dangling process` precedes the `(fail)` line and nothing intervenes between `(fail)` and its `  ^ this test timed out after` annotation in either occurrence of the examined log (programmatic scan: 2 good, 0 bad).
- Item 3's placement is implementable: rerun rows exist only on merge-scope head rows (verify.ts commandRow requires `compares === undefined`), so the merge-scope limit of item 4 never denies durations to a rerun row; `rerun` already holds `failures`, so the leg-split schema extension is uniform.
- Item 4's stated reuse limit is accurate: verify.ts greenRun does not filter by scope, so in a repo whose leaf and merge command sets are identical (akrogon itself) a green leaf row can serve as the merge receipt; the limit is stated, not hidden.
- Item 5's chain is verified: caller.attempt is present in the pass record schema (verify-pass.ts) and the copy point is runOnce's receipt construction; reused green receipts write no row (verify() reuse path) so tested_top/sha matching is the only join there.
- No contradiction with the fork's Carries: all new fields optional (signpost 6a), no new record kinds (3a), no log retention reversal.

Recorded dissent standing from my rebuttal (not defects, per the brief): top-level-only durations instead of the leg-mirror in item 3, and K=20 supported here which matches the shape.
