# Brief: main-step-rules

## What
Text rules in the chart-issues and init-akrogon skills, plus the matching chart guide paragraph. No command code changes.

1. chart-issues: a step on main that a taken chart decision needs (for example a line in `issues/config.yaml`) is never recorded under Off route. When its precondition exists, the door makes it during the pass and verifies the effective result (for config, through `akrogon config` at the registered root).
2. chart-issues: when such an edit can only follow a leaf's merge, the chart's GitHub identity is withheld from the `sources` of every leaf whose completion could close it, stated as an explicit exception to the one-completion-owner rule. The identity stays open and mirrored by `akrogon pull`; the door later makes and verifies the edit and runs `akrogon close <id> --by <text>` naming what delivered it.
3. chart-issues: for an unsourced chart, CHART.md records each waiting edit as a pending operator step with the exact edit, owner, prerequisite leaf and the check that proves it done.
4. init-akrogon: proposes each check as a repo-owned entry point (a package script, or a repo file run by its native tool) when one exists, otherwise the runner command it would propose today. Existing stored entries are not migrated, and the generated setup/flock/run-check wrapping stays.
5. init-akrogon: a verified `test_changed` is a real run against a base with changes in which a changed test was seen to be selected and run, or the full existing test suite ran. A clean exit alone does not count. The base may be read inside the entry-point script.

Owned text: skills/chart-issues/SKILL.md (the source-close paragraph at :35 and any Handoff line the rule needs), skills/chart-issues/assets/shapes.md (Off route section :35-36, the fork-rules sentence about Off route at :92, the completion-owner rules at :276-280, the `issues/` refusal at :284), skills/init-akrogon/SKILL.md (Tests and grounding :47-55 and the verification sentence at :82), docs/guide/chart.md (the Off route paragraph at :128).

## Why
Tamdoma/akrogon#87. The framework verify-gate chart chose a changed-tests selector, put the config switch under Off route as "an operator step on main", and its leaf built the selector and closed framework #115. The config kept a stub for 9 days, so framework leaf backlink-run-identity found two broken tests only at merge (about 35 min lost). Off route means excluded from the outcome (shapes.md:35), so nothing carried the step. init-akrogon accepted the stub as "verified" because it exited 0 (init-akrogon SKILL.md:47, :82). The framework switch itself was made by the door on 2026-10-12 in framework's registered root, which is where akrogon reads config (src/config.ts:215); it reaches framework's origin with the operator's next `akrogon sync` there. It is not part of this leaf. (A,B)

## Done-criteria
1. skills/chart-issues (SKILL.md or assets/shapes.md) states that a step on main a taken decision needs is never recorded under Off route, and that the door makes and verifies it during the pass when its precondition exists.
2. skills/chart-issues states that when such an edit can only follow a leaf's merge, the GitHub identity is withheld from the sources of every leaf whose completion could close it, as an explicit exception to the completion-owner rule in shapes.md, and that the door later makes and verifies the edit and closes the identity with `akrogon close`.
3. skills/chart-issues states that an unsourced chart records each waiting edit in CHART.md as a pending operator step with exact edit, owner, prerequisite leaf and check.
4. skills/init-akrogon/SKILL.md proposes checks as repo-owned entry points when one exists, otherwise the runner command, and states that existing stored entries are not migrated.
5. skills/init-akrogon/SKILL.md defines a verified `test_changed` as a real run against a base with changes where a changed test was seen to run, or the full existing suite ran, and says a clean exit alone does not count.
6. docs/guide/chart.md's Off route paragraph matches criteria 1 to 3.
7. No command code, test, new issue kind, new state or readiness field, seed-issue reminder or change to when `checks` and `merge_checks` run appears in the diff.
