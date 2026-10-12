# Merged notes: proof-rule round 2

## Q6 should the rule exist
- Reviewer-only version: proof taken before the test or helper changed does not count; a test the leaf changes after it failed in an integrated run (merge gate or full verify) needs more than one run under the 2a conditions before it can merge again; no new step for new tests. Pick (B), pick (A, revised after reading B).
  - Reason: #86's two gaps were the stale-proof judgment and the one-run readmission of a test already shown fragile. A new fragile test that fails at its own merge already stays on its own leaf, which is the outcome #86 asks for; the damage to an unrelated leaf came only from the readmitted rewrite. (A,B)
  - Cost: a new fragile test still meets load first at its own merge and can bounce its own leaf once. (A)
- Full rule as answered (1a 2a 3a 5a, new risky tests also run under load before review). A's first pick, dropped: it adds a planner step to every job with a risky test to save a self-bounce, not to protect other leaves. (A)
- No change: rejected; the stale-proof judgment stays unaddressed. (A,B)
- Prior answers carry where they apply: 2a defines one run, 3a covers a missing smaller composition, 5a the failure ending. 1a is narrowed to "tests repaired after an integrated failure". (A)

## Q4 how many runs after a test failed under load
- B: two completed runs; the required rejected-command replay counts as the first when version, conditions and result qualify; about 8-10 min. Smallest repetition that shows whether the repaired version can still vary.
- A: ten runs; cost is paid only after a test has already failed under load. Under the hypothetical of a test failing 1 time in 10 (the #86 rewrite's rough rate), 2 runs catch it about 2 times in 10, 5 runs about 4, 10 runs about 6-7; at 4-5 min per run that is about 10, 20-25 and 45-50 min.
- Both: no count is a guarantee; failures kept, never select the last green runs; any repair restarts the count; the replay can count as one run. (A,B)
- Differ: B 2 (smallest effort, no sufficiency claim); A 10 (better-than-even catch for a #86-like failure, cost only after a proven failure).
