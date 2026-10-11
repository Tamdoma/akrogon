# Brief 3: sparse worktrees, stack build, test sweep (plan U3)

## 1. Goal

Create every akrogon-managed worktree sparse (no `issues/` materialized) inside the home store, move `buildStack`'s detached checkout into the same store through one guarded helper, and update every worktree-touching test. Covers plan decisions D2, D6, D9, D10, D11. Plan: `issues/open/worktree-isolation/worktree-store/plan.md` in the registered root.

Landed facts you build on (verify by reading, do not redo): `worktreeStore(repo)` resolves the store (default `~/.akrogon/worktrees/<repo name>`; tests see `f.home/.akrogon/worktrees/repo` because `cli()` now sets `HOME: f.home`). `src/guard.ts` exports `checkLocation(targetPath)` (throws naming a bad canonical ancestor) and the `akrogon guard` verb. `withSetup` composes `guard ancestors` → setup → `guard own-modules` → `sh -c <cmd>`.

## 2. Acceptance criteria

1. `src/next.ts` exports `createSparseWorktree(repo: Repo, path: string, ref: string, opts: { detach?: boolean; branch?: string }): Promise<void>`: calls `checkLocation(path)` first, then `git worktree add --no-checkout` (`--detach` when `opts.detach`, `-b <opts.branch>` when set) `<path> <ref>`, then `git -C <path> sparse-checkout set --no-cone '/*' '!/issues/'`, then `git -C <path> checkout`. On any failure after `worktree add`, remove the partial worktree (`git worktree remove --force <path>`) so a failed create leaves nothing.
2. `ensureWorktree` uses `createSparseWorktree` for both create paths (existing branch → `{branch: undefined}` with ref = slug… decide the cleanest call; new branch → `-b slug` from `trackingRef(repo)`); the adoption branch (worktree already exists) is untouched. `state.worktree` recording is unchanged.
3. `src/batch.ts` `buildStack` creates its checkout at `resolve(worktreeStore(repo), 'batch-' + attemptId())` via `createSparseWorktree(repo, dir, builtOn, { detach: true })`; the `finally` `worktree remove --force` stays.
4. All existing tests that assumed `<root>/issues/worktrees/<slug>` now expect `<f.home>/.akrogon/worktrees/repo/<slug>` for config-default cases, keep explicit `worktree_root` cases where the test is about a non-default root, and keep passing. Files: `tests/next.test.ts`, `tests/batch.test.ts`, `tests/batch-merge.test.ts`, `tests/culprit.test.ts`, `tests/hold.test.ts`, `tests/merge-attempts.test.ts`, `tests/phase.test.ts`, `tests/status.test.ts`, `tests/pull.test.ts`, `tests/direct-guards.test.ts`, plus `tests/helpers.ts` if a shared `storeDir`-style helper is the smallest change (add it; U1 has landed).
5. In-process tests that call `buildStack`, `ensureWorktree` paths, or `worktreeStore` directly must pin `process.env.HOME = f.home` for the call window (save/restore, mirroring the existing `AKROGON_LEAF_TEMP_ROOT` afterEach pattern in `batch-merge.test.ts`), because `homedir()` reads `HOME` in-process. CLI-driven tests need nothing — `cli()` already sets it.
6. New `tests/worktree-store.test.ts` (real git, real worktrees, fixture-based):
   a. Dispatch-created leaf worktree lands at `f.home/.akrogon/worktrees/repo/<slug>`, has no `issues/` directory on disk (`git ls-tree HEAD issues` still lists it), `git status --porcelain` is empty, `git config core.sparseCheckout` is set in the worktree's local config and absent in the registered root's, and the root keeps `issues/` on disk.
   b. With `worktree_root: '~/trees'` in the fixture config the dispatch-created worktree lands at `<f.home>/trees/<slug>`.
   c. A rebase inside a sparse dispatch worktree across a commit that changes `issues/` content succeeds with clean status and `issues/` still absent.
   d. `buildStack` on a stack of two leaf branches runs in a sparse checkout under the store (assert during or after: `git worktree list` shows it only under the store, and the stack result is correct — reuse `batch-merge`'s `buildStack` import; assert the dir is gone after).
   e. Dispatch with an ancestor holding `node_modules` or `package.json` above the would-be worktree is refused naming that path and creates nothing (e.g. `worktree_root` pointing under a temp dir that holds `node_modules`; assert error text and `git worktree list` unchanged).
   f. Resolution proof: in a store leaf worktree (dispatch-created, so guarded-clean ancestors), `bun -e 'require.resolve("left-pad")'` fails while `require.resolve` of a local vendored dep succeeds; and a missing-package invocation (`bun run`/`bun -e` require of an absent name) fails quickly without creating `node_modules` additions or hitting the network — assert failure exit and no new entries under the worktree's `node_modules` (create `node_modules` empty first so `own-modules` is irrelevant here — this criterion is about resolution, not the guard).
   g. (If it makes the file clearer, fold e/f into guard.test.ts-style patterns — but keep all six coverage points in this file.)
7. One deliberate break turns a new test red (e.g. drop the `sparse-checkout set` step → criterion-6a test red; or skip `checkLocation` → 6e red); record it, revert.
8. Every changed existing test file's commit carries `Test-Change: <path> <source: worktree-store leaf, what changed — e.g. "default store moved out of checkout; no expectation intent changed">`.
9. `bun test` on every owned file + `bun run typecheck` green in your worktree.

## 3. Read-first list

- `src/next.ts` — `ensureWorktree` (~277), `linkEnv` (~312), `allocate` (~357), `leafTemp`/scratch uses, `trackingRef` import
- `src/batch.ts` — `buildStack` (~93), `move`/`applyStack` (~136+), `attemptId`
- `src/config.ts` — `worktreeStore` (~250), `expandPath` (~194), `leafTemp` (~255)
- `src/guard.ts` — `checkLocation` signature
- `tests/helpers.ts`, `tests/batch-merge.test.ts` (`branchAt` ~135, `batchFixture` ~156, `process.env` pin pattern), `tests/next.test.ts` (`dispatchFixture` ~39, `next` ~58)
- `tests/phase.test.ts`, `tests/status.test.ts` (`snapshot` ~340-390), `tests/culprit.test.ts`, `tests/hold.test.ts`, `tests/merge-attempts.test.ts` (`inStore` helpers ~45-70)
- `~/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list

- `src/next.ts`: add `createSparseWorktree` export; `ensureWorktree` create branch uses it for both `branch.code === 0` and `else` paths.
- `src/batch.ts`: `buildStack` uses `createSparseWorktree` under `worktreeStore(repo)`; drop the `leafTemp` import if unused.
- `tests/helpers.ts`: optional small `storeDir(f, repo='repo')` helper if it shrinks the sweep.
- All test files listed in criterion 4: mechanical path/expectation updates; per-test `HOME` pins for in-process store use (criterion 5); keep explicit-`worktree_root` cases meaningful.
- `tests/worktree-store.test.ts`: new file per criterion 6.
- Owned paths: `src/next.ts`, `src/batch.ts`, `tests/next.test.ts`, `tests/batch.test.ts`, `tests/batch-merge.test.ts`, `tests/culprit.test.ts`, `tests/hold.test.ts`, `tests/merge-attempts.test.ts`, `tests/phase.test.ts`, `tests/status.test.ts`, `tests/pull.test.ts`, `tests/direct-guards.test.ts`, `tests/helpers.ts` (additive helper only), `tests/worktree-store.test.ts` (new).
- Shared test resource: none. Prerequisites landed: U1 commits `9d7142e`, `035b212`.

## 5. Do-not, reasons and exceptions

- Do not change `linkEnv`, `allocate`, `removeLeafTemp`, `cleanupMerged`, prompt text, or phase logic — only worktree creation; exception: a change forced by sparse semantics returns as a mismatch with evidence.
- Do not touch `src/config.ts`, `src/guard.ts`, `src/akrogon.ts`, `src/sync.ts`, `src/init.ts`, or docs — landed (U1) or owned by U2; exception: none, mismatches return to A.
- Do not make manual `git worktree add` call sites in tests sparse — tests needing `issues/` writes (phase stray-artifact, status snapshot, direct-guards, seeds assertions) keep full worktrees on purpose (D10); exception: tests that assert on dispatch-created worktrees must accept the sparse layout.
- Do not weaken assertions — an old expectation that contradicts the new default store/sparse layout is updated with the leaf as its cited source, never deleted silently; exception: a genuinely dead test is removed with the keeping-test named in the report.
- Do not create worktrees outside `f.home` in tests, and never remove or reuse an occupied path — report it instead.
- Restated: create-path only, no config/guard/doc edits, manual adds stay non-sparse, no silent expectation drops, no real-HOME writes; mismatches return to A.

## 6. Ordered steps

1. Read the code + fixture files; run `bun test tests/batch-merge.test.ts tests/batch.test.ts` and a worktree-creating slice of `tests/next.test.ts` for the baseline.
2. Write `tests/worktree-store.test.ts` first (criterion 6) — red before code.
3. Implement `createSparseWorktree` + `ensureWorktree` + `buildStack` (criteria 1-3).
4. Sweep the owned test files (criteria 4-5): update default-store paths, add `HOME` pins, keep explicit-root cases.
5. Run owned files green; then the deliberate-break check (criterion 7); revert and confirm.
6. `bun run typecheck`; report per section 8.

Advisory size: about 14 files and under 45 turns.

## 7. Commands

`AKROGON_BASE=309d742605a0516067840863ffdf3be29b03fc0c bun test --changed="$AKROGON_BASE" --timeout=30000`
plus explicitly your owned files, e.g. `bun test tests/worktree-store.test.ts tests/batch-merge.test.ts tests/batch.test.ts tests/next.test.ts --timeout=30000`, and `bun run typecheck`.
(`tests/init.test.ts`/`tests/sync.test.ts` failures in `--changed` belong to U2 — judge only your owned files.)

## 8. Done-when, evidence and report

All criteria green in your worktree with pasted results; every existing-test change carries its `Test-Change:` trailer; deliberate-break evidence recorded.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
