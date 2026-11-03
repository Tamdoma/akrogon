# Design: merge-receipt-reuse

## Binding decisions, verbatim

From `issues/chart/suite-repeats/forks/merge-reuse.md` `## Taken` (A's pick under autopilot, 2026-11-01, not operator words):

1. Q1: merge accepts a same-tree receipt. Scope only selects the expected command list (`verifyCommands`). The brief states the cost: one green sample per tree lands, and merge-time flake flips stop feeding `akrogon flaky`. Untracked inputs (env, setup text, `AKROGON_BASE`) were never receipt identity and stay that way. Reason: 13 of 17 recent merges reran identical commands on an identical tree, and the rerun's only observed effect was two flake aborts. Rejected: keep rerunning; a sha condition; an age limit or switch; a synthetic merge receipt.
2. Q2: one row rule. A row is eligible when it is completed with setup green, on the head tree, and its command list equals the expected list (`sameCommands`); scope is not consulted. Green means every entry exit 0; verify's fast path and `requireGreenReceipt` both use that one predicate (`greenRun` minus scope), and the gate's cross-row stitch goes. Known-red means one eligible head row with at least one red, where each red entry has every failed name extractable and failing in a linked base run (`compares === head.run`, merge-base sha, completed, not blocked); `knownRedReceipt` judges one head row at a time and drops the cross-row green shortcut. Scope also leaves `redRun`, `reuseSource` (if quick-red keeps it) and `Unit`/`matching`. Scope stays on records for member split, slow alarm and PassKey. Reason: one row is one checkout and one setup, `runOnce` already writes a full row by copying reused entries, and with a single row rule the fast path and the gate cannot disagree; this holds whether or not per-command reuse stays. Rejected: per-command coverage for both (B's pick; extends cross-row stitching to the fast path, C rebuttal R2); copying revised conditions into each lookup (the 2026-10-25 shape); keeping red scoped (rerun cost only, B withdrew). Dissent: B and D leaned to per-command coverage before the final check; none remains against the final shape (C, D none on check 1; B's and D's check-2 findings adopted).
3. Q3: proof is the inverted 5d0b505f reproducer (leaf verify green, merge verify on the same tree exits 0 and runs no check command, the merge gate accepts; red half: a leaf red head row plus its linked base satisfies the merge gate), one negative (a merge-only command absent from the leaf row runs at merge and the gate refuses before it is green), and one split-row case the gate now refuses. The leaf's normal verify is the only full-suite run. Reason: the operator asked for reasonable testing, and these cases walk exactly the verify-then-gate path that broke. Rejected: a `merged --check` walk (every phase caller uses the same function), benchmarks, a new harness. Dissent: B (walk the real gate through `tested_top`).

Charting measurement (`forks/merge-reuse.md` `## Measurement`): a scratch patch of this rule passed 64 of 66 tests in `tests/verify.test.ts`, `tests/receipt-gates.test.ts`, `tests/flaky.test.ts`, `tests/slow-merge.test.ts`; the two failures are the cross-row stitch test and the 5d0b505f reproducer, the two contracts this leaf changes.

Excluded here: `issues/chart/suite-repeats/forks/quick-red.md` decisions (blocked `full` checks, `verifyCommands` order, deleting `reuseSource`, the known-red base shortcut) belong to leaf `quick-red-skip`; this leaf only drops scope from `reuseSource` if it still exists on its base.

`/home/ivan/.claude/skills/chart-issues/assets/standing-design.md` applies as follows: no vanity tests; each criterion is proven by the cheapest test at the CLI-plus-gate boundary using the existing fixture helpers (`fixture`, `callerWorktree`, `cli`, `records`, `config`); the cross-row stitch test is deleted as an outdated expectation with its reason (this leaf's Q2), and the 5d0b505f reproducer, which guards the real 2026-10-25 regression, is kept and inverted rather than deleted; no machinery is built.

## Leaf architecture

Owned surfaces: `src/verify.ts` (`greenRun`, `redRun`, `reuseSource` scope filter, `knownRedReceipt`, `requireGreenReceipt`, `Unit` and `matching`), `tests/verify.test.ts`, `tests/receipt-gates.test.ts` if a gate case belongs there, and the receipt prose in `docs/reference/checks.md` (`## Receipt gates`, and the cross-row stitch and scope sentences in `## Prove a commit with akrogon verify` and `## Known red`). (A,D)

State changes and their consumers:

- Receipt eligibility no longer reads `run.scope`. Consumers: `src/phase.ts` (move into check.review, check.repair to merge, `recordTested`, the push guard) and `skills/chart-issues/scripts/direct-guards.ts` all call `requireGreenReceipt` and need no change; the verify entry's fast path (prints `reuse receipt <run> tree=<tree>`) uses the same predicate.
- A merge that reuses writes no merge-scope row. Consumers: `slowChecked`/`slowEligible` read only real merge rows, so the slow normal gets fewer samples, which is correct; `src/land.ts` reads a merge row only after a nonzero verify, which still writes one; `src/flaky.ts` counts flips across rows and loses merge-time flake samples (accepted cost, Q1).
- Known-red is judged per head row, with heads filtered like `redRun`. Consumers: the gate fallback and `verify --known-red` call the same `knownRedReceipt`.
- `Unit`/`matching` drop scope. `Unit` is in-memory only (no stored field), so stored notices need no migration.
- Scope stays on rows for the member split, `slowChecked`, PassKey and live-pass joining; after this leaf `run.scope === scope` appears in no receipt or notice lookup.

Open for the plan: whether `docs/reference/state-and-phases.md` also states the scope rule. (A,D)
