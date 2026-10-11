# Review A: cheap-check-placement

Base `c53f619` · Reviewed head `cbd5640` (one commit, 3 files, +3/−3). Worktree clean; no leftover worker worktrees; no `issues/` paths on the branch.

## Verified against criteria

1. `init-akrogon:20` — inspects scripts behind each proposed merge command, places cheap checks in `checks` naming an existing group command, merge command may rerun but is never their only home. Met, verbatim intent of D2.
2. `setup.md:54` — "a cheap check never runs only at merge, even when a merge command also runs it". Met; the `check.fix` replay clause untouched.
3. `check-issue:43` — Fix when a script edit within the leaf routes the check through a `checks` command, else `Operator actions` naming the config line, which gates no done-criterion. Met per D4; consistent with the operator-only rule (operator action gates none → verdict decided by other findings) and design C F5 (a leaf can never end with an unrepairable Fix since a leaf never changes `issues/config.yaml`).
4. No edited line claims akrogon code enforces placement; the 30-line sweep classification in `implementation/report.md` is accurate — I re-ran `grep -rniE "merge_checks|merge check|only at merge" skills/ docs/` and all non-edited hits describe merge mechanics only. Met.

## Checks

- `checks.test` green (792 pass) on the leaf head per report; diff is prose in files the suite does not import, and `docs-links`/`red-docs` literal contracts are untouched, so no rerun on my own count.
- `bun test --changed=$AKROGON_BASE`: no test files affected, exit 0.

## Findings

None. Judged against the plan's decisions and checklist, the design's foreclosed options (no config key, timer, flag, string-matching, or mechanical gate introduced) and exclusions (no framework config, no repo audit). No Nit worth a lesson line: the check.review sentence sits inside a behavior-surface paragraph rather than alone — readable, causes no wrong behavior today.

## Verdict

ready
