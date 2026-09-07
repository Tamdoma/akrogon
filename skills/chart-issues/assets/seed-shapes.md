# Seed Shapes

Use these shapes when the chart cannot materialize. A proposal seed is
state-free intake for a later `create-issue` import. It is never a leaf folder,
never a `state.yaml`, and never an operator lock.

## Output location

In a repository with `issues/config.yaml`, write one report at
`issues/open/<slug>.md`. In a bare repository, write it at `issues/<slug>.md`.
Ensure only the directories required by that path. Do not create an issue
folder or phase files. An external seed is not modified by the chart.

## Required report

```markdown
# Seeded Issue

Chart skill version: 1

## Observed Behavior

<what happened, in the reporter's own terms>

## Expected Behavior

<what should have happened>

## Where It Happened

<the project, surface, command, or workflow>

## Reproduction Context

<what was being done, recurrence, and conditions>

## Urgency

<what is blocked and the current workaround>
```

The five core sections are required. They describe the chart's settled scope
without claiming that the imported agent has verified it.

Keep the canonical chart skill stamp in every seed, including a seed retained
in an archive. A seed has no lifecycle or chart-version key.

## Optional enrichment

Add these sections only when the chart has enough evidence to fill them:

```markdown
## Recommended Direction

<the proposed route and why>

## Constraints And Exclusions

- Chart decision `# <Decision Name>` — proposal: <answer>; reason: <reason>.
- <what must not change or is outside the route>

## Acceptance Criteria

1. <short, testable criterion>

## Grounding Anchors

- `<repo-relative path>` — <surface consulted>
```

Put every settled decision that affects the seed in `## Constraints And
Exclusions`, one named line per decision. Mark each as a proposal. A chart
resolution is evidence for the importing interview, not an operator lock at
this door. Keep risk and rollout posture there when the chart settled it. Put
only blocked work in `## Urgency`.

## Chart decision proposals at import

When this seed reaches an attended `create-issue` import, the importing agent
renders one table row per proposal and adds exactly one assessment line and one
operator ruling column:

```markdown
## Chart Decision Review

Every chart decision in this file is a proposal, never a lock.

| Decision          | Chart proposal      | Importing agent agree-or-better idea | Operator ruling   |
| ----------------- | ------------------- | ------------------------------------ | ----------------- |
| # <Decision Name> | <answer and reason> | <agree, or a better idea and reason> | <operator answer> |
```

The importing agent must write its own `agree-or-better-idea` entry for every
row. The operator rules every row. An omitted ruling, recommendation, score,
or silent acceptance never closes a proposal. The four machinery locks — repo,
priority, ownership, and consult election — are always separate operator
decisions at import.

## Complex series proposal

For app-scale work, keep one root seed and put the issue split inside
`## Recommended Direction`. This is the portable breakdown shape:

````markdown
### Issue Series Breakdown

```yaml
series_slug: <series-slug>
phases:
  - phase_folder: 01-<phase-slug>
    parallelization_claim:
      files_disjoint: <one-line assertion>
      runtime_independent: <one-line assertion>
      acceptance_independent: <one-line assertion>
    dependency_barrier: <optional condition that blocks this phase>
    is_integration_phase: false
    leaves:
      - leaf_slug: <foundation-leaf-slug>
        leaf_file: 01p-<foundation-leaf-slug>.md
        execution_mode: parallel
        depends_on: []
        summary: <one-line summary>
        scope: <one-line bounded surface>
        observed_symptom: <one-line leaf symptom>
        expected_behavior: <one-line leaf expectation>
        recommended_direction: <one-line direction>
        acceptance_criteria: <one-line acceptance>
        constraints_and_exclusions: <one-line constraints>
      - leaf_slug: <dependent-leaf-slug>
        leaf_file: 02s-<dependent-leaf-slug>.md
        execution_mode: sequential
        depends_on:
          - leaf_slug: <foundation-leaf-slug>
            kind: serial
        summary: <one-line summary>
        scope: <one-line bounded surface>
        observed_symptom: <one-line leaf symptom>
        expected_behavior: <one-line leaf expectation>
        recommended_direction: <one-line direction>
        acceptance_criteria: <one-line acceptance>
        constraints_and_exclusions: <one-line constraints>
```
````

The YAML keys are snake_case. A `depends_on` key, including an empty list,
selects dependency-aware mode. `serial` means planning and implementation
follow the earlier leaf. `barrier` means planning may run in parallel but
implementation waits for the earlier leaf to merge. Every target is earlier in
global order. Omit dependency barriers when there is no real prerequisite.

## Portability rules

Describe the workflow pattern and broken promise, not a guessed local fix.
Grounding anchors lead with repo-relative paths actually consulted. Preserve
the reporter's five core sections. Do not carry `state.yaml`, lifecycle phase,
consult position, priority, ownership, or a chart version as a seed lock.
