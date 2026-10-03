# Round 5 map A

## Q10 test files
- Built-in path rule, no config: a path is a test file when a directory segment is `test`, `tests`, `__tests__`, `fixtures`, `__snapshots__`, or the file name matches `*.test.*`, `*.spec.*`, `*_test.*`. Covers every framework layout seen (hooks/tests, skills/*/test, test/fixtures/renderer-expectations, integrations/tests) and akrogon tests/.
- Old = exists at AKROGON_BASE (`git diff --name-only --diff-filter=MDR base...HEAD`), so new tests never need a reason.
- Per-repo config key: more parts; every repo must set it and a missing key needs a default, which is a fallback. Rejected unless a repo shows a layout the rule misses.

## Q11 where the reason lives
- Commit message trailer on the commit that changes the file: `Test-change: <path>: <cited outcome or source>`. The check reads `git log base..HEAD` trailers and matches paths. Lives on the branch with the change, works for A, B, merge and 8a commits, survives rebase, no issues-folder coupling.
- Pass file (report.md / review-B.md): merge has no pass file, and the check must read main-checkout files tied to the seat.

## Pitfalls
- Rebase at merge rewrites commits but keeps messages. Conflict resolution that edits a test needs its own trailer.
- Squash by the operator would merge trailers; fine since paths stay listed.
- Renames count as changed (R filter).
