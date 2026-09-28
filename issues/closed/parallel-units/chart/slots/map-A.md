# Map A: parallel implement units (#31)

## Baseline (measured 2026-09-27)
- content-batch: workers started one after another from 02:05 to 06:57, with unit 9 still running. Unit 13 repairs "between-unit integration defects found after units 4-6" (`implementation/brief-13.md`), even with serial workers.
- plan-script: the briefs declare their own dependencies. 3, 5, 6 and 8 say "pure module, no dependency", 4 needs 3, 7 needs 1, and 11 needs 1-10. That gives waves {1,3,5,6,8} {2,4,7} {9} {10} {11}, so 5 steps instead of 11. If units take similar time, implement drops by about half. This is an estimate, not a measurement.
- akrogon already runs chunks in parallel at the leaf level. `max_active: 12` leaves each get their own worktree, seats, review and merge.
- pi-extensions: `manager.ts:289` sets `concurrency = 1` and `:328-330` throws on any other value. That lock came in with 52dd56a (2026-09-12) and no recorded reason. Children share the parent cwd with no sandbox (`README.md:78`).
- The old lifecycle (`packet-parallel-policy.ts`) allowed 2 at once, only with provably disjoint paths, with each child in a scratch worktree merged back as a patch. It is 300 lines plus a packet codec.

## Practitioners
- Cognition, Walden Yan ("Don't Build Multi-Agents", 2025-06, and "Multi-Agents: What's Actually Working", 2026-04-22, read 2026-09-27). Parallel writers make conflicting implicit decisions. Every setup that works for them keeps writes single-threaded.
- Anthropic, "How we built our multi-agent research system" (2025-06). Coding has fewer truly parallel parts than research.
- Claude Code docs, "Run parallel sessions with worktrees" (code.claude.com/docs/en/common-workflows, read 2026-09-27), plus worktree playbooks (MindStudio, Augment). Give each parallel agent its own git worktree, assign file ownership first, sequence shared files, and merge branches one at a time. Two to five agents is the practical range.
- Where they agree: parallel only with isolated checkouts and disjoint ownership, then a single-threaded merge. Cognition's warning is exactly the content-batch brief-13 defect.

## Forks
1. Where does parallelism live?
   - O1 (A recommends): inside implement. B runs a wave of units the plan marks independent at the same time, and each worker gets its own `git worktree` off the leaf head. B merges each worker commit back one at a time and reruns changed tests. There is one plan, one review and one design.
   - O2: at chart or plan time, as separate leaves. No new code. The cost is a plan, review and merge per leaf, binding decisions copied into each design, and no help for leaves whose units share decisions.
   - O3: shared worktree with disjoint files. Rejected. `test_changed` and formatters see each other's half-written files.
2. How does B know units are independent? A recommends that B reads the plan and briefs and runs serially when unsure, with no new plan field. The plan-script briefs already state their dependencies.
3. Cap: A recommends a fixed 2 or 3 in `tamdoma-subagents`, not a knob.
4. Repo order: a pi-extensions leaf (allow concurrency above 1) must merge before the akrogon skill leaf. The two repos can't express that dependency in `blocked-by`, so the operator orders the dispatch.

## Pitfalls
- A fresh worktree has no `node_modules`. The framework needs `bun install` per worker worktree (cost and time).
- Shared ports, fixtures and `.env` across workers.
- Integration defects move to merge time. B's full suite after the last wave stays mandatory.
- The worker protocol line "sequentially in one worktree" (`worker-protocol.md:11`) and the description line (`SKILL.md:3`) must change together.

## Ranked changes, simplest first
1. pi-extensions: allow concurrency 2-3 (remove the throw, fixed value).
2. akrogon implement skill: waves of independent units, a worktree per worker, serial merge-back by B.
