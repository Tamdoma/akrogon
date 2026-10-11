# Design: cheap-check-placement

## Binding decisions, verbatim

From `issues/chart/night-flow/forks/sibling-breaks.md`, Taken. Operator, 2026-10-11, verbatim: "1a, 2a, 3a".

Operator decision forwarded from chart-framework, 2026-10-11 (INTAKE.md), verbatim: "that should be akrogon rule too". The note adds: "Framework adds framework:verify:cheap to its `checks` as leaf L9. The operator also wants akrogon to require this for every repo: a merge check cheap enough to run in the leaf's own check must run there, before review."

Q3, answer 3a as presented: write the rule into setup (init-akrogon: look inside each merge command and move the fast parts into the leaf checks), the setup docs (one sentence), and review (check-issue: when a leaf changes the check settings or a script a merge check runs, B confirms the fast parts still run in the leaf). "This is one small leaf, text only, no code. The limit: agents follow this rule. akrogon's code can't force it."

Reason: akrogon sees each check as one opaque command line and cannot classify cheap from slow without a clock (operator lock, `issues/chart/seat-stall-detection/CHART.md:15-16`) or a self-reported flag that still hides cheap children (B O11, C O1). Placement is decided where configs are made and reviewed (B D4).

Foreclosed: running every `merge_checks` command in the leaf (3b, C O2); a timer or duration threshold; a `slow` label or new config key; matching command strings between `checks` and `merge_checks` (B O10); automatic shell expansion (B O12); describing this as a mechanical gate (B R12).

Exclusions: framework's own `issues/config.yaml` (done as an operator step on framework main, `c45d6693f`, since config changes are never leaf diffs) (B H5); `mdcny-ghl-data-pulls` and `lingua-relay` running no checks, and clinique-la-roya lacking typecheck and lint (chart Off route). Q1 belongs to `pass-refresh`. Q2 adds no rule.

Note on review scope: a leaf never changes `issues/config.yaml`, so B's review sentence covers scripts a merge command runs (for example a `package.json` script), not the config file. When only a config line can fix the placement, the finding is an `Operator actions` item (`check-issue/SKILL.md:29`), so it can never leave a leaf with an unrepairable Fix (C F5).

Existing configs: B's registry audit of all ten registered repos (`slots/sibling-breaks-q3-B.md`, RC1–RC10, 2026-10-11) found `merge_checks` only in framework, fixed on framework main in `c45d6693f`. No further audit is part of this leaf (C F6).

## Standing design

`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf: skill and doc text only, so there is no code test. Proof is the report's quoted edited lines and the by-meaning sweep. No live run and no outside call.

## Leaf architecture

- Three sentences, one per place. No new section, schema key, command or check.
- Parallel leaves editing the same files: plan-not-cap (`init-akrogon` `:26`, `setup.md` `:60`, `check-issue` `:93`). Overlap does not order work.
