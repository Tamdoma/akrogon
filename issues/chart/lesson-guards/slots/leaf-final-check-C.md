# Final-shape check, slot C

Two blocking items remain, both introduced by the corrections. Everything from leaf-review-C.md F1 to F8 is otherwise addressed.

## N1. Corrected owner test misroutes consumer reports on shared paths

seed-owner-routing/brief.md:5 and design.md:46 now route a report to akrogon when the named file "exists relative to the akrogon root". `git ls-files` of framework and akrogon share 11 paths (verified 2026-10-10): `learnings/LESSONS.md`, `package.json`, `README.md`, `bunfig.toml`, `bun.lock`, `.gitattributes`, `.gitignore`, `docs/reference-index.md`, `issues/config.yaml`, `issues/log.jsonl`, `issues/closed/charting-vocabulary/ISSUE.md`. A framework seat's lesson-triggered seed about `learnings/LESSONS.md` or `package.json` therefore posts to Tamdoma/akrogon. Criterion 1 (brief.md:16) and criterion 5 (brief.md:20) do not contain such a case, so the fresh-agent run would pass while the rule misroutes. Fix: a path that exists relative to the current consumer root routes as today; only a path absent there is tested against the akrogon root (exists there, or resolves under it after `readlink -f`). Add the shared-path case to criteria 1 and 5.

## N2. Criteria now name test files

shapes.md Preflight: the audit "refuses a criterion naming a test file, assertion or test count". The corrections put test files into criterion 6 of every leaf: seed-owner-routing/brief.md:21 and lesson-write-rule/brief.md:22 (`tests/docs-links.test.ts`), guard-retires-lesson/brief.md:23 (`tests/docs-links.test.ts`, `bun test tests/batch.test.ts tests/batch-merge.test.ts tests/phase.test.ts`). The prior drafts' `bun test` was the configured `checks` command (`akrogon config` checks.test), which the audit allows. Replace the file names with the observable results (links resolve, the merge path behaves per criterion 2) and leave proof selection to the configured checks and the design.
