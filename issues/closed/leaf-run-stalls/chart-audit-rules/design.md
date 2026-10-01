# Design: chart-audit-rules

## Binding decisions, verbatim

### red-criterion Q1 (issues/chart/leaf-run-stalls/forks/red-criterion.md)
Operator 2026-10-01, verbatim: "1a |".
Q1 1a: a done-criterion may cite only a command in the destination's blocking `checks` or a test the leaf itself adds. A leaf that needs a larger repo-wide command gets it added to `checks` first, after a prerequisite makes it pass. Reason: merge already refuses red `checks`, so a protected command cannot be broken by a sibling (the not-rocket-science rule). Foreclosed: 1b, a base probe at handoff, which goes stale when another leaf merges red.

### leaf-split (issues/chart/leaf-run-stalls/forks/leaf-split.md)
Operator 2026-10-01, verbatim: "1a | 2a | 3a".
Q1 1a: one clause on the handoff audit. For every `blocked-by` entry, the dependent's brief names the output it consumes. When that output is a part the producer could merge with its own proof, the door proposes that part as a prerequisite leaf. No count or size trigger, and no recorded reason for a kept bundle. Taken on the chart Destination, not on #45's evidence.
Q2 2a: no new rule. When a leaf splits, its stage row splits too, and each part owns its stage and spine criterion, as the spine-growth lock already says. A part with no runnable output is an ordinary leaf with unit tests. Foreclosed: chained contributors to one stage.
Q3 3a: no live action.
Practitioners: Google eng-practices "Small CLs" (split so some tracks move while others wait), DORA "Working in small batches".
Chart Off route: any numeric size gate, clock or watchdog.

### Excluded binding decisions
- red-criterion Q2 (seat exit on an unmeetable criterion) belongs to seat-exit-rules. red-criterion Q3 is an operator action on framework, not a leaf.
- leaf-split Q2 writes no text: the spine paragraph stays as is. Q3 is no action.
- provider-death belongs to seat-exit-rules. failed-stop-race belongs to failed-stop-guard.

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

This leaf changes skill prose only. No auth, backend, secret, browser flow or chain stage is involved. The cheapest sufficient proof is reading the changed paragraphs against criteria 1-3. A test asserting wording would be a vanity test. Rule 1 restates a merge fact the command already enforces (merge runs only `checks`, merge-issue SKILL.md:33), so no outside call is named.

## Leaf architecture
Owned: `skills/chart-issues/assets/shapes.md` (the done-criteria placeholder at line 132 and the implementer-audit paragraph at line 170).
Interpretation (C D4): "a test the leaf itself adds" includes the leaf's own end-to-end evidence, real outside calls and live runs that standing-design.md lines 9-10 allow. The rule's target is a repo-wide command a sibling merge can turn red.
Literal interfaces: none.
Excluded: `skills/chart-issues/SKILL.md`, `assets/standing-design.md`, `assets/questions.md`, the spine paragraph, any other skill, any file under `issues/`.
Dependencies: none.
