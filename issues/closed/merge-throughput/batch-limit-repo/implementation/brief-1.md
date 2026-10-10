# Brief 1 (unit U1): repo `batch_limit`, follower cap, leaf `solo` removal, `excluded` record

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/batch-limit-repo-u1

## 1. Goal

Implement plan decisions D1–D4 in `src/`: repo `batch_limit` config key, capped follower selection in `mergeTurn`, removal of the per-leaf `solo` state mark, and `excluded` slugs on the batch record. Plan: /home/ivan/Work/infra/akrogon/issues/open/merge-throughput/batch-limit-repo/plan.md

## 2. Numbered acceptance criteria

1. `repoSchema` in `src/config.ts` accepts optional `batch_limit`, integer ≥ 1, default 4; zod issues carry path `batch_limit` so refusals name the key.
2. `mergeTurn` member selection in `src/next.ts` slices the queue (after the holder) with `Math.min(repo.config.batch_limit - 1, fresh.state.batch_limit ?? Number.POSITIVE_INFINITY)` and has no `solo` filter.
3. `stateSchema` in `src/state.ts` has no `solo` key; `readState` drops a `solo` key from stored `state.yaml` (same mechanism as `priority`/`slot`/`failed_notified`) so pre-change files still parse. `batchSchema` gains `excluded: z.array(z.string()).optional()`; its existing `solo` field (line ~54, batch record level) is unchanged. The leaf `batch_limit` state key (~line 85) is unchanged.
4. All writes of leaf `solo` are gone: `src/next.ts` `restoreDrifted` dirty loop (~807), the member-conflict write (~1180-1181), `src/phase.ts` restack write (~692), and the `commitMove` `solo:` carry key (~153). `batch` creation in `mergeTurn` sets `applied: false` with no `solo` key, and the now-unreachable `if (batch.solo === true)` dispatch block (~1044-1053) is removed.
5. The `mergeTurn` member-conflict rewrite adds `excluded: [...(fresh.state.batch.excluded ?? []), conflicted]` to the updated record; the `src/phase.ts` restack member-conflict rewrite adds `excluded: [...(batch.excluded ?? []), conflictedSlug]` the same way.
6. Batch-record `solo` semantics untouched: holder-conflict solo rewrites, `attempt=<id> solo` prompts, `record.solo` reads in `src/phase.ts`/`src/batch.ts`, and `restoreHolder`'s `record.solo !== true` guard.

## 3. Read-first list

- /home/ivan/Work/infra/akrogon/issues/open/merge-throughput/batch-limit-repo/plan.md (D1–D4, binding)
- `src/config.ts` `repoSchema` (~line 38) — copy the `fix_rounds`/`implement` scalar-key pattern
- `src/state.ts` lines 35–110 (`batchSchema`, `stateSchema`, `readState` key filter)
- `src/next.ts` lines 790–810 (`restoreDrifted`), 1000–1055 (selection + batch creation), 1140–1195 (conflict rewrite)
- `src/phase.ts` lines 145–160 (`commitMove`), 675–705 (restack conflict)
- `src/batch.ts` (untouched; reference for `Batch` shape)
- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md

## 4. Change list and needed interfaces

Owned paths: `src/config.ts`, `src/state.ts`, `src/next.ts`, `src/phase.ts`. No shared test resource. Nothing must land first; this unit is wave 1.

- `src/config.ts`: add `batch_limit: z.number().int().positive().default(4),` to `repoSchema` alongside the other scalar keys (after `implement` reads naturally). No other change: `effectiveConfig` prints it via the existing spread.
- `src/state.ts`: inside `batchSchema` add `excluded: z.array(z.string()).optional()` after `members`; delete the `solo: z.boolean().optional()` line in `stateSchema` (~line 84, NOT the identical line ~54 inside `batchSchema`); in `readState` add `'solo'` to the filtered key list.
- `src/next.ts`:
  - Selection (~1017–1020): delete the `.filter((entry) => ...)` line; change `.slice(0, fresh.state.batch_limit)` to `.slice(0, Math.min(repo.config.batch_limit - 1, fresh.state.batch_limit ?? Number.POSITIVE_INFINITY))`.
  - `restoreDrifted` (~803–807): drop the `dirty` binding and the `for (const slug of dirty)` solo-mark loop; keep the `restoreMembers` call.
  - Batch creation (~1037–1038): `applied: false`, remove the `solo: fresh.state.solo,` line.
  - Remove the `if (batch.solo === true) { ... return; }` block (~1044–1053) — unreachable now.
  - Member-conflict rewrite (~1179–1188): delete the `memberLeaf`/`saveState(..., solo: true)` lines; add `excluded: [...(fresh.state.batch.excluded ?? []), conflicted]` to `updated`.
- `src/phase.ts`:
  - `commitMove` (~153): delete the `solo: to === 'merge' ? recorded.solo : undefined,` line; keep the `batch_limit` line.
  - Restack member conflict (~677–695): remove the `entry` find and its `saveState(..., solo: true)` (that is `entry`'s only use); in the saved `batch` object add `excluded: [...(batch.excluded ?? []), conflictedSlug]` alongside the `members` filter.
- After edits, run `bun run typecheck`: errors mentioning `.solo` inside `tests/` are expected (those files are owned by later units) and must be left alone; errors in `src/` must be fixed.

## 5. Do-not, reasons and exceptions

- Do not edit `tests/`, `docs/`, `skills/`, `issues/` or `README.md` — owned by other units running in parallel or sequence. Exception: none.
- Do not keep a `solo` compatibility read or write "just in case" — the mark is removed per locked design; the `readState` key drop is the only compatibility surface. Exception: none.
- Do not touch the batch-split code (`src/phase.ts` ~780–800) or holder-conflict solo paths — explicitly preserved by the design. Exception: none.
- Do not run `bun run format` — A formats the lane after all waves land.
- Return a mismatch with evidence rather than changing scope or interfaces. Exception: a revised brief from A.

## 6. Ordered steps

1. `bun install` in the worktree.
2. `src/state.ts` edits (criterion 3).
3. `src/config.ts` edit (criterion 1).
4. `src/next.ts` edits (criteria 2, 4, 5).
5. `src/phase.ts` edits (criteria 4, 5).
6. `bun run typecheck` — `src/` clean; report any `tests/` `.solo` errors as expected-in-flight, do not edit tests.
7. Run the Commands section command; commit with a message like `merge: repo batch_limit cap and per-attempt member exclusion`.

Advisory size: 4 files, under ~20 turns.

## 7. Commands

```sh
export AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

If `--changed` runs no test files (only `src/` changed), that is a valid result — report it.

## 8. Done-when, evidence and report

All six acceptance criteria hold, `bun run typecheck` shows no `src/` errors, the command in section 7 ran, one commit contains the full diff (return its SHA). Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
