A's round 1 reply, new heads on flaky-wait:
- cfaee210 (F1): the logging wrapper writes `held status n=<k>`; heldPair finds the tick that took the hold; next due >= held + 3, consecutive on screen.
- 63e6782e (F2): no zero-ticks check before the stop; due 1 time comes from the up line, the backlog by resume is computed, the send after the held tick must pass it. A tick before the stop is allowed.
- fcde06ab (new): the start test waits for the status line written after the check (the start line is written before it); waitHooks matches only lines after the send's starting length (fixes :313, :616, :555, :635 matching older lines).
D's 2.7 s replays: old 6/6 fail, new 6/6 pass. 22/22 in both files.

Round 2 reply (A), head 24e0be03 (736fe5d2, b39d3553, 24e0be03 rewritten):
- F1: waitChecks(rig, n) waits for at least n status calls; the hold is armed after the start check's status; heldPair names the held tick. Same fix in the per-due and space-root tests (at least 2, never more than accepted + 1).
- F2: backlog counted on the timer's clock inside the stop window, before SIGCONT.
- F3: the no-check block starts at the matched refusal line.
- Route: kept real-clock tests (they cover real backlog while busy or paused); assertions now read the timer's own clock, the wrapper's held record, and accept-before-status ordering. D's three delays: old 3/3 fail, new 3/3 pass.

Round 3 reply (A), head 7d247f0b (only the waits commit rewritten): one full sweep of watch-timer.test.ts. Every fixed or predicted due now reads what was delivered or held (helpers dues, waitDues, ownBlock, firstDueAt; the hold also takes `release`). F4 = S2 (heldPair), F5 = S1/S11 (first delivered due). The full list of converted (S1-S13) and exempt (E1-E8) items with reasons is in the helper report, copied below.
S1 per-due first due+receipt; S2 heldPair; S3 capped loops->WAIT_MS; S4 pause: no sleep, waits next task line; S5/S6 idle mode from first; S7-S10 ownBlock instead of status counts; S11 space root; S12 refactor; S13 missed boundaries: held head + stop-window backlog.
Exempt: E1/E2/E8 interval 3600; E3 lower bound of awaited checks; E4 idle mode no hook; E5 forged inputs; E6 pin-death liveness gap; E7 consult tests.
D's delays (2.7 s nextDue->hold, 5 s first status): old fails, new 3/3 whole file.

Round 4 reply (A), head e1e25715: F6 fixed. No 9 s sleep; while stopped the test releases the hold, waits for the held status to return and the watcher idle, waits on the timer clock for two boundaries past the last counted at the stop, samples the backlog, then SIGCONT. D mutation (timer.ts:166 working = busy): fails 3/3 with and without the 10 s delay; real timer passes 3/3 both ways and under full CPU load.
