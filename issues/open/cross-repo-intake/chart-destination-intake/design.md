# Design: chart-destination-intake

## Binding decisions, verbatim
From issues/chart/cross-repo-intake/forks/destination-intake.md, Taken, operator 2026-09-28: "1a | 2a | 3a |"
- Q1-A: check the source repo plus each selected destination. Reason: covers the miss in #38 without making every chart an all-repo import; an unrelated broken repo cannot block the chart. Forecloses: checking every registered repo.
- Q2-A: check at destination selection and again right before the handoff review, one check when both coincide. Reason: a match found early can still reshape forks cheaply. Forecloses: a single late check, a single early check.
- Q3-A: a fully covered report with no other owner goes verbatim into intake provenance and into `sources` of every leaf under the delivering completion owner, closing on delivery through existing completion. Reason: matches #38 expected behavior and keeps the report open until the fix lands. Forecloses: duplicate-closing an undelivered report during charting.

From issues/chart/cross-repo-intake/CHART.md, Off route: "Changes to completion closure, `next --all`, seed-issue routing or pi-extensions#5 (already closed)."

From Tamdoma/akrogon#38, Expected behavior: "A report in the destination repo describing the handed-off work is visible to the chart before handoff, so it can enter leaf `sources` and close with the delivering issue."

Excluded here: the `pull --all` scope decision in CHART.md Off route belongs to leaf pull-all-repos. This leaf uses plain `akrogon pull` per destination and does not depend on `--all`.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md, interpreted: no auth, secrets or backend state are changed. This leaf changes skill prose, so no tests assert its wording. Negative and edge cases are mandatory and are covered as scenario reviews in done-criterion 5: late report on a same-repo chart, partial match, identity owned elsewhere, unrelated destination report, failed destination refresh beside a healthy one. The user-visible flow is the door, so done-criterion 5 replays the real #38 case against the new text and records a real `akrogon pull` in a destination root with a retained output file.

## Leaf architecture
Owned: skills/chart-issues/SKILL.md, skills/chart-issues/assets/shapes.md, docs/guide/chart.md (the handoff section and the delivered-or-duplicate closure sentence at :128).
Interface: the door reads destination roots from `akrogon config` `repos` and runs `akrogon pull` there. Matched identities use the existing `Source: owner/repo#n` mirror line and the existing leaf `sources` field, with the single-owner rule in shapes.md:162 unchanged.
Exclusions: src/, tests/, plugin/, README.md, seed-issue, completion closure, `akrogon close` behavior, any path under `issues/`. No new command, flag, config key or state field. No automatic matcher: matching is the door's proposal confirmed by the operator.
Dependencies: none.
