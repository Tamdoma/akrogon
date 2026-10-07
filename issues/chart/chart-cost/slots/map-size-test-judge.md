# Judge: decision coverage, originals vs re-writes (#57)

Rule: yes = the map raises the whole decision for the operator. Partial = it raises part of it, or raises it only inside an option's cost or a pitfall. No = absent, or only a keyword.

## Task 1. Question coverage

| Q | ORIG-B | TEST-B | ORIG-C | TEST-C |
|---|---|---|---|---|
| MO-Q1 ordering | yes 72 "admit one active merge per target before final fetch/rebase and verification" | yes 48 "What exact integrated candidate is admitted and checked" (plus F1 32, F4 76) | yes 71 "Who orders competing merges?" | yes 149 "which leaf goes first, whether order is fixed at merge entry" |
| MO-Q2 wait, tab, slot | yes 105 "retain existing allocated leaf tabs and capacity accounting, but only the admitted B" | partial 82 "A waiting leaf with a live tab must not reserve progress forever" (no max_active) | yes 93 "Where does a waiting leaf wait?" and 184 "Should waiting leaves count toward max_active?" | yes 156 "whether waiting is a visible state" and 224 "Waiting leaves hold max_active slots" |
| MO-Q3 red batch | partial 74 "attribution/repair when a batch fails" (option cost) | partial 56 "Does one leaf need independent attribution and recovery when its neighbor fails?" | partial 84 "a batch needs bisection (P1) or a rule for which leaf is ejected" (option cost) | partial 228 "one bad leaf fails the run for all. Finding the culprit costs more runs" |
| MO-Q4 carried leaf's Nits | no | no | partial 101 "what happens to B's work that needs no turn? ... the LESSONS line" | no |
| IO-Q1 issues-only motion | yes 91 "Do issues-only updates wait, or can checked results survive them?" | yes 62 "including what a target change limited to issues records actually changes" (wait side at 42 Q1) | yes 103 "What does a commit that touches only issues/ do to an in-flight merge?" | yes 122 "If it is not allowed, record commits must stop moving the gated branch" and 264 OQ4 |
| TR-Q1 next-holder prompt | yes 83 "releases/redispatches on confirmed landing, check.fix, failed, cancellation" | yes 84 "What event makes the next waiting merge runnable?" | yes 77 "Needs the wake path from F4" (exits listed at 75) | yes 156 "and how the next leaf is woken" |
| TR-Q2 stuck holder, carried members | partial 87 "What exact observed event proves an interrupted attempt can no longer publish?" (no batch part) | partial 84 "What proves a former owner has stopped before another takes over?" (P6 54 touches membership) | partial 181 "Who clears a stuck turn holder? failed releases it. A seat that is busy forever does not" (no batch part) | partial 227 "The leaf whose turn it is can die ... Everyone behind then waits forever" (no batch part) |
| TR-Q3 re-entry place | no (A3 140 says the leaf "can later reenter admission", no place choice) | partial 84 "What order must survive retries, failure, parking or operator recovery?" | yes 124 "Re-entry after check.fix: back of the queue, or keep the old place" | partial 149 "whether order is fixed at merge entry" (re-entry not named) |
| DS-Q1 deps install | yes 111 "Who prepares dependencies, and when do they match the candidate?" | yes 114 "Define the preparation contract, its owner and earliest required point" and 128 refresh | yes 138 "How does a fresh worktree get its dependencies?" with 141 lockfile staleness | yes 184 "whether the repo declares a setup command" and 198 "Another leaf can land a lockfile change" |

Score (yes=1, partial=0.5): ORIG-B 6.5, TEST-B 6.0, ORIG-C 7.5, TEST-C 6.5.

## Task 2. Dependencies and lifetime pitfalls lost

### Seat B (ORIG-B held, TEST-B lacks)

- B1. 87 Q4 and 140 A3: a red owner must release admission at once so unrelated waiters proceed during repair. TEST-B only asks the generic wake event (84 Q10).
- B2. 105, 109 Q9, 144 A8: waiting allocated leaves fill max_active and block new implementation, and waiting entries must not miscount capacity. TEST-B P15 (82) hints at allocation but never names this.
- B3. 35 E13 and 95: deferring issues-only commits needs a publication route outside the leaf issues-file guard. Not in TEST-B.
- B4. 93: F4 (issues-only reuse) disappears if F1 puts all writers in the queue. TEST-B orders F1 before F3 (30) but does not state this conditional.
- B5. 77: admission must cover integration, checks and confirmed push, and must never force-push to look successful. TEST-B covers the first part through E1 (21), not the force-push ban.
- B6. 83: recovery must tell a working owner from a lost prompt reply. TEST-B covers only the landed-but-unrecorded case (P14, 82).
- B7. 89 and 144: admission release must not wait on Discord broadcast, and broadcast failure must not strand it. TEST-B P7 (54) covers only truthful completion.

TEST-B holds, ORIG-B lacks:
- Shared remote-tracking refs change under a running check through another worktree's fetch (P10, 68).
- merge to check.fix moves are outside the handoff cap, so environment loops are unbounded (P19, 92-94).
- `akrogon sync` is a named main writer (38), and urgent manual push or reorder is in scope (42 Q3, 84).
- Which reviewed-patch changes need re-review versus integration-only evidence (56 Q6).
- Shared fixture or resource collisions read as code defects (P25, 108).

### Seat C (ORIG-C held, TEST-C lacks)

- C1. 196 R6: a leaf sent to check.fix must release the turn at once. Not in TEST-C.
- C2. 195 R5: a holder that pushed and then died before `merged` keeps the turn while main moved, so release must recover from remote ancestry. TEST-C R7 (227) covers death, not the post-push case.
- C3. 124-126 K4-O3: re-entry place, where keeping the place lets one slow repair hold the line. TEST-C lacks it (see TR-Q3).
- C4. 101: B's turn-free work (LESSONS line, trailer --check) while waiting, and the second-prompt cost of splitting the pass. Not in TEST-C.
- C5. 84 and 197 R7: a batch changes the proof unit. review-B evidence names a commit holding other leaves, `requireTestChangeCitations` reads leaves below in a stack, and the completion broadcast assumes one merge seat. TEST-C R8 (228) covers only shared failure.
- C6. 183 Q6: turn scope per registered repo versus per remote and branch. Not in TEST-C.
- C7. 168 K8: if long suites die at a tool timeout, a serial turn passes the failure down the line, so the SIGTERM cause decides whether serial runs finish. TEST-C has kills (F24, G2, R19) but not this dependency.
- C8. 160 and 162 K7: an "environment-only red" label can hide real reds, and skipping re-review on an unchanged head lets a check.fix that gave up return. Not in TEST-C.
- C9. 182 Q5: hand-built leaves cannot be forced into the turn, so the fast-forward refusal must stay as backstop. TEST-C R22 covers sync and gacp only.
- C10. 187 Q10: the docs that must change together. Not in TEST-C.
- C11. 91: a batch can later be built on top of a turn. This is a dependency between ordering choices, and TEST-C does not state it.

TEST-C holds, ORIG-C lacks:
- K0 (105-110, L9): chart ownership. The framework-test-scope leaf-gate chart already lists a batch merge queue, so two charts could lock opposite answers. Also new lock links L3, L4, L6-L8.
- Deps-first order (103, F22, M1): missing deps caused five of the seven first reds and created the herd.
- R2 (222) and R20 (240): an idle waiter is re-prompted after 2 minutes, and `requireClean` refuses on files the suite generates.
- R11 (231) and R12 (232): `gacp` uses `git add .`, so a commit named "add issues" may not hold only records. An untested SHA on main weakens bisect, revert and audit.
- K12 (189-194) and R21 (241): worker and base-run worktrees are outside a command hook, and akrogon's own short-check repo must not pay for the mechanism.

## Task 3. Option-design share of bytes

Method: count the bytes of option bullets and their cost or break sub-bullets, plus recommendation or position text, then divide by file size (`wc -c`). Source descriptions that compare queue products count only partly.

- ORIG-B: about 30%. Option bullets O1a-O7b are 7.9 KB and recommendation or synthesis lines (54, 152-154) are 1.7 KB, out of 31.3 KB.
- TEST-B: about 1%. It has no option bullets. The only option text is passing exclusions (58 "No choice of batching, serial work or speculative work", 72).
- ORIG-C: about 40%. K*-O bullets with Removes, Could break and Invites sub-bullets plus "Slot C view" lines are 10.2 KB, and section 6 adds 0.7 KB, out of 28.5 KB.
- TEST-C: about 1-2%. Line 16 lists three ways to avoid a re-run (0.4 KB), and K5 (142) names the candidate parts. Everything else names decisions, evidence, pitfalls or questions, out of 33.4 KB.
