# Brief 1: check-env schema, leafTemp root, withSetup wrapper

## 1. Goal

Plan unit U1 (decisions D4, D5, D8-schema, D9). In `src/config.ts`: add `env:` and `tools:` fields to `repoSchema`, move `leafTemp`'s default root to the home disk, and rewrite `withSetup` so every printed check command runs through `akrogon run-check`. Update `docs/guide/setup.md` and the existing `tests/config.test.ts` expectations.

## 2. Acceptance criteria

1. `repoSchema` accepts `env: [NAME, ...]` and `tools: [name, ...]`; both default `[]`.
2. `env:` entries matching `/^[A-Z_][A-Z0-9_]*$/`; entries colliding with `TMPDIR`, `AKROGON_BASE`, or `NODE_PATH`, `BUN_OPTIONS`, `BUN_INSTALL_CACHE_DIR`, `FFMPEG_BIN`, `CHROME_PATH`, `CDP_BROWSER_BINARY` are rejected by schema refinement naming the entry.
3. `leafTemp(repo, slug)` returns `~/.akrogon/scratch/<repo name>/<slug-prefix>-<hex12>` when `AKROGON_LEAF_TEMP_ROOT` is unset; the override path, its non-blank absolute validation and the hash are unchanged.
4. `withSetup` output for `checks.test` = `akrogon run-check --name test -- sh -c <quote(inner)>` where inner is today's string: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup> && sh -c <quoted cmd>` when `setup` exists, else `<cmd>` verbatim. Same for each `merge_checks` name; `advisory[i]` uses `--name advisory-<i>`.
5. A config with no `setup` still prints commands wrapped in `akrogon run-check` (brief DC6).
6. Existing `akrogon config` output keys unchanged otherwise.

## 3. Read-first

- `src/config.ts` — repoSchema (~:40-83), `leafTemp` (~:236), `withSetup` (~:256), `quote` import already present.
- `tests/config.test.ts` — existing withSetup/setup assertions to update; `fixture`, `yaml` helpers.
- `docs/guide/setup.md` — config key list (~:53-67).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Plan: `/home/ivan/Work/infra/akrogon/issues/open/worktree-isolation/check-env/plan.md` decisions D4, D5, D8, D9.

## 4. Change list and interfaces

Owned paths: `src/config.ts`, `tests/config.test.ts`, `docs/guide/setup.md`.
Lands first: nothing. Consumed by later units: `env:`/`tools:` fields, wrapped command shape `akrogon run-check --name <n> -- sh -c <inner>` (worker 2 implements the verb against exactly this shape).
No shared test resource.

- `env: z.array(text).default([])` and `tools: z.array(text).default([])` added to `repoSchema` strictObject; extend the existing `superRefine` for criterion 2 (rejection `message` names the offending entry, `path: ['env']`).
- `leafTemp`: `const root = override ?? resolve(homedir(), '.akrogon/scratch', repo.name)` — `homedir` is already imported.
- `withSetup`: build `inner` (current behavior), then `wrap = 'akrogon run-check --name ' + <key> + ' -- sh -c ' + quote(inner)`; advisory names `advisory-0`, `advisory-1`, … Do NOT remove the early return for `setup === undefined` — restructure so mapping always runs (inner differs only).

## 5. Do-not, reasons and exceptions

- Do not implement `run-check` itself or touch `src/akrogon.ts`: owned by worker 2; this brief only produces the wrapper string. Exception: revised brief.
- Do not touch `src/attempts.ts`, `src/state.ts`, `src/next.ts`: owned by other units.
- Do not change the inner `flock`/`sh -c` composition: worktree-store splices its guards into that exact middle later.
- Do not invent an `env:` value list for this repo's `issues/config.yaml`: operator step S1 outside the leaf.
- If any plan decision conflicts with live code, return a mismatch naming the decision and evidence instead of re-scoping; the exception is a revised brief from A.

## 6. Ordered steps

1. Read `src/config.ts` sections and `tests/config.test.ts` fully; grep `withSetup\|setup` in tests to find every expectation to update.
2. Update `repoSchema` (fields + refinement), `leafTemp`, `withSetup` per criteria.
3. Update/extend `tests/config.test.ts`: wrapped output asserts the new prefix for a setup repo and a no-setup repo (parse `akrogon config` YAML via existing patterns), schema rejection tests for a bad env entry and a reserved-name entry, `leafTemp` default root assertion.
4. Run changed tests; iterate to green.
5. Update `docs/guide/setup.md` key list: `env` (names copied into each check command's constructed environment; unset names stay unset), `tools` (PATH tools resolved at merge dispatch, recorded on merge attempts), and one line that every printed check command runs under `akrogon run-check` which refuses forbidden caller env (`NODE_PATH`, `BUN_OPTIONS`, `BUN_INSTALL_CACHE_DIR`, `FFMPEG_BIN`, `CHROME_PATH`, `CDP_BROWSER_BINARY`, global bunfig) and runs in a constructed env.
6. `bun run format` on touched files if needed (repo style).

Advisory size: 3 files, under 30 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/check-env-u1
bun install
AKROGON_BASE=354c80e14aca6483c430312c61ae5c1397bb548e sh -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'
```

## 8. Done-when, evidence and report

All criteria green via `tests/config.test.ts`; changed-test command passes. Commit on the detached worktree; commit message ends with a `Test-Change: tests/config.test.ts <reason>` trailer for each change to that existing test file (added cases: name what was added, no existing expectation changed). Report the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
