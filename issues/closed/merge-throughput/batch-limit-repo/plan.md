# Plan: batch-limit-repo

Debate off (`debate: no`); synthesized directly from brief and design. Live surfaces inspected in the worktree confirm the design's named sites.

## Read-first

- `issues/open/merge-throughput/batch-limit-repo/brief.md`, `design.md` (authoritative scope)
- `src/config.ts` — `repoSchema` (~line 38), `effectiveConfig` print path
- `src/state.ts` — `batchSchema` (35–56), `stateSchema` `solo`/`batch_limit` keys (84–85), `readState` legacy-key drop (~98)
- `src/next.ts` — `mergeTurn` (956+): member selection 1017–1020, batch creation 1033–1042, dead-solo dispatch 1044–1053, member-conflict rewrite 1173–1190, `restoreDrifted` 798–808
- `src/phase.ts` — `commitMove` key carry (153–154), split writing `batch_limit` (~796), restack member-conflict write (677–702)
- `src/batch.ts` — `buildStack` conflict semantics (member slug vs `holderHead`)
- `tests/helpers.ts`, `tests/batch-dispatch.test.ts`, `tests/batch-merge.test.ts`, `tests/batch.test.ts`, `tests/config.test.ts`
- `docs/guide/setup.md` (config bullets ~50–63), `docs/guide/merge.md` (batching ¶7, restack ¶27, split ¶29, reconcile ¶53), `docs/guide/state.md` (batch fields ¶52, leaf flags ¶54), `skills/merge-issue/SKILL.md` (restack prose ~47)

## Decisions

- **D1 — repo `batch_limit`.** Add `batch_limit: z.number().int().positive().default(4)` to `repoSchema` in `src/config.ts`. `akrogon config` prints it via the existing `withSetup(repoConfig)` spread; no print-path change. `z.number().int().positive()` refuses 0, negatives, non-integers and non-numbers; zod issues carry path `batch_limit`, satisfying "error naming the key" (same mechanism as the `max_active`/`fix_rounds` refusal precedent in `tests/config.test.ts`).
- **D2 — follower cap.** In `mergeTurn` member selection (`src/next.ts` ~1017), replace `.filter(<solo marks>).slice(0, fresh.state.batch_limit)` with `.slice(0, Math.min(repo.config.batch_limit - 1, fresh.state.batch_limit ?? Number.POSITIVE_INFINITY))`. Whole-stack count = 1 holder + followers, so `batch_limit: 1` selects none; holder split limit 0 selects none; `min(4-1, 1)` selects 1. The filter line is deleted entirely because leaf `solo` no longer exists (D3), not kept as a vestige.
- **D3 — leaf `solo` key removed.** In `src/state.ts`: delete `solo` from `stateSchema` and add `'solo'` to the `readState` drop list alongside `priority`/`slot`/`failed_notified` — `strictObject` rejects undeclared keys, so the explicit drop is what preserves compatibility with `state.yaml` files written before this change (this is the design's "dropped by readState" mechanism). In `src/next.ts`: remove the `restoreDrifted` solo-write loop (~807), the member-conflict `saveState(..., solo: true)` (~1180–1181), and on batch creation set `applied: false` with no `solo` key; the now-unreachable `if (batch.solo === true)` dispatch block (~1044–1053) is removed since no writer can produce `batch.solo` at creation. In `src/phase.ts`: remove the restack member-conflict `solo: true` write (~692) and the `solo:` carry key in `commitMove` (~153). Batch-level `batch.solo` (holder-conflict solo record and prompt) is untouched everywhere — `src/batch.ts:124`, all `record.solo` reads in `phase.ts`, and the `attempt=<id> solo` prompt stay.
- **D4 — `excluded` on the attempt record.** Add `excluded: z.array(z.string()).optional()` to `batchSchema`. The mergeTurn member-conflict rewrite records `excluded: [...(fresh.state.batch.excluded ?? []), conflicted]` (accumulates across the attemptId rewrites inside one mergeTurn); the phase.ts restack member-conflict rewrite appends the same way. Dirty-member drops are not recorded — they are transient conditions, not conflicts; noted as a deliberate scope line.
- **D5 — test repairs.** `tests/batch.test.ts` stateSchema case: replace the `solo: true` state with an assertion that `readState` drops a legacy `solo` key. `tests/batch-dispatch.test.ts`: rewrite the member-conflict test (~123) — conflicted member left out, `batch.excluded` holds its slug, its branch untouched, no `solo` key on its state; remove all leaf-`.solo` assertions and `toMerge({solo:true})` fixtures (the mark no longer parses; the "solo leaf rejoins" test now passes trivially as an ordinary leaf). `tests/batch-merge.test.ts`: replace `dropped.solo`/member `.solo` assertions (≈8 sites) with `batch.excluded` membership or no-mark assertions; split/`batch_limit` assertions at 371/404 stay (per-leaf key unchanged).
- **D6 — criterion-4 positive proof.** Stage aa(holder), bb, cc where bb's branch deletes file `F` and cc's branch edits `F`: cc rebase onto bb's tip conflicts (modify/delete) → excluded from attempt 1; move aa to `failed` before its push (never refused) so the batch dissolves and bb becomes holder; attempt 2 carries cc cleanly (cc onto main is clean; bb's delete applies on top). Assert `batch.members` holds cc. Do not use add/add (`clash`) commits for the second attempt — the conflict is symmetric and lands on the holder-conflict path, hiding the member selection.
- **D7 — docs.** `docs/guide/setup.md`: new `batch_limit` bullet (integer ≥ 1, default 4, counts holder plus members). `docs/guide/merge.md`: batching paragraph states the cap and that a member that conflicts during the stack build is excluded only from that attempt (slug kept on the record); restack paragraph drops "merge solo" wording likewise. `docs/guide/state.md`: batch record gains `excluded`; the leaf `solo: true` paragraph is removed; `batch_limit` leaf-key description stays (split fallback unchanged). `skills/merge-issue/SKILL.md` line ~47: "restored to its saved head and dropped to merge solo" → excluded from that attempt record and eligible next attempt.

## Interfaces

- `RepoConfig.batch_limit: number` (default 4), source `issues/config.yaml`.
- `Batch.excluded?: string[]` — slugs excluded from this attempt by stack-build conflicts.
- `State.solo` — removed; `State.batch_limit` unchanged (post-split follower count, clears leaving merge).

## Waves

| Unit | Owns | Depends on |
|---|---|---|
| U1 | `src/config.ts`, `src/state.ts`, `src/next.ts`, `src/phase.ts` (D1–D4) | — |
| U2 | `tests/batch-dispatch.test.ts`, `tests/config.test.ts` (D5, D6 + cap/refusal/config-print tests) | U1 (typecheck needs new schema) |
| U3 | `tests/batch-merge.test.ts`, `tests/batch.test.ts` (D5) | U1 |
| U4 | `docs/guide/setup.md`, `docs/guide/merge.md`, `docs/guide/state.md`, `skills/merge-issue/SKILL.md` (D7) | — |

Wave 1: U1, U4 (disjoint paths). Wave 2: U2, U3.

## Done-criteria → proof

| # | Criterion | Proof | Catches | Size | Rerun trigger |
|---|---|---|---|---|---|
| 1 | 6 queued, no `batch_limit` → holder + 3 members | `bun test tests/batch-dispatch.test.ts` — new cap test creates 6 `toMerge` leaves, asserts `batch.members` length 3 | default not applied, off-by-one | seconds | U1/U2 edits |
| 2 | `batch_limit: 1` → none; `: 2` + split 0 → none; `: 4` + split 1 → 1 | same file — parametrize `issues/config.yaml` and holder `batch_limit` in state | min() wrong, split fallback lost | seconds | U1/U2 edits |
| 3 | 0/negative/non-integer refused naming key | `bun test tests/config.test.ts` — invalid values, assert non-zero exit and `batch_limit` in stderr | schema accepts bad values | seconds | U1/U2 edits |
| 4 | conflict member excluded once, eligible next attempt | `bun test tests/batch-dispatch.test.ts` — D6 scenario: `excluded` contains slug; second attempt's `batch.members` contains it | lingering solo mark, missing record | seconds | U1/U2 edits |
| 5 | `akrogon config` prints effective `batch_limit`; docs | `bun test tests/config.test.ts` — `batch_limit: 4` default and override in parsed stdout; `bun test tests/docs-links.test.ts` stays green | print path broken, doc anchors broken | seconds | U1/U2/U4 edits |
| 6 | blocking `checks` | `bun run format`, `bun run typecheck`, `bun test --timeout=30000` in the worktree | regressions | minutes (full suite) | final gate |

## Notes for review

- Design/brief agree; the leaf `solo` removal forces edits at `next.ts:807` and `phase.ts:692` beyond the literal line range named, because those writes and the `commitMove` carry would typecheck-fail once the schema key is gone. Behavior intent identical: no persistent per-leaf mark survives.
- `batch.solo` on the record (holder-conflict solo) is explicitly preserved per brief/design.
