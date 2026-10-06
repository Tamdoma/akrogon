# Brief 2: merge pass orchestration in src/next.ts (plan U2, wave 2)

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-batch-u2

## 1. Goal

Move merge-turn dispatch out of the single global lock into `mergePass` (plan decisions D2, D8, D9, D11): reconcile records, write the batch record, build outside the lock, apply under it, prompt only the holder. The phase command (another unit) consumes the record; you own only the pass, sweep guards and tab/worktree timing.

## 2. Acceptance criteria

1. `mergePass(global, repo)` runs unlocked; each `akrogon next`/`mergeWake` end calls it once per repo. A holder with no record gets a record (members in `mergeQueue` order excluding `solo`-marked leaves and the holder, each with `base = merge-base builtOn head`, `head`, `tip = head`) written under the lock, then an unlocked build, then a locked apply that verifies the attempt is still current and the holder still in `merge`, sets `applied`/`top`, then prompts the holder's B.
2. The prompt text is `merge-issue <slug> slot=B phase=merge leaf=<path> attempt=<id> top=<sha>` for an applied record, `attempt=<id> solo` when `record.solo`. Only the queue head is prompted; members never are.
3. A member build conflict marks it `solo: true` under the lock, drops it, rebuilds under a NEW attempt id, applies and prompts. A holder conflict restores any drifted members (apply partially ran), writes `applied: true, solo: true, members: []` and prompts with `solo`.
4. A record with `applied: false` (interrupted build) restores member branches/worktrees drifted from `head` to their saved `head` via `restoreMembers`, then discards and rebuilds under a new attempt.
5. Reconcile on a record whose holder left `merge`, or in `merge` with a `candidate` set: `git fetch <remote>`; failed fetch restores nothing, keeps the record, reports via `report`. `candidate` ancestor of `trackingRef` → for each member still in `merge` whose `tip` is an ancestor of the tracking ref, `commitMove` to `merged`; a holder still in `merge` moves too; member tabs close via `closeMergedTab`; the record clears when no member remains in `merge`. `candidate` not ancestor (or no `candidate` with holder gone) → restore members still in `merge`, clear record, no solo marks. A `failed` holder with `candidate` ancestor → `herdr notification show "<repo>/<slug> merged, move it back"`-style notice naming `akrogon phase <slug> merge` as next step (use the existing `herdr`/`command` call pattern from `phase.ts announceFailed`; tolerate failure with a warning).
6. `dispatchLeaf` gains an optional `mergeContext` string appended to the merge prompt (through `dispatchSlot`); only `mergePass` passes it. All other sweep/dispatch paths treat merge-phase leaves as before — the existing `mergeQueue` head guard stays, and `dispatchLeaf` for a merge leaf outside `mergePass` returns `waiting` without prompting (pass `mergeContext === undefined` → return `'waiting'` right where the holder check is).
7. `sweep`: delete the `ordered.push` holder-fail revisit (dead: merge leaves no longer dispatch inside sweeps). When `dispatchLeaf` returns `'completed'`, call `dispatchDependents(global, repo, slug, invocation)` so carried members wake dependents.
8. `nextCommand`: move the final `for touched` merge sweep OUT of `withLock` — after the locked callback, `await mergePass(global, repo)` per touched repo. `mergeWake` becomes the same call pattern (its own `mergePass` for one repo, no inner `withLock` needed except inside `mergePass`).
9. `closeMergedTab` and `cleanupMerged` skip a leaf whose slug is in `batchMemberSlugs(repo)` while any record naming it still exists; `mergePass` closes member tabs only after the holder finishes (criterion 8). `sweep`'s `cleanupMerged` path and the pane-idle `closeMergedTab` call in `nextCommand` get the same skip.
10. A leaf entering `merge` after the record is written is excluded (its stamp postdates the record) and becomes the next holder after this batch finishes.
11. `akrogon status` output unchanged; no new state fields beyond what `src/state.ts` already defines (`batch`, `solo`).

## 3. Read-first list

- `src/next.ts` whole file; especially `dispatchLeaf` (merge guard), `sweep`, `mergeWake`, `nextCommand` lock, `cleanupMerged`, `closeMergedTab`, `dispatchDependents`, `leafTemp` usage.
- `src/batch.ts` (landed): `attemptId()`, `memberBase(repo, builtOn, head)`, `buildStack(repo, builtOn, items, holderHead)`, `applyStack(repo, top, members, holder)`, `restoreMembers(repo, members)`, `isAncestor(cwd, a, b)`, `batchMemberSlugs(repo)`; `src/state.ts` `batchSchema`/`Batch`.
- `src/turn.ts` `mergeQueue`; `src/preflight.ts` `trackingRef`, `checkBase`; `src/phase.ts` `commitMove` (import already exists).
- `tests/next.test.ts:3889-4162` for dispatch test patterns, `tests/helpers.ts` `fixture`/`fakeHerdr`/`cli`, `tests/fake-herdr.ts` Database.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list

Owned paths: `src/next.ts`, `tests/batch-dispatch.test.ts` (new), `tests/next.test.ts` (update merge-prompt expectations and any test whose assumptions batching changes). Not owned: `src/phase.ts`, `src/akrogon.ts`, `src/batch.ts`, `src/state.ts`, skills, docs — mismatch if a change there seems needed.

`mergePass(global, repo)` outline:

1. `invocation = { skipped, dispatched: new Set() }`; `inventory = discover(repo, invocation)`.
2. Records pass: for each leaf in `merge`/`merged`/`failed` with `state.batch`: per criteria 4-5 reconcile under the lock (`withLock(globalHome .lock)`), fetch outside the lock, verify under it.
3. `queue = mergeQueue(global, discover(repo, invocation).leaves, () => readLog(repo.root))`; return if empty. `holder = queue[0].leaf`.
4. If `holder.state.batch?.applied` → `dispatchLeaf(global, repo, holder, false, invocation, context)`.
5. If `holder.state.batch` and `!applied` → restore drifted members, clear, rewrite record below (new attempt).
6. No record → `git fetch <remote>` (warn on failure, continue with existing tracking ref); under the lock re-read holder state, recompute the queue head (abort if it changed), write `batch = { attempt: attemptId(), built_on: rev-parse trackingRef, members: queue.slice(1).filter(not solo)…, applied: false }`.
7. Build unlocked (`buildStack`). Member conflict → lock: mark member `solo`, rewrite record minus it with NEW `attemptId()`, rebuild remaining; repeat. Holder conflict → restore drifted, `record = { ...record, applied: true, solo: true, members: [] }` under lock, prompt `solo`.
8. Apply under the lock: re-read holder, require `phase === 'merge'` and `attempt` match (else restore drifted, clear, `return`); `applyStack`, save `applied: true, top`.
9. `dispatchLeaf(global, repo, holder, false, invocation, 'attempt=<id> top=<sha>' or 'attempt=<id> solo')`.

`dispatchLeaf` signature: add trailing optional `mergeContext?: string`; thread to `dispatchSlot` → prompt `routing[...]... leaf=${leaf.path}${mergeContext ? ' ' + mergeContext : ''}` — but prompt gains the context only for merge phase (or append unconditionally; only merge paths pass a value).

In `dispatchLeaf` at the merge guard, when `mergeContext === undefined` return `'waiting'` after the existing holder check (holder check still runs so a non-head explicit call is refused-silent as today). With a context, proceed normally.

## 5. Do-not

- No changes to phase/akrogon CLI (another unit owns `--attempt` enforcement and the push).
- Do not prompt members, do not delete the `mergeQueue` guard, do not run `git push` or `git rebase` on live branches outside `batch.ts` helpers.
- No `setInterval`/polling/clocks; no new deps; do not touch `docs/`/`skills/` (U4 owns them).
- `tests/next.test.ts` edits: update expectations to the new prompt text and re-sequence `toMerge` calls so waiting leaves enter `merge` AFTER the holder's record exists (simulating the real late-join rule) — preserve each test's assertion intent; a test asserting behavior this design removes (membership of waiting leaves) is changed only with the design as the source, named in your report.
- Commits changing `tests/next.test.ts` (existing test-file path) need `Test-Change: tests/next.test.ts <source and reason>` trailers; `tests/batch-dispatch.test.ts` is new, no trailer.
- Return a mismatch with evidence instead of changing owned-path scope or the `batch.ts` interface.

## 6. Ordered steps

Advisory: 2-3 files, under 40 turns.

1. `tests/batch-dispatch.test.ts` first: cover criteria 1-5, 7, 9, 10 — holder gets record+prompt with `attempt`/`top`; member conflict → member `solo`, holder prompted, member branch untouched; interrupted build (`batch` with `applied: false` written by hand) → members at saved head, holder prompted once; holder `failed` with `candidate` on remote → notice + `akrogon phase <holder> merge` lands `merged` without run/push; `candidate` pushed, partial member moves → resume finishes moves; fetch failure (rename remote) → record kept, members untouched, error reported; dependent of a moved member gets prompted; member tab not closed while record in-flight.
2. Update `tests/next.test.ts` merge tests to the new prompt/context expectations.
3. `src/next.ts` changes per section 4.
4. Run commands, green.

## 7. Commands

`AKROGON_BASE=1edd0c0b02fa8094f62eb04225b2a624cfa94c01 bun test --changed="$AKROGON_BASE" --timeout=30000`

Also run `bun test tests/batch-dispatch.test.ts tests/next.test.ts --timeout=30000` (the next.test.ts merge block is your regression surface). Run `bun install` first.

## 8. Done-when, evidence and report

All criteria green; pasted outputs. Commit on the worker HEAD, return commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
