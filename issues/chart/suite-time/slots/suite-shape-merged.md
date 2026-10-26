# Suite shape: merged notes (A, B, C)

Sources: slots/suite-shape-B.md, suite-shape-C.md, suite-shape-addendum-B.md, suite-shape-addendum-C.md, A's measurements (scratch logs, 2026-10-25, bun 1.4.4, 32 cores).

## Measurements

| Run | Who | Load at start | Wall | Result |
| --- | --- | --- | --- | --- |
| serial `bun test --timeout=30000` | A | 0.7 | 187.6 s | 1167 pass. CPU 985 s user, 369 s sys |
| serial | B | 19 | 201.0 s | 1167 pass |
| serial | C | ~3 runnable | 198.3 s | 1167 pass |
| `--parallel=2` (isolate) | B | 19, rose to 45 | 166.8 s | 2 fail: isolation homedir, peer-wait 300 ms budget |
| `--parallel=4` (isolate) | A | 10 | 82.0 s | 1 fail: isolation homedir. CPU 1087 s user, 384 s sys |
| `--parallel=4` (isolate) | C | 19, rose to 64 | 140.7 s | 4 fail: isolation homedir, 3 test timeouts |
| `--parallel=4 --no-isolate` | C | 0.9 | 86.3 s | 1167 pass, same expect count |
| `--parallel=8` (isolate) | A | 28 | 77.4 s | 1 fail: isolation homedir |
| `--parallel` (32 workers, isolate) | A | 39 | 77.2 s | 15 fail, mostly 15 s timeouts |

- The homedir failure appears in every isolate run and in no `--no-isolate` run. Under isolate the preload tests/isolation.ts runs once per file and makes a new scratch folder, while the process home stays on the first one (A, B, C).
- `--no-isolate` keeps one global per worker across its files. Today's serial run keeps one global across all files, so it adds no new sharing class (A).
- Bun has no bunfig key for parallel (A, B, C: docs, help, binary strings).

## Where time and CPU go (systemic view)

- The runner itself uses almost no CPU. The cost is the processes the tests start: the akrogon CLI, git, and the fake herdr/gh/systemctl, each a fresh process (A, B, C).
- tests/next.test.ts: about 14,000 git calls, 82% made by akrogon `next` itself, not by test setup. Top: `rev-parse --git-common-dir` 1,389, `rev-parse HEAD` 1,093, `rev-parse --verify` 1,006 (A, shim log). Same shape in tests/phase.test.ts: 3,057 git spawns (C).
- tests/peer-wait.test.ts: 23 s wall but about 200 CPU-seconds, mostly the fake herdr relaunched in polling loops inside the 11 s budgets (B). So O1a also cuts CPU, not only idle wall time (A).
- Prebuilding the fake herdr with `bun build --bytecode` cut its per-call CPU about 49% and the named-target test 20% in wall (B, one pair). C measured `--compile` binaries and saw no startup gain (C).
- Fixture setup (8-10 git calls per fixture) is noticeable, not dominant: 13.8 ms median per fixture (C).
- /tmp is tmpfs, so disk is not a cost (C).

## Options

- P1 `--parallel=4 --no-isolate` in `checks.test` (issues/config.yaml) plus O1b and O1a; drop O1c (A). Reason: parallel removes the serial-file class and alone measured 56% faster; O1b shortens the longest file, which sets the floor under parallel; O1a cuts real CPU; O1c's 10 s wait is idle and hides behind other files under parallel, and its seam risks a production knob. Cost: more peak load per suite; about 10% more CPU in A's isolate run.
- P2 Trim first (O1a, O1b, O1c), then `--parallel=4 --no-isolate` (C). Three-stage measurement against the original baseline. Cost: O1c seam still unsolved.
- P3 Trim only (O1a, O1b, O1c) plus a prebuilt fake herdr in the preload; no file parallelism yet (B). Reason: B's parallel run missed 20% with failures. Cost: the trim estimate of 19-23% straddles the target; prebuild measured on one test only.
- Runner replacement (Vitest, node test), runtime or language rewrite, `--compile` binaries, in-process CLI calls, a daemon: rejected (A, B, C). They leave the spawned process tree in place, or trade away the process-boundary coverage.
- Default worker count (32): rejected (A, B, C).

## Pitfalls and what removes them

- Isolate breaks the suite scratch setup: use `--no-isolate`, matching today's one-global behavior (A, C).
- Load: suites from several leaves overlap on this host; timeouts appeared at 4 workers under load 19-64 (C) and 32 workers (A). Removed by a capped worker count and a done-criterion run with several suites at once, the same proof shape the 2026-10-02 suite-speed lock used (C, A).
- Noisy comparisons: paired runs at recorded load, same test and expect counts (A, B, C).
- Hand runs differ from the check: seats running plain `bun test` get serial files. Judge proof by the exact `checks.test` command (C).
- Receipts key on command text, so the first runs after the change are all fresh (C).
- Shortened peer-wait budgets can pass for the wrong reason: keep outcome and signal assertions (A, B, C).
- A faster fake can poll more times inside the same budget: measure CPU and wall (B).

## Open questions

- Is the 20% judged on a quiet host, under normal fleet load, or both (C)?
- Should akrogon's own repeated git calls, and the prebuilt fake, be charted now as CPU work (B Q5, C X1/X2)?
- Should the check also use `--timings` so slow files start first (C)?

## Where slots differ

- B rejects parallel on its loaded `--parallel=2` isolate run. A and C measured 4 workers at 56% faster, green under `--no-isolate`.
- O1c: A drops it, C keeps it first, B keeps it only with a proven test boundary.
- B puts the prebuilt fake in this leaf. A and C keep this leaf to the check command and test files.
