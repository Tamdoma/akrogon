# Brief 1: store resolution, guard verb, check composition (plan U1)

## 1. Goal

Move leaf worktrees into an akrogon-owned store outside every checkout and guard module resolution so a worktree never inherits `node_modules` from an ancestor checkout. Covers plan decisions D1, D3, D4, D5, D9 (helpers only). Plan: `issues/open/worktree-isolation/worktree-store/plan.md` in the registered root.

## 2. Acceptance criteria

1. `repoSchema.worktree_root` is optional. `worktreeStore(repo)` returns `expandPath(worktree_root, repo.root)` when set (so `~/x` expands against the OS home and relative paths resolve at the repo root) and `resolve(homedir(), '.akrogon/worktrees', repo.name)` when unset. `akrogon config` still prints the resolved absolute `worktree_store`.
2. New `src/guard.ts` exports `checkLocation(targetPath: string): void` and a CLI entry `guard(cwd, kind)` (name yours) returning an exit code. A helper walks ancestors: from `dirname(target)` upward, skip nonexistent literal directories, `realpathSync` each existing directory, and report the first canonical ancestor holding `node_modules/` or `package.json`. The target itself is never an ancestor of itself.
3. `akrogon guard ancestors` resolves `git rev-parse --show-toplevel` at cwd, prints the offending ancestor path (stderr), exits 1 on refusal, else 0. `akrogon guard own-modules` exits 1 naming `<toplevel>/node_modules` when that directory is missing, else 0. Any other argument exits non-zero with usage. Both are callable only inside a checkout; a non-repo cwd may fail naturally.
4. `checkLocation(targetPath)` throws `Error` naming the offending ancestor; accepts a nonexistent target when ancestors are clean. It is the shared primitive sibling leaves call.
5. `withSetup` in `src/config.ts` composes exactly, with `setup`: `akrogon run-check --name <quoted> -- sh -c <quoted inner>` where inner is `akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup> && akrogon guard own-modules && <cmd>`; without setup inner is `akrogon guard ancestors && akrogon guard own-modules && <cmd>`. Applied to `checks`, `merge_checks`, `advisory` as today.
6. `src/akrogon.ts` gains `case 'guard'` (one positional `ancestors|own-modules`, `process.exitCode = await (await import('./guard')).guard(process.cwd(), positionals)` pattern matching `run-check`), and `guard` joins the Usage string. `README.md` gains a command-table row and `tests/command-reference.test.ts` gains contract `guard: '<ancestors|own-modules>'`.
7. `tests/helpers.ts` `cli()` passes `HOME: f.home` in the spawned env (after the defaults, before caller `env` so a test may still override).
8. Tests: `tests/guard.test.ts` (new) covers: ancestors refuses naming the ancestor dir holding `node_modules` and separately `package.json`; accepts a toplevel that itself holds `package.json`; accepts a nonexistent path, refuses it naming the ancestor when an ancestor holds `node_modules`/`package.json`; own-modules refuses naming the missing path and passes once created; printed `checks` command from a worktree whose ancestor holds `node_modules` exits non-zero naming that path before `setup` runs (setup marker absent); printed command on a worktree missing own `node_modules` exits non-zero naming it and the check does not run. `tests/config.test.ts` updates: store-shape case gets unset (`<f.home>/.akrogon/worktrees/repo`) and `~/x` rows; composed-string expectations get the guards; every printed-check runtime test supplies a `node_modules` in the worktree when the fixture has no `setup` that creates it — prefer the smallest edit, e.g. `setup: 'mkdir -p node_modules'` or an existing install fixture.
9. One deliberate break proves a guard test goes red (e.g. drop `guard ancestors` from `withSetup`, run that one test, revert); note it in the report.
10. `bun test tests/guard.test.ts tests/config.test.ts tests/command-reference.test.ts tests/helpers-driven` green in the worker worktree; `bun run typecheck` green.

## 3. Read-first list

- `src/config.ts` (`repoSchema` line ~42, `expandPath` ~194, `worktreeStore` ~250, `withSetup` ~274, `effectiveConfig` ~298)
- `src/akrogon.ts` (verb options ~20-38, `run-check` case ~150, Usage ~165)
- `src/shell.ts` (`run`, `command`, `CommandError`, `quote`)
- `src/run-check.ts` (context: guards run inside its wrapped `sh -c` with PATH incl. fake `akrogon` shim in tests)
- `tests/helpers.ts`, `tests/config.test.ts` (see `runCheck` helper at top and `installFixture` ~364; copy those patterns)
- `tests/command-reference.test.ts` contract table
- `README.md` command table (~line 130-150)
- `~/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `src/config.ts`: `worktree_root` → `text.optional()`; `worktreeStore(repo)` branches per criterion 1; `withSetup` per criterion 5. `expandPath(path, base)` unchanged. No other function touched.
- `src/guard.ts` (new): `checkLocation(targetPath)` throws naming ancestor; `guard(cwd: string, positionals: string[]): Promise<number>` implementing `ancestors|own-modules`; internal `offendingAncestor(target): string | null` doing the canonicalizing walk from `dirname(target)`. Use `realpathSync` only on existing dirs (check `existsSync` first; a nonexistent dir can never hold entries).
- `src/akrogon.ts`: `guard` case + Usage line `...|status|run-check|guard>`.
- `tests/helpers.ts`: `env: { ...process.env, AKROGON_HOME: f.home, HERDR_PANE_ID: '', HOME: f.home, ...withDefault }` in `cli()`.
- `README.md`: one row `akrogon guard <ancestors|own-modules>` | Refuse when a canonical ancestor of the checkout holds node_modules or package.json, or its own node_modules is missing. (concise, match table voice).
- `tests/command-reference.test.ts`: add `'guard': '<ancestors|own-modules>'` to `contracts`.
- `tests/config.test.ts`: store-shape table gains unset + `~` cases; `runCheck` helper expectations gain both guards; runtime printed-check tests ensure own `node_modules` exists (setup or mkdir).
- `tests/guard.test.ts` (new): real temp repos via `fixture()`/`command()`/`cli()`/`printedChecks`; run `akrogon guard ...` through `cli(f, ['guard','ancestors'], cwd, baseEnv)` — `cli` resolves the entry `src/akrogon.ts` directly. For the "inside worktree whose ancestor holds node_modules" case, create `package.json` or `node_modules/` in a temp parent above the worktree, not inside the repo.

Interfaces this brief must export for sibling units (exact names matter — U3 imports them): `worktreeStore` (unchanged signature), `checkLocation(targetPath: string): void`, `guard(cwd: string, positionals: string[]): Promise<number>`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts`, `src/batch.ts`, `src/sync.ts`, `src/init.ts` or their test files — owned by wave-2 units; the exception is nothing, wave 2 handles them.
- Do not change `leafTemp`, `run-check` internals, or env construction — check-env owns those; exception: none.
- Do not create worktrees under the real `$HOME` — every test path stays inside `f.home`; `cli()` now sets `HOME` so `homedir()` resolves there.
- Do not weaken an existing assertion to make it pass — a contradicting old expectation needs the brief outcome or real source cited in the `Test-Change:` trailer; exception: documented new default store behavior (this brief, criterion 8) is the cited source for store-shape changes.
- Do not add fallbacks, broad try/catch, or extra verbs — return a mismatch with evidence instead; exception is a revised brief from A.
- Do not run `git worktree add` under the worker worktree root — the fixture's `command()` runs against `f.root`.
- Restated: wave-2 files, check-env internals, real-HOME writes, weakened assertions, fallbacks are all out; mismatches come back to A, not scope changes.

## 6. Ordered steps

1. Read the read-first files; run `bun test tests/config.test.ts` to see the current green baseline.
2. Update `tests/config.test.ts` store-shape + composition expectations and `tests/helpers.ts` `HOME` (criteria 1, 5, 7, 8) — tests first.
3. Write `tests/guard.test.ts` (criteria 2, 3, 4, 8 runtime cases) — tests first, expect red.
4. Implement `src/guard.ts`, `src/akrogon.ts` guard case + Usage, `src/config.ts` schema/store/withSetup, README + contract (criteria 1-6).
5. `bun install` already done in your worktree; run commands from section 7 plus `bun run typecheck`; iterate to green.
6. Deliberate-break check per criterion 9; revert; confirm green again.

Advisory size: about 7 files and under 30 turns.

## 7. Commands

Changed-test command (from `checks.test_changed`):
`AKROGON_BASE=309d742605a0516067840863ffdf3be29b03fc0c bun test --changed="$AKROGON_BASE" --timeout=30000`

If that runner's scoping misses your new file, run it explicitly: `bun test tests/guard.test.ts tests/config.test.ts tests/command-reference.test.ts --timeout=30000` and `bun run typecheck`.

## 8. Done-when, evidence and report

All acceptance criteria green in your worktree with pasted outputs; commits carry `Test-Change:` trailers for every changed existing test file (`tests/helpers.ts`, `tests/config.test.ts`, `tests/command-reference.test.ts` — all match the `src/test-files.ts` path rule; cite "worktree-store leaf: new default store and guard composition" as source); report lists the deliberate-break evidence.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
