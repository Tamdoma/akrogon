# Slot D permit-flake review

Verdict **fix test cleanup** for `d967cf83` on `29e6a65c`. The normal cancellation path passed.

- **F1 · minor.** An assertion failure after suspension can leave stopped descendants behind. The test saves their PIDs for the success path, but `finally` resumes only the wrapper. `killTree` then kills the wrapper before discovering its descendants. I injected a failure just after the freeze and a scheduler pause between those two operations. Four children had been reparented and were still stopped after cleanup. Track the PIDs as they are stopped, including a partial suspend, and clean that set in `finally`. See `tests/run-permit.test.ts:114–126,613–638` and `tests/helpers.ts:131–139`.
- **F2 · minor, pre-existing.** The test proves that the cancelled runs never execute and that w2 proceeds. It can pass with w2 already ahead of w1 before either cancellation. I delayed w1's startup, confirmed from the admission records that w2 registered first, and the original assertions all passed. If this case is meant to prove replacement of the head waiter, wait for w1's waiting record before starting w2. See `tests/run-permit.test.ts:576–609,624–633`.

I forced w3 to stop inside the line lock on the old test path. The real `stop-run` hit the probe's 300 ms cap and succeeded after w3 resumed. On the revised path I forced w3's flock child to queue behind the test's lock, verified suspension caught that child, and the cancellation and promotion assertions passed. A real `Ctrl-Z` during the turn check can still leave the product lock held. That product behavior is outside this test-only change.

Typecheck, diff check, all 23 run-permit tests and 20 additional cancellation copies across four parallel workers passed. The supplied verify log shows 1,420 suite passes and 115 repeat passes.
