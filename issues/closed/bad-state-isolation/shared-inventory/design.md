# Design: shared-inventory

## Binding decisions, verbatim

### unknown-keys (chart issues/chart/state-unknown-keys/forks/unknown-keys.md)

Operator 2026-10-19: "1a | 2a | 3a" (answered the plain-language rewrite after "elid").

1. 1a: keep strict parsing; one shared inventory returns readable leaves plus retained failures (path, error); every walker uses it and the duplicate walks are deleted. A bad leaf stops only itself; naming it still gives its own error. Reason: covers every kind of bad file and removes duplicate code.
2. 2a: the door removes `priority: n` from the 2 closed akrogon leaves on main, then the leaf deletes the 4-key skip list and the empty `batch.members` shim. Reason: dead code once 1a contains any old file to its own leaf.
3. 3a: no guard against seats writing `state.yaml`. Reason: 1a contains the damage to one leaf with a named error.

Binding avoidance mechanisms (slots/notes-merged.md): a bad leaf stays owned for cleanup, keeps its capacity slot and blocks its own owner's completion and its dependents (A,B,C); a whole-set decision blocks only when a failure sits inside its own scope (B,C); naming the bad leaf returns its own error (A,B,C); depth, duplicate-slug and repo-key checks live once inside the inventory, each violation a failure entry (A,C); each failure is reported once per invocation as `next` does today (C).

Foreclosed: stripping or passing through unknown keys (covers only extra top-level keys, erases or keeps unreported data), per-command catches or a valid-only list (repeats the divergence), a seat-write guard, auto-quarantine of a bad leaf.

Done on main 2026-10-19 before this leaf: `priority: n` removed from the 2 closed akrogon leaves; all 821 live states across the 11 registered repos parse with no skip list and no shim.

Exclusions: nested strictness (`batch`, `failure`, `delivery_error` stay strict; plain nested records stay as they are). The capacity reservation for unreadable leaves is kept, not changed. Version skew between installed releases is covered by the per-leaf failure, with no extra handling.

### Standing design

Installed path: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md.

Interpretation for this leaf: criteria 1-6 are proven through the repo's existing CLI test fixture with temporary repos; no machinery is built and no outside call is involved. Criterion 1 is a bug fix shown red first. Tests that pin repo-wide failure from one bad leaf (for example `allLeaves` throwing on a bad sibling) are false expectations under the locked decision and are rewritten with that reason. The `readState` lazy-migration tests in `tests/state.test.ts` (retired keys accepted and stripped across open, closed and parked) are false expectations under Taken 2a and are rewritten to expect the leaf's own error, with that reason; the direct `stateSchema.parse` rejection tests and strict unknown-key tests stay (B,C). Criterion 7 is a source property no CLI run can show, so its proof reads the source tree under `src` and `skills` and asserts the property, never a hand-copied list of files (C). `tests/status.test.ts` and `tests/next.test.ts` tests for unreadable isolation and capacity reservation stay and are extended rather than duplicated.

## Leaf architecture

Owned surfaces: `src/state.ts` (inventory, `readState`, `allLeaves`, `leavesUnder`, `findLeaf`), and each caller migrated to it: `src/next.ts` (`discover` walk and the merge refreshes), `src/status.ts` (`scanRepo` walk), `src/reconcile.ts` (`collectSlugs` and owner checks), `src/phase.ts` (`completeOwner` owner leaves), `src/park.ts`, `src/stop.ts`, `src/timing-report.ts`, `src/config.ts`, `src/run-check.ts`, `src/verify.ts`, `skills/watch-issues/scripts/observe.ts` (its own walk, parser and retired-key filter) (B), plus their tests.

Interface: the inventory serves a named area or subtree (`open`, `closed`, `parked`) so park and timing reads of parked leaves use it too (C). It keeps the distinctions `next` `discover`'s `Inventory` makes today, moved into `src/state.ts`: readable `leaves`; `unreadable` leaves (folder path and error); `unknown` (a directory that could not be read, so the set may be incomplete); `foreign` (readable states stored under another repo key) (B,C). The existing `next` reporting (one deduped stderr JSON line per path per invocation) and `status`'s unreadable line are the report forms. Target lookup by slug finds the named folder and reads only that leaf, so a bad sibling never hides it and a bad target returns its own error.

Settled consumers:
- `next` dispatch and merge queue: unreadable leaves are never dispatched or queued. Capacity is unchanged: one slot per unreadable leaf, all new capacity held while `unknown` is set, none for foreign leaves (B,C).
- `reconcile`: a failure path counts as owned for worktree, tab and slice cleanup.
- Owner completion (`completeOwner`, `ownerCompletes`): a failure inside the owner blocks completion; failures elsewhere do not.
- `blocked-by`: a dependency on a failed leaf stays unmet and is labelled unreadable, as `discover` does today.
- `status`: shows healthy leaves of the repo and one unreadable line per failure; exit 1 while any failure exists, as today.
- `config` / `run-check` worktree matching: a healthy match resolves; when no healthy leaf matches and a failure could, the error names that path.
- `park`, `stop`, `timing-report`: a failure inside the folders they act on blocks that action; outside it is ignored.

- `observe.ts` (watch-issues): reads open leaves through the inventory and reports each unreadable path instead of aborting (B).

Open for the plan: the exact function name and type encoding, and how duplicate slugs are reported (both entries as failures, as `discover` excludes them today).
