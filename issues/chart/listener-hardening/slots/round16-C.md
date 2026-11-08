# Round 16, slot C: the predicate has no wake after claude's late flush

Confirmed from the incident: `fork-tool-boundary/slots/door-reset.log` warm-up at 14:07:21.798, `reset unconfirmed` at 14:17:21.800 (the full bound); `c6ff1c9b…jsonl` line 10 user record 14:07:21.803, line 41 assistant reply 14:07:24.868. The predicate (`door-reset.ts:132-138`) ran on the `done` event, the reply was not on disk yet, and nothing ran it again: `follow` drops hc heartbeats before they reach the handler (`src/hc.ts:375`, `:394`), and an idle terminal sends nothing else (my 40 s and 75 s samples on t1: heartbeats only, one every 15 s: 16:06:15, :30, :45, :00).

## Candidates

- (1) transient `fs.watch` on the candidate transcript. A watcher by any reading of the operator's words, and the candidate is not known before the reset (claude and agy open a new file after `/clear`), so it would have to watch a folder. Reject.
- (2) bounded re-read after the idle event: when `idle(t)` holds and the code's user record exists but no reply, schedule one re-check a few hundred ms later. One `setTimeout`, no file watching, finishes in under a second. It is "a delay", the thing round 12 was asked not to add; it is also exactly sized to the measured 100 ms lag, so a slower flush (a long reply, a loaded machine) needs a second or third tick, which is polling by then.
- (3) turn-count proof again. The round-12 race is in the ordering between the reset's turn end and the warm-up's receipt record, and that ordering is the harness's, not ours (round 12: 50.176 vs 50.221; here 21.5xx vs 21.803). Any turn-based rule has to assume it. Reject.
- (4) hc already ticks: `hc events` sends a `heartbeat` line every 15 s on every stream. Let `waitFor` run its predicate on heartbeats too. No new file, no timer of ours, no watcher: hc's keepalive is the wake. Cost: the confirmation lands up to 15 s after the reply (3 s reply here, so about 12 s of waiting), and the predicate re-reads a fresh, small transcript once per 15 s while it waits; it also closes the same gap for every other `waitFor` wait that depends on something hc does not event. Recommendation: (4). If 15 s is too slow for the operator, (2) is the fallback, stated as a delay.

## Change for (4), file:line

- `src/hc.ts:394`: instead of `continue` on a heartbeat, call an optional `onHeartbeat` the caller passes to `follow` (`:377-380` signature); callers that pass none keep today's behaviour (`src/listen.ts:131`, `src/hc.ts:506`, `src/seat.ts:101` untouched).
- `src/hc.ts:460-470` (`waitFor`): pass `onHeartbeat` = re-run `until(current, lastLine)` when `current !== null`, settling exactly as a real line does. Nothing in `door-reset.ts` changes: its predicate already re-checks `idle` on a fresh read (`:137`) and the code via `transcriptByCode`.
- Heartbeat schema already exists (`src/hc.ts:375`); `HcLine` (`:348-376`) stays as is because the heartbeat never reaches `until` as a line.

## Other harnesses

Not verifiable from files: a transcript holds record timestamps, not the moment the status escape left the process. What the files show: codex writes `event_msg item_completed` 1 ms before the `response_item message assistant` it completes (newest rollout, 15:03:11.825 then .826), so its completion signal precedes the reply record in the file; pi writes `message assistant` then `toolResult`; agy inserts steps while the turn runs (round 15). The fix in (4) does not depend on the order for any of them, which is why it is the one to take.

## The fake

`tests/door-agent.ts:144-145`: emit `status('idle')` first, then `await Bun.sleep(100)`, then `write(record('assistant', …))`, for every kind (the order is only measured for claude, so the stand-in should not promise more for the others). With the current helper the claude cases then wait out the bound; with (4) they pass after one heartbeat, so each handover case takes up to 15 s longer. If that is too slow for the suite, the test core's heartbeat interval is the knob to look for, not the fake.
