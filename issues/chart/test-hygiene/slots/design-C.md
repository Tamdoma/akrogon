# Design C: test-hygiene (`#150` and `P12`)

## 1. `#150` — `watch-live.e2e.ts` hold & later due numbers

- **Root cause:** `tests/e2e/watch-live.e2e.ts:833` holds `due=2` for `intervalSec * 2 + 5` (25 s at `WATCH_TICK_SECONDS=10`), so both `due=3` and `due=4` elapse while `working === true`. `skills/watch-issues/scripts/timer.ts:166-178` intentionally coalesces unsent dues (`pending.n = dueCount`), so `due=4` (never `due=3`) is the first due sent after the hold.
- **Exact change (`tests/e2e/watch-live.e2e.ts:834-842`):** wait for the first `due=(\d+) sent \(attempt \d+, turn=(\d+)\)` with `due > 2` (returning `{ due: heldDue, turn: heldTurn }`, plus `waitDue(..., heldDue, ...)` and `waitCallAtTurn(callLog, 'status', heldTurn, 90_000)`). Assert `heldTurn > busy2r`, `heldScreen.match(new RegExp(\`due=${heldDue} sent\`, 'g'))` has length `1`, no `due=${heldDue} dropped`, and no `due=<n> sent` for `2 < n < heldDue`.
- **Yes — fixed `4` and `5` (`:847-858`) have the same defect:** when `heldDue >= 4`, `waitDue(..., 4)` (`:847`, checks `label >= 4` at `:317`) and `waitDueCall(..., 4, 'status')` (`:848`) match the **pre-pause** `due=4`, making the pause assertion (`:844-850`) vacuous; `waitDue(..., 5)` (`:858`) can match the paused tick instead of a post-unpause tick. Anchor both relative to `heldDue`: pause waits for `pausedDue = Math.max(heldDue, currentReceipt) + 1` (receipt + `status` call, `nextCalls === beforeNext`); unpause waits for `pausedDue + 1` (`nextCalls >= beforeNext + 1`). (`:866` `due=1` and `:873` `due=99` stay valid.)

## 2. `P12` — child test slices (`tests/run-units.test.ts`, `src/scope.ts`)

- **Why 278 `akrogon-test-<pid>.slice` exist live today:** `tests/run-units.test.ts:60` uses **two** dashes after `akrogon-test` (`akrogon-test-${process.pid}-${serial++}.slice`). Systemd treats `-` as hierarchy, creating parent `akrogon-test-<pid>.slice`. `afterAll` (`:115-118,247-250`) stops only `-<serial>.slice`, leaving `akrogon-test-<pid>.slice` loaded forever.
- **Live systemd proof (probed with `akrogon-cprobe<pid>.slice` / `-t1.slice`):**
  - Stopping all units inside a slice leaves **both** child and parent slices `loaded active active` (systemd keeps empty slices).
  - `systemctl --user stop <parent>.slice` stops running child units **and** unloads both child and parent slices (`list-units` returns 0).
- **Own-slice lookup & naming:** read `/proc/self/cgroup` (`0::.../user@<uid>.service/<slices...>/<unit>`), take the last segment ending in `.slice` after `user@<uid>.service/`.
  - If it starts with `akrogon` (`akrogon-l<12hex>.slice` or `akrogon.slice`): child slice is `<parentBase>-t<pid>s<serial>.slice` (**single** dash-free child token, so no intermediate `<pid>` slice is ever created).
  - Outside any `akrogon*.slice` (e.g. manual `bun test` under `app.slice`): fall back to `akrogon-t<pid>s<serial>.slice` (direct child of `akrogon.slice`), stopped by `afterAll`.

## 3. What could break

- **`slicePrefix` / `sliceDirs` (`tests/run-units.test.ts:37-47`):** hardcodes `.../user@${uid}.service/akrogon.slice`. Keeping all test slices under `akrogon*.slice` preserves `unitDir('/sys/fs/cgroup', slice, unit)` (`:243,313,384,390,707`) with zero change; using `app.slice` as parent would break `slicePrefix` unless rewritten to stop at `user@${uid}.service`.
- **`reconcileHost` glob (`src/reconcile.ts:154,1311-1327`):** `akrogon-l*.slice` matches `akrogon-l<12hex>-t<pid>s0.slice`, but `:1312-1313` only stops exact `leafOf.get(slice)` entries, so child slices are never touched mid-test; `sliceHasProcess` walks cgroupfs subtree and sees child procs while running, and stopping the leaf slice unloads the child.
- **Name length & nested runs:** `akrogon-l<12hex>-t<pid>s<n>.slice` is ~35 bytes (systemd max 255). A nested `run-units.test.ts` appends another `-t<pid2>s<n2>` (~50 bytes), still valid for `AKROGON_RUN_SLICE` (`src/scope.ts:18-24`, forwarded at `src/verify.ts:915`) and stops with its outer test slice.

## 4. Fewest-parts shape & open fork

- **Shape:** (1) `tests/e2e/watch-live.e2e.ts:834-860`: dynamic `heldDue > 2` + relative `pausedDue` / `pausedDue + 1`; no `timer.ts` change. (2) `tests/run-units.test.ts:57-63`: `testSlice()` derives `<akrogonParent>-t<pid>s<serial>.slice` from `/proc/self/cgroup` (fallback `akrogon-t<pid>s<serial>.slice`), keeping `afterAll` `stopTestSlice` (so verify/manual runs leave 0 empty slices too). One-time host cleanup: `systemctl --user stop akrogon-test.slice` clears all 278 existing leaks.
- **Open fork — outside-`akrogon` fallback:** (a) `akrogon-t<pid>s<n>.slice` (keeps `slicePrefix` untouched, never touches `app.slice`) vs (b) `<innermost>-akrogont<pid>s<n>.slice` + generalize `slicePrefix` to `user@${uid}.service`. **Pick: (a)** — `app.slice` is never stopped anyway, so nesting under it buys nothing while keeping `akrogon.slice` containment clean.
