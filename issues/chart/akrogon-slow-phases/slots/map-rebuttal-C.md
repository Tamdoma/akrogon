# Rebuttal C: akrogon slow phases map (disagreements only)

## X1. "`test_changed` selects nearly everything" is too strong (merged:7)

In the pi implement passes I measured, `bun test --changed` ran 41 times with a median of 0 s. Only 5 of the 41 runs took 76 to 132 s (base-preflight 132 s and 108 s, worker-path 118 s and 113 s, role-swap 76 s). Inside the 47 worker sessions it ran about 74 times with a median of 0 s and a maximum near 31 s per call before a wait. It selects nearly everything when the leaf touches a file `tests/next.test.ts` imports, and nothing when the leaf is prose or skills only. The finding should say "selects nearly everything when src changes". This matters for fork 3: the changed-tests step is free on prose leaves and a full duplicate on src leaves.

## X2. Fork 3 is not only an operator config edit (merged:17)

The changed-tests run is required by the skill text, not only by config. `skills/implement-issue/SKILL.md:51` says both modes run the resolved changed-tests command as work lands, and workers receive only that command. `skills/implement-issue/SKILL.md:59` and `:75` require changed tests at implement end and after every repair. Removing the config entry leaves those rules pointing at a command that no longer resolves. Workers would also lose their only test command. The fork needs an option that keeps `test_changed` for workers and drops only the duplicate run at implement end and merge, and that is a skill edit through a leaf.

## X3. Attributions

- merged:12 marks "11 min of that was required fresh-agent acceptance proof" as (B,C). I did not measure or report that split. My figure is 21.1 of 30.2 min waiting on the worker, with no breakdown of what the worker did.
- merged:18 says fork 4 is "irrelevant after fork 1 (C)". I said that about the changed-tests fork only. I did not see or report the 120 s timeout kills. I agree a 10 s suite makes them unlikely on a quiet machine. Under overlap the serial suite doubled (72 to 82 s quiet, 110 to 160 s on 09-28), so I would not call the timeout fork irrelevant until the concurrent suite is timed with several leaves active.
- merged:21 and merged:23: I read only the Bun test configuration page, not a parallel page, and I did not cite the Anthropic harness design post in this round. Those belong to the peers who read them.

## X4. Fork 1 presents the concurrency bound as a disagreement (merged:15)

It is not one. In the same scratch session I also ran `bun test --concurrent --max-concurrency=8`: 14.1 s, the same 351 pass and the same 2 failures in `tests/shell.test.ts`. I left it out of my map. A bound of 8 costs about 4 s against the default of 20 and should ease the contention pitfall at merged:29. B's bound and the concurrent option can be one option. The open part of B's position is the isolation audit, which I support as the "repeated runs" condition already in the fork.
