# Brief 2: docs describe a merge turn as the holder alone

## 1. Goal

Plan D8 and brief criterion 6. The docs describe every merge turn as the holder alone: no members, member tips, stack snapshot, red-member skip or "stack red" ending. Behavior after the change:

- The command rebases only the holder onto the fetched remote base, in disposable state, and removes resurrected retired lesson lines as a fixup on the top. It moves the holder branch to the top and prompts the holder's B with `attempt=<id> top=<sha>`, or `attempt=<id> solo` when the holder cannot rebase mechanically.
- Waiting `merge` leaves are never touched by another leaf's turn. Each takes its own turn in merge-queue order.
- `merged --check` requires HEAD to descend from the recorded top. B may commit a mechanical repair past the top (the old "memberless repair" rule now always applies).
- `merged` pushes fast-forward once and moves the holder. A non-fast-forward refusal restacks only the holder and prints `rerun tested=<T1|none> pushed=<T2>` or `rerun rebase <slug> onto <sha>`.
- A red verify ends with `check.fix --slot B --attempt <id>`, which moves the holder to `check.fix`.
- Briefs to gather are only the holder's completion owner (its issue, or every leaf brief under its epic).
- A crash after a landed push is reconciled by candidate ancestry and moves the holder to `merged` once.

## 2. Acceptance criteria

1. `skills/merge-issue/SKILL.md`, `skills/check-issue/SKILL.md` and `src/AREA.md` contain no match for `/\bmembers?\b/i`, `stack red` or `stack top`.
2. `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/state.md` and `docs/guide/files.md` contain no `members=`, `stack red`, `restarts alone`, `member tip` or `member branch`. `files.md` may still say that old `merge-attempts.jsonl` lines carry `members`, written only before solo turns. `state.md` drops `members` from the batch field list.
3. These strings stay, because other tests require them:
   - In merge-issue: `akrogon verify --attempt <id> --known-red`, `akrogon log`, `akrogon run-check`, `akrogon verify`, `merged`, `fetch`, `push`, and the line starting `bun -e ` unchanged.
   - In check-issue: `akrogon run-check`, `akrogon log`, `akrogon verify --known-red`.
4. `src/AREA.md` stays at most 40 lines with its four sections.
5. The planned test `bun test --timeout=30000 tests/solo-turns.test.ts -t 'merge docs describe the holder alone'` passes. The other docs tests named in section 7 stay green.

You write and edit no test. If a planned test is wrong, return a mismatch.

## 3. Read first

- The seven doc files above. Find hits with `grep -n -i "member\|stack" <file>`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`. Deletion beats rewording: drop member-only sentences and keep each holder sentence that is already true.

## 4. Changes

- `merge-issue/SKILL.md`: the description line (no "stacked leaves"), the prompt line, the turn paragraph, "attempt top" (rename it, for example `### attempt top: the worktree is the rebased top`), the `--check` paragraph, the repair paragraph (no "With no recorded members"), the briefs and `merged` paragraph, the restack paragraph, and the Shared endings red ending (delete the members branch, so the leaf always moves to `check.fix`). "memberless" wording becomes plain.
- `check-issue/SKILL.md` line 93: "because merge verifies the stack top" becomes "because merge verifies the holder's rebased top".
- `src/AREA.md`: rewrite the `buildStack` bullet as the holder rebase onto the remote base plus the lesson fixup.
- `docs/guide/merge.md` (lines 7, 17, 19, 26, 28, 30, 52, 76), `docs/guide/next.md` (lines 137 and 157), `docs/guide/state.md` (line 52), `docs/guide/files.md` (line 64).

This unit owns only these 7 files. It has no prerequisite and no shared test resource.

## 5. Do-not

- Do not edit `src/*.ts`, tests or any other doc. Those belong to unit 1, are locked, or are out of scope. The exception is a revised brief from A.
- Do not invent new behavior or describe the deferred parallel next-leaf testing (4a). Docs must match the code after unit 1.
- Do not rewrite unrelated paragraphs. Keep the diff minimal.
- Return a mismatch instead of changing scope.

Reasons restated: unit 1 owns the code. Docs describe the current state only. Diffs stay minimal.

## 6. Steps

1. `bun install --frozen-lockfile` in your worktree.
2. Edit the two skills and `src/AREA.md` (criteria 1, 3 and 4), then the four guide files (criterion 2).
3. Run the section 7 commands.
4. Commit in one commit and return the id.

Advisory size: 7 files and under 25 turns.

## 7. Commands

Run each through `akrogon run-check --name <label> -- <cmd>`:
- `bun test --timeout=30000 tests/solo-turns.test.ts -t 'merge docs describe the holder alone'`
- `bun test --timeout=30000 tests/docs-links.test.ts tests/hold-retired.test.ts tests/log-reader.test.ts tests/lessons.test.ts tests/run-permit.test.ts`
- `bun test --timeout=30000 tests/run-units.test.ts -t 'run-check keeping rule'`

## 8. Report

Paste each `check <label>: <exit> <path>` line.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
