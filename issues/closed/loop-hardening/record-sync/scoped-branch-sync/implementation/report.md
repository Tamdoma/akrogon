# Implementation report

Changed files and reasons: `src/sync.ts` now holds global then repo locks, rejects wrong/detached registered-checkout branches and unsafe staged paths, stages only eligible issue records, validates active coordination locks, and fetches/rebases with autostash before pushing. `tests/sync.test.ts` covers those behaviors with isolated real Git/CLI and lock contention scenarios. No other source/test files changed.

Tests run:

- Worker fail-first run of `AKROGON_BASE=8eebd88033301dfd7dbe943641d3028bf4b3a041 bun test --changed=8eebd88033301dfd7dbe943641d3028bf4b3a041`: 1 pass, 18 fail before implementation.
- Tracked-lock regression reproduced inode replacement during push: nonblocking flock acquired the replacement path. Revised lock acceptance failed first with 19 pass, 6 fail, then the same changed-test command passed 25 tests with 198 assertions.
- `bun run format`: exit 0, only the two owned files changed.
- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 84 pass, 0 fail, 1007 assertions across 9 files.
- `bun test tests/sync.test.ts`: exit 0, 25 pass, 0 fail, 198 assertions.
- `git diff --check`: exit 0.
- Separate real CLI scenario: exit 0. `cli-artifact.log` records the local bare remote branch listing and sync commit, containing only `issues/open/demo/record.md`. Assertions verified unrelated tracked/untracked contents remained intact and unstaged, with seeds and custom worktree files excluded. Temporary fixture was deleted.

Implementation decision: autostash can replace a tracked coordination lock inode. The revised brief therefore rejects active locks tracked locally, present in the fetched tree, or touched by commits to replay. Fetch and rebase are separate so the exact validated commit is integrated without fetching a changed remote tip. Ordinary excluded tracked files remain preserved. This correction stays within the two owned files and keeps shared lock interfaces unchanged.

Known limitations: autostash conflicts require manual recovery and stop before push. Tracked active coordination locks must be removed from Git tracking before sync can proceed. Locks coordinate akrogon commands, not arbitrary concurrent Git/file edits. Failed integration/push can leave a local sync commit. Sync documentation and init ignore rules remain owned by separate leaves as specified in the plan.

Unverified criteria: none.

Commit: `17048a06f95dfd332d2fd9ccacb91353aa2d0f29`. Working tree clean after commit.

## Repair round 1: F1

Before: `17048a06f95dfd332d2fd9ccacb91353aa2d0f29`.

Changed files and reasons: `src/sync.ts` now checks Git's ignored untracked paths against the exact incoming tree and local replay history before staging or rebasing. Literal ancestor checks protect both file/directory collision directions and embedded repositories. `tests/sync.test.ts` adds eight incoming/replay collision regressions and a harmless-ignored-file success case. Review A's cosmetic nits are unchanged to keep this repair focused.

Tests run:

- Changed-test fail-first: 26 pass, 6 fail. Incoming/replayed ignored collisions completed incorrectly before the repair.
- `AKROGON_BASE=8eebd88033301dfd7dbe943641d3028bf4b3a041 bun test --changed=8eebd88033301dfd7dbe943641d3028bf4b3a041`: exit 0, 34 pass, 0 fail, 260 assertions after repair, including additional embedded-repository cases.
- `bun run format`: exit 0, only owned files changed.
- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 93 pass, 0 fail, 1069 assertions across 9 files.
- `bun test tests/sync.test.ts`: exit 0, 34 pass, 0 fail, 260 assertions.
- `git diff --check`: exit 0.
- Separate real CLI collision scenario: expected refusal, ignored/tracked/untracked operator bytes preserved, local HEAD/index and remote HEAD unchanged. Evidence: `implementation/cli-repair-artifact.log`.
- Refreshed real CLI success scenario: exit 0, noncolliding ignored/tracked/untracked operator bytes preserved and only `issues/record` in the pushed sync commit. Evidence: `implementation/cli-artifact.log`. Both temporary repositories were removed.

Known limitations: prior plan R1–R3 remain. A colliding ignored file must be moved or otherwise resolved by the operator before sync. Incoming/replay collision checks are conservative and occur under the same existing locks. No recovery fallback, persistent Git setting, dependency or shared interface was added.

Unverified criteria: none. F1 is repaired and ready for A's recheck.

After: `2b9166bcbf2e72b8c2b40302ed92008dc7c6d20b`. Working tree clean after repair commit.

## Repair round 2: F2

Before: `2b9166bcbf2e72b8c2b40302ed92008dc7c6d20b`.

Changed files and reasons: `src/sync.ts` replaces the ignored × integrated nested scan with Sets of integrated paths and their ancestor directories, followed by ancestor walks for ignored paths. Work now scales with path counts and depth rather than their product. Tests and all other files remain unchanged. Exact, ancestor, descendant, literal-name and embedded-repository collision behavior is retained.

Tests run:

- `AKROGON_BASE=8eebd88033301dfd7dbe943641d3028bf4b3a041 bun test --changed=8eebd88033301dfd7dbe943641d3028bf4b3a041`: exit 0, 34 pass, 0 fail, 260 assertions. All existing collision tests pass unchanged.
- Independent performance/equivalence comparison using read-only registered-checkout path data and the replacement code extracted directly from src/sync.ts: 4114 ignored paths and 564 integrated paths, old scan 1873.52 ms, replacement 3.90 ms, identical results. This is a local measurement, not a timing assertion. Evidence: `implementation/performance-artifact.log`.
- `bun run format`: exit 0, only src/sync.ts changed.
- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 93 pass, 0 fail, 1069 assertions across 9 files.
- `git diff --check`: exit 0.
- Refreshed real CLI collision artifact: expected refusal with ignored/tracked/untracked operator bytes, local HEAD/index and remote HEAD preserved. Evidence: `implementation/cli-repair-artifact.log`.
- Refreshed real CLI success artifact: exit 0, operator bytes preserved and only `issues/record` in the pushed commit. Evidence: `implementation/cli-artifact.log`. Temporary fixture repositories were removed.

Known limitations: plan R1–R3 remain. No new dependencies, shared interfaces or recovery behavior. N1/N2 cosmetic nits remain outside this repair.

Unverified criteria: none. F2 is repaired for A's recheck.

After: `2b6a8444147b2f4c7d61ebae892e038eeb7fd57b`. Working tree clean after repair commit.
