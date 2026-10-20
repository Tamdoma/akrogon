# best-merge merged notes (no locks)

Operator correction after A's blind notes (2026-10-19, verbatim): "This was a part of the speed up because if they were running two full checks of test suites during their run and inside of the merge that just doubles the amount of time that takes to merge. Consider all the updates that we did in the past week. I am aiming for speed as well as accuracy.As well as the cost reductions." A withdrew its step 2 (full suite before the queue). Confirmed: leaf passes run `checks` (cheap), merge runs the full suite once (src/verify.ts verifyCommands; closed merge-covers-key brief.md:4,7; night-flow ISSUE.md:10).

## Answer to "is one at a time the only option" (A,B,C)

No. Speculative prefixes (Zuul, GitHub merge groups, Uber SubmitQueue) land several leaves at the same per-leaf precision: while leaf 1 verifies on main+1, leaf 2 verifies on main+1+2; if 1 lands, 2's receipt is already for its exact landing tree; if 1 is red, 2's run is discarded. Batches with one check on the top are not the same precision: a green top does not prove each prefix (B,C). The largest cheap win is inside the solo turn: the suite's shape (B,C).

## Measured (framework repo, read 2026-10-19)

- Green solo merge about 12-13 min; verify 12.1 median, the rest about 0.9-1.2 min (B,C); A measured 11.9 total, 8.8 verify.
- Full suite = fast stage about 77 s (cheap 26 s + hooks:selftest 46-55 s) then core about 666 s. Core wall is one sequential chain, `rest-b` 655-667 s; inside it `test:meta-content-coverage` takes 420-426 s (B,C). rest-a about 190 s, other suites under 115 s (B,C).
- meta-content-coverage's storefront-evidence test launches the same real capture CLI eight times, seven with identical input; sharing one immutable capture (plus the separate no-card run) saves an estimated 270 s with every assertion kept, a static estimate awaiting a benchmark (B, `.claude/skills/test-verify/test/storefront-evidence.test.ts`).
- Red merge verify runs are bimodal: 76 of 134 fail in the fast stage within 2 min, 50 in core (C). In 50 instrumented solo reds: 24 fast only, 25 core only, 1 both (B).
- Red causes, from review-B.md: about 39-41 of 64 solo reds are the leaf's own break that merge's selftest or core exposed first; new-main interactions are a minority; a 10-13/14 cluster was auth and host load; a few flakes; no trailer refusal (C). B's sample of 11 agrees in kind (S1-S11).
- 5 of the last 30 green solo merges had a red full run then green: observed retry cost, not five proven flakes (B rebuttal).
- Solo red rate 27% over the full file, 31% since 2026-10-18 (B).
- Today's 11-leaf drain: about 143-152 min if all green, 190-225 with historical reds (B,C).

## Options

- O1 reshape the full suite, same assertions (B,C): share the repeated capture (B), give meta-content-coverage its own parallel lane and rebalance rest-b (B,C). Full run about 12.4 min to about 5.4 min (B, static estimate) or core 440-480 s (C, regrouping only). Framework repo work, not akrogon (B,C). Pitfall: rest-b may be serial for a reason (ports, browsers); probe once on a green tree (C).
- O2 command-only green merge (A,B,C): the command verifies, checks the receipt and pushes; the seat runs only on red, conflict or a refused push it cannot restack. Saves about 1-3 min and one agent session per leaf, and removes the agent as a failure class (C). Needs: an owner for the completion broadcast (seat-run by rule today) (B,C); red handling becomes policy: green or mechanical known-red lands, anything else goes to check.fix with the log (C); merge-time memberless mechanical repair dropped (C).
- O3 move hooks:selftest (about 50 s) into the leaf's `checks` (B,C). Catches most fast-stage merge reds (57% of red runs) in the leaf's own loop instead of on the line. Merge still runs the full suite, so selftest runs twice per leaf: about 50 s extra, not a second full suite (A note). Framework config only. Estimated merge red rate about 25% to 13-17% (C, model). B withdraws it after the operator correction until total cost is measured: 50 s on every leaf pass can outweigh earlier rejection, and a lower merge red rate alone does not prove lower end-to-end time or cost (B rebuttal). C keeps it (C rebuttal).
- O4 speculative prefix, depth 2 (A,B,C). B: third, after suite reshaping and green automation, on a second runner or demonstrated spare local capacity, gated on measured latency, useful receipts and total compute per landed leaf (B rebuttal); publisher stays serial. C: build later, only when the solo green rate is at least about 85% over 50 attempts and a probe shows two concurrent full suites on this host finish well under 2x solo without new flakes. A: after O1-O3. Needs a separate speculative record, not `state.batch`, since the holder rule sorts any batch holder first (C), an explicit predecessor base for Git-aware checks (B), and stronger receipt identity (B: receipts omit `AKROGON_BASE`).
- O5 delete member stacking (stack-fate, all slots).
- Rejected (A,B,C): batching with one check on the top (weaker proof, and loses at a 25% red rate; breakeven about 83% green, C); test-impact selection or disjointness reuse (no declared dependency graph; observed reds cross unrelated files) (A,B,C); fast-only gate with full suite after landing (lands reds; 37% of reds are core-only) (B,C); flaky quarantine as the design (small; hygiene) (A,B,C); external runners first (C: the wall is chain shape, host has 32 threads and 123 GB).

## Estimates, 11 green leaves (models, not measurements)

- Today: about 143 min (B,C).
- O1+O2+O3 on one worker: about 100 min (C, regrouping only) to 60-70 min (B, with capture sharing).
- Plus O4 depth 2: 75-90 min (C) to 35-45 min (B, with an independent second runner).

## Where slots differ

- O4 gate: measured latency, useful receipts and compute per landed leaf (B) vs green rate at least 85% and a host probe (C). All three put it after O1-O2.
- Known-red acceptance: B wants the strict publication gate to require green evidence and flags `knownRedReceipt` as a weaker contract (src/verify.ts:257); C keeps mechanical known-red as a landing path. B rejects it under the strict guarantee (B rebuttal).
- Ownership: O1 and O3 are framework changes; who owns them is open (C Q1).

## Open questions

- Record the failing stage and command on each merge attempt (C Q2; A and C asked in stack-fate too).
- A risk-tiered suite (docs-only leaves pay less) is a precision decision only the operator can make (C Q3).
- How much of the host may merge work claim against 24 active leaf seats (C Q4, B Q1).
