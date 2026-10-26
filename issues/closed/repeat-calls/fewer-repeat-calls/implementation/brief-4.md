# Sub-brief 4 (unit U4): drop self-update's dead HEAD read

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u4`
Leaf: `/home/ivan/Work/infra/akrogon/issues/open/repeat-calls/fewer-repeat-calls`

## 1. Goal

Remove a duplicate `git rev-parse HEAD` inside one decision (plan decision D4, criterion 3): `gitStage` in `src/self-update.ts` reads HEAD at line ~57 into `local`, a variable nothing consumes, then reads it again as `preLocal`.

## 2. Numbered acceptance criteria

1. `src/self-update.ts` `gitStage`: the `const local: string = await command(['git', 'rev-parse', 'HEAD'], root);` line is gone; `preLocal` keeps its read and is used as today.
2. No other change in the file; `bun run typecheck` clean.

## 3. Read-first list

- `src/self-update.ts` `gitStage` (~lines 42–150)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `src/self-update.ts` only: delete the unused `local` binding.
- Owned paths: `src/self-update.ts`. No prerequisite; no shared test resource.

## 5. Do-not, reasons and exceptions

- Do not touch any other read or file — `preLocal`, the `--verify`, `rev-list`, fetch and integrate reads all stay; the exception is a revised brief.
- Do not write or edit tests — a red planned test is a mismatch returned to A.
- On any conflict with this brief, return a mismatch with evidence instead of widening scope; the exception is a revised brief from A authorizing the change.

Restated: one deleted binding in one file; nothing else; conflicts come back as a mismatch, resolved only by a revised brief.

## 6. Ordered steps

1. Delete the dead `local` read.
2. `bun run typecheck`.
3. Run the git-shim case in section 7 and record which assertions are green: `rev-parse HEAD` count at root must be 1 and `remote get-url origin` must be 1; the `rev-parse --git-common-dir` assertions stay red here (they need U2's `ensureWorktree` swap — expected, not a mismatch).
4. Commit with message `self-update: drop the duplicate HEAD read` and return the sha.

Advisory size: 1 file, under 6 turns.

## 7. Commands

Run from the worktree:

- `akrogon run-check --holder /home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u4 --name u4-typecheck -- bun run typecheck`
- `akrogon run-check --holder /home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u4 --name u4-git -- bun test tests/next.test.ts --timeout=30000 -t 'registered root'`

`u4-git` exits nonzero while `common-dir` asserts 4 vs 1 — expected on this worktree; report the test's own output for the HEAD and get-url assertions (they must be 1 each).

## 8. Done-when, evidence and report

The binding is gone, typecheck green, HEAD/get-url counts verified. Report with these four lines filled:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
