# Review brief: agy-reset (slot D)

Worktree /home/ivan/.akrogon/worktrees/akrogon/agy-reset, one commit 16c85dae on origin/main c4cf74a7.
Cause: tests/door-agent.ts turn() reported `working` before opening its transcript; startA waits for working then starts the reset helper, whose first transcriptFor(A) finds nothing, logs `started: transcript unknown` and exits 1. agy opens slowest (sqlite create), so only agy loses, under load (5 of 23 verify logs).
Fix: the stand-in opens its transcript and writes the prompt before reporting working; pi test drops a folder setup only the old order needed.
Proof claimed: 1.5 s pause before the agy open reproduces the exact red on main; passes with fix.
Check: cause real, fix removes the race (no other path reports working before the transcript exists), no lost coverage. Verdict ready or fix.
