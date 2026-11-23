# Slot D review

Verdict `fix`

Base `9c6ae0db739efcde19edff0d1b173da0ab7b234d`  
Head `e1d610ad306a33f4a09c83bd7f75ab70814734ea`

- **F1 · `src/land.ts:40`** The land service has no `--setenv=NODE_DISABLE_COMPILE_CACHE=1`. The captured `launchLand` arguments confirm it. A green land runs `git push` directly from the service (`src/land.ts:271`, `src/phase.ts:778`), so a Node-based pre-push hook can still write a cache. An isolated push using that command created `node-compile-cache` with the flag absent. The same hook reported caching disabled with the flag set to `1`.
- **F2 · `src/verify.ts:901`** The verify-pass service has no fixed cache setting. It checks out the worktree before the first `checkedRun` (`src/verify.ts:678`, `src/next.ts:266`). In a fresh `verify --holder` with the caller flag unset, a Node-based post-checkout hook enabled caching and created the cache directory. The configured check in the same pass saw `1` and reported caching disabled. A fixed land service setting alone would still leave the separately launched verify service exposed.
- **F3 · `src/run-check.ts:72`** The `env` and `pass_env` copy can overwrite the fixed value. With the accepted repo config `pass_env: [NODE_DISABLE_COMPILE_CACHE]` and caller value `0`, a real `run-check --holder` child saw `0`. That breaks the required literal value `1`. Node 26 still disabled caching in that probe.

## Verification

Direct `run-check` reaches `checkedRun` at `src/run-check.ts:222`. Land calls `verify` at `src/land.ts:211`. Verify's setup, checks and parallel merge checks call `checkedRun` at `src/verify.ts:680`, `:711` and `:739`. Those commands share `constructedEnv` at `src/run-check.ts:333`, so they get the default without either removed forwarding entry. F1 and F2 cover commands that run outside that path.

`env -u NODE_DISABLE_COMPILE_CACHE bun test tests/run-check.test.ts` passed all 34 tests. With both changed source files restored to base in an isolated copy, the new test alone failed at `tests/run-check.test.ts:223`, receiving `cache=` and expecting `cache=1`. The `Test-Change` trailer matches the diff. The test adds one case for #148 K1 and preserves every existing assertion.
