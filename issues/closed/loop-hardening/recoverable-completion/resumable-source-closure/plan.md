# Execution plan: resumable-source-closure

Slot B synthesis. Debate is disabled in state.yaml, so this plan derives directly from brief.md, design.md and the live checkout. No positions or rebuttals are required. The locked design controls scope. No execution dependency is required.

## Read first

- This leaf's authoritative brief.md and design.md under issues/open/loop-hardening/recoverable-completion/resumable-source-closure/ in the registered repository.
- REFERENCE.md and learnings/LESSONS.md.
- skills/chart-issues/assets/shapes.md, completion-owner source identity contract.
- src/phase.ts: commitMove, completeOwner and phaseCommand.
- src/pull.ts: closeSources and closeSource.
- src/next.ts: dispatchLeaf, sweepAll, cleanupMerged and nextCommand.
- src/state.ts: leavesUnder and withLeafLocks.
- tests/phase.test.ts, tests/next.test.ts, tests/fake-gh.ts and tests/helpers.ts.
- docs/merge.html and docs/next.html for the exposed command flow. Their existing rename/cleanup ordering descriptions will become stale. Documentation edits are outside this leaf.

## Decisions and interfaces

### D1. Derive source ownership from the open tree

For a completed issue in an epic, intersect the source sets of every leaf of that issue, then subtract the union of sources in every sibling issue. A leaf with no sources contributes an empty set to the intersection. Use exact source identities and deduplicate with sets. Do not persist ownership or add schema fields.

For a standalone completed issue, close its entire source union. When all leaves of an epic are merged, its entire source union becomes eligible. Previously closed sources are harmless because closeSource checks their GitHub state. Sources appearing in only some leaves remain deferred until their container completes. Do not introduce new validation for the upstream ownership contract.

### D2. Complete external closure before reporting or moving

Keep completeOwner(repo, leaf, justMerged). Return for an already closed leaf before attempting external work, and retain the requirement that all leaves of the triggering issue are merged.

Determine whether the containing owner can move. If it can, retain the destination collision check before external mutations. Close the issue's private sources first. If the entire epic is complete, close its union minus that private set next, including any earlier private sources whose GitHub state must be checked. For a standalone issue, close its union once. All required closures for this invocation must succeed before the existing justMerged-gated issue complete line, any owner rename, or chart relocation.

When only this issue is complete, close its private set and report it on the merge transition, but leave the whole epic in open. On final completion, preserve the existing owner destination and chart location. Closure failure propagates while merged states and commitMove's transition log remain recorded. No rollback of merged states or successful GitHub closures.

Preserve justMerged's existing output policy: sweeps retry closure without repeating completion announcements. This retains the existing per-issue once-on-transition behavior without inventing a durable announcement record.

### D3. Pass closure inputs explicitly

Change closeSources to accept (repo: Repo, sources: ReadonlySet<string>, leaf: Leaf): Promise<void>. The Leaf supplies the triggering worktree and slug for diagnostics, but source derivation belongs exclusively to completeOwner. Remove destination scanning from closeSources. Keep the empty-set return before requiring a worktree and read HEAD from that worktree, never from the repository root or a fabricated substitute. A nonempty set without a worktree must fail with slug/source context.

Keep closeSource's GitHub host selection, CLOSED skip, bounded warning-and-retry behavior, comment handling, response validation and aggregated per-source failures unchanged.

### D4. Sweep before cleanup and rediscover moved paths

In nextCommand's --all branch, await the existing sweepAll before enumerating merged leaves for cleanup. Discover the leaves again after the sweep because owner paths can have moved. In cleanupMerged, return immediately for a leaf still within repo.root/issues/open, before closing tabs or deleting worktrees or branches. This preserves commits for failed closures and for completed issues waiting on siblings.

Keep the existing error reporting and isolation already present in the live checkout. Do not redesign dispatch outcomes, locks, scheduling or sweep error isolation.

### D5. Verify through isolated CLI invocations

Reuse the existing real Git fixture and fake-gh command boundary. This verifies command behavior without production GitHub mutations or auth mocking. Update the fake-gh probe to require an open owner, an absent closed destination, a held open-path lock and an existing worktree during closure. Update every existing probe caller, including automatic merge recovery in next.test.ts.

## Acceptance criteria

### A1. Failed closure remains resumable

A phase <slug> merged invocation that exhausts a source closure retry exits nonzero, prints no issue complete line, preserves the owner and chart under open and leaves the leaf merged with its transition logged. A later next <slug> with successful GitHub responses closes outstanding sources and moves the owner and chart. Already successful sources are returned as CLOSED and receive no additional close call. The retry is a successful command, not a second phase transition.

### A2. Issue and epic ownership obey the intersection rule

Use two issues with multiple leaves: every leaf of the first has shared #1 and private #2, every leaf of the second has shared #1 and private #3. Completing the first closes only #2, prints issue complete first and leaves the epic open. Completing the second closes #3 and #1, skips previously CLOSED #2, prints issue complete second and moves the epic. Verify comments use the triggering worktree's HEAD for each completion. Add an asymmetric leaf-source case, including an empty source set, proving a source missing from one leaf is deferred until epic completion.

### A3. Existing completion and failure guarantees remain

Retain and update completion reports each rather than deleting it. Cover standalone union closure, empty sources without a worktree, CLOSED skip, destination collision, missing worktree before rename, partial success, malformed/failed GitHub responses and repeated merged rejection. Update all old failure assertions that expected the owner under closed. If final epic closure fails after the final issue's private source succeeds, no move or completion line occurs, and a later sweep skips that CLOSED private source and retries the remaining source.

### A4. Cleanup cannot remove a needed commit

After a prior closure failure, one next --all invocation completes closure with the worktree and open locks still present, moves the owner and then removes its worktree. With closure still failing, next --all exits nonzero and retains the open owner's worktree, branch and tab. Also cover a completed issue waiting for an unfinished sibling. Existing cleanup of closed merged leaves, dirty-worktree diagnostics and healthy-leaf dispatch must continue working.

## Ordered implementation checklist

1. src/phase.ts and src/pull.ts: implement D1–D3 together and update every closeSources caller. Satisfies A1–A3. Keep source selection local and avoid additional persisted state or dependencies.
2. tests/fake-gh.ts and tests/phase.test.ts: update probes and existing ordering assertions, replace the old non-resumable retry expectations around lines 251–330, and add A1–A3 scenarios. Preserve existing host, commit, locking and retry coverage.
3. src/next.ts and tests/next.test.ts: implement D4, update recovery probe callers and add A4 scenarios. Preserve existing error isolation tests. No merge-issue skill changes.
4. Run the commands below, inspect failures and the final diff, and record evidence under this authoritative leaf. Do not put issue artifacts on the implementation branch.

## Verification and evidence

Run from the implementation worktree:

```sh
bun test tests/phase.test.ts
bun test tests/next.test.ts
bun run format
bun run typecheck
bun test
```

The CLI tests spawn the real src/akrogon.ts entrypoint and exercise phase, next <slug> and next --all in isolated repositories. Capture the focused test output as evidence/cli-verification.log beneath this authoritative leaf with a shell invocation that preserves the test exit status, for example bash with pipefail and tee. Record the final check exit codes in the implementation report. Inspect git diff to ensure formatting introduced no unrelated changes, and remove iteration-created temporary helpers. No browser flow is touched.

## Known limitations

R1. justMerged remains the only announcement gate. A successful later sweep repairs closure and folder placement but does not replay a missed merge-slot broadcast. Durable broadcast delivery is not part of this design, and adding an announcement ledger would expand scope.

R2. Closure and filesystem moves are not atomic. A rename failure after successful GitHub closure leaves already closed sources to be skipped on retry. A chart move failure after owner rename remains an existing limitation outside source-closure recovery.

R3. The docs listed above describe the old ordering. Report that mismatch without expanding this leaf into documentation work. GitHub comment deduplication across separate failed invocations remains governed by the unchanged closeSource behavior.
