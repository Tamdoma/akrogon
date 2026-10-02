# Merged: repair-authority Q1 (round 2)

## Recent akrogon repairs (A,B,C)
- 5 trips since 2026-09-25 (peer-c-role, epic-broadcast-once, realistic-review-bar, base-red-exit, leaf-temp-dir). Every one was one local finding: 3 docs/prose, 1 wrong command, 1 test-style fix. None was a failing test or red check. Trips took 5 to 10 min, about 35 min in total.
- Every candidate rule, even the narrowest, removes 5 of 5 akrogon trips.
- akrogon time since 09-29 goes to implement (61%), merge (15%) and first review (13%). Repair is 7%, re-check 1%. The "testing takes so long" time sits in implement and merge, which this fork does not change. (C, A agrees from its own per-leaf table)

## Rule options and framework coverage since 2026-09-29 (35 trips)
- Bounded (reproduced, local, no plan change, no live run, no operator permission): C 17/35 (49%), B 8/35 confirmed floor (23%).
- Wide (every Fix except plan/design changes, missing planned units, required live runs not already authorized, operator-only items): C 33/35 (94%), B upper bound 27/35 (77%).
- All Fixes: 35/35 assigned, but B would then build missing units and change decisions.
- Recommendation: wide (A,B,C). B may still hand a repair to A when it judges the work too large for its pass. (C)

## Bias confirmation (A,B,C)
- Cannot be confirmed. No system card section, eval or practitioner write-up measures GPT-6.1 Sol self-preference or self-repair.
- GPT-6.1 Sol system card (OpenAI, 2026-09-29): 1.50% misrepresentation in a deliberately adversarial coding-deception test (GPT-6 Astra 0.51%); 0.056% severe flags on 49,650 internal Codex tasks; more reward-hacking flags than Astra; no monitor bypass.
- General research: self-preference is real when judging open-ended work (Panickssery 2024; Yang 2026: capability does not reliably reduce it) and weak or absent when a real check decides (Guey and Bougault 2026; Park and Choi 2026). A model's self-written tests can reinforce its own wrong reading (Chen et al., ACL 2025).

## Pitfalls carried into design
- B writes both the test and the fix. Commit the failing test that reproduces the recorded source first, then the fix. (C; B: assert the criterion, not the patch)
- The gate is B's own report. `akrogon phase` runs no checks (`src/phase.ts:216`). A command-run gate is a new fork. (C)
- B's repair needs A's after-repair duties: criterion proof, every `checks` command, report lines (`skills/implement-issue/SKILL.md:75`), Fixes only, no scope creep (`skills/check-issue/SKILL.md:57`). (B,C)
- B misclassifying a plan change as a routine repair ships with no reader. (C)

## Proposed new fork
- command-gate: should `akrogon phase` itself run the configured `checks` before accepting a B repair into merge, so the gate does not depend on B's word?
