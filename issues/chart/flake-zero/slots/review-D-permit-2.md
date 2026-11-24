# Slot D permit-flake round 2

Verdict **ready** for `1c7efc84` on `29e6a65c`. Reviewed `git diff d967cf83 1c7efc84`.

- **F1 closed.** I forced w3's flock child to queue, then failed the test after suspension. With the same pause in the generic tree cleanup as round 1, none of the five tracked processes remained stopped. An additional failure during suspension left neither tracked process stopped.
- **F2 closed.** I delayed w1's startup by 700 ms. The admission records still showed w1 ahead of w2, and w2 ran after cancellation.
- **F3 · minor.** The success path waits for w3 to exit, then cleanup still sends `SIGKILL` to its saved numeric PID and the saved child PIDs. A recycled PID could receive a signal meant for the exited process. I did not reproduce PID reuse. See `tests/run-permit.test.ts:634–642`.

Typecheck, diff check and all 23 run-permit tests passed. The supplied verify log shows 1,420 suite passes and 115 repeat passes. I did not rerun the reported 72-copy stress run.
