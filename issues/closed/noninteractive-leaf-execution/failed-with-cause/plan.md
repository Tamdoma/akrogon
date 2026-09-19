# Plan: failed-with-cause

`failed` becomes a first-class stop: `akrogon phase <slug> failed --reason <text> [--slot <A|B>]` is legal from every active phase, records a typed `failure`, preserves the worktree, and clears live busy fields. Moves out of `failed` with `cause: blocked` skip only the clean-worktree check. Failed leaves stop counting toward `max_active` and stop being seat-observed. `akrogon status` shows the cause and reason.

Debate is off (`debate: "no"`); this plan synthesizes the brief and locked design directly.

## Decisions

- D1: `failed` is a routing destination. Add `failed` to `next` of `plan.positions`, `plan.rebuttal`, `plan.synthesis`, `implement`, `check.review`, `check.fix`, `merge`; add `check.fix` to `failed.next`. `merged.next` stays empty; `failed -> merged` stays illegal.
- D2: `--reason <text>` is a new `phase` option in `src/akrogon.ts`, forwarded through `phaseCommand` into `transition`. It is required exactly when the destination is `failed` and refused on every other destination; empty or whitespace-only is refused by `z.string().min(1)` at the CLI boundary.
- D3: The stop path lives in `transition` immediately after routing legality and before every guard. It validates only that the declaring slot is required by the current phase and not already in `done`, then calls `commitMove(repo, leaf, state, 'failed', slot, { cause: 'blocked', phase: state.phase, slot, reason })`. It skips `requireClean`, `requireNoIssueFiles`, `requireNonEmpty`, the rebuttal destination check, the verdict requirement, the two-seat completion barrier and the review destination override, and never touches the worktree.
- D4: `commitMove` gains an optional sixth parameter `failure?: Failure`. It writes `failure` only when `to === 'failed'` and sets `failure: undefined` otherwise, so any move out of `failed` removes the record. On `to` of `failed` or `merged` it also clears `busy_since` and `busy_notified` (`done`, `verdict`, `attempts`, `prompted`, `prompted_at`, `failed_notified` are already cleared on every move). `tab`, `worktree`, `pane` are untouched.
- D5: A move out of `failed` skips `requireClean` only when `state.failure?.cause === 'blocked'`; `cause: 'attempts'` and legacy records without `failure` keep the clean check. `requireNoIssueFiles` still runs for every restart that has a worktree.
- D6: Both existing failure producers record `cause: 'attempts'`. The dispatch attempts cap in `dispatchSlot` passes `{ cause: 'attempts', phase: state.phase, slot, reason: 'attempts exhausted' }`. Review repair exhaustion at the `fix_rounds` cap in `transition` passes `{ cause: 'attempts', phase: 'check.review', slot: slot ?? required[0], reason: 'fix rounds exhausted' }`.
- D7: `activeCount` excludes `failed` leaves in both branches: the readable filter gains `leaf.state.phase !== 'failed'`, and the unreadable branch becomes `inventory.leaves.filter((leaf) => leaf.state.phase !== 'failed').length + inventory.unreadable`. `dispatchLeaf` skips seat observation for `failed` exactly as for `merged`, so a still-blocked pane cannot recreate busy fields.
- D8: `note()` in `src/status.ts` prints `failed <cause> <reason>` when `state.failure` is present, `failed` alone for a legacy failed record, and suppresses busy age for `failed` and `merged` leaves. Other note parts (done, attempts, fix rounds, verdict) are unchanged.
- D9: `stateSchema` gains an optional strict `failure` object: `{ cause: z.enum(['blocked', 'attempts']), phase: phaseSchema, slot: slotSchema, reason: z.string().min(1), delivery: z.string().optional() }`. `delivery` is reserved for failure-attention and never written here.
- D10: The README `phase` row and the `contracts.phase` string in `tests/command-reference.test.ts` both gain `[--reason <text>]`; they must change together or the reference test fails.

## Interfaces

- `phaseCommand(slug, rawPhase, rawSlot, rawVerdict, rawReason)` — parses `rawReason` as `z.string().min(1).optional()`.
- `transition(repo, leaf, requested, explicitSlot, verdict, reason)` — `reason: string | undefined`.
- `commitMove(repo, leaf, state, phase, slot, failure?)` — existing callers omit the sixth argument.
- `akrogon phase <slug> failed --reason <text> [--slot <A|B>]` — `--slot` required exactly when the current phase requires two seats (`plan.positions`, `plan.rebuttal`, `check.review` with `fix_rounds === 0`); single-seat phases infer it.
- `Failure = { cause: 'blocked' | 'attempts'; phase: Phase; slot: Slot; reason: string; delivery?: string }` exported from `src/state.ts` via `stateSchema`.

## Read first

- `src/phase.ts` — `transition`, `commitMove`, guards; the stop path and both `failure` producers' call sites.
- `src/routing.ts` — `routing` table and `requiredSlots`.
- `src/state.ts` — `stateSchema` strict object; add `failure` here.
- `src/next.ts` — `activeCount` (both branches), `dispatchLeaf` seat observation, `dispatchSlot` attempts cap.
- `src/status.ts` — `note()`.
- `src/akrogon.ts` — `phase` options and `phaseCommand` call.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `yaml`, `dispatchFixture` pattern in `tests/next.test.ts`.
- `tests/phase.test.ts` — transition test style; the `failed exits by command reset attempts and refuse check.fix` test must be updated (D1 makes `failed -> check.fix` legal).
- `tests/next.test.ts` — `dispatchFixture`, `database`, `calls`, `nextAt` for capacity and observation tests.
- `tests/status.test.ts` — `leafRow`/`cell` helpers and the failed-leaf row assertions.
- `tests/command-reference.test.ts` + `README.md` — argument contract pair.
- `src/AREA.md` — its "every phase move rejects a dirty worktree" line becomes partially stale; see Known limitations.
- `learnings/LESSONS.md` — review-by-reading lesson: verify by running the CLI in a temp repo, not by reading.

## Ordered checklist

1. `src/state.ts` — add the strict optional `failure` object (D9). Criterion: a state with `failure` round-trips through `readState`/`saveState`; unknown keys inside `failure` are rejected.
2. `src/routing.ts` — add `failed` to every active phase's `next`; add `check.fix` to `failed.next` (D1). Criterion: `phase <slug> failed` is no longer refused as an illegal move from any active phase; `failed -> merged` still is.
3. `src/akrogon.ts` — add `reason: { type: 'string' }` to the `phase` options and pass `values.reason` to `phaseCommand` (D2).
4. `src/phase.ts` — `phaseCommand` parses `rawReason` with `.min(1)`; `transition` takes `reason`, refuses `--reason` on non-`failed` destinations, runs the stop path (D3), skips `requireClean` on `cause: 'blocked'` restarts (D5), passes the `attempts` failure at the fix-rounds cap (D6); `commitMove` takes `failure?`, clears busy fields on `failed`/`merged`, writes/removes `failure` (D4). Criterion: all phase.test.ts scenarios below pass.
5. `src/next.ts` — `activeCount` exclusions and `dispatchLeaf` observation skip (D7); attempts-cap `commitMove` passes the `attempts` failure (D6).
6. `src/status.ts` — `note()` failed text and busy suppression (D8).
7. `README.md` + `tests/command-reference.test.ts` — `[--reason <text>]` in both (D10).
8. Tests — update the `refuse check.fix` test to expect `moved check.fix`; add the scenarios below.

## Acceptance criteria (tests to add/update)

1. `phase <slug> failed --reason x` from `implement` on a dirty worktree succeeds: `failure.cause = blocked`, `failure.phase = implement`, `failure.slot = B`, `failure.reason = x`, the dirty file still exists, `busy_since`/`busy_notified`/`prompted`/`prompted_at` are empty, `tab`/`worktree`/`pane` preserved.
2. Stops land in `failed` immediately with no phase advance: from `plan.positions` with `rebuttal` on and off (both `--slot A`), from `check.review` with `--slot A` while B is unfinished and no verdict, from `merge` (slot A inferred). A stop naming a slot not required (`--slot A` from `implement`) or already in `done` is refused.
3. `phase <slug> implement` from a `cause: blocked` failure succeeds with the worktree still dirty and removes `failure`; the same move from a `cause: attempts` failure refuses the dirty worktree.
4. `failed -> check.fix` succeeds (`moved check.fix`); `failed -> merged` refuses as illegal; `phase <slug> failed` without `--reason` refuses; `--reason` on any other destination refuses.
5. A leaf moved to `merged` shows empty `busy_since`; repeated `next` runs against a `failed` leaf whose pane still reports `blocked` leave busy fields empty and send no prompt.
6. `max_active` reached only by failed leaves still dispatches a ready leaf, in the readable branch and in the unreadable-inventory branch (a failed leaf plus an unreadable leaf under capacity still dispatches).
7. `akrogon status` prints `failed blocked <reason>` / `failed attempts <reason>` in NOTE for a failed leaf, `failed` alone for a legacy record without `failure`, and no busy age for `failed` or `merged` leaves; review repair exhaustion records `cause: 'attempts'` with reason `fix rounds exhausted` (extend the existing cap test).

## Verification

- `bun test` — full suite green, including the updated `check.fix` and command-reference tests.
- `bun run typecheck` — clean.
- `bun run format` — applied to touched files.
- Manual smoke (review-by-running, per learnings): in a `tests/helpers.ts` fixture, dirty an implement worktree, run `phase <slug> failed --reason blocked`, confirm the file survives and `state.yaml` shows the `failure` block; run `phase <slug> implement` and confirm the move succeeds dirty.

## Known limitations

- `failed -> plan.positions`/`plan.rebuttal`/`check.review` without `--slot` prints `recorded` and stays in `failed` (pre-existing two-seat barrier behavior; unchanged by this leaf).
- `src/AREA.md`'s "every phase move rejects a dirty worktree" line is stale after this change; the file is outside the design's owned list — flagged for review.
- Herdr notification, tab rename and `failed_notified` removal are owned by failure-attention; this leaf leaves `failed_notified` and the existing `Failed leaf:` notification path untouched.
- Guide HTML (`docs/guide/*.html`) still describes the old failed-leaf recovery prose; outside this leaf's owned surface.

## Operator actions

None. The design names no credential variables; no `.env` entries are required.

## Implementation notes

- 2026-09-19, check.fix round 1 (review-A F1): D2's "empty or whitespace-only is refused" refines to `.trim().min(1)` — applied at the `phaseCommand` boundary and to `failureSchema.reason` so stored records are protected identically. Trimming also normalizes stored reasons.
- 2026-09-19, check.fix round 1 (review-A N1 / review-B N1): the stale `src/AREA.md` dirty-worktree line is corrected in this leaf after all — it states a false invariant for the file it documents.
