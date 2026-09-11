# Plan: status-empty-open-fix

## Decisions

- D1: Add the zero-leaf branch to the successful overview printer in `src/status.ts`: immediately after the repository name print `  no open leaves` when `scan.leaves.length === 0`. Keep the existing nonempty table branch and print any parked line afterward.
- D2: Preserve `scanRepo` and its existing missing-open guard. Missing `issues/open` already produces an empty leaf array. Preserve unreadable diagnostics and exit status for invalid repositories. No changes to `state.ts`, `next.ts`, detail output, or parked hints.
- D3: Use the existing CLI fixture and status tests for behavioral coverage. No new interfaces, dependencies, or helper abstractions are needed.

## Read first

Authoritative leaf directory: `/home/ivan/Work/infra/akrogon/issues/open/status-no-open-leaves/status-empty-open-fix`.

- Its `brief.md` and `design.md`.
- Worktree `REFERENCE.md`, `learnings/LESSONS.md`.
- Worktree `src/status.ts`, especially `scanRepo` and `statusCommand`.
- Worktree `tests/status.test.ts` and `tests/helpers.ts` for CLI fixtures, row matching, unreadable scenarios, and parked output.
- Worktree `docs/in-practice.html` and `docs/cheat.html` for the documented overview/detail command surface.
- Worktree `package.json` for verification commands.

## Grounding and review note

This is direct synthesis because the authoritative state sets `debate: no`. No positions or rebuttals are required.

The brief and historical design finding describe a missing-open crash. Live `scanRepo` already guards `existsSync(open)`, and the existing incomplete-repositories test exercises both missing and empty open directories successfully. The current design architecture governs: only the missing output requires a production change. Its claim that the crash comes from the printer is not supported by the live code. Baseline `bun test tests/status.test.ts` passed all 12 tests with 188 assertions during planning.

## Acceptance criteria

- C1: A valid registered repo without `issues/open` prints its name followed by an indented `no open leaves` line and exits 0. Status does not create the missing directory.
- C2: A valid registered repo with an empty `issues/open` produces the same empty-state output and exits 0.
- C3: A repository with leaves retains its table and emits no empty-state line. The new line does not match the existing field-based leaf-row regex in the status tests.
- C4: A zero-leaf repository with parked issues prints the name, empty-state line, then the unchanged parked line. Another repository's rows remain visible.
- C5: A missing registered repository directory or malformed repository config still produces an `unreadable` JSON diagnostic identifying the repository and failing path and exits 1. It must not be rendered as an empty successful repository.
- C6: A real CLI invocation against a temporary registered repository with no open directory records output and exit code 0 in the authoritative leaf's `implementation/cli-artifact.log`.
- C7: `bun test tests/status.test.ts`, `bun run format`, `bun run typecheck`, and `bun test` pass.

## Ordered execution checklist

1. A1: In `tests/status.test.ts`, add focused missing/empty-open scenarios using `fixture`, `register`, and `cli`. Check C1–C3, including no directory creation, no leaf-row regex match, and no empty-state message for a nonempty repository. Update the existing parked expectation to include the inserted line and retain repository ordering for C4. Extend unreadable coverage with malformed repository config and exact exit code 1 for C5, retaining current path assertions and healthy-repository visibility. Run the focused suite to demonstrate the new expectations fail on current output.
2. A2: In `src/status.ts`, implement D1 with a single empty branch paired with the existing table branch. Run the focused suite again and confirm C1–C5 pass.
3. A3: Run the real CLI from this worktree against an isolated fixture registered through `AKROGON_HOME`, with `issues/open` removed. Reuse `tests/helpers.ts` via a temporary invocation to create and clean the fixture. Capture the invoked entrypoint, missing-open setup, stdout, stderr, and actual exit code in `implementation/cli-artifact.log` under the authoritative leaf. Assert the expected two lines and exit 0 so artifact creation cannot hide a failed invocation. Remove temporary execution helpers after capture. This satisfies C6 without modifying real registration.
4. A4: Run `bun run format`, inspect the diff for unrelated formatting, then `bun run typecheck` and `bun test`. Confirm only the two owned source/test files and required implementation evidence changed. Record actual results in the implementation handoff for C7.

## Interfaces and dependencies

The existing `Scan` discriminated union and `statusCommand(slug: string | undefined): Promise<void>` remain unchanged. Tests invoke `cli(f, ['status'], f.home)` to exercise the real command outside the repository. No leaf dependency or operator prerequisite is required.

## Open limitation

The existing existence check and directory scan are separate filesystem operations. Concurrent removal or permission changes can still produce an unreadable result. This leaf does not change filesystem race handling or scan validation.
