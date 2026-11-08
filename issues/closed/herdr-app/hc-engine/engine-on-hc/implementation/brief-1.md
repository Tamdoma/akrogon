# Brief 1: U1 hc module and identity (engine-on-hc, wave 1)

## 1. Goal

Create `src/hc.ts`, the one module that talks to herdr-core (`hc`) and herdr-app for akrogon, plus the prefix lookup in `src/config.ts` and the duplicate-prefix refusal in `src/init.ts`. Plan decisions D1, D2, D3, D5, D6, D7, D12, D16 and implementation note I1 in `plan.md` (leaf folder below). Nothing calls the module yet; later units (start verb, engine, listener) build on exactly the I1 interface.

Leaf folder: `/home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-engine/engine-on-hc` (read `plan.md` there: "Live surface checked at planning" L1-L10, Decisions, "Implementation notes" I1).

## 2. Acceptance criteria

1. `src/hc.ts` exports exactly the I1 interface (names and shapes as written in plan.md I1). Every hc call runs `hc` with an explicit env: `{...process.env, HC_SESSION: session}` minus `HC_TERMINAL_SOCKET`, `HC_TERMINAL_ID`, `HC_SCOPE` (delete the keys; never mutate `process.env`). Every herdr-app call sets `HERDR_APP_HOME=appHome(session)`.
2. `sessions()` reads `${XDG_RUNTIME_DIR}/herdr-core/` (throw when `XDG_RUNTIME_DIR` is unset/blank), keeps entries `<name>.sock` whose name has no `.`, and sorts each into `live`/`stopped` by a `net.connect` probe (connect succeeds = live; `ECONNREFUSED`/`ENOENT` = stopped; other errors propagate). No hc process is spawned for a stopped session: any hc call on a stopped or stale socket starts a new core (plan L2).
3. `repoSpace(repo)`: memoized per process by repo name. For each live session, `docGet(session)`; a space matches when `space.name === repo.name`. Results mirror today's `resolveSession` in `src/shell.ts` (lines ~330-390): zero live+readable matches → refusal `no running session holds it`; two or more → `held by multiple sessions` (with `duplicates: [{session, space_id}]`); any unreadable session and no duplicate → `uniqueness unknown`; reason is `JSON.stringify({ workspace: repo.name, refused, searched, skipped_stopped, unreadable, duplicates })`, scope `'repo'`; a failure to read the runtime dir is scope `'invocation'`. A session whose document was never written (`value: null`, version 0) has no spaces (not unreadable).
4. `docGet` parses `doc.get {"name":"herdr-app"}` through `rpc` with zod: `{ version, value: null | { spaces: [{ id, name, folder, tabs: [{ id, name, root }] }] } }` (extra keys allowed with passthrough; recorded shape in `tests/fixtures/herdr-app-doc.json`), returning tab terminals collected recursively from `root` blocks (`{content: {terminal}}` leaves, `children` arrays).
5. `terminals(session, labels, all = false)` uses `rpc(session, 'terminal.list', { all, labels })` (plan L1: `hc ls --json` lacks labels and status). `Seen.cwd` = `foreground.cwd` when foreground is present, else `cwd`. `status` maps hc's `{state, kind?, msg?}` or null.
6. `run` uses `hc run --bg --json [--no-parent | --parent <p>] --name <name> --cwd <cwd> --label k=v ... -- <argv...>` then returns `terminal(session, address)` for the address it prints (`run --json` prints only `{address, agent, cwd, name, state, turn}`; check the real output). `send` uses `hc send --json <address> <text>` (plain: no `--if`, `--force`, `--wait`), parsing `{started: boolean|null, status: string|null, turn: number}`; errors (`blocked`, `unavailable`, ...) throw `HcError` with that kind. `end` runs `hc kill <address>` (an `HcError` whose kind says the terminal is already finished is fine) then `hc rm <address>`. Address terminals by address, never by name (plan L4).
7. `follow(session, args, onEvent)` spawns `hc events --json ...args`, splits stdout lines, passes each parsed line (snapshot object with `terminals`, or `{method:'event', params:{type, terminal, data, seq}}`) to `onEvent`; `stop()` kills the child; `ended` resolves when the stream ends. `waitFor` builds on it: start from the snapshot's terminal, merge each event's `data` into it (status events carry `{status}`, turn events `{state, turn}`, finished `{exit_code, reason}` plus state `finished`), resolve the first state where `until` is true, `null` when `ms` elapses (a timer bounds the wait; no polling, no sleeps).
8. `appHome(session)`: `default` → `<homedir>/.config/herdr-app`, else `<homedir>/.config/herdr-app-sessions/<session>`; throw `Error` naming the path when the folder is missing; never read `HERDR_APP_HOME` from the caller. `windowOpen`: run `herdr-app ls`; exit 0 → true; stderr containing `no Herdr window` → false; anything else throws with argv and stderr. `renameTab`: `herdr-app do tab.rename --id <tab> --name <name>`; `closeTab`: `herdr-app do tab.close --id <tab>`; non-zero exit throws.
9. `seatName(prefix, slug, seat)`: `<prefix>-<slug>-<seat>`; when longer than 32: `<prefix>-<head>-<hex4>-<seat>`, `head = slug.slice(0, 22)` with one trailing `-` removed, `hex4` = first 4 hex of sha256(`<repo>/<slug>`) — so the signature needs the repo name: `seatName(repo: string, prefix, slug, seat)`. `consultantName(prefix, letter)` = `<prefix>-slot-<letter>`. `leafTab(repo: string, slug)` = `ak` + first 30 hex of sha256(`<repo>/<slug>`).
10. `wakeWatcher(repo: Repo, reason: string)`: `repoSpace(repo)`; on refusal do nothing. List live terminals labelled `{'akrogon.watch': repo.name}` whose `status` is not null. None: nothing. Two or more: `console.error(JSON.stringify({ repo, watch: 'several live watch terminals', terminals: [addresses], reason }))` and send nothing. One: inside `withLock(resolve(globalHome(), `watch-${repo.name}.lock`), ...)` re-read it with `terminal()` and `send(session, address, `/watch-issues tick ${repo.root}`)` only when its status state is `idle` or `done`.
11. `src/config.ts`: `repoPrefix(global: GlobalConfig, repoName: string): string` returns `global.prefixes[repoName]`; throws `Error` containing `prefixes` when the map or the entry is missing, or when another repo holds the same value (name both repos). `src/init.ts`: before writing anything, refuse (throw, message names `prefixes` and both repos) when `global.prefixes` holds a duplicate value.
12. `bun run typecheck` reports no error in `src/hc.ts`, `src/config.ts`, `src/init.ts` (errors in test files importing modules later units create — `src/transcript.ts` — are expected and not yours).

## 3. Read first

- `plan.md` (leaf folder): L1-L10, D1-D7, D12, D16, I1.
- `src/shell.ts` (`run`, `command`, `spawnCaptured`, `CommandError`, today's `resolveSession`/`refuse`, `describeError`), `src/state.ts` (`withLock`), `src/config.ts` (`globalSchema`, `globalHome`), `src/init.ts`.
- `tests/hc-fixture.ts` (how tests start a core and the env they give akrogon), `tests/fixtures/herdr-app-doc.json`, `tests/fixtures/hc-schema.json` (exact hc shapes: `Terminal`, `SendResult`, `DocGetResult`, `Status`).
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- New `src/hc.ts` (I1). Use `spawnCaptured`/`run` patterns from `src/shell.ts`; zod at the boundary; `Result` type from shell.
- `src/config.ts`: add `repoPrefix`.
- `src/init.ts`: duplicate-prefix refusal.
- Owned paths: `src/hc.ts`, `src/config.ts`, `src/init.ts`. Must land first: nothing. Shared test resource: none (any ad-hoc core you start uses a unique `HC_SESSION=akw1-<n>` and is stopped by you).
- Event line shapes (observed with hc 0.1.18): first line `{"channel":null,"seq":N,"terminals":[<Terminal>...]}`; then `{"jsonrpc":"2.0","method":"event","params":{"type":"created"|"status"|"turn"|"finished"|"labels"|"foreground"|"lost"|"restarted"|"removed"|...,"terminal":"t5","seq":N,"data":{...}}}`. `created.data` is a full Terminal; `status.data` = `{records, reported, status: {state, kind?}|null}`; `turn.data` = `{state, turn}`; `finished.data` = `{exit_code, finished_ms, reason, signal}`; `labels.data` = `{labels}`.
- hc error output: stderr `{"error":{"kind":"blocked"|"unavailable"|"name_taken"|"live"|"not_found"|...,"message":"...","hint":"..."}}`, non-zero exit.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test or fixture file (tests are locked after planning); a planned test you believe wrong is a mismatch returned to A with evidence.
- Do not call `hc` for a session without first knowing it is live (L2: it would start a core); exception: none.
- Do not touch `src/shell.ts`, `src/next.ts` or other engine files (later units own them; today's notice sends still use the old herdr helpers there).
- Do not mutate `process.env` (Bun spawns may use the startup env; LESSONS bun spawn PATH) — pass env explicitly.
- No sleeps or polling loops; `waitFor` follows events.
- Never stop processes by pattern (`pkill -f` etc.); stop your ad-hoc cores with `HC_SESSION=<yours> hc server stop` and remove their state under `~/.local/state/herdr-core/<yours>` (or use a scratch `XDG_STATE_HOME`).
- Never touch the operator's sessions (`default`, `infra`, `personal`, `mdconsultingny`).
Reasons: locked tests, core auto-start, ownership boundaries, startup-env spawning, the no-polling direction, cross-leaf safety. Exception for scope changes: a revised brief from A.

## 6. Ordered steps

1. `src/hc.ts` boundary helpers: env builder, `hc`, `HcError`, `rpc` (criteria 1, 6).
2. `sessions`, `listening`, `docGet`, `repoSpace` (criteria 2-4).
3. `terminals`, `terminal`, `screen`, `run`, `send`, `keys`, `label`, `end` (criteria 5-6).
4. `follow`, `waitFor` (criterion 7).
5. `appHome`, `windowOpen`, `renameTab`, `closeTab`, names, `leafTab` (criteria 8-9).
6. `wakeWatcher` (criterion 10); `repoPrefix`, init refusal (criterion 11).
7. Ad-hoc check against a throwaway core (start one with a clean env: `env -i HOME=$HOME PATH=$PATH XDG_RUNTIME_DIR=$XDG_RUNTIME_DIR LANG=C.UTF-8 HC_SESSION=akw1-1 hc server start`), e.g. a scratch `bun -e` script under `$TMPDIR` calling `sessions`, `run`, `send`, `waitFor`, `end`, `docGet`; delete the script after.
Advisory size: 3 files, under 30 turns.

## 7. Commands

- `akrogon run-check --name u1-typecheck -- bun run typecheck` (only your files must be clean).
- `akrogon run-check --name u1-schema -- bun test --timeout=30000 tests/hc-identity.test.ts -t "pinned copy"` (must stay green).
- `akrogon run-check --name u1-prettier -- bunx prettier --check src/hc.ts src/config.ts src/init.ts`.
Install deps first in your worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.

## 8. Done-when, evidence and report

Criteria 1-12 hold; one commit on your worktree (message `hc: herdr-core module, repo space by name, prefixes`, no co-author line); return the commit id. Keep command output only via `akrogon run-check` and cite the `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
