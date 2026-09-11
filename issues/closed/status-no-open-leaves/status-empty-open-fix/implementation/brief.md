# Implementation brief

## 1. Goal

Implement plan D1–D3: status explicitly reports zero open leaves using the existing successful scan result.

## 2. Numbered acceptance criteria

1. C1: Missing open directory prints `repo` followed by `  no open leaves`, exits 0, and does not create the directory.
2. C2: Empty open directory prints the same and exits 0.
3. C3: Nonempty repo retains rows without this message. The message does not match the existing field-based row regex.
4. C4: Parked output follows the empty-state message and other repositories remain visible.
5. C5: Missing repository and malformed repository config retain unreadable JSON with correct path, exit 1, and no successful empty-state message for that repository.
6. C6: Real isolated CLI invocation leaves `implementation/cli-artifact.log` in the authoritative leaf, capturing setup, entrypoint, stdout, stderr and exit 0.
7. C7: Changed tests pass. B subsequently runs formatting, typecheck, and full suite.

## 3. Read-first list

Read authoritative sibling `../plan.md`, `../brief.md`, and `../design.md`. In the worktree read `src/status.ts`, `tests/status.test.ts`, `tests/helpers.ts`, `docs/in-practice.html`, `docs/cheat.html`, and `package.json`. Copy the existing CLI fixture and incomplete-repositories scenario patterns. Read `/home/ivan/.codex/skills/implement-issue/ponytail.md` and `worker-protocol.md`. No lessons read is required for implementation.

## 4. Change list and needed interfaces

Change only `src/status.ts` and `tests/status.test.ts`. Pair the current nonempty rendering branch with an empty branch printing two-space-indented `no open leaves`. Preserve `Scan`, `scanRepo`, and `statusCommand` signatures. Reuse `fixture`, `cli`, `register`, and existing assertions. Write execution evidence and this report only in the authoritative leaf directory outside the worktree.

## 5. Do-not, reasons and exceptions

Do not alter scanning, detail output, parked hints, other commands, dependencies, or unrelated docs because the existing missing-open guard already works and this scope is output only. Do not commit or transition phases because B owns handoff. Do not run the full suite because B owns it. Return a mismatch with evidence instead of expanding scope or changing an interface. Only a revised brief from B permits such changes. These exclusions keep the fix scoped and preserve existing contracts, with exceptions requiring B's revised brief.

## 6. Ordered steps

Derive tests for C1–C5 first in `tests/status.test.ts`, including the existing parked expectation update and bad config coverage. Run the changed-test command for red evidence. Add the minimal production branch for D1, then rerun for green evidence. Run a real CLI invocation via existing helpers against a temporary registered repo with no open folder for C6, asserting output and code and preserving the evidence log. Clean fixtures and temporary helpers. Fill section 8 and return the diff summary and changed-test output. Expected scope is two code/test files and about 12 turns. Return evidence of a mismatch if materially larger.

## 7. Commands

`AKROGON_BASE=1956e56c6526df7fe3880b09ac9cf884ecb01c33 bun test --changed=1956e56c6526df7fe3880b09ac9cf884ecb01c33`

## 8. Done-when, evidence and report

C1–C6 are verified, changed tests pass, and the CLI log exists at `/home/ivan/Work/infra/akrogon/issues/open/status-no-open-leaves/status-empty-open-fix/implementation/cli-artifact.log`. Use real files and processes in temporary repositories without real external service calls. B completes C7 before handoff.

Changed files and reasons: `src/status.ts` adds one empty-state output branch. `tests/status.test.ts` covers missing and empty open directories without writes, nonempty output, row-regex exclusion, parked ordering and healthy repo visibility, and exact unreadable exit/path behavior for missing repos and malformed config. `implementation/cli-artifact.log` records the isolated real CLI invocation. No interfaces or scanning behavior changed.
Tests run: `AKROGON_BASE=1956e56c6526df7fe3880b09ac9cf884ecb01c33 bun test --changed=1956e56c6526df7fe3880b09ac9cf884ecb01c33` first produced 11 pass / 3 fail / 187 assertions, with all failures caused by absent empty-state output. After the production branch, the same command produced 14 pass / 0 fail / 224 assertions across `tests/status.test.ts`. A real `bun --eval` invocation using `fixture`, `cli`, and `entry` from `tests/helpers.ts` asserted exit 0, stdout `repo\n  no open leaves`, empty stderr, and the open directory remaining absent. It wrote the required CLI log and cleaned its fixture. No temporary helper file was created.
Known limitations: Existing filesystem race between existence check and scanning remains unchanged.
Unverified criteria: None. B completed C7: `bun run format` passed with no formatting changes, `bun run typecheck` passed, and `bun test` passed 211 tests across 12 files with 2728 assertions and zero failures. `git diff --check` passed. Documentation inspected describes overview and parked output without conflicting empty-state claims, so no documentation edits were needed. Committed only `src/status.ts` and `tests/status.test.ts` as `9b8f5231fa43a2ec6010b124be818aa6149cc4ed`; `git status --porcelain` was empty afterward.
