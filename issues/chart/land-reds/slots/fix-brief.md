# Brief: blind map and picks, fork fix-shape (slot B or C)

You are a consultant for chart door A (hc t126) charting `land-reds` in /home/ivan/Work/infra/akrogon. Full autopilot, urgent: A implements right after this round. Work blind: do not read the other seat's return. This is a new chart; earlier ai-budgets context does not apply.

## Inputs

- Intake (operator words + seed #147 verbatim): /home/ivan/Work/infra/akrogon/issues/chart/land-reds/INTAKE.md
- Locks: issues/chart/land-reds/forks/signposts.md `## Taken`. Prior decisions: issues/chart/merge-lanes/forks/red-exit.md `## Taken` (items 3, 7, 8, 9) and issues/chart/merge-lanes/forks/signposts.md `## Taken` (operator limits).
- akrogon code: src/verify.ts (`named`, `uncoveredMainRedUnits`, `knownRedReceipt`, `verify` known-red branch, `checkedRun` callers), src/land.ts (`land`, `taken8Trigger`, `repairExit`), src/admission.ts (`withAdmission`, `awaitLineTurn`, `lineRuns`, `nested`), src/run-check.ts (`checkedRun`), src/phase.ts (`fix_rounds`), skills/check-issue/SKILL.md `## check.repair` (red merge exit paragraph and bullets), skills/merge-issue/SKILL.md, docs/reference/checks.md.
- Framework evidence (read only): /home/ivan/Work/infra/tamdoma/framework/issues/{merge-attempts.jsonl, verify-runs.jsonl, config.yaml}; kept land logs `issues/open/*/*/implementation/check-verify-*.log`; consult notes ~/.akrogon/watch/framework/consults/repair-round-bound-1/turn-1-*.md; the leaf review-B.md files of runner-names-unbound-route, repair-round-bound, review-capture-by-unit.

## Question

Q1 Verify the seed's two conditions against the code and evidence: (1) a nameless failure disables the base pass; (2) leaf runs are not held back while a land verify runs. Which is the cause and which a symptom?
Q2 Load: what minimal admission change gives a land verify (a run with `attempt`) a quiet repo — e.g. other runs of the same repo wait while a land run waits or is live, land waits for already-live runs to drain — and how does it compose with the `full` line, nested runs, seat `run-check`s, the akrogon repo's own `full: [test]`, starvation and cancel/stop-run? Or is the right answer elsewhere (framework `full`, nothing)?
Q3 Judgment: what changes, if anything, in how a red with nameless/timeout failures is handled (verify.ts named path, taken8, check-issue `## check.repair` "second red on the same unit" bullet, unrelated fixes committed on a leaf branch), within the limit that no leaf adds a new test failure to main and locks 3/7/8?
Q4 What else must change (docs, tests, status/merge-slow), and what can be removed?

## Task

Under 100 lines: for each Q, a Pick, Rejected options with why, Evidence (file and function, or log path), Pitfalls, and one Unasked question. Then the minimal set of tests that proves the pick (red before, green after). Name sections and functions, never line ranges.

## Reading rule

Read process text by named section; batch independent reads; read held content at most once. Code is the subject here, so full source files are allowed.

## Report

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/land-reds/slots/fix-<your letter>.md, then run:
hc send t126 "done <your letter>: <return path>"
