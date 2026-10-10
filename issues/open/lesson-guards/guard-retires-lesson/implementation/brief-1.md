# Brief U1: merge-path re-removal (command code + tests)

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/guard-retires-lesson-u1
Plan unit U1, wave 1. Decisions D2, D3, D4 of `plan.md`.

## 1. Goal

When a leaf retires a lesson (removes its `learnings/LESSONS.md` line and appends `Applied <date> by <guard file:line>: <text>` to the lesson's history file), the `merge=union` attribute on `learnings/LESSONS.md` can resurrect the removed line when the branch is rebased onto a main that added a neighbouring line. This unit adds the mechanical re-removal on the command merge path: (a) `buildStack` removes resurrected retired lines and commits a fixup on the built top; (b) `merged --check` refuses when a retired line is present in the range being pushed, in both applied-stack and solo mode.

## 2. Acceptance criteria

A1. A `buildStack` run where `builtOn`'s `LESSONS.md` contains a line the union merge resurrects (member or holder removed the line and added `Applied` to its history file) returns a `top` whose `LESSIONS.md` lacks the retired line and keeps every other line (including the new main-added line); the removal is one fixup commit on top of the holder range.
A2. A `buildStack` run with no retired lessons in the range produces no extra commit (behaviour identical to today).
A3. `akrogon phase <slug> merged --slot B --check --attempt <id>` on an applied stack whose top's `LESSIONS.md` still contains a retired line refuses with an error naming the retired history stem(s); after the fixup it passes.
A4. The same refusal fires in solo mode: a solo batch record whose worktree HEAD removed a lesson line and appended `Applied`, where the rebase resurrected the line, gets the same refusal naming the stem; once B removes the line and commits, `--check` passes.
A5. Fail-first: the A1 test is red without the `buildStack` change (git's union merge leaves the resurrected line and no code removes it). Show the red run before implementing, then green after.
A6. A history file's lesson line is matched by its `history/<name>` stem (path without `learnings/` prefix and `.md` suffix), covering both bare-path lines (`history/2026-09-10-x.md`) and markdown links (`[text](history/2026-09-10-x.md)`).

## 3. Read-first

- `src/batch.ts` (`buildStack`, lines ~42-76) — insertion point: after the holder rebase / member loop, inside the disposable worktree `dir`.
- `src/phase.ts` (`batchCheck`, ~lines 396-435; `requireNonEmpty`, `requireTestChangeCitations` for refusal style) — add the retired-line guard covering both `record.solo === true` and applied-stack branches.
- `tests/batch.test.ts` — `batchFixture()`, `branch()` helpers, union attribute does NOT exist in the fixture; create `learnings/` + `.gitattributes` per test.
- `tests/phase.test.ts` — CLI-level `merged --check` scenarios.
- `tests/helpers.ts` — `fixture`, `leaf`, `cli`, `branch` conventions; `command()`/`run()` from `src/shell.ts`.
- `.gitattributes` in repo root: `learnings/LESSONS.md merge=union` — the mechanism under test.
- `learnings/LESSONS.md`, `learnings/history/` — real line format: lines end `history/<date>-<slug>.md` or `History: [text](history/<date>-<slug>.md)`.
- `src/shell.ts` — `command()` throws on non-zero, `run()` returns `Result`.

## 4. Change list and interfaces

New file `src/lessons.ts`:

```ts
// stems look like 'learnings/history/2026-09-10-review-by-reading' (no .md)
export async function retiredHistoryStems(cwd: string, base: string, head: string): Promise<string[]>
export async function retiredLessonsPresent(cwd: string, base: string, head: string): Promise<string[]>
export async function removeRetiredLessons(cwd: string, base: string, head: string): Promise<string[]>
```

- `retiredHistoryStems`: `git diff --unified=0 <base>..<head> -- 'learnings/history'`, parse `^\+Applied` added lines, return the changed file paths minus the `.md` suffix. Unique, sorted.
- `retiredLessonsPresent`: `git show <head>:learnings/LESSONS.md` (missing file → `[]`), keep stems whose stem string appears in the file content; return them.
- `removeRetiredLessons`: read `learnings/LESSONS.md` in `cwd` (missing → `[]`), drop every line containing a retired stem, write back only when lines were dropped, return removed stems. Pure line filter; do not parse markdown.

`src/batch.ts` `buildStack`: after the final tip is computed (both empty-range and rebased paths, after the holder rebase completes), call `removeRetiredLessons(dir, builtOn, 'HEAD')`; when the returned array is non-empty, `git add learnings/LESSONS.md` and `git commit -m 'lessons: retire applied lines'`, then use that new HEAD as `tip`/`top`. Member `tips` stay as today (their own rebase output). The empty-range fast path (`item.base === item.head` continues) is unchanged.

`src/phase.ts` `batchCheck`: after the existing per-mode guards, run `retiredLessonsPresent(worktree, record.built_on, head)`; on a non-empty result throw `Retired lesson lines present in push range: <stems>` (wording at implementer's judgment, must name stems). This applies to BOTH the `record.solo === true` branch and the applied-stack branch — place the call after both branches' checks so it runs for either, using `record.built_on` as base for solo, and `record.built_on` for stack too (the recorded build base covers the whole pushed range).

Tests — extend existing files (both need `Test-Change:` trailers on their commits):

`tests/batch.test.ts`:
- new fixture variant or inline setup creating `.gitattributes` (`learnings/LESSONS.md merge=union`), `learnings/LESSONS.md` with three lesson lines (retired-lesson-A, unaffected-B, plus room), `learnings/history/` files, committed and pushed to `origin/main`.
- A1 test: member (or holder) branch removes lesson-A's line and appends `Applied ...` to `history/a.md`; meanwhile `origin/main` advances adding a neighbouring line lesson-C. `buildStack` ⇒ `git show top:learnings/LESSONS.md` lacks lesson-A's line, contains B and C; `git log` shows a `lessons:` fixup commit as top; member tips unchanged.
- A2 test: same fixture, member adds no Applied entry ⇒ no fixup commit, identical result shape to today's tests.
- fail-first: run the A1 test BEFORE the `src/batch.ts` change and paste the red output into the worker report.

`tests/phase.test.ts`:
- A3: applied-stack path — build a batch record where the stack top still contains a retired line (stage it by constructing the record so `record.built_on..head` includes the Applied diff, e.g. build the stack with the union attribute but plant the line back, or drive the CLI through the real merge flow used by existing phase tests); `merged --slot B --check` exits non-zero naming the stem.
- A4: solo record (`batch.solo: true`, worktree HEAD rebased with a resurrected retired line) ⇒ same refusal; remove the line, commit, retry ⇒ pass.

## 5. Do-not, reasons and exceptions

- Do not edit `skills/` or `docs/` — U2/U3 own them.
- Do not add a `--check` write path or auto-fix in `phase.ts` — refusal only; B (or buildStack) fixes.
- Do not change `buildStack`'s signature or the `tips` map semantics — callers in `next.ts`/`phase.ts` rely on them.
- Do not weaken `equalOutsideRecordFolders` — `learnings/` exclusion already makes `reuse` correct.
- Do not touch `learnings/LESSONS.md` real content (U3 owns the header line).
- A mismatch with plan.md interfaces or scale beyond ~4 files / 30 turns returns to A with evidence, not a scope change; exception is a revised brief from A.

## 6. Ordered steps

1. Write `src/lessons.ts` (no behaviour wired yet).
2. Write the A1/A2 `buildStack` tests with the union-attribute fixture; run A1, paste red output.
3. Implement the `buildStack` fixup; rerun A1/A2 green.
4. Write A3/A4 `batchCheck` tests; run red if the guard is absent, then implement the `phase.ts` guard, rerun green.
5. Run the brief's changed-tests command; also run `bun test tests/batch-merge.test.ts tests/merge-attempts.test.ts tests/hold.test.ts tests/culprit.test.ts` since they exercise `buildStack`.
6. `bun run typecheck`.

Advisory size: ~4 files + 2 test files, under 40 turns.

## 7. Commands

```
AKROGON_BASE=2d9becac4365ec4a1079853364d561d90e356b5e
bun test --changed="$AKROGON_BASE" --timeout=30000
```
Run from the worktree. Also the named test files in step 5.

## 8. Done-when, evidence and report

All acceptance criteria green, fail-first red output recorded, changed-files list, every command run with pasted tail output, commits listed with SHAs. Commit(s) changing `tests/batch.test.ts` or `tests/phase.test.ts` carry `Test-Change: <path> <added case; no existing expectation changed>` trailers.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
