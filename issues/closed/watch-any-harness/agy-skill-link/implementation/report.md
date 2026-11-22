# Implementation report: agy-skill-link

## Changed files and reasons

- `src/install.ts` — `planSkillLinks` `roots` gains `'.gemini/config/skills'`. One list feeds link planning, owned-link repointing, conflict refusal and the stale scan, so `install()` and the deploy `links` step in `src/self-update.ts` (same `planSkillLinks` call with `listRoot` at the new release) both get the agy root with identical handling.
- `tests/install.test.ts` — file-level `roots` gains the same entry (every parameterized case now covers agy); literal-path assertions added for `<home>/.gemini/config/skills/<skill>` in the absent-roots test (checkout source) and the listener-release test (release source); `release-link` seed per root proves old-release pruning at the agy root.
- `tests/deploy-fixture.ts` — shared `roots` gains the entry so deploy/rollback tests assert the agy destination through the deploy `links` step.
- `docs/start/install.md` — root list line gains `~/.gemini/config/skills`.

## Commits

- Base: `4defba1e7d8ef20df3b2ce6b039fd598b33ea0fc` (= `origin/main` at pass time; `git fetch` + merge-base check, already current, no rebase moved the branch).
- `8a0d6692` test: agy skill root `.gemini/config/skills` in install and deploy fixtures (Test-Change trailers for both test files).
- `7c6ab783` feat: link skills into agy's `~/.gemini/config/skills` (product + doc).
- Head: `7c6ab78339102109625966100b2c0454bc6ae6cf`.

## Refresh

`git fetch origin` + `git merge-base --is-ancestor 4defba1e origin/main`: base already current; no branch move. Refreshed `akrogon config` — `AKROGON_BASE` unchanged.

## Criterion proofs

Done at plan.synthesis on this head's content and rerun on committed head `7c6ab783`:

- C1 (`<home>/.gemini/config/skills/<skill>` link per skill, parents created, second install unchanged) — `akrogon run-check --name c1-install -- bun test tests/install.test.ts`: exit 0, 33 pass, `check c1-install: 0 .../check-c1-install-1795182884550-3409261.log`.
- C2 install surface (prune only dangling owned + old-release links, keep real/foreign, repoint owned, refuse non-link/foreign-link before writing) — same `c1-install` run, exit 0.
- C2 deploy surface (deploy `links` step behaves identically at the agy root) — `akrogon run-check --name c2-deploy -- bun test tests/release-deploy.test.ts tests/rollback.test.ts`: exit 0, 23 pass, `check c2-deploy: 0 .../check-c2-deploy-1795182894785-3412309.log`.
- Deliberate-break red evidence is recorded in `plan.md` (`check c1-install: 1` and `check c2-deploy: 1` logs).

## Commands run

- `akrogon run-check --name c1-install -- bun test tests/install.test.ts` — 0 (33 pass). Wall: seconds. `check-c1-install-1795182884550-3409261.log`.
- `akrogon run-check --name c2-deploy -- bun test tests/release-deploy.test.ts tests/rollback.test.ts` — 0 (23 pass). Wall: seconds. `check-c2-deploy-1795182894785-3412309.log`.
- `akrogon verify` (head `7c6ab783`, run `98457245`) — `test` red, 1 fail: `agy: the reset helper runs its stages in order and fresh A gets the start prompt on a new transcript`, 667ms. No cause in leaf diff (diff touches install roots/doc; `tests/door-reset.test.ts` untouched). Retry: `akrogon run-check --name door-reset -- bun test tests/door-reset.test.ts` — exit 0, 16 pass in 4.4s → `inconsistent` (`check-door-reset-1795182980898-3710273.log`).
- `akrogon run-check --name full-test -- sh -c '...bun test --timeout=30000 --parallel=4 --no-isolate'` — first run exit 1 with two different failures (`hc-identity` stale-socket expectation, `next.test.ts` 15s timeout) (`check-full-test-1795183044406-3717925.log`); both pass in `akrogon run-check --name flake-pair -- bun test tests/hc-identity.test.ts tests/next.test.ts` (208 pass, `check-flake-pair-1795183074406-3993434.log`); same-command rerun exit 0, 1233 pass (`check-full-test-1795183183645-4077458.log`) → `inconsistent` on the verify `test` command.
- `akrogon verify --known-red` → `fail`: merge-base `4defba1e` already holds a whole-green leaf row (`cbccd26b`), so a green base never covers a red head; the inconsistent retries above are what stand, and base `4defba1e`'s own test receipt is green, so the mechanism matches learnings/history/2026-11-08-hc-shutdown-unit-leak.md's recorded whole-suite flakiness (varying red names per run, each file green alone). Judgment: the head runs show no failure the base lacks in substance; the leaf diff holds no plausible cause (install roots + doc + test constants only).
- `akrogon verify` rerun on unchanged head — green: format/typecheck green earlier, `verify test: 0` (`check-test-1795183252230-168530.log`), `verify leaf 7c6ab783...: green`.

## Grant and credential use

`readiness.yaml grants: []`, `state.yaml env_names: []` — no paid or live operation, no credentials. No count lines.

## Known limitations / unverified

- No live agy session (design D6/locked: P3 in `forks/timer-design.md` already observed agy loading a linked skill; readiness.yaml `proofs` records it).
- No mechanism change besides the roots entry: stale pruning, repointing and conflict refusal run the same code path for all five roots.
- Known flaky suite on this host (varying timeouts under `--parallel=4`); two `inconsistent` records above with both logs kept.
