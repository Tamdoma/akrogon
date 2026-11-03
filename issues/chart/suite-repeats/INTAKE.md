# Intake: suite-repeats

## Scope

Cut repeated full-suite runs in the akrogon leaf lifecycle by removal, not addition:

- X1: merge reuses the leaf's green receipt when the tree and command set are the same, with the merge gate and the reuse lookup using one rule so they cannot disagree again (the cause of the 2026-10-25 revert 9aaed138).
- X2: a red quick check (format, typecheck) skips the slow test run; every quick check still runs. Includes whether per-command reuse (X2b) stays.
- X3: B runs `akrogon verify` at the end of check.repair only when moving to merge, which is the only move whose gate needs the receipt (the reason fb236ec0 restored it).

One destination, akrogon. Off route by the operator's last framing: test-suite internals (map X5), the timing reader `reasonAt` bug (map X6), A's round-0 review (map X4), and map X7-X10.

## Provenance

- Operator: door session 2026-11-01 in pane w8:pNP (A session 6fae401d-8a9c-4738-8769-5fa2827e9f67)

## Source: operator 2026-11-01 w8:pNP

Message 1 (with a screenshot of an X post by @Voxyz_ai, transcribed in `slots/map-brief.md` `## Intake`):

> anyhting useful we could use in this X post for akrogon? I'm just brainstorming on how to speed up, increase quality, etc.

Message 2:

> wait, what did you do? You didn't change anything, right? Also, use slot b consultant (already active codex) and create new slot c consultatnt (pi), and slot d consultant (agy with argon high effort) to discuss this and whether it's feasible to optimize the similar mechanisms inside of akrogon repo for faster and more efficient processes. Think about it as a systems thinker. Less is always more (less code, even removing) instead of cramming more code and increasing mental complexity. Think about if we can optimize what that screenshot talks about somehow.

Mid-turn: "Create new b" and "Put codex at the top above c and d".

Message 3:

> look at the previous fix logs and see if we already tried implementing these fixes and then reverted them and for what reason did we do that.

Message 4:

> elid, what's the lesson then? Explain it to me

Message 5:

> what would this improve, and would it speed up things, and by how much? What would guarantee those reasons why we reverted back don't happen again?

Message 6 (autopilot switch-on):

> ok, chart it out in detail with all conusltant agents that are active now. Use autopilot mode, and do testing to confirm it works. Don't go overboard with testing, do something reasonable.

## Agent findings

- Opening map: `slots/map-A.md`, `map-B.md`, `map-C.md`, `map-D.md`, merged in `slots/map-merged.md` (merged X-codes differ from the operator-facing codes above: merged X1 = X1, merged X2 + X2b = X2, merged X3 = X3).
- History (git log, chart files, read 2026-11-01):
  - X1: c00246dd (2026-10-14) dropped the scope match. 9aaed138 (2026-10-25) put `run.scope === scope` back into `greenRun` and `redRun` only, after test 5d0b505f "reproduce scope mismatch between verify and the merge gate" (member-receipts review B F3): merge verify exited 0 on a leaf receipt while `requireGreenReceipt` (src/verify.ts) still demanded a merge-scope receipt. suite-time `## Off route` dropped "O2 cross-scope receipt reuse" as about 1.9% of merge verify time, with no operator quote.
  - X2: never built. verify-waste `forks/receipts.md` Q2, operator 2026-10-24: keep every member running after a red, "Re-measure that case after member-receipts lands". Older framework lock: "a failing run shows every failure".
  - X2b: added fbac86c6 (2026-10-25) under verify-waste Q1 (A's autopilot pick 2026-10-24). Not reverted.
  - X3: 278d5499 (2026-10-14) removed B's check.repair verify. fb236ec0 (2026-10-15) restored it because "repair moves into merge need a leaf receipt". The gate is `src/phase.ts` (check.repair to merge calls `requireGreenReceipt(..., 'leaf')`).
- Measured 2026-11-01 from `issues/verify-runs.jsonl` (data ends 2026-10-29), head runs only (no `compares`):
  - Since 2026-10-26: 17 merge head runs, 13 on a tree with an earlier green leaf run with the same commands. Median merge run 70 s. Both red merge runs were on such a tree.
  - Runs where format or typecheck was red and the test still ran: 47 of 243 before 2026-10-26, 4 of 50 after.
  - Reused entries since 2026-10-26: 6 of 150.
