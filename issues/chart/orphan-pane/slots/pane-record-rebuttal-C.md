# pane-record rebuttal — slot C

## Withdrawn

C withdraws "no consumer assumes recorded implies boxed". `broadcastPass` (src/next.ts:1091) is that consumer: when recorded `state.pane.B` is live it calls `dispatchSlot` directly, and `dispatchSlot` (`src/next.ts:581` onward) prompts without any `inOwnScope` check. Today the shortcut is safe because `{A,B}` is only saved after both boxes; under (a) a leaf killed between the pair save and `box(second)` holds a recorded-unboxed B, and a later `broadcastPass` would prompt it unboxed. A and B are right; removing the live-B shortcut so broadcasts route through `allocate` (whose entry sweep re-boxes or re-splits) is also the minimal fix — it deletes code and reuses the existing dead-B path rather than duplicating a scope check in `broadcastPass`.

## Disagreements

1. **"A: bounded; the window is one herdr round trip" understates the residual differently than stated.** The orphan window under (a) is not just "between herdr creating the pane and saveState" as a post-return gap: a process killed mid-call, after `herdr pane split` commits server-side but before the reply with the pane id arrives, also orphans — the id is never learned, so no save can name it. So the window is the whole split RPC plus the save (still milliseconds, still bounded, and (a) still wins), but the recorded cost line should read "dies between issuing `pane split` and completing `saveState`", not after the id is known. Same evidence: `tests/fake-herdr.ts` `pane split` creates the pane server-side before `result()` returns; nothing client-side can observe the id earlier.

No other disagreement: the pair-save rule, rejection of (b)–(e), "clear stale ids: optional", and "split lands in the source tab: pre-existing assumption" all stand as merged.
