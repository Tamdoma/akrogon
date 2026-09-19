# Round 2 merged: classification and rewrite policy

Research (both): practitioner mager.co 2026-03-19 four-subsystem definition and maturity ladder (A); practitioner Simon Willison 2026-02-07 on StrongDM's factory and StrongDM's own account, the strict "no human reads code" model (B); vendor primary factory.com 2026-07-18 four properties (both); Diátaxis by Procida for the page-shape question (B). Repository primary: src/routing.ts, src/next.ts, src/state.ts, src/phase.ts, src/sync.ts, src/install.ts, config.yaml, skills/*.

Classification (both): akrogon fits the broad 2026 usage: standardized inputs (brief, design, state), one pipeline plan → implement → review → merge, configured checks, agent review, lessons. It stops at merge, has no deploy or monitoring, no independent scenario validation (B), partial measurability and replayability (A). A and B are roles, not vendors (both, config.yaml:2-10).

Q1 label. (A) "a small software factory for one operator" plus stop-at-merge boundary. (B, recommended sentence) "Akrogon is a lightweight software factory that runs work you define through planning, implementation, review and merge using two configurable coding-agent seats in Herdr." Alternative (both): mechanism sentence without the label. Pitfalls (B): never claim dark factory, unattended success, deployment, or that two vendors are required.

Q2 rewrite depth. (both, recommended) rewrite every page for the stated reader against src/, config.yaml and skills/ as truth, keeping topic paths. Page shape (A): what it is and why, how it works, in practice; (B) do not force identical headings on concept pages, one small issue as running example, task pages state prerequisites, checkout, command, expected result, failure path. Alternative (both): patch verified errors only. Verified drift (B found F1-F12, A found F1, F7, failed-recovery): seat identity, invalid one-level leaf example in create.html:67-83, "phase is the only signal", attempts semantics, `next --all` scope, blocker re-check, sync scope, stops and recovery, manual state edit, small-item chart, README skill roots and `--from`, gacp semantics. Estimate (B): 12-14 of 17 pages substantively rewritten, two-thirds of effort is fact checking and explanation.

Q3 reader statement (A): one sentence at the top of README naming the reader, "you already run coding agents and want a system that runs them for you"; no explanation of agents, git, PRs; every akrogon term explained at first use. (B) agrees in pitfalls: first principles means this system's concepts, not programming.

Q4 truth check (A): done-criterion that every command, flag, phase, config key and path in the pages exists in src/, config.yaml or skills/, and the report carries the correction list with evidence. (B): report carries a reader walkthrough and evidence-backed correction list, no permanent ledger, no exact-prose tests, gacp checked only in a temp repo with a fake remote.

Split (both): one leaf. Rewrite is the conversion.

Held from B for the design: README's own drift (F11) is in scope, including the command-reference test expectation where verified syntax changes; source, config and skills are evidence, never change targets; conflicts between them are reported for the operator.
