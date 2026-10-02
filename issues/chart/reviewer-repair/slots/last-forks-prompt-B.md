# Blind fork round: operator-only exit and round budget (reviewer-repair)

Work blind: read no other file in this slots folder except this prompt. Ask no questions. Edit no repo file except your output. Run nothing that changes any repo, leaf or pane.

Read `issues/chart/reviewer-repair/CHART.md`, `INTAKE.md`, `forks/repair-authority.md` (Taken: B repairs every Fix from both reviews after both blind verdicts except plan/design changes, missing planned units, required live runs and operator-only items; those go to A through check.fix or stop through `failed` with the exact operator action; no second reader), `forks/operator-only-exit.md` and `forks/round-budget.md`.

Locks: `issues/chart/realistic-fix-bar/` (Fix bar), `issues/chart/seat-role-swap/` (A is the worker, B reviews and merges). Off route: models, the fix_rounds cap value, a command-run checks gate.

Operator words (verbatim): "We get another turn for a couple of these mistakes, that doesn't make sense." and "I just want to avoid constant back and forthing for failed tests, it just doesn't make sense."

Fork 1, operator-only exit. Q: The stop rule already exists (`skills/check-issue/SKILL.md:27`, `skills/merge-issue/SKILL.md:27`, `skills/implement-issue/SKILL.md:33`), yet emdash-launch review-A.md wrote the stray repo deletion as Fix F2 and the leaf flapped failed/recover. Why did the rule not hold, and what change (skill wording, Fix bar line, command refusal, nothing) makes an operator-only item stop exactly once? Trace the emdash-launch sequence from `/home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl` and its leaf files.

Fork 2, round budget. Q: With B repairing inside its own pass, B repairs make no check.fix move (`src/phase.ts:107-112`, `src/routing.ts:42-44`). Should B repairs count against `fix_rounds`, and should failed recovery stop resetting the counter? Name the smallest state change for each answer, what it breaks (tests, docs, existing leaves' state.yaml), and whether either is needed once B repairs most Fixes.

For each fork: findings with file:line, options with a recommendation, pitfalls. Primary or practitioner sources only where they apply, with URL and date read. Max 50 lines total.

Write to: issues/chart/reviewer-repair/slots/last-forks-B.md
