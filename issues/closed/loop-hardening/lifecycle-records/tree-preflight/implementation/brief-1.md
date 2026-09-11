## 1. Goal
Implement shared discovery depth validation and parked missing messages, plan D1/D2/D5, with explicit area context for all existing subtree callers.

## 2. Numbered acceptance criteria
1. allLeaves rejects state paths at area depth 0, 1 and 4 in both open and closed, naming the absolute state path. Depths 2 and 3 remain valid.
2. leavesUnder retains the explicit area root throughout recursion, and existing park/phase/pull subtree behavior passes.
3. missingLeafMessage/findLeaf mark a supported parked leaf folder with state.yaml as parked without parsing dormant state. Both shapes work, absent/owner-only names do not match, active/closed leaves take precedence.

## 3. Read-first list
Read ../plan.md D1/D2/D5 and C2/C3, src/state.ts, src/park.ts, all leavesUnder call sites (rg), tests/helpers.ts, tests/park.test.ts, and /home/ivan/.codex/skills/implement-issue/ponytail.md. Reuse fixture/leaf and real filesystem patterns in tests/helpers.ts.

## 4. Change list and needed interfaces
Own src/state.ts, mechanical caller adaptations in src/park.ts, src/phase.ts, src/pull.ts, and focused tests/state.test.ts (or existing corresponding test files if simpler). Export validateLeafDepth(areaRoot: string, leafPath: string): void using a Zod boundary validation, require leavesUnder(path: string, areaRoot: string): Leaf[], and export missingLeafMessage(repo: Repo, slug: string): string. Use relative path components for depth, not basename inference. Reuse issueFolders for bounded parked enumeration. Do not edit next/status integration or skill docs.

## 5. Do-not, reasons and exceptions
Do not change completion, parking movement, schema fields or repo mismatch behavior, because these edits only carry depth context and sibling leaves own other behavior. Do not parse dormant parked state. Do not commit. Return a mismatch with evidence before changing scope/interfaces, except if B revises this brief. Scope and dormant-state isolation are the reasons, and a revised brief is the exception.

## 6. Ordered steps
Write focused tests from criteria first and run the changed-test command to demonstrate red. Implement shared interfaces and adapt every existing leavesUnder caller. Run the same changed-test command to green and fill this report. Advisory scope: 5 production/test files plus any necessary existing test call-site adaptation, about 12 turns. Report actual incompatibilities rather than guessing.

## 7. Commands
Run only this test command, red then green:
AKROGON_BASE=a6b53fdceca8e54b7618f59cffd0beb53c2d882b bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
Capture outputs outside the worktree beside this brief, e.g. worker-1-red.txt and worker-1-green.txt. B owns formatting/typecheck/full suite.

## 8. Done-when, evidence and report
Fill the four contents below before returning, and return changed-test exit codes and evidence paths. Tests use temporary repos, real files and existing boundary fakes only, no production state mutation or external services.

Changed files and reasons: src/state.ts adds the shared Zod depth boundary, explicit recursion area root, and bounded parked-folder missing message without parsing parked state. src/park.ts, src/phase.ts and src/pull.ts pass their known area roots to every subtree scan. tests/state.test.ts adds 13 filesystem cases covering open/closed depths 0–4, subtree depth context, both parked shapes, malformed dormant state, absent/owner-only folders, unsupported nesting and active/closed precedence. No commits made.
Tests run: The exact section 7 command exited 1 before implementation (5 pass, 8 expected failures) and 0 after implementation (76 pass, 0 fail, 582 assertions across next, phase, status and state suites). Full outputs: worker-1-red.txt and worker-1-green.txt beside this brief.
Known limitations: Discovery retains terminal-leaf traversal. Parked lookup intentionally only checks folder names and state-file existence at depths 2 and 3. No scope/interface mismatch found.
Unverified criteria: Bun's changed-test selection did not include park.test.ts or pull.test.ts, so their existing CLI behavior still requires B's planned integration/full-suite run. Formatting, typecheck, authoritative-record loading and next/status integration remain B's responsibility. All other numbered criteria in this brief are exercised by the passing tests.
