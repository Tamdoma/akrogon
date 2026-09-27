# Review A: completion-dependents

Base: `1a21e22e0056a7e9d6b5e35a5a395b867847a844`
Reviewed head: `4ac0f7a65e16f47594a31bf2c53ce49236199f39`
Debate: no, so no positions/rebuttal artifacts exist or apply.

## Verification evidence

- `grep -n "sweepAll\|sweep(" src/next.ts`: `sweepAll` remains only at line 564 (definition) and line 695 (`--all` outside a repo). The three completion sites (targeted single, `tab_closed`, pane hook) call `dispatchDependents`. Matches brief done-criterion 1 exactly.
- `dispatchDependents` (src/next.ts:583) filters `discover(repo, invocation).leaves` on `state['blocked-by'].includes(completedSlug)` and passes the subset to existing `sweep`, which orders merged leaves first and routes each through `dispatchLeaf` with `explicit=false`. All gating (dependencies, capacity, `hand_built`, `failed`) stays in `dispatchLeaf`. `discover` covers open+closed, so a dependent whose blocker already moved to `issues/closed` is still selected (it is filtered on its own `blocked-by`, not on phase).
- Slug captured from `selection.leaves[0].state.slug` / `owners[0].leaf.state.slug` before `dispatchLeaf`, so the `issues/open -> issues/closed` move in `completeOwner` cannot lose it.
- Docs (AC5): `limits.md` line 9 now reads "Later manual `akrogon next` passes" and new bullet states "A completion starts only its dependents." `next.md` adds the dependents-only paragraph at line 40, the Manual dispatch paragraph states every other leaf waits for a manual `akrogon next`, and "later sweeps" became "later manual sweeps". The `Startup also runs a sweep` sentence at line 38 is untouched (confirmed against base).
- AREA.md: diff touches `src/` and `tests/`; both AREA.md files unchanged and neither enumerates `next.ts` internals, so no stale named paths. Guide and index docs checked: no claim contradicts the new behavior.
- Reran checks: `bun run format` clean, `bun run typecheck` clean, `bun test` 295 pass / 0 fail (114 in next.test.ts, 57s; full suite 72s).

## Findings

N1 (nit): `docs/guide/next.md:80` still says "Park export-csv when you want it out of future sweeps." Still true (manual and `--all` sweeps), but unqualified next to the new dependents-only wording. Trivial.

No fix findings. The pre-existing panes check plus `observeBusy`, the prompt-grace check in `dispatchSlot`, and `allocate`'s tab matching make repeat dependent dispatch idempotent per the plan's open limitation. AC1-AC6 all verified.

## Verdict

`nits`

## Merge pass (A)

Rebase: `origin/main` at `1a21e22e0056a7e9d6b5e35a5a395b867847a844`, already an ancestor of reviewed head `4ac0f7a`; no conflicts, no diff change. `AKROGON_BASE` unchanged after refresh.

Checks in worktree:
- `bun run format` clean (all files unchanged)
- `bun run typecheck` (`tsc --noEmit`) exit 0
- `AKROGON_BASE=1a21e22 bun test --changed`: 114 pass, 0 fail, 1028 expects (57.40s)
- `bun test`: 295 pass, 0 fail, 3508 expects across 14 files (73.61s)

Nit N1 not recorded as a lesson: leaf-specific wording judgment, no reusable mechanism.
