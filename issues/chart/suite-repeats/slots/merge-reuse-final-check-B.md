Item 2 does not eliminate the gate's per-command stitching. requireGreenReceipt still falls back to knownRedReceipt (src/verify.ts:466). That function skips each command's red comparison whenever any completed head run has that command green (src/verify.ts:224).

For completed rows A=0/B=1 and A=1/B=0 on the same tree, knownRedReceipt returns true without any linked base comparison. No whole-green row exists, so the proposed verify fast path refuses reuse while the gate accepts through the fallback. The existing split-evidence test at tests/verify.test.ts:1271 would still pass after replacing only the gate's green predicate, contrary to the proposal to remove its contract.

Use coverage consistently, or make the known-red fallback require actual linked red coverage rather than provide a second all-green acceptance rule.

