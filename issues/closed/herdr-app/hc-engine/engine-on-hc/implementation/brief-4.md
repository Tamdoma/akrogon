# Brief 4: U4 listener, status liveness, listener watcher wakes (engine-on-hc, wave 4)

## 1. Goal

Replace the herdr plugin's event hooks with a systemd user service `akrogon listen` that follows hc events and runs engine passes, and show listener and watcher liveness in `akrogon status`. Plan decisions D15, D16 (listener caller), D24, plus `next --wake` (I3), in `plan.md` (leaf folder `/home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-engine/engine-on-hc`).

## 2. Acceptance criteria

1. `akrogon listen` (`src/listen.ts`, case in `src/akrogon.ts`): one `follow(session, ['--label', 'akrogon=1'])` child per live session (`sessions()`), and `fs.watch` on `${XDG_RUNTIME_DIR}/herdr-core/` to subscribe new live sockets (no polling). Only after every subscription's snapshot line arrived it runs `akrogon pull --all`, then `akrogon next --resume`.
2. Passes run the `akrogon` command found on `PATH` (the unit's PATH has `~/.local/bin`; `tests/hc-listener.test.ts` puts a recording shim first on PATH), as child processes, one at a time: a wake during a pass sets one pending flag, so any number of wakes during a pass give exactly one following pass. Never two passes at once (C3.2).
3. Wakes: a `turn` event, a `status` event whose state is `blocked`, a `finished` or `lost` event of a terminal from the subscription → one `akrogon next --wake` pass. An unlabelled terminal produces nothing (server-side `--label` filter). A stream end (core restart/stop): when the session is live again, re-subscribe, then run `akrogon next --resume` once (catch-up).
4. Listener watcher wakes (D16): on a seat `finished`/`lost`, a seat `restarted` keep shell, or a seat status `blocked`, call `wakeWatcher(repo, reason)` for the seat's `akrogon.repo` label (repo looked up in the global config; an unknown repo label is skipped with a stderr JSON line).
5. `next --wake` (I3): accepted by `nextCommand`, exclusive with `--all`/`--resume`/a target; it is `--resume` without self-update (the automatic sweep of every unpaused repo's seated and merged leaves, reconcile and merge passes).
6. Self-update from the listener (criterion 8): the start-up `next --resume` deploys as today; the listener restarts only through today's deploy path (`systemctl --user restart --no-block akrogon-listener.service` after the deploy record is written). If today's deploy code restarts something else for the plugin, it now restarts `akrogon-listener.service` with the record written first; `tests/hc-listener.test.ts` "a self-update run by the listener …" must pass. The deployer's plugin conditional and `herdr integration install` loop in `src/install.ts` stay (D23).
7. `systemd/akrogon-listener.service`: `[Unit] Description=akrogon listener`, `[Service] ExecStart=%h/.local/bin/akrogon listen`, `Restart=on-failure`, no `HC_SESSION`, `[Install] WantedBy=default.target`; `akrogon install` links and enables it the same way it links `akrogon.slice` (inspect `src/install.ts`), so a deploy restarts it.
8. Status (D24): `akrogon status` prints `Listener: live|down` from `systemctl --user is-active akrogon-listener.service`, and per registered repo `Watcher: <repo> live <address>|none` (the D16 lookup: live terminals labelled `akrogon.watch=<repo>` with non-null status in the repo's session; none when the repo has no session); a leaf whose recorded tab is unnamed or misnamed in the herdr-app document shows `tab unnamed` in its note. Information only: exit code and the `--json` `red` attention list unchanged.
9. Docs: `docs/reference/commands.md` gains the `akrogon listen` row, the `next` row gains `--wake`, the `install` row says it links the listener unit instead of "the Herdr integration". A edits `tests/command-reference.test.ts`.
10. Planned tests green: `tests/hc-listener.test.ts`, `tests/hc-status.test.ts`, `tests/hc-watcher.test.ts` (all cases), and the `status ... tab unnamed` assertion of `tests/hc-window-calls.test.ts`. Earlier hc suites stay green. `bun run typecheck` clean for `src/`.

## 3. Read first

- `plan.md`: D15, D16, D24, I1-I4, criteria 3, 8, 10, 11. `implementation/report.md` (waves 1-3).
- `src/hc.ts` (`sessions`, `follow`, `wakeWatcher`, `terminals`, `docGet`), `src/next.ts` (`nextCommand`, `--resume` path, self-update call), `src/self-update.ts`, `src/install.ts`, `src/status.ts`, `src/akrogon.ts`.
- Tests: `tests/hc-listener.test.ts`, `tests/hc-status.test.ts`, `tests/hc-watcher.test.ts`, `tests/hc-window-calls.test.ts`, `tests/hc-fixture.ts`, `tests/deploy-fixture.ts`, `tests/fake-systemctl.sh`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- New `src/listen.ts`, new `systemd/akrogon-listener.service`.
- `src/akrogon.ts` (`listen` case, `next --wake`), `src/next.ts` (`--wake` option only), `src/status.ts`, `src/install.ts`/`src/self-update.ts` only where criteria 6-7 need it, `docs/reference/commands.md`.
- Owned paths: the files above. Must land first: U1-U3 (landed). Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test; a planned test you believe wrong is a mismatch returned to A with real output.
- Do not call hc for a session not known live (L2); go through `src/hc.ts` only.
- No sleeps or polling loops; event and `fs.watch` driven only.
- Do not change engine behavior from U2/U3 beyond the `--wake` option.
- Never stop processes by pattern; stop ad-hoc cores with `HC_SESSION=<yours> hc server stop`. Never touch the operator's sessions (`default`, `infra`, `personal`, `mdconsultingny`) and never install, enable or restart the real `akrogon-listener.service` on this machine. No paid harness.
Reasons: locked tests, core auto-start, no-polling direction, unit ownership, the operator's live setup. Exception: a revised brief from A.

## 6. Ordered steps

1. `next --wake` (criterion 5).
2. `src/listen.ts` subscriptions, catch-up order, single flight, re-subscribe (criteria 1-3); run the first `hc-listener` case.
3. Listener watcher wakes (criterion 4); run `hc-watcher`.
4. Unit file, install link, self-update restart (criteria 6-7); run the deploy case.
5. Status (criterion 8); run `hc-status` and `hc-window-calls`.
6. Docs (criterion 9); full targeted run, typecheck, prettier.
Advisory size: about 7 files, under 50 turns.

## 7. Commands

Install deps first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
- `akrogon run-check --name u4-listener -- bun test --timeout=30000 tests/hc-listener.test.ts`
- `akrogon run-check --name u4-watcher -- bun test --timeout=30000 tests/hc-watcher.test.ts`
- `akrogon run-check --name u4-status -- bun test --timeout=30000 tests/hc-status.test.ts tests/hc-window-calls.test.ts`
- `akrogon run-check --name u4-earlier -- bun test --timeout=30000 tests/hc-start.test.ts tests/hc-delivery.test.ts tests/hc-identity.test.ts tests/hc-teardown.test.ts`
- `akrogon run-check --name u4-typecheck -- bun run typecheck`
- `akrogon run-check --name u4-prettier -- bunx prettier --check <your changed src files>`

## 8. Done-when, evidence and report

Criteria 1-10 hold; one commit (message `listen: hc event listener unit, status liveness`, no co-author line); return the commit id. Keep output only via `akrogon run-check`, citing the `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
