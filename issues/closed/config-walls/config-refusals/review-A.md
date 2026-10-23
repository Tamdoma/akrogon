# Review A: config-refusals

Base: bd996a7ad22225d35328088e7a7d1a1bc0c95d89 · Reviewed head: 0e5fc9a303187adaccca738958f384d41f40059e

## Evidence

- `check w1-u1: 0` (config/verify/sync: 100 pass incl. 9 new refusal cases), `check w1-u3: 0`, `check w1-u4: 0`, `check w2-u2: 0`, `check criteria: 0` (383 pass), `check c4-guard-recheck: 0` on the final head; `akrogon verify` on 0e5fc9a → `verify leaf 0e5fc9a…: green` (test/typecheck/format all 0).
- Diff `bd996a7a..HEAD` inspected whole: src/config.ts, src/guard.ts, src/init.ts, docs/guide/setup.md + test changes.
- `canonicalPath` walks to the deepest existing ancestor and joins the suffix; recursion terminates at `/` (exists → realpath). `within` covers equality and sibling-prefix; both operands canonicalized, so `initialize`'s un-realpath'd root is handled.
- Consumer placement verified: verify.ts:296 resolves the store before `checkLocation`; sync's branch check still precedes the store throw (trunk-refusal tests still hit their branch error); next.ts mismatch path kept reachable by moving the fixture's destination store external.
- status/pull read no store — confirmed by grep: neither imports `worktreeStore`; `effectiveConfig` (akrogon config) throws as intended.
- init write order: `worktreeStore` before `writeRepoConfig`; refused tests snapshot `.gitattributes` too. `.gitignore` addition deleted; `relative`/`within` imports gone.
- Test-Change trailers present on both test commits, citing brief criteria; trailer names match the changed files.
- Criterion 6: no `learnings/history/2026-10-22-in-repo-worktree-store-guard.md` and no LESSONS.md line at the leaf base — absent branch correctly report-only.

## Documented behavior check

- setup.md `worktree_root` bullet changed and matches the new refusal; verified by the added test.
- files.md ("configured worktree directory" exclusion) and README:195 ("the worktree store when inside the checkout") unchanged and still true as conditionals of `eligibleRecord`.
- No AREA.md in the diff; no changed file invalidates an index path.

## Findings

Nits:

- N1 — skills/init-akrogon/SKILL.md:80 still lists "the in-checkout worktree" among ignore entries `init` owns; after this change no store ignore entry is written. Deferred: design excluded the file (it proposes no `worktree_root`); the plan flagged it for review. Promotes to a Fix if a real proposal run misleads, or on a chart decision to update skill prose.
- N2 — `worktreeStore` now returns the canonical (symlink-resolved) store rather than the expanded path for configured external roots. Harmless and arguably more correct (`git worktree list` reports real paths), but a store configured through a symlinked ancestor now records the resolved path in `state.worktree`. Deferred: no criterion or report names the expanded form; promotes if an operator's recorded-path expectation depends on the alias.

Verdict: nits — request merge.
