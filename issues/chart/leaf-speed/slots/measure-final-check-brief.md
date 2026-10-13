# Final-shape check: measure-and-revisit (slots B and C)

Operator replies, verbatim, after round 2 (Q1 stopwatch, Q2 revisit gate):
1. "Why a stopwatch? I don't want to revisiti leaves-as-chunks if it has no merit."
2. "But you did record it we're losing about 60 minutes per leaf. Look at the uestions and answers above this answer of yours. I would still like to create stopwatches and I would like to start testing it for the future."

Proposed record (A):
- fix-order correction: leaves-as-chunks is dropped, not deferred. Reason: chunk overhead is about 4 min per extra unit, so removing all chunks caps the gain near 12 min per median leaf, while each extra leaf pays about 55 to 60 min fixed cost (estimate).
- measure-and-revisit Q1 taken 1a: separate append-only timing record plus read-only `akrogon timing` command, as in measure-and-revisit-merged.md O1, plus two rebuttal additions: an expected-event inventory so a failed append shows as missing coverage (B), and merge check events carry the attempt id (C). F starts at first plan prompt (C).
- Q2 taken as reshaped: no leaves-as-chunks gate. The timing command's purpose is to show each leaf's fixed cost (plan, review, repair, fix, merge, and waiting by kind) so the loop fixes are judged on measured numbers and the ~60 min is tracked down. Testing starts on new framework leaves as soon as the timing record lands.

Task: one focused check. Return only disagreements with this record (wrong reading of the operator, missing material fact, broken mechanism), with evidence, under 200 words. "No disagreement" is a valid return. Read-only.

Write to exactly /home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/slots/measure-final-check-X.md with your slot letter for X.
