# Brief: peer-c-role

## What
chart-issues accepts an operator-named C pane beside B. C does everything B does in charting, blind to A and to B, and merged points list the slots that agree. Without C, charting behaves as today. The change is skill and guide text only: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `docs/guide/chart.md`.

## Why
For an important feature or fix, the operator wants one more independent view during charting only. Today every peer rule names B alone and `(both)` assumes two slots.

## Done-criteria
1. `skills/chart-issues/SKILL.md` first-reply rule names the B pane, and the C pane when given, or says single slot, and states that C is named only with B.
2. Every B charting rule in `SKILL.md` (opening map, per-fork exchange, rebuttal, direct operator requests, late check, handoff contract review) applies to each named peer, stated once rather than duplicated for C.
3. `skills/chart-issues/assets/questions.md` peer exchange section covers each named peer: distinct exact return paths per peer (for example `map-C.md`, `<fork>-C.md`, `<fork>-rebuttal-C.md`, `<fork>-final-check-C.md`), herdr idle wait and `herdr agent wait` per peer, each peer blind to A's draft and to the other peer's map, pass and rebuttal, and each rebuttal reading only A's merged file.
4. `grep -rn "(both)" skills/chart-issues docs/guide/chart.md` prints nothing, and the attribution rule reads as a list of agreeing slots, such as `(A)`, `(B,C)`, `(A,B,C)`.
5. `docs/guide/chart.md` "second seat" section and its diagram describe the optional C peer with the same role, blind to both A and B, named only with B, and the contract-review sentence covers each named peer.
6. `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists only the three files above.
7. `bun run format`, `bun run typecheck` and `bun test` pass.
