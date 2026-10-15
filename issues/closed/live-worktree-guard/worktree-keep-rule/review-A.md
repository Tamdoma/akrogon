# Review A: worktree-keep-rule

- Base: `fb60ccd` (kept-status merge)
- Reviewed head: `310c23c`
- Diff: `src/reconcile.ts`, `skills/chart-issues/SKILL.md`, `README.md`, `tests/keep-rule.test.ts` (new), `tests/reconcile.test.ts` — clean tree, branch ahead of base.

## Evidence

- `akrogon verify` green on `310c23c`: `verify test: 0 implementation/check-test-1792103263669-4093539.log`, `verify typecheck: 0 implementation/check-typecheck-1792103265558-4093539.log` (894 tests). Earlier red verify caught the prune-gate regression, repaired at `8b7624b` before the final run.
- Diff read in full. Porcelain parse probed live: orphan worktree emits `HEAD 0000…` (safe for the `!` assertion), bare repo has no worktree stanzas (unreachable as a registered root), bare `locked` line parses to `''` → `locked worktree`. Lock reasons with quotes are stored as one porcelain line.
- Criterion coverage: T1/T2/T3 prove criteria 1, 2, 4 including the literal `akrogon leftovers` listing and `tab_closed` pass; criterion 3 rides on the untouched scratch-kind suite plus T2's post-unlock removals; criterion 5 is the verified four-edit SKILL.md diff. Both rewritten variant tests cite criterion 1 — lawful rewrites.
- Semantics checked: lock keep precedes every leaf/kind/fallthrough rule in both loops (covers `<leaf>-x`, `verify-*`, `batch-*`, `<merged leaf>-u<N>`, own worktree); unmanaged fallthrough lands before pane checks so unmanaged reasons are stable; `removedWorktrees` captures branch/head pre-removal; `removed` is optional so pre-change reports still parse (T3 proves via `status <slug>`); prune gate restored to `removed.length` covers inner worktrees under rmSync'd scratch dirs.

## Findings

- N1 — `src/reconcile.ts` exports `readRemoved` but no consumer exists (T3 parses the report JSON directly). Concern: dead API surface added speculatively. Deferred: harmless consistent export; removal is a one-line cleanup at the next touch. Promotes when a consumer or display criterion lands, or if a second unused accessor accretes.
- N2 — `src/AREA.md:23` still reads "removes dead worktrees" for `src/reconcile.ts`. Concern: under the keep-first rule "dead" is ambiguous — unmanaged and locked worktrees are kept, only finished kinds go. Deferred: the following clause names the exact removed kinds, so the line is loose, not wrong; wording fix rides any next touch. Promotes if a seat derives removal expectations from it and gets bitten.
- N3 — `tests/keep-rule.test.ts` T2's post-unlock `existsSync(nonKind)` assertion keeps `nonKind` locked, so it re-proves the lock keep rather than the unmanaged keep for a `-x` name; coverage for the unlocked `-x` case exists via T1 (`manual-copy`) and the rewritten variant tests. Deferred: no criterion gap. Promotes only if T1's coverage moves.

Doc check: README updated for the changed behavior; `docs/guide/chart.md` direct-route summary ("removes the branch and worktree") stays accurate under the new unlock step; `docs/guide/next.md` carries no variant-sweep claim; `tests/AREA.md` does not enumerate test files; `skills/AREA.md` unaffected. `docs/guide/limits.md` cleanup claims are unchanged-behavior prose, not this diff's surface.

## Verdict

`nits` — no blocking Fix; three Nits recorded above.
