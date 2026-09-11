# Review A: scoped-branch-sync

Base: 8eebd88033301dfd7dbe943641d3028bf4b3a041
Reviewed head: 17048a06f95dfd332d2fd9ccacb91353aa2d0f29
Diff: src/sync.ts, tests/sync.test.ts only (D1 holds). No debate artifacts, expected for `debate: no`.

## Verdict: nits

## Verification (rerun by A in the worktree)

- `bun test tests/sync.test.ts`: 25 pass, 0 fail, 198 assertions.
- `bun run typecheck`: exit 0.
- `bun run format`: exit 0, `git status --porcelain` empty afterwards.
- `bun test`: 84 pass, 0 fail, 1007 assertions, 9 files.
- `implementation/cli-artifact.log`: real CLI against a local bare remote, exit 0, remote sync commit contains only `issues/open/demo/record.md`, unrelated tracked/untracked files and seeds/custom worktree contents left unstaged.
- Probe: `git log --format= --name-only -z <incoming>..HEAD -- issues/.lock` on a throwaway repo emits clean NUL-separated paths, so the replay refusal fires on add and remove commits.

## Plan and brief criteria

- D2/criterion 4: global then repo lock wraps branch check through push (`src/sync.ts:9-10`). Test at `tests/sync.test.ts:231` proves both locks held during a gated push and a real `park` waits, then completes. Test at `:268` proves the global lock is held while waiting on a held repo lock. `locksFree` asserts release after success and after every refusal.
- D3/criterion 2: `symbolic-ref --quiet --short HEAD` with exit 1 as detached, other codes propagate CommandError; message names actual state and configured default branch. Tests cover side branch and detached HEAD with `trunk` as default branch and unchanged HEAD/remote HEAD/index.
- D3/criterion 1 pre-staged refusal: NUL-delimited, `--no-renames` cached diff; excludes outside `issues/`, seeds, any `.lock` basename, internal worktree root. Tests cover whitespace name, seeds, root and nested lock, worktree content, rename crossing boundary, all with snapshot equality.
- D3 active locks: tracked local lock, incoming tree, and replayed commits each refused before add/rebase, for both `issues/.lock` and an in-repo global lock path with glob characters. Tests cover 2x3 matrix with snapshot and byte preservation.
- D4/criterion 1 staging: `git add -A` with top-anchored literal pathspecs and a recursive `.lock` glob exclusion. Worktree root equal to repo stages nothing. Tests cover default, whitespace, glob-character, external and `.` roots, tracked excluded edits and deletions preserved, eligible deletion committed.
- D5/criterion 3: fetch, resolve `FETCH_HEAD^{commit}`, `rebase --autostash <commit>`, then `--diff-filter=U` check refuses push with paths and rebase output. Tests cover unchanged and advancing remote and the restoration-conflict case with remote unchanged and `stash:file` intact.
- Criterion 5: original divergent-remote scenario and no-op repeat preserved (`tests/sync.test.ts:7`). Fail-first counts recorded in the brief report (1/18, then 19/6 after brief revision).
- Tests use real Git, real CLI, real flock. The PATH `flock` shim only signals then execs the real binary; not a mock of the unit under test.
- Docs: REFERENCE.md has no sync pointer; `docs/files.html`/`docs/limits.html` staleness is owned by command-reference per plan. No lesson claimed.

## Nits

- N1 `tests/sync.test.ts:114`, `:341`: `toContain('autostash')` and `toContain('coordination lock')` assert error prose. The adjacent path assertions already identify the refusal, so these add wording brittleness without function. Nit, not fix: they do distinguish the failure path and pass today.
- N2 `src/sync.ts:47`, `:57`, `:74`: `split('\0').join('\n')` on NUL-terminated output leaves a trailing blank line in the message; the unmerged branch at `:104` already slices it off. Cosmetic.

No Fix findings. No repair requested.

# Re-check A after check.fix round 1

Prior reviewed head: 17048a06f95dfd332d2fd9ccacb91353aa2d0f29
Reviewed head: 2b9166bcbf2e72b8c2b40302ed92008dc7c6d20b
Repair diff: src/sync.ts (+24 ignored-collision preflight), tests/sync.test.ts (+8 collision refusals, +1 harmless-ignored success). Scope held.

## Verdict: fix

## Verification (rerun by A in the worktree)

- `bun test tests/sync.test.ts`: 34 pass, 0 fail, 260 assertions.
- `bun run typecheck`: exit 0. `bun run format`: exit 0, tree clean afterwards.
- `bun test`: 93 pass, 0 fail, 1069 assertions, 9 files.
- `implementation/cli-repair-artifact.log`: real CLI refusal on an ignored collision, operator bytes and local HEAD/index/remote HEAD preserved.
- B's F1 is closed: incoming-tree and replay-history paths are compared against `ls-files --others --ignored` entries in both ancestor directions, including embedded repositories; the harmless-ignored case still syncs and restores tracked autostash edits.

## Earlier findings

- N1, N2 unchanged by design of the repair brief. Still nits.

## New finding introduced by the repair

- F2 Fix `src/sync.ts:89-93`: the collision scan is O(ignored × integrated) with two `path.relative` calls per pair, and `integrated` is the whole incoming tree plus replay history, not a diff. It runs under both the global and repo locks on every sync. Measured on the registered akrogon checkout as of this review: 4114 ignored paths (node_modules) × 564 tracked paths took 1854 ms; a Set of tracked files plus a Set of their ancestor directories, walking each ignored path's ancestors with `dirname`, produced the same result in 3 ms. The ceiling grows with node_modules size and stalls every akrogon command waiting on the global lock. This is a concrete maintainability defect with no `ponytail:` ceiling marker, and the linear form is smaller than the quadratic one. Required repair: replace the nested `some`/`within` scan with the Set-based ancestor lookup, keeping the same collision semantics and existing tests; no new tests are required beyond the existing eight refusals and one success case passing.

# Re-check A after check.fix round 2

Prior reviewed head: 2b9166bcbf2e72b8c2b40302ed92008dc7c6d20b
Reviewed head: 2b6a8444147b2f4c7d61ebae892e038eeb7fd57b
Repair diff: src/sync.ts only, nested scan replaced by a Set of integrated paths plus a Set of their ancestor directories and an ancestor walk per ignored path. Tests unchanged.

## Verdict: nits

## Verification (rerun by A in the worktree)

- `bun test tests/sync.test.ts`: 34 pass, 0 fail, 260 assertions. All eight collision refusals and the harmless-ignored success still pass unchanged.
- `bun run typecheck`: exit 0. `bun run format`: exit 0, tree clean afterwards.
- `bun test`: 93 pass, 0 fail, 1069 assertions.
- `implementation/performance-artifact.log`: same registered-checkout inputs as F2 (4114 ignored, 564 integrated), old 1873 ms, new 3.9 ms, identical collision results. Matches A's own F2 measurement.
- Semantics read: `directories.has(absolute)` covers an ignored directory entry (including embedded repos, trailing slash removed by `resolve`) that is an ancestor of an integrated file; the ancestor walk from `absolute` covers exact matches and an integrated file that is an ancestor of the ignored path. Both loops terminate at `repo.root` because every path is resolved under it.

## Findings

- F2 confirmed repaired.
- F1 remains repaired; CLI artifacts refreshed.
- N1, N2 still open as nits.

No blocking finding introduced by the repair.

# Merge A

Rebased 2b6a844 (3 commits) onto origin/main 9dc1055a0a1ba3682335622d81f41873de966f11 without conflict; new head 35a20886b65463c0c7c6b0a30047f56a680d5e63. AKROGON_BASE refreshed to 9dc1055.

Checks after rebase, all in the worktree:

- `bun run format`: exit 0, tree clean afterwards.
- `bun run typecheck`: exit 0.
- `bun test`: 125 pass, 0 fail, 1220 assertions, 10 files.
- `test_changed` (`bun test --changed=9dc1055`): 34 pass, 0 fail, 260 assertions.

No advisory commands configured. No lesson recorded: N1 restates the existing wording-test rule and N2 is cosmetic.
