# pane-record: blind notes, slot B

## Q1. Pick, reason and cost

D1. Pick (a): persist each assigned seat ID before boxing it. Record A as soon as `first` is known, preserving the existing B ID. Record B as soon as the split returns, preserving the current A ID. Keep the existing entry sweep: a recorded pane outside its own scope is closed and recreated, an unreadable scope stops the pass, and dispatch follows successful boxing. Remove the comment promising that every recorded pane is already boxed. The durable record means ownership; successful allocation establishes readiness.

This covers the suspected `box(second)` failure without guessing ownership from tab membership. It also covers A repair failing during boxing. Cost: earlier state writes and the broadcast change below. A failed adoption can cause a replacement on the next pass, which is already the recovery policy.

D2. Remove `broadcastPass`'s live-B shortcut and obtain its dispatch state through `allocate` on every pending broadcast. Otherwise early persistence permits an unboxed recorded B to receive an agent after a failed allocation. Both `dispatchSlot` callers must have completed allocation. Cost: broadcast retries also perform normal allocation/worktree validation and can repair A; healthy live seats are retained. Existing working-broadcast behavior must remain covered.

D3. State the limit accurately: (a) fixes the split-return-to-boxing window, not arbitrary process interruption. Herdr creates a pane before akrogon receives and saves its ID. A kill, lost command response or failed state write in that interval can still leave an unrecorded pane. Do not describe early saving as eliminating every interruption window. If the intake requires that absolute guarantee, none of the three candidates is sufficient with current ownership evidence. That requires a creator-side durable ownership/idempotency contract, which is a separate mechanism to settle before implementation.

## Rejected options

O1. Reject (b), adopting an arbitrary unrecorded member as B. An idle operator shell can have the same tab and cwd as an interrupted seat shell. Adoption would box that operator pane, changing its stop behavior, and could launch a seat in it. Position, shell status and cwd do not distinguish the owners. Tests explicitly preserve an unrecorded operator pane even during interrupted allocation.

O2. Reject (c), sweeping unrecorded tab members, for this fix. No existing evidence identifies an unboxed orphan as akrogon-owned. A matching own scope proves ownership only after adoption, so it misses the suspected failure before adoption. A tab/cwd/idle ownership rule can close or adopt operator panes. Adding a new persistent ownership protocol is larger than moving existing saves.

O3. Reject cleanup only in a catch or finally. It cannot run after process death, and failed cleanup needs further recovery. The existing entry sweep already supplies recovery once IDs are durable.

## Evidence, tier, source and date

All inspection and execution: 2026-10-22, HEAD `92dddada7b2d0a1b37fcb3b1bce9993d535bb62b`.

F1. Direct source evidence: `src/next.ts`, `allocate`. Tab state is saved before seat creation. Both A and B are boxed before the final seat-ID save. Entry already checks every live recorded seat with `inOwnScope`, closes outside panes, and throws on unreadable scopes. `repairB` has an additional save after A boxing and before swapping.

F2. Direct source evidence: `src/next.ts`, `broadcastPass` and both `dispatchSlot` call sites. Normal dispatch always calls `allocate`. Broadcast skips it whenever recorded B merely exists. `dispatchSlot` reads the recorded ID and starts/prompts the agent without checking containment. This is the consumer that relies on the previous save-after-box order for readiness.

F3. Direct source evidence, remaining recorded-ID consumers: `ownsPane` identifies hook owners; `dispatchLeaf` observes busy state before allocation; delivery recording reads the current seat; the merged hook compares B before tab closure. `src/log.ts` reads a seat ID for diagnostic session logging. `src/reconcile.ts`, `broadcastInProgress`, uses B activity to retain resources; `sliceKeepReason` also retains live tabs and pending broadcasts. These uses identify ownership/activity or conservatively retain resources. They do not launch agents based on scope readiness and require no new scope checks for early saving.

F4. Direct source evidence: `src/scope.ts`, `adoptShell` and `inOwnScope`. Adoption is a separate busctl operation. Scope checking uses shell PID/start time and the exact expected scope path. Neither records the pane into leaf state. `src/next.ts` waits up to five seconds for adoption after the call returns, leaving substantial work after a split and before the current save.

F5. Documented contract: `docs/guide/next.md`, “How order is decided”. Seat shells are boxed before seats start; recorded outside panes are recreated; hand-split operator panes are not boxed.

F6. Executed tests: `bun test tests/seat-containment.test.ts tests/next.test.ts --test-name-pattern 'outside pane|recorded seats stay authoritative|allocation handles an interrupted tab'`: 6 passed, 0 failed, 78 assertions. These establish existing recorded-pane recovery and operator-pane preservation. They do not reproduce an interruption after successful splitting or prove the proposed change.

F7. Unverified report plus inference: intake #116 reports an extra unrecorded shell. Its split/adoption failure explanation matches the code, but there is no failure record confirming the actual trigger. The existing interrupted-tab test fails the split before creating B, so it does not cover the reported sequence.

## Pitfalls and what removes each

R1. Broadcast can start an unboxed early-recorded B. Remove the live-ID bypass so successful allocation remains the launch boundary. Verify a pending merged broadcast with recorded B outside its scope and with an unreadable scope, plus the existing working-broadcast test.

R2. An intermediate save can overwrite a surviving seat or lose repaired A in the final save. Preserve the other seat at A recording and carry the new A into B recording. Verify failed B adoption after creation, failed replacement-A adoption beside surviving B, and successful retry without extra owned panes or prompts before containment.

R3. Early persistence cannot recover a pane created before its ID becomes durable, or identify old unrecorded leftovers. Keep the guarantee bounded to the supported failure interval. A strict arbitrary-interruption requirement needs ownership established atomically with pane creation; no tab-member heuristic removes this ambiguity.

R4. Tests can pass while checking only the wrong failure boundary. Exercise failure after a successful B split, then retry. Assert the created B was recorded despite boxing failure, retry leaves only recorded owned seats, and an operator pane remains untouched. Existing containment tests already cover unreadable scopes and ordinary outside-pane replacement.

## Question missing from the fork

Q2. Does “interrupted” require recovery from process death or command-response loss between Herdr creating a pane and akrogon saving its ID, or is this leaf fixing failures after the split returns and during boxing? The former cannot be guaranteed by (a), and (b)/(c) cannot safely distinguish those leftovers from operator panes under the current contract.
