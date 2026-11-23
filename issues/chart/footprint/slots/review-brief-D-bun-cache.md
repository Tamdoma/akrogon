# Review brief: bun-run-cache (slot D)

Decision: A1 from slots/bun-cache-{B,C,D}.md (all three picked per-run; seats unchanged for now, measure growth after a day per B).
Worktree /home/ivan/.akrogon/worktrees/akrogon/bun-run-cache, one commit 09b4ef30 on origin/main b9fe5027.
constructedEnv (src/run-check.ts) sets BUN_RUNTIME_TRANSPILER_CACHE_PATH = join(runRoot, 'bun-cache') after the env/pass_env loop. Test: allowlist adds the name; compile-cache test asserts the Bun path sits in the run's TMPDIR, also when pass_env forwards '0' (proven: pointing it elsewhere fails the test).
Not done on purpose: no special removal of bun-cache in a kept publish-refused root (the whole root is kept by design; ~2 MB).
Check: correct, nothing breaks (nested run-check, verify-pass children, framework checks), test proves it. Verdict ready or fix.
