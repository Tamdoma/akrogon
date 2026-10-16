# Map, slot A (2026-10-16)
- What must be proven: no process running akrogon code that resolves its state home as the tool root can write after the copy. Only akrogon processes write state; shells and agents with cwd in the root write nothing to `config.yaml`, `.lock`, `runs/` etc. unless they start an akrogon command, which is its own process.
- Pick O1: identify akrogon processes by what they execute: any argv entry that, resolved against that process's cwd with symlinks followed, lands inside the tool root (catches `bun ~/.local/bin/akrogon`, `bun src/akrogon.ts` from the root, absolute paths). Drop the cwd test. Cost: a process that loaded akrogon code through some other path (bun -e importing src/) and holds a long write is missed; the held tool-root `.lock` and slice locks cover commands that write under lock.
- O2: keep cwd test but exclude known agent and shell binaries. A list that rots.
- O3: operator-run one-time `akrogon home move` command that waits for live runs and moves. Adds a verb for a one-time step.
- O4: drop the process test entirely, rely on live run records plus the locks. Misses an old-code command between lock acquisitions.
- Pitfalls: a stale `bun -e "import ... './src/config.ts'"` presence-check (chart-issues) imports akrogon code by path; it reads only. Test pinning cwd (tests/state-home.test.ts:144) changes to an argv-based sentinel.
