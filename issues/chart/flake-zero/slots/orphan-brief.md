# Brief: test child processes that outlive a killed test runner

Context: overnight, PID 3733112 spun at 92% CPU for 9 hours. It was a `bun -e` child started by a test in tests/hc-identity.test.ts (`inProcess`, ~:308: `spawnCaptured(['bun','-e', script + 'process.exit(0)'])`, no timeout). It came from an intermediate, never-landed version of src/hc.ts in the delivery-flakes worktree. That version busy-looped once the fake `hc` dir was gone. Its parent was a `bun test` stress run that a helper killed, so the child was reparented to systemd --user and ran on.

Facts:
- On current main, the same script against a failing `hc` throws in about 4 ms of CPU, so there is no busy loop.
- `akrogon verify` runs the suite inside an `akrogon-verify-<id>` systemd service (src/verify.ts:928). Stopping verify kills every child, so the product path already contains this.
- The gap is ad-hoc `bun test` runs: the stress runs, the proof-of-zero runs and helper probes, started directly from a shell or agent. Many test files spawn children (`bun -e`, fake `hc` with `exec sleep 600`, hc daemons). hc daemons have their own sweep (tests/hc-fixture.ts stopCoresAfterFile and sweepAbandoned). Other children do not.
- A separate helper is fixing leaked `akrogon-retry-*` slices, which come from the same kind of killed run.

Options:
- O1: no code change. Make it a rule in tests/AREA.md and the stress workflow: run ad-hoc suites inside a scope with `systemd-run --user --scope --slice=akrogon-test.slice bun test ...`, and stop the scope instead of killing bun. That removes the whole class for every child type.
- O2: bound each `inProcess` child with `timeout: WAIT_MS` plus SIGKILL. Cheap, but this does not help when the parent dies, because Bun's timer dies with it.
- O3: children exit when their parent dies. Give them a stdin pipe and exit on EOF in each script, or have a wrapper do it. That changes many test scripts.
- O4: a test preload that puts the whole `bun test` process into its own transient scope on start, so any kill of the run can be cleaned up by stopping that scope. Needs a way to tie a scope to the runner.

Questions:
1. Which option removes the problem class with the fewest moving parts? Is O1 enough, given that verify already contains it, or is a code change worth it?
2. Is there a simpler or more native option (for example, a bunfig setting, or `prctl` PDEATHSIG through some existing path)?
3. Should the leaked-slice fix (`akrogon-retry-*`) follow the same answer?

Answer briefly with a recommendation and its main risk. Write it to slots/orphan-B.md or orphan-C.md in this folder.
