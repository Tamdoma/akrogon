## 1. Goal

Implement plan D1–D6: complete the README command reference and protect CLI verb/argument coverage with one test file.

## 2. Numbered acceptance criteria

1. C1: All ten CLI verbs appear exactly once with correct argument shapes and nonempty effects. Coverage derives verbs from the live dispatcher.
2. C2: Argument checks cover required/optional values and park/unpark exclusive alternatives, including Markdown escaped pipes.
3. C3: One paragraph accurately documents committed parked records, delivered sync behavior/refusals, origin intake, remote integration, and consumer issues_repo routing.
4. C4: Missing/extra/duplicate rows and lost arguments fail. Valid rows pass. Demonstrate red with the current incomplete README, then green after editing it.
5. C5: Only README.md and tests/command-reference.test.ts change. B performs full checks and real CLI scenario evidence after the worker returns.

## 3. Read-first list

Read ../plan.md and ../design.md relative to this brief's directory. In the worktree read README.md, src/akrogon.ts, src/sync.ts, src/park.ts, src/pull.ts, skills/seed-issue/SKILL.md, tests/helpers.ts, tests/park.test.ts and package.json. Copy Bun test style from tests/park.test.ts. Read /home/ivan/.codex/skills/implement-issue/ponytail.md and worker-protocol.md. The plan and design actually live one directory above implementation/.

## 4. Change list and needed interfaces

README.md: retain existing rows, add sync/park/unpark and one paragraph per D2–D4. tests/command-reference.test.ts: test-local typed helpers read the command table and switch case labels, compare inventory and validate literal argument contracts. No runtime interface changes.

## 5. Do-not, reasons and exceptions

Do not edit production code, dependencies, other tests, website, skills or repository-identity prose because the locked leaf owns only two files. Do not mechanically test natural-language wording or row order. Return a mismatch with concrete evidence instead of expanding scope or changing interfaces. Only a revised brief from B authorizes an exception. These exclusions keep the documentation leaf bounded and checks functional, and only B's revised brief can relax them.

## 6. Ordered steps

1. Derive tests from C1/C2/C4, add the test file first, and run the changed-test command to capture the current README failing.
2. Update README.md for C1–C3, run the same command and repair in-scope failures.
3. Inspect the two-file diff and fill section 8 with red/green output and any limitations. Do not commit. Advisory size: two files in one worker unit. Return a mismatch if substantially more is required.

## 7. Commands

Run only this test command as the worker, before and after the README edit:

```sh
export AKROGON_BASE=f3b25f55c302cc00aeee4896d5e595b0cd35a807
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

B owns full tests, format/typecheck, and real CLI invocation evidence using existing sync/park test scenarios in isolated repositories.

## 8. Done-when, evidence and report

Fill these lines with actual evidence before returning. CLI end-to-end evidence is pending B's run at /tmp/command-reference-cli-evidence.log. Do not access real GitHub, Herdr panes, or install roots.

Changed files and reasons: README.md adds sync, park and unpark rows plus the scoped sync and intake/routing paragraph. tests/command-reference.test.ts derives live dispatcher verbs and checks table inventory, effects and required/optional/exclusive argument groups, with negative mutations and valid escaped alternatives. Only these two worktree files changed. No commit made.
Tests run: used only the section 7 changed-test command with AKROGON_BASE=f3b25f55c302cc00aeee4896d5e595b0cd35a807. Initial red: exit 1, 3 pass / 1 fail, README missing park/sync/unpark. An intermediate run caught the new rows outside the command section and remained red. After placing them in the command table: exit 0, 4 pass / 0 fail, 789 assertions, one test file. Final prose-only punctuation adjustment does not change the checked table.
Known limitations: prose correctness requires human/agent review and source extraction follows the current switch dispatcher.
Unverified criteria: none. B reviewed the prose against sync, park, pull and seed-issue sources. No production code, dependencies, other tests, website, skills or repository-identity prose changed.

Final B evidence: `bun run format` and `bun run typecheck` exited 0. After formatting, the configured changed-test command exited 0 with 4 pass / 0 fail. `bun test` exited 0 with 170 pass / 0 fail and 2361 assertions, recorded in `/tmp/command-reference-full-tests.log`. The real CLI scenario command `set -o pipefail; bun test tests/sync.test.ts tests/park.test.ts 2>&1 | tee /tmp/command-reference-cli-evidence.log` exited 0 with 37 pass / 0 fail and 306 assertions. `git diff --check` passed. Committed only the two owned files as `3ffce4dd8e950f8927e4bbd60fb670deee072e49`; post-commit worktree status is clean. C1–C5 are satisfied. The source-extraction and prose-review limitations above remain.
