# Implementation report: tree-preflight

## Changes

Implemented plan D1–D7 through three sequential workers, then reviewed and verified the combined diff.

- `src/state.ts` shares area-relative depth validation across discovery and supplies parked missing messages without parsing dormant state. `src/park.ts`, `src/phase.ts`, and `src/pull.ts` pass explicit area roots through their existing subtree calls.
- `src/next.ts` validates discovery and selects ordinary slug/path targets before acquiring locks, while retaining repo-locked rediscovery and isolated error handling. `src/status.ts` uses the same validator and reports the offending state path.
- `skills/chart-issues/assets/shapes.md` and `skills/chart-issues/SKILL.md` reject closed top-level owner collisions before handoff writes.
- `tests/state.test.ts`, `tests/next.test.ts`, and `tests/status.test.ts` cover invalid and supported depths, no-lock rejection, healthy mixed-tree dispatch, parked hints and precedence, and read-only status behavior. `tests/helpers.ts` adds opt-in native subprocess timeouts with signal failure reporting and child reaping.

## Verification

C1–C4 pass. The real CLI tests prove invalid open/closed depth 0/1/4 targets fail for slug and path selection without invoking a recording flock executable. Mixed all/path/hook scenarios retain healthy dispatch and do not clean up invalid merged leaves. Both parked tree shapes, malformed dormant state, absent and owner-only misses, active/closed precedence, and status isolation are covered.

C5 passed manual evaluation against runtime owner semantics: standalone, epic, and empty closed-owner collisions block; absent destinations pass; a matching nested issue under another owner does not itself conflict. Both instruction paragraphs name the conflicting destination before writes.

C6 passes. All 29 authoritative open/closed records load with the changed code. Formatting changed only intended files. No dependencies or adjacent documentation changed.

| Command | Result | Evidence |
| --- | --- | --- |
| Configured `bun test --changed` with `AKROGON_BASE=a6b53fdceca8e54b7618f59cffd0beb53c2d882b` | Final worker run: 161 pass, 0 fail, exit 0 | `worker-3-green.txt` |
| `bun run format` | Exit 0 | `format.txt` |
| `bun run typecheck` | Exit 0 | `typecheck.txt` |
| `bun test tests/next.test.ts tests/status.test.ts tests/park.test.ts tests/phase.test.ts tests/pull.test.ts` | 89 pass, 0 fail, exit 0 | `../verification-tree-preflight.txt` |
| Worktree `allLeaves(readRepo("akrogon", "/home/ivan/Work/infra/akrogon"))` | 29 records, exit 0 | `../verification-tree-preflight.txt` |
| `bun test` | 166 pass, 0 fail, exit 0 | `full-test.txt` |
| `git diff --check` | Exit 0 | Inspected before commit |

Fail-first evidence: worker 1 recorded eight intended failing assertions before shared code, then 76 passing changed tests. Worker 2 recorded 13 intended behavior failures plus two Bun source-excerpt assertion errors before integration. After repairing the assertions to inspect actual error lines, 161 changed tests passed. Complete evidence and worker reports are beside this report. The end-to-end artifact includes actual invalid-depth JSON diagnostics and parked message lines, not only test names.

## Limitations and unverified criteria

R1–R3 remain: chart collision detection is an agent preflight and runtime completion still rejects bypassed/concurrent collisions; filesystem changes after the unlocked preflight require the retained locked rediscovery; traversal stops at state-bearing leaves. Parked hints identify supported leaf folders by folder name and state-file existence without parsing dormant state.

Unverified criteria: none. No production dispatch, Herdr interaction, GitHub writes, or issue artifacts on the leaf branch were used for verification.

Commit: `0e63cba4095b27d14ba5787c1b989061e0016781`. `git status --porcelain` is empty. The commit is ahead of the configured base and contains no files under `issues/`.

## Repair 1: merge rebase conflicts

Review A's merge attempt stopped while replaying the reviewed commit onto `a4f0b5d88080026860be4837f97f6a89a7c52a1c`. The reviewed pre-rebase head is `0e63cba4095b27d14ba5787c1b989061e0016781`. This base is the integration comparison baseline for the repaired review.

Resolved the six reported conflict paths without removing either test group. Next/status retain upstream repository identity errors and failure observations alongside depth checks and parked messages. Completion retains upstream source closure before owner movement, with explicit open-area context for its current subtree scans. Pull matches upstream because its obsolete leaf scan was removed there. Next --all keeps the completion sweep before cleanup and skips cleanup of open leaves.

The changed-test command failed on the original conflicted tree (75 pass, 24 fail, 2 parser errors, exit 1) and passed after resolution (176 pass, 0 fail, exit 0). Evidence: `repair-1-red.txt` and `repair-1-green.txt`. These are integration failures, not a new behavioral bug requiring a new test. The existing tests from both branches remain intact. Formatting and typecheck passed, and the integrated discovery loaded all 29 authoritative records. Evidence: `repair-1-format.txt`, `repair-1-typecheck.txt`, and `repair-1-inventory.txt`.

Final full suite: 181 pass, 0 fail, exit 0 in `repair-1-full-test.txt`. This is the current end-to-end artifact and includes real CLI depth, parked, source-closure and identity scenarios. Rebase completed successfully. Repaired head: `f8c7e2f261994ec1030accfd5b681c70491cf833`, based on `a4f0b5d88080026860be4837f97f6a89a7c52a1c`. Range-diff against the original reviewed patch confirms only the required upstream adaptations. The leaf branch is clean, no unmerged paths remain, and no issue artifacts are in the branch diff. All R-C1–R-C4 criteria are verified. Plan limitations R1–R3 remain unchanged.

## Repair 2: state test add/add conflict

Merge attempt 2 rebased reviewed head `f8c7e2f261994ec1030accfd5b681c70491cf833` onto `f3b25f55c302cc00aeee4896d5e595b0cd35a807`, whose legacy-state migration change independently added tests/state.test.ts. The only conflict is that test file. Its resolution must retain both groups of test bodies and combine imports. Automatic production/docs merges were inspected: upstream priority/slot removal and lazy read migration remain intact alongside tree-preflight behavior.

Resolved tests/state.test.ts by combining imports and retaining both complete test groups unchanged. Changed tests: 163 pass and one conflict parse failure before resolution, then 190 pass, 0 fail. Evidence: repair-2-red.txt and repair-2-green.txt. Final format/typecheck passed; full suite passed 195 tests with 0 failures; authoritative inventory loaded all 29 records. Evidence: repair-2-format.txt, repair-2-typecheck.txt, repair-2-full-test.txt (current real-CLI end-to-end artifact), and repair-2-inventory.txt.

Rebase completed at `6b6c9ee181c7e64aface49dd0cef3415191ade17` on `f3b25f55c302cc00aeee4896d5e595b0cd35a807`. Range-diff against the previously reviewed patch shows only the combined state-test file/imports and upstream context changes. The leaf branch is clean and contains no issues/ artifacts. R2-C1–R2-C3 are verified. Plan limitations R1–R3 remain unchanged.

## Repair 3: next target-selection conflict

Merge attempt 3 rebases reviewed head `6b6c9ee181c7e64aface49dd0cef3415191ade17` onto `7be71885565323b89f666098748dcb127fdd84bf`. B performed this final repair round directly. The conflicted changed-test run failed with 129 pass and 76 fail because next.ts could not parse (`repair-3-red.txt`).

Resolved only src/next.ts: retained the previously reviewed control flow and moved upstream's existing non-directory target rejection into selectLeaves immediately after folder resolution. Diff against the prior reviewed next.ts is precisely that two-line check. Upstream regular-file/symlink tests, valid folder/worktree tests and Herdr diagnostic tests remain alongside all tree-preflight tests. Automatic merge inspection confirms committed-log-error reporting and source-closure behavior are retained. No scope or test weakening was needed.

Changed tests and full suite each passed 205 tests with 0 failures. Format and typecheck passed, and all 29 authoritative records loaded. Evidence: repair-3-green.txt, repair-3-full-test.txt (current real-CLI end-to-end artifact), repair-3-format.txt, repair-3-typecheck.txt and repair-3-inventory.txt.

Rebase completed at `21c2f3d1f908a3184b836931c9bc946f14394b5b` on `7be71885565323b89f666098748dcb127fdd84bf`. Range-diff confirms the sole adaptation to the previously reviewed patch is moving upstream file-target validation into selectLeaves. The leaf branch is clean and contains no issues/ artifacts. All R3-C1–R3-C3 criteria are verified. Plan limitations R1–R3 remain unchanged.
