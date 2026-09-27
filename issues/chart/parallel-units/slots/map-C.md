# Map C: #31 parallel implement units

## Measured baseline

Parents spend nearly all implement time in `subagent_wait`, one child at a time. Child spans in minutes, from `~/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-<leaf>--/` (2026-09-26/27):

| Leaf | Units | Serial | Cap 2 | Cap 4 | Longest unit |
|---|---|---|---|---|---|
| content-batch | 13 | 392 | 200 | 139 | 52 |
| plan-script | 11+3 repair | 368 | 238 | 182 | 79 |
| satellite-build | 5+1 repair | 299 | 172 | 172 | 83 |

Cap columns simulate a dependency graph from earlier-unit references in briefs plus shared section-4 paths. Cap 2 saves 35-49%. Cap 4 adds little except on content-batch. Floor is the longest dependent chain.

Independence across 7 leaves, 51 briefs: 173 of 217 unit pairs share no listed path and cite no earlier unit; 33 of 44 adjacent pairs are disjoint. Plans already say so: `content-batch/plan.md:129` "No execution ordering", `plan-script/plan.md:293` "no execution wait", `satellite-build/plan.md:76` names one external dependency. Real dependence is an interface handoff: `content-batch/implementation/brief-9.md:21` "Unit 8 report (exact batch.reads keys)". 3 of 13 content-batch briefs cite an earlier unit, 0 of 14 plan-script briefs.

Hidden coupling still appeared: content-batch unit 13 "integration fixes after units 4-6", plan-script repair briefs 12-14. Section 4 paths are incomplete, so path sets are a hint, not proof.

## Practitioners (all read 2026-09-27)

- Cognition, cognition.com/blog/multi-agents-working (2026-04-22): "writes stay single-threaded"; parallel writers make conflicting implicit decisions. Their "map-reduce-and-manage" shape is what B already does.
- Xu et al. arXiv:2607.04697 via codex.danielvaughan.com (2026-07-28): cross-agent same-repo PRs conflict 41.7% vs 19.8% intra-agent; 84.4% of conflicts are in source. Defences: non-overlapping file sets, merge one at a time.
- Claude Code worktrees doc, code.claude.com/docs/en/worktrees: subagents get `isolation: worktree`, branch from HEAD, merge back sequentially. Same shape as `packet-scratch-worktree.ts:99-136`.
- dev.to/battyterm (2026-04-04), thedailydeveloper.substack.com (2026-02-24): 3-5 agents work with precise splits and test gates; vague splits cost 30-50% of time in conflicts.

Agreement: isolation, small cap, explicit file ownership. Disagreement: whether parallel writing pays at all. 35-49% here says yes.

## Forks

F1 Isolation. Recommend one scratch worktree per parallel child, patch merged back; a conflict is reported as a wrong path set, never resolved (`packet-scratch-worktree.ts:14-15`). A shared worktree races changed-test runs and git state.

F2 Who declares independence. Recommend the plan author: `skills/plan-issue/SKILL.md:57` already says "names a dependency only when execution actually requires ordering". Add per unit `after: none | <units>` and owned paths. Mechanical overlap (`packet-parallel-policy.ts:132`) is a guard, not the source, because section 4 paths are incomplete.

F3 Cap. Recommend fixed 2, as `packet-parallel-policy.ts:21`. Cap 4 gains 0-60 min on one leaf and raises the integration-fix rate.

F4 Extension change. `manager.ts:329` throws for value != 1; `subagent_wait` takes an id list (`tools.ts:188`); `cwd` is per spawn (`schemas.ts:14`). Recommend allowing 2 and nothing else there. Isolation stays in akrogon.

## Practitioner questions

Q1 Rerun changed tests on the lane after each merge-back, or trust the scratch run? Rerun.
Q2 Briefs written up front with `after:` edges, or per group after merge-back? Up front.
Q3 Scratch provisioning cost (node_modules, `.env`): measure once.

## Pitfalls

P1 Two children editing `package.json`, lockfiles or shared `test/` fixtures.
P2 Two 16 KiB wait returns at once in parent context (`README.md:89`).
P3 Scratch worktrees orphaned on parent crash.
P4 More integration-fix units; keep full-suite-then-repair.

## Ranked changes, simplest first

1. pi-extensions: accept concurrency 2 at `manager.ts:327-331`; scheduler untouched.
2. plan-issue: each checklist unit lists `after:` and owned paths.
3. implement-issue: replace "sequentially" (`SKILL.md:37`, `worker-protocol.md:11`) with groups of at most two units with no `after` edge and disjoint owned paths; each parallel child gets a scratch worktree from lane HEAD, patch-applied back one at a time, changed tests rerun on the lane.
4. Later, optional: mechanical overlap guard ported from `packet-parallel-policy.ts`.
