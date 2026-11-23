# Design: test-hygiene

## Question

#150 (watch-live standin cell red on base) and P12 (test slices leak): final shape under the lean-akrogon map direction.

## Findings

slots/design-B.md, slots/design-C.md.

- The timer is right: while the watcher works, the unsent due is renumbered to the newest boundary (skills/watch-issues/scripts/timer.ts:166-178); the hold of intervalSec*2+5 crosses two boundaries, so due=3 never sends. (B,C)
- The same stale fixed numbers sit in four hold blocks (tests/e2e/watch-live.e2e.ts:783-791, :833-841, :962-970, :989-997) and the pause blocks after them; waitDue passes on "at least n" (:317), so the pause proof can pass on the pre-pause due. (B; C for :833-858)
- The leak is the implicit parent: testSlice() names akrogon-test-<pid>-<n>.slice, systemd makes akrogon-test-<pid>.slice and akrogon-test.slice as parents, afterAll stops only the child. 278 empty parents are loaded now. Stopping a parent stops and unloads every child; an empty slice stays loaded otherwise. (B,C, both probed on the host)

## Taken

A's picks (full autopilot), 2026-11-23:

1. watch-live.e2e.ts: one helper beside sentTurn, nextSent(tier, timer, after, ms) returning {due, turn} of the first `due=<n> sent` line with n above after. Each hold block uses it: waitDue(held.due), waitCallAtTurn('status', held.turn), held.turn > busy turn, the screen shows `due=${held.due} sent` once, no `due=${held.due} dropped`, and no `due=<n> sent` for 2 < n < held.due. The pause and unpause waits are relative to held.due the same way. No timer.ts change. (B,C)
2. run-units.test.ts testSlice(): `<own>-t<pid>s<n>.slice`, one level only, where <own> is the innermost `.slice` part of the `0::` line of /proc/self/cgroup without the suffix when it starts with `akrogon`, else `akrogon`. afterAll keeps stopping each. No src change, no reconcile rule. (B,C; B Q1 O1, C fork (a))
3. Once, after landing and with no suite running: `systemctl --user stop akrogon-test.slice` removes the existing leaked parents. (B,C)
