# Leaf review B: setup-before-seat

## B1. `setup-` scratch dirs leak on a killed pass; no sweep exists and none is owned

- File: design.md, leaf architecture `ensureWorktree`/setup helper ("`scratch` is a fresh `setup-` dir under `leafTemp(repo, slug)`, removed in `finally`") and Taken 4 (`<scratch>` is a fresh `setup-` dir … not `run-` (C: `ownerKeeps`)).
- Defect: the `finally` removal is the only cleanup. A pass killed mid-setup (the listener's `PASS_DEADLINE_MS` group SIGKILL in src/listen.ts is the standing residual of Taken 3) never runs `finally`, and no sweep ever collects the leftover: the leaf-temp sweep in `src/reconcile.ts` (the `scratchRoot` walk, ~line 1146) filters children with `child.name.startsWith('run-')`, so `setup-` entries survive in the leaf temp until the leaf finishes and its whole temp is dropped — potentially the leaf's whole lifetime, one orphan per killed attempt. The `run-` naming was rejected for the correct reason (an ownerless `run-` dir older than 60 s is dropped by reconcile, which would delete the scratch under a slow live install), but the design stops at the rejection and owns no replacement disposal.
- Code path it breaks: `src/reconcile.ts` scratch sweep (keeps/removes leaf-temp entries) — the new directory kind is invisible to every existing rule.
- Replacement text for the design, under the setup helper surface: "Orphaned `setup-` scratch dirs are swept in the leaf-temp walk in `src/reconcile.ts`: a `setup-` entry whose leaf has no setup in flight is dropped outright. No age heuristic is needed because reconcile and the setup step both run under the home `.lock`, so any `setup-` dir reconcile can see belongs to a dead pass. `src/reconcile.ts` is added to owned surfaces."

## B2. The `src/AREA.md` update is conditional, but its condition is already true

- File: design.md, owned surfaces, last entry: "`src/AREA.md` if it describes `ensureWorktree` or setup."
- Defect: src/AREA.md does describe both, today: its key-files paragraph says "`akrogon config` composes a repo's `setup` key into every printed `checks` and `advisory` command" and its non-obvious patterns describe the first-allocation shape (refusal leaves no `worktree:`, adoption) without the setup step. After the leaf, the allocation description is incomplete at exactly the point this leaf changes (setup runs there, a created worktree is removed on setup failure). "If" leaves the implementer free to skip the update, recreating the stale-rule-in-docs lesson (`learnings/LESSONS.md` 2026-09-11) the repo already carries.
- Rule it breaks: nothing in the codebase — it is a documentation-completeness defect against the leaf's own docs criterion 7, which covers only the two `docs/reference` files.
- Replacement text: "`src/AREA.md`: the first-allocation pattern paragraph and the `akrogon config` composition note gain the dispatch-time setup duty (marker, busy gate, removal on failure), unconditionally."

## Non-defects verified while reading

- Every allocate caller passes through the setup step as claimed: seats only ever receive work through `dispatchSlot`/`seatCommand`, which sit behind `allocate`; `merge`-phase leaves return before allocation but receive no seat task (routing has no slots in `merge`).
- The `liveRuns()` busy arm composes with the existing delivery logic instead of contradicting it: `dispatchSlot` already suppresses delivery while a leaf run is live, so the "nothing is delivered" half of criterion 4 holds with or without the new gate.
- The `Open for the plan` import-direction question is real but correctly open: `constructedEnv` in `src/run-check.ts` already imports `setupCommand` from `./config`, so placing the helper in `src/config.ts` with a direct `run-check` import would create a cycle; the `src/next.ts` fallback avoids it. Not a defect because the design does not settle it.
- `broadcastPass` already treats a null allocation as a silent return, so the busy outcome there needs no extra machinery beyond the discriminated result.
- Item ordering arithmetic checks out: `ensureLeafTemp` before the setup step is required because `leafTemp()` itself only resolves the path; the scratch `mkdtemp` would ENOENT otherwise.
- No path under `issues/` is touched by the mechanism (the marker lives in the worktree gitdir; the docs, AREA.md and learnings files are repo-root paths in the leaf worktree or the checkout's tracked tree, not issue records).
- Criterion 8 names the history path exactly: `learnings/history/2026-11-25-fresh-worktree-skips-setup.md`.
