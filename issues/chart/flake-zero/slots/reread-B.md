# Reread B: flake-zero

Read at worktree head e7e8b058. (H) marks what I ran on this host on 2026-11-23 in a private throwaway hc session (`akr-probe-b3`, removed), hc 0.1.22, 8 terminals, 48 busy loops on 32 cores. Nothing in the repo changed.

1. Pick O3: one fresh read when the snapshot arrives, and nothing else. `waitFor` and the fixture's `waitFor` take `current` from `hc get` on the snapshot line, not from the snapshot. No heartbeat reread, no deadline read.
2. It closes the window (H). I changed a label within 4 ms of a subscription start, 4,000 times under load. 48 changes (1.2%) were in neither the snapshot nor any event. A `hc get` started when the snapshot arrived showed the change in 48 of 48. An earlier run gave 2 of 960, both seen.
3. The window ends before the client has the snapshot (H): a change made when the snapshot arrives got its event 8,000 times of 8,000 under load. So after that read, every later change has an event.
4. With no load there were 0 drops in 4,000, which matches D's 300.
5. Cost (H): one `hc get` per wait, 1 to 4 ms under that load.
6. `waitForDoc` needs no change. It already reads the document after the snapshot arrives (`src/hc.ts:562-573`). `src/listen.ts:84-99` does the same with `next --resume`. F2 then has no cause.
7. F1: the read is still inline in the callback, once per subscription. Events that arrive during those few ms wait behind it. Add `if (settled) return` after the await (`src/hc.ts:523-534`), so a timer that fires during the read cannot be followed by a predicate call.
8. Why not O1: it recovers after 15 s, adds a second path that races real events, and needs a rule for late results. Why not O2: a drop costs the full timeout, 90 s in the fixture against a 120 s test limit, and the agy predicate would send its task at the deadline.
9. Loss left, L1: events queued during the read are merged onto a newer state. `current` can pass through a mix that never existed, for example `working` with the new turn, before it ends right. Both start-proof predicates accept either order.
10. Loss left, L2: a drop outside a subscription start is not covered. I saw none. A `missed` line is a new snapshot, so it gets the read too (`src/hc.ts:396-400`).
11. Loss left, L3: I probed label events, not status, turn or doc events. I assume one delivery path in hc. A change inside the 1 to 4 ms of the read itself was not seen lost in 50 drops, which bounds it and does not prove it.
12. Delete from e7e8b058: the `reread` kind and flag in `hcReader` with its comment (`src/hc.ts:352-356, :379, :387-404, :433-435`), the heartbeat branch in `waitFor` (`:526`), the `waitForDoc` change, the fixture block (`tests/hc-fixture.ts:383-388`), and the reread skips in `tests/door-exchange.test.ts:111`, `tests/hc-observe.test.ts:84`, `tests/hc-identity.test.ts:187, :239`, `tests/e2e/watch-consults.e2e.ts`. The `'params' in line` edits in `src/listen.ts` and `src/seat.ts` go back.
13. Could break: a snapshot with no such terminal gives `null` today, and `hc get` on a missing terminal fails. The read must keep `null` for that case.
14. Size: about 4 lines added (two reads, the settled check, a comment) for about 45 removed.
