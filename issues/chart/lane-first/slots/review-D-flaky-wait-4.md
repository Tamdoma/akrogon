# Slot D review, flaky-wait, round 4

Verdict fix

- Previous head `24e0be0365e5a3c29d14f980d6b5efc52ab4ad02`
- Head `7d247f0bd6eb95244c47434b6191084f1960262f`

1. **F4 fixed.** After the original 2.7-second pause, dues 1 and 2 were already delivered. The test used the actual held due 3 and coalesced due 6, and passed (`tests/watch-timer.test.ts:488–503`).
2. **F5 fixed.** Delaying the startup status call by five seconds made due 2 arrive first. Both tests read that due and passed (`tests/watch-timer.test.ts:488–492`, `:1060–1064`).
3. **F6. The missed-boundaries test can pass without exercising the watcher completing while the timer is stopped.** It releases the held check, sleeps nine seconds, and resumes the timer without waiting for the watcher to finish that turn (`tests/watch-timer.test.ts:1155–1166`). In a disposable checkout I removed the completed-turn part of `working` at `skills/watch-issues/scripts/timer.ts:166`, reproducing the behavior this test aims to catch. At normal speed the watcher was idle at resume and the test rejected due 2 for backlog 5. Adding a 10-second delay after the hold was released left the watcher working at resume. The same broken timer passed with due 6 for backlog 5. Wait for the held turn to finish while the timer is still stopped, then sample the backlog and resume.

All 22 tests across the two touched files passed unmodified with `--timeout=120000 --max-concurrency=5`. `git diff --check` passed.
