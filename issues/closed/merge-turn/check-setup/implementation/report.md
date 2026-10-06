# Implementation report: check-setup

Base: `923c6c98fac3f051a54ac27168ea024215652602` · Head: `331d7bf` (3 cherry-picked worker commits: cb680d9, 5159478, 331d7bf)

## Changed files and reasons

- `src/config.ts` — `repoSchema` gains `setup: text.optional()`; `withSetup` composes `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup> && sh -c <quoted command>` into every `checks`, `merge_checks` and `advisory` value in `effectiveConfig` output only (D1–D4).
- `tests/config.test.ts` — `installFixture` (vendored `file:` dep, committed `bun.lock`, ignored `node_modules/`) plus T1–T6 (D5). Trailer carried on cb680d9.
- `src/AREA.md` — one line naming the composition.
- `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` — locked-setup rule for dependency-using proofs outside printed commands; base-run clause names the locked `setup` form (D7).
- `skills/init-akrogon/SKILL.md` — `setup` proposed only when `git ls-files` names a committed lockfile, per-manager frozen command mapping (D8).
- `docs/guide/setup.md` — `setup` bullet + paragraph (D9).

## Done-criteria → evidence

| # | Proof | Result |
|---|---|---|
| 1 | T1 `config composes setup into printed checks, merge_checks and advisory identically from worktree` — exact composed strings at root and linked worktree, unchanged without `setup` | pass |
| 2 | T2 `config printed check installs into a fresh worktree without a separate install step` — exit 0, `require.resolve` inside worktree `node_modules` | pass |
| 3 | T3 `config printed check resolves the worktree lockfile version over the root install` — widget 2.0.0 from worktree while root `node_modules` holds 1.0.0 | pass |
| 4 | T4 `config printed checks run concurrently in one worktree and leave it clean` — 4× exit 0 via `Promise.all`, `git status --porcelain` empty | pass |
| 5 | T5 `config printed check skips both sides of a \|\| b when the frozen lockfile mismatches` — non-zero, stderr names lockfile, both markers absent | pass |
| 6 | T6 `config runs all of setup inside the install lock` — `! flock -n` probe succeeds only under the held lock | pass |
| 7 | Diff inspection: rule sentence + base-run clause in both SKILL.md files | verified |
| 8 | Diff inspection: committed-lockfile gate + manager mapping + commented proposal line | verified |
| 9 | setup.md bullet + paragraph; `bun test tests/docs-links.test.ts` 3 pass | verified |

## Commands run

- `bun run format` → all files unchanged.
- `bun run typecheck` → clean.
- `bun test --timeout=30000` → 421 pass, 0 fail, 20 files, wall ~16 s.
- `bun test tests/config.test.ts --timeout=30000` (worker) → 14 pass, 0 fail.
- `test_changed` with `AKROGON_BASE=923c6c9…` → 326 pass, 0 fail (run after each cherry-pick and finally).
- Deliberate break (worker u1): composed `… && touch a || touch b` without `sh -c` grouping → T5 red (`||` caught the failed setup, `b` ran); restored → green. Also confirmed the shallow break (dropping `sh -c` but keeping quoting) still passes T5; the raw-command break is the meaningful one.
- Worker's step-0 sanity: `bun install --frozen-lockfile` with `file:` dep succeeded with registry forced to a dead address (offline confirmed).

## Known limitations

- `bun install` writes its banner to stdout, so printed-check stdout carries setup output before the command's own; T2/T3 assert via `toContain`.
- T5 needs `vendor/widget2` to exist in the worktree before desyncing `package.json`, else bun reports a missing `package.json` rather than a lockfile error.
- Probe-carried limits: one machine, Bun 1.4.2, four runners; framework `merge_checks` not exercised live.
- Setting `setup` in akrogon's or framework's `issues/config.yaml` remains an operator commit on main.
- check-issue has no effective-settings sentence in Shared context; its rule sits in the grants/run-conditions paragraph.

## Repairs

- 2026-10-05, F1 (check.repair → check.fix): `skills/init-akrogon/SKILL.md` gated `setup` on `git ls-files`, which lists the index — a staged lockfile is not committed. Both instruction sites now gate on `git ls-tree --name-only HEAD`, with unborn HEAD (exit 128) counting as no committed lockfile. `plan.md` D8 reconciled under `## Implementation notes`; `docs/guide/setup.md` already said "committed", unchanged. Repair commit `0e1d4ff` (prose-only, no test change). Post-repair: docs-links 3 pass, changed tests 326 pass, format unchanged, typecheck clean, full suite 421 pass, `git status` clean.

## Unverified criteria

None.
