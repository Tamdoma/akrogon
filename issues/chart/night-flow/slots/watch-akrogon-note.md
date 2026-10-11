# Forwarded at the operator's request by session watch-akrogon, 2026-10-11 (verbatim)

Systemic analysis from watch-akrogon: why leaf-env-file failed twice at the fix-round cap, and what in akrogon could be simplified. The operator asked me to send this to you. Evidence is from issues/log.jsonl, leaf-env-file review-B.md, plan.md D3 and git history in issues/worktrees/leaf-env-file. Filed seeds: Tamdoma/akrogon#80 (self-update skips on a diverged checkout), #82 (cap ends the leaf in failed), #83 (repairs patch code against a false plan rule), #84 (failed leaf unnoticed overnight), #85 (recovery at the cap grants no repair, unlike docs/guide/phases.md:76).

WHAT HAPPENED
Brief criterion 1 needs every declared value copied exactly. Plan rule D3 met it with hand-written rules about which characters each dotenv quote style allows. Each of 4 repair rounds: B probed and found one value the rules got wrong, A patched that case and often added a new refusal, and next round B proved the new rule wrong too (F1, F2, F3, F4 with S6-S8). D3 grew to about 10 exceptions. It failed at fix_rounds 3, sat about 6.4h overnight, failed again at 4. I replaced D3 with a parser-checked rule: try fixed candidate encodings, keep the first one that parseEnv reads back exactly in an adversarial context, then check the whole file. Measured over 41,371 values: zero mismatches, 11.4% refused. I raised fix_rounds to 6 and resumed it.

STOCKS
- S1 Plan error (wrong rules in plan.md). Inflow: synthesis and repairs that add rules. Outflow: none in the lifecycle. Only a human or a lucky A edit drains it.
- S2 Open Fix findings. Outflow: one per round, because B finds one counterexample at a time.
- S3 Repair budget (fix_rounds).
- S4 Failed leaves waiting on a human, plus blocked dependents.
- S5 Checkout divergence (local handoff commits against origin/main).

LOOPS
- R1, reinforcing, bad (patch-adds-rules): a Fix that rests on a wrong plan rule gets fixed in code by adding a rule or refusal. That adds surface for the next counterexample, so each repair grows S1, which feeds S2. The loop grows the stock it should drain.
- B1, balancing on the wrong variable (cap): fix_rounds limits the count of handoffs, not convergence. It stops a converging leaf the same as a looping one, and its only output is failed, which moves the problem into S4. So it balances work spent, not correctness.
- Missing B2 (plan correction): nothing routes "this finding contradicts a plan rule" back to re-planning. check.repair says plan changes belong to A, but check.fix is a code pass. S1 has no outflow.
- Oracle gap: for a criterion that covers every input ("exactly the values"), the reviewer's case hunt is the only test. That fixes S2's drain rate at 1 defect per round no matter how big the defect space is. A has no executable check to run before handing back.
- B3 notification measures the wrong thing: delivery=shown counts as handled whether or not anyone saw it. The watch is session-only, and its stop rule can delete the job right before a new chart handoff arrives. S4 drains only by luck.
- R2 divergence (#80): each chart handoff commit adds to S5, self-update only fast-forwards, so the checkout stops deploying until someone runs akrogon sync by hand.

SIMPLIFICATIONS THAT REMOVE THE PROBLEM CLASS (my view, not verified against the akrogon code)
1. Replace the cap's meaning: a second Fix in the same area, or any Fix whose evidence contradicts a plan decision, moves the leaf to re-plan that decision (plan.synthesis on the named D) instead of check.fix. This gives S1 an outflow, cuts R1 at round 2, and makes the cap a backstop instead of the main stop. It may let the cap logic shrink.
2. Universal criteria need an oracle: plan-issue requires a self-checking test for any criterion that covers every input (round-trip, property, or the real parser as oracle), and A runs it before handoff. check-issue then judges the oracle and the plan, not just new cases. This raises S2's drain from 1 per round to bulk.
3. A failed leaf that needs the operator stays loud until acknowledged (or status and next list it first), instead of one shown notice.
4. Chart handoff pushes its commit, or self-update rebases issue-record-only commits the way sync does, so S5 cannot build up.

One related fact: Bun's own .env loader expands $NAME in every quote style, so any parseEnv-based fidelity rule differs from what Bun processes see for values containing $. All 2,293 Bun mismatches in my measurement contained $, zero without. I recorded it in plan.md as an out-of-scope limitation. Check-env and readiness both use parseEnv, so this may deserve its own seed.

The operator may want you to chart some of this. Pick whatever you think is the smallest set of changes.
