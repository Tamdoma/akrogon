# Slot D review, round 3

Verdict `ready`

Base `9c6ae0db739efcde19edff0d1b173da0ab7b234d`  
Head `c5032fa2a7de8e985ddce0bb3e7630c0f51f1bdd`

- **F1 fixed.** The writer CLI generated the same linked pair as round two, with `alpha` stored on the head and `beta` in the rerun and base logs. The writer and schema release `f1f42e4d` refused it. The previous rollback release `301e7762` accepted it. The final reference doc describes stored-name precedence and the missing-log refusal.
- **F8 fixed.** Two real verifies on the same tree produced a first red on `alpha` and `beta`, followed by a green saved by rerunning `alpha`. `akrogon flaky` counted both names once. The updated test failed on round-two source because `beta` was missing.

The focused run passed all 94 tests across `tests/flaky.test.ts`, `tests/receipt-gates.test.ts` and `tests/verify.test.ts`. All 6 receipt-gate tests also passed on the schema release in isolation. `git diff --check` passed.

F5 remains the accepted chart limit for two homes selected through `HOME` alone that share a repo key and leaf slug.
