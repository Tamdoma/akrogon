# Queue order

## Question
Q1. Do leaves that unblock others go first only at dispatch, or also in the merge queue?

### Carries
- Holder is recomputed from the queue on every phase call (src/phase.ts:770-783).

## Findings
- Dispatch sort key safe (A,B,C). Merge queue: keep the active holder until release, then priority picks next (B rebuttal F4). Freeze at entry is not enough.

## Taken
Operator 2026-10-10, verbatim: "1a |"

- Q1 1a: dispatch and next-holder selection both order by the count of unmerged leaves waiting on the candidate through `blocked-by`, directly or transitively, descending; ties by existing order (merge_stamp then slug for the queue). The active holder (a leaf with a batch record) is never displaced; priority picks only the next holder. Reason: replaces the operator's 20 s merge_stamp script (#65). Foreclosed: 1b dispatch only, 1c no change, aging rule (revisit with attempt records).
