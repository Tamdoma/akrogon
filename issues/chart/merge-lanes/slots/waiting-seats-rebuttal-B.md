# Waiting seats: slot B rebuttal

2026-11-21. Disagreements only. Code at akrogon `4f5e3fd2`. Ledger counts are mine, framework `log.jsonl` and `timings.jsonl`, 2026-11-14 to 11-21, read 2026-11-21.

## Q1 reopen trigger

- W1. I hold one memory trigger: `memory.events` high on `akrogon.slice` moving off 0. It is the limit itself, the kernel already counts it, and it is 0 today. C's "slice anon above 40 GB" is a second number with no measured basis (anon is 10.1 GB now, and no anon peak is recorded).
- W2. For the queue I hold waiters above 20. At 22.2 min of line per landed leaf, the 20th waiter is 7.4 h from its turn. That is a line problem to reopen on, separate from memory.

## Q2 reasons and idle-age close

- W3. "Warm B keeps repair and broadcast cheap (A,B,C)" misstates my note and is wrong on tokens for long waits. A B wake below 50% cached happens 12% of the time after 30 to 60 min idle, 41% after 1 to 3 h and 95% after 3 h, at 153k uncached tokens median, against 23k for a new seat's first turn (codex session records, 208 files). The reasons to keep are a fast hand-off and no new code. Cheap tokens is not one of them.
- W4. Missing from the merged measure: 97 of 201 landed leaves got a broadcast prompt, and 73 of them (36% of all landed) needed B for nothing else. A broadcast reads the owner's briefs and needs no review context, and it always comes at the end of the whole wait. That is the strongest token case for a later idle-age close.
- W5. I still hold "no idle-age close now". It needs a timer and a clean close for at most 7 GB and an unproven token saving. W4 is the first thing to measure if it reopens.
- W6. C's slice hazard is not only an argument against closing. `sliceKeepReason` keeps a leaf slice for its own slice, a live run record, a broadcast, a tabless unfinished leaf, pre-hc state or a live tab (`src/reconcile.ts:200-218`). None of those is "a command-owned land run is alive". A holder whose two seats die on their own is therefore exposed today whenever no verify run record is live (setup, gates, push). Under red-exit a merge leaf needs no seat, so its slice should not depend on one. This belongs to the red-exit leaf, not to this fork.

## Q3

- W7. `broadcastPass` row: I now hold A's "leave it". `allocate` skips the cap check while either seat is live (`src/next.ts:413-414`), and a merged leaf with a pending broadcast keeps its seats (`landedWake` closes the tab only when no broadcast waits). A refusal there needs both seats dead.
- W8. The before and after figures are not the same unit. My M1 is hours with 12 or more seated leaves, rebuilt from moves, and it overcounts (it shows 15 at most). The `capacity` rows will give wait time per refused leaf. To compare, the after figure must also be read as hours with at least one open `capacity` wait. The merged line drops both caveats.

## Not asked

- W9. C's lost-B case is already answered by the code for one seat: `live` is `liveSeat(found.A) || liveSeat(found.B)` (`src/next.ts:413`), so a `check.repair` leaf with a dead B and a live A is exempt from the cap. Only a leaf with both seats gone waits under it. I hold no new rule either way.
- W10. On "is 12 right" I hold no change now, with A and C. One fact is missing from the line: working leaves never passed 10 in the window, so 12 working at once has not been run on this host. W1 is the check.
