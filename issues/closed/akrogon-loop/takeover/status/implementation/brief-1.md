# 1. Goal
Implement status overview and detail, plan D1–D6.

# 2. Numbered acceptance criteria
C1–C4 and C6 from plan.md. Read the full criteria in ../plan.md before editing. Tests exercise values and behavior, not exact prose.

# 3. Read-first list
../plan.md and ../brief.md, ../design.md. In worktree: src/akrogon.ts, src/config.ts, src/state.ts, src/log.ts, src/next.ts, src/shell.ts, src/routing.ts, tests/helpers.ts, tests/next.test.ts, tests/fake-herdr.ts, package.json. Follow existing command subprocess fixtures. Read /home/ivan/.codex/skills/implement-issue/ponytail.md. No grounding index is configured.

# 4. Change list and needed interfaces
src/status.ts (new), src/akrogon.ts CLI case/usage only, tests/status.test.ts (new). Export statusCommand(slug: string | undefined): Promise<void>. Reuse existing schemas and helpers. Strictly type new code in repository style. No production interfaces depend on the other unit.

# 5. Do-not, reasons and exceptions
Do not modify phase/routing, unrelated code, dependencies, config or documentation because this leaf owns only status and the failed notification branch. Do not call real herdr notifications or access real panes, GitHub or install roots in tests. Read-only notification help is allowed to establish syntax. Use temporary repo files and the existing fake process boundary. Return a mismatch with evidence rather than widening scope or changing interfaces. Only a revised brief from B authorizes an exception. These exclusions preserve locked ownership and isolate test effects, and only a revised brief changes them.

# 6. Ordered steps
Derive tests from the assigned plan criteria first, run them red, implement the assigned files, then run the targeted check green. Capture real fixture invocation output and exit status under this implementation directory in a unit-specific evidence file. Update this report. Units execute sequentially, status first then notification. About three files per unit. Return a mismatch if the task materially exceeds this scope.

# 7. Commands
AKROGON_BASE=33387facaaa93d38f2937d646f262233812cdf50 bun test tests/status.test.ts
No configured test_changed exists, so this is the targeted check derived from Bun's existing runner. Workers do not run the full suite. B runs configured blocking checks after both units.

# 8. Done-when, evidence and report
Assigned criteria verified by real subprocess scenarios, red/green evidence recorded, end-to-end artifact path given. Keep plan L1 and L2 explicit. No tests use real herdr socket or GitHub. Fill the report below before returning.

Changed files and reasons: `src/status.ts` implements overview scans, age and state rendering, exact-path partial scan diagnostics, and authoritative detail. `src/akrogon.ts` exposes status with zero or one argument. `tests/status.test.ts` covers C1–C4 and C6 using real CLI subprocesses and temporary repositories.
Tests run: `AKROGON_BASE=33387facaaa93d38f2937d646f262233812cdf50 bun test tests/status.test.ts`. Red: exit 1, 0 pass / 5 fail, recorded in `unit-1-red.txt`. Green: exit 0, 5 pass / 0 fail, 104 assertions, recorded in `unit-1-green.txt`. Real overview and detail argv, stdout, stderr and exit codes are recorded in `/home/ivan/Work/infra/akrogon/issues/open/akrogon-loop/takeover/status/implementation/unit-1-command-evidence.json`. Fixture cleanup ran. No real herdr or GitHub calls occurred. Confirmed malformed Bun YAML raises SyntaxError with a read-only runtime probe.
Known limitations: Plan L1 (operator review intervention timing), L2 (unlocked diagnostic read).
Unverified criteria: C7 live takeover remains operator-owned after merged. C1–C4 and C6 verified. Full formatting, typecheck and full-suite checks remain with B after both units, as ordered in section 6.
