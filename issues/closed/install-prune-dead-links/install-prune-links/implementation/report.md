# Implementation report

Commit: `391bdf9` (base `13f92e0376d8b0a59ac7f9e61276e9667b0b2bf0`).

Changed files and reasons: `src/install.ts` now links all four harness roots and prunes only dangling owned symlinks before its unchanged conflict check. `tests/fake-herdr.ts` adds the required install command cases. `tests/install.test.ts` supplies 15 isolated CLI regression scenarios. No production interfaces or documentation were changed.

Tests run: Changed tests first failed (14 failures, 1 pass), then passed (15 tests, 307 assertions). B ran the focused suite (15 pass), full suite (60 pass, 815 assertions), typecheck, formatter, and diff whitespace checks, all successfully. No full-suite repair was needed.

Evidence directory: `/home/ivan/Work/infra/akrogon/issues/worktrees/install-prune-links/.evidence/install-prune-links/`. Files: `red.txt`, `focused-tests.txt`, `full-tests.txt`, `typecheck.txt`, `format.txt`, and `home-listing.json`. The listing contains all four temporary roots and eight resolving current-skill links per root, along with the preserved foreign links and real entries. Temporary HOME directories were cleaned.

Known limitations: R1 pruning remains applied if later conflict checking or herdr commands fail. R2 ownership uses normalized lexical target prefixes. R3 the existing documentation claims no reinstall is needed after updates, but added/deleted skill folders require install to reconcile links; documentation was excluded by the plan.

Unverified criteria: none. C1–C6 verified. Ready for independent review.
