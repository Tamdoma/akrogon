# Review brief: test-hygiene (slot D)

Chart: CHART.md, INTAKE.md (#150), forks/design.md (picks 1-3, checked by B and C).
Worktree /home/ivan/.akrogon/worktrees/akrogon/test-hygiene, one commit 047fd3fb on origin/main 814a2387.
- tests/e2e/watch-live.e2e.ts: nextSent(after) and sentBetween helpers; four hold blocks wait for the first due sent after the hold (no fixed 3), assert once sent, not dropped, nothing sent between 2 and it; both pause blocks relative to the held due. No timer.ts change.
- tests/run-units.test.ts testSlice(): `<own>-t<pid>s<n>.slice`, one level under the innermost akrogon slice from /proc/self/cgroup, else under akrogon.
Evidence (logs in direct/): standin root red on base (`no due=3 sent`), green on head (held due was 4), standin shell green; the two paid-cell hold blocks not run. run-units 27 pass; akrogon-t*/akrogon-test* slice count 280 before and after; verify 1375 pass.
Check: the assertions still prove criteria 4, 8 and 12 (pause acts on nothing; unpause resumes) and cannot pass vacuously or race under load; the paid-cell blocks are correct by reading; the slice rule leaves nothing behind under a leaf run, a holder run, a nested run and a hand run, and stopping the parent stops the child. Verdict ready or fix.
