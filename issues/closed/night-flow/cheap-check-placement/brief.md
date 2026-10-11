# Brief: cheap-check-placement

## What
akrogon states one rule wherever a repo's checks are set or changed: every blocking check cheap enough for the leaf's own check runs in `checks`, before review, including a cheap check inside a larger merge command. A merge command may also rerun cheap checks on the integrated candidate. It is never the only place they run. (A,B)

- `skills/init-akrogon/SKILL.md` (today `:16-20`): when proposing `checks` and `merge_checks`, setup inspects the scripts each proposed merge command runs and places their cheap checks (typecheck, lint, validators and the like) in `checks`, naming an existing cheap group command when the repo has one.
- `docs/guide/setup.md` (the `merge_checks` line, today `:54`): a cheap check never runs only at merge, even when a merge command also runs it.
- `skills/check-issue/SKILL.md` (`check.review`): when a leaf's diff changes a script that a `merge_checks` command runs and leaves a cheap check reachable only at merge, it is a Fix when a script edit within the leaf can route that check through a command `checks` already runs. Otherwise B records an `Operator actions` item naming the config line to add, which gates no done-criterion. (A,C)

Agents follow this rule. No akrogon code, config key, timer or slow flag enforces it.

Owned: `skills/init-akrogon/SKILL.md` (the propose paragraph), `docs/guide/setup.md` (the `merge_checks` line), `skills/check-issue/SKILL.md` (one `check.review` sentence).

## Why
framework, 2026-10-11: formspark-build-wiring passed its own check (parity, contracts, 3540 selftest tests), was reviewed, then was ejected at merge for one typecheck error and two lint errors in its own code, because framework's typecheck and lint ran only inside its merge command (`framework:verify:cheap`, framework `package.json:163`). framework fixed its own config as an operator step on main: `cheap: bun run framework:verify:cheap` in `checks` and `merge_covers`, `c45d6693f` (B H5). The operator wants akrogon to require this placement for every repo (chart night-flow, fork sibling-breaks, answer 3a). On 2026-10-11 only framework among the ten registered repos had the gap.

## Done-criteria
1. `skills/init-akrogon/SKILL.md` tells setup to inspect the scripts behind each proposed merge command and to put their cheap checks in `checks`. A merge command may rerun them but is never the only place they run.
2. `docs/guide/setup.md` states that a cheap check never runs only at merge, even when a merge command also runs it.
3. `skills/check-issue/SKILL.md` tells B that a leaf diff leaving a cheap check reachable only through `merge_checks` is a Fix when a script edit within the leaf can route it through `checks`, and otherwise an `Operator actions` item naming the config line.
4. None of the three edited places states or implies that akrogon code enforces the rule. A sweep of `skills/` and `docs/` by meaning finds no line allowing a cheap check to run only at merge. Hits outside scope are listed in the report.
