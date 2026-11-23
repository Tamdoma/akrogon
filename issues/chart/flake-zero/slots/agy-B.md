# Agy B: flake-zero

Read at worktree head fe7e6361. (H) marks what I ran on this host on 2026-11-23 in a private throwaway hc session (`akr-probe-b4`, removed), hc 0.1.22. Nothing in the repo changed.

1. Agree with A: the agy retry takes no read and keeps the base behaviour. Not O1: the retry test asserts no second send within 200 ms (`tests/hc-delivery.test.ts:526-527`), and a replayed idle breaks that by timing, so it would flake.
2. The split, with no flag: `waitFor` in `src/hc.ts` goes back to its parent's body (snapshot, merged events, `until(t, line)`). The read, the equality skip and the second `settled` check all go (`src/hc.ts:509-524`).
3. The state wait is that same `waitFor` with a predicate that reads: `async () => { seen = await terminal(session, address); return until(seen); }`, and the caller uses `seen`. Events say when to look and the read says what is true.
4. Put it in one small wrapper, `waitForState(session, address, until, ms)`, about 8 lines in `src/hc.ts`, so the fake-hc cases in `tests/hc-identity.test.ts` keep a target. It has one product caller, the first-task proof (`src/seat.ts:218`). `agyTask` (`:142`) keeps `waitFor`.
5. This reads on every line, not only on the snapshot. There is no replay, because nothing is merged into what the predicate sees. My L1 from reread-B.md (a mixed state that never existed) goes too.
6. A missing terminal stays `null` for free: `waitFor` asks the predicate only when the snapshot or an event gave it a terminal (`src/hc.ts:523-524`).
7. I tried a third way and it fails (H): use `status_ms` from `hc get` as the identity of a report, so agy could take the read and skip replays exactly. A stand-in reported idle twice, 1.2 s apart. The second report got its own event (seq 4) and `status_ms` stayed 1795463333495. It marks a state change, not a report.
8. So O3 upstream is the only exact fix for agy. Ask for the seq in `hc get`. `status_ms` in events would not help, for the reason in point 7.
9. Loss left, L1: an agy report (trust dialog or idle) made in the few ms of subscription start under load can still be lost. The seat then waits out its 60 s budget and reports not confirmed. From my 1.2% figure and agy's seconds of startup I estimate under 1 in 10,000 agy starts under heavy load. None of the three observed flakes was here.
10. Loss left, L2: one `hc get` per event during the proof wait, 1 to 4 ms each under load (H, reread-B.md). A proof wait sees a handful of events.
11. Loss left, L3: a deadline that fires during a read returns `null` although `seen` may show the proof. `firstTask` then reads once more and reports not confirmed (`src/seat.ts:226-227`), as today.
12. Delete from fe7e6361: the `src/hc.ts` change, and the third fake-hc case (an event the read already shows does not ask again). Keep the fixture's read on the snapshot and add D's F4 check after it (`tests/hc-fixture.ts:364-400`).
