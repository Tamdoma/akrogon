# Sub-brief 2: `max_active` and `capacity` doc text

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/merge-seat-cap-u2` (created at commit d49b7bb85c8005765505d2145c4aa517185be7cb — work only here)

## 1. Goal

Plan decision D5 of `plan.md` (docs half): the `max_active` prose says the limit counts leaves outside merge, and `docs/reference/files.md` lists `capacity` among the wait reasons. Criterion 3 of the leaf brief: the reviewing seat reads the named text and finds merge leaves are not counted and `capacity` is a listed wait reason.

## 2. Acceptance criteria

1. `docs/reference/config.md` line 27 `max_active` row: still says the limit counts leaves across all registered repos and work already running is not stopped, and now states that leaves waiting in `merge` do not count.
2. `docs/reference/limits.md` line 11 bullet: still says at most `max_active` live leaves across every registered repository and that a leaf with a tab keeps working, and now states that leaves waiting in `merge` do not count toward the limit.
3. `docs/use/run-work.md` line 52 `max_active` paragraph: still describes the limit across all repositories and keeps working at the limit, and now states that leaves waiting in `merge` do not count.
4. `docs/reference/files.md` `wait <reason>` line (~line 79): lists `repo_pause`, `parked`, `prerequisite`, `merge_turn` **and** `capacity`.
5. No other file changes. No other prose in the repo claims `max_active` counts merge waiters (a grep for `max_active` in `docs/` must show only dispatch-order.svg's "up to max_active at once", which needs no change).
6. `bun test tests/docs-links.test.ts --timeout=30000` stays green (you edit no links or anchors).

## 3. Read-first list

- `docs/reference/config.md` line 27; `docs/reference/limits.md` line 11; `docs/use/run-work.md` lines 46-52; `docs/reference/files.md` lines 69-87.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Owned paths: `docs/reference/config.md`, `docs/reference/limits.md`, `docs/use/run-work.md`, `docs/reference/files.md`. No shared test resource; no prerequisite output from the other unit (it edits `src/`).

## 5. Do-not, reasons and exceptions

- Do not edit any file outside the four named docs — no `src/`, no `tests/`, no other docs, not `skills/init-akrogon/` (the plan records it holds no `max_active` text; there is nothing to update). Exception: a revised brief from A.
- Do not edit `docs/pictures/dispatch-order.svg` — "up to max_active at once" is a flow label, not the counting claim. Exception: a revised brief.
- Do not restructure, reflow or reformat surrounding text — smallest diff. Exception: none.
- Do not run `git stash` — worktrees share one stash. To set work aside: WIP commit, then `git reset --soft d49b7bb85c8005765505d2145c4aa517185be7cb` and make the unit's one commit before returning. Exception: none.
- A mismatch means returning evidence and the smallest brief correction, not changing scope. Exception: a revised brief from A authorizes it.

Reasons restated: the four files are the whole owned surface; tests and code are another unit's; smallest diffs keep review cheap.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worker worktree.
2. Edit the three `max_active` texts (criteria 1-3).
3. Edit the `wait <reason>` line in `files.md` (criterion 4).
4. `grep -rn "max_active" docs/` and confirm only `dispatch-order.svg` remains unaddressed (criterion 5).
5. `bun test tests/docs-links.test.ts --timeout=30000` (criterion 6).
6. Commit everything as ONE commit on top of d49b7bb85c8005765505d2145c4aa517185be7cb. Message example: `docs: max_active counts leaves outside merge; capacity wait reason listed`. No `Test-Change:` trailer needed — you change no test file.

Advisory size: 4 files, under 12 turns.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile`
- `bun test tests/docs-links.test.ts --timeout=30000`

Keep output through `akrogon run-check --name <label> -- <cmd>` from the worktree and cite the `check <label>: <exit> <path>` lines; if refused there, run plainly and paste results.

## 8. Done-when, evidence and report

All acceptance criteria met, one commit exists on top of the creation commit, and your return includes the commit ID plus these four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
