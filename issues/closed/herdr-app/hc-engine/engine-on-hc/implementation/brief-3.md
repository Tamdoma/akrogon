# Brief 3: U3 legacy state, teardown, reconcile, containment removal (engine-on-hc, wave 3)

## 1. Goal

Finish moving the engine off herdr panes after U2's start/delivery rewrite: legacy state refusal, teardown by `hc kill` then `hc rm`, reconcile on hc terminal state, removal of the pane-boxing containment, the watcher-wake callers in `commitMove` and `observeBusy`, and the remaining herdr calls in engine paths. Plan decisions D16 (commit/busy callers), D17 (refusal), D19, D20, D21, D25, implementation note I4, in `plan.md` (leaf folder `/home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-engine/engine-on-hc`).

## 2. Acceptance criteria

1. D17 refusal: a leaf is legacy when it has a non-empty `pane`, a string `prompted`, or a `tab` holding `:`. A merged, done or closed legacy leaf reads and completes, and no hc or herdr-app call is made with its old ids (no argv holding the old tab/pane id). Any other legacy leaf is refused at dispatch with `state predates hc: <slug> records old herdr pane ids` (exit stays as today's per-leaf refusal reporting).
2. D19 teardown: a seat restart, `akrogon stop <slug>` and a merged leaf's close end each recorded seat terminal with `end()` (`hc kill` then `hc rm`); merged close then calls `closeTab(state.tab)` only when `windowOpen(session)`; `stop` still stops the leaf slice. A killed seat restarts under the same name (no `name_taken`).
3. D20 reconcile: the `Pane`/`Tab` reads become `Seen` from `terminals()` (`tab` = `herdr.tab` label, `cwd` = foreground cwd else cwd). Keep/remove rules unchanged: a worktree with any live terminal inside it is kept (any terminal of the session, not only akrogon-labelled ones), "live tab" means a live terminal labelled with that tab; an unavailable listing keeps things as today's "pane list unavailable" path does.
4. D21: delete `adoptShell`, `paneShell`, `paneScope`, `inOwnScope`, `shellPid`, the busctl call and the 50 ms loop; `callerScope`, `stop-run`, `stop` and reconcile keep working. `land`'s systemd unit gains `--setenv=XDG_RUNTIME_DIR=<value>`.
5. D16 callers: `commitMove` to `failed` calls `wakeWatcher(repo, reason)` after the commit; `observeBusy` calls it once when a seat crosses the 60-minute busy deadline (with today's `busy_notified` bookkeeping so it fires once per episode).
6. D25: in `src/next.ts`, `src/phase.ts`, `src/reconcile.ts`, `src/scope.ts`, `src/log.ts`, `src/shell.ts`, every remaining `herdr` hit is one of the kept notice sends (`observeBusy` notice, `mergeNotice`, `announceFailed`, `noticeSend`) or the kept `shell.ts` exports (`herdrArgv`, `repoSession`, `SessionResolution`, `herdr`, `herdrError`, `retryable` and the session list helpers they use). Everything else herdr in engine paths is removed (pane/tab listing, `tab create`, `pane split`, `agent start/prompt`, `pane close`, `tab rename` through herdr; rename/close go through `src/hc.ts`).
7. `tests/fake-busctl.ts` deleted; `tests/fake-proc.ts` trimmed of what only the deleted containment used (A authorizes these two test-support edits for this unit; no other test file may change).
8. Planned tests green: `tests/hc-teardown.test.ts`, `tests/hc-identity.test.ts` (all cases), and in `tests/hc-watcher.test.ts` the cases "a committed move to failed wakes the watcher once", "the busy deadline wakes the watcher, …" and "without a watch terminal nothing is sent …". U2's `tests/hc-start.test.ts`, `tests/hc-delivery.test.ts`, `tests/hc-window-calls.test.ts` stay as green as U2 left them. `bun run typecheck` clean for `src/`.
9. Old suites driving herdr panes (`tests/next.test.ts`, `seat-containment`, `session-routing`, …) may go red; A ports or deletes them (D26). Do not edit them.

## 3. Read first

- `plan.md`: D16-D21, D25, I1-I4, criteria 6, 11, 12, 13, 14. `implementation/report.md` (what landed in waves 1-2).
- `src/hc.ts`, `src/seat.ts`, `src/next.ts`, `src/phase.ts`, `src/state.ts`, `src/reconcile.ts`, `src/stop.ts`, `src/scope.ts`, `src/shell.ts`, `src/land.ts`.
- Tests: `tests/hc-teardown.test.ts`, `tests/hc-identity.test.ts`, `tests/hc-watcher.test.ts`, `tests/hc-fixture.ts`, `tests/hc-shim.sh`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- `src/next.ts`, `src/phase.ts`, `src/state.ts` (legacy predicate), `src/reconcile.ts`, `src/stop.ts`, `src/scope.ts`, `src/shell.ts`, `src/land.ts`, `src/log.ts`, `src/timing.ts` as needed.
- Delete `tests/fake-busctl.ts`; trim `tests/fake-proc.ts` (criterion 7 only).
- Owned paths: the files above. Must land first: U1, U2 (landed). Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test except criterion 7's two files; a planned test you believe wrong is a mismatch returned to A with real output.
- Do not call hc for a session not known live (L2); go through `src/hc.ts` only.
- No sleeps or polling loops.
- Do not change U2's start/delivery behavior except where a criterion here requires it (say so in the report).
- Do not touch `src/listen.ts`, `src/status.ts`, the systemd unit or `next --wake` (U4).
- Never stop processes by pattern; stop ad-hoc cores with `HC_SESSION=<yours> hc server stop`. Never touch the operator's sessions (`default`, `infra`, `personal`, `mdconsultingny`). No paid harness.
Reasons: locked tests, core auto-start, no-polling direction, unit ownership, cross-leaf safety. Exception: a revised brief from A.

## 6. Ordered steps

1. Legacy predicate and refusal (criterion 1); run `hc-identity`.
2. Teardown and restart (criterion 2); reconcile (criterion 3); run `hc-teardown`.
3. Watcher callers (criterion 5); run the three `hc-watcher` cases.
4. Containment removal and `land` setenv (criterion 4); the remaining herdr cleanup (criterion 6) with the grep below; criterion 7.
5. Rerun all targeted tests, typecheck, prettier.
Advisory size: about 10 files, under 60 turns.

## 7. Commands

Install deps first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
- `akrogon run-check --name u3-identity -- bun test --timeout=30000 tests/hc-identity.test.ts`
- `akrogon run-check --name u3-teardown -- bun test --timeout=30000 tests/hc-teardown.test.ts`
- `akrogon run-check --name u3-watcher -- bun test --timeout=30000 tests/hc-watcher.test.ts -t "committed move|busy deadline|without a watch terminal"`
- `akrogon run-check --name u3-u2-suites -- bun test --timeout=30000 tests/hc-start.test.ts tests/hc-delivery.test.ts tests/hc-window-calls.test.ts`
- `akrogon run-check --name u3-grep -- grep -n herdr src/next.ts src/phase.ts src/reconcile.ts src/scope.ts src/log.ts src/shell.ts`
- `akrogon run-check --name u3-typecheck -- bun run typecheck`
- `akrogon run-check --name u3-prettier -- bunx prettier --check <your changed files>`

## 8. Done-when, evidence and report

Criteria 1-9 hold; one commit (message `engine: legacy refusal, hc teardown and reconcile, drop pane boxing`, no co-author line); return the commit id. Keep output only via `akrogon run-check`, citing the `check <label>: <exit> <path>` lines. In the report, list each remaining grep hit and which kept item it is.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
