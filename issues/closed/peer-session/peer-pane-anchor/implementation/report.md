# Report: peer-pane-anchor

Base: `dedbc381` · Head: `07390ad` · Refresh: `git fetch origin` + `git rebase origin/main` at pass start — already at tip, no moves (base `dedbc381` → `dedbc381`).

## Changed files

- `skills/chart-issues/scripts/peer-anchor.ts` (new, worker d7821411): `verifyAnchor(): string` — blank `HERDR_PANE_ID` throws naming both envs with no herdr call; `herdr pane process-info --pane <id>` non-zero or unparseable throws naming both envs plus herdr's answer; `/proc/<pid>/stat` ppid walk (index 1 after the last `)`) from `process.pid` to pid 1 / self-parent / visited / unreadable stat, refusing with both envs and the returned `shell_pid` on a miss; 3-line `import.meta.main` printing the verified pane id. Reuses `run`/`failureText`/`Herdr` from `./peer-restart`.
- `skills/chart-issues/scripts/peer-ask.ts`, `peer-wait.ts` (worker 0593a095): `verifyAnchor()` after usage validation, before the first `herdr` call.
- `skills/chart-issues/scripts/peer-restart.ts`, `peer-create.ts` (worker 70e07b7c): `verifyAnchor()` plus refusal when the A-pane argv differs from the verified pane, reusing `finish(states)`/`emit(states)`, before the first herdr call.
- `skills/chart-issues/scripts/door-reset.ts` (worker f3542c1e): `verifyAnchor()` + pane comparison between the `DOOR_RESET_CHILD==='1'` early return and `readPeerAgent`; the detached child never reaches it; `DOOR_RESET_INLINE` verifies in the parent process.
- `tests/fake-herdr.ts` (test commit 4cf14c2e): optional per-pane `shell_pid` in `fakePaneSchema`, answering `pane process-info`; hashed default path untouched (seat-containment green).
- `tests/{peer-ask,peer-wait,peer-restart,peer-create,door-reset}.test.ts` (4cf14c2e): caller-pane seeds (`shell_pid: process.pid`), `HERDR_PANE_ID`/`AKROGON_PROC_ROOT` in spawn envs, refusal and mismatch cases, door-reset detached-child decoy test.
- `07390ad` style-only prettier rejoin in three of those test files.

## Done-criteria proof

1. **Refusal before any herdr mutation, naming envs and herdr's answer** — green on `f3542c1e` (before the style-only 07390ad): `check lane-peer-ask-wait: 0` (52 pass incl. decoy shell_pid, unset `HERDR_PANE_ID`, other-session socket), `check lane-peer-restart-create: 0` (22 pass incl. unknown pane, non-ancestor, unset), `check lane-door-reset: 0` (45 pass). Shown red on base `dedbc381` at planning (`check plan-red-*` exits 1; scripts prompted/split/restarted without checking).
2. **A-pane argument mismatch refuses with no mutation** — same green runs: `refuses when the A-pane argument differs from the verified pane` passes in peer-restart, peer-create and door-reset files (asserts `.calls` holds only the anchor `pane process-info`, no split/start/prompt, no log).
3. **Verified env keeps existing scenarios** — all pre-existing tests in the five files green under the anchor env (lane runs above); peer-ask's spawned peer-wait re-verifies the inherited env (first test's call order `pane process-info` → `agent list` → `agent prompt`); the detached child finishes reset + start prompt after the parent exits under a decoy that makes any re-check refuse.
4. **Live on this machine** (herdr 0.9.1, run in the seat shell — `akrogon run-check` scrubs the herdr env so the live pass ran unwrapped, recorded verbatim per the criterion):
   - `bun skills/chart-issues/scripts/peer-anchor.ts` → prints `w8:pXN`, exit 0.
   - `HERDR_SOCKET_PATH=/home/ivan/.config/herdr/sessions/personal/herdr.sock bun skills/chart-issues/scripts/peer-anchor.ts` → exit 1: `HERDR_PANE_ID=w8:pXN HERDR_SOCKET_PATH=/home/ivan/.config/herdr/sessions/personal/herdr.sock: herdr pane process-info --pane w8:pXN failed (exit 1): {"error":{"code":"pane_not_found","message":"pane not found"},...}`.
   - `herdr --version` → `herdr 0.9.1`.

## Checks

`akrogon verify` on `07390ad` → green: format 0 (`check-format-1793261575*`), test 0 (1262 pass, `check-test-1793261617123-1633744.log`), typecheck 0 (`check-typecheck-1793261619673-1633744.log`). Wall time ~75 s (seconds per plan sizing). An earlier verify on `f3542c1e` went red on format only (prettier line-joins in my own test edits); fixed by `07390ad`, verify rerun green.

Per-unit worker checks: u1-format/u1-typecheck, u2-peer-ask/u2-peer-wait/u2-typecheck, u3-peer-restart/u3-peer-create/u3-typecheck, u4-door-reset/u4-typecheck — all 0; lane reruns after each cherry-pick above; `check plan-fake-herdr-seat-containment: 0` guards the fake's default path.

## Worker returns

- sa-1 (u1): `d410706` — peer-anchor.ts; no limitations.
- sa-2 (u2): `d67d282` — peer-ask + peer-wait anchor calls; no limitations.
- sa-3 (u3): `2c308c8` — peer-restart + peer-create anchor + comparison; no limitations.
- sa-4 (u4): `2171d97` — door-reset anchor + comparison, child exempt; no limitations.

## Known limitations

- Out of scope per the design: a herdr server replaced under the same session name, and cross-session consultants.
- The helper reads the real `/proc`, Linux-only (consistent with the repo).

## Unverified criteria

None.
