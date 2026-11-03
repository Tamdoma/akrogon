# merge-reuse merged notes (A, B, C, D)

Sources: slots/merge-reuse-A.md, -B.md, -C.md, -D.md, all written blind 2026-11-01.

## Q1 accept a same-tree leaf receipt at merge

- Accept when the head tree holds completed setup-green evidence for every command `verifyCommands(config, 'merge')` expects, matched by name and command text (A,B,C,D). Scope only decides which commands are expected (`src/verify.ts:113`) (B,C,D).
- Data: since 2026-10-26, 13 of 17 merge head runs re-tested a tree with an earlier whole-green leaf run, median 70 s (A,B,C,D); both red merge runs (slow-merge-notice, peer-pane-anchor) were flakes on such a tree, green again minutes later (B,C,D); while c00246dd was live, 33 of 50 merged leaves reused at merge (D).
- Cost: one green sample per tree lands; flake flips at merge disappear from `akrogon flaky` (B,C). Accepted and stated in the brief (C).
- Rejected: keep rerunning (A,B,C,D); sha-equality condition (C); age, switch or periodic rerun (B); synthetic merge receipt (B,C).
- Pitfalls: rebase changes the tree and reruns, gate keeps resolving the HEAD tree (B,D); framework's disjoint sets (`merge_covers: [cheap]`, `merge_checks: {verify}`) never match, so its merges still run (B,C,D); tree plus command text omits `AKROGON_BASE`, env and setup text, a pre-existing hole widened from minutes to the leaf-to-merge gap, named as the trigger to add the base tree if a check ever reads it (C,B R3).

## Q2 one rule

- Options:
  - O-cover (B,C, A after reading): one per-command coverage predicate, used by verify's fast path and `requireGreenReceipt`: at least one completed setup-green run on the tree, and every expected command has an exit-0 entry (name + command text) in some completed run on that tree; scope not consulted. Delete `greenRun`. Keeps the member-receipts per-command gate (`tests/verify.test.ts:1271`). Net deletion.
  - O-whole (D): `requireGreenReceipt` calls `greenRun` (whole-run green). Deletes the gate's stitching and its test. D's reason: every successful pass writes one full-green row because `runOnce` copies reused entries. Narrows the gate and reopens the member-receipts lock (C), and couples to X2b (B).
- Red evidence: drop scope from `redRun` and `knownRedReceipt` heads too, one identity everywhere (C,D, A); keep red scope-bound because a red is only a pass with the linked same-failure base comparison (B). Base runs are already keyed by `compares === head.run` (C).
- `matching`/`Unit` (main-red notice identity, `src/verify.ts:254-262`): drop scope so a landed leaf-scope green resolves a merge-scope main red (D); keep it, notice identity is not receipt identity (C).
- Keep scope on records for the member split, slow alarm (`slowChecked`), PassKey/live-pass joining (B,C,D).
- Pitfalls: partial edit recreates 2026-10-25, removed by one diff over all receipt filters (A,B,C,D); empty command list must still need a completed run (B R5); the `reuse receipt <run>` line names one run while coverage may span several, print the newest contributing run (C); fewer real merge runs thin the slow-alarm normal, correct since reused runs have no wall time (A,B,C,D); `land.ts:55` reads a merge receipt only after a nonzero verify, still written then (B,C).

## Q3 proof

- Invert the 5d0b505f reproducer (`tests/verify.test.ts:1487`): leaf verify green, merge verify on the same tree exits 0 and runs no command, and the merge gate accepts (A,B,C,D). B wants the gate walked through `merged --check` stamping `tested_top`; D calls `requireGreenReceipt` directly.
- One negative: a merge-only command (or changed command text / changed tree) is not covered, verify runs it and the gate refuses until it is green (A,B,C,D).
- Red half of that test follows the Q2 red decision (B,C,D).
- Run the focused files (`tests/verify.test.ts`, `tests/receipt-gates.test.ts`) plus the leaf's normal verify; no benchmark, no new harness (A,B,C,D). Post-land data check over the next merges (C).

## Open questions raised

- Merge B commits `lessons: retire applied lines` before verify (`skills/merge-issue/SKILL.md` `## merge`), changing the tree and defeating reuse when it fires (D).
- Cross-leaf reuse on an identical tree already works within a scope (C).
- Direct-route landings verify at merge scope and would reuse too (C).

## Where slots differ

- O-cover (A,B,C) vs O-whole (D).
- Red scope dropped (A,C,D) vs kept (B).
- Notice `Unit` scope dropped (D) vs kept (C).
