# Brief 2: buildStack writes a build owner record

Worktree: /home/ivan/.akrogon/worktrees/akrogon/scratch-copy-removal-u2

## 1. Goal

Implement plan.md decision D5 in `src/batch.ts`: `buildStack` writes a build owner record at `<copy>.owner` before the copy exists, so a reconcile pass never takes a running build's `batch-*` copy.

## 2. Numbered acceptance criteria

1. `bun test --timeout=30000 tests/batch.test.ts` is fully green (14 tests). The new owner-record test is red on the base and must pass through your code — you write and edit no test.
2. `bun run typecheck` is clean.
3. The record exists before `git worktree add` runs and is gone with the copy after `buildStack` returns, on both success and failure paths.

## 3. Read-first list

- `src/batch.ts` — `buildStack`; the copy is `resolve(worktreeStore(repo), 'batch-' + attemptId())`.
- `src/reconcile.ts` — exports `writeOwner(path: string): void` (atomic tmp+rename of `{ pid, boot_id, started }` in `ownerSchema` shape). Import it; do not duplicate the writer.
- `tests/batch.test.ts` — the `buildStack writes its owner record…` test shims `git` and asserts `<copy>.owner` exists when `worktree add` runs.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/batch.ts` only. Prerequisite landed: U1 exported `writeOwner` from `src/reconcile.ts`.

In `buildStack`:

```ts
const dir: string = resolve(worktreeStore(repo), 'batch-' + attemptId());
const owner: string = `${dir}.owner`;
writeOwner(owner);
try {
  await createSparseWorktree(repo, dir, builtOn, { detach: true });
  // …existing body…
} finally {
  await command(['git', 'worktree', 'remove', '--force', dir], repo.root);
  rmSync(owner, { force: true });
}
```

The record is removed after the copy so it still guards the copy during teardown. `rmSync` comes from `node:fs` (add to the existing import). Reconcile removes the record with the copy it guards; the orphaned-live-record window is reconcile's, not yours.

## 5. Do-not, reasons and exceptions

- Do not change `buildStack`'s rebase, member-stacking or lessons logic — only the owner record lifecycle.
- Do not write the record after `createSparseWorktree` or inside it — the contract is record-before-copy; the shim test exits 42 when the order breaks.
- Do not duplicate `writeOwner` or inline a second writer — reconcile's export is the single owner-record shape.
- Do not edit tests — a red or wrong planned test is a mismatch returned to A.
- If `writeOwner` is missing or unusable from `src/reconcile.ts`, return a mismatch; do not re-implement it.

Restated: one file, one record, one ordering; return a mismatch rather than duplicating or rescoping.

## 6. Ordered steps

1. Read `src/batch.ts` `buildStack`, `src/reconcile.ts`'s `writeOwner` export and the new test in `tests/batch.test.ts`. Run `bun install --frozen-lockfile` in your worktree.
2. Add the `writeOwner` call and the `finally` removal.
3. Run `bun test --timeout=30000 tests/batch.test.ts` — all green; then `bun run typecheck`.

Advisory size: 1 file, under 6 turns.

## 7. Commands

- `bun test --timeout=30000 tests/batch.test.ts`
- `bun run typecheck`

## 8. Done-when, evidence and report

All 14 tests green, typecheck clean. Commit only `src/batch.ts` on top of the checked-out HEAD with a one-line conventional message (no trailer; you changed no test file) and report the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
