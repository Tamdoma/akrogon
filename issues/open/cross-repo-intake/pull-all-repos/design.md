# Design: pull-all-repos

## Binding decisions, verbatim
From issues/chart/cross-repo-intake/CHART.md, Off route, 2026-09-28:
- `pull --all` scope is not a fork: #38 expected behavior and the recorded contract (`issues/closed/akrogon-loop/github/pull-close/plan.md:18`) both require every registered repo. Making only `plugin/pull.sh` cd out of the repo was withdrawn because `--all` would stay cwd-dependent.
- Changes to completion closure, `next --all`, seed-issue routing or pi-extensions#5 (already closed).

From Tamdoma/akrogon#38, Expected behavior: "`akrogon pull --all` refreshes every registered repo."

Excluded here: issues/chart/cross-repo-intake/forks/destination-intake.md Q1-A, Q2-A and Q3-A govern the chart-issues door and belong to leaf chart-destination-intake.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md, interpreted: no auth, secrets or backend state are changed. No vanity tests: pull tests run the real CLI on real temporary git repos with the existing fake gh boundary, never a mocked repo resolver. Negative and edge cases are mandatory: a linked-worktree caller, an unregistered caller, and a failing repo during an in-repo `--all`. The user-visible flow is the CLI run by the herdr startup hook, so done-criterion 5 is a real invocation from `plugin/` with a retained output file.

## Leaf architecture
Owned: src/pull.ts (`pullCommand`), tests/pull.test.ts, README.md (the `akrogon pull [--all]` row and the pull sentence at :153).
Interface: unchanged CLI `akrogon pull [--all]`. `--all` iterates `global.repos` in config order, calls `pullRepo` for each inside the existing per-repo failure boundary, and throws the existing `AggregateError` naming failed repos. Without `--all`, `requireRepo(global, process.cwd())` then `pullRepo`.
Exclusions: plugin/ files, `currentRepo` in src/config.ts (still used by config, next and status), `next --all` and its README sentence, `pullRepo`, `closeSource`, the chart-issues skill.
Dependencies: none.
