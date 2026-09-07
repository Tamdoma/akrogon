# Consult Issue Series Materialization Reference

## Contents

- Complex Series Issue Materialization Sub-Flow
- Series Leaf Execution Marker Rule
- Locked Breakdown Schema
- Locked SERIES.md Template
- Locked Series Leaf Issue Template

## Complex Series Issue Materialization Sub-Flow

Entered from `lanes/series.md` `## Series Materialization Entry`, with the breakdown in hand — from a create-flow split, from an elected import series, or authored during that import. There is no seed-file round trip: nothing is written, re-read, or re-parsed to reach this sub-flow.

1. Derive `<series-slug>` from the breakdown's `series_slug` field.
2. Run the series slug collision guard with `<series-slug>` against existing series folders.
3. Invoke the marker deriver before any series-root write. Resolve the executable beside the loaded consult-issue skill. Two entry paths, one validation:
   - Breakdown in hand — the create-flow split, and any import whose breakdown this turn authored: `bun --no-install <resolved-consult-issue-skill-root>/scripts/derive-series-markers.ts --stdin`, piping the markdown that carries the `### Issue Series Breakdown` block.
   - Breakdown carried verbatim by a resolved seed report on disk: the same executable with `--input <resolved-seed-path>`.

   Both paths run the same extraction, the same locked-schema validation, and the same halt envelopes, and neither writes anything. Bun 1.3.4 or newer is required for the built-in YAML parser.
4. Require exit 0 and parse the single normalized JSON document from stdout. On a nonzero exit, parse the single `{ "code": <stable-code>, "details": { ... } }` document from stderr, render a human `Halt:` sentence with those details, and stop without creating any scaffold.
5. Create `issues/open/<series-slug>/` only after successful normalization.
6. Write `issues/open/<series-slug>/SERIES.md` using the **Locked SERIES.md Template** below. Use the normalized JSON verbatim for marker letters, waves, leaf paths, dependency columns, and generated barrier text; never re-derive or override those values. Author `## Series Context` from the series decision in hand — it is the durable record of that decision and the one place the shared context lives, because a portable seed file is optional and usually absent. `SERIES.md` indexes the nested issue roots and does not carry grounding anchor sections or phase state.
7. For each normalized phase entry in authored order:
   - Create `issues/open/<series-slug>/<phase_folder>/`.
   - For each normalized leaf entry in authored order, derive `<leaf-root>` from its normalized `leaf_file` by removing one trailing `.md`; `<leaf-root>` must be `<NN><mode>-<leaf-slug>`.
   - Create the real issue root `issues/open/<series-slug>/<phase_folder>/<leaf-root>/`.
   - Create all six issue files under that root: `planning/plan.md`, `planning/a.md`, `planning/b.md`, `implementation/plan.md`, `implementation/a.md`, and `implementation/b.md`.
   - Seed `planning/plan.md` using the **Locked Series Leaf Issue Template** below, which states per section whether it is the breakdown's one-line field verbatim or leaf-unique content this turn must expand. Shared series context is referenced, never restated; write no standalone markdown file for the leaf.
   - When this turn authored the breakdown, derive each per-leaf field from the series decision, the parent seed when one exists, and the grounded analysis performed in this invocation.
   - Seed `implementation/plan.md` and all consultant files using the normal create flow rules.
8. After every leaf issue root exists, prepare the plain leaf-slug array in global order and write the series master `state.yaml` with `createSeriesState(execRoot, series, <leaf-slugs in global order>, created, <resolved-seed-path when one exists>)`. The writer initializes every leaf with strict `inspector_2: judge` and `merge_hold: no` defaults before any leaf grill. The leaf-slug array is never marker slugs; per-leaf paths and order are derived from the physical `SERIES.md` rows and marker artifacts, and no per-leaf `created` value is stored.
9. After every leaf issue root exists, read each new `planning/plan.md` first and run the brief grill for every leaf under `lanes/grill.md` `## Brief Grill Lane`. After each leaf grill resolves, update only that leaf with `writeSeriesLeafPosture(execRoot, series, <leaf-slug>, <resolved-risk-posture>)`; missing answers persist as `judge` and `no`, while answered values override them, and different leaves may choose different postures. Record each leaf's resolved smallest-safe-change, decline-new-stores, and park-on-doubt answers — including all-on defaults — in its planning `## Addendum Log`. A zero-question result requires both risk-posture categories and all three default-decision categories to already be held. If parsed config sets `orchestrator.gates.park_after_scaffold: operator`, invoke `bun issues/.scripts/lifecycle.ts status-write series <series-slug> <leaf-slug> park.hold` for every leaf after its scaffold, series state at `P-draft`, and seeded `plan.md` exist, then exit without writing any consultant position, using the same separate-position exit shape as `lanes/grill.md`. Otherwise, exit after any leaf grill that asked a question; when no grill hold remains, run each position-interview lane when it fires and write or update the active slot's planning file in every leaf issue with a substantive first independent planning position. Leave the peer slot file pending.

10. Leave any parent seed at its resolved `issues/open/<systemic-slug>.md` path untouched. A create-flow series has no parent seed unless the operator asked for a portable one.
11. Do not create `planning/` or `implementation/` subfolders for the parent seed.
12. Keep each leaf state at `P-draft` until both planning consultant files contain substantive independent positions plus all responses owed by `lanes/rebuttal.md` `## Rebuttal Round Policy`.
13. End the consult turn after real leaf issue materialization and this skill's planning positions are complete.

**Directory-form is the only shape a materializer may create.** A leaf is the real issue root directory `<phase_folder>/<NN><mode>-<leaf-slug>/` and nothing else. The flat marker file `<phase_folder>/<NN><mode>-<leaf-slug>.md`, whose phase folders sit beside it, is a legacy at-rest shape: the lifecycle still resolves one, and no writer may produce one. There is no case — no phase, no execution mode, no import path — in which writing a leaf as a standalone markdown file is correct.

## Series Leaf Execution Marker Rule

Materialized series leaf issue roots use a visible execution marker in the root name:

```text
<NN><mode>-<leaf-slug>/
```

- `<NN>` is the two-digit global leaf order across the whole series, starting at `01`.
- `<mode>` is the lowercase marker derived by `derive-series-markers.ts`; the materializer never authors or overrides it.
- Use lowercase `p` and `s`; do not use uppercase `P` or `S` inside the slug because marker slugs remain lowercase.
- `serial` means both planning and implementation follow the named sibling; any `serial` edge derives `s`.
- `barrier` means implementation waits for the named sibling to merge while planning remains parallel; a leaf with only `barrier` edges derives `p`.
- A leaf with no dependencies in a derived-mode breakdown is `p`. Its wave is 1; every dependent leaf's wave is one greater than the maximum wave of all its dependency targets.
- A same-phase dependency must be `serial`. A cross-phase dependency may be `serial` or `barrier`. Every target must be earlier in global leaf order.
- `execution_mode`, when authored in derived mode, is a checked assertion and must agree with the derived marker.
- A breakdown is in derived mode when any leaf authors the `depends_on` key, including `depends_on: []`; total key absence selects legacy mode. Legacy marker-form `leaf_file` values remain authoritative, and legacy `P-draft-*` names follow the existing normalization behavior.

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
      - leaf_slug: <foundation-leaf-slug>
        leaf_file: 01p-<foundation-leaf-slug>.md
        execution_mode: parallel
        depends_on: []
        summary: <one-line summary - sources `## User Intent Snapshot`>
        scope: <one-line bounded surface - sources `## Scope Of The Leaf`>
        observed_symptom: <one-line, leaf-scoped - sources `## Observed Symptom`>
        expected_behavior: <one-line, leaf-scoped - sources `## Expected Behavior`>
        recommended_direction: <one-line direction - sources `## Recommended Direction`>
        acceptance_criteria: <one-line acceptance - sources `## Acceptance Criteria`>
        constraints_and_exclusions: <one-line constraints - sources `## Constraints And Exclusions`>
      - leaf_slug: <same-phase-dependent-slug>
        leaf_file: 02s-<same-phase-dependent-slug>.md
        execution_mode: sequential
        depends_on:
          - leaf_slug: <foundation-leaf-slug>
            kind: serial
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
      - leaf_slug: <barrier-leaf-slug>
        leaf_file: 03p-<barrier-leaf-slug>.md
        execution_mode: parallel
        depends_on:
          - leaf_slug: <same-phase-dependent-slug>
            kind: barrier
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
        depends_on:
          - leaf_slug: <barrier-leaf-slug>
            kind: serial
        summary: <one-line summary>
        scope: <one-line bounded surface>
        observed_symptom: <one-line, leaf-scoped>
        expected_behavior: <one-line, leaf-scoped>
        recommended_direction: <one-line direction>
        acceptance_criteria: <one-line acceptance>
        constraints_and_exclusions: <one-line constraints>
```
````

snake_case YAML keys inside the fence; title-case markdown heading outside. Required per-leaf fields: nine (`leaf_slug`, `leaf_file`, `summary`, `scope`, `observed_symptom`, `expected_behavior`, `recommended_direction`, `acceptance_criteria`, `constraints_and_exclusions`). `leaf_file` is retained for portable seed compatibility; the materializer strips one trailing `.md` from the normalized result to derive the nested issue-root folder name. Seven of the nine fields source a leaf-brief section and are written into it verbatim as their whole content: a one-line copy is the correct result, not a materialization defect. Only `## Scope Of The Leaf`, `## Deliverables`, `## Detailed Checklist`, and `## Acceptance Criteria` are expanded, to the `authoring-reference.md` `## Checklist Quality Bar` standard, from the grounded codebase analysis of the materialization turn. Expansion must never contradict its verbatim source line, and detail the materializer cannot ground is named as an open item rather than invented. Optional per-leaf fields: `execution_mode` (`parallel` or `sequential`) and `depends_on` (a list of `{ leaf_slug, kind: serial | barrier }`). Any `depends_on` key selects derived mode for the whole breakdown; `depends_on: []` is an explicit no-dependency declaration, while total key absence selects legacy mode. Optional per-phase fields: `dependency_barrier`, `is_integration_phase`.

## Locked SERIES.md Template

```markdown
# <Series Slug> - Series Index

Parent seed: `issues/open/<systemic-slug>.md` (omit this line when no portable seed was written)

## Series Context

The durable record of the series decision, and the only place the leaves' shared context lives. Every leaf brief references this section rather than restating it.

- Parent intent: <the requested change, the outcome sought, and why it matters now>
- Observed gap: <the systemic gap the split answers>
- Series-wide acceptance: <what must be true once every leaf has merged>
- Constraints and exclusions: <the series-wide constraints, including every operator-locked decision that binds more than one leaf>
- Split rationale: <why this work separates into these phases and leaves rather than one issue>

## Execution Legend

- `p` in `<NN>p-...` = parallelizable within its dependency wave.
- `s` in `<NN>s-...` = sequential behind at least one declared `serial` dependency.
- A barriered `p` leaf may plan in parallel but implements only after its declared barrier dependencies merge.
- Wave and dependency values are copied from normalized marker-deriver output, never authored in this file.

## Phases

### 01-<phase-slug>

- Parallelization claim:
  - files_disjoint: <verbatim from breakdown>
  - runtime_independent: <verbatim from breakdown>
  - acceptance_independent: <verbatim from breakdown>
- Normalized dependency barriers: <generated lines or `none`>
- Waves and dependencies, copied from normalized marker-deriver output: `<leaf-slug>` wave <wave>, depends on <`depends_on_display` or `none`>; one line per leaf in order.

| Order | Mode | Leaf        | File                               |
|-------|------|-------------|------------------------------------|
| 01    | p    | <leaf-slug> | `01-<phase-slug>/01p-<leaf-slug>/` |
| 02    | s    | <leaf-slug> | `01-<phase-slug>/02s-<leaf-slug>/` |

### 02-<phase-slug>
...
```

The phase table is a row-structured index the lifecycle CLI parses, not free-form markdown: exactly four cells per row, `Order | Mode | Leaf | File`, the File cell backticked. A row with any other cell count is read as absent — the leaf then fails resolution, merge ordering, and the retained-series merge postcondition — so wave and dependency values ride the bullet above the table rather than adding columns. Never carry a `State` column; phase belongs to the series master `state.yaml`, and a state-bearing row is refused at parse.

`SERIES.md` carries no grounding anchors and no phase state. It is the series decision plus a stateless locator table; lifecycle phase lives in the series master `state.yaml`.

## Locked Series Leaf Issue Template

```markdown
# Planning Brief

Series: `issues/open/<series-slug>/SERIES.md` - parent intent, observed gap, series-wide acceptance, series-wide constraints, split rationale, and every sibling leaf. Read there; this brief never restates it.
Phase: `<phase_folder>`
Issue root: `issues/open/<series-slug>/<phase_folder>/<NN><mode>-<leaf-slug>/`

## User Intent Snapshot

- Requested change: <verbatim from the breakdown's per-leaf `summary` field>
- Outcome sought: <the observable end state of this leaf alone>
- Why this matters now: see `SERIES.md` `## Series Context`
- Constraints and exclusions: see `## Constraints And Exclusions` below
- Decision trigger: <what this leaf's planning must settle before implementation can start>

## Observed Symptom

<verbatim from the breakdown's per-leaf `observed_symptom` field>

## Expected Behavior

<verbatim from the breakdown's per-leaf `expected_behavior` field>

## Scope Of The Leaf

<verbatim from the breakdown's per-leaf `scope` field, expanded into a named-surface inventory: the concrete files, schemas, workers, routes, and artifacts this leaf touches, and the sibling boundaries it must not cross>

## Deliverables

<enumerated concrete deliverables with their repository paths: migrations, modules, endpoints, UI surfaces, config, docs, tests>

## Recommended Direction

<verbatim from the breakdown's per-leaf `recommended_direction` field>

## Detailed Checklist

<execution-grade checklist per the `authoring-reference.md` `## Checklist Quality Bar`: workstreams with sub-checklists, concrete files and runtime surfaces, verification and regression items, preservation constraints>

## Acceptance Criteria

<verbatim from the breakdown's per-leaf `acceptance_criteria` field, expanded into individually checkable criteria for this leaf; series-wide acceptance stays in `SERIES.md`>

## Constraints And Exclusions

<verbatim from the breakdown's per-leaf `constraints_and_exclusions` field, plus only the operator-locked decisions that bind this leaf and no sibling; series-wide constraints stay in `SERIES.md` `## Series Context`>

## Grounding Anchors

- <codebase files consulted during the materialization turn, including the configured `grounding.index` when consulted>
- `issue-series-structure.md` - the structural reference this series materialization honors.

## Doc/Code Tensions

<every doc-versus-live-surface mismatch and vocabulary resolution observed during the materialization grounding pass, or `None observed during the materialization grounding pass.`>

## Addendum Log

- <one-line materialization entry naming the series and the grill round when one ran>
```

Twelve sections, and only the four expanded ones carry the `authoring-reference.md` `## Checklist Quality Bar` obligation. Everything a leaf shares with its siblings - parent intent, observed gap, series-wide acceptance and constraints, split rationale, inputs reviewed, sibling boundaries - is inherited by the one-line `Series:` reference at the top, never copied per leaf. The planning passes own what the dropped sections used to pre-empt: `## Non-Goals` and `## Decision Framing` are the grill's and the positions' first work, `## Findings` is what a position pass writes after grounding, and `## Done Means` restated `## Acceptance Criteria` in prose.

Each materialized leaf is a complete issue root, not a seed file. The initial creating slot writes its own planning independent position unless the planning grill gate fires; the peer slot's planning file and both implementation consultant files remain explicit pending scaffolds.
