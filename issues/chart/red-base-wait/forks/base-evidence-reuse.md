# Base evidence reuse

## Question
Q1. When may a seat reuse a recorded without-change (base) result instead of running its own: same counterpart revision, same command and scope, and what proof of equivalent conditions (installed dependencies, checkout location, runtime revision)? What invalidates a record (a later green run, an environment repair outside git as in #77, a dependency install)?
Q2. What does a seat do when equivalence is not established: run its own base comparison (today's rule)?

### Carries
- waiting-leaf Taken: reused base evidence now decides acceptance, so stale red evidence can let a leaf through (B final check F3). check-issue SKILL.md:25,61 allow reuse; commitMove does not expire logs (src/phase.ts:142-153). #77: fix was in root node_modules, SHA unchanged.
- Operator partial answer Q2 2a (reuse a recorded result to skip the 7-15 min base run).

## Findings
- Candidate signal from comparison (A), contested (B rebuttal R1): logs newer than the seat's prompt. A file time is not run identity and would block cross-leaf reuse.

## Taken

Operator, 2026-10-10: "cut" (door proposal C2: drop reuse of old test results; each leaf always runs its own fresh without-change run).
## Taken
No reuse. Every comparison runs the without-change side fresh in the same pass, after the leaf run and retry, under the same conditions (comparison Taken). No recorded base result, red record entry or earlier log is accepted as counterpart evidence. This removes the #77 stale-evidence class. Cost: one base run (about 7-15 min) per leaf whose check is red, only while main is red. The red record is never acceptance evidence.
Foreclosed: cross-leaf reuse, freshness signals (timestamps, prompted_at), invalidation on environment repair.
Final check B (slots/red-record-final-check-B.md) F2, settled under the same cut: merge's existing `reuse` route (src/phase.ts:553-558,657-659) keeps carrying green-only tested pairs as today; a restacked candidate whose accepted comparison holds any known-red result reruns the changed side, the retry and a fresh without-change run before `--check`.

Note 2026-10-10, handoff review: operator "2a". The validator refuses a base-run log whose record line started before the seat's `prompted_at` for this pass. This enforces the cut in code and is not a reuse signal. Peer leaf review: B and C agreed. B F6 extended it to the merge turn (slot B's `prompted_at`), because the attempt id alone survives restacks and interrupted passes.
