# Slot D review, flaky-wait, round 3

Verdict fix

- Base `1f3f0622824783e230742e41c4cf173272032e40`
- Previous head `fcde06ab29531da6799aa180ee212e750ca605d2`
- Head `24e0be0365e5a3c29d14f980d6b5efc52ab4ad02`

F1–F3 passed their exact replays. Both coalescing cases accepted two startup status calls. The idle-gap case still used backlog 3 after a 10.5-second pause following resume and accepted due 7. The forged-tick case inspected its refusal after a legitimate tick had appended its own hook block.

1. **F4. The per-due test still guesses which tick will take the hold.** `tests/watch-timer.test.ts:453–469` calculates `nextDue` before arming the hold. A 2.7-second pause between those operations let due 2 run first on both heads. Due 3 then arrived, and the test compared it to the stale prediction and failed with `3 < 4`. Use the held status record here, as the dedicated coalescing test does.
2. **F5. Two touched tests still require due 1 after startup.** `tests/watch-timer.test.ts:447–452` and `:1054–1058` require the first due to be 1. With the initial status call delayed by five seconds, the timer correctly coalesced startup dues and sent due 2 first. Both tests timed out waiting for due 1 while later dues continued. The probe shortened that wait to 7.5 seconds for diagnosis. Read the first delivered due from the fixture and use that number to check the receipt and status.

All 22 tests in the two touched files passed unmodified with `--timeout=120000 --max-concurrency=5`. The race probes used disposable checkouts. `git diff --check` passed.
