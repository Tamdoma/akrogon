# Brief 1 (unit U1): display variables in run-check, verify pass and land launches

## 1. Goal

Implement plan decisions D1, D2, D3: one exported display-name list feeds the run-check payload environment, the verify pass unit launch and the land unit launch, so every checked command sees its caller's graphical session. Leaf: akrogon/caller-display (Tamdoma/akrogon#155 — a `--headed` Playwright run under `akrogon run-check` died with "Missing X server or $DISPLAY" because no display variable reaches the command).

## 2. Numbered acceptance criteria

1. `src/run-check.ts` exports `displayEnv: readonly string[]` holding exactly `['DISPLAY', 'XAUTHORITY', 'WAYLAND_DISPLAY', 'XDG_RUNTIME_DIR']`, and `copied` spreads it, so `constructedEnv` copies each of the four from the caller exactly when `process.env[name] !== undefined` (empty string copied, undefined not). `constructedEnv` itself is not restructured — the existing `value !== undefined` loop already has the right blank semantics.
2. `src/verify.ts`: `passForwarded` takes the three non-runtime display names (`DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`) from the shared `displayEnv` list — for example a spread filtered on the name, or a derived slice; `XDG_RUNTIME_DIR` stays listed on its own as today (it is in both services unchanged per the design). `launchPass` additionally emits one `-p`, `UnsetEnvironment=<name>` argument pair for each of those three names that is `undefined` in the `env` object the launch already filters on (`sessionBusEnv()`), so a held name gets exactly `--setenv=<name>=<value>` (empty value included, never `UnsetEnvironment`) and an absent name gets exactly the unset form — never both, including when a repo lists the name in `pass_env` (the `new Set` dedupe already covers the setenv side).
3. `src/land.ts`: `launchLand` emits `--setenv=<name>=<value>` for each of the three non-runtime display names defined in `process.env`, derived from the shared `displayEnv` list, in the same only-if-defined flatMap form the `AKROGON_*` names already use. Never `UnsetEnvironment`; the one existing `--setenv=XDG_RUNTIME_DIR=${runtimeDir()}` line stays exactly as it is.
4. The planned tests pass: `bun test --timeout=120000 tests/display-env.test.ts` — all six tests green in the worker worktree (one pre-existing test elsewhere stays red; see section 7).
5. Nothing else changes: `src/config.ts`'s `constructed` reserved set does not gain the four names (they must stay valid in `env`/`pass_env`); `XDG_SESSION_TYPE` and `WAYLAND_SOCKET` are never added anywhere; the `env.DBUS_SESSION_BUS_ADDRESS = 'unix:path=/nonexistent'` assignment keeps its place after the copy loops.

## 3. Read-first list

- `src/run-check.ts` — `copied` and `constructedEnv` (top of file)
- `src/verify.ts` — `passForwarded` and `launchPass` (search the names)
- `src/land.ts` — `launchLand`
- `src/scope.ts` — `sessionBusEnv`, `runtimeDir`, `runUnitArgv` (read-only context: how the values travel)
- `tests/display-env.test.ts` — the planned tests (read them as the spec; do not edit)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- You own exactly: `src/run-check.ts`, `src/verify.ts`, `src/land.ts`. Edit no other file — no test files, no docs, no config.
- Interface you create: `export const displayEnv: readonly string[]` in `src/run-check.ts`. A later step (not yours) imports it in `tests/run-check.test.ts`.
- Chunks that must land first: none. Shared test resource: none. The worker worktree is at `/home/ivan/.akrogon/worktrees/akrogon/caller-display-u1`, created detached at commit `5f699994d32e98d021cd8fc23d252332fdfac2f4` (the leaf's test-only commit; the planned tests are already in it and red on base).
- One unit; no other worker touches your files. A docs worker runs in parallel on disjoint paths.

## 5. Do-not, reasons and exceptions

- Do not edit any test file, including when `tests/run-check.test.ts`'s allow-list test goes red after your change — that correction is A's own planned step, and a worker writes and edits no test. If you believe a planned test is wrong, return a mismatch with evidence instead.
- Do not add the names to `src/config.ts`'s reserved `constructed` set: repos already list them in `pass_env` and must keep loading.
- Do not emit `UnsetEnvironment` from `launchLand` and do not emit `--setenv` for a name the caller lacks — the verify pass carries the caller's state exactly; the land unit sets only what the caller holds (locked design decisions).
- Do not copy `XDG_SESSION_TYPE` or `WAYLAND_SOCKET` anywhere: the session type must stay probed by the client, and the socket is an inherited fd number.
- Do not restructure `constructedEnv`, `launchPass` or `launchLand` beyond the listed edits — smallest diff.
- Never run any `git stash` subcommand: every worktree of the repo shares one stash and a pop can lift a sibling's edit. To set work aside, commit it as a WIP commit and, before returning, `git reset --soft 5f699994d32e98d021cd8fc23d252332fdfac2f4` and make the unit's one returned commit.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change. Restated: the exclusions above matter because they are locked design decisions or A-owned work, and the only exception is a revised brief.

## 6. Ordered steps

Advisory size: 3 files, under 15 turns.

1. Install dependencies in your worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
2. `src/run-check.ts`: add the exported `displayEnv` list and spread it into `copied` (criteria 1).
3. `src/verify.ts`: derive `passForwarded`'s display names from the shared list and add the if-undefined `-p UnsetEnvironment=<name>` emission in `launchPass` (criterion 2).
4. `src/land.ts`: extend the only-if-defined flatMap list with the three display names derived from the shared list (criterion 3).
5. Run `bun test --timeout=120000 tests/display-env.test.ts` in your worktree — all six tests green (criterion 4).
6. Run `bun run typecheck` (kept through run-check, see section 7/8).
7. Commit your chunk as one commit with a message naming the mechanism; no `Test-Change` trailer (you touch no test file).

## 7. Commands

Targeted tests only, each kept through `akrogon run-check --name <label> -- <cmd>` run from your worktree:

- `akrogon run-check --name u1-display-tests -- bun test --timeout=120000 tests/display-env.test.ts`
- `akrogon run-check --name u1-typecheck -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile --backend=copyfile" && bun run typecheck'`

Expected and accepted: `tests/display-env.test.ts` fully green. Do not run the whole suite. Known upfront, not your repair: `tests/run-check.test.ts`'s allow-list test is red once `XDG_RUNTIME_DIR` reaches the payload — A corrects that expectation separately; never edit the test.

## 8. Done-when, evidence and report

All acceptance criteria met, the two commands green with their `check <label>: <exit> <path>` lines cited, one commit holding exactly your three files. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
