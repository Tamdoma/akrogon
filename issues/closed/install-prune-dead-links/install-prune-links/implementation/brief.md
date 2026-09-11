# 1. Goal
Implement plan D1–D6: reconcile skills across all four harness roots and prune only dangling links owned by this checkout.

# 2. Numbered acceptance criteria
C1–C5 in ../plan.md are the concrete acceptance criteria: four-root installation and repeatability, absolute/relative/nested stale link removal, foreign and real-entry preservation including sibling-prefix boundaries, conflict refusal before linking/herdr with pruning first, and unchanged integration/plugin calls. C6 requires B's final checks. Demonstrate a failing regression before production changes, then passing tests. Preserve a temporary HOME listing in .evidence/install-prune-links/.

# 3. Read-first list
Read ../plan.md, ../brief.md, ../design.md, docs/install.html, src/install.ts, src/config.ts, src/akrogon.ts, tests/helpers.ts, tests/fake-herdr.ts, tests/park.test.ts (fixture pattern), package.json, .gitignore, and /home/ivan/.codex/skills/implement-issue/ponytail.md. Repository paths refer to the worktree. Do not reread lessons for implementation.

# 4. Change list and needed interfaces
src/install.ts: shared four-root list, stdlib prune before conflicts, unchanged install(): Promise<void> and later calls.
tests/fake-herdr.ts: only schema-validated integration install and plugin link cases using existing logging/result.
tests/install.test.ts: existing fixture()/cli() child environment with HOME, PATH, FAKE_HERDR, and AKROGON_HOME provided by cli. Derive current skills from checkout. Real files and processes, fake herdr boundary.

# 5. Do-not, reasons and exceptions
Do not install into real HOME, invoke real herdr, alter checkout skills, change config/public interfaces, edit docs, refactor helpers, or commit lifecycle artifacts. These keep the test isolated and the diff within the saved plan; only the planned minimal fake-herdr support is an additional supporting surface. Return a mismatch with evidence rather than expanding scope; a revised brief from B is the only exception. These exclusions preserve isolation and scope, with exceptions requiring that revised brief.

# 6. Ordered steps
1. Derive tests from C1–C5 in tests/install.test.ts and add necessary fake-herdr handling. Run the changed-test command and preserve red evidence demonstrating the old installer defect.
2. Implement D1–D3 in src/install.ts, then rerun the changed-test command to green and inspect evidence.
3. Fill the report below with actual outcomes and return. Do not commit or change phase; B owns final checks and handoff.
One verifiable unit, approximately three files and eight turns. Return a mismatch if substantially more scope is necessary.

# 7. Commands
Run only this test command (before and after production changes):
```sh
AKROGON_BASE=13f92e0376d8b0a59ac7f9e61276e9667b0b2bf0 bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
```
B runs full tests, format and typecheck separately.

# 8. Done-when, evidence and report
C1–C5 pass through real CLI invocations with isolated HOME and fake herdr. Record regression failure, passing changed-test output, and the filesystem-listing artifact path. Clean temporary fixture directories. Leave no implementation helpers beyond the requested tests. Report limitations and unverified criteria explicitly.

Changed files and reasons: `src/install.ts` shares the four harness roots between linking and pruning, and removes only dangling links with normalized targets below this checkout's skills directory before the unchanged conflict check. `tests/fake-herdr.ts` accepts only the two additional schema-validated install command shapes. `tests/install.test.ts` adds 15 real CLI tests with isolated HOME, fake herdr, repeat installation, absolute/relative/nested stale targets, preserved foreign and real entries, all three conflict types in all four roots, and executable conflict coverage.

Tests run: Ran the exact section 7 changed-test command before production changes: exit 1, 1 pass, 14 fail, 46 assertions. The old installer omitted Codex/pi links, retained stale owned links, and accepted conflicts in the omitted roots. Full red output is `.evidence/install-prune-links/red.txt`. Ran the same command after production changes: exit 0, 15 pass, 0 fail, 307 assertions, 1 file, 790 ms. The success test saved `.evidence/install-prune-links/home-listing.json`, containing all four temporary roots, entry types, raw targets, and resolution results, and verified the temporary HOME was removed afterward. All fixtures clean up in finally blocks.

Known limitations: R1 pruning is not transactional and remains applied if a later conflict or herdr call fails. R2 ownership is lexical normalized target prefix, with no recursive cleanup or realpath-based ownership expansion. R3 existing reinstall documentation is unchanged and remains outside this scope. No implementation helpers or temporary HOME directories remain, and B committed the implementation as `391bdf9`.

Unverified criteria: none. B completed C6: `bun test tests/install.test.ts` passed (15 tests, 307 assertions), `bun test` passed (60 tests across 9 files, 815 assertions), `bun run typecheck` and `bun run format` exited 0, and staged diff whitespace checks passed. Formatter changed only the new test file. B inspected the listing: all four roots contain the eight current skill links plus the preserved test entries. Final commit: `391bdf9`.
