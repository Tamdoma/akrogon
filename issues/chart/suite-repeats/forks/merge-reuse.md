# merge-reuse

## Question

Q1. When merge verifies a head whose tree already holds a completed green leaf receipt under the same command text, should merge accept that receipt (no second full-suite run), or keep rerunning?

Q2. If merge accepts it, what single rule makes `akrogon verify`'s reuse lookup and the merge gate (`requireGreenReceipt`) agree, so the 2026-10-25 failure (verify exits 0 on reuse while the gate still refuses) cannot recur?

Q3. What proof shows it works, without going overboard?

### Carries

- Operator 2026-11-01: "Less is always more (less code, even removing) instead of cramming more code and increasing mental complexity." "do testing to confirm it works. Don't go overboard with testing, do something reasonable."
- History: c00246dd (2026-10-14) dropped the scope match; 9aaed138 (2026-10-25) restored `run.scope === scope` in `greenRun` and `redRun` after test 5d0b505f (member-receipts review B F3). suite-time `## Off route` dropped "O2 cross-scope receipt reuse" (about 1.9% of merge verify time, no operator quote).
- Lock: verify-waste `forks/receipts.md` (member receipts, merge-scope route). Lock: every check still blocks every merge.
- Related forks: [quick-red](quick-red.md) (per-command reuse stays or goes), [repair-verify](repair-verify.md).

## Findings

Blind notes `slots/merge-reuse-A.md`, `-B.md`, `-C.md`, `-D.md`; merged `slots/merge-reuse-merged.md`; rebuttals `slots/merge-reuse-rebuttal-B.md`, `-C.md`, `-D.md`; final-shape checks `slots/merge-reuse-final-shape.md` with `-final-check-B/C/D.md`, correction `slots/merge-reuse-final-shape-2.md` with `-final-check-2-B/C/D.md`.

- Measured 2026-11-01 (`issues/verify-runs.jsonl`, data to 2026-10-29): since 2026-10-26, 13 of 17 merge head runs re-tested a tree with an earlier whole-green leaf run under identical commands, median 70 s; both red merge runs (slow-merge-notice, peer-pane-anchor) were flakes on such a tree, green minutes later (A,B,C,D).
- Cause of the 2026-10-25 revert: fbac86c6 gave `requireGreenReceipt` its own scope-filtered per-command stitch while `greenRun` stayed scopeless; c00246dd had the gate call `greenRun`, one rule (B,C,D). 9aaed138 put scope back in `greenRun` and `redRun` instead of re-joining the rules.
- Two acceptance rules still exist beside the fast path: the gate's cross-row stitch (`src/verify.ts:462-465`) and `knownRedReceipt`'s cross-row green shortcut (`src/verify.ts:224`); either lets the gate accept split rows the fast path refuses (B final check), and a head row with a different command list passes `knownRedReceipt` with no red at all (B,D final check 2).
- Framework's leaf and merge command sets are disjoint (`merge_covers: [cheap]`, `merge_checks: {verify}`), so the change cannot fire there today (B,C,D).
- `Unit` is in-memory only; stored rows carry no unit scope (C final check), so dropping scope from `matching` needs no migration.
- Consumers that keep reading `scope` as record metadata: member split, `slowChecked`/`slowEligible`, PassKey/live-pass joining (B,C,D); `land.ts` reads a merge receipt only after a nonzero verify, still written then (B,C).
- Remaining dissent: B wanted the gate proven through `merged --check` stamping `tested_top`; B and D originally preferred per-command coverage (B) or accepted it (D) before C's rebuttal R2.
- Recorded only: newest-evidence-wins (C rebuttal R4) is pre-existing and changes no observed outcome; the lesson-retire fixup that changes a merge top's tree is the command's, rare and correct (C rebuttal R1).

## Taken

A's pick under autopilot, 2026-11-01 (not operator words):

1. Q1: merge accepts a same-tree receipt. Scope only selects the expected command list (`verifyCommands`). The brief states the cost: one green sample per tree lands, and merge-time flake flips stop feeding `akrogon flaky`. Untracked inputs (env, setup text, `AKROGON_BASE`) were never receipt identity and stay that way. Reason: 13 of 17 recent merges reran identical commands on an identical tree, and the rerun's only observed effect was two flake aborts. Rejected: keep rerunning; a sha condition; an age limit or switch; a synthetic merge receipt.
2. Q2: one row rule. A row is eligible when it is completed with setup green, on the head tree, and its command list equals the expected list (`sameCommands`); scope is not consulted. Green means every entry exit 0; verify's fast path and `requireGreenReceipt` both use that one predicate (`greenRun` minus scope), and the gate's cross-row stitch goes. Known-red means one eligible head row with at least one red, where each red entry has every failed name extractable and failing in a linked base run (`compares === head.run`, merge-base sha, completed, not blocked); `knownRedReceipt` judges one head row at a time and drops the cross-row green shortcut. Scope also leaves `redRun`, `reuseSource` (if quick-red keeps it) and `Unit`/`matching`. Scope stays on records for member split, slow alarm and PassKey. Reason: one row is one checkout and one setup, `runOnce` already writes a full row by copying reused entries, and with a single row rule the fast path and the gate cannot disagree; this holds whether or not per-command reuse stays. Rejected: per-command coverage for both (B's pick; extends cross-row stitching to the fast path, C rebuttal R2); copying revised conditions into each lookup (the 2026-10-25 shape); keeping red scoped (rerun cost only, B withdrew). Dissent: B and D leaned to per-command coverage before the final check; none remains against the final shape (C, D none on check 1; B's and D's check-2 findings adopted).
3. Q3: proof is the inverted 5d0b505f reproducer (leaf verify green, merge verify on the same tree exits 0 and runs no check command, the merge gate accepts; red half: a leaf red head row plus its linked base satisfies the merge gate), one negative (a merge-only command absent from the leaf row runs at merge and the gate refuses before it is green), and one split-row case the gate now refuses. The leaf's normal verify is the only full-suite run. Reason: the operator asked for reasonable testing, and these cases walk exactly the verify-then-gate path that broke. Rejected: a `merged --check` walk (every phase caller uses the same function), benchmarks, a new harness. Dissent: B (walk the real gate through `tested_top`).

## Measurement

Optional prototype chosen by A under autopilot for the named uncertainty "does the one-row rule pass the existing suite except where the decision says it changes", 2026-11-01, scratch worktree at f7ddb693, discarded after. Patch: scope removed from `greenRun`, `redRun`, `reuseSource`, `knownRedReceipt` (heads filtered like `redRun`, judged one head row at a time, base filter without scope); `requireGreenReceipt` calls `greenRun`. Run: `bun test tests/verify.test.ts tests/receipt-gates.test.ts tests/flaky.test.ts tests/slow-merge.test.ts --timeout=30000 --parallel=4 --no-isolate`: 64 pass, 2 fail, 3.4 s. The two failures are the two contracts this fork changes: the cross-row stitch test ("requireGreenReceipt passes when commands turned green across different runs ...") and the 5d0b505f reproducer ("merge verification selects green and red receipts from its own scope"). With the reproducer's expectations inverted, it passes: leaf verify green, merge verify writes no run and `requireGreenReceipt(..., 'merge')` accepts; then leaf red, merge `--known-red` reuses the leaf red head row, runs one base comparison (`compares` = that head) and the gate accepts. Limits: fixture `echo` commands only; `Unit`/`matching` and the quick-red changes were not in the patch.
