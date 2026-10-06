# Brief: merge-turn-order unit U1 — turn module, merge stamp, shared log reader

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/merge-turn-order-u1

## 1. Goal

Implement plan decisions D1, D2, D3: a new `src/turn.ts` owning merge-turn eligibility and ordering, a `merge_stamp` field written by `commitMove`… (no, the stamp write belongs to phase.ts which is unit U2 — this unit only adds the schema field) and moving the log reader into `src/log.ts`.

This is the leaf merge-turn-order: give each registered repo one merge turn held by the earliest eligible leaf in `merge`. Units U2–U7 depend on this one.

## 2. Acceptance criteria

- AC1 `stateSchema` accepts and preserves `merge_stamp` as an optional string.
- AC2 `src/turn.ts` exports `eligibility` and `mergeQueue` with the interfaces in section 4, and `mergeQueue` returns only eligible `merge`-phase leaves, ordered stamp → last `to: merge` log time → slug, entries with neither sorted last by slug flagged `noRecord`.
- AC3 `readLog`/`logSchema`/`LogRecord` live in `src/log.ts`; `src/status.ts` imports them and compiles with its current behavior unchanged.
- AC4 `bun run typecheck` passes and `bun test --changed` passes.

## 3. Read-first

- `src/state.ts` (schema and `State`), `src/readiness.ts` (`readReadiness`, `gaps`, `Gap`), `src/routing.ts` (Phase), `src/config.ts` (`GlobalConfig`, `Repo`), `src/log.ts`, `src/status.ts` (current `readLog`/`logSchema` at ~lines 24–59), `src/next.ts` lines 585–638 (`dispatchLeaf` eligibility block to mirror), `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

`src/state.ts`: add `merge_stamp: z.string().optional()` to `stateSchema` (strict object, keep field order style — add near `failure`/`prompted` group, alphabetical order not required).

`src/log.ts`: move `logSchema`, `type LogRecord`, `readLog` verbatim from `src/status.ts` (they need imports `existsSync, readdirSync, readFileSync`, `resolve`, `z`, `phaseSchema`, `slotSchema`, `verdictSchema` — extend the existing import lines). Export all three.

`src/status.ts`: delete the moved definitions, import them from `./log`. No other behavior change; the TURN column is a later unit.

`src/turn.ts` (new):

```ts
import { type Gap, readReadiness, gaps } from './readiness';
import { type Leaf } from './state';
import { type LogRecord } from './log';
import { type GlobalConfig } from './config';

export type Block = { kind: 'hand-built' } | { kind: 'deps' } | { kind: 'inputs'; missing: Gap[] };

export function eligibility(global: GlobalConfig, leaf: Leaf, leaves: Leaf[]): Block | null;
```

- `hand_built === true` → `{ kind: 'hand-built' }`.
- Any slug in `state['blocked-by']` whose leaf is absent from `leaves` or whose phase is not `merged` → `{ kind: 'deps' }` (a missing dependency is blocking, not an error).
- `readReadiness(leaf.path)` throwing propagates (mirrors dispatchLeaf). If not null, `gaps(global, readiness)` non-empty → `{ kind: 'inputs', missing }`.
- Otherwise `null`.

```ts
export type QueueEntry = { leaf: Leaf; place: number; noRecord: boolean };
export function mergeQueue(global: GlobalConfig, leaves: Leaf[], log: LogRecord[]): QueueEntry[];
```

- Filter `phase === 'merge'` and `eligibility(...) === null`.
- Effective time: `state.merge_stamp ?? <ts of the last log record for that slug with record.to === 'merge'>`. Use `log.findLast(...)` or a precomputed Map slug→ts.
- Sort: entries with an effective time first ascending, ties by slug; entries with no time after all, by slug. Assign `place` 1..n, `noRecord` true only for the no-time entries.

Style: match the repo (prettier will be run by the seat), explicit types, no `any`.

## 5. Do-not

- Do not write `merge_stamp` anywhere (phase.ts is another unit): it changes the move semantics and is covered by U2.
- Do not touch `src/next.ts` or `src/phase.ts`: they are U4/U2 surfaces; changing them early makes cherry-picks conflict.
- Do not add tests asserting prose or add new files beyond `src/turn.ts`.
- Do not change `readLog` behavior (e.g., missing file → `[]`, trailing newlines handled): callers depend on it; exception is a revised brief.
- If a signature above cannot be expressed cleanly, return a mismatch with evidence rather than improvising.

Reasons restated: this unit is the base layer for U2–U4; only the schema field and module boundaries are owned here, so later waves apply cleanly.

## 6. Ordered steps

1. `git -C <worktree> log --oneline -1` to confirm base `923c6c9`; `bun install` in the worktree.
2. Read `src/status.ts` lines 1–60 and `src/log.ts` fully.
3. Move `logSchema`/`LogRecord`/`readLog` into `src/log.ts` (export all); update `src/status.ts` imports and remove the local copies. Run `bun run typecheck` (AC3).
4. Add `merge_stamp` to `src/state.ts` (AC1).
5. Write `src/turn.ts` per section 4 (AC2). Run `bun run typecheck`.
6. Run `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000` in the worktree (AC4).
7. Commit as one commit, message describing the change (e.g. `merge turn: state stamp field, shared log reader, turn module`).

Advisory size: 4 files, under 20 turns.

## 7. Commands

- `bun run typecheck`
- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Done when AC1–AC4 hold and the commit exists on the detached HEAD. Report the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
