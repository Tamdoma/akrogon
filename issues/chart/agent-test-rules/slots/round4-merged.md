# Round 4 merged (Q4)

## Cause (A,B,C)
- shapes.md:134 and :252 define a done-criterion as "a command in checks or a test this leaf adds". The door writes test recipes into the contract.
- leaf-temp-dir/brief.md:10-15: six of eight criteria say "A test shows". Criterion 6 was a test about the suite; the worker made it a prefix assertion (175b862) that is false inside any seat. Criteria lock proofs (plan:61-65, implement:36,75, check:55), so a bad test had no repair path.

## Recommendation O1 (A,B,C): criteria state outcomes, proofs belong to the lifecycle
- shapes.md:134/:252: a done-criterion is an observable outcome inside the leaf's ownership, never a test file, assertion or count. Door text shrinks.
- plan.synthesis picks proofs (plan:61 already does). Proofs are replaceable work, not contract.
- check:55 "scenarios a criterion names always block" -> "outcomes a criterion names always block". The named-scenario exemption from the realistic-source rule goes (B).
- B judges the original brief outcomes directly, not only A's plan (B). check:51 + 7a already catch weak proofs (C,A).
- A bad proof is then an ordinary test defect: fixed in implement or check.repair under the Q1 cited-source rule. No correction ledger, no return, no new phase.
- Example: criterion 6 becomes "running bun test leaves the real /var/tmp/akrogon-<uid> unchanged" (C).

## Differences
- D-a Protecting the outcome text. A said src/phase.ts:254-259 blocks seats from editing brief.md. C: that check only covers the leaf branch; brief.md sits in the main checkout's leaf folder where seats write plan.md and reviews, so nothing stops an edit (C F6, correct). C proposes `git diff $AKROGON_BASE...HEAD -- brief.md` at phase move, but the branch can never carry issues/ files, so that check is a no-op. A proposes instead: `akrogon phase` refuses when brief.md differs from its committed version in the registered root (`git diff --quiet HEAD -- <leaf>/brief.md`).
- D-b Base-red stop. B: change implement:38 and check:59 so a red-on-base test goes to review/repair instead of failed. C: already taken in failed-leaf-routing (handed off 09-28, failed leaf naming merged defect gets a fix leaf); do not rebuild. A sides with C.
- D-c standing-design.md:7-10. C: delete the test-selection lines from the door since implement-issue:57 holds them. B, A: not proposed. Check realistic-fix-bar lock first (C P6).
- D-d Alternatives: B-owned acceptance tests (B 1b, C O2, A O2); mechanical test-edit restriction (B 1c, A O3 -> K1 Q2); automatic amend route (C O3, rejected-shaped).
