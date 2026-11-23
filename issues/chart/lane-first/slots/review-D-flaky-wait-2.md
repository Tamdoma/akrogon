# Slot D review, flaky-wait, round 2

Verdict fix

- Base `1f3f0622824783e230742e41c4cf173272032e40`
- Previous head `2a27e46611578c2b8283d323dd59abb3ad8c992c`
- Head `fcde06ab29531da6799aa180ee212e750ca605d2`

Both original 2.7-second delay probes passed. Each delivered one tick before the test armed the hold or stopped the timer, and the new assertions handled it.

1. **F1. Both coalescing tests still assume only one status call has happened at startup.** At `tests/watch-timer.test.ts:1057–1063` and `:1080–1084`, moving the same 2.7-second pause just after `started()` let a legitimate tick finish before the status count was read. Both tests failed on two calls where they expected one, before reaching the new held-tick logic. Wait for the startup check, allowing subsequent tick checks to have already run.
2. **F2. A delay after resuming the timer inflates the expected backlog.** `tests/watch-timer.test.ts:1101–1106` samples the clock after `SIGCONT`. With a 10.5-second pause between those operations, the backlog was 3 at resume, the next coalesced send was due 7, and the test expected a value above 8. Sample the due count while the timer is still stopped.
3. **F3. The forged-tick test can inspect a legitimate tick's hook block.** At `tests/watch-timer.test.ts:583–595`, the new wait finds the refusal anywhere after the saved offset. The assertion then takes the first block at that offset. A 2.7-second pause before the send let a legitimate tick append its accepted hook and status. The forged tick then wrote the expected refusal, but the test inspected the legitimate block and failed. Start the assertion at the matched refusal line.

All 22 tests in the two touched files passed unmodified with `--timeout=120000 --max-concurrency=5`. The timing probes used disposable checkouts. `git diff --check` passed.
