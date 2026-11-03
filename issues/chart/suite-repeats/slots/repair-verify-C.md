# repair-verify: seat C blind notes

The fork asks Q1 and Q2 only; there is no Q3. Tiers: T1 = measured from live data by me 2026-11-01, T2 = code, skill or git history read 2026-11-01, T3 = inference.

## Q1. B runs `akrogon verify` at end of check.repair only when moving to `merge`? And the proof reruns?

### Pick

Yes for verify; no change for proof reruns. In `skills/check-issue/SKILL.md`, `## check.repair`, split the "After repairs" sentence: B always reruns the done-criterion proofs whose inputs changed, and runs `akrogon verify` only when the finishing move is `merge`. Destination is known at that point: the `Handed to A` list is written during repairs, and the finishing rule in the same section already branches on it, including the operator-only `failed` stop, which also needs no verify. Cost when handing to A: B's repair commits are no longer full-suite-checked before A starts, so a cross-cutting break from a B repair surfaces at A's check.fix verify instead, one seat later. The proof reruns stay unconditional (destination-independent) because that section's acceptance rule is that B's repair counts only when a planned proof B did not write passes on the repaired head; that is evidence about the repair, not a gate receipt.

### Rejected

- Keep verify on both destinations. Measured dead: in 22 repair-to-check.fix visits B changed the tree, ran 27 verify passes (64.9 minutes of test execution), and A then changed the tree again, killing every receipt. Since 2026-10-26 alone: 5 such visits, 9 passes, 12.4 minutes. A also always verifies again in check.fix (`skills/implement-issue/SKILL.md`, `## check.fix`) because the move into check.review is receipt-gated (`src/phase.ts:429`), so the double run buys no end state.
- Drop the repair verify for the merge move too (rerun of 278d5499). fb236ec0 reversed exactly that by adding the gate: check.repair to merge calls `requireGreenReceipt(..., 'leaf')` (`src/phase.ts:432`), so B would be refused at the move. Removing the gate instead keeps the run count equal (the merge turn verifies the top), delays red discovery to the serialized merge turn, and spends a code change to undo a recorded decision. With merge-reuse taken, B's merge-bound verify is also the receipt merge reuses, so it is the one worth keeping.
- Skip the proof reruns when handing to A too. Then B's repairs are unevidenced, A cannot separate B's breakage from the handed Fixes, and B's commits per Fix lose their red/green pair. Proofs are also the cheap part: in repair-to-check.fix visits they were 20.2 minutes across 421 targeted checks, against 74.6 minutes of canonical check time.
- Condition verify on what B touched (skip when B's repairs were docs-only, run when code changed) instead of destination. More branches, and the wrong key: a docs-only repair moving to merge still needs the receipt, and a code repair handed to A still gets rewritten. Destination is the single condition the gate itself uses.

### Evidence

- T1, `issues/log.jsonl` + `issues/verify-runs.jsonl` + `issues/timings.jsonl` joined per visit (into-repair move to out-of-repair move) and git tree comparison, read 2026-11-01. Of 44 check.repair to check.fix moves since 2026-10-12: B changed tree and A changed it again in 22 (27 verify passes, 64.9 minutes of test time, all receipts dead on A's first tree change); B changed and A did not in 2 (2 passes, 7.1 minutes; under merge-reuse those receipts would make A's later verify a reuse hit, so that slice saves nothing system-wide, it only moves the run from B to A); B changed nothing in 20, and those visits already show 0 verify passes in the data, whatever the text says.
- T1, same join: the 29 verify rows written during repair-to-check.fix visits split 17 green, 12 red. The reds block nothing (no gate on that move), so today the handoff verify functions partly as diagnostics for B's own repair loop, not as a gate. The targeted proof reruns plus per-Fix reproduction commands in the same section already serve that loop for the Fixes B owns.
- T1, repair-to-merge visits: 22 moves, 24 verify passes in window, 2 with none (receipt already covered HEAD, which the gate accepts). The merge-bound verify is real work, not ceremony.
- T2, `git show 278d5499` (2026-10-14) deleted the verify call for both destinations on "merge verifies the stack top"; `git show fb236ec0` (2026-10-15) added the repair-to-merge leaf-receipt gate and restored the call unconditionally. Nobody has tried the destination-scoped middle, so this is not re-litigating a measured failure.
- T2, routing agrees there is nothing between: check.repair exits only to `merge`, `check.fix` or `failed` (`src/routing.ts:38`), and system-speed D3 closed the repair-to-implement bounce, so "verify only for merge" partitions all exits cleanly.

### Pitfalls

- Destination flips after the decision: B finds no `Handed to A` items, runs verify for merge, and the red it returns needs a change B is barred from making (test expectation, proof-command correction), so the leaf goes to check.fix after all and the verify was "wasted". Removed by nothing, and it is not fully wasted: its logs are the handoff evidence in `review-B.md`. The reverse flip cannot happen silently, because a merge move B skipped verify for is refused by the gate and B just runs it then.
- B hands A a branch whose full suite is red from B's own repair, and A's first check.fix verify spends its red budget attributing it. Bounded by the per-Fix commit rule in the same section (each Fix its own commits with red/green run-check output), which localizes the suspect commits. Removed by nothing else; this is the real price, paid only in the 22 measured visits where B repaired and handed over.
- Seats may read "only when merge" as "no full evidence needed" and also start skipping the proof reruns. Removed by text placement: keep proof reruns in the unconditional first half of the sentence and make verify its own conditional clause, not a trailing "and" they can drop together.
- Lifetime: if a future chart adds a receipt gate to the check.repair to check.fix move, this text silently produces refusals. Removed by nothing, but the failure shape is a loud phase refusal on the first affected leaf, not a bad merge.

### Extra question

In 20 of 44 measured visits B changed no tree and already ran zero verify passes, against the current unconditional text. Should the merge-bound step also state "unless a green receipt already covers HEAD", codifying what seats already do, or keep the unconditional run now that merge-reuse makes it a fast reuse print?

## Q2. Proof for a process-text change, without going overboard

### Pick

Two proofs, one mechanical and one live. Mechanical: add one gate case next to the existing `a repair move into merge needs a green leaf receipt for HEAD` (`tests/receipt-gates.test.ts:43`): a check.repair to check.fix move succeeds with no receipt seeded. That pins the fact this whole fork relies on, that the handoff move is ungated, in the file that already pins the merge-bound gate. Live: after landing, read `akrogon timing <slug>` (or the timings join I used) for the next several check.repair visits; passes ending in check.fix should show no `setup` or `test` check in the visit, passes ending in merge should still show a verify and move successfully. Run `tests/receipt-gates.test.ts` plus `tests/phase.test.ts` focused, and the leaf's normal `akrogon verify`. The seat instructions themselves are the change; their worst failure mode is self-correcting, since a seat that skips verify on a merge-bound pass is refused by `src/phase.ts:432` and runs it then.

### Rejected

- A test asserting the skill text contains the conditional wording. The repo's own test rules reject tests of prose wording except text that runs literally (`skills/check-issue/SKILL.md`, `## check.review`, test-comparison rule), and a string match would pass while seats ignore the sentence. It proves typography, not behavior.
- A live trial leaf with no gate test. One complying seat on one leaf is the weakest evidence available and leaves the ungated-handoff fact unpinned for the next person who adds a gate beside `src/phase.ts:432`.
- Timing benchmarks of repair visits before and after. Visit medians are minutes-scale and host-load noisy; the savings are already counted exactly in dead verify passes and test seconds (Q1 Evidence). Counting `setup` checks per visit is the precise signal.

### Evidence

- T2, `tests/receipt-gates.test.ts:43` already pins the merge-bound half of the asymmetry; the handoff half is currently pinned nowhere (grep of that file for check.fix found no case).
- T1, the live signal is already distinguishable in today's data: visits where B ran verify show a `setup` check and a test run inside the visit window (29 verify rows across repair-to-check.fix visits), and the 20 no-commit visits show none. Post-change, the check.fix column should look like today's no-commit column.
- T2, the failure mode is bounded by code, not trust: the only destination that needs the receipt enforces it at `src/phase.ts:432`, so a seat error degrades to one refused move, the same protection fb236ec0 installed.

### Pitfalls

- The new gate test can be read as endorsing "check.fix stays ungated forever" rather than recording today's asymmetry the text relies on. Removed by the test title naming the repair handoff specifically, so a future gate change must consciously update it beside the phase.ts change.
- Live counting over only a few visits could pass by luck if the first repair visits after landing happen to be no-commit ones (already zero verify today). Removed by counting only visits where B's repair changed the tree (the 22-visit class above), which is where behavior actually changes.
- Skill copies drift: the same "runs akrogon verify" promise for repair may be restated in docs or brochures of the lifecycle. Removed by one grep for the sentence at plan time, not by more tests.

### Extra question

Should the post-landing count be a named, dated line in this chart's destination (for example "10 repair-changed handoffs with zero verify passes"), so the proof obligation closes instead of living as an informal promise?

Full-suite runs at repair survive only where a gate or the merge actually reads the receipt: the merge-bound verify stays, the proof reruns stay, and the 27 dead verify passes measured before handoffs to A go.
