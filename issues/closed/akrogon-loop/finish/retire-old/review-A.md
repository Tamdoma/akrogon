# Review A: retire-old

Base: a40ff4dbcf1811cb44ceeb35945bdecee17bcc95
Reviewed head: 795ed526f8747416d31ee0daa0a964d83561c951
Debate: no, so no positions or rebuttal input.

## Verification

- C1: `git diff -M --name-status` shows exactly 19 `R100` renames from reference/lessons to learnings/history, matching the 19 files in the base tree. Both reference/ and new-beginning/ are absent. skills/ holds exactly the eight expected folders. No pre-existing history file appears in the diff.
- C2: grep for reference/lessons, reference/akrogon and new-beginning across README, REFERENCE.md, skills, LESSONS.md, docs and open leaves finds only record text: locked design.md files, prior plan/review records, ISSUE.md contract wording and KICKOFF.md:23. No actionable link resolves into a deleted tree. Skills required no repair.
- C3: REFERENCE.md links src/, tests/, skills/, plugin/, docs/, issues/, learnings/, all present. LESSONS.md diff adds one explanatory sentence under the heading and changes no active line.
- C4: issues/config.yaml diff adds grounding.index: REFERENCE.md and a guarded test_changed, preserving other choices. verification/config.txt shows grounding.index: REFERENCE.md and no worktree registration. `bun test --help` confirms `--changed` exists in Bun 1.4.0, so the generated command differs from the init skill's example for a verified reason.
- C5: README interfaces compared against src/akrogon.ts, src/install.ts, src/init.ts and src/config.ts: verb list, --from, --toolkit <lang>=<runner>, --slot/--verdict, next target-or---all, pull --all, status [slug], AKROGON_HOME, ~/.local/bin, ~/.claude/skills, ~/.agents/skills, herdr integration install and plugin link, issues/open and learnings scaffold, .gitignore entries. All accurate. All README and index links resolve.
- C6: verification/checks.json records exit 0 for format, typecheck, test (46 tests, 487 assertions) and test_changed with the real base. Formatting changed no files. Evidence was complete, so checks were not rerun.

## Findings

None blocking. No source changes, no new tests asserting wording, no manufactured lifecycle evidence.

Nit N1: `git merge-base HEAD main` is now f281241, ahead of the recorded base a40ff4d. This is not a defect in the diff. Merge will rebase and refresh AKROGON_BASE as the config contract requires.

## Verdict

ready

## Merge

Fetched origin; origin/main at a40ff4d equals the recorded base, so rebase was a no-op and head stays 795ed52. AKROGON_BASE refreshed from akrogon config: a40ff4d. Checks run in the worktree after rebase: format exit 0 (no files changed), typecheck exit 0, test exit 0 (46 tests, 487 assertions), test_changed exit 0 (no affected test files). Nit N1 resolved: the stale comparison was against a local main branch, not origin/main. Not reusable, no lesson recorded.
