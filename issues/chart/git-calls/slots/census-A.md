# Census A, 2026-10-26, origin/main 02dc5f91

Method: scratch worktree with logging shims (PATH wrapper for git tagged by caller via the parent's cmdline; wrappers in place of the fake herdr and fake busctl links in tests/helpers.ts `fakeHerdr()`; wall time per `cli()` call). Quiet host, load under 1 at start. Scratch only, discarded.

## Full suite, `bun test --timeout=30000 --parallel=4 --no-isolate`

wall 60.9 s, user 806.5 s, sys 380.1 s, 1175 pass.

| Kind | Calls | Summed wall |
| --- | --- | --- |
| git from akrogon CLI | 29,119 | 116.3 s |
| fake herdr (bytecode bundle) | 17,729 | 491.9 s |
| git from test code | 13,270 | 70.9 s |
| akrogon CLI runs via `cli()` | 2,029 | 1,168.2 s (next 984 runs 937.4 s; phase 367 103.2 s) |
| fake busctl (`bun fake-busctl.ts` from source) | 938 | 33.8 s |

herdr by subcommand: pane list 4,768; pane process-info 3,741; workspace list 2,503; pane get 1,848; tab list 1,510; agent prompt 588; agent start 526.

git from akrogon by subcommand: rev-parse --git-common-dir 4,337; rev-parse HEAD 2,772; rev-parse --verify --quiet 1,949; worktree list --porcelain 1,658; check-ignore -q .env 1,383; remote get-url origin 1,268; fetch origin main 1,181; rev-parse --git-path akrogon-base-runs.lock 1,090; merge-base HEAD refs/remotes/origin/main 1,070; symbolic-ref --short HEAD 1,040.

## One test: "a leaf re-entering merge queues behind the two leaves stamped earlier"

14 akrogon runs (6 next, 8 phase), 4,187 ms summed wall. Inside them: 190 herdr calls 2,224 ms (pane list 57, pane process-info 38, pane get 22, workspace list 20, tab list 18), 323 git calls 447 ms (rev-parse --git-common-dir 38, rev-parse HEAD 29, rev-parse --verify 25, check-ignore .env 16). Test-side git 14 calls.

## Per call on this host (quiet)

- real herdr `pane list`: about 2 ms wall.
- fake herdr bundle: about 10-12 ms wall, about 13 ms CPU.
- git rev-parse: about 1.1-1.4 ms wall.
- installed `akrogon config` (bun from source, releases/<sha>/src/akrogon.ts): about 45 ms wall; `bun src/akrogon.ts --help` about 20 ms.

Reading: per `next` in tests, fake herdr calls are about half of akrogon's wall time; git about 10%; the rest is bun start, module load and akrogon's own work. In production herdr is about 6x cheaper per call than the fake, so the call count matters less there but still runs about 30 herdr and 25 git spawns per `next`.
