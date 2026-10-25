# Worker brief 4 — phase.ts + log.ts + verify.ts + land.ts routing and land env (plan U5)

## 1. Goal

Route the phase/log/verify/land herdr surfaces through the resolved repo session (plan D9-D11) and drop `HERDR_SOCKET_PATH` from the land unit environment.

## 2. Acceptance criteria

1. `phase.ts` `closeTab` resolves `repoSession(leaf.repo)`; a refusal or stopped session returns without error and the tab stays. Its `pane`/`tab` calls run in the resolved session.
2. `log.ts` `writeDay`'s `pane list` resolves and runs in the leaf's repo session; a refused or stopped session yields an empty list (the no-write path stays no-write). `logMove`'s `herdr` calls and `landed`'s `readDead` need no session (they take a `worktree` string; verify and leave unchanged).
3. `verify.ts` `verify`'s `panes()` check resolves the leaf's repo session and runs routed in it.
4. `land.ts`: `herdrUnitEnv` drops `HERDR_SOCKET_PATH` (socket env var) from `passEnv` and the env copy, keeping `HERDR_SESSION_DIR`/`HERDR_SOCKET_NAME`/`HERDR_EXE`/`HERDR_SESSION_NAME` as today. Both calls of `herdr(args, schema, exe)` become `herdr(args, schema, {exe, session})` where session is the seed's session name (`db.session` — the runner wraps `herdr` with `--session <name>` itself; `socket_name = name` by `unitName = name` in `installUnitEnv`). The `herdrReady` probe and `deliver`/`seed` calls all run in `db.session`.
5. Docs updates: `docs/reference-index.md` gains routing rows for the new shell exports (`herdrArgv`, `repoSession`, `sessionSchema`, `DISCOVERY_DEADLINE_MS` — whatever actually landed); `docs/seats.md` "Session routing" section rewritten to describe session list + workspace-list resolution and the `--session` prefix on every akrogon→herdr call, removing "inherited `HERDR_SOCKET_PATH`" language (keep the mention that units still receive `HERDR_EXE` and `HERDR_SESSION_NAME`); `docs/state.md` `"session" key` line already matches — verify only; `tests/AREA.md` gains `session-routing.test.ts` under Key files (already added in wave 1? verify — if present, skip).

## 3. Read-first list

- `src/phase.ts` (`closeTab`), `src/log.ts` (`writeDay`, `logMove`, `landed` calls), `src/verify.ts` (`panes()` at ~line 585 and `notice`), `src/land.ts` (`herdrUnitEnv`, `herdr` calls ~472/502/514/536/549).
- Landed `src/shell.ts` interfaces: `repoSession`, `herdr` opts, `panes(session?)`, `tabs(session?)`.
- `tests/session-routing.test.ts` criteria 3 (phase/log/verify block tests), 7 (land env).
- `docs/seats.md`, `docs/state.md`, `docs/reference-index.md`, `tests/AREA.md`.
- Skill folder `ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/phase.ts`, `src/log.ts`, `src/verify.ts`, `src/land.ts`, `docs/reference-index.md`, `docs/seats.md`, and `tests/AREA.md`/`docs/state.md` only if stale.

Consumed interfaces (verify in the landed commit):

```ts
repoSession(repo: Repo, opts?: {exe?: string}): Promise<SessionResolution>
panes(session?: string, exe?: string): Promise<Pane[]>
tabs(session?: string, exe?: string): Promise<Tab[]>
herdr<T>(args, schema, {session?, exe?, deadlineMs?}?)
```

`land.ts` session source: the seeded db's `session` field (`db.session`); when `fakeLandFixture` seeds `{session: 'default'}` land targets the `default` session.

## 5. Do-not, reasons and exceptions

- Do not edit `src/next.ts`, `src/reconcile.ts` or tests — other units/A own them.
- Do not change `landed`'s worktree-string interface or its env behavior (`HOME`, `HERDR_SESSION_DIR`, `HERDR_SOCKET_PATH` for the *herdr child* stays — that `socketEnv` is the faked server path, not akrogon routing; only the akrogon→runner argv gains `--session`).
- Careful distinction in `land.ts`: `herdrUnitEnv`'s `HERDR_SOCKET_PATH` pass-env is the dropped item (akrogon must not inherit a socket path); `socketEnv(home, sock)` inside `herdrReady`/`deliver`/`seed` sets the child fake-herdr's socket — that stays.
- A conflict with landed interfaces is a mismatch to A; the exception is a revised brief from A.

## 6. Ordered steps

1. Read landed `src/shell.ts` and your four source files.
2. `phase.ts` closeTab: resolve, route, no-throw refusal.
3. `log.ts` writeDay: resolve, routed pane list, empty on refusal.
4. `verify.ts`: routed panes for the leaf's repo session.
5. `land.ts`: drop `HERDR_SOCKET_PATH` from `herdrUnitEnv`; route `herdr` calls with `{exe, session: db.session}`.
6. Docs.
7. Run section 7; commit.

Advisory size: 4-6 files, under 25 turns.

## 7. Commands

```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'
akrogon run-check --name land-typecheck -- bun run typecheck
akrogon run-check --name session-routing-c3e -- bun test tests/session-routing.test.ts -t 'blocks the phase-close'
akrogon run-check --name session-routing-c3f -- bun test tests/session-routing.test.ts -t 'blocks log writeDay'
akrogon run-check --name session-routing-c3g -- bun test tests/session-routing.test.ts -t 'blocks a verify pane read'
akrogon run-check --name session-routing-c7 -- bun test tests/session-routing.test.ts -t 'land passes HERDR_EXE'
akrogon run-check --name session-routing-c8 -- bun test tests/session-routing.test.ts -t 'session list --json is the only session discovery'
```

## 8. Done-when, evidence and report

Named tests pass, typecheck exits 0, commit on detached HEAD. Report the commit id, then:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
