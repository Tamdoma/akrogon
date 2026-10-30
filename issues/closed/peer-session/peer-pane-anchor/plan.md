# Plan: peer-pane-anchor

## Summary

Add a shared `verifyAnchor()` helper in `skills/chart-issues/scripts/peer-anchor.ts`: read `HERDR_PANE_ID`, call `herdr pane process-info --pane <id>` over the inherited env, walk `/proc/<pid>/stat` parents from `process.pid` looking for the pane's `shell_pid`, return the pane id or throw a refusal naming `HERDR_PANE_ID`, `HERDR_SOCKET_PATH` and herdr's answer. Each of peer-ask, peer-wait, peer-restart, peer-create, door-reset calls it at entry before its first herdr call; the three that take A's pane as an argument compare it and refuse on mismatch; door-reset's detached child (`DOOR_RESET_CHILD=1`) skips the call.

## Decisions

- **D1** `verifyAnchor()` in `skills/chart-issues/scripts/peer-anchor.ts`: `export function verifyAnchor(): string`, plus a 3-line `import.meta.main` block printing `verifyAnchor()` (Criterion 4's direct invocation, decided under Criterion 4 below).
- **D2** Proc walk reads `/proc` directly (never `AKROGON_PROC_ROOT`). Field 4 (ppid) is index 1 after `stat.slice(stat.lastIndexOf(')') + 1).trim().split(' ')` — the design's `src/scope.ts` `startTime` reads field 22 at index 19 the same way (proc(5): ppid is field 4, starttime field 22). Walk terminates at pid 1, a self-parent, a visited pid, or an unreadable/missing stat; not finding `shell_pid` refuses.
- **D3** Refusal text carries `HERDR_PANE_ID`, `HERDR_SOCKET_PATH` and herdr's answer: absent/blank `HERDR_PANE_ID` refuses naming both envs with no herdr call; non-zero process-info refuses naming both envs plus stderr/exit; ancestry miss refuses naming both envs plus the `shell_pid` herdr returned.
- **D4** Call order in every script: usage/arg validation first (existing tests assert zero herdr calls there), then `verifyAnchor()` + the A-pane comparison, then existing herdr traffic. In `door-reset.ts` it sits after the `DOOR_RESET_CHILD==='1'` early return, before `readPeerAgent` — the existing `DOOR_RESET_CHILD` marker already distinguishes the detached child, so it and the `DOOR_RESET_INLINE` path are the only question's answer: parent and inline run the check, the detached child does not.
- **D5** `fakePaneSchema` gains `shell_pid: z.number().optional()`; `pane process-info` answers `target.shell_pid ?? shellPid(pane_id)` and seeds the proc fixture only on the default path. Src tests reading this branch (`tests/seat-containment.test.ts` via `adoptShell`/`inOwnScope`) seed no `shell_pid` and keep today's hashed default untouched.
- **D6** Every test setup sets `HERDR_PANE_ID` to a caller pane seeded in the db with `shell_pid: process.pid` (a real ancestor of the spawned script; `spawnCaptured` runs it as a direct child) and passes `AKROGON_PROC_ROOT` (fake-herdr requires it in the process-info branch; today only peer-restart/peer-create set it). Scripts are spawned under real `/proc` so the helper walks real parents.
- **D7** No new refusal-test file: each criterion's cases extend the script's own `tests/peer-*.test.ts` / `tests/door-reset.test.ts`, each run gets a `runWith(extraEnv, ...args)` variant so setups stay one place. Decoy `shell_pid` = `999999999` (above any live pid_max, never an ancestor, deterministic). "Other session" = a `session_b` entry in `db.sessions` plus `HERDR_SOCKET_PATH: <db>-session_b.sock` (fake sessionList yields that socket path), giving a real `pane_not_found` refusal.

## Interfaces

- `verifyAnchor(): string` — verified pane id; throws `Error` with the refusal text.
- `fakePaneSchema.shell_pid?: number` — process-info answer override.
- Test helper `runWith(env, ...args)` in each of the five test files.

## Read-first

- `skills/chart-issues/scripts/{peer-ask,peer-wait,peer-restart,peer-create,door-reset}.ts`
- `tests/{peer-ask,peer-wait,peer-restart,peer-create,door-reset}.test.ts`, `tests/fake-herdr.ts` (process-info branch), `tests/fake-proc.ts` (`shellPid`/`seedShell`)
- `src/scope.ts` `startTime` (stat parsing), `src/shell.ts` `paneSchema`/`spawnCaptured`
- `skills/chart-issues/assets/standing-design.md`, `tests/AREA.md`

## Waves

- **W1-U1** `skills/chart-issues/scripts/peer-anchor.ts` — new helper. (Depends: none.)
- **W2-U1** `peer-ask.ts`, `peer-wait.ts`, `tests/peer-ask.test.ts`, `tests/peer-wait.test.ts` — verify at entry, no arg comparison. (Depends: W1.)
- **W2-U2** `peer-restart.ts`, `peer-create.ts`, `tests/peer-restart.test.ts`, `tests/peer-create.test.ts` — verify + aPane comparison; peer-create keeps importing `run` from peer-restart. (Depends: W1.)
- **W3-U1** `door-reset.ts`, `tests/door-reset.test.ts` — parent-path verify + pane comparison, detached child skips. (Depends: W1; later wave because the parent/child split is the subtle change.)
- Shared fixture edit `tests/fake-herdr.ts` lands with W1's test commit; owned by whoever lands first, listed under W1-U1's file set.

Docs: none affected — SKILL.md/questions.md already treat a non-zero script exit as a reported stop.

## Tests (committed before product code)

### Criterion 1 — decoy/unknown pane refuses before any herdr mutation, naming the envs and herdr's answer

Per script, extend `PaneSeed` with `shell_pid?: number`, seed the caller pane, set `HERDR_PANE_ID` + `AKROGON_PROC_ROOT` in `run`. New cases (`runWith`):

- `peer-ask`/`peer-wait`: `HERDR_PANE_ID` = caller pane seeded `shell_pid: 999999999` → exit 1, stderr names `HERDR_PANE_ID` value, `HERDR_SOCKET_PATH` value and the returned pid; `.calls` contains only `pane process-info`. `HERDR_PANE_ID: ''` → exit 1, `.calls` empty. `HERDR_SOCKET_PATH` = other-session socket → exit 1, stderr names socket and `pane_not_found`.
- `peer-restart`/`peer-create`/`door-reset`: same two refusal shapes; assert exit 1, refusal names the values, no mutating call (`pane split`/`agent start`/`agent prompt`) and for door-reset no log file.

Condition checks against the criterion: "exits before any prompt/split/start/kill" — the verify precedes the first herdr call site by construction; the case asserting `.calls` holds only `pane process-info` fails if a later call runs (shown red on base: scripts prompt without checking). The temporary-edit clause is discharged naturally: on the base every refusal case fails with exit 0 (scripts never read the env), recorded below.

### Criterion 2 — A-pane argument differs from verified pane: refuse, no mutation

- `peer-restart`: `HERDR_PANE_ID` = real caller pane `w8:pA` (shell_pid `process.pid`), argv's aPane = `w8:pB` → exit 1, stderr names both ids, no `agent start`/kill, no `pane process-info` beyond the anchor read.
- `peer-create`: `HERDR_PANE_ID` = `w8:pA`, argv aPane = `w8:pZ` → exit 1, no `pane split`.
- `door-reset`: `HERDR_PANE_ID` = second seeded pane, argv pane = `w8:pX` → exit 1, no `agent prompt`, no log.
- Deliberate break per design: skipping the argument comparison turns these red (on base they already exit non-refusal or run on).

### Criterion 3 — verified env keeps every existing scenario

- All existing tests in the five files stay green with the caller pane + env added (the setup change is the check).
- New: door-reset detached child — `runWith` without `DOOR_RESET_INLINE`, valid anchor env, seed `claude` pane with closed transcript and `promptScript: [{session:'sess-new',status:'idle'}]`; parent prints `queued` and exits 0; poll the handover log until `send-start-prompt sent` (bound ~15s). The child is reparented to init after the parent exits, so the pane shell leaves its ancestry — a re-check would fail; this test proves the child does not re-check. peer-ask's spawned peer-wait re-verifies the inherited env, already covered by the existing happy path once envs are set.

### Criterion 4 — live on this machine (recorded in implementation/report.md, implement pass)

- Pass: `bun skills/chart-issues/scripts/peer-anchor.ts` run as `bun -e 'import {verifyAnchor} from ".../peer-anchor.ts"; console.log(verifyAnchor())'` — wait, no: direct invocation of the product = `bun skills/chart-issues/scripts/peer-anchor.ts`, which needs a tiny `import.meta.main` block printing `verifyAnchor()`. Alternative without the main block: run `peer-wait.ts <this pane> <tmpfile> 1` under the real env — it verifies then waits. Choose: add a 3-line `import.meta.main` to `peer-anchor.ts` (`console.log(verifyAnchor())`) so criterion 4's pass is one clean read-only call: `bun skills/chart-issues/scripts/peer-anchor.ts` → prints `w8:pXN`, exit 0.
- Refuse: same command with `HERDR_SOCKET_PATH=/home/ivan/.config/herdr/sessions/personal/herdr.sock` (live session list above; `w8:pXN` is not in `personal`) → exit 1 naming both values + `pane_not_found`.
- Both commands, outputs and `herdr --version` (0.9.1) go into `implementation/report.md`.

## Proof commands

All run via `akrogon run-check --name <label> -- <cmd>`; new tests shown red on the base first.

- `bun test tests/peer-ask.test.ts` — C1 (decoy/unset/other-session refusal), C3 (existing + peer-wait spawn).
- `bun test tests/peer-wait.test.ts` — C1 refusals, C3 standalone rerun.
- `bun test tests/peer-restart.test.ts` — C1, C2 arg-mismatch, C3.
- `bun test tests/peer-create.test.ts` — C1, C2, C3.
- `bun test tests/door-reset.test.ts` — C1, C2, C3 incl. detached child.
- `bun test tests/seat-containment.test.ts` — guards D5 default path (hashed shell_pid unchanged for src lifecycle tests).
- `checks` `format`, `typecheck`, `test` before finish per repo config.

Size: seconds each (peer tests spawn real bun children; door-reset child test bounded by polling). Rerun trigger: any diff to the five scripts, the helper, or `tests/fake-herdr.ts`. No model or outside stage; criterion 4's live run is a manual seat action recorded in `implementation/report.md` — its inputs are this machine's herdr env, replayed by rerunning the same two commands.

## Red-first results (recorded at planning, base `dedbc381`)

- `akrogon run-check --name plan-red-peer-ask -- bun test tests/peer-ask.test.ts` → exit 1, 6 pass / 5 fail: `refuses when the pane shell is not an ancestor` (exit 0, prompted anyway), `refuses when HERDR_PANE_ID is unset or empty` (exit 0), `refuses when HERDR_SOCKET_PATH names another session` (exit 0), plus the two updated order assertions (`agent list` first, no anchor call).
- `plan-red-peer-wait` → `bun test --timeout=30000 tests/peer-wait.test.ts` exit 1, 37 pass / 4 fail: the four new refusal cases each exited 0 (script waited normally).
- `plan-red-peer-restart` → exit 1, 11 pass / 4 fail: the four new cases exited 0 (restart ran).
- `plan-red-peer-create` → exit 1, 3 pass / 4 fail: the four new cases exited 0 (splits ran).
- `plan-red-door-reset` → exit 1, 41 pass / 4 fail: the four new refusal cases exited 0; the detached-child test passes on base and only fails if the product re-checks in the child.
- `plan-fake-herdr-seat-containment` → exit 0, 11 pass: D5's default hashed `shell_pid` path unchanged.
- Condition checks: every criterion-1/2 refusal case is red on the base without any temporary edit — the missing checks are the violation, so the run doubles as the deliberate-break proof; the only criterion-3 product change (child skip) is guarded by the decoy-on-second-read test, which a re-checking child fails deterministically.
