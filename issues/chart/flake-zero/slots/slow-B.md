# Slow B: flake-zero

Read at main bab50987. (H) marks what I ran on this host on 2026-11-24 in a scratch copy of the repo, boxed in a transient service (copy and units removed). Nothing in the repo changed.

1. Recommendation: not O1. Drop `.serial` from the 17 tests in `tests/watch-timer.test.ts`. It moves no code and removes 17 words.
2. Why it is better than a split: these tests mostly wait for real 2 s boundaries. A split spreads that waiting over the 4 workers, so the sum stays 427 s and the wall stays near 107 s. Running the tests concurrently inside one file overlaps the waiting in one worker.
3. Probe (H): the file with `test.serial(` turned into `test(`, run with `--max-concurrency=5`. Idle: 17 of 17 passed in 30 s, twice. Under 48 busy loops on 32 cores (load 48): 17 of 17 passed in 30 to 31 s, four times. Today the file takes 118 s.
4. Expected: the sum drops by about 88 s to about 339 s, so the wall is about 85 s. The longest file is then hc-listener at 45 s.
5. I found no reason for the `.serial`. `tests/AREA.md:35` says serial is for tests that share global state. Each of these tests builds its own fixture and core, and the file writes nothing to `process.env`. The word has been there since the file's first commit (388fb25f) with no comment.
6. Not O2. The tests carry the 2 s tick as real seconds in other places (`:508` a 5 s hold, `:1124` a 6.5 s sleep, `:1180` steps of 2000 ms). A shorter tick means retuning each one, and each is a new bet under load.
7. Q2, hc-listener: the test needs the deadline to cover ordinary passes only because it compares the whole pass list (`tests/hc-listener.test.ts:268-274`). With a short deadline, a slow ordinary pass is killed and retried. That is the behaviour under test, but it adds lines to the list and the comparison fails.
8. So no fixed number is safe with that comparison. 500 ms already flaked, and 10 s is the same bet with a longer fuse. Two clean choices. Keep 45 s, which costs about 9 s of wall. Or use a short deadline such as 5 s and assert the substance: the hang line is there, an `end next --resume` follows it, the hung pid is gone, the listener lives. Then a killed ordinary pass only costs a retry inside `WAIT_MS`. I would do the second only if the 9 s is needed.
9. Q3, F3: change nothing. The rerun is what catches a flaky changed test, and its cost follows the file's own time. With the file at 30 s, a commit touching it adds about 2.5 min, not 10.
10. Main risk: six green runs are not proof of zero. The tests may share something I did not see, and five timer rigs now run at once in one worker. Run the usual stress on this file (many copies under load) before it lands. If one test turns out to need it, put `.serial` back on that test only, with a comment that says why.
