# Test authorship, slot A notes (before reading B and C)

## Research (read 2026-10-10)
- Kun Chen on X, status 2108030810691629403 (search snippet; page paywalled): "AI-written unit tests and integration tests are empirically proven to be unhelpful ... on the deepswe eval set, banning sonnet 5.5 high from writing any tests actually resulted in slightly higher success" with less time and tokens.
- Gomez, arXiv 2608.29460, 2026-08-29: giving coding agents an escalation/defect-disclosure channel cut reward hacking from 23.6% to 5.3% across eight frontier models; escalation and hacking near-mutually exclusive (98.7%).
- SpecBench, arXiv 2605.21384 (rev 2026-09-09): agents saturate visible tests; the visible vs held-out gap grows 28 points per tenfold code size.
- Konstantinou, Tambon, Papadakis, arXiv 2607.05139 (2026-07): tests written from the task description caught 25% of injected faults; tests written after seeing the code caught 14%.
- Banik et al., arXiv 2606.18168 (2026-06): 80.2% of 86,156 agent test patches have weak or no oracle.
- Böckeler, martinfowler.com "TDD in the agent loop" (2026): no discernible gain from agent-internal TDD; value comes from tests fixed as acceptance criteria before implementation and checked as regression monitors.
- Yukoval-Dakia/the-learning-project PR #1629, 2026-10-10: agents stop writing tests by default; tests only for five invariants (irreversible data, deterministic scoring, concurrency, security boundary, crisis referral); audit found test code ~= product code and every P0 passed CI.
- dmitriiev.dev via dev.to (2026-07, older): "every stage is checked by something that did not produce its output"; frozen specs.
- Kent C. Dodds, "Write tests. Not too many. Mostly integration." (older, established).

## Loops
- Cut R-author: the seat that writes code also writes and edits the tests that grade it -> tests mirror the code -> false green -> review finds the gap later -> more work.
- Cut R-rig: live proof machinery built inside the leaf (system-merged R1).
- Cut R-volume: more tests -> slower checks -> more reruns -> more time and more test edits.
- Calibrate B-accept: target = a short proof list fixed before code; sensor = only those proofs; actuator = merge.
- Add B-escalate: a frozen proof that is wrong or cannot run -> stop with reason (existing failed --reason), never edit the proof to pass (Gomez).
- Calibrate B-size: leaf proof cost known at charting; machinery that does not exist is a prerequisite or the criterion is cut (SpecBench: gaming grows with size).

## Design
- D1 Proof written once, before code, from the brief only: at plan time seat A (main agent) writes the few proof tests in one commit, each naming the hard part or past regression it guards; new-behavior tests must fail first. Workers and repair seats never write or edit tests.
- D2 Frozen: after that commit the executing seats may not change proof files; a wrong proof ends the pass with a reason. Function check at phase move: proof files unchanged since the proof commit.
- D3 Count rule: a test exists only for a named invariant or past regression; no helper, shape, mock-called or coverage tests.
- D4 No self-built rigs: live proof uses only machinery present at charting; otherwise prerequisite leaf (where independently provable) or the criterion is cut at charting.
