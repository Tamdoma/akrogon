# Review A: check-env-fidelity

Base: `92dddada` · Reviewed head: `bd996a7ad22225d35328088e7a7d1a1bc0c95d89`

## Scope

Diff `92dddada..bd996a7a`: `src/scope.ts` (+1 flag), `src/run-check.ts` (+1 line), `docs/guide/install.md` and `docs/guide/setup.md` (one line each), `tests/run-units.test.ts` (+35, one serial test), `tests/run-check.test.ts` (+26, one test plus allowlist `LANG`).

## Verified against plan, design and brief

- **D1 / criterion 1**: `'--expand-environment=no'` sits before `--` in `runUnitArgv`; `startRunGuard` and `launchLand` carry no caller argv, correctly untouched. The new serial test drives the real `systemd-run` under `spawnReal` and a nested `akrogon run-check`, asserting all four arguments (`a ${base} b`, `${file.key}`, `$HOME`, `$${x}`) arrive literally plus cgroup membership in the real `akrogon-run-*.scope`. Chart P1 proved the flag on systemd 262; the test was shown red pre-flag (`a  b`, ``, `${x}` in `check-argv-literal-1792695291269-1831453.log`) and green post-flag (`check-argv-literal-1792695471760-1840975.log`).
- **D2 / criterion 2**: `env.LANG = 'C.UTF-8'` is after `env.TMPDIR` and before the `env`/`pass_env` loop, so a declared `LANG` wins; `LANG`/`LC_ALL` absent from `src/config.ts` reserved names (verified). Test asserts default `lang=C.UTF-8`/`wc -m`=1 and `pass_env: ['LANG']` override `lang=akrogon-test-lang`/`wc -m`=2; shown red pre-change (`lang=`/`2`, `check-lang-default-1792695289446-1831199.log`), green post (`check-lang-checks-1792695473714-1841244.log`). Allowlist `LANG` addition cites brief criterion 2 in the `Test-Change:` trailer.
- **D4 / criterion 3**: install.md prerequisites name systemd 254 or later; setup.md `pass_env` bullet names keyring credential hiding, `gh auth login --insecure-storage` and declared `GH_TOKEN`, existing wording verbatim (checked byte-wise in the diff). Proof: `check guide-env: 0` grep plus `check docs-links: 0` (7 tests) on head.
- **Checks**: `akrogon verify` green on `bd996a7a` — 1107 tests, typecheck, format (report cites logs).
- **Trailers**: `37537ba3` carries `Test-Change:` for both touched test files, naming the added cases and the cited expectation change.
- **Docs**: the changed behavior pages are the two edited files; `setup.md`'s constructed-environment paragraph stays true (LANG/LC_* were never listed), `src/AREA.md` unchanged and still accurate. No other documented behavior changed.
- **Scope**: exclusions held — no run deadline, no bus proxy, no `GH_TOKEN` copying, no `copied`/`forbidden`/`config.ts` edits.

## Findings

None. No Fix, no Nit, no operator action.

Verdict: **ready**
