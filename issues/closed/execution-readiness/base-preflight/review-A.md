# Review A: base-preflight

Base `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`, reviewed head `6d4225740b1dea4fb5853dec2b141bcb95d0af71` (3 commits ahead of base). `git status --porcelain` clean — no uncommitted work. Verified independently, not just from the report.

## Verification evidence

- `bun test tests/preflight.test.ts tests/command-reference.test.ts`: 12 pass, 0 fail (rerun by me).
- `bun test tests/next.test.ts` filtered to the new dispatch tests: 10 of the 8 new cases exercised across three filters (missing base ×3, tracking-ref worktree tests ×2, unreachable ×5-incl. older tests, remote-gone ×2, same-named ×1) — all pass.
- `bun run typecheck`: clean.
- `.evidence/preflight-verify.log` retained outside tracked `issues/`: real CLI output for C1/C2/C3/pass/impostor confirmed.
- Probe semantics re-verified live in a scratch repo: missing tracking ref → `rev-parse --verify --quiet` exit 1; missing remote → `get-url` exit 2; unreachable remote → `ls-remote` exit 128 (not 2), so C1-from-get-url and C2-only-on-2 are correct classifications.

## Criteria check

- C1-C3 (preflight CLI): `tests/preflight.test.ts` drives real temp repos; C1/C2/C3 remediation strings asserted, pass prints `origin/main <sha>`. Code matches D2 mapping.
- C4: unregistered and non-repo cwd refuse via `requireRepo` with zero writes (`readdirSync(nonRepo)` asserted empty); zero-leaf fixture passes.
- C5: the gate sits in `dispatchLeaf` after `seats()`, before `allocate()` — before any `panes()`/`tabs()` call, matching the debate-adopted B placement and plan D4. `refusal()` helper asserts exit 1, exactly one JSON skip line, zero herdr calls, zero tabs/panes, no worktree dir, no `state.worktree`. All three leaf states covered (new, existing branch without worktree, existing worktree).
- C6: unreachable-remote + existing worktree dispatches fine (no remote query); same remote + missing worktree refuses Unproven. Local-failure classification tested both ways (C3 when remote branch lives, C2 when gone).
- C7: `worktree add` and `base()` consume `trackingRef()`; impostor branch+tag test asserts `refs/heads/fresh` and `AKROGON_BASE` equal the tracking commit. Verified `AKROGON_BASE` diverges correctly in the dedicated config test.
- C8/C9: README row, `preflight: ''` contract, shapes.md sentence names the verb, the registered root, before-any-write ordering, and refuse-on-nonzero.
- C10: suite green per report plus my partial reruns; format applied.

## Docs

`src/AREA.md` gained the preflight line; every path it names exists (checked). `tests/AREA.md`, `skills/AREA.md` need no changes — no test/skill-file structure changed. Guide grep: no page states base prerequisites or contradicts the gate; `docs/guide/next.md` describes dispatch forms only. shapes.md change matches criterion 9 verbatim.

## Findings

- N1 (Nit): `src/config.ts` now imports `trackingRef` from `./preflight` while `preflight.ts` imports `readGlobal`/`requireRepo`/`Repo` from `./config` — a new module cycle. It works (calls are deferred to runtime) and the codebase tolerates cycles elsewhere (`state.ts` ↔ `park.ts`), but `trackingRef` is a pure string derivation from repo config like `target()`; placing it in `config.ts` removes the cycle for free. Not blocking.
- N2 (Nit): `checkBase`'s C3 classify path calls `remoteBase`, which re-runs `ensureRemote` — a redundant `git remote get-url` on every local-ref failure. Cosmetic cost, keeps the probes self-contained; fine as-is.

No Fix findings: every Fix-class candidate resolved as intended behavior or locked scope (D9's `target()` in `phase.ts` is design-excluded and recorded in the report).

## Verdict

ready

## Merge pass (slot A)

Rebase onto `origin/main` `1ca42c5905d568d1753493633a3d826d7e07cffd` (11 upstream commits, including `worker-path`'s `worktreeStore` helper and an operation-proof sentence in shapes.md). Prior reviewed head `6d4225740b1dea4fb5853dec2b141bcb95d0af71`, resolved head `b2c86a9`.

- Conflict: `skills/chart-issues/assets/shapes.md` — both sides appended a sentence to the same paragraph; kept both (upstream operation-proof refusal + my `akrogon preflight` sentence).
- Adaptation: `mustCreate` path now uses `worktreeStore(repo)`, the helper upstream added; same value, matches `ensureWorktree`'s new form. Amended into the polish commit.
- `git range-diff 1607ee7..6d42257 1ca42c5..b2c86a9`: only the shapes.md context and the `worktreeStore` line differ; no semantic drift.
- AKROGON_BASE after rebase: `1ca42c5905d568d1753493633a3d826d7e07cffd` (== origin/main).
- Checks in worktree: `bun run format` clean, `bun run typecheck` clean, `bun test --changed=$AKROGON_BASE` 321 pass / 0 fail / 14 files, `bun test` 324 pass / 0 fail / 15 files.
