# Brief 2: retire failed_notified (state, dispatchLeaf, test updates)

## 1. Goal

`failed_notified` leaves the runtime: the schema drops it, `readState` strips it from legacy records, and the `dispatchLeaf` "Failed leaf" notification block is gone so repeated `next` runs against a failed leaf issue no herdr calls. Implements plan decisions D5, D6 and the next/state/status-test half of D8.

## 2. Numbered acceptance criteria

1. `grep -rn failed_notified src/` returns nothing; `readState` still parses a legacy `state.yaml` containing `failed_notified: true` (the key is stripped like `priority`/`slot`), while `stateSchema.parse` rejects it directly.
2. In `dispatchLeaf`, the `state.phase === 'failed'` branch returns `'waiting'` with no `herdr` call: repeated `next` runs against a failed leaf record zero `notification` calls in the fake's `.calls` (rewrite of the existing `failed delivery retries` test — the notification now fires at the transition, covered by brief 1).
3. `bun run typecheck` is clean — removing the field surfaces every stale reference.
4. `tests/status.test.ts` uses the shared `fakeHerdr(f)` from `tests/helpers.ts` (added by brief 1) instead of its local copy.

## 3. Read-first list

- `src/state.ts` — `stateSchema.failed_notified`, the `readState` legacy-key filter (`priority`, `slot`), `failureSchema`.
- `src/next.ts` — `dispatchLeaf` failed branch (~lines 485-490): the `if (!state.failed_notified)` block to delete.
- `tests/state.test.ts` — canonical-state assertion, legacy-key strip loops, strict-rejection loop.
- `tests/next.test.ts` — `failed delivery retries, deduplicates sweeps and resets after a phase transition` (rewrite), three `saveState` fixtures carrying `failed_notified: true` (~lines 1995, 2022, 2058), the `dispatchFixture`/`calls()` helpers.
- `tests/phase.test.ts` — the race test's `failed_notified` fixture and assertions (~lines 37, 53).
- `tests/status.test.ts` — local `fakeHerdr` (~line 64) to replace with the shared helper.
- `tests/helpers.ts` — `fakeHerdr` added by brief 1.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/state.ts`: delete `failed_notified: z.boolean().default(false)` from `stateSchema`; in `readState` extend the strip filter to also drop `failed_notified` (`key !== 'priority' && key !== 'slot' && key !== 'failed_notified'`).
- `src/next.ts`: in `dispatchLeaf`, replace
  ```ts
  if (state.phase === 'failed') {
    if (!state.failed_notified) {
      await command(['herdr', 'notification', 'show', `Failed leaf: ${repo.name}/${slug}`]);
      saveState(leaf.path, { ...state, failed_notified: true });
    }
    return 'waiting';
  }
  ```
  with `if (state.phase === 'failed') return 'waiting';`. Remove now-unused imports only if nothing else uses them (`command` is still used elsewhere — check before deleting).
- `tests/state.test.ts`: drop `failed_notified: false` from the canonical `toMatchObject`; add `{ failed_notified: true }` to the strict-rejection loop cases and to the lazy-migration `legacy` objects so `readState` stripping is covered; drop `failed_notified: true` from the `supported` fixture object.
- `tests/next.test.ts`:
  - Rewrite `failed delivery retries...` as: a leaf in `failed` (with `failure` set) returns code 0 on repeated `next` runs, records zero `notification` calls, sends no prompts, and writes no state (or only unchanged state). Keep the `failNotification` db flag irrelevant — no notification is attempted at all.
  - Remove `failed_notified: true` from the three `saveState` fixtures (~lines 1995, 2022, 2058) — the field no longer exists on `State`.
  - Remove the `failed_notified` assertions in the redispatch test (~line 301) and anywhere else.
- `tests/phase.test.ts`: in the race test remove `failed_notified: true` from the `leaf` extra and `failed_notified: false` from the `toMatchObject`.
- `tests/next.test.ts` stale-misses test: the dispatch now persists `failure.delivery` at the transition (brief 1), so the expected `failure` object in that test's assertion needs `delivery: 'shown'` added — the current failure is `expected failure lacks delivery shown, got delivery shown`.
- `tests/status.test.ts`: delete the local `fakeHerdr` function; call sites use `fakeHerdr(f).env` from `tests/helpers.ts` (adjust the import).

## 5. Do-not, reasons and exceptions

- Do not touch `src/phase.ts`, `src/shell.ts`, `tests/fake-herdr.ts` or `tests/helpers.ts` — brief 1 owns them; exception: none.
- Do not keep a `failed_notified` write anywhere — the field leaves the runtime entirely; `readState` stripping is only for legacy records on disk.
- Do not weaken the rewritten `next` test — it must still assert zero notification calls and code 0 across repeated runs.
- Do not change `observeBusy` or the busy-notification path — unrelated to this removal.
- Do not commit — B commits after the full suite.
- Return a mismatch with evidence instead of changing a locked decision or an interface; the exception is a revised brief from B.

## 6. Ordered steps

1. `src/state.ts` — schema drop + strip filter (D6). Criterion: `bun run typecheck` now fails on every stale `failed_notified` reference — use that list as the edit checklist.
2. `src/next.ts` — delete the `dispatchLeaf` block (D5).
3. `tests/state.test.ts`, `tests/phase.test.ts`, `tests/next.test.ts`, `tests/status.test.ts` — remove/replace every stale reference until typecheck is clean.
4. Rewrite the `failed delivery retries` test (criterion 2); run the changed-tests command green.

Advisory size: about 6 files and under 20 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=f91cea968ac46f5a30119e4ce03eac611cc66abd`

## 8. Done-when, evidence and report

All criteria hold with pasted changed-test output: no `failed_notified` in `src/`, legacy state parses, repeated `next` on a failed leaf records zero notifications, typecheck clean. Scenarios use temporary repositories and the fake herdr at the PATH boundary — no real herdr socket, panes or notifications.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
