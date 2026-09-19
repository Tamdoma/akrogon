# Review B: foreign-leaf-summary

Base: e624357e825e21b38a15c07a435b1ff066c6ba38
Reviewed head: 88ca7ee88751cc4d870480fcc808e61bcb0ccb5a

## Verification evidence

- `bun test` full suite: 224 pass, 0 fail (run by B at implement; diff unchanged since — no rerun needed).
- `bun run typecheck`, `bun run format`: clean.
- `src/AREA.md` path check: all 9 named paths exist from repo root.
- Diff inspected: `src/next.ts` (+24/-9), `tests/next.test.ts` (+174), `src/AREA.md` (+1), `docs/guide/problems.html` (+1).

## Criteria check

1. `Inventory.foreign` carries `{path, stored}`; `discover()` pushes parsed mismatched leaves there inside the same `try`, so schema/depth failures still hit `catch` → per-leaf `unreadable`. Correct.
2. Summary emitted once per repo per invocation via `invocation.skipped.has(repo.name)`; shape `{repo, path, error, count, paths}` with `path` = first foreign path keeps `skipSchema` parsing. `error` names registered key and count. Test asserts exactly one line across repeated discovery.
3. `exitCode = 1` rides `invocation.skipped.size > 0`; summary adds `repo.name` + per-path keys. Asserted.
4. `activeCount()` untouched; foreign leaves are outside `leaves`/`unreadable` so they contribute 0. Two-repo test proves both healthy leaves dispatch at `max_active: 2` with 5 foreign present; foreign bytes identical.
5. Foreign leaves never enter `inventory.leaves`, so `lookup()`, `sweep()`, `cleanupRepos()`, `paneOwners()`, `tab_closed` scan all exclude them with no extra code. `next <foreign-slug>` quiet-returns via the extended `selectLeaves` guard — exits 1, no dispatch, file unchanged. Both asserted.
6. Malformed leaf still counts `leaves + unreadable` = 2 ≥ `max_active` → zero prompts; summary and per-leaf line coexist. Asserted.
7. `status.ts`, `state.ts`, `init.ts`, `phase.ts` untouched; `RepoMismatchError` still imported by `status.ts` for `allLeaves()`.
8. `src/AREA.md` line added; `problems.html` row added. No pre-existing guide prose described the per-leaf error — noted in plan.
9. Merged foreign leaf under `issues/closed/` keeps state bytes, worktree, branch (`git show-ref`), tab; no `tab close` call. Asserted.
10. Two repos × two `--all` runs from outside any checkout: exactly one summary per repo per run, exit 1 both times. Asserted.
11. All checks pass.

## Notes

- `dispatchLeaf`'s `state.repo !== repo.name` re-check remains as a mid-dispatch identity guard — correct to keep.
- Foreign leaves can't collide with duplicate-slug detection since they never enter `result.leaves` — correct: a foreign slug matching a local slug is not a local duplicate.
- Tests assert observable contracts (line counts, exit codes, prompts, bytes, git refs, tab records), not wording.

## Findings

None.

## Verdict

ready

## Re-check after check.fix (repair diff 4e2356d..3d4b4b5)

- Repair scope: one assertion in the capacity test — prompt strings now include `leaf=${f.root}/issues/open/issue/healthy` and `leaf=${g.root}/issues/open/issue/other-healthy`, matching upstream `src/next.ts:415` (`leaf=${leaf.path}`) and the sibling pattern at tests/next.test.ts:1163.
- Verified by B this pass: `bun test --changed` 110/0, `bun test` 228/0, `bun run format` clean, `bun run typecheck` exit 0.
- Earlier findings: none to confirm. No defect introduced by the repair — test-only diff, assertions strengthened to the real prompt contract.

Verdict after repair: ready
