# Brief U5: src/next.ts prompt, visit_start, wait and batch events

## 1. Goal

Wire timing events into `src/next.ts` for leaf `timing-events` (plan decisions D6, D10, D4, D3, D8): `prompt` on delivery/failure, `visit_start` on first observation, `wait` at every non-dispatch exit, `batch` at batch record creation.

## 2. Acceptance criteria

1. `dispatchSlot` gains `attempt?: string` appended to its parameter list (after `mergeContext`). `recordDelivery` appends `{ kind: 'prompt', slug, slot, phase: state.phase, visit: currentVisit(readLog(repo.root), slug, state.phase), session: pane.agent_session?.value ?? null, outcome: 'delivered', ...(attempt ? { attempt } : {}) }`; `recordFailure` appends the same with `outcome: 'failed'` and its `pane`'s session. Each site reads `readLog` at call time.
2. `dispatchLeaf` gains `attempt?: string` after `mergeContext`; it forwards `attempt` to `dispatchSlot`. `dispatchMergeLeaf` gains `attempt: string` and forwards it; its two `mergeTurn` call sites pass the parsed attempt id (`recorded.attempt`, `solo.attempt`, `prompt.attempt` — the values already embedded in `mergeContext` strings).
3. `visit_start` in `dispatchLeaf`: after the leaf is found and `state` read/identity-checked, when `readTimings(repo.root)` holds no `visit_start` event for the slug at all, append `{ kind: 'visit_start', slug, phase: state.phase, visit: currentVisit(readLog(repo.root), slug, state.phase) }`. Covers the initial plan visit.
4. Every `'waiting'` return in `dispatchLeaf` calls `recordWait(repo, slug, reason, blocking?)` first; every `'completed'` return calls `recordWait(repo, slug, 'none')`; `'skipped'` returns record nothing. Reasons:
   - deps detail: `'parked'` + first dep with `label === 'parked'` as `blocking` when one exists, else `'prerequisite'` + `detail.deps[0].slug`
   - inputs detail: `'none'`
   - merge branch (phase `merge`, not holder or no mergeContext): `'merge_turn'` + the holder leaf's slug as `blocking` when the holder is a different leaf, none when self
   - all other `'waiting'` exits (paused repo, failed leaf, allocate null): `'none'`
   Capture the `mergeQueue(...)[0]` result in a const to reuse for the holder check and `blocking`.
5. `batch` event in `mergeTurn`: inside the `withLock` where `saveState(fresh.path, { ...fresh.state, batch: next })` creates the batch record, immediately after that `saveState` append `{ kind: 'batch', slug: holder.state.slug, attempt: next.attempt, holder: holder.state.slug, members: next.members.map(m => m.slug), built_on: next.built_on }`.
6. Timing failures warn and never change dispatch behavior; no other behavior changes.

## 3. Read-first

- `src/next.ts` — `dispatchSlot` (`recordDelivery`, `recordFailure`), `dispatchLeaf` (all `return` sites), `mergeTurn` (batch creation inside `withLock`, ~line 1055-1075), `dispatchMergeLeaf`.
- `src/timing.ts` — `appendTiming`, `recordWait`, `currentVisit` signatures.
- `src/log.ts` — `readLog`.
- `src/turn.ts` — `blockDetail`, `DepDetail.label` values (`'parked'` among them).
- ponytail.md.

## 4. Change list and needed interfaces

Owns: `src/next.ts` only. Prerequisite: U1 on HEAD (`src/timing.ts` exists; if absent, mismatch). Imports: `appendTiming`, `currentVisit`, `recordWait` from `./timing`; `readLog` already imported.

`dispatchLeaf` signature becomes `(global, repo, identity, picked, invocation, mergeContext, isAutomatic, attempt?)`; `dispatchMergeLeaf` becomes `(global, repo, leaf, invocation, mergeContext, isAutomatic, attempt)`. Update `mergeTurn`'s three `dispatchMergeLeaf` call sites to pass `recorded.attempt`, `solo.attempt`, `prompt.attempt` respectively.

## 5. Do-not, reasons and exceptions

- Do NOT restructure `dispatchLeaf`'s control flow beyond what returning through a small local helper needs; a local `end(reason, blocking?)` arrow that records and returns `'waiting'` is the expected minimal shape. Reason: reviewability. Exception: revised brief.
- Do NOT emit `wait` on `'skipped'` returns or inside the `catch` — an errored leaf's prior wait stays as recorded. Reason: D4 dedup contract. Exception: none.
- Do NOT parse `attempt` out of `mergeContext` strings — it arrives as a parameter. Reason: D6. Exception: none.
- Do NOT write or edit tests; `tests/timing.test.ts` is the suite that goes green — run it to verify but never edit it. Exception: none.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing it.

## 6. Ordered steps

1. Add `attempt` params and prompt events in `dispatchSlot`.
2. Add `attempt` param + `visit_start` + `recordWait` returns in `dispatchLeaf`; thread `attempt` through `dispatchMergeLeaf` and `mergeTurn` call sites.
3. Add the `batch` event in `mergeTurn`.
4. `bun install --frozen-lockfile`, run section 7 — this unit makes `tests/timing.test.ts` green in combination with U2–U4; still-red entries point at a missing upstream unit, report which.

Advisory: 1 file, under 20 turns.

## 7. Commands

`AKROGON_BASE=df8868911100bf863224f71a51e70bb489d3b5d9 && bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

All events emit per section 2, `tests/timing.test.ts` passes where its events trace to this file, typecheck clean. Commit message: `timing-events: prompt, visit_start, wait and batch events in next`. `Test-Change:` trailer only if an existing test file changed (none should).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
