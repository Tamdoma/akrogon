# Review A: command-deletions-batch

Base: 26a7bc2613af4a2c9d579351bc66e87cd1af1427
Reviewed head: cf96418 (`command-deletions-batch: delete stand-in, repo lock, per-repo max_active, merge auto-recovery; add failed exits, empty-branch refusal, debate gate`)

## Verification evidence

- `bun run typecheck` — clean.
- `bun run format` — clean, no files changed.
- `AKROGON_BASE=26a7bc2… bun test --changed` — 194 pass, 0 fail, 8 files.
- Full suite artifact `/tmp/akrogon-command-deletions-batch-test.log` exists, tail shows 217 pass / 0 fail / 12 files, path recorded in `implementation/brief.md` (criterion 11).
- `grep -rn "seatFor|peerOf|recoverMerge|withRepoLock|issues/.lock|repo_max_active|perRepo" src/` — empty (criterion 1).
- `grep -rn "stand-in|other agent's pane|other pane" docs/guide/` — empty (criterion 1).
- `grep -rn "issues/.lock" tests/ src/` — empty (criterion 8).
- No `AREA.md` files in the diff; no area-path check applies.

## Per-decision findings

- D1: `busy()` covers `unknown`; `seatFor`/`peerOf`/stand-in branch/merge-seat block deleted; `dispatchSlot` reads `recorded.pane[slot]`; post-start recheck is `if (!idle(ready)) return`. Tests assert no prompt, unchanged attempts, `busy_since` set for `unknown` (criteria 2).
- D2: `failed.next` is the six-phase list; `commitMove` resets `fix_rounds` on any exit from `failed`. Test proves `plan.synthesis` move resets attempts/done/fix_rounds and `check.fix` is refused with no state/log write (criterion 3).
- D3: `recoverMerge` and its call deleted; `merged` reads `state.phase` directly; `requireCodeOnly` refuses empty diffs naming the target. Tests cover empty-branch refusal (criterion 4) and merge re-prompt of an idle seat on a landed branch (criterion 5).
- D4: `max_active` out of `repoSchema`; `effectiveConfig` spreads `repoConfig`; `activeCount` returns `Promise<number>`; `allocate` checks the global cap only. Config test asserts a repo `max_active` key fails parse naming the key (criterion 7).
- D5: debate gate sits after the `failed` block and before the dependency check; test proves exit 1, slug + `plan.positions` in stderr, no tab/pane/worktree, state unchanged, then dispatch once both positions files exist (criterion 6).
- D6: `withRepoLock` gone; `phaseCommand`/`syncCommand` keep the global `withLock`; `dispatchLeaf`/`pullRepo` run directly; `lockPaths` holds the global lock only and all three lock checks are guarded by `lockPaths.length > 0`. The relocated-home case (`settings [1]*/.lock`) still exercises the global lock inside the repo root.
- D7: `hooked = event !== undefined`; typed `next` in a leaf pane selects by cwd, sweeps, and runs `cleanupRepos`. Test proves a merged leaf's worktree is removed in the same run (criterion 9).
- D8: all five named guide lines removed plus the repo-cap sentences in `in-practice.html`, `install.html`, `limits.html`; `problems.html` failed row names `akrogon phase <slug> <phase>`.
- D9/D10: test edits match the plan; `fetch-deadline-harness.ts` and its test deleted per D10's reasoning (its only scenario was `recoverMerge`'s fetch deadline).

## Findings

None. No Fix, no Nit.

## Verdict

ready

## Merge (A)

- Rebase target: `edda614` (`merge-conflict-route: fix_rounds counts only review->fix; A resolves rebase conflicts at merge`)
- Prior reviewed head: `cf96418`; resolved head: `fec7bc6`
- Conflict: `src/phase.ts` `commitMove` `fix_rounds` — kept upstream's `check.review`-only increment and this leaf's reset on any `failed` exit (not only `implement`).
- `git range-diff 26a7bc2..cf96418 edda614..fec7bc6`: only the `fix_rounds` hunk and context drift in `docs/guide/problems.html` (upstream rewrote the adjacent "Merge conflict" row).
- Checks after rebase: `bun run format` clean; `bun run typecheck` clean; `bun test` 217 pass / 0 fail; `bun test --changed=edda614` 194 pass / 0 fail.
