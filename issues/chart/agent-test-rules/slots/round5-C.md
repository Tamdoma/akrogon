# Round 5, slot C: test-change check (Q10, Q11)

## Diagnosis
- F1. The check has a natural home. `akrogon phase` already runs two git guards on the worktree before a move: `requireClean` and `requireNoIssueFiles` (`src/phase.ts:210-212`), the second using `git diff --name-only <target>...HEAD` (`src/phase.ts:266-271`). The new check is one more function of the same shape. Three-dot diff equals the merge base that `AKROGON_BASE` holds (`src/config.ts:148-150`), so "old" needs no stored state.
- F2. Repo config has no place for test paths today. `repoSchema` is a strict object with `checks`, `merge_checks`, `advisory` and no path key (`src/config.ts:28-49`). A config key means ten `akrogon.yaml` edits and a failure mode where a missing key silently checks nothing.
- F3. One built-in rule covers every registered repo. I ran this rule over `git ls-files` (minus `issues/`) in all ten repos: a path segment named `test`, `tests`, `__tests__`, `fixture`, `fixtures`, `__fixtures__`, `__snapshots__`, `e2e`, `spec`, `specs`, `testdata`, `golden`, `goldens`, or a file ending `.test.*`, `.spec.*`, `.snap`. Matches: akrogon 33 of 180, framework 4381 of 7003, pi-extensions 31 of 122, lens 72 of 240, clinique-la-roya 3159 of 5907. It catches every framework layout in the fork carries. The only test-looking paths it missed were `boulevard-automation/prototype/test-results/**` (generated Playwright output) and non-test `mockups` folders.
- F4. Pass files are the wrong carrier. They differ by seat and phase (`implementation/report.md`, `review-B.md`), they live in the main checkout and not on the branch (`src/phase.ts:266-271`), and the check would need a phase-to-file table. The fork carry "merge writes no pass file" is not quite right: merge records in `review-B.md` (`skills/merge-issue/SKILL.md:37,41`). That does not change the conclusion.
- F5. 8a already puts the reason in the commit: "fixes that one expectation in its own commit with the reason" (forks/bad-base-test.md). check.repair already requires one commit per Fix (`skills/check-issue/SKILL.md:75`). No commit in recent history uses a trailer yet (`git log --format='%(trailers)' -8` is empty), so this is a new convention.
- F6. The merge seat pushes before it runs `akrogon phase <slug> merged` (`skills/merge-issue/SKILL.md:47,51`). A check on the `merged` move fires after the code is on the default branch.

## Q10. Which files count as tests
- 10a (recommended). One built-in path rule in akrogon source (F3), applied as git pathspecs to `git diff --no-renames --name-only --diff-filter=MD <target>...HEAD`. "Old" means status M or D in that diff. `--no-renames` makes a renamed test show as a deletion, so a move also needs a source. No config key.
- 10b. Per-repo `test_paths` key in `akrogon.yaml`, required, no default. Exact per repo, but ten edits now, one more for each new repo, and init-akrogon must learn to propose it.
- 10c. Built-in rule plus a per-repo override key. This is the stacked fallback the intake rules out.
- Why 10a: over-matching costs one cited line, under-matching lets an expectation change through unseen. A broad rule fails in the cheap direction. A gap in the rule is fixed once in source for all repos.

## Q11. Where the cited source lives
- 11a (recommended). A commit trailer on any commit in `<target>..HEAD`: `Test-Change: <path> <source>`. The check reads `git log --format='%(trailers:key=Test-Change,valueonly)' <target>..HEAD` and requires, for each changed old test file, one trailer whose path equals the file or is a parent folder of it, followed by non-empty text. Presence only. B judges the source.
  - Same place for every seat, phase, harness and write path. No phase-to-file table.
  - It travels with the commit through rebase, and it stays in history where the next leaf and the operator can read why an expectation changed.
  - The folder form keeps a recorder run that rewrites 300 fixtures to one line.
  - A refused seat adds the trailer with a new commit (`--allow-empty` is enough). No history rewrite is needed.
- 11b. A fixed section in the seat's pass file. No new convention for commits, but needs the phase-to-file table, sits outside git history, and merge conflict edits land in a file written for review.
- 11c. A new file `test-changes.md` in the leaf folder. One location, but one more artifact per leaf, and it is separated from the commit that made the change.

## How merge and 8a fit under 10a + 11a
- 8a: the fixing leaf carries the trailer on its fix commit. Other leaves receive the fix by rebase. After rebase the fix is in their base, so it is not in their `<target>...HEAD` diff and needs nothing from them.
- Rebase: commit messages survive, so trailers survive. The diff is recomputed against the new base. No stored base to refresh.
- Conflict resolution in an old test file changes an existing commit whose message may hold no trailer. The merge seat adds one trailer commit before running checks (`skills/merge-issue/SKILL.md:41` already makes it record the range-diff there).
- Where it runs: on every move that `requireNoIssueFiles` guards today (out of implement, check.fix, check.repair, check.review). For merge it must run before the push (F6). Smallest shape: the merge skill runs the same check as one command before `git push`. Which existing verb should carry it is unverified (`src/preflight.ts` exists, I did not read it).

## Pitfalls
- P1. A seat can write a meaningless source ("updated"). The check passes by design. B's review must list the trailers and judge each, or the check is decoration. This is one line in check-issue.
- P2. Squash or `git commit --amend` without `-C` can drop trailers. The check then refuses, which is the safe direction.
- P3. Paths with spaces break a "first token is the path" read. Compare each changed file against the trailer text by prefix instead of splitting on whitespace.
- P4. Framework is 63% "test" paths by the rule (fixtures under `.claude/skills/**`). Leaves there will cite often. The folder form limits the cost. If it still proves noisy, narrow the built-in rule, do not add a config key.
- P5. A new test file added in this leaf and then edited is status A, never M, so it is free. A file added by an earlier leaf is old. That is the intended line.
- P6. Tracked generated output such as `boulevard-automation/prototype/test-results/**` is outside the rule. It should not be tracked. Not this chart's work.
- P7. The check sees only committed changes. `requireClean` already runs first on these moves (`src/phase.ts:210-211`), so there is no uncommitted gap, except in the `failed`/`blocked` case that skips it.
