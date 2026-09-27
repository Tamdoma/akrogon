# Merged map: parallel implement units (#31)

Attribution: (A) chart seat, (B) slot-b codex, (C) slot-c fable-5-1 medium.

## Baseline
- The parent seat spends nearly all of implement in `subagent_wait`, one child at a time (A, B, C). Children run `swe-2-max`, not the Muse parent (B).
- Saving estimates differ. B counts units that pair after their prerequisites: about 42 of 214 minutes on content-batch units 1-7 and 14 minutes on plan-script 5/6, and calls a "halve implement" claim unjustified. C simulates a dependency graph from brief references and paths: cap 2 gives 392→200, 368→238 and 299→172 minutes on three leaves (35-49%), and cap 4 adds little. A's earlier "about half" is withdrawn in favor of these two.
- Independence is common but unproven. 173 of 217 unit pairs share no listed path and cite no earlier unit (C). At least 8 of 23 sampled units have a partner (B). Section-4 paths are incomplete, so they are a hint, not proof (B, C).
- Hidden coupling appears even with serial workers: content-batch unit 13 fixes "between-unit integration defects" after units 4-6, and plan-script needed repair briefs 12-14 (A, C).
- pi-extensions: `manager.ts:327-331` throws for any concurrency other than 1. `subagent_wait` takes an id list and `cwd` is per spawn (A, B, C). A spawn cwd outside the parent root needs UI confirmation and throws without UI (`tools.ts:95-100`) (A). Seeded as Tamdoma/pi-extensions#4 (A).

## Practitioners
- Cognition (2026-04-22): writes stay single-threaded, and parallel writers make conflicting implicit decisions (A, C).
- Claude Code worktrees doc: one worktree per parallel agent, merged back one at a time (A, C). Xu et al. (arXiv:2607.04697): cross-agent PRs conflict 41.7% vs 19.8% (C). Cursor (Wilson Lin) and Anthropic (Carlini, 16 agents on a C compiler) need separable work and strong verification (B).
- Agreement: isolated checkouts, a small cap, explicit ownership, serial merge, strong tests (A, B, C).

## Agreed direction (A, B, C)
- Each parallel worker gets its own git worktree cut from the lane head. B merges results back one at a time and reruns changed tests on the lane. The full suite after the last unit stays unchanged.
- The cap is a fixed 2, not a knob (B, C; A said 2-3).
- The pi-extensions change is only "allow 2". Isolation lives in akrogon.
- No mechanical scheduler port from `packet-parallel-policy.ts`.

## Open questions
- Q1: how independence is recorded. Either the plan lists per unit `after:` and owned paths (C), each brief records predecessors and ownership (B), or B judges from the plan and briefs with no new field (A).
- Q2: merge-back mechanism. Either worker commits merged or cherry-picked (A, B) or a patch applied, where a conflict means a wrong path set and the unit reruns serially (C).
- Q3: where worker worktrees live, given `tools.ts:95-100` and `akrogon phase` refusing a dirty lane (A).

## Pitfalls
- A fresh worktree has no `node_modules` or `.env`. Measure the provisioning cost once (A, C).
- Orphaned worktrees after a crash (C). Two 16 KiB wait returns at once in the parent context (C).
- Shared `package.json`, lockfiles and `test/` fixtures (C).
