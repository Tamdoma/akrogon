# Review A: foreign-leaf-summary

Base: e624357e825e21b38a15c07a435b1ff066c6ba38
Reviewed head: 88ca7ee88751cc4d870480fcc808e61bcb0ccb5a (branch `foreign-leaf-summary`)
Verdict: ready

## Verification evidence

- `bun test tests/next.test.ts` — 86 pass, 0 fail (rerun by reviewer).
- `bun run typecheck` — `tsc --noEmit` exit 0 (rerun by reviewer).
- `bunx prettier --check src tests` — clean (rerun by reviewer).
- Report claims full `bun test` 224 pass; changed-file suite confirms the touched surface.
- `git diff e624357...HEAD --stat`: only `src/next.ts`, `tests/next.test.ts`, `src/AREA.md`, `docs/guide/problems.html` — `src/status.ts`, `src/state.ts`, `src/init.ts`, `src/phase.ts` untouched (criterion 7).
- `src/AREA.md` paths checked from repo root: `src/akrogon.ts`, `src/config.ts`, `src/phase.ts`, `src/shell.ts`, `docs/reference-index.md`, `tests/helpers.ts` all exist.

## Criteria trace

- C1: `Inventory.foreign` added; `discover()` pushes `{path, stored}` for `state.repo !== repo.name` without throw, per-leaf report, or `unreadable` increment (src/next.ts:93).
- C2/C3: one `console.error(JSON.stringify({repo, path, error, count, paths}))` per repo per invocation, deduped on `invocation.skipped` key `repo.name`; `repo.name` in `skipped` drives `process.exitCode = 1` via the existing tail check. Test asserts 3 leaves / 2 stored keys / one line / code 1.
- C4: `activeCount()` untouched; foreign leaves sit outside `leaves`/`unreadable` so contribute 0. Test: `max_active: 2`, 5 foreign + 2 healthy across two repos, both dispatch, foreign state bytes identical.
- C5: `lookup()`, `sweep()`, `cleanupRepos()`, `paneOwners()`, `tab_closed` scan all read `inventory.leaves` which excludes foreign; `selectLeaves` quiet return covers `foreign` so `next <foreign-slug>` exits 1 without dispatch. `dispatchLeaf` identity re-check retained at src/next.ts:463. Tests cover `blocked-by` miss and direct selection.
- C6: malformed leaf still reports per-leaf and counts `leaves + unreadable`; test asserts zero prompts at capacity.
- C8: `src/AREA.md` non-obvious-pattern line added; `docs/guide/problems.html` gains one `table.wrong` row. No guide prose described the old per-leaf error.
- C9: merged foreign leaf under `issues/closed/` reported in summary, state bytes/worktree/branch/tab all survive `--all`.
- C10: two repos × two invocations, one summary per repo per run, exit 1 both times.
- C11: format/typecheck/test verified above.

## Findings

None. Dedup keys (`repo.name`, `${repo.name}/${path}`) cannot collide with per-leaf report keys since leaf paths are absolute. Summary emission after the duplicate-slug pass matches D2. `paths` embeds `result.foreign` directly — not mutated after stringify. Tests use the real CLI and fixture, no mocks of the unit under test.

## Merge rebase evidence

- Rebase target: `origin/main` = c8dac2a885390cb7e1b680236cb29d301b16354a (old AKROGON_BASE e624357e825e21b38a15c07a435b1ff066c6ba38). Clean rebase, no conflicts.
- Rebased head: 4e2356d.
- Post-rebase checks: `bun run format` clean, `bun run typecheck` exit 0, `bun test --changed` 109 pass / 1 fail.

### Failing check

`foreign leaves do not consume capacity while healthy leaves in both repos dispatch` (tests/next.test.ts:1214):

```
expect(received).toEqual(expected)
  [
-   "plan-issue healthy slot=B phase=plan.synthesis",
-   "plan-issue other-healthy slot=B phase=plan.synthesis",
+   "plan-issue healthy slot=B phase=plan.synthesis leaf=/tmp/akrogon-LZ0Hn4/repo/issues/open/issue/healthy",
+   "plan-issue other-healthy slot=B phase=plan.synthesis leaf=/tmp/akrogon-e0abH0/repo/issues/open/issue/other-healthy",
  ]
```

Cause: upstream commit c8dac2a ("dispatch prompt carries leaf= authoritative folder") added ` leaf=<path>` to dispatch prompts; the new capacity test asserts exact prompt text without it. Test assertion must include `leaf=${f.root}/issues/open/issue/healthy` and `leaf=${g.root}/issues/open/issue/other-healthy`, matching the updated sibling assertions (e.g. tests/next.test.ts:1163).

## Re-check after check.fix (slot A)

- Prior reviewed head: 4e2356d. Repair head: 3d4b4b5.
- Repair diff: tests/next.test.ts only — capacity test prompt assertions now include `leaf=${f.root}/issues/open/issue/healthy` and `leaf=${g.root}/issues/open/issue/other-healthy`, matching the upstream prompt contract and sibling assertions.
- Evidence: `bun test tests/next.test.ts` 87 pass / 0 fail; `bun run typecheck` exit 0; `prettier --check` clean.
- Earlier findings confirmed; no new defects introduced by the repair.
- Verdict: ready.
