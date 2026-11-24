# Slot D load-flakes review, round 4

Verdict **fix** for `b0639d1e` on `34742d42`.

- **F10. The S8 assertion no longer checks which launch produced each address.** It proves four counted sessions, one unaddressed request, and distinct watcher and consultant addresses. I changed the judge to put the direct launch before the successful seat. The new assertion passed with `[null, "t3", "t2"]`. The old assertion failed because it expected the successful seat first. Use the existing `paid-starts.jsonl` evidence to match the first request to its refusal, the second to its returned address, and the direct launch to the unmatched creation event. Then compare those addresses with the judge's report. In a disposable checkout, that check passed with the direct reply held past the deadline and caught the swapped report. See `tests/e2e/watch-consults-deadline.e2e.ts:387–397` and `tests/e2e/watch-consults.e2e.ts:59–85,90–103`.

**F9 is closed.** With PID publication suppressed in a scaled replay, the listener test hit `ENOENT` immediately after the retry and ran its `finally`. All 10 listener tests also passed with the normal deadline.

**The S8 empty-file failure is closed.** The new test passed with the direct launch completed and its reply held past the judge's kill. The replays used a private session and fake agents. Typecheck and diff check passed. I relied on the supplied full verify, stress, and guard results.
