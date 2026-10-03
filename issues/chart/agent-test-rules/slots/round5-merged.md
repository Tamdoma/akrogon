# Round 5 merged (Q10, Q11)

## Q10 test files
- Built-in path rule in akrogon source, no config (A,C). C ran it over all ten repos: segments test, tests, __tests__, fixture(s), __fixtures__, __snapshots__, e2e, spec(s), testdata, golden(s), or files *.test.*, *.spec.*, *.snap. Catches every framework layout; misses only boulevard prototype/test-results (generated output). Over-matching costs a cited line; under-matching lets a change through, so broad fails cheap (C).
- B: per-repo `test_paths` pathspec key, required, no default, populated in all ten repos before enforcement. Covers irregular layouts and avoids catching generated artifacts.
- Detection (A,B,C): `git diff --no-renames --name-status <target>...HEAD` limited to test paths; old = M or D (rename counts as delete), new files free.

## Q11 where the reason lives
- Commit trailer on a commit in <target>..HEAD (A,B,C). Same place for every seat, phase, harness and write path; survives rebase; 8a fix commit carries its own.
- Format differs: C `Test-Change: <path-or-folder> <source>` matched by prefix, folder form for recorder runs. B `Test-Source:` JSON {path, source, reason} parsed with git interpret-trailers. A `Test-change: <path>: <source>`.
- A refused seat adds an empty commit with the trailer (C).

## Merge timing (B,C)
- merge-issue pushes at :47 before `akrogon phase merged` at :51, so a check on the merged move fires after code is on main. Needs the same validator before push. B: a read-only validation mode (does not exist, src/akrogon.ts:13-14). C: one command in merge-issue before git push, verb unverified.

## Corrections
- Merge does record in review-B.md (merge-issue:37,41); fork carry was wrong (B,C).
