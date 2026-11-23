Two concrete breaks in `Taken`:

1. **Pick 1 (`src/next.ts:476-487,703-709,803,1256-1270` vs `src/timing.ts:121-138`) — `state.wait` drifts when only `recordWait` writes it:**
   - Today `waitReasonAt`/`capacityWaits` (`src/timing.ts:121-138`) treat any `prompt` event as clearing a prior `capacity` wait to `'none'`. If only `recordWait` updates `state.wait`:
     - `akrogon seat` (`src/next.ts:1256-1270`) prompts a seat without calling `recordWait`, leaving `state.wait.reason === 'capacity'` stale so the next wake skips it in `sweep` and re-queues it in `refill`.
     - Inside `dispatchLeaf`, `dispatchSlot` logs `prompt` (`:478`) while `state.wait.reason` is still `'capacity'`, so `:803` `end('none')` appends a spurious `wait(none)` row (and a throw after prompting slot A leaves `state.wait` stuck at `'capacity'`).
     - A `'skipped'` return (`:719`, `:787`) or throw (`:786`) after `visit_start` (`:703`) leaves `state.wait` absent, repeating `visit_start` on every wake.
   - **Fix:** Write `state.wait = { reason: 'none', since }` on first `visit_start` (`:703`) and whenever a seat is prompted (`:478`, `:1263`, without appending a `wait(none)` row).

2. **Pick 3 (`src/next.ts:845-849` vs `:884-898`) — wake filter `"a blocked-by slug that is no open leaf"` sweeps parked/missing-dep leaves on every wake:**
   - Today `:884-898` sweeps unstarted dependents only when a `blocked-by` slug is in `issues/closed/`. Matching any `blocked-by` slug absent from `open` also matches `parked` and `missing` deps, so every `next --wake` re-enters `dispatchLeaf` → `unmergedDeps` → `slugFolders` (`src/state.ts:345`, scanning all 1,112 `issues/closed/` dirs) for every parked-blocked leaf.
   - **Fix:** Only wake an unstarted leaf when its missing-from-open `blocked-by` slug is not parked (or actually exists in `issues/closed/`, checked once per wake).
