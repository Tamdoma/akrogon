# Chart: handoff gaps exposed by stacked-turn

## Destination
Operator 2026-10-15: find the systemic handoff gaps exposed by the stacked-turn plan finding, keep the handoff contract at about 20 rules, handoffs detailed enough that the plan phase knows what to resolve. Also answer the D1 challenge, and (operator, later) a stock-and-flow and loop-validity analysis of the whole lifecycle to push performance further without losing quality ("why are we returning non existing tests to A?").

Consult: slots/brief.md, answer-A/B/D/E.md.
Rebuttals: slots/merged.md, rebuttal-B/D/E.md. Red-merge causes (Haiku pass, spot-checked disavow review-B.md:822-843): 7 reds since 10-14 12:00, 5 real leaf defects, 1 foreign flake, 1 drift with main; 2-3 of the real ones were hand-copied test lists, removed by framework 673ea4ab9 (10-14 22:08Z).

## Decisions (operator 2026-10-15: "go with all of your recommendations"; rule count stays as is)
- G1 (Q1, A,B,D,E): handoff defect of form. shapes.md Leaf architecture placeholder becomes one sentence: owned surfaces and literal interfaces; exclusions with owners; dependencies; for each state or precondition the change alters, the consumer (file:function) that relies on it and either the decision or an `Open for the plan:` line; reuse stated only with the callee's precondition checked against the post-change state, else an `Open for the plan:` line; no line numbers. plan-issue :65 answers every `Open for the plan:` line. Net 0 rules.
- G2 (Q2, A,B,D,E; E conceded): keep D1, state it once instead of three times. Upstream: plan-issue :61 maps each criterion to the observation that proves it (boundary, start and end state, product failure caught, command); a command that only makes an artifact or calls a helper is not evidence for an unobserved consumer result (B, D; E also wanted per-branch proofs and a grep ban, rejected by B, D).
- G3 dropped by operator: "We're not gonna be touching the amount of rules in the skill." Research (Anthropic skills docs: SKILL.md under 500 lines, no rule-count limit; arXiv 2607.19257, 2608.12426) supports keeping the count; keep few rules per step and each rule stated once.
- G4 (P2, A,B,D,E): stacked-turn continues at its current scope, below inflow in priority. Corrected turn wait: 2.5 h total over 31 visits, in bursts.
- G5 (P5, A,B,D,E): no buffer number. Settled charts release at once (D4, landed); the per-handoff cuts went with G3.

## Landing
- G1, G2: 63e2479, pushed 2026-10-15. B review slots/review-B-1.md (ready). Verify green on 63e2479 (direct/check-*-17920450*).
- G4, G5: no change (stacked-turn continues; D4 already landed).
Closed 2026-10-15
