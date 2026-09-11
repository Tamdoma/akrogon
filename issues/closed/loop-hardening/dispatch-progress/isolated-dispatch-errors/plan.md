# Plan: isolated-dispatch-errors

Direct slot B synthesis. `debate: no`, so no positions or rebuttals are required. The brief and locked design govern this plan.

## Read first

- `REFERENCE.md`
- `docs/next.html`: command forms, global capacity and hook dispatch. Use live code for completion behavior where prose differs.
- `src/next.ts`: discovery, capacity, allocation, lock nesting, cleanup and sweep entry points.
- `src/state.ts`: traversal semantics, state schema, slug/repo validation, dependency lookup and lock lifetimes.
- `src/config.ts`: registration resolution and worktree/common-directory matching.
- `src/phase.ts`: merge recovery, owner movement and completion reads.
- `tests/next.test.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts`: isolated subprocess fixtures and prompt evidence.
- `learnings/LESSONS.md`, `learnings/history/2026-09-10-review-by-reading.md`: verify failure isolation through actual CLI invocations.

All listed resources exist. No implementation dependency on a sibling leaf is required.

## Decisions and interfaces

### D1. Report skips once per command and scope

Keep a command-local typed collection of skipped repo/path identities. Emit one `console.error(JSON.stringify(...))` record when first skipping a scope, containing `repo`, `path` and/or a validated `slug`, and `error: error.message`. Use paths for unreadable state and registrations without a known slug. Preserve the original message, including command status and stderr already carried by CommandError. A later capacity scan or sweep must not emit the same skipped scope again.

Catch only scoped read or work operations. Narrow caught values with `instanceof Error` and rethrow non-Errors. The collection is an explicit partial-failure result, never an empty-success substitute. Set `process.exitCode = 1` after the global lock callback finishes if any skips occurred, including hook early returns. No skips means normal zero exit. Fatal errors still reject.

### D2. Discover readable siblings without changing shared command behavior

Implement next-local discovery in `src/next.ts`, reusing `readRepo`, `readState`, existing schemas and path helpers. Separate candidate-directory traversal from state reads so a bad state cannot discard already readable siblings. Preserve open/closed traversal, stopping descent at a state-bearing directory, optional absent issue areas, repo membership checks and duplicate-slug rejection. Ambiguous duplicate identities cannot be dispatched arbitrarily. Filesystem read failures must be reported at the affected path.

Represent each repo scan with its readable leaves and explicit unreadable occupancy information. Use one next-local discovery/lookup path throughout cleanup, sweeps, hook-owner selection and capacity. Refresh state under the existing locks and rediscover after completion can move owners. Do not pass a stale pre-lock state into dispatch decisions.

The current `findLeaf` and `dependenciesReady` rescan all state files. Using them unchanged inside next would reintroduce the failure. Resolve next's selected leaf and dependencies from the validated readable inventory, rereading the selected state under lock. A missing or unreadable dependency is an error on the dependent leaf, while a readable dependency that is not merged retains ordinary waiting behavior. Do not change `src/state.ts`, `src/config.ts` or other commands to become tolerant.

For cwd/folder selection, resolve registration candidates through the same per-repo boundary using existing common-directory semantics. Calling `requireRepo` unchanged would let an unrelated deleted registration stop selection. Hook ownership uses the readable inventory and preserves the multiple-owner error.

### D3. Keep lock errors outside recoverable boundaries

Retain `withLock -> withRepoLock -> withLeafLocks`. A catch around the entire current `dispatchLeaf` would swallow lock acquisition/release failures and is forbidden. Restructure its private interface to accept the discovered leaf identity and run the recoverable work boundary inside the innermost lock callback. Any necessary pre-leaf-lock lookup/read gets a separate narrow boundary inside the repo callback, outside the leaf-lock invocation. No catch encloses a lock-helper call.

Use an explicit dispatch outcome distinguishing completion, ordinary waiting and a reported skip. Continue siblings after work failures such as dependency lookup, allocation, fetch or completion. Errors from acquisition or finalization of any lock still propagate and can stop the command. Cleanup gets its own per-leaf boundary at its existing call site.

### D4. Count uncertain occupancy conservatively and explicitly

For a completely readable repo, keep the existing count of distinct non-merged leaves with matching live panes. If any leaf state is unreadable, count every readable leaf in that repo as occupied, regardless of panes or phase, plus one marker per unreadable leaf. With one unreadable leaf, this is exactly readable leaf count plus one, as specified by the architecture. Do not replace a failed scan with zero or count only the readable leaves with tabs.

When a registration or directory cannot be read at all, its total leaf population is unknown. Treat that unknown population as exhausting available new-tab capacity for this invocation. Other readable leaves still run through dispatch and can reuse existing tabs. This is the conservative extension of the rule, not an assertion that the unknown population is one leaf.

“Repo as full” means all its known leaves count as active, not an unconditional global stop for a single malformed state. Example: with `max_active = 2`, one malformed leaf and one readable sibling consume two places. The sibling with an existing idle tab is still prompted, but another leaf cannot receive a new tab. With room above the conservative count, readable leaves can still receive tabs. This reconciles sibling progress with capacity protection. Tests for an entirely missing registration use an already allocated healthy leaf to prove dispatch continues without guessing unknown occupancy.

### D5. Preserve lifecycle ordering and scope

Keep startup cleanup before the existing merged-then-nonmerged sweep. A cleanup failure does not prevent that sweep, and duplicate reporting for the same leaf is suppressed. Preserve explicit-target errors and ordinary waiting behavior. Do not add notifications, retries, fetch deadlines, completion reordering, hook changes, or documentation edits.

Open limitation: owner completion still reads the complete owner through `completeOwner`; a corrupt member can prevent that owner from closing. Report that completion failure and continue unrelated dispatch. This leaf does not repair owner state or make partial owner completion safe. Unknown occupancy can delay new tabs until the unreadable scope is repaired. Lock failures deliberately remain fatal.

## Acceptance criteria

- A1. A missing registered repo produces one JSON error with its repo/path and original message. A healthy leaf in another registration is still prompted. Exit is nonzero. Verify both startup and hook-owner discovery, plus cwd selection with the bad registration first.
- A2. A leaf with `blocked-by: [nonexistent]` produces one error naming the dependent and missing dependency. Its readable sibling is prompted in the same invocation. A readable unmerged dependency remains a normal wait.
- A3. Malformed YAML and schema-invalid state are isolated by path. A readable sibling with an existing idle tab is prompted. At the D4 capacity threshold, no additional tab is created. With sufficient capacity, a healthy sibling can start. Multiple bad leaves each contribute occupancy and receive separate error records.
- A4. A dirty merged worktree makes real `git worktree remove` fail. Its JSON error retains the command error and stderr, the worktree remains, and the subsequent sweep prompts a healthy leaf. Exit is nonzero.
- A5. Repeated discovery across cleanup, capacity and sweep reports each skipped identity only once. A healthy invocation exits zero. No malformed-state failure is relabeled as a successful empty repo or merely a missing target.
- A6. Actual global, repo and leaf lock failures reject the command rather than becoming skip records. Cover acquisition and a helper finalization failure through an isolated fixture where needed. An invalid hook event and a non-Error throw also remain fatal.
- A7. Existing healthy merged-leaf capacity, concurrency, hook ownership, completion and explicit dispatch tests continue passing. Duplicate slugs and repo mismatches remain errors rather than selecting an arbitrary record.
- A8. A real CLI subprocess run with one broken and one healthy leaf saves stderr, exit code and healthy prompt evidence to this authoritative leaf's `implementation/cli-artifact.log`. The expected failing exit is asserted, not concealed. Format, typecheck and full tests pass.

## Ordered implementation checklist

1. C1 — `src/next.ts`: add the typed invocation error report and readable discovery/lookup result. Implement D1, D2 and D4 without changing shared scanners. Cover A1, A3, A5 and A7.
2. C2 — `src/next.ts`: thread the invocation context through allocation, sweep, cleanup and all entry modes. Move recoverable dispatch work inside lock callbacks and preserve refresh after owner moves. Cover A2, A4 and A6. This follows C1 because all routes must use the same discovery and reporting contract.
3. C3 — `tests/next.test.ts`: use existing fake-herdr helpers and temporary repositories for A1–A7. Keep fixture extensions local. Assert parsed JSON fields, original error content, real prompt records and tab counts, not exact error wording or stack formatting. Lock tests must cause lock-helper failures rather than ordinary callback failures.
4. C4 — run `bun test tests/next.test.ts`, then `bun run format`, `bun run typecheck`, and `bun test`. Inspect the diff for unrelated formatter changes and retain only requested changes. Record actual outcomes in the implementation report.
5. C5 — run the A8 CLI scenario using the existing subprocess fixture or a temporary runner, save its observed evidence outside the code worktree at `implementation/cli-artifact.log` under this leaf, then remove any temporary runner. Confirm saved artifact content and clean up fixture repos. Review the final diff and hand off only after checks pass.
