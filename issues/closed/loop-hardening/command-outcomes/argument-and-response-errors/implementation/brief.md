# Implementation brief

## 1. Goal

Implement plan D1–D4 for argument-and-response-errors: actionable file-target errors, contextual Herdr response errors, and committed-phase context on logging failure. One bounded unit covers the three related error boundaries.

## 2. Numbered acceptance criteria

1. C1: Relative/absolute file targets and file symlinks fail with target and accepted target kinds, without ENOTDIR, dispatch or leaf mutation. Existing targeting works.
2. C2: Malformed JSON and schema-invalid successful Herdr responses retain argv, cwd, stdout and parse error with native cause. Valid responses and nonzero command errors preserve behavior.
3. C3: Logging failure reports committed destination and original error, leaves committed state, and does not replay. Include filesystem append failure and diagnostic collection failure. Existing merge recovery remains valid.
4. C4: Changed tests pass with fail-first evidence and a saved real-CLI transcript. B subsequently runs all blocking checks.

## 3. Read-first list

Read ../plan.md and ../design.md, docs/next.html and docs/problems.html (main content), src/next.ts nextCommand, src/shell.ts herdr/CommandError/command, src/config.ts commonDirectory/base, src/phase.ts commitMove, src/log.ts, src/akrogon.ts, tests/next.test.ts, tests/phase.test.ts, tests/shell.test.ts, tests/fake-herdr.ts and tests/helpers.ts. Copy the existing temporary fixture and cli() test pattern. Read /home/ivan/.codex/skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces

Limit changes to src/next.ts, src/shell.ts, src/phase.ts and their tests/fake-herdr.ts. Preserve herdr<T>(args: string[], schema: z.ZodType<T>): Promise<T>, command execution semantics and commitMove state ordering. Use native Error cause and a structured CommandError-shaped response message without introducing a general error framework. Validate before commonDirectory in the live nextCommand, as the plan explains. A local optional fake pane-list stdout override covers both malformed cases.

## 5. Do-not, reasons and exceptions

Do not change docs/README, parked hints, hook ownership, dispatch recovery, retries or logging replay because those exceed locked scope. Do not touch issue artifacts in the worktree, commit, call lifecycle commands, run the full suite or use real external services. Write the report only in this authoritative brief. Return a mismatch with evidence rather than changing scope or interfaces, except when B revises this brief. These exclusions preserve leaf ownership and isolate verification, with a revised brief as the only scope exception.

## 6. Ordered steps

1. Add C1 failure tests in next.test.ts, demonstrate red, then implement next.ts directory guard.
2. Add C2 CLI response cases and native-cause coverage, demonstrate red, then implement shell.ts parse guard and fake stdout support.
3. Extend phase.test.ts for C3 append and diagnostic failure, demonstrate red, then wrap only logMove in phase.ts.
4. Run changed tests and fill section 8 with evidence and limitations.

About seven files and one worker unit. Return evidence of a mismatch if materially broader work is needed.

## 7. Commands

Use this resolved changed-test command, including for red/green evidence. Do not run the full suite. Capture transcripts under /tmp/argument-and-response-errors-evidence using pipefail and tee. Tests invoke the real CLI in isolated fixtures and provide end-to-end evidence.

```bash
export AKROGON_BASE=a4f0b5d88080026860be4837f97f6a89a7c52a1c
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

## 8. Done-when, evidence and report

Return when C1–C3 pass, changed-test evidence exists, and the report includes red/green commands, exit statuses and artifact paths. Preserve plan R1 (missing log is not repaired) and R2 (simultaneous completion/log failure precedence unchanged). No authentication mocks, real panes or real remote mutations.

Changed files and reasons:
- src/next.ts: reject existing non-directory targets before Git repository probing.
- src/shell.ts: retain command, cwd, stdout, parse message and native cause for JSON/Zod response errors, with execution outside the guard.
- src/phase.ts: wrap only logging errors with the committed destination and native cause.
- tests/next.test.ts: real CLI file/symlink rejection, directory/worktree dispatch and malformed response cases.
- tests/fake-herdr.ts: optional schema-validated paneListStdout override.
- tests/shell.test.ts: isolated subprocess assertions for native parse causes and unchanged nonzero CommandError behavior.
- tests/phase.test.ts: append/diagnostic failures, committed-state persistence and no replay, retaining container recovery coverage.
Tests run:
All runs used `export AKROGON_BASE=a4f0b5d88080026860be4837f97f6a89a7c52a1c` followed by `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with pipefail.
- C1 red: exit 1, 57 pass / 4 fail, /tmp/argument-and-response-errors-evidence/c1-red.log. Three expected missing-directory-message failures plus an incorrectly located positive worktree fixture. Corrected that fixture to the existing canonical worktree root. This first transcript used direct redirection, subsequent transcripts used tee.
- C2 red: exit 1, 66 pass / 4 fail, /tmp/argument-and-response-errors-evidence/c2-red.log. JSON/schema context and both native causes failed before the parse guard. All C1 cases passed.
- C3 red: exit 1, 160 pass / 2 fail, /tmp/argument-and-response-errors-evidence/c3-red.log. Append and diagnostic failures lacked committed-phase context. All C2 cases passed.
- Initial C3 green attempt: exit 1, 161 pass / 1 fail, /tmp/argument-and-response-errors-evidence/c3-retry-assertion.log. New replay test expected the guide wording instead of the live CLI's Illegal move message. Corrected the test assertion without changing production behavior.
- Final green: exit 0, 162 pass / 0 fail, 1568 assertions, /tmp/argument-and-response-errors-evidence/cli-tests.log. The changed-test dependency graph expands to all 10 suites after shell.ts changes. No separate full-suite command was run by the worker. Tests invoke the real CLI in isolated fixtures.
- Reviewed scoped diff and git status. No commit, lifecycle calls, authentication mocks, real Herdr panes or real remote mutations. Temporary fixtures cleaned through finally blocks. B owns formatting, typecheck and the explicit full suite.
Known limitations: R1 remains: failed logs are not repaired or replayed. R2 remains: a simultaneous completion/logging failure retains the existing finally-block precedence.
Unverified criteria: C1–C3 pass. C4 changed-test and retained CLI evidence pass, with configured format, typecheck and explicit full-suite checks pending B.

### B validation

Reviewed all seven changed files against C1–C3. No scope or interface mismatch. Native Error with a structured message implements the planned response error without adding a class. No affected documentation or index entry requires a change within this leaf's scope.

- `bun run format`: exit 0. Artifact: /tmp/argument-and-response-errors-evidence/format.log. Only the seven owned files differ.
- `bun run typecheck`: exit 0. Artifact: /tmp/argument-and-response-errors-evidence/typecheck.log.
- `bun test`: exit 0, 162 pass, 0 fail, 1568 assertions. Artifact: /tmp/argument-and-response-errors-evidence/full-tests.log.
- `git diff --check`: exit 0.

Changed files and reasons: src/next.ts validates directory targets, src/shell.ts retains response parse context and cause, src/phase.ts reports committed state on logging failure, and tests/next.test.ts, tests/shell.test.ts, tests/phase.test.ts, tests/fake-herdr.ts verify the real CLI/process boundaries.
Tests run: Changed tests and all configured blocking checks passed, with fail-first and end-to-end evidence above.
Known limitations: Plan R1 and R2 remain unchanged.
Unverified criteria: None.
