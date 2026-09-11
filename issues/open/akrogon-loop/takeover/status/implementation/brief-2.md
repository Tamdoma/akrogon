# 1. Goal
Add failed-leaf notification in next, plan D7.

# 2. Numbered acceptance criteria
C5 from plan.md, including visible notification failure and no dispatch or state mutation for failed leaves. Read the full criteria in ../plan.md before editing. Tests exercise values and behavior, not exact prose.

# 3. Read-first list
../plan.md and ../brief.md, ../design.md. In worktree: src/akrogon.ts, src/config.ts, src/state.ts, src/log.ts, src/next.ts, src/shell.ts, src/routing.ts, tests/helpers.ts, tests/next.test.ts, tests/fake-herdr.ts, package.json. Follow existing command subprocess fixtures. Read /home/ivan/.codex/skills/implement-issue/ponytail.md. No grounding index is configured.

# 4. Change list and needed interfaces
src/next.ts existing failed branch only, tests/fake-herdr.ts notification boundary, tests/next.test.ts scenarios. Reuse existing schemas and helpers. Strictly type new code in repository style. No production interfaces depend on the other unit.

# 5. Do-not, reasons and exceptions
Do not modify phase/routing, unrelated code, dependencies, config or documentation because this leaf owns only status and the failed notification branch. Do not call real herdr notifications or access real panes, GitHub or install roots in tests. Read-only notification help confirms: `herdr notification show [OPTIONS] <TITLE>`, with `--body <TEXT>`. Use a title identifying the failed repo/slug, with no extra features. Use temporary repo files and the existing fake process boundary. Return a mismatch with evidence rather than widening scope or changing interfaces. Only a revised brief from B authorizes an exception. These exclusions preserve locked ownership and isolate test effects, and only a revised brief changes them.

# 6. Ordered steps
Derive tests from the assigned plan criteria first, run them red, implement the assigned files, then run the targeted check green. Capture real fixture invocation output and exit status under this implementation directory in a unit-specific evidence file. Update this report. Units execute sequentially, status first then notification. About three files per unit. Return a mismatch if the task materially exceeds this scope.

# 7. Commands
AKROGON_BASE=33387facaaa93d38f2937d646f262233812cdf50 bun test tests/next.test.ts
No configured test_changed exists, so this is the targeted check derived from Bun's existing runner. Workers do not run the full suite. B runs configured blocking checks after both units.

# 8. Done-when, evidence and report
Assigned criteria verified by real subprocess scenarios, red/green evidence recorded, end-to-end artifact path given. Keep plan L1 and L2 explicit. No tests use real herdr socket or GitHub. Fill the report below before returning.

Changed files and reasons: `src/next.ts` invokes the existing command boundary in the failed branch with a repo/slug title, then returns without dispatch. `tests/fake-herdr.ts` accepts that notification invocation and exposes a fixture failure toggle. `tests/next.test.ts` verifies C5 through real CLI subprocesses, including retry exhaustion followed by notification, nonfailed dispatch without notification, unchanged state, no dispatch calls, and visible command failure.
Tests run: `AKROGON_BASE=33387facaaa93d38f2937d646f262233812cdf50 bun test tests/next.test.ts`. Red: exit 1, 9 pass and 2 fail because no notification was recorded, captured in `implementation/unit-2-red.txt`. Green: exit 0, 11 pass and 101 assertions, captured in `implementation/unit-2-green.txt`. Separate real fixture invocation evidence: `/home/ivan/Work/infra/akrogon/issues/open/akrogon-loop/takeover/status/implementation/unit-2-fixture.json`, recording argv, cwd, stdout, stderr, success exit 0, notification failure exit 1, fake calls, and unchanged state. Temporary fixtures were removed. No real herdr socket or GitHub was used. Full configured checks remain B-owned.
Known limitations: Plan L1 (operator review intervention timing), L2 (unlocked diagnostic read).
Unverified criteria: C7 live takeover remains operator-owned after merged. Assigned C5 is verified.
