# Implementation report: check-env-fidelity

Base: `92dddada` (AKROGON_BASE). Committed head: `bd996a7ad22225d35328088e7a7d1a1bc0c95d89`. Delegated run, wave 1 = all three units (u1, u2, u3), disjoint paths.

## Changed files and reasons

- `37537ba3` (planning) `tests/run-units.test.ts`, `tests/run-check.test.ts` — planned red-first tests for criteria 1 and 2 plus the allowlist `LANG` entry (D6); `Test-Change:` trailers per file.
- `202704d4` (u1) `src/scope.ts` — `runUnitArgv` adds `'--expand-environment=no'` after `'--quiet'` (D1); worker commit `dee82361` cherry-picked.
- `6b3b12e2` (u2) `src/run-check.ts` — `constructedEnv` sets `env.LANG = 'C.UTF-8'` after `env.TMPDIR`, before the `env`/`pass_env` copy loop so a declared `LANG` wins (D2); worker commit `f62e303` cherry-picked.
- `bd996a7a` (u3) `docs/guide/install.md`, `docs/guide/setup.md` — systemd 254 floor in prerequisites; `pass_env` bullet gains the keyring/gh file-token or declared-`GH_TOKEN` sentence (D1/D4); worker commit `4e2c283` cherry-picked.

## Commands run and results

- u1 targeted (worker): `akrogon run-check --name argv-literal -- bun test --timeout=45000 tests/run-units.test.ts -t 'byte for byte'` → `check argv-literal: 0 .../check-argv-literal-1792695451674-1838186.log`
- u2 targeted (worker): `akrogon run-check --name lang-checks -- bun test --timeout=30000 tests/run-check.test.ts -t 'LANG|allowlisted'` → `check lang-checks: 0 .../check-lang-checks-1792695445589-1837646.log`
- u3 targeted (worker): `akrogon run-check --name docs-links -- bun test --timeout=30000 tests/docs-links.test.ts` → `check docs-links: 0 .../check-docs-links-1792695458658-1838637.log`
- Post-pick reruns on the lane (each after its cherry-pick): `check argv-literal: 0 .../check-argv-literal-1792695471760-1840975.log`, `check lang-checks: 0 .../check-lang-checks-1792695473714-1841244.log`, `check docs-links: 0 .../check-docs-links-1792695475946-1841597.log`
- Criterion 3 proof: `akrogon run-check --name guide-env -- sh -c "grep -n '254' docs/guide/install.md && grep -n 'insecure-storage\|GH_TOKEN' docs/guide/setup.md"` → `check guide-env: 0 .../check-guide-env-1792695482292-1841881.log` (install.md:14 names systemd 254; setup.md:63 names the keyring cut, `--insecure-storage` and `GH_TOKEN`).
- `akrogon verify` on `bd996a7a`: `verify leaf bd996a7ad22225d35328088e7a7d1a1bc0c95d89: green` — setup 0, `test` 1107 pass/0 fail in 149.78s (`check-test-1792695635327-1841988.log`), `typecheck` 0 (`check-typecheck-1792695637411-1841988.log`), `format` 0 (same verify run). Wall time: ~2.5 min.

## Done-criteria proof

1. **argv byte-for-byte, scope and nested**: `check argv-literal: 0` on head `202704d4`/`bd996a7a` — outer and inner `printf` outputs equal the four arguments literally; cgroup assertions confirm the real `akrogon-run-*.scope` unit under the test slice. Before state (planning): expanded to `a  b`/``/`${x}` — `check argv-literal: 1 .../check-argv-literal-1792695291269-1831453.log`.
2. **LANG=C.UTF-8 default, declared override**: `check lang-checks: 0` on head — `lang=C.UTF-8`/`wc -m`=1 without a declaration, `lang=akrogon-test-lang`/`wc -m`=2 with `pass_env: ['LANG']`. Before: `lang=`/`2` — `check lang-default: 1 .../check-lang-default-1792695289446-1831199.log`.
3. **Docs**: `check guide-env: 0` grep hits plus `check docs-links: 0` (7 tests) on head.

## Refresh

Opening refresh: branch already at `origin/main` (`92dddada`), nothing to rebase; no later refresh needed — no pending lane edits and no new main commits during the pass.

## Known limitations

- Flag proven on systemd 262 (chart P1); 254–261 covered by the documented floor only.
- JVM path-encoding effect (#111) is intake evidence; no JDK on host.
- gh file-token storage rests on the 2026-10-13 T1 proof; this host's gh uses the keyring.
- #110 mise shim hang remains open and out of scope.

Unverified criteria: none.
