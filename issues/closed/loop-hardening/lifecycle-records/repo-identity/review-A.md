# Review A: repo-identity

Base: 352fe91da011147a51561ddbfc295d7d29e00c54
Reviewed head: cefbf1f (Explain repository identity and worktree path mismatches)
Debate: no, so no positions/rebuttal artifacts exist.

## Verdict: nits

## Verification

Run from the leaf worktree at cefbf1f:

- `bun run format`: exit 0, no files changed, `git status --short` empty.
- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 146 pass, 0 fail, 1438 assertions.
- Implementation evidence logs under `implementation/` match these results (red 67/5, green 72/0, full 146/0).

## Criteria

- C1: `RepoMismatchError` in `src/state.ts` carries leaf path, stored key and registered key. `allLeaves` (used by `findLeaf`, so `status <slug>` and `phase`), `status.scanRepo` and `next.discover` all throw it. Tests in status, phase and next assert nonzero exit, path plus both labeled keys, unchanged state bytes, empty log and no prompt/worktree. Met.
- C2: `scanRepo` catches the specific error type only; structured `{unreadable, path, error}` result preserved with `state.yaml` path. Test covers one mismatched and one healthy repo in the overview and `next --all` dispatching only the healthy leaf. Existing duplicate-slug test untouched. Met.
- C3: `ensureWorktree` order unchanged; message names recorded and expected absolute paths with move-or-restore guidance. Test parameterized over changed `worktree_root` and renamed repo root, asserting unchanged state, unchanged `git worktree list`, no new directory, no prompt, no tab. Met.
- C4: Real `renameSync` of the fixture root plus registration update under the same key. Status, phase and dispatch succeed and the worktree is created under the new root. Met.
- C5: README paragraph under Initialize a repository states persistent key identity, movable path and manual worktree reconciliation. Accurate against the code. Met.

Scope: seven files, all in the design's owned surfaces plus the `discover` check the plan explicitly authorized. No schema, policy or catch broadening. `src/next.ts:459` post-lock identity re-check keeps its generic message; it guards a mid-dispatch race, not the operator-facing mismatch, and is outside this leaf.

Tests exercise real CLI subprocesses with real Git and the existing fake Herdr transport. Assertions match content fragments (path, key names, recorded/expected/move/restore), not whole sentences.

## Nits

- N1: README paragraph uses a curly apostrophe in `leaf’s`; the rest of README uses straight apostrophes. Cosmetic consistency only.
- N2: `RepoMismatchError` does not set `this.name`, so a raw stack trace prints `Error:`. Every consumer reads `.message`, so nothing observable changes. Optional.

No Fix findings. No reusable lesson beyond existing entries.

## Merge

Rebased cleanly onto origin/main 2a759dd (one upstream commit, no conflicts). Head after rebase: a4f0b5d. AKROGON_BASE refreshed to 2a759dd9daf3c8f917b5723eabfd50bbca5f670e.

Checks in the worktree after rebase:
- `bun run format`: exit 0, tree clean.
- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 152 pass, 0 fail, 1505 assertions.
- `test_changed` (`bun test --changed=$AKROGON_BASE`): exit 0, 78 pass, 0 fail.

Nits N1 and N2 are cosmetic and not reusable lessons; no LESSONS entry added.
