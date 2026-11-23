# Slot D review of run-ram, round 2

**Verdict `fix`**

Base `c689573b23b0adfd543783719673ab32c5c11424`  
Head `c7d6c7396552fcf2fa1731ad2aac7be87de3551f`

## Finding

- **F8 · `src/scope.ts:82`.** The new permission pass starts a `chmod` process per directory, including directories that already have owner `rwx`. A real check created 40,250 scratch directories with 250 populated parents at mode `0555` and exited `0`. The guard hit its five-second timeout, then `rm` logged permission errors and left 152 parent trees behind. The CLI still returned `0`. The same fixture cleaned up on the round 1 guard in 0.64 seconds. In a disposable copy, adding `! -perm -u=rwx` before `-exec` cleaned it in 0.69 seconds and passed the new F6 test. A single top-down permission walk would also avoid one process per directory when many directories need changes.

## Re-check

- **F4 closed.** The CLI refused the original retired-root alias before creating missing parents or starting the check. I also confirmed refusal when the alias path included `..`. The new config test covers aliases into both excluded roots.
- **F6 closed for the original cases.** A real check created a populated `000` directory under a `0600` parent. The guard removed the tree and preserved the outside hard link’s `0444` mode and contents. F8 covers the new cleanup timeout.
- **F7 closed.** With `pass_env: [AKROGON_CAPTURES]` and inherited `[]`, both disk and RAM checks received their own capture entry for the same owner. Each Bun cache path matched its check’s `TMPDIR`.

All 231 tests passed across `run-units`, `config`, `reconcile`, `run-check` and `verify` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. All three new regression tests failed with the round 1 production source in a disposable worktree.
