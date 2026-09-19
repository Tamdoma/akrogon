# Brief 2: failed leaves in next.ts (capacity, observation, attempts-cap failure)

## 1. Goal

Failed leaves stop counting toward `max_active`, stop being seat-observed (a still-blocked pane cannot recreate busy fields), and the dispatch attempts cap records a typed `cause: 'attempts'` failure. Implements plan decisions D7 and the `dispatchSlot` half of D6.

## 2. Numbered acceptance criteria

1. `max_active` reached only by failed leaves still dispatches a ready leaf: with `max_active: 1`, a `failed` leaf holding a live tab/pane does not block dispatch of a second `plan.synthesis` leaf (readable branch).
2. Same guarantee in the unreadable-inventory branch: a `failed` leaf plus an unreadable leaf (malformed `state.yaml`) under `max_active: 2` still dispatches a healthy leaf — contribution is `leaves.filter(phase !== 'failed').length + unreadable`.
3. Repeated `next` runs against a `failed` leaf whose recorded pane still reports `agent_status: 'blocked'` leave `busy_since`/`busy_notified` empty and send no prompt.
4. The dispatch attempts cap (three stale prompt misses) moves the leaf to `failed` with `failure` matching `{ cause: 'attempts', phase: 'plan.synthesis', slot: 'B', reason: 'attempts exhausted' }`.

## 3. Read-first list

- `src/next.ts` — `activeCount` (both contribution branches), `dispatchLeaf` seat-observation block, `dispatchSlot` attempts cap.
- `src/phase.ts` — `commitMove` signature now takes an optional sixth `failure` argument (already landed by brief 1; read the live file).
- `src/state.ts` — `Failure` type and `failure` field (landed by brief 1).
- `tests/next.test.ts` — `dispatchFixture`, `database`, `saveDatabase`, `calls`, `next`, `nextAt`, `configure`, `skips` helpers; the `a merged leaf with its tab still open does not count toward max_active` test is the pattern for criterion 1; `a stale prompt never re-prompts ... three stale misses fail the leaf` is the pattern for criterion 4; `unreadable state reserves its capacity` is the pattern for criterion 2.
- `tests/fake-herdr.ts` — pane `agent_status` values including `blocked`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/next.ts` `activeCount`: in the readable filter add `leaf.state.phase !== 'failed'` alongside the existing `phase !== 'merged'` condition; in the unreadable branch change `inventory.leaves.length + inventory.unreadable` to `inventory.leaves.filter((leaf) => leaf.state.phase !== 'failed').length + inventory.unreadable`.
- `src/next.ts` `dispatchLeaf`: the seat-observation guard `state.phase !== 'merged' && Object.values(state.pane).length > 0` gains `state.phase !== 'failed'` so failed leaves skip `observeBusy` exactly like merged ones. The existing `state.phase === 'failed'` notification branch below is unchanged.
- `src/next.ts` `dispatchSlot`: the attempts-cap call `commitMove(repo, leaf, state, 'failed', slot)` passes `{ cause: 'attempts', phase: state.phase, slot, reason: 'attempts exhausted' }` as the sixth argument.
- `tests/next.test.ts`: add tests for criteria 1–4. For criterion 3, dispatch a leaf, set its phase to `failed` with a `failure` record and empty busy fields via `saveState`, set its pane `agent_status` to `blocked` in the fake herdr db, run `next` twice, assert busy fields stay empty and `prompts` does not grow. For criterion 4, extend the existing three-misses test or mirror it and assert `readState(path).failure` matches `{ cause: 'attempts', phase: 'plan.synthesis', slot: 'B', reason: 'attempts exhausted' }`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/phase.ts`, `src/routing.ts`, `src/state.ts`, `src/status.ts`, `src/akrogon.ts` — landed or owned elsewhere; exception: none.
- Do not change the `Failed leaf:` notification or `failed_notified` — owned by failure-attention.
- Do not change `merged` handling — only add the `failed` exclusions.
- Do not commit — B commits after the full suite.
- Return a mismatch with evidence instead of changing an interface; the exception is a revised brief from B.

## 6. Ordered steps

1. Write the criterion 1 and 2 tests (red), then the `activeCount` edits (green).
2. Write the criterion 3 test (red), then the `dispatchLeaf` observation skip (green).
3. Extend/mirror the criterion 4 test (red), then the `dispatchSlot` failure argument (green).

Advisory size: about 2 files, under 25 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=43ef0f7a7cb8908df33a734bbdee406b1563d408`. Run from the worktree root. B runs the full suite separately.

## 8. Done-when, evidence and report

All criteria verified by tests passing under the changed-tests command; pasted command output required. Scenarios use `dispatchFixture` temporary repositories with fake herdr; no real panes or sockets.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
