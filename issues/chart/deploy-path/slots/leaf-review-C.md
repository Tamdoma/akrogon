# Leaf review, slot C: self-update

Disagreements only. Root is at origin/main.

F1. Trigger (a) keys on the committed move's `to`, but the call site has no phase. `phaseCommand` returns `{ repo, committed }` (src/akrogon.ts:65-77) and `mergeWake(global, repo)` takes none (src/next.ts:1287-1291); only `MoveCommittedError` carries `to` (src/phase.ts:122-131). The design's "Interface: no new ... field" reads as if the wiring exists. State that `phaseCommand`'s result gains the committed phase (internal, not config) and mergeWake or the finally block at src/akrogon.ts:81 keys on it, or the implementer guesses.

F2. "toolRoot pointed at it" in tests is not possible as written. `toolRoot` is `export const toolRoot = resolve(import.meta.dir, '..')` (src/config.ts:170), so the identity check `realpath(repo.root) == realpath(toolRoot)` can only be tested with a parameter on the step (default `toolRoot`). The design should name that parameter as the test seam, since "no new interface" otherwise forbids it.

F3. The install lock is not shared the way the design says. `git rev-parse --git-path akrogon-install.lock` resolves per worktree: root gives `.git/akrogon-install.lock`, a leaf worktree gives `.git/worktrees/<slug>/akrogon-install.lock` (ran both, 2026-10-10). So the step, run with cwd root, excludes only other self-update runs, not a seat's `setup` in its worktree (src/config.ts:256-260 wraps setup with that per-worktree path). That is enough for the step's purpose (two self-updates at once, mergeWake plus startup `next --all`), but the design text "existing shared akrogon-install.lock" and the lock-order argument should say root-scoped. Also there is no TypeScript helper for it; `withSetup` builds a shell string. Say whether the step shells out to `flock` or takes the file with its own lock routine.

F4. For trigger (b) the position of the step inside `nextCommand` is unstated. The `touched` merge passes run after the global lock block closes (src/next.ts:1558-1565), so "outside that hold" is satisfiable, but the design must say whether the step runs before the selection block (so the pass's own dispatch sees nothing new either way, the running process keeps loaded code) or after the touched loop. Pick before: the fetch and the `behind` line then precede any dispatch output, and criterion 8 has one place to print.

F5. The no-change output is undefined. Brief criterion 1 defines `deployed <old>..<new>`; nothing in brief or design says what prints when the root is already at the remote and install and links succeeded (shape3 had `akrogon current <sha>`; the Taken dropped it). "One printed line" needs that case or the implementer invents it.

F6. The real `bun install --frozen-lockfile` in tests: a clone of this repo needs the registry or bun's cache, so the suite goes network-dependent. Standing design asks for the cheapest sufficient test; a fixture repo with an empty `dependencies` and a matching `bun.lock` proves the step's install branch offline. Not a contradiction, but the design should not read as "clone the real repo".

No disagreement with criteria 2, 3, 5, 7, 9, the readiness proofs, state.yaml, or the correction to fetch plus `merge --ff-only`.
