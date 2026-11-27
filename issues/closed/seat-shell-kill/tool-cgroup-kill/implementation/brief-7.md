# Unit U7: rollback-compatible kill timing rows (review finding F4)

## 1. Goal

Repair a proven rollback defect: `tool_kill`/`tool_kill_deferred` rows written into `issues/timings.jsonl` make the whole ledger unparseable by any older akrogon after a rollback (the strict discriminated union fails the entire file on one unknown kind — reproduced with the base reader in `implementation/check-review-b-timing-rollback-1795607624490-261947.log` — read it). The rows must live where they cannot corrupt the shared ledger's readability.

## 2. Numbered acceptance criteria

1. `bun test tests/kill-timings.test.ts` passes: after `appendTiming` of both kill kinds, `timings.jsonl` contains no `tool_kill` text and `readTimings` yields the pre-existing rows; both kill rows land in `issues/timings-kill.jsonl` with their fields; a shared ledger holding a foreign kind still yields its valid rows.
2. `bun test tests/timing.test.ts` passes unchanged.
3. `docs/reference/files.md` documents the sibling ledger accurately (the timings.jsonl kinds enumeration no longer claims the kill kinds live there).

## 3. Read-first list

- `src/timing.ts` — `timingEventSchema`, `appendTiming`, `readTimings`, the wake-row tolerance (`wakeRow` — copy its per-line skip pattern).
- `src/tool-cgroup.ts` — the two `appendTiming` call sites (read-only context: you do not own this file).
- `tests/kill-timings.test.ts` — the committed red reproduction.
- `docs/reference/files.md` — the `timings.jsonl` row this leaf extended.
- This skill folder's `ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/timing.ts`, `docs/reference/files.md`. You write and edit no test — a wrong expectation is a mismatch returned to A.

Creation commit: `a08e388d0efe59cc00bfc5dcc6858958aacad0f6`.

Changes:

- `appendTiming` routes by kind inside the function: `tool_kill` and `tool_kill_deferred` rows append to `<root>/issues/timings-kill.jsonl`; every other kind keeps appending to `timings.jsonl`. Same failure behavior as today (warn, never throw). No caller changes anywhere — the routing is invisible to `src/tool-cgroup.ts`.
- `readTimings` becomes per-line tolerant: parse each line independently, skip lines that fail schema validation with the same warn-and-continue pattern `wakeRow` uses (one structured or plain warning per bad line, then continue), so a ledger holding kinds newer than the reader still yields its valid rows. Keep returning `[]` only when the file is absent or unreadable as a file.
- Export a small reader for the kill ledger if the reproduction test needs one — check the test first; if it reads the file lines itself, add nothing (fewest moving parts).
- `docs/reference/files.md`: move the kill-kinds description out of the `timings.jsonl` row into accurate coverage of the sibling ledger, naming both kinds and their fields.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file; a wrong expectation is a mismatch with evidence. Exception: none.
- Do not change `timingEventSchema`'s kinds or fields: the row shapes are the design's reporting contract. Exception: none.
- Do not change the wake path (`wakeRow`, `unreadLines`): it already tolerates unknown kinds. Exception: none.
- Never run any `git stash` subcommand: leaf worktrees share one stash. To set work aside, commit a WIP commit and, before returning, `git reset --soft a08e388d0efe59cc00bfc5dcc6858958aacad0f6` into one returned commit.
- Return a mismatch with evidence instead of changing scope or interfaces; the exception is a revised brief from A.

## 6. Ordered steps

1. Read section 3 and the probe log. (all criteria)
2. Implement the routing and the per-line tolerance in `src/timing.ts`. (criterion 1)
3. `bun test tests/kill-timings.test.ts` — green; `bun test tests/timing.test.ts` — green.
4. Update `docs/reference/files.md`. (criterion 3)
5. Commit once.

Advisory size: 2 files, under 20 turns.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile` first if `node_modules` is absent.
- `akrogon run-check --name u7-timing -- bun test tests/kill-timings.test.ts tests/timing.test.ts --timeout=120000` for evidence. Fall back to bare `bun test` if run-check cannot resolve the leaf in your detached worktree.
- Never `akrogon verify` — that is A's.

## 8. Done-when, evidence and report

Reproduction green, timing.test.ts green, docs updated, one commit. Report with the commit id and these four lines filled:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
