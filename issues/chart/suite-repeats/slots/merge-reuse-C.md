# merge-reuse: seat C blind notes

Tiers: T1 = measured from live data by me 2026-11-01, T2 = code or git history read 2026-11-01, T3 = inference.

## Q1. Accept the leaf receipt at merge when tree and command set match?

### Pick

Accept. Merge reuses when, on the same tree, every command `verifyCommands(config, 'merge')` expects (`src/verify.ts:113-120`) already holds a green entry with identical name and command text in a completed run, whatever scope wrote it. Reason: a verify run is a fresh sparse checkout plus setup plus those command texts (`src/verify.ts:529-575`); scope changes nothing about execution except which commands are expected and the `AKROGON_BASE` passed in (see Pitfalls). When the merge command set differs, as in framework (leaf `cheap`, merge `verify` with `merge_covers: [cheap]`), the match fails on its own and merge runs fresh. Cost: one green sample per tree is enough to land; the second sample at merge disappears. Saving is real but modest: about 70s on roughly three quarters of current merges, around 2% of a median leaf's wall.

### Rejected

- Keep rerunning (status quo). The rerun is a second sample, not new proof: in the whole data window, reruns after a whole-green run on the same tree and set flipped red 2 of 15 times, both went green again minutes later on the unchanged tree, and both landed. The rerun caught no deterministic defect in the sample.
- Accept only when the sha is unchanged (no rebase happened). Tree is already the reuse key within a scope today (`src/verify.ts:157-167`, since c00246dd); adding a sha condition is a new, stricter rule that same-scope reuse does not impose, and it keeps the trailer-only and empty-rebase reruns c00246dd deliberately removed.
- Accept the receipt but still write a merge-scope run assembled from reused entries. Rejected under Q2; it keeps a fake run and a setup execution for bookkeeping only.

### Evidence

- T1, `issues/verify-runs.jsonl` read 2026-11-01 (330 runs, last start 2026-10-29), my recount: since 2026-10-26, 17 completed merge head runs (no `compares`), 13 on a tree with an earlier whole-green leaf run under the identical ordered command set; those 13 walls sum 15.6m, median 71s. All-window: 14 of 77. This matches `INTAKE.md` Agent findings.
- T1, same source: the 2 red reusable merges are slow-merge-notice (2026-10-28T13:37Z, test red 100s after leaf green, green again 13:39Z same tree) and peer-pane-anchor (2026-10-29T08:18Z, same pattern, green 08:20Z). Red-then-green on an unchanged tree is a flake sample, not a caught defect. Low n, so the flip rate itself is low-confidence.
- T2, akrogon `issues/config.yaml`: `checks` = format, test, typecheck; no `merge_checks`, no `merge_covers`, so leaf and merge expected sets are textually identical. T2, framework `issues/config.yaml`: sets are disjoint, so this change cannot fire there today.
- T2, `src/verify.ts:864`: scope is derived from caller phase only. T2, `tests/verify.test.ts:111`: a check command can observe `$AKROGON_BASE` and HEAD, so tree plus command text is not a complete execution identity in principle.

### Pitfalls

- A test that is flaky under load lands on its first green, and merges stop producing flip samples for the flaky record (`src/flaky.ts:25-28` counts outcomes across runs). Removed by nothing in this fork; later leaves still run the suite on new trees, and the known-red path still exists. This is the accepted price, and it should be stated in the brief so nobody later treats a landed flake as a reuse bug.
- A future check that reads `$AKROGON_BASE` or git history would silently inherit a green taken against an older base, because neither base nor sha history is in the identity. Removed only if that day comes: the reuse key would need the base tree added, one field. Naming this trigger now is the removal; adding the field today for a check that does not exist is overbuild.
- Setup text and env are not in receipt identity today either (`completed` checks only `setup === 0`, `src/verify.ts:134-136`), so cross-scope reuse widens an existing hole from minutes to the leaf-to-merge gap. Removed by nothing here; pre-existing, not created by this change.
- Framework gains nothing now, but if its config ever makes the two sets equal, reuse starts firing on its expensive browser suite with no further decision recorded. Removed by the chart noting framework's config equality as the trigger to recheck, not by code.

### Extra question

Receipt identity ignores the `leaf` field too (`src/verify.ts:157-167` matches tree, not slug), so same-scope reuse across different leaves already works today. Is cross-leaf reuse on an identical tree intended, or should this fork name it before widening reuse further?

## Q2. One rule so verify reuse and the merge gate cannot disagree

### Pick

One predicate, used by both: `covered(runs, tree, expected)` = at least one completed run exists on the tree (`src/verify.ts:134-136`) and every expected command has a green entry (`greenEntry`, `src/verify.ts:172-174`) in some completed run on that tree, scope not consulted. Scope survives only to compute `expected` (`src/verify.ts:113-120`). Then:

- `verify()` (`src/verify.ts:880-884`) short-circuits on `covered` instead of `greenRun`; delete `greenRun` (`src/verify.ts:157-167`).
- `requireGreenReceipt` (`src/verify.ts:459-470`) keeps its current per-command body minus the scope filter, or calls the same predicate; either way there is one implementation.
- Drop `run.scope === scope` from the other receipt-identity filters in the same change: `redRun` (`src/verify.ts:143-155`), `reuseSource` (`src/verify.ts:203-210`), and the head filter in `knownRedReceipt` (`src/verify.ts:218`). The `compares === head.run` key (`src/verify.ts:232`) already identifies base runs exactly.
- Keep the scope field on records, the member split (`src/verify.ts:765`), slow-alarm scope (`src/verify.ts:178-179`), main-red Unit identity (`src/verify.ts:253-257`), and PassKey (`src/verify.ts:730-743`). Scope stops being receipt identity; it stays execution and record metadata.

Net effect is deletion: one function and four scope clauses gone, no new state. Cost: gate semantics stay per-command (entries may come from different runs on the tree), which is the locked member-receipts behavior, and reuse can now also fire in the union case where today verify reruns but the gate would pass.

### Rejected

- The two-line inverse of 9aaed138: drop scope only in `greenRun` and `requireGreenReceipt`. That is the same patch shape that created the 2026-10-25 bug. It leaves `redRun` and `knownRedReceipt` scope-filtered, so merge `--known-red` reruns a head that a leaf run already showed red, and `reuseSource` reruns leaf-green commands in a partial-cover merge pass. Safe direction, but the disagreement class stays alive.
- Restore c00246dd's whole-run sharing, where `requireGreenReceipt` was `greenRun(...) === undefined`. Also one rule, also a deletion, but it narrows the gate from per-command to whole-run and reopens the verify-waste member-receipts lock (fbac86c6) for a purity gain outside this fork's question. The union case (run 1 test green/format red, run 2 the reverse, same tree) passes today's gate and would start refusing.
- Keep scope identity and make merge `runOnce` write a merge run with all entries reused from the leaf run. `runOnce` always creates a worktree and runs setup first (`src/verify.ts:529-544`), the fake run pollutes the flaky count and needs `slowEligible` to keep excluding it (`src/verify.ts:184-190`), and there are still two rules (runOnce reuse vs the gate) that can drift.
- Delete scope from the schema entirely. It is still load-bearing for the command set, the member split, the slow alarm, and live-pass joining; removing the field is a record migration that buys nothing.

### Evidence

- T2, `git show c00246dd` (2026-10-14): `requireGreenReceipt` literally called `greenRun`, scope unmatched "because the command set encodes it". One rule, agreed by construction.
- T2, `git show fbac86c6` (2026-10-25): member receipts rewrote `requireGreenReceipt` into a separate per-command, scope-filtered lookup and added `reuseSource` scope-filtered, while `greenRun` stayed scopeless. That split is the disagreement.
- T2, `git show 5d0b505f` and `9aaed138` (2026-10-25): the reproducer proved verify exited 0 on a leaf receipt while the gate refused; the fix patched `greenRun` and `redRun` only, leaving `requireGreenReceipt` and `knownRedReceipt` as separate implementations that happen to agree today.
- T2, callers of the gate: check.review and check.repair-to-merge at `src/phase.ts:429-433` (leaf), `recordTested` at `src/phase.ts:678` and push at `src/phase.ts:749` (merge). One predicate behind `requireGreenReceipt` covers all four with no phase.ts change.
- T2, consumers of merge-scope runs: `src/land.ts:55-63` looks one up only after verify returned nonzero (`src/land.ts:94-98`), which under this pick still implies a fresh merge run was written; land never calls known-red. `src/status.ts:98` reads the last slow-flagged run. Neither needs a run written for a reused green merge.

### Pitfalls

- Partial application recreates the bug in the known-red direction: if green identity drops scope but `knownRedReceipt` keeps it, a merge gate relying on known-red coverage of a leaf-red head refuses while `verify --known-red` passes, or the reverse. Removed by changing all receipt-identity filters in one leaf; after it, `run.scope === scope` in `src/verify.ts` should survive only in Unit matching (`src/verify.ts:257`), which is notice identity, not receipt identity.
- A reused green merge writes no merge-scope run, so the merge-slow alarm loses most of its samples (13 of 17 recent merges) and `slowEligible` history thins. Removed by nothing; a fully reused run has no real wall time to alarm on anyway (`src/verify.ts:182-190` comment). Flagging for the alarm's owner, not fixing here.
- The reuse print names one run (`reuse receipt <run> tree=<tree>`, asserted exactly at `tests/verify.test.ts:364`); per-command cover may span several runs, so there is no single honest id. Removed by printing the newest contributing run, keeping the line shape seats and tests already parse.
- Old receipts in `issues/verify-runs.jsonl` keep their scope field and stay readable; no migration, and the predicate works on history immediately. That also means reuse can fire on receipts written before this decision, which is intended but worth one line in the brief.

### Extra question

Q1 asks only about green receipts. My pick extends the same identity to red evidence (`redRun`, `knownRedReceipt` heads) for coherence. Does A want that extension in this fork, or green-only with the known-red asymmetry accepted and named?

## Q3. Proof, without going overboard

### Pick

Three things. First, invert the one existing reproducer, `merge verification selects green and red receipts from its own scope` (`tests/verify.test.ts:1487`, from 5d0b505f): leaf verify green, then merge verify exits 0, writes no second completed run, and `requireGreenReceipt(..., 'merge')` passes; then with a red command, leaf red followed by merge `--known-red` writes only the compares base run and the gate passes. Rename it for the new rule and keep its `Test-Change:` citation to this fork. Second, one negative gate case in `tests/receipt-gates.test.ts` using the framework shape: config where merge expects a command the leaf set lacks (or covers the leaf's only check), seed or run a green leaf receipt, and `merged --check` still refuses with `No green merge verify receipt`. That is the safety boundary of the whole change. Third, run `tests/verify.test.ts`, `tests/receipt-gates.test.ts` and the merge-path tests, then the leaf's normal single `akrogon verify`. After landing, one data check: over the next 20 merges, count merge head runs in `issues/verify-runs.jsonl` and red outcomes in `issues/merge-attempts.jsonl`; expect merge head runs to drop toward the changed-tree minority and no gate-refusal reds.

### Rejected

- Seeded-receipt unit tests only (`greenReceipt` in `tests/helpers.ts`). The 2026-10-25 failure was a disagreement between the CLI's exit and the phase gate, so at least one proof must walk `verify` then the gate end to end; the inverted 5d0b505f test already does exactly that.
- A live trial on real leaves with no test change. The current test at `tests/verify.test.ts:1487` asserts the opposite run-scope list, so the suite blocks the leaf until it is flipped anyway, and a trial leaves no permanent guard.
- An exhaustive matrix over scopes × members × blocked × known-red × live-pass joining. Existing tests already cover members, blocked entries, per-command reuse and known-red internals (`tests/verify.test.ts:1084-1422`); only the scope axis changes here. The operator said reasonable, not overboard.

### Evidence

- T2, `git show 5d0b505f`: the reproducer follows the normal leaf-to-merge workflow with empty `merge_checks` and identical sets, and asserts scopes `['leaf', 'merge']` then `['leaf', 'merge', 'leaf', 'merge', 'merge']` (`tests/verify.test.ts:1500-1508`). Inverting it proves precisely the failure that caused the revert cannot recur, in the originally failing direction.
- T2, `tests/receipt-gates.test.ts:64-90`: `merged --check` gate test already seeds stale-command receipts and expects refusal; the framework-shape case is the same test with a disjoint merge set instead of a stale string.
- T1, recount under Q1: the expected post-land signal is quantitative and already baselined (13 of 17 merge runs reusable since 2026-10-26, median 71s), so the data check has a number to compare against instead of a vibe.

### Pitfalls

- The inverted test can ossify form (exact scope lists, exact reuse line at `tests/verify.test.ts:364`) and start failing on harmless record-shape changes. Removed by asserting outcomes (exit 0, no new completed run, gate passes or refuses) and keeping exact-string assertions only where the string is an error seats act on.
- Fixture checks are `echo` commands, so no proof here can catch a real base-sensitive check (Q1 Pitfalls). Removed by the post-land data check on real merges, not by more fixture cases.
- Flipping only the green half of the 5d0b505f test while the code also changes red selection (my Q2 pick) leaves the suite red or, worse, asserting a rule nobody chose. Removed by flipping both halves in the same test, matching the Q2 decision A records.

### Extra question

The direct route also verifies at merge scope (caller phase undefined, `src/verify.ts:864`; the 5d0b505f test reaches merge scope through `--holder`). Should direct landings get cross-scope reuse too, or does the chart intend this only for the leaf lifecycle merge turn?

Accepted leaf receipts at merge save about 70s on three quarters of merges, and the whole change is a deletion: one cover predicate, `greenRun` gone, scope out of receipt identity. The only real price is landing on one green sample per tree.
