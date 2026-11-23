# Design B: test-hygiene

Code read on main at 814a2387. (H) marks what I ran on this host on 2026-11-23.

## 1. #150

- F1. The timer is right. While the watcher works, the one unsent due is renumbered to the newest boundary (`skills/watch-issues/scripts/timer.ts:172-177`). The hold is `intervalSec * 2 + 5` s, so two boundaries pass and the due sent after the hold is 4, or 5 under load. `due=3 sent` cannot appear.
- F2. The timer's own tests already prove the renumbering (`tests/watch-timer.test.ts:482, :1078, :1100, :1139`). The e2e only needs: one tick went out after the hold, once, not dropped.
- F3. The same stale block is in four places: `tests/e2e/watch-live.e2e.ts:783-791, :833-841, :962-970, :989-997`.
- Change: one helper beside `sentTurn` (:255), `nextSent(tier, timer, after, ms)`. It returns `{due, turn}` of the first `due=<n> sent` line with n above `after` (line format at `timer.ts:224`). Each hold block becomes:
  - `held = await nextSent(tier, timer.address, 2, <same window>)`
  - `waitDue(…, held.due, …)`, `waitCallAtTurn(callLog, 'status', held.turn, …)`, `expect(held.turn).toBeGreaterThan(busy2r)`
  - the screen has `due=${held.due} sent` once and no `due=${held.due} dropped`.
- F4. The later numbers have the same defect. `waitDue` passes on "label is at least n" (:317).
  - Due 4 (:797-798, :847-848): if the held due was 4, both waits pass at once on the held due's own check, made before the pause. Nothing paused is proven. If it was 5, `due=4 sent` never appears and the cell is red after 90 s.
  - Due 5 (:858): harmless, because the proof is the `next` count at :859. Make it relative anyway.
  - Change: `p = await nextSent(…, held.due, …)`, then `waitDue(p.due)` and `waitCallAtTurn('status', p.turn)`. Line :858 becomes `waitDue(p.due + 1)`.

## 2. P12

- F5. The leak is the implicit parent slice. 278 `akrogon-test-<pid>.slice` are loaded, active, with 0 tasks. No `akrogon-test-<pid>-<n>.slice` is left (H). `afterAll` stops the named slice (`tests/run-units.test.ts:113-121, :247-250`). systemd made `akrogon-test-<pid>.slice` and `akrogon-test.slice` as parents, and nothing stops those.
- F6. systemd facts (H):
  - An empty slice stays loaded and active after its last unit ends.
  - Stopping a child slice leaves its parents active.
  - Stopping a parent stops every child slice and the units in them. Two live services in `p-c2.slice` and `p-c2-d.slice` were gone after `stop p.slice`.
  - A slice one level under its parent is gone after its own stop, with no parent left behind.
- So the name must add exactly one level. `<own>-test-<pid>-<n>` under the test's own slice would leak two parents again.
- Name rule in `testSlice()` (:58-62): `<own>-t<pid>x<n>.slice`. `<own>` is the last path part ending in `.slice` on the `0::` line of `/proc/self/cgroup`, without the suffix, when it starts with `akrogon`. Otherwise it is `akrogon`.
  - Under a leaf run: `akrogon-l<hash>-t<pid>x<n>.slice`, a child of the leaf slice (`src/scope.ts:11`). It stops when reconcile stops the finished leaf's slice (`src/reconcile.ts:1324`).
  - Under a `--holder` run or a hand run: `akrogon-t<pid>x<n>.slice`, directly under `akrogon.slice`. A hand run sits in `app.slice` (H), so the fallback keeps test units under akrogon's memory ceiling.
- Nothing else makes these slices. `AKROGON_RUN_SLICE` is set only by this test file (H).

## 3. What could break

- R1. Reconcile lists `akrogon-l*.slice` (`src/reconcile.ts:154`), so the new child names match the pattern. It acts only on exact leaf names (`leafOf.get(slice)`, :1312-1313). Children are skipped. No change needed.
- R2. Path helper. `sliceDirs` (`tests/run-units.test.ts:41-45`) splits on `-`. The leaf hash is hex and the new part has no dash, so the chain is right.
- R3. Length. A name is about 35 characters, plus about 12 for each nested suite level. The limit is 255.
- R4. A killed run under `akrogon.slice` still leaves its slices, empty, until logout. One slice per `testSlice()` call, no parent.
- R5. Test units now count against the leaf slice's limits. That is the intended containment.
- R6. `nextSent` after the pause can pick a due sent before the pause took effect. Today's fixed 4 has the same race.

## 4. Final shape

- A1. `watch-live.e2e.ts`: add `nextSent`, use it in the four hold blocks and the two pause blocks.
- A2. `run-units.test.ts`: the name rule in `testSlice()`. No `src` change, no reconcile rule.
- A3. Once, with no suite running: `systemctl --user stop akrogon-test.slice`. It removes all 278 (F6).
- Q1. Parent of the test slice. O1 the test's own slice (pick, the agreed direction, killed leaf runs are cleaned at leaf end). O2 always `akrogon`, a one-line name change. O2 alone already stops the leak seen today (F5), but a killed run is never cleaned.
