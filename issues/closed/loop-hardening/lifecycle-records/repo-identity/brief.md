# Brief: repo-identity

## What
The registration key stays enforced. A leaf whose `repo` differs from the registered key fails with a message naming the leaf path, the stored key and the registered key. A recorded worktree whose expected path changed fails with both paths and the instruction to move the worktree or restore the root.

## Why
`Leaf repo mismatch` and `Worktree path mismatch` give no way to recover after a key rename or a repo or worktree root move (#8).

## Done-criteria
1. `bun test tests/next.test.ts` and `tests/status.test.ts` pass with new cases: a leaf with `repo: other` fails naming path, `other` and the registered key in `status`, `next` and `phase`; a leaf with a recorded worktree under an old root fails naming both paths; a directory move with the same key and updated registration path still works.
2. README gains one paragraph under configuration stating that the registration key is persistent identity and the path may change.
3. `bun run format`, `bun run typecheck`, `bun test` pass.
