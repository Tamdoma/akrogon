# Plan: config-refusals

Synthesis from the locked design (debate off). All criterion tests are written and committed on this branch red-first; implementation only lands the product change.

## Decisions

- D1 — `worktreeStore(repo)` keeps its signature and default; for a configured `worktree_root` it expands the value, canonicalizes store and `repo.root`, and throws an Error naming `worktree_root`, `issues/config.yaml`, the canonical store and the canonical checkout when `within(canonicalStore, canonicalRoot)` (equality included by `within`'s empty-diff branch). The message also says to remove the key (default `~/.akrogon/worktrees/<repo>`) or point it outside the checkout.
- D2 — Canonicalization is a new private `canonicalPath` in src/config.ts: realpath the deepest existing ancestor and join the remaining suffix. `src/guard.ts` `offendingAncestor` walks ancestors similarly but returns an offender, not a path; no existing helper fits. (Answers the design's open question.)
- D3 — src/init.ts resolves the store by calling `worktreeStore({ name: repoName, root, config })` after `checkGrounding` and before `writeRepoConfig`, so a refused store stops before any file write. The `worktreeRoot !== root && within(...)` `.gitignore` addition is deleted; `relative` (node:path) and `within` (./config) imports become unused and are removed. (Answers the design's open question.)
- D4 — src/guard.ts `guard` own-modules keeps `missing own node_modules: <path>` and exit 1, and the same stderr line adds the `setup` in issues/config.yaml remedy; unconditional. `checkLocation` and `ancestors` unchanged.
- D5 — docs/guide/setup.md `worktree_root` bullet gains "outside the checkout" + refusal wording and drops "Only a store inside the checkout is gitignored."
- D6 — Fixture rework already committed: sync `remoteFixture` defaults to `<home>/store`; in-checkout exclusion cases dropped; next.test.ts 'worktree root' case uses an external destination store.
- D7 — Criterion 6: `learnings/history/2026-10-22-in-repo-worktree-store-guard.md` is absent at base `origin/main` (bd996a7a, which includes 92dddada) and LESSONS.md holds no matching line — verified 2026-10-22. The report states so; nothing written.
- Note — `skills/init-akrogon/SKILL.md:80` mentions "the in-checkout worktree" ignore entries and becomes stale under D3; the design excludes editing it ("it proposes no `worktree_root`"). Left for review, matching the exclusion.

## Read-first

- `src/config.ts` (`worktreeStore`, `within`, `expandPath`, `readRepo`)
- `src/init.ts` (`initialize` write order, `additions`)
- `src/guard.ts` (`guard`, `checkLocation`, `offendingAncestor`)
- `src/verify.ts` `runOnce` (worktreeStore before checkLocation), `src/sync.ts` (branch check before store), `src/next.ts`, `src/batch.ts`, `src/reconcile.ts`, `src/self-update.ts` (consumers needing no change)
- `docs/guide/setup.md:57`; `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`
- `tests/helpers.ts` (`fixture`, `cli`, `yaml`, `remoteFixture` analogs); the committed red tests listed under Verification

## Interfaces

- `worktreeStore(repo: Repo): string` — unchanged signature; now throws on an in-checkout configured store.
- Refusal message must contain: `worktree_root`, `issues/config.yaml`, canonical resolved store, canonical checkout root.
- `guard` stderr: `missing own node_modules: <path>` plus `setup` and `issues/config.yaml` remedy words.

## Waves

Tests are already committed; units below carry product code and docs only. Configured `implement: subagents`.

### Wave 1 (independent)

- U1 `src/config.ts`: `canonicalPath` helper + `worktreeStore` refusal. Owns: src/config.ts.
- U3 `src/guard.ts`: own-modules message. Owns: src/guard.ts.
- U4 `docs/guide/setup.md`: `worktree_root` bullet. Owns: docs/guide/setup.md.

### Wave 2

- U2 `src/init.ts`: early `worktreeStore` resolution before `writeRepoConfig`; delete the in-checkout `.gitignore` addition; drop unused `relative`/`within` imports. Owns: src/init.ts. Depends on U1 (calls the refusing `worktreeStore`).

## Verification — criterion → proof

Each proof command exists at base (`bun test` runner, `tests/` files committed on this branch); the `test` check (`bun test --timeout=30000`, whole suite) covers them at merge.

- C1 — `akrogon config`/`verify`/`sync` exit non-zero naming `worktree_root`, `issues/config.yaml`, resolved store and checkout for relative, absolute and symlinked-alias in-checkout stores; verify creates no checkout (worktree list unchanged, no receipt).
  Tests: `config refuses a worktree store %s naming the key, store and checkout` (x3, config.test.ts); `verify refuses a worktree store %s and creates no checkout` (x3, verify.test.ts); `sync refuses a worktree store inside the checkout naming the key without committing` (sync.test.ts). Deliberate break: revert the `within` throw.
  Proof: `akrogon run-check --name c1-config -- bun test --timeout=30000 tests/config.test.ts` → `check c1-config: 1` (log `implementation/check-c1-config-1792696928968-2636039.log`: 4 fail incl. 3 new refusal cases + reworked store test). `c1-verify` → `check c1-verify: 1` (`...-c1-verify-1792696937456-2639224.log`, 3 new fail). `c1-sync` → `check c1-sync: 1` (`...-c1-sync-1792696953618-2652201.log`, 1 new fail; 38 pass shows the external-store rework is consistent).
  Boundary: real CLI against fixture repos. Size: seconds. Rerun trigger: any change to src/config.ts store resolution or the three consumers' order.
- C2 — external stores accepted: `~/…`, absolute external, `<checkout>2/trees` sibling prefix.
  Test: `config prints worktree_store matching the leaf path for every root shape and caller` (config.test.ts, now red on the added sibling path; plus init.test.ts `acceptedCases` incl. `repo2 sibling`). Deliberate break: `startsWith` instead of `within`.
  Proof: covered by `check c1-config` and `check c3-init` above. Size: seconds. Rerun trigger: canonicalization or `within` change.
- C3 — init refuses an in-checkout proposal before any write and adds no store line for accepted proposals.
  Tests: `init refuses %s worktree root naming the key, store and checkout without writing files` (x4 incl. normalized and both repo-equal shapes); `init writes no worktree store line to .gitignore and preserves user rules on repeated init`; acceptedCases assert `.env\nissues/seeds/\n.lock\n` + LOG_IGNORES only.
  Proof: `akrogon run-check --name c3-init -- bun test --timeout=30000 tests/init.test.ts` → `check c3-init: 1` (`...-c3-init-1792696939330-2649369.log`, 4 refused-case fails; 18 pass).
  Size: seconds. Rerun trigger: init write order or `additions` change.
- C4 — `guard own-modules` exits 1 naming the missing path and `setup` in issues/config.yaml; exit 0 otherwise.
  Tests: `guard own-modules refuses naming the missing node_modules and accepts it once created` and `printed check refuses naming missing own node_modules and never runs the check command` (guard.test.ts, extended with `setup` + `issues/config.yaml` assertions).
  Proof: `akrogon run-check --name c4-guard -- bun test --timeout=30000 tests/guard.test.ts` → `check c4-guard: 1` (`...-c4-guard-1792696942105-2650778.log`, 2 fail on missing remedy words).
  Size: seconds. Rerun trigger: guard message change.
- C5 — setup.md bullet says the store must lie outside the checkout and akrogon refuses one inside it; no in-checkout-gitignored sentence. `test` check passes.
  Proof: guide read directly (review-B F1 rejected the planned wording test, deleted in repair; C5 is doc correctness, not an executable assertion). Whole suite via configured `test` check — green under `akrogon verify` on the final head.
  Size: seconds. Rerun trigger: setup.md bullet edit.
- C6 — lesson retirement, absent branch: report states the file is absent at the leaf base; no files written. Proof: report statement; verified at plan time (no history file, no LESSONS.md line). Size: seconds. Rerun trigger: none (one-time check at implement).

Also committed: `check c1-next: 0` (`...-c1-next-1792696957719-2659396.log`) — the reworked moved-root case stays green against current behavior.

## Docs checklist

- docs/guide/setup.md — `worktree_root` bullet rewritten (D5). Edited.
- skills/init-akrogon/SKILL.md — line 80 stale ("in-checkout worktree ... ignore entries"); excluded by design, noted for review.
- No other agent or human doc affected: AREA files describe no store-inside-checkout guarantee; README:195's conditional exclusion list stays true (the config making it reachable is refused).

## Blockers

None. `env` names: none declared; `akrogon status` shows no `Missing:` lines.
