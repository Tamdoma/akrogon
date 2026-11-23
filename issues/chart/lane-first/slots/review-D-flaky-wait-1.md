# Slot D review, flaky-wait

Verdict fix

- Base `1f3f0622824783e230742e41c4cf173272032e40`
- Head `2a27e46611578c2b8283d323dd59abb3ad8c992c`

1. **F1. The busy-watcher test can arm its hold one tick late.** `tests/watch-timer.test.ts:1026–1039` observes the startup status and then writes the hold file. The watcher and timer can already deliver and handle a tick in between. I delayed the test process by 2.7 seconds between those steps. Due 1 was delivered before the hold, due 2 took the hold, and the test failed on `[1, 2]`. The relative assertion still assumes its first observed tick is the one that took the hold. Arm the fixture to hold the first tick's status call before launch, or identify the tick that actually took the hold.
2. **F2. The idle-gap test can send a tick between readiness and the stop signal.** `tests/watch-timer.test.ts:1057–1081` checks for zero ticks before waiting for the up line, then sends `SIGSTOP` in a later step. I delayed the test by 2.7 seconds after it saw the up line. Due 1 was delivered before the stop, and the test failed on `[1, 4]` because it requires the second due to be at least 6. Establish which ticks had been delivered when the timer was paused, and check the sequence produced by the pause.

The capture fix passed a delayed-admission replay. With a 1.5-second delay after resolving capture ownership, base reported `owner gone` at `src/run-check.ts:368` and never wrote the ready file. Head waited for readiness before starting the phase (`tests/durable-capture.test.ts:302–311`) and passed.

I confirmed the timer's startup race separately by delaying its clock initialization by 1.5 seconds. Base delivered `[1, 5]` and failed. Head delivered `[1, 7]` and passed. The up line at `skills/watch-issues/scripts/timer.ts:72` is terminal output. The timer launcher and identity check use argv and labels, and the other screen readers I found match specific send, drop or exit text.

All 22 tests in the two touched files passed unmodified with `--timeout=120000 --max-concurrency=5`. The timing probes used disposable checkouts. `git diff --check` passed.
