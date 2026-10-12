# Merged map: #87

## Root (A,B)
A taken decision that needs an edit on main is put under Off route because a leaf cannot edit `issues/` (shapes.md:284). Off route means "excluded from the outcome" (shapes.md:35), so the activation leaves the chart and nothing carries it. framework origin/main issues/config.yaml:12 is still the stub; framework #115 closed 2026-10-03 with the switch undone (B). The selector exists and works: on the failing leaf's 28-file diff (base 2e5b2aaf3 to 6fe2049d7) `selectScripts` picks 22 scripts, both failing verifiers among them, 0 unowned (A, run 2026-10-12).

## Fork 1: where does a needed step on main live
- Pick (A,B): a step on main that a taken decision needs is part of the outcome, never Off route. The door does it in the pass, verified, when its precondition exists. Text rule in chart-issues, no command code.
- Difference, waiting case (machinery must land first):
  - (A) door files the step with seed-issue: exact edit, the leaf it waits on. It stays an open GitHub issue, mirrored by `akrogon pull`, until done.
  - (B) keep it as an explicit open chart item, and the completion owner retains the source until activation is verified. Open question: which owner.
- Rejected (A,B): new command state or queue for steps; letting a leaf edit `issues/config.yaml` (breaks the code-only lock; config is read from the registered root, src/config.ts:175,210-215); "remember to switch" prose.
- Pitfalls (A,B): never activate a command before it exists; never claim the behavior delivered at the prerequisite's merge.

## Fork 2: framework instance now
- Pick (A,B): set framework `checks.test_changed: bun run test:changed` on main after a real run of that command on a base where it selects the area, recording the selected scripts and time. Not just exit 0, since a clean base selects nothing (run-test-changed.ts:191-194) (B).
- Cost (A,B): worker checks take longer; this is the behavior already chosen in framework verify-gate area-selection 1a.
- Approval: commit to framework main needs operator go-ahead (A).

## Fork 3: init-akrogon "verified test_changed"
- (B) clarify: verified means it runs affected tests or the declared full suite; "literal $AKROGON_BASE" means forwarding the base, which a script may read internally.
- (A) off route: framework's `test` check was also parity+contracts (framework issues/config.yaml:10), so the stub equalled its own "full suite" and a functional rule would not have caught it. Format checks on command text are form, not function.

## Off route (A,B)
merge_covers redesign, duplicate-check cleanup, #86 flake handling, run counts, scheduling changes.
