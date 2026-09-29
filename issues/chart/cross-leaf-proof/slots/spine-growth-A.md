# spine-growth, slot A

Evidence:
- design-tokens brief.md:36 and plan-script brief.md:40 did swap their steps to real. content-batch (crit 13) and satellite-build proved themselves with one-off runs and never swapped; the spine still has `per-site-content-weave` and `recorded-build` recorded (run-fixture-network.ts:648,653) and no content-prep/batch/finalize/verify step. So the rule existed as an option (fixture-network design.md:68 "Later leaves change only their own step entries", README crit 10) but no chart audit checked every stage had an owner.
- fixture-network design.md:154: "Recorded model outputs: fixture data the implementer authors to the consumers' schemas". Hand-authored stand-ins hid the shape mismatches #1-#3 (they matched the consumer schema, not the producer's real output). research-pools and pool-smell-freeze later replaced one recording with a real session output.
- akrogon: shapes.md:118,170 check dependencies and cross-leaf owners, nothing about a shared integration command. merge-issue runs configured `checks` after rebase, so a spine inside the consumer's blocking check is already gated.

Q1: 1a. When a chart splits a pipeline, the chart names the spine command and a stage table: each stage has an owning leaf whose done-criteria make it real in the spine, or it stays recorded with a reason (model or external). The handoff audit refuses a pipeline leaf whose stage is missing from the table. The spine runs in the consumer's blocking checks. Reason: this is exactly the gap (some leaves swapped, two did not, nobody checked). 1b a rule in standing design only: reinterpreted per leaf (standing-design.md:13). 1c a new state.yaml field enforced by the command: code for what the audit already covers.

Q2: 2a. Trigger: a chart where one leaf's output is another leaf's input at runtime (producer-consumer across leaves). Not triggered by file overlap or ordering alone. Reason: matches the report's reproduction ("leaves pass data through a pipeline").

Q3: 3a. Recorded stages must be recorded from a real run of the producer, never hand-authored, with the recording command named. A live probe is used only for the leaf whose model or external behavior changed (B2). Hand-authored negative/edge fixtures stay allowed (D4). Reason: hand-authored stand-ins matched the consumer's schema and hid producer mismatches.

Pitfall: ponytail.md:30 "no frameworks, no fixtures" is about the one check lazy code leaves behind; a design line should state the spine is a separate contract so seats do not read the two against each other.
