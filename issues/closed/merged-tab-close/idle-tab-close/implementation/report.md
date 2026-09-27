# Implementation report: idle-tab-close

Mode: delegated (2 sequential workers). Base `17fa33ab58b727534ec542790fd6a6d11bb65de7`, head `dbd5e45f49f4c190953ee247017443e73017b6c4` on branch `idle-tab-close`.

## Changed files and reasons

- `src/next.ts`: new `closeMergedTab(leaf)` (no-op when tab undefined or no live pane carries it); `cleanupMerged` calls it before the `issues/open` guard; pane-hook branch closes after dependants dispatch with slug rediscovery + seat-A/event filter + `report` on error (D1–D5).
- `tests/next.test.ts`: new seat-A idle hook close test (C1); 5-case negative loop (C2); epic-sibling test looped over `--resume`/`--all` expecting tab closed, worktree/branch kept (C3); closure-retry test renamed + updated (C4); idempotent + explicit `tab_closed` test (C5); hook-retry-with-owner-move test (C6).
- `skills/merge-issue/SKILL.md`: dropped the `herdr tab close "$HERDR_TAB_ID"` self-close last act; command owns the idle close, sweeps own worktree/branch removal (C7).
- `docs/guide/merge.md`, `docs/guide/limits.md`, `docs/guide/problems.md`: state hook passes close merged tabs, only sweeps delete worktrees/branches (C8).

## Commands run

Worker 1 (code+tests), `AKROGON_BASE=17fa33a...`, `bun test --changed="$AKROGON_BASE"`:

- Before src change: `116 pass, 1 fail` — new C1 test red. Log: `/tmp/idle-tab-close-red.log`.
- After: `125 pass, 0 fail, 1113 expect() calls` across 1 file, 76.32s. Log: `/tmp/idle-tab-close-green.log`.
- `bun run typecheck`: clean.

Worker 2 (docs), same changed-test command: `125 pass, 0 fail, 1113 expect() calls`, 75.68s.

Worker 2 grep from worktree root, `grep -rn 'tab close\|closes its tab' skills/ docs/`:

- `skills/merge-issue/SKILL.md:47` — broadcast rationale, states the tab closes on idle (actor now the command).
- `docs/guide/merge.md:27` — states the command closes the tab.
- No text saying the merge seat closes its own tab.

B final verification in the worktree:

- `bun run format`: exit 0.
- `bun run typecheck` (`tsc --noEmit`): clean.
- `bun test`: `306 pass, 0 fail, 3621 expect() calls`, 14 files, 91.39s.
- `git status --porcelain` before commit showed only the 6 files above; no `issues/` paths on the branch.

## Known limitations

- The hook-step `discover` re-scans repo leaves (O(repo leaves)); same pattern as elsewhere in `src/next.ts`.
- Plan's open limitation stands: with no seat-A idle/exit event and no sweep, a merged tab waits until the next cleanup pass.
- C5's explicit `tab_closed` drive runs after the owner already moved to `issues/closed/`, so the hook re-dispatch early-returns; exercised, not load-bearing for the close path.

## Unverified criteria

None. C1–C9 all verified: C1–C6 by new/updated tests, C7–C8 by diff + grep, C9 by the full check run above.
