# Outcome criteria

## Question
Q4. How does a bad test demanded by a done-criterion get fixed with no human step after handoff, without adding test rules to charting?
Q9. Lock brief.md mechanically against seat edits?

### Carries
- Operator: "I don't want anything to come back manually." and "There must be a more elegant, automated way ... without polluting the charting process with testing."
- Rejected: 4a send a bad criterion back to the chart owner; 4d bar at the door plus A's recorded corrections checked by B.

## Findings
- Exchanges: round 3 [slots/round3-merged.md](../slots/round3-merged.md); round 4 with C [slots/round4-merged.md](../slots/round4-merged.md), [slots/round4-B.md](../slots/round4-B.md), [slots/round4-C.md](../slots/round4-C.md), rebuttals [B](../slots/round4-rebuttal-B.md), [C](../slots/round4-rebuttal-C.md).
- Cause: chart-issues/assets/shapes.md:134 and :252 define a done-criterion as "a command in checks or a test this leaf adds", so briefs lock test recipes. leaf-temp-dir/brief.md:10-15: six of eight criteria say "A test shows"; criterion 6 became the TMPDIR prefix assertion. plan-issue:61-65, implement-issue:36,75 and check-issue:55 then lock the recipe. (A,B,C)
- Nothing in src stops a seat editing brief.md in the main checkout leaf folder; src/phase.ts:254-260 only keeps issues/ off the leaf branch. A HEAD-diff guard fails because sync and operator commits save edits (src/sync.ts:109-120). A dispatch-time hash in state.yaml is tamper-evident only. (C, B)
- Example rewrite: criterion 6 -> "test runs allocate only inside their own fixture folder, never the real default temp root" (B corrected C's broader "root unchanged").
- check-issue:55 keeps "outcomes a criterion names always block"; only the exemption for a named test or assertion goes (C).

## Taken
Operator 2026-10-03: "4h, continue asking me all the questions." and "8a | 9a | 2a | 3a |"
- Q4 -> 4h. Done-criteria state observable results only, never a test file, assertion or count (shapes.md:134, :252). The plan picks proofs (plan-issue:61); proofs are replaceable work, not contract. check-issue:55 blocks on outcomes a criterion names, not on named tests. A bad test is ordinary work fixed under test-authority Q1 and test-worth 7a. B judges against the original brief outcomes. Foreclosed: 4i restrict test editors only; door bar plus correction ledger; manual return.
- Q9 -> 9a. No mechanical brief lock now; no recorded case of a seat editing a brief, and B reads the brief at review. Foreclosed: 9b dispatch-time hash.
