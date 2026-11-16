# Brief 1 (unit U1): `blocked_notified` state field

Worktree: /home/ivan/.akrogon/worktrees/akrogon/blocked-seat-notice-u1

## 1. Goal

Add the `blocked_notified` per-seat field to the leaf state schema — plan decision D1 for
blocked-seat-notice. This is the field two later units write through `observeBusy`, `dispatchSlot`
and `commitMove`; today `readState` rejects it (strict object), which is the recorded red for the
leaf's criterion tests.

## 2. Acceptance criteria

1. `stateSchema` accepts `blocked_notified: { A?: string, B?: string }` and defaults it to `{}` when
   absent, with the same shape and loose value type as `busy_notified`.
2. `bun run typecheck` passes in this worktree.
3. Nothing else changes: no other schema key, no formatting churn outside the added line.

## 3. Read-first list

- `src/state.ts` — the `stateSchema` `strictObject` around line 100; copy the `busy_notified` line.
- `docs/reference/state-and-phases.md` — context only; the doc row is another unit's.
- This skill folder's `ponytail.md` if present; otherwise keep the diff to one line.

## 4. Change list and needed interfaces

- `src/state.ts`: insert after the `busy_notified` line:
  `blocked_notified: z.object({ A: z.string().optional(), B: z.string().optional() }).default({}),`
- `State` gains `blocked_notified: { A?: string; B?: string }` for the later units.

## 5. Do-not, reasons and exceptions

- Do not touch tests, `src/next.ts`, `src/phase.ts` or docs — they belong to other units; overlap
  makes the cherry-pick dirty. Exception: none.
- Do not tighten the value type to an enum — the plan mirrors `busy_notified` exactly (`z.string()`),
  and state.yaml seeds hold arbitrary stamps. Exception: none.
- Return a mismatch with evidence rather than widening scope; a revised brief from A authorizes a
  change.

## 6. Ordered steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`
   in the worktree.
2. Edit `src/state.ts` per section 4.
3. Run `bun run typecheck` (targeted check for this unit).

Advisory: 1 file, under 6 turns.

## 7. Commands

- `bun run typecheck` — must exit 0. No test-file run: the leaf's criterion tests belong to A.

## 8. Done-when, evidence and report

Commit the edit on this branch (`git add src/state.ts && git commit`) with a message naming the
field, then return the commit id and the four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
