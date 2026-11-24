**Recommendation: take O1 upgraded from `--scope` to a transient `.service` (or `akrogon run-check`); no code change for orphan children.**

1. **Why O1 — with a critical `.service` fix:**
   - O1 as written (`systemd-run --user --scope`) has **no `MainPID`**: if a helper or tool timeout kills `bun` by PID instead of running `systemctl --user stop`, the scope stays active and orphan children still spin.
   - Use a transient **`.service`** instead: `systemd-run --user --wait --pipe --collect --slice=akrogon-test.slice -p TimeoutStopSec=5 -- bun test ...` (or `akrogon run-check`, which pairs its scope with `startRunGuard` at `src/scope.ts:92-116`). With `KillMode=control-group`, systemd automatically reaps every child and grandchild (`bun -e`, `sleep 600`, `hc` daemons) within 5 s the instant `bun` exits or is `SIGKILL`ed — matching `akrogon verify` (`src/verify.ts:928`) with zero code changes.
   - Reject O2 (parent timer dies with `bun`), O3 (invasive across scripts, misses grandchildren/`hc` daemons), and O4 (`systemd-run --scope` cannot adopt an existing PID without D-Bus `StartTransientUnit`, a `.scope` still needs a per-run guard service on every `bun test`, and it adds overhead/nesting inside `verify`).

2. **Simpler/native alternatives checked:**
   - No `bunfig.toml` setting exists for kernel child-tree cleanup on `SIGKILL` (`tests/isolation.ts:24,27,135` already sets `PR_SET_CHILD_SUBREAPER`, which `bun test` skips on exit and `SIGKILL` bypasses).
   - `prctl(PR_SET_PDEATHSIG)` is not viable: cleared on `fork()`, `Bun.spawn` has no `preexec` hook, Linux ties it to the spawning *thread* (footgun under Bun worker threads), and it misses grandchildren.

3. **`akrogon-retry-*` leaked slices (Q3): NO — keep the separate code fix.**
   - `tests/hc-fixture-retry.test.ts:40-54` creates `akrogon-retry-${core.session}.slice` as a **sibling systemd slice** outside the runner's cgroup (and writes `core/slices` *after* creating the slice at `:54`). Stopping a runner's `.service`/`.scope` (even `akrogon verify`) never stops sibling slices; that must be fixed in test/fixture code (record `core/slices` before `systemd-run` so `sweepAbandoned` covers kills in that window).

**Main risk:** compliance — O1 is a rule in `tests/AREA.md` and stress/helper prompts, not enforced inside `bun test`, so an unboxed ad-hoc `bun test` killed by PID can still leak a child until someone notices or runs the boxed form.
