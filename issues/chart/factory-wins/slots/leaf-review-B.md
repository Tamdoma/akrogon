# Leaf review, slot B

## F1: cli-help needs ownership of the two usage declarations

Criterion 1 requires reusing the existing guard and run-check usage lines without copying them. However, Leaf architecture owns `src/akrogon.ts`, a possible new helper, tests and affected documentation. It does not own `src/guard.ts` or `src/run-check.ts`, where those strings are private literals inside `guard` and `runCheck`. The Open for the plan question cannot supply permission to edit their declarations.

**Evidence, read 2026-11-10 at 63526537:** draft `cli-help/brief.md`, Done-criteria 1; draft `cli-help/design.md`, Leaf architecture, Owned surfaces and Open for the plan. Command: `rg -n -C 5 'Usage: akrogon run-check|Usage: akrogon guard' src/run-check.ts src/guard.ts`. Both usages are inline error strings, not exported data. Contracts Taken requires one source rather than hand-written copies.

**Correction:** Include those two existing modules in ownership, limited to making each existing usage string shared by its current error path and the new help path. Keep their command behavior unchanged. Leave the exact placement to planning. Do not force runtime source parsing or deliberate invalid command calls as a workaround for missing ownership.

## Requested check of survival-test-wait's phase split

No disagreement: it can finish without a test-rule stop. `skills/plan-issue/SKILL.md`, plan.synthesis, permits planned criterion tests in an existing file and temporary deliberate breaks, discarded before the test commit. `skills/implement-issue/SKILL.md`, implement, forbids later test writing but permits running the planned proofs. The draft commits the existing-test synchronization edit during planning with its trailer, then gives implement no test edit or product change to commit. Criteria 1–3's explicitly planned, temporary fault injections are proof runs, not persistent expansion of product ownership or new proof machinery. Revert them before final committed-head verification. Evidence: those skill sections and draft survival-test-wait Standing design/Leaf architecture, read 2026-11-10.
