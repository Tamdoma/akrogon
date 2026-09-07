---
name: seed-issue
description: Convert an issue (bug, new idea, whatever) into a portable seed report. Use when the user explains what happened, what should have happened, and what intent or contract was violated, and you need to write `issues/open/<slug>.md` in an initialized repo or `issues/<slug>.md` in a bare repo for later import through `consult-issue`.
---

# Seed Issue

Run this workflow directly through the LLM. Do not depend on helper scripts.

## Codebase Grounding

Before invoking any base-skill behavior, read the configured grounding from `issues/config.yaml`. Use `grounding.index` as the first lookup surface when present, then read only configured docs and directly linked live codebase files relevant to the current issue. Do not perform broad scans of the codebase.

Use the configured grounding docs as vocabulary surfaces. When issue language diverges from the configured codebase vocabulary, surface the divergence, resolve it against those configured docs, and record the resolved term inside the issue artifacts under `## Doc/Code Tensions` in the same pass the divergence is discovered.

Treat `## Grounding Anchors` and `## Doc/Code Tensions` as the durable issue-artifact capture surfaces for grounding.

This methodology is derived from the published `grill-with-docs` pattern at <https://www.aihero.dev/grill-with-docs> and <https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md>. Only the docs-first grounding, terminology challenge, fuzzy-language sharpening, concrete-scenario verification, live-surface verification, and inline durable-capture concepts apply. The source's forced user-interview behavior - its user-question API names, its sequential single-question pattern, its per-question gating, and its design-tree walking - is explicitly excluded; the full forbidden-term list the validation scan enforces lives in this plan's `## Locked Text Fragments`, `### Forbidden-term scan list`.

## Per-Skill Anchor Map

This skill does not carry hardcoded document paths. When configured grounding is active, use `grounding.index` as the lookup map and `grounding.docs` as vocabulary entry points. Apply the configured entry points and the directly linked codebase surfaces relevant to the current issue; when `grounding: none` is configured, skip this section and follow the base workflow.

## Activation And Fallback

Before invoking the codebase-grounding methodology, check whether `issues/config.yaml` exists at the active checkout root. When it is absent, proceed ungrounded: follow the base skill behavior and emit no grounding-specific footer or anchor capture for that turn. When it is present, read `issues/config.yaml` through `issues/.scripts/lifecycle.ts` / `parseIssuesConfig`. When an issue worktree is active, read that worktree's config; use the primary checkout only for the workflow's defined issue-state synchronization duties. When `grounding: none` is configured, follow the base skill behavior and emit no grounding-specific footer or anchor capture for that turn.

When configured grounding is active, use `grounding.index` as the first lookup surface when present, then read the configured `grounding.docs` entries and any configured or directly linked live codebase surfaces relevant to the current issue. A present-but-malformed grounding config is a hard setup error from the lifecycle parser, not a silent fallback. Emit the `Grounding:` footer line as an honest list of every file actually consulted that turn, formatted as `Grounding: <path> (read), <path> (confirmed), <path> (diverged)`. When configured grounding is active but no files were consulted that turn, the line reads `Grounding: none`.

Use `(read)` when the file was consulted, `(confirmed)` when a cited contract was checked against that live surface and matched, and `(diverged)` when that check found a mismatch. For partial index reads, use `(read, partial: <omitted span and reason>)`. Record per-contract confirmation or divergence details in `## Doc/Code Tensions`; the footer is the trail, not the full analysis.

Grounding reports codebase surfaces actually consulted: configured `index`/`docs` entry points, plus configured or followed live code/markdown surfaces. Issue work product under `issues/open/`, issue seeds, and phase artifacts remain artifact context, not grounding surfaces; durable lifecycle root artifacts listed in `grounding.surfaces` may appear.

Before emitting a footer from a configured index, classify index coverage as `complete`, `partial: <omitted area and reason>`, or `not consulted`; line counts may be used as a diagnostic only and never as the status.


## Anchor Capture Format

Every seed report this skill produces under `issues/open/<slug>.md` in an initialized repo or `issues/<slug>.md` in a bare repo includes the following sections in addition to the base seed report structure:

- `## Grounding Anchors` - list the codebase files actually consulted while authoring the report, as a flat list of paths.
- `## Doc/Code Tensions` - list every place where a doc claims a contract the live surface does not honor (or vice versa). Use `None observed.` when no tension was found.

When `grounding: none` is configured the variant defers to base `seed-issue` and does not produce these sections.

## What This Skill Does

Its job is to turn a local symptom into a portable, systemic issue report.

Hard rule:

- incidental context is evidence, not scope

The report must describe the systemic contract that failed, not the single file that happened to expose the failure.

## Required Input

Expect one freeform bug statement that covers:

- what happened
- what should have happened
- what intent or contract was violated

Use surrounding conversation and local repo context as supporting evidence when helpful, but do not require the user to provide exact file paths or links.

## Output Contract

1. Ensure repo-root `issues/` exists.
2. When `issues/config.yaml` exists, ensure repo-root `issues/open/` exists.
3. Write exactly one markdown report:
   - `issues/open/<systemic-slug>.md` when `issues/config.yaml` exists
   - `issues/<systemic-slug>.md` when `issues/config.yaml` is absent
4. Use a slug that names the systemic failure and contains no more than three hyphen-separated words.
5. Do not create a full issue folder; write only the portable report.

Seed creation writes one state-free portable report only; it is not a lifecycle transition. Later imports create `state.yaml` through `issues/.scripts/lifecycle.ts`, and later transitions edit `state.yaml` or the series master only.

The repo `skills/` tree is canonical. Install trees are byte-identical deploy targets except for their install-root `slot-default` markers; edit the repo source and deploy it with `sync-payload.ts deploy`.

## Cross-Repository Work Rule

An issue worktree changes only its own repository. Install trees and herdr configuration are post-merge deploy targets, not issue-worktree edit targets. A genuinely multi-repository change requires one portable seed per repository, with companion-seed references and a park barrier recorded in each seed. Importing one seed may read those references but never writes files, lifecycle state, or run status in the companion repository; this is guidance and seed metadata, not cross-repository transition authority.

Good slugs:

- `workspace-handoff-contract`
- `init-lifecycle-coupling`
- `resume-workspace-sync`

Bad slugs:

- `fix-my-app`
- `src-dashboard-bug`
- `resume-ignores-active-workspace`
- `landing-page-crash`

## Systemic-vs-Local Filter

Before writing the seed report, decide whether the problem is:

- systemic
- mixed
- local

Use this decision rule:

- `systemic`: a real defect in a shared contract, invariant, lifecycle step, or command behavior of the codebase
- `mixed`: a real systemic contract defect that also needs separate local cleanup
- `local`: the systemic contract is intact and the symptom is caused by one-off local behavior

Behavior:

- If the issue is `systemic`, write the seed report.
- If the issue is `mixed`, write only the systemic issue and explicitly exclude the local fixes from scope.
- If the issue is `local`, do not create a seed report. Explain briefly that the issue is not seedable as a systemic bug.

## Workflow

1. Read the user's bug statement first.
2. Inspect only the local context needed to understand the symptom, affected workflow, and likely systemic boundary.
3. Run the seed grill pass. See `## Seed Grill Gate` below for scope, behavior, termination, Auto-Mode interaction, capture rule, and forbidden-pattern guard.
4. Identify the smallest systemic contract, invariant, lifecycle step, or command behavior that failed.
5. Reframe the issue at the systemic level.
6. Strip out one-off local implementation scope.
7. Write the portable report to `issues/open/<systemic-slug>.md` when `issues/config.yaml` exists, otherwise to `issues/<systemic-slug>.md`.

Do not spawn subagents for this workflow.

## Seed Grill Gate

### Gate scope

The gate fires at the head of the seed-write pass, after any variant-specific pre-write grounding has completed. It operates exclusively against the report's upstream problem-definition sections: `## Observed Symptom`, `## Expected Behavior`, `## Violated Intent`, `## Why This Is Systemic`, and `## Broken Systemic Contract`. It never enters `## Recommended Direction`, `## Acceptance Criteria`, `## Constraints And Exclusions`, or `## Sanitized Evidence Summary`. The gate skips when the operator declares a fast-path exit.

### Gate behavior

The seed-writer scans the bug statement plus any docs-grounding context for material fuzz across six upstream facets: ambiguous symptom, vague expected behavior, under-specified violated intent, conflated systemic-vs-local signal, unclear broken systemic contract, and imprecise terminology. When material fuzz exists, the gate emits batched-by-facet questions in one turn; the first batch enumerates the six facets with a per-facet fuzz/no-fuzz annotation, and subsequent batches address material fuzz only. When the internal scan finds zero material fuzz across all six facets, the seed-writer issues one compact self-declaration ("no material fuzz across upstream facets") in lieu of a question batch and proceeds to drafting. Termination is self-declared by the seed-writer; the operator can short-circuit at any time. The gate is bounded by intent, not by a fixed round count.

### Question Authoring Standard

- **Self-contained background:** state the decision context in plain language, define necessary jargon at first use, and explain why the answer matters.
- **Current-state inventory:** before or within the first question batch, enumerate the relevant existing surfaces, settled constraints, and known gap so the operator does not have to reconstruct prior context. Bound this to what the current choice needs; do not replay issue history.
- **Consequence-bearing options:** every option description states the concrete behavior, scope, or tradeoff that selecting it authorizes.
- **Evidence-based recommendation:** when evidence favors an option, place it first and mark it recommended; when evidence does not favor one, do not manufacture a recommendation.

These rules govern question content only. They change nothing about when the gate fires, how questions batch, or how the gate terminates.

Any operator-facing question this skill asks follows the Question Authoring Standard.

The two `### Question Authoring Standard` blocks must remain word-for-word identical.

### Auto Mode interaction

The gate fires under Auto Mode because mutual understanding of the problem is the seed-issue skill's core deliverable. Auto Mode still applies to post-grill drafting. The batched-by-facet question shape and the per-facet annotation in the first batch are intentionally Auto-Mode-friendly so the operator can scan all six facets in one read and short-circuit on any false-clean annotation before drafting begins.

### Capture format

Capture is transient by design. No new section is added to the seed report. The existing upstream problem-definition sections are the durable capture surface. The seed-writer must not write a separate `## Mutual Understanding` block and must not echo the raw question-answer transcript into the report.

### Forbidden-pattern guard

The gate locks the following exclusion list itself: no forced sequential single-question API, no per-question gating loop, no design-tree walking, and no fixed minimum round count. This guard mirrors the exclusion list recorded in `issues/open/planning-grill-gate/planning/plan.md`; the two issues share the same `grill-with-docs` source-pattern lineage and must drift in lockstep or not at all.

## Report Structure

Write the seed report using this structure:

```markdown
# Seeded Issue
## User Intent Snapshot
## Observed Symptom
## Expected Behavior
## Violated Intent
## Why This Is Systemic
## Broken Systemic Contract
## Scope Of The Problem
## Recommended Direction
## Acceptance Criteria
## Constraints And Exclusions
## Sanitized Evidence Summary
```

Write the report as diagnosis plus recommended direction. Stop before full dual-consult planning.

## Complex Series Authoring Lane

Use this lane only when the seeded problem is too broad for one independently reviewable issue and the operator needs a deterministic series of leaf seeds. A complex-series seed is still exactly one root-level seed report. The seed skill never writes per-leaf seed files, `SERIES.md`, phase folders, planning folders, or implementation folders.

Author the series breakdown inside `## Recommended Direction` after the seed grill gate has completed. The seed grill gate continues to exclude `## Recommended Direction`; the breakdown is an authored direction, not upstream problem-definition evidence.

For each phase, include the three parallelization claims:

- `files_disjoint`
- `runtime_independent`
- `acceptance_independent`

Use an optional final integration phase when otherwise parallel leaves need one sequential acceptance pass. The integration phase can set `is_integration_phase: true` and use the sequential single-leaf integration wording shown below.

`consult-issue` enforces the materialization contract. If the `### Issue Series Breakdown` block is present but malformed, `consult-issue` halts with a structured error and does not fall through to the single-issue path.

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
        summary: <one-line summary - sources `## User Intent Snapshot`>
        scope: <one-line bounded surface - sources `## Scope Of The Leaf`>
        observed_symptom: <one-line, leaf-scoped - sources `## Observed Symptom`>
        expected_behavior: <one-line, leaf-scoped - sources `## Expected Behavior`>
        recommended_direction: <one-line direction - sources `## Recommended Direction`>
        acceptance_criteria: <one-line acceptance - sources `## Acceptance Criteria`>
        constraints_and_exclusions: <one-line constraints - sources `## Constraints And Exclusions`>
      - leaf_slug: <leaf-slug>
        leaf_file: 02p-<leaf-slug>.md
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
        summary: <one-line summary>
        scope: <one-line bounded surface>
        observed_symptom: <one-line, leaf-scoped>
        expected_behavior: <one-line, leaf-scoped>
        recommended_direction: <one-line direction>
        acceptance_criteria: <one-line acceptance>
        constraints_and_exclusions: <one-line constraints>
```

snake_case YAML keys inside the fence; title-case markdown heading outside. Required per-leaf fields: nine (`leaf_slug`, `leaf_file`, `summary`, `scope`, `observed_symptom`, `expected_behavior`, `recommended_direction`, `acceptance_criteria`, `constraints_and_exclusions`). Each leaf-seed section the materializer writes has exactly one authored source field; the materializer never invents prose. Optional per-phase fields: `dependency_barrier`, `is_integration_phase`.

## Sanitization Rules

Keep the report portable.

- Do not use raw one-off file paths unless they are truly required to explain the systemic defect.
- Do not use exact local links as primary evidence.
- Do not describe one-off local remediation as part of the systemic issue.
- Do preserve the workflow pattern that revealed the bug.
- Do preserve the violated systemic promise, contract, or boundary.

Good evidence summary:

- "During workspace activation, the runtime treated workspace-scoped handoffs as if they were root-scoped."

Bad evidence summary:

- "In `apps/client/src/foo.ts`, the regex missed `/Users/.../bar` and broke the page."

## Handoff To Consult Issue

This report is a portable pre-planning artifact.

Later, the user can run `consult-issue` and point it at the seeded markdown report. `consult-issue` should then convert the report into the canonical issue folder and continue the normal planning workflow.

Do not treat the seeded markdown report as the final issue root. Its purpose is to carry the systemic diagnosis forward without dragging one-off local scope along with it.
