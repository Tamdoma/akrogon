# quick-red, seat A (written before reading B, C, D)

## Q1
- Pick: in the sequential stage, a check named in `full` is recorded `blocked` (existing field, as members are today) when an earlier check in the same pass is red; every non-`full` check still runs. Put the quick checks first by config order (akrogon `issues/config.yaml` checks: format, typecheck, test), a step on main the door can make now (no open leaves). Reason: one condition beside the existing member blocker; every quick failure still shows, only the slow suite waits for a clean head; `full` already names the slow checks (`src/config.ts:49`, admission line). Cost: a seat with a format red does not learn test failures in the same pass; it learns them on the next pass, which runs on the fixed tree anyway.
- Rejected: stop at first red (hides the other 2 s check); keep (47 of 243 runs before 2026-10-26 and 4 of 50 after paid ~70 s for nothing); drop format as a gate (changes the every-check-blocks lock).
- Pitfall: reorder changes `sameCommands` order, so receipts written before the reorder stop matching once; no open leaves now, so cost is nil.
## Q2
- Lean delete, low confidence. After merge-reuse a whole-green row short-circuits; `reuseSource` then only copies entries on a same-tree rerun after a red, which in akrogon is a flake rerun saving the 2 s checks. Framework has no members today. Keep if the verify-waste framework member split is still wanted, since that is the one place it would pay.
## Q3
- One case: format red in a pass, typecheck still runs and is recorded, test is recorded blocked by format and never executes, the row is red. Plus the existing reuse tests updated if Q2 deletes.
