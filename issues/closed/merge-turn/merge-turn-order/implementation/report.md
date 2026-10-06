# Implementation report: merge-turn-order

Base `923c6c9` → head `b6f5e64`. Nine commits, one per unit plus a format commit.

## Changed files and reasons

- `src/state.ts` — `merge_stamp` optional field (D2).
- `src/log.ts` — `logSchema`, `LogRecord`, `readLog` moved here from `status.ts` and exported (D3).
- `src/turn.ts` — new module: `eligibility` (hand-built → deps → inputs, shared with dispatch) and `mergeQueue` (stamp → last `to: merge` log ts → slug; no-record last flagged) (D1).
- `src/phase.ts` — `commitMove` writes `merge_stamp` on every move into `merge`; `MoveCommittedError` wraps every post-commit failure while preserving the `log append failed` text; `onCommitted` hook; `phaseCommand` holder guard (refuses `merged`/`check.fix` for non-holders naming the holder, before worktree guards, `failed` never refused) and `{ repo, committed }` return (D2, D5, D6).
- `src/next.ts` — `dispatchLeaf` eligibility via shared predicate plus holder gate (`merge` leaf not queue head → `waiting`, keeping tab/panes/slot); exported `mergeWake` (locked sweep of the repo's `merge` leaves, reports via `invocation.skipped`, never throws or sets exit code); `nextCommand` ends each pass with a merge sweep over every touched repo (D4, D7).
- `src/akrogon.ts` — `phase` case calls `mergeWake` in `finally` whenever a move committed, including `MoveCommittedError` (D6).
- `src/status.ts` — `readLog` import switched to `./log`; closed-area scan for dependency resolution; TURN column (`holder`, place, ` no merge record`) with adjusted width budget (D8).
- `skills/merge-issue/SKILL.md` — `merged --slot B --check` is the first act of a merge pass; waiting leaf refused before any check (D9, criterion 5).
- `docs/guide/{merge,next,phases,limits,state}.md` — turn rule, end-of-pass sweep, stale completion claim, `merge_stamp` field (D9).
- `tests/phase.test.ts` — holder-guard refusals (`merged`, `--check`, `check.fix`, `failed` allowed), refusal before worktree guards, stamp write/refresh, stamp beating slug order; the two raced multi-`merge` fixtures sequenced to holder order (D10; the old `Promise.all` expectations contradict the new one-holder rule).
- `tests/next.test.ts` — holder-only B prompt with waiter keeping panes/tab, ineligible skips, all five exit paths prompting the next B with no manual `next`, second pass prompts nobody, read-only `log.jsonl` append failure still wakes next, returnee queued behind two waiters.
- `tests/status.test.ts` — `holder`/place cells, log-time ordering with `no merge record` last, empty TURN for ineligible/non-merge leaves.

## Commands run

- `bun run format` — reformatted `src/next.ts`, `src/status.ts`, `src/turn.ts` (committed `b6f5e64`).
- `bun run typecheck` — clean.
- `bun test --timeout=30000` — 432 pass, 0 fail, 20 files, 15.95s (wall ~16s).
- `AKROGON_BASE=923c6c98fac3f051a54ac27168ea024215652602 bun test --changed="$AKROGON_BASE" --timeout=30000` — green in each worker's worktree (U5: 277 pass; U6: 282 pass, 1 pre-existing fail that U5's landed rework resolves; U7: 275 pass, same pre-existing fail); superseded by the full-suite run above on the final head.

## Known limitations

- A `phase` move into `merge` while another leaf holds the turn prompts nobody extra (the wake only re-prompts the holder if still idle); a waiting leaf joins the queue at its place — intended.
- `dispatchLeaf` explicit mode on a leaf whose `blocked-by` slug is absent from the inventory now throws `Leaf dependencies are not merged` instead of `Missing or unreadable leaf` (design treats a missing dependency as blocking); sweep behavior unchanged.
- `mergeWake` failure inside the `phase` command's `finally` reports to stderr and leaves the committed result intact, except a non-`Error` throw which propagates (house style in `report`).

## Unverified criteria

None. Criteria 1–9 are covered by the new cases in `tests/next.test.ts`, `tests/phase.test.ts`, `tests/status.test.ts` and the SKILL.md diff, all green on head.
