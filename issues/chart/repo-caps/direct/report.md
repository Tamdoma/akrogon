# Direct report: repo-caps

Worktree ~/.akrogon/worktrees/akrogon/repo-caps, branch repo-caps, base fdc5acdd, head 98b1c107d759574439912cc6243a0b42fb0bca98. Decision: INTAKE.md `## Taken`.

Done criteria and proofs (tests/pause-next.test.ts):
1. A repo's `max_active` refuses a new leaf while the machine cap has room; the start verb names `<repo> max_active <n> reached`; `akrogon config` shows machine `max_active` and `repo_max_active`. "a repo's max_active refuses a new leaf..."
2. A freed slot starts the longest capacity waiter across repos and skips one whose repo is at its cap. "a freed slot starts the longest capacity waiter across repos..."
3. Refill starts the oldest capacity waiter and never a leaf that was not refused. "a freed slot starts the leaf that has waited longest..."
Red before: all three fail with base src (A's run). Full suite: 1316 pass, 2 fail ("unpause relaunches closed seats with the current seat config", "a pack started during a live capture...") at load ~70 on 32 cores; both pass rerun alone.
Docs: docs/reference/config.md repo table, docs/use/run-work.md, docs/reference/limits.md, docs/use/park-pause-stop.md.

## Round 1 repair (review-E-1.md), head c8912617

- F1, F3: `resumeRepos` (src/next.ts) serves `--wake`, `--resume` and unpause: seated and merged leaves resume except capacity waiters, then `refill`.
- F2: a refused `akrogon seat` stays a manual failure; docs/use/run-work.md says only a `next` pass refusal waits on capacity.
- F4 and proofs: `bun test --timeout=30000 tests/pause-next.test.ts -t "restarted stopped|unpause refills"` fails 2 of 2 with src/next.ts from 98b1c107 and passes on c8912617; "visited later" fails with the refill sort removed and passes restored. tests/pause-next.test.ts: 25 pass. Docs: docs/reference/commands.md `next` row.

## Round 2 repair (review-E-2.md), head 0ee30c91a0157e87861171f8c0e2a30b3f78a7ae

- F5: `refill` reads every unpaused registered repo, whatever pass calls it.
- F2: a refused `akrogon seat <leaf> <slot>` without `--task` records the capacity wait; with `--task` it only fails (docs/use/run-work.md).
- Proof: `bun test --timeout=30000 tests/pause-next.test.ts -t "another repo's older waiter|refused at a cap without"` fails 2 of 2 with src/next.ts from c8912617 and passes 2 of 2 on 0ee30c91a0157e87861171f8c0e2a30b3f78a7ae.

## Round 3 repair (review-E-3.md), head 73d36b71757e334a765698f4956930799a827aed

- F6: the E-2 F2 change is removed. A refused `akrogon seat` only fails and records no wait; only `next` pass refusals join the refill. This narrows INTAKE `## Taken` ("leaf refused for capacity") to pass refusals: a seat request names one slot and task, which the refill's full dispatch cannot keep. Operator approved 2026-11-22 (INTAKE `## Taken` Q3). Proof: "a refused seat stays a manual failure and never joins the refill" passes.

## Read-once change (operator Q4 O1, 2026-11-22), head 436b5179bc15987f78e8ef64aab99eecc4774867

Rebased on 61b2d50b (#147). `resumeRepos` reads each unpaused repo's timings once (`capacityWaits`, one pass over events) and shares the map between the seated sweep and `refill`; `capacitySince` is gone. Behavior unchanged: `bun test --timeout=30000 tests/pause-next.test.ts tests/timing.test.ts` 34 pass. The landing verify on d691f0e1 had one red outside the diff (door-reset "agy: the reset helper runs its stages in order"); its retry was stopped for this change.
