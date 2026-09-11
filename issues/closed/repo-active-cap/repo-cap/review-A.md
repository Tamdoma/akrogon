# Review A: repo-cap

Phase: check.review, round 0. Reviewed the full diff of worktree `issues/worktrees/repo-cap` (branch `repo-cap`, commit `fc1a64b`) against base `c090787a05e86d1a32418e21b5b10161fd501efc`, independently of review-B.md. Debate is `no` in state.yaml, so no positions or rebuttals exist.

## Checks run

```text
$ bun run format        exit 0 (all files unchanged)
$ bun run typecheck     exit 0
$ bun test tests/config.test.ts tests/next.test.ts   79 pass, 0 fail   exit 0
```

Evidence: `evidence/cli-verification.log` under this leaf records the full `bun test` run, 215 pass, 0 fail.

## Done-criteria

| # | Criterion | Result | Evidence |
| --- | --- | --- | --- |
| 1 | repoSchema accepts optional positive-integer `max_active`, rejects 0/negatives/non-integers | met | `src/config.ts` line 32 `z.number().int().positive().optional()`; `tests/config.test.ts` loops `[0, -1, 1.5]` asserting nonzero `akrogon config` exit |
| 2 | global 3, repo cap 1, three eligible leaves: one tab in capped repo, uncapped repo fills remaining seats | met | `tests/next.test.ts` "per-repo capacity leaves uncapped repos to fill the global ceiling": 1 `a-*` tab, 2 `b-*` tabs |
| 3 | global 1, repo cap 2: one tab opens | met | "global capacity still limits a repo with a larger repo cap" |
| 4 | leaf with existing tab never refused by repo cap | met | "repo capacity bypasses existing tabs and refuses a second tab-less leaf": leaf one re-prompts on live tab, leaf two gets no tab/worktree |
| 5 | unreadable inventory charges repo cap as leaves + unreadable, no mark-full | met | "unreadable state reserves its repo capacity and reports its path": cap 3 with charge 3 opens 0 tabs; cap 4 opens 2, proving additive charge not saturation |
| 6 | `akrogon config` prints `repo_max_active` when set, omits otherwise, global `max_active` still prints | met | `effectiveConfig` destructures `max_active` out and re-emits as `repo_max_active`; test asserts presence, absence, and `max_active: 3` |
| 7 | six guide pages state ceiling plus optional repo share; setup.html shows the key | met | install/limits/next/in-practice/cheat/setup diffs all present and accurate |
| 8 | format, typecheck, test pass | met | rerun above |

## Code review notes

- `activeCount` computes each repo's contribution once and adds to both `total` and `perRepo` — exactly D2's "one expression per repo, no new branch". `inventory.unknown` contributes `global.max_active` to the repo's own count, matching the locked "same rule as the machine count" resolution.
- `allocate` keeps the `matches.length === 0` precondition, then refuses on `total >= global.max_active` or repo count reaching `repo.config.max_active` — the design's literal rule.
- `registered.unknown` sets `total` to the global cap without touching `perRepo`; correct, since total saturation already refuses every allocation.
- `?? 0` on `perRepo.get(repo.name)` is unreachable (allocate's repo is always registered and therefore always in the map) but harmless.
- Formatting churn in `allocate` (placement array, `.tab` line) is prettier output, verified by `bun run format` reporting all files unchanged.
- No AREA.md files in the diff; the AREA path check does not apply.
- Report gap: worker 2 exhausted its turn budget after doc edits; B verified the diff and reran changed tests. Not material to correctness.
- R1 (stale `max_active: 0` pause advice in in-practice/cheat) and R2 (ceiling not reservation) stand as plan limitations; correctly reported, not fixed.

## Findings

None.

## Verdict

ready

## Merge evidence

Rebase onto `origin/main` (`c090787`): already up to date, no conflicts. `AKROGON_BASE` unchanged at `c090787a05e86d1a32418e21b5b10161fd501efc`.

```text
$ bun run format        exit 0
$ bun run typecheck     exit 0
$ bun test              215 pass, 0 fail   exit 0
$ bun test --changed=$AKROGON_BASE   158 pass, 0 fail   exit 0
```
