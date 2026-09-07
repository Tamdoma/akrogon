# Consult Issue Series Materialization Reference

## Contents

- Complex Series Issue Materialization Sub-Flow
- Series Leaf Execution Marker Rule
- Locked Breakdown Schema
- Locked SERIES.md Template
- Locked Series Leaf Issue Template

## Complex Series Issue Materialization Sub-Flow

When the import decision gate elects a series using either an explicit seed breakdown or an LLM-authored breakdown:

1. Derive `<series-slug>` from the breakdown's `series_slug` field.
2. Run the series slug collision guard with `<series-slug>` against existing series folders.
3. Create `issues/open/<series-slug>/`.
4. Apply the **Series Leaf Execution Marker Rule** below before writing `SERIES.md` or any leaf issue root.
5. Write `issues/open/<series-slug>/SERIES.md` using the **Locked SERIES.md Template** below. `SERIES.md` indexes the nested issue roots and does not carry grounding anchor sections or phase state.
6. For each phase entry in order:
   - Create `issues/open/<series-slug>/<phase_folder>/`.
   - For each leaf entry in that phase, derive `<leaf-root>` from the normalized marker by removing one trailing `.md`; `<leaf-root>` must be `<NN><mode>-<leaf-slug>`.
   - Create the real issue root `issues/open/<series-slug>/<phase_folder>/<leaf-root>/`.
   - Create all six issue files under that root: `planning/plan.md`, `planning/a.md`, `planning/b.md`, `implementation/plan.md`, `implementation/a.md`, and `implementation/b.md`.
   - Seed `planning/plan.md` using the **Locked Series Leaf Issue Template** below. Translate the breakdown's per-leaf fields into the canonical planning brief and expand it to the `authoring-reference.md` `## Checklist Quality Bar` standard - a leaf brief whose sections are bare one-line copies of the breakdown fields is a materialization defect; write no standalone markdown file for the leaf.
   - When the breakdown was LLM-authored during this import, derive each per-leaf field from the seed report and the grounded analysis performed in this invocation.
   - Seed `implementation/plan.md` and all consultant files using the normal create flow rules.
7. After every leaf issue root exists, write the series master `state.yaml` with `createSeriesState(execRoot, series, created, <resolved-report-path>)`. Leaf identity is derived from the physical `SERIES.md` rows and marker artifacts; no per-leaf `created` value is stored.
8. After every leaf issue root exists, read each new `planning/plan.md` first. If parsed config sets `orchestrator.gates.park_after_scaffold: operator`, invoke `bun issues/.scripts/lifecycle.ts status-write series <series-slug> <leaf-slug> park.hold` for every leaf after its scaffold, series state at `P-draft`, and seeded `plan.md` exist, then exit without writing any consultant position, using the same separate-position exit shape as `## Planning Grill Gate`. Otherwise, if the operator's invocation message included a planning-grill signal, run the brief-grill lane for each leaf issue in place of this step and exit. Otherwise, run each position-interview lane when it fires and write or update the active slot's planning file in every leaf issue with a substantive first independent planning position. Leave the peer slot file pending.
9. Leave the parent seed at its resolved `issues/open/<systemic-slug>.md` path untouched.
10. Do not create `planning/` or `implementation/` subfolders for the parent seed.
11. Keep each leaf state at `P-draft` until both planning consultant files contain substantive independent positions plus all responses owed by `## Rebuttal Round Policy`.
12. End the consult turn after real leaf issue materialization and this skill's planning positions are complete.

## Series Leaf Execution Marker Rule

Materialized series leaf issue roots use a visible execution marker in the root name:

```text
<NN><mode>-<leaf-slug>/
```

- `<NN>` is the two-digit global leaf order across the whole series, starting at `01`.
- `<mode>` is `p` for parallelizable within its wave or `s` for sequential.
- Use lowercase `p` and `s`; do not use uppercase `P` or `S` inside the slug because marker slugs remain lowercase.
- `p` means the leaf can be planned or implemented concurrently with the other `p` leaves in the same dependency wave after the wave's dependency barrier is satisfied.
- `s` means the leaf should be run after the prior numbered leaf or after the dependency named in `SERIES.md`.
- If the breakdown already supplies `leaf_file` in marker form, preserve that order/mode unless it conflicts with the phase dependency barrier.
- If the breakdown supplies legacy `leaf_file: P-draft-<leaf-slug>.md`, normalize it during materialization to marker form and reflect the normalized issue root in `SERIES.md`; do not mutate the parent seed just to normalize the imported example.
- When authoring or normalizing a breakdown, prefer explicit per-leaf `execution_mode: parallel` or `execution_mode: sequential`. If absent, infer `s` for integration leaves and dependency-gate leaves, and infer `p` only for leaves whose `files_disjoint`, `runtime_independent`, and `acceptance_independent` claims truly hold within the same wave.

## Locked Breakdown Schema

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
    dependency_barrier: <optional one-line condition or omit field>
    is_integration_phase: false
    leaves:
      - leaf_slug: <leaf-slug>
        leaf_file: 01p-<leaf-slug>.md
        execution_mode: parallel
        summary: <one-line summary - sources `## User Intent Snapshot`>
        scope: <one-line bounded surface - sources `## Scope Of The Leaf`>
        observed_symptom: <one-line, leaf-scoped - sources `## Observed Symptom`>
        expected_behavior: <one-line, leaf-scoped - sources `## Expected Behavior`>
        recommended_direction: <one-line direction - sources `## Recommended Direction`>
        acceptance_criteria: <one-line acceptance - sources `## Acceptance Criteria`>
        constraints_and_exclusions: <one-line constraints - sources `## Constraints And Exclusions`>
      - leaf_slug: <leaf-slug>
        leaf_file: 02p-<leaf-slug>.md
        execution_mode: parallel
        summary: <one-line summary>
        scope: <one-line bounded surface>
        observed_symptom: <one-line, leaf-scoped>
        expected_behavior: <one-line, leaf-scoped>
        recommended_direction: <one-line direction>
        acceptance_criteria: <one-line acceptance>
        constraints_and_exclusions: <one-line constraints>
  - phase_folder: 02-<phase-slug>
    parallelization_claim:
      files_disjoint: <one-line assertion>
      runtime_independent: <one-line assertion>
      acceptance_independent: <one-line assertion>
    leaves:
      - leaf_slug: <leaf-slug>
        leaf_file: 03s-<leaf-slug>.md
        execution_mode: sequential
        summary: <one-line summary>
        scope: <one-line bounded surface>
        observed_symptom: <one-line, leaf-scoped>
        expected_behavior: <one-line, leaf-scoped>
        recommended_direction: <one-line direction>
        acceptance_criteria: <one-line acceptance>
        constraints_and_exclusions: <one-line constraints>
  - phase_folder: NN-<integration-phase-slug>
    is_integration_phase: true
    parallelization_claim:
      files_disjoint: sequential single-leaf integration phase
      runtime_independent: sequential single-leaf integration phase
      acceptance_independent: sequential single-leaf integration phase
    leaves:
      - leaf_slug: <integration-leaf-slug>
        leaf_file: <NN>s-<integration-leaf-slug>.md
        execution_mode: sequential
        summary: <one-line summary>
        scope: <one-line bounded surface>
        observed_symptom: <one-line, leaf-scoped>
        expected_behavior: <one-line, leaf-scoped>
        recommended_direction: <one-line direction>
        acceptance_criteria: <one-line acceptance>
        constraints_and_exclusions: <one-line constraints>
```
````

snake_case YAML keys inside the fence; title-case markdown heading outside. Required per-leaf fields: nine (`leaf_slug`, `leaf_file`, `summary`, `scope`, `observed_symptom`, `expected_behavior`, `recommended_direction`, `acceptance_criteria`, `constraints_and_exclusions`). `leaf_file` is retained for portable seed compatibility; the materializer normalizes legacy names and strips one trailing `.md` to derive the nested issue-root folder name. Each verbatim-sourced planning-brief section opens with its single authored source field; the materializer then expands every section of the leaf brief to the `authoring-reference.md` `## Checklist Quality Bar` standard using the parent seed, the operator-locked decisions, and the grounded codebase analysis from the materialization turn. Expansion must never contradict its verbatim source line, and detail the materializer cannot ground is named as an open item rather than invented. Optional per-leaf fields: `execution_mode` (`parallel` or `sequential`). Optional per-phase fields: `dependency_barrier`, `is_integration_phase`.

## Locked SERIES.md Template

```markdown
# <Series Slug> - Series Index

Parent seed: `issues/open/<systemic-slug>.md`

## Execution Legend

- `p` in `<NN>p-...` = parallelizable within its dependency wave.
- `s` in `<NN>s-...` = sequential; run after the prior numbered issue or named dependency.

## Phases

### 01-<phase-slug>

- Parallelization claim:
  - files_disjoint: <verbatim from breakdown>
  - runtime_independent: <verbatim from breakdown>
  - acceptance_independent: <verbatim from breakdown>
- Dependency barrier before next phase: <verbatim or `none`>

| Order | Mode | Leaf            | File                                      |
|-------|------|-----------------|-------------------------------------------|
| 01    | p    | <leaf-slug>     | `01-<phase-slug>/01p-<leaf-slug>/`       |
| 02    | p    | <leaf-slug>     | `01-<phase-slug>/02p-<leaf-slug>/`       |

### 02-<phase-slug>
...
```

`SERIES.md` carries no grounding anchors and no phase state. It is a stateless locator table; lifecycle phase lives in the series master `state.yaml`.

## Locked Series Leaf Issue Template

```markdown
# Planning Brief

Parent seed: `issues/open/<systemic-slug>.md`
Series: `issues/open/<series-slug>/`
Phase: `<phase_folder>`
Issue root: `issues/open/<series-slug>/<phase_folder>/<NN><mode>-<leaf-slug>/`

## User Intent Snapshot

<verbatim from the breakdown's per-leaf `summary` field, then expanded with `Requested change`, `Outcome sought`, `Why this matters now`, `Constraints and exclusions`, and `Decision trigger` lines drawn from the parent seed>

## Observed Symptom

<verbatim from the breakdown's per-leaf `observed_symptom` field, then expanded with the concrete codebase evidence - files, schemas, routes, behaviors - that makes the symptom real>

## Expected Behavior

<verbatim from the breakdown's per-leaf `expected_behavior` field, then expanded into the full observable end state across the runtime surfaces where it shows>

## Scope Of The Leaf

<verbatim from the breakdown's per-leaf `scope` field, then expanded into a named-surface inventory: the concrete files, schemas, workers, routes, and artifacts this leaf touches>

## Non-Goals

<the exclusions this leaf must not absorb, drawn from the breakdown's `constraints_and_exclusions`, the parent seed, and sibling-leaf boundaries>

## Deliverables

<enumerated concrete deliverables: migrations, modules, endpoints, UI surfaces, config, docs, tests>

## Inputs Reviewed

<the parent seed, the operator-locked decisions inherited by this leaf, and the grounded codebase surfaces consulted>

## Findings

<what the materialization-time grounding pass established about the live codebase that planning must respect, as evidence-backed bullets>

## Recommended Direction

<verbatim from the breakdown's per-leaf `recommended_direction` field, then expanded with the reasoning the parent seed and grounding support>

## Decision Framing

<the real forks planning must resolve, each stated as a question with its known option space; inherited operator-locked decisions are listed as settled and are not re-opened>

## Detailed Checklist

<execution-grade checklist per the `authoring-reference.md` `## Checklist Quality Bar`: workstreams with sub-checklists, concrete files and runtime surfaces, verification and regression items, preservation constraints>

## Acceptance Criteria

<verbatim from the breakdown's per-leaf `acceptance_criteria` field, then expanded into individually checkable criteria>

## Constraints And Exclusions

<verbatim from the breakdown's per-leaf `constraints_and_exclusions` field, then expanded with every inherited operator-locked decision that binds this leaf>

## Done Means

<one short plain-language statement of the observable state that ends the leaf>

## Grounding Anchors

- <codebase files consulted during the materialization turn, including the configured `grounding.index` when consulted>
- `issue-series-structure.md` - the structural reference this series materialization honors.

## Doc/Code Tensions

<every doc-versus-live-surface mismatch and vocabulary resolution observed during the materialization grounding pass, or `None observed during the materialization grounding pass.`>

## Addendum Log

- <one-line materialization entry naming the parent seed and the grill round when one ran>
```

Each materialized leaf is a complete issue root, not a seed file, and its brief is held to the same `authoring-reference.md` `## Checklist Quality Bar` as any standalone planning brief. The initial creating slot writes its own planning independent position unless the planning grill gate fires; the peer slot's planning file and both implementation consultant files remain explicit pending scaffolds.
