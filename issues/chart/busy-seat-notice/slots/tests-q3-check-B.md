# Q3 focused check B

- F1. A failed local probe does not by itself establish a real bug. The reviewer must show wrong behavior on a realistic reachable path and its consequence today. A handcrafted reproduction alone remains a Nit (`skills/check-issue/SKILL.md:51`). Keep that predicate before promoting a probe failure.

- F2. “Cannot be tried without a live run” must not automatically downgrade a demonstrated defect. Current review accepts a trace from a real source or representative real output, and never downgrades reachable security/data-loss defects merely for rarity (`check-issue/SKILL.md:51`). A proven defect can remain in this leaf: B hands required live repairs to A (`:75`), and operator-only blockers use the existing same-leaf stop (`:29`). No exploratory live chain is required to investigate speculative coverage.

- F3. Scope removal of the missing-test Fix to unproven, out-of-criteria coverage. Preserve blocking evidence gaps for approved criteria and established real Fixes (`check-issue/SKILL.md:53,59`). A passing example does not show that the criterion's test would catch its failure. Removing `:55` without preserving those distinctions would weaken the settled criterion-proof requirement (`forks/test-authorship.md:28`).

- F4. The proposed regression-test route contradicts Taken Q1. `check-issue/SKILL.md:79` has repair B write the test, but Taken `:28` forbids repair-seat authorship. Taken Q2's A-only exception covers correcting an existing wrong expectation, not adding a new regression (`:29`). Name an explicit same-leaf exception: A alone prepares the narrow real-bug reproduction in a test-only commit before production repair, B judges it at review, and the freeze permits that accepted addition. Otherwise the new Fix cannot follow both rules.

Smaller change: unproven extra coverage is a Nit retained in this review, with no test or new issue. Proven wrong behavior follows existing same-leaf repair using realistic-source evidence, with a cheap local probe where useful. Preserve criterion proof, live-repair routing and the explicit A-only regression exception. This avoids adding a universal local-execution gate.
