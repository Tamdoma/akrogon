# Sub-brief 1: docs-reference-commands U1

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/docs-reference-commands-u1` (run `bun install --frozen-lockfile` there first).

## 1. Goal

Write `docs/reference/commands.md`: every `akrogon` command, one line each, in a table the command-reference test reads (plan D3, D4, D11; brief done-criterion 1 and 6).

## 2. Numbered acceptance criteria

1. `docs/reference/commands.md` exists with a `# Commands` title, a short intro (run commands from the registered repository unless a row says otherwise; angle brackets mark values you supply; square brackets mark optional parts; `|` separates alternatives), and one table row per verb that `src/akrogon.ts` dispatches (27 verbs: install, init, config, preflight, phase, land, next, pull, close, sync, park, unpark, pause, unpause, stop, start, status, leftovers, timing, flaky, log, run-check, verify, stop-run, pack, guard, rollback).
2. Rows use exactly this form, as a rendered Markdown table (not inside a code fence): `` | `akrogon <verb> <args>` | <effect> | `` with `\|` for every `|` inside the arguments. Group rows under plain `##` headings by reader job (for example: set up, run work, control work, inspect, checks and logs, records and releases). Every group's table has the header `| Invocation | Effect |`. No other table on the page has a first cell starting with a backtick (the test parses every such row as a command).
3. Each row's arguments match the contract in `tests/command-reference.test.ts` (`contracts` object) for that verb: same required and optional groups and the same alternatives. Alternative order may differ.
4. Each effect is one plain sentence, or two short ones, checked against the verb's handler in `src/` (the dispatch in `src/akrogon.ts` names the module). Long rules (phase guards, verify receipts, known-red pairing) are cut to what the command does; they are not copied.
5. `bun test tests/command-reference.test.ts` passes; deleting the `akrogon sync` row makes it fail (A shows this break later; you only need it green).

## 3. Read-first list

- `src/akrogon.ts` (the `switch (verb)` dispatch) and each handler module it calls
- `tests/command-reference.test.ts` (`contracts`, `commandRows`, row regex `^\|\s*`akrogon\s+(\S+)([^`]*)`\s*\|\s*(.*?)\s*\|\s*$`)
- `README.md` section "Command" (lines 142-206): authoring source for the effects; its table sits in a `text` fence, yours must not
- Pattern to copy: the README "Skills" table for rendered-table layout
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Create `docs/reference/commands.md` (owned path). Nothing else.
- Prereqs: none. Shared test resource: none. Wave 1 with U2 and U3.

## 5. Do-not, reasons and exceptions

- Link no other `docs/` page (none of the other reference pages exist in your worktree yet).
- Write for a beginner: plain, short sentences. Say what the reader sees, does and why. Exact agent procedure stays in the owning skill and is linked (`../../skills/<name>/SKILL.md`), not copied.
- Every statement must match current `src/` and `skills/` in your worktree. Where README or an old `docs/guide/*.md` page disagrees with the code, the code wins and the old claim is not carried. Reason: seat B checks each page line by line against its sources (done-criterion 6).
- No dates anywhere on the page (no years, no month names). No "was removed", "used to", "new in" or migration notes. Never name a retired command, setting or file (for example hold-fix, unhold, --red-on-base, held.yaml, run permit, run.lock, run-holder). Reason: done-criterion 6 and the retired-word scans.
- Links: only to the pages and pictures this unit's brief allows, `skills/` files and `src/` files, all as relative paths that exist in your worktree. Never link `docs/guide/` or any page not present in your worktree. Reason: the design's link rule, and tests/docs-links.test.ts fails on a missing target or heading anchor.
- Placeholders only, never real keys, real home paths or private project names.
- Do not edit any test file, README.md, docs/reference-index.md, docs/guide/*, docs/pictures/* or anything under `issues/`. Reason: other leaves own them, tests are locked after planning, and `issues/` never goes on the leaf branch.
- A worker writes and edits no test. If a planned test is red once your page is right, or a fact here contradicts the code, stop and return a mismatch naming the requirement, the actual code (path:line) and the smallest brief correction. Exception: a revised brief from A.
- Restated: beginner wording and code-checked facts because B reviews each line against source; no dates or retired names because of criterion 6; only existing relative links because docs-links fails otherwise; no test, README, guide, picture or issues edits because others own them, with the single exception of a revised brief from A.

## 6. Ordered steps

1. Read the dispatch and the test contract. List the 27 verbs.
2. For each verb read its handler and write the effect (criterion 4).
3. Write the page (criteria 1-3).
4. Run section 7 and fix until green (criterion 5).
Advisory size: 1 file, under 12 turns.

## 7. Commands

- `akrogon run-check --name u1-commands -- bun test --timeout=30000 tests/command-reference.test.ts`
- `akrogon run-check --name u1-docs -- bun test --timeout=30000 tests/docs-links.test.ts tests/run-permit.test.ts tests/hold-retired.test.ts -t 'docs|links'`

## 8. Done-when, evidence and report

Done when every criterion in section 2 holds and the section 7 commands exit 0. Commit only your owned paths in your worktree with a conventional message (`docs(reference): ...`), no co-author line, and return the commit ID. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line; read a log back with `akrogon log <path>`. You touch no test file, so no `Test-Change:` trailer applies. Stop no process by pattern (`pkill -f`, `killall`); use `akrogon stop-run <run-id>`.

Changed files and reasons: <paths and why>
Tests run: <commands and results with check lines>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
