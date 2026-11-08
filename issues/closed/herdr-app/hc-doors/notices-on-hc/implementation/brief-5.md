# Brief 5: U7 docs for notice files

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/notices-on-hc-u7` (detached at the leaf head, which holds the landed notice code). Repo: akrogon.

## 1. Goal

Make the docs the leaf's code change made stale describe notice files instead of herdr notifications (plan U7). One line each, current state only, no history.

## 2. Acceptance criteria

Facts to describe (all landed in `src/notice.ts`, `src/next.ts`, `src/phase.ts`, `src/verify.ts`, `src/state.ts`):
- A notice is one file `<app home>/akrogon-notices/<id>.json` = `{"title","body","attention"}` in the herdr-app home of the session holding the repo's space, written under a temporary name and renamed; herdr-setup's `session-status` bar shows it as a toast (sound when `attention`) and deletes it. A file still present is `pending`; a deleted one is `shown`.
- `busy_notified[seat]`: `pending` after the stall notice is written, `shown` once the file is gone (older timestamp values read as shown); its file is removed when the seat goes idle or the leaf moves to `failed` or `merged`.
- `failure.delivery`: `pending`, `shown` or `error` (older herdr reasons stay as written); the failed notice is removed when the leaf leaves `failed` while still pending.
- `batch.notified`: `pending` or `shown`, absent when not written yet or the write failed; dropped (and a pending file removed) when the leaf leaves `failed`.
- Verify: main red and merge slow write notice files inside the run's locked final rewrite, record `notice`/`slow.notice` `pending` or `error`, and fold `pending` to `shown` when the file is gone. A `pending` row covers while its file exists, `shown` covers, `error` never covers (no pid or boot rule).
- `akrogon notice` verb exists (already documented in `docs/reference/commands.md`; leave that row).

1. `src/AREA.md`: the shell line (line 15) drops "and keeps old herdr only for today's notice sends (...)" and says instead that `src/shell.ts` still holds the old herdr helpers only for the watcher's observe script; the verify lines (17 and 32) say notice file instead of herdr notification, `pending`/`error` recorded in the same locked rewrite (no second locked write); add one Key-files-style line for `src/notice.ts` (the notice file contract: folder, id, atomic write, pending/shown, removal). Keep the file at most 40 lines with exactly the second-level sections Commands, Key files, Non-obvious patterns and See also.
2. `tests/AREA.md`: mention `tests/hc-fixture.ts`'s `noticeFolder`, `noticeFiles`, `blockNotices` helpers and `tests/notices.test.ts`; line 17 (session-routing) says notices land in the notice folder of the core holding the repo space instead of `--session <name>` fake herdr calls; line 25 (slow-merge) wording stays true or says notice file. Same 40-line and section rule.
3. `docs/reference/state-and-phases.md` lines 85, 114, 134: `busy_notified`, `delivery`, `notified` values as above.
4. `docs/reference/checks.md` line 79: "sends one `<repo> merge slow` herdr notification, retried by the next in-episode run when the send fails" becomes a notice file wording with the same retry meaning (retried when the write failed).
5. Leave `docs/use/when-work-fails.md`, `state-and-phases.md:43` and `docs/pictures/watch-loop.svg` unchanged.
6. `bunx prettier --check` is not run on docs by the checks; keep the markdown tables aligned the way neighbouring rows are.

## 3. Read first

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.
- `src/notice.ts`; `git --no-pager log --oneline -6` and `git --no-pager show HEAD~0 HEAD~1 HEAD~2 --stat` to see the landed changes.
- The four doc files named above.

## 4. Change list

- `src/AREA.md`, `tests/AREA.md`, `docs/reference/state-and-phases.md`, `docs/reference/checks.md`. Owned paths: those four. Lands after U2 and U3 (landed). No shared test resource.

## 5. Do-not, reasons and exceptions

- Do not touch code or tests, or any doc not listed.
- Do not describe modification history ("now", "no longer", "replaces").
- A doc claim you cannot match to the landed code: return a mismatch with evidence. Exception: a revised brief from A.

Reasons restated: other units own code and tests; docs describe current state. The only exception is a revised brief from A.

## 6. Ordered steps

1. Edit the four files (criteria 1-4).
2. Run section 7.
3. One commit: `docs: notice files in area and reference docs`.

Advisory size: 4 files, under 16 turns.

## 7. Commands

- `akrogon run-check --name u7-area -- sh -c "wc -l src/AREA.md tests/AREA.md; grep -n '^## ' src/AREA.md tests/AREA.md"`
- `akrogon run-check --name u7-grep -- sh -c "! grep -n 'notification' src/AREA.md docs/reference/checks.md"`

## 8. Done-when, evidence and report

Done when criteria 1-5 hold and the commit exists. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite its `check <label>: <exit> <path>` line. Return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
