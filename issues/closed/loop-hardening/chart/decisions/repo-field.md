# Does state.repo stay enforced?

## Question
Keep or drop the check that a leaf's `repo` equals the registered key?

### Carries
`src/state.ts:58`, `src/status.ts:48`, `src/init.ts:28`.

## Findings
(B) reproduced: a directory move with a stable key and updated path works; only a key rename breaks. (B) the check rejects a leaf copied from another registered repo, so it guards something. (A) proposed dropping; withdrawn. (B) a recorded worktree also breaks after a repo-root or worktree-root change.

## Resolution
Operator 2026-09-11: `7a`. The registration key is persistent identity; the path may change independently. A mismatch reports which key the leaf carries and which is registered instead of `Leaf repo mismatch`. A recorded worktree whose expected path changed reports the two paths and how to relocate. No rename command. Foreclosed: dropping enforcement.
