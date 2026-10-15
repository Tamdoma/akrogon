# Brief 1: state-home core (unit U1)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/state-home-u1 (detached at leaf HEAD 16a3bb7).

## 1. Goal

Implement plan decisions D1–D7 and D9: move akrogon's machine state home out of the code tree to `~/.akrogon` (or `AKROGON_HOME`), with a one-shot self-cutover on the first CLI command after deploy.

## 2. Acceptance criteria

1. `globalHome()` returns `AKROGON_HOME` when set; else `~/.akrogon` when `~/.akrogon/config.yaml` exists; else `toolRoot` when `<toolRoot>/config.yaml` exists; else `~/.akrogon`. Resolved per call, no memoization.
2. `src/akrogon.ts` calls `migrateStateHome()` as the first statement, before `parseArgs` and before any state read.
3. Cutover runs only when `globalHome() !== toolRoot`, `<stateHome>/config.yaml` is absent, and `<toolRoot>/config.yaml` exists. While cutting over it holds `flock` on `<toolRoot>/.lock` and every file in `<toolRoot>/runs/locks/`, verifies zero live records in `<toolRoot>/runs/*.yaml` (pid+start_time+boot_id liveness exactly as src/admission.ts computes it) and zero foreign processes referencing `toolRoot` (foreign `/proc/*/cmdline` containing the toolRoot path, or `/proc/*/cwd` symlink resolving inside it; exclude the cutover process itself and its ancestors), then copies the fixed set `config.yaml`, `held.yaml`, `admission.lock`, `paused.yaml`, `stopped.yaml`, `.lock`, `reconcile-host.json`, `reconcile/`, `runs/`, re-runs both checks, and commits `<stateHome>/config.yaml` last via temp+rename. Copies, never deletes. Skips silently (no output) when a gate fails; prints exactly one line `moved state home: <toolRoot> -> <stateHome>` on success.
4. In the committed `config.yaml`, each non-absolute `repos:` value is rewritten to `expandPath(value, toolRoot)`.
5. `src/AREA.md` gains one line naming `src/state-home.ts` and the moved home.
6. All six tests in tests/state-home.test.ts pass. The planned tests are red on HEAD (cutover absent) — do not edit them; a test that stays red with correct code is a mismatch return to A.

## 3. Read-first list

- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md
- src/config.ts — `globalHome()` at ~line 196, `readGlobal`, `expandPath`, `toolRoot`
- src/akrogon.ts — CLI entry top; no module-level `globalHome()` reads today, keep it that way
- src/admission.ts — record liveness (`live`, `startTime`, `liveStartTime`, `bootId`, `recordPath`); reuse by import where possible
- src/state.ts:203 — `withLock` (flock via child process); reuse for `.lock` and slice locks
- src/shell.ts — `writeYaml`, `command`, `run`
- tests/state-home.test.ts — the contract: temp tool-root copy spawned with `AKROGON_HOME` unset
- tests/helpers.ts — fixture conventions
- src/init.ts:88 — config write through `globalHome()`, unchanged

## 4. Change list and interfaces

- src/config.ts: change `globalHome()` per criterion 1. `toolRoot` unchanged.
- src/state-home.ts (new): `export async function migrateStateHome(): Promise<void>` per criterion 3–4. It may import `toolRoot`, `expandPath`, `globalHome` from './config' and `withLock` from './state'. Live-record detection may reimplement the small liveness check locally (record file fields pid/start_time/boot_id/state) since admission's helpers are not exported — prefer importing `liveRuns` if it accepts a directory, otherwise a local equivalent of ~15 lines.
- src/akrogon.ts: `await migrateStateHome()` first line after imports (top-level await is fine; the file is a bun entrypoint).
- src/AREA.md: one line under "Key files" for `src/state-home.ts`.
- Holds at once: `.lock` plus every existing `runs/locks/*` file — acquire all before gating, release on any abort path. Re-check gates after copying; abort → release, return silently.
- Unit owns: src/config.ts, src/state-home.ts, src/akrogon.ts, src/AREA.md, tests/state-home.test.ts (read-only). No prerequisite units.

## 5. Do-not

- Do not edit or write tests — the planned file is A's; a red or wrong expectation is a mismatch return.
- Do not delete tool-root files; copy only.
- Do not touch repo-side state (`issues/`, timings) or `worktreeStore`, `leafTemp`.
- Do not memoize `globalHome()` or cache the home path across the cutover.
- Do not widen scope into release-deploy, link changes, or removing tracked state files from git.
- Reasons: the tests are the contract; tracked copies stay until the host runs from `~/.akrogon` (locked design); scope beyond is a separate leaf. Exception: a revised brief from A.

## 6. Ordered steps

1. Read src/config.ts, src/admission.ts, src/state.ts `withLock`, src/shell.ts, tests/state-home.test.ts.
2. Edit `globalHome()` in src/config.ts.
3. Write src/state-home.ts implementing criterion 3–4.
4. Insert the `migrateStateHome()` call in src/akrogon.ts.
5. Add the AREA.md line.
6. Run `bun install --frozen-lockfile` in your worktree, then the test command below.

Advisory: ~4 files, under 20 turns.

## 7. Commands

```sh
akrogon run-check --name state-home-tests -- bun test tests/state-home.test.ts
```

Run it from your worktree root. Also `bun run typecheck` for your own signal (not recorded evidence).

## 8. Done-when, evidence and report

All six tests green under `akrogon run-check` (cite the `check <label>: <exit> <path>` line), one commit holding only your files, and these four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
