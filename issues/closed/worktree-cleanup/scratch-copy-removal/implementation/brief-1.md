# Brief 1: reconcile removes scratch copies by owner state

Worktree: /home/ivan/.akrogon/worktrees/akrogon/scratch-copy-removal-u1

## 1. Goal

Implement plan.md decisions D1-D4, D6 and the reader half of D7 in `src/reconcile.ts`: `verify-*`, `batch-*` and `<slug>-u<N>` copies in the worktree store are scratch space removed by owner state with `git worktree remove --force`, behind the existing pane vetoes plus a new process veto.

## 2. Numbered acceptance criteria

1. `bun test --timeout=30000 tests/reconcile.test.ts` is fully green in your worktree (30 tests). The six new scratch tests are red on the base and must pass through your code, not through test edits — you write and edit no test.
2. `bun run typecheck` is clean.
3. The candidate loop keeps today's behavior for leaf-owned worktrees: a leaf slug resolves as the leaf itself before the `-u\d+$` worker pattern (`leafBySlug.get(name)` runs first), and leaf adoption paths are unchanged.
4. Exported owner helpers exist for the next unit: `export type Owner`, `export function readOwner(path: string): Owner | undefined`, `export function writeOwner(path: string): void` (atomic tmp+rename of `{ pid: process.pid, boot_id: currentBoot(), started: new Date().toISOString() }`), plus `export function processesInside(paths: string[]): Set<string>` (see D4 below). `ownerSchema` stays module-private or is exported — worker's choice; the helpers are the contract.

## 3. Read-first list

- `src/reconcile.ts` — the file you own; the candidate loop tail is the edit site.
- `src/verify.ts` — `VerifyRun` fields (`run`, `pid`, `boot_id`, `end`).
- `src/scope.ts` — `procRoot()` export you reuse for the process scan.
- `src/config.ts` — `within`, `worktreeStore`.
- `tests/reconcile.test.ts` — the green contract; read the new tests at the bottom and the edited `unconfirmed verify` test.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/reconcile.ts` only.

1. `removeWorktree(path, force: boolean)`: when `force` is true skip `worktreeRemovable` entirely and run `git worktree remove --force` (current code passes no `--force`; add it conditionally). All existing callers keep `force: false`.
2. Owner helpers, factored from the run-dir `.owner` loop: `ownerSchema`, `Owner`, `readOwner`, `writeOwner`. `readOwner` returns `undefined` on missing or unparsable file. The run-dir loop keeps its two distinct reasons: `!existsSync(ownerFile)` → `no .owner record`, `readOwner` undefined → `invalid .owner record`.
3. `processesInside(paths)`: one lazy pass-scoped scan — read `procRoot()`'s numeric entries owned by this uid (`statSync(entry).uid === process.getuid()`), resolve `cwd` and each `fd/*` symlink target, skip missing/unreadable entries and dead pids, and return the subset of `paths` that have a surviving pid inside (`within(target, path)`). Memoize it inside `reconcile` so the scan runs once per pass.
4. Candidate loop tail, after the existing leaf-handling blocks:
   - Worker owner: `const owner = leaf === undefined && /-u\d+$/.test(name) ? leafBySlug.get(name.replace(/-u\d+$/, '')) : undefined`. Non-merged non-failed owner → keep `active leaf worker` (unchanged).
   - `verify-*`: find the record by `run === name.slice('verify-'.length)`; keep `verify <run> in progress` only when `record.end === undefined && !ownerDead(record)`. Missing record or ended record or dead owner → force removal.
   - `batch-*`: `readOwner(`${path}.owner`)`; a parsed record with a live owner → silent keep (no `keep()` call). Absent, unparsable or dead-owner record → force removal. The `batchAttempts`/`state.batch` name guard is deleted (D6): `buildStack` mints `batch-<uuid>` unrelated to `state.batch.attempt`, and the owner record is the only guard.
   - Merged owner leaf → worker copy removed with `force`. Failed owner → today's guarded `removeWorktree` so `status` reports `unreachable commits` etc.
   - Then the shared live checks for every candidate reaching removal: `live === null` → `pane list unavailable`; `livePaneInside` → `live pane inside`; `processesInside` reports the path → `process <pid> inside` (pid list in the reason; the test asserts the spawned child's pid appears in `status`). Then `removeWorktree(path, force)`.
5. Orphan record sweep: iterate store entries that are files matching `batch-*.owner` whose copy directory is absent — remove the file when `readOwner` is undefined or the owner is dead; keep it when the owner is live (it may precede a copy still being created). No pane or process check needed for these files.
6. `reconcileNeedsPanes` needs no change (new candidates are directories it already covers; `.owner` files need no panes).

## 5. Do-not, reasons and exceptions

- Do not touch `worktreeRemovable`, the main leaf loop, `mergedWorktree`, `removeMergedWorktree`, `closeTab` or the run-dir loop beyond the `readOwner` refactor — leaf-owned worktree rules are unchanged, and a wrong move there breaks criterion 6.
- Do not delete branches or clear `state.worktree` for worker copies — `removeMergedWorktree`'s `git branch -d` is for the leaf's own worktree only (design).
- Do not edit tests — a red or wrong planned test is a mismatch returned to A, never a test fix.
- Do not add the process veto to leaf-owned worktree paths in the main loop — only the candidate loop.
- If an interface here cannot work as written, return a mismatch with the evidence and the smallest correction instead of changing scope.

Restated: leaf rules and records stay intact; scratch copies change only inside the candidate loop; return a mismatch rather than widening scope.

## 6. Ordered steps

1. Read `src/reconcile.ts`, the new tests in `tests/reconcile.test.ts`, and the `VerifyRun` schema. Run `bun install --frozen-lockfile` in your worktree.
2. Refactor owner helpers (`Owner`, `readOwner`, `writeOwner`) and use `readOwner` in the run-dir loop.
3. Add `processesInside` and the `force` parameter on `removeWorktree`.
4. Rewrite the candidate-loop tail per section 4.4 and add the orphan `.owner` sweep.
5. Run `bun test --timeout=30000 tests/reconcile.test.ts` — all 30 green; then `bun run typecheck`.

Advisory size: 1 file, under 12 turns.

## 7. Commands

- `bun test --timeout=30000 tests/reconcile.test.ts`
- `bun run typecheck`

## 8. Done-when, evidence and report

All 30 tests in `tests/reconcile.test.ts` green and typecheck clean, with the six new scratch tests passing through product code. Commit only `src/reconcile.ts` on top of the checked-out HEAD with a one-line conventional message (no trailer needed; you changed no test file) and report the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
