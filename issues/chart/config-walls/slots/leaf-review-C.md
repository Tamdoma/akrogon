# leaf review — slot C: config-refusals

Two disagreements.

## D1 — sync.test.ts and init.test.ts fixtures are unowned blast radius

The design's owned surfaces name config/init/guard/verify/worktree-store tests, but two fixture seams set an in-checkout `worktree_root` that the refusal now kills:

- `tests/sync.test.ts:48-54` — `remoteFixture(worktreeRoot = 'issues/worktrees')` defaults to an in-checkout store. Every sync test inheriting the default will throw at `worktreeStore` (src/sync.ts:41, :176). The default arg must become an external path (e.g. `storeDir(f)`), not just the call sites that name it.
- `tests/init.test.ts:80-95` — `rootCases` 'repo-equal' (`'.'` and `f.root`) assert init **succeeds** with no gitignore store line. Under 1a these are refusal cases: they must flip to assert non-zero exit and no files written — they are acceptance assertions, not just path fixtures, so the flip needs to be stated, not implied by "fixtures change with that reason."

Criterion 3 still passes within ownership; the gap is the design understating which suites turn red.

## D2 — "repo.root already canonical" is false at the init call site

The design's comparison premise — "repo.root (already canonical from readRepo)" (src/config.ts:220, `realpathSync`) — does not cover `initialize`, which builds its `Repo` with `root` taken raw from `git rev-parse --show-toplevel` (src/init.ts:37), never canonicalized. The implementer must pick where canonicalization lives: realpath the root in `initialize`, or have `worktreeStore` canonicalize both operands before `within`. Pick the second: the check then doesn't depend on caller hygiene, and criterion 1's symlinked-alias case stays true regardless of which path produced the Repo. If the leaf realpaths only inside `initialize`, a future caller synthesizing a Repo reintroduces the bypass.

## Verified while checking (no disagreement)

- `within` covers equality (`diff === ''`, src/config.ts:234) and prefix siblings — criterion 2's `<checkout>2/trees` case is free.
- verify resolves the store at src/verify.ts:296 before `createSparseWorktree` at :324 — "no checkout is created" holds.
- `expandPath` (src/config.ts:204) handles `~`/`~/` and is not canonical — the design's deepest-existing-ancestor realpath is correctly required for nonexistent stores.
- `writeRepoConfig` (src/init.ts:62) is the first write; `seats`/`checkGrounding` (:60-61) don't write — a `worktreeStore` probe anywhere before :62 satisfies criterion 3.
- `akrogon config` reaches `worktreeStore` via effectiveConfig (src/config.ts:389) and throws; an uncommitted config fix is read on next sync, so the operator's fix-then-sync path is not blocked by the refusal.
- readiness.yaml empty: consistent with `phase: plan.synthesis` in state.yaml; assumed proofs fill at check time.
