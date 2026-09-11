## 1. Goal

Repair the concrete integration failure exposed after repair-1 combined the tests. The upstream tab_closed handler still uses removed interfaces. Keep the accepted closure and upstream dispatch behavior.

## 2. Numbered acceptance criteria

1. A8: existing next.test.ts tab_closed scenario passes. The handler discovers registered owners through current inventory, dispatches a Leaf with the shared Invocation, and sweeps only on outcome completed.
2. A9: source/cleanup and upstream dispatch regression tests continue passing, and no new errors from this handler are recorded by typecheck.

## 3. Read-first list

Read repair-1.md, ../evidence/repair-1-changed.log, ../evidence/repair-1-typecheck-red.log, /home/ivan/.codex/skills/implement-issue/ponytail.md and worker-protocol.md. In the worktree inspect src/next.ts tab_closed and pane hook branches, registeredRepos, discover, dispatchLeaf and sweepAll, and tests/next.test.ts's existing tab_closed scenario.

## 4. Change list and needed interfaces

Only src/next.ts tab_closed branch needs repair. Use registeredRepos(global, invocation).repos and discover(repo, invocation).leaves, dispatchLeaf(global, repo, leaf, false, invocation), DispatchOutcome and sweepAll(global, invocation), matching the adjacent hook flow. Preserve tab ownership checks and matching by tab_id.

## 5. Do-not, reasons and exceptions

Do not change closure, retry, scheduling or output contracts, weaken tests, modify docs, stage files or continue rebase. This is a compatibility repair for a failed blocking check, not a new feature. This revised brief authorizes precisely the production branch excluded from repair-1. Further mismatches require evidence and another revised brief. Exclusions keep the repair limited to broken interfaces, with exceptions only through B's revised brief.

## 6. Ordered steps

1. Confirm existing failure: changed tests had 63 pass/1 fail, and typecheck exit 2 reports missing allLeaves, wrong dispatch arguments/outcome type and missing sweep argument. This is existing fail-first evidence, no artificial test needed.
2. Update only tab_closed branch to the current interfaces and preserve existing tests.
3. Run changed tests and write the report. One production file. B owns final typecheck, format, full suite and rebase continuation.

## 7. Commands

```sh
AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
```

Save output with exit status preserved to authoritative evidence/repair-2-changed.log.

## 8. Done-when, evidence and report

A8–A9 tested with existing isolated real CLI/Git cases and process-boundary fake gh/herdr. No production GitHub or pane mutations. No commit or rebase continuation.

Changed files and reasons: src/next.ts tab_closed branch now obtains registered repos and discovered leaves with the shared Invocation, passes the owning Leaf plus Invocation to dispatchLeaf, and calls sweepAll only for DispatchOutcome completed with that Invocation. Tab-id matching and duplicate/absent owner checks are preserved. No tests changed, no staging or rebase continuation.
Tests run: Existing fail-first evidence confirmed in ../evidence/repair-1-changed.log (63 pass / 1 fail) and ../evidence/repair-1-typecheck-red.log (missing allLeaves and outdated dispatch/sweep interfaces). Supplied changed-test command with AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc now exits 0: 64 pass / 0 fail / 509 assertions across two files. Evidence: ../evidence/repair-2-changed.log, captured with pipefail.
Known limitations: original R1–R3 unchanged.
Unverified criteria: A8 and A9 regression behavior pass. A9 typecheck confirmation remains with B, along with format, full suite and rebase continuation. Original R1–R3 limitations remain unchanged, and tests used isolated real CLI/Git fixtures only.
