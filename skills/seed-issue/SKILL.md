---
name: seed-issue
description: Convert an issue (bug, feature, improvement, maintenance request, or new idea) into a portable seed report — low-floor intake anyone can file from a concrete project, with no repo-planning knowledge required. Use when someone describes what happened and what should have happened instead, and you need to write normal intake for later import through `consult-issue` or explicitly route authorized ISSUE-MASTER/FIXER intake to the canonical issue-lifecycle FIXER. When the destination is nameable but the route is not, chart it with `chart-issues` first; that skill emits these reports carrying its resolved decisions as locked answers.
---

# Seed Issue

Low-floor intake: turn one person's concrete observation into a portable report. Run normal intake directly through the LLM. Use the managed submission command only for the explicit FIXER destination mode below. Do not spawn subagents.

A seed report is unverified intake, not a diagnosis and not a plan. It is not grilled, not grounded, and not classified here. The import pass grills the brief with the operator, who has the repo context the reporter may not, and re-resolves any anchors the report carries against live surfaces. Never withhold a report because it looks thin, local, or unverified: the author holds an observation nobody else has, and judging it is a later pass's job.

## Required Input

One freeform statement of what happened and what should have happened instead. Use the surrounding conversation and whatever local context is at hand as supporting evidence.

Never require exact file paths, links, a named violated contract, or any other repo-planning knowledge. Inspect only the local context needed to understand the symptom and the workflow around it; never scan the codebase broadly.

Hard rule: incidental context is evidence, not scope.

## Output Contract

Produce exactly one markdown report per invocation. Normal intake writes it at the path the repo's own state selects; FIXER intake streams it to canonical submission without a caller-repository file:

| Repo state                              | Report path             | Directories to ensure     |
| --------------------------------------- | ----------------------- | ------------------------- |
| `issues/config.yaml` exists             | `issues/open/<slug>.md` | `issues/`, `issues/open/` |
| `issues/config.yaml` absent (bare repo) | `issues/<slug>.md`      | `issues/`                 |

Those paths are the normal destination. Use FIXER destination mode only when the operator or the caller's ISSUE-MASTER/FIXER workflow explicitly requests FIXER intake. Never infer FIXER routing from severity, shared impact, or the kind of work.

FIXER destination mode requires an initialized caller repository and Herdr. Keep the complete report in memory and provide its exact UTF-8 bytes on standard input to:

```text
bun issues/.scripts/submit-fixer-seed.ts --slug <slug> --priority <normal|urgent>
```

`## Grounding Anchors` is required in FIXER mode, not optional: submission refuses a report whose anchors name no repo-relative path, because a seed with no anchor cannot be routed by evidence. Write the anchors before submitting rather than recovering the draft afterward.

Never write FIXER intake anywhere in the caller repository. Consumer repositories must not contain `issues/open/fixer/`, `issues/run/fixer-submissions/`, or any other FIXER intake or staging path. Use `urgent` only when active lifecycle machinery is stopped, unsafe, corrupting state, or losing work. Use `normal` otherwise. The command authorizes only an exact `ISSUE-MASTER` tab or the canonical `FIXER` tab, locates and verifies the canonical issue-lifecycle control root, and publishes the report under canonical `issues/open/fixer/`. On success, return the published path. On failure, report the error and the recovery draft path printed by the command; that recovery file lives under the operating-system temp directory, outside every repository. Never copy the report into normal intake or prompt FIXER directly.

- Slug: names the failure, no more than three hyphen-separated words. Good — `workspace-handoff-contract`, `init-lifecycle-coupling`, `resume-workspace-sync`. Bad — `fix-my-app`, `src-dashboard-bug`, `resume-ignores-active-workspace`, `landing-page-crash`.
- Never create an issue folder, `state.yaml`, phase folders, or any other lifecycle artifact; write only the portable report.
- Seed creation writes one state-free portable report only; it is not a lifecycle transition. Later imports create `state.yaml` through `issues/.scripts/lifecycle.ts`, and later transitions edit `state.yaml` or the series master only.
- The same artifact must work unchanged in an initialized repo, in a bare repo, as a cross-repo companion seed, and as deferred self-capture for later import. None of those cases adds an authored section, step, or path rule; the machine-written `## Detected Overlap` flag (`## Overlap Flag`) is the one conditional addition, and its absence is normal in every case.

The repo `skills/` tree is canonical. Install trees are byte-identical deploy targets except for their install-root `slot-default` markers; edit the repo source and deploy it with `sync-payload.ts deploy`.

## Cross-Repository Work Rule

An issue worktree changes only its own repository. Install trees and herdr configuration are post-merge deploy targets, not issue-worktree edit targets. A genuinely multi-repository change requires one portable seed per repository, with companion-seed references and a park barrier recorded in each seed. Importing one seed may read those references but never writes files, lifecycle state, or run status in the companion repository; this is guidance and seed metadata, not cross-repository transition authority.

## Workflow

1. Read the statement first.
2. Inspect only the local context it needs to make sense.
3. Select normal or explicit FIXER destination mode per `## Output Contract`.
4. In normal mode, write the report to its final path.
5. In FIXER mode, send the in-memory report to the managed submission command on standard input and stop.
6. In normal mode, flag overlap per `## Overlap Flag` — best-effort, after the report is already written.

No grill, no grounding pass, and no systemic-vs-local classification runs here. Whether the report describes one project's accident or a shared contract's defect is decided at import, by the operator, against live surfaces.

## Overlap Flag

File, flag, keep moving: the seed is always written first, and the flag never blocks intake, never interrogates the reporter, and never proposes a merge at filing time.

After writing the report in an initialized repo, resolve `consolidate-issues/scripts/cluster-open-work.ts` beside this skill's own install root and run it with `--root <repo-root>`. Skip this step silently when the repo is bare, the sibling skill is not installed, or the script exits nonzero — intake must not depend on it. If the report's own `seed:<slug>` appears in a cluster, append one machine-written section to the report:

```markdown
## Detected Overlap

- <member key> — shared: <comma-separated shared surfaces from the edges touching this seed>
```

One line per other cluster member, in the script's member order. No cluster containing this seed means no section — absence is the normal case, never a gap. The section is advisory metadata for later consolidation passes (`consolidate-issues`), which re-compute evidence themselves; import archives it with the consumed seed and does not translate it into the planning brief.

## Report Structure

Required core — five sections in every report, each answerable from the reporter's own project:

```markdown
# Seeded Issue

## Observed Behavior

## Expected Behavior

## Where It Happened

## Reproduction Context

## Urgency
```

| Section                   | Content                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `## Observed Behavior`    | what actually happened, in the reporter's own terms            |
| `## Expected Behavior`    | what should have happened instead                              |
| `## Where It Happened`    | the project, surface, command, or workflow that exposed it     |
| `## Reproduction Context` | what was being done, how often it recurs, what makes it appear |
| `## Urgency`              | what it blocks, and how hard it is to work around meanwhile    |

Optional enrichment — add one only when the author already has the context to fill it honestly. These carry the canonical planning-brief section names, so import moves them into `planning/plan.md` with no translation. An absent section is normal intake, never a gap and never a reason to interrogate the author:

| Section                         | Content                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `## Recommended Direction`      | the direction the author would take, and why                                            |
| `## Constraints And Exclusions` | what must not change; local cleanup deliberately left out of scope                      |
| `## Acceptance Criteria`        | what would prove the problem fixed                                                      |
| `## Grounding Anchors`          | flat list of the files actually consulted, each entry leading with a repo-relative path |
| `## Posture`                    | the risk and default-decision postures, when the author already holds them              |

Stop there. The report is pre-planning input, not a brief.

An anchor identifies a surface; it does not describe it. Lead every entry with a repo-relative path and let the prose follow on the same line, so consolidation can cluster on it and whoever works the report can open the surface instead of re-deriving it. Prose alone reads accurately and resolves to nothing:

```markdown
## Grounding Anchors

- `issues/.scripts/issue-master/wake-actions.ts` — the wake lane selector, whose comment authorizes delivery into a working pane once the deadman latches
```

Anchor only what was actually consulted, and never guess a path to satisfy the form: a wrong anchor is worse than an absent one, because consolidation then clusters on it.

Posture is operator judgment answered at the import grill, so never interrogate a reporter for it: its absence is ordinary intake and the grill asks. An author who has already resolved it — in practice `chart-issues`, which carries locked answers — writes `## Posture` as a closed key list, and every key it carries the grill does not re-ask:

```markdown
## Posture

inspector_2: judge
merge_hold: no
smallest_safe_change_bias: yes
decline_new_stores: yes
park_on_doubt: yes
```

`inspector_2` names the ROLE the second inspector runs at (`implementer` — a cheap-tier second reviewer — or `judge`), never a model. Absent keys take the strict value, so a partial section is legal and the grill asks exactly what is missing.

## Complex Series Authoring Lane

Use this lane for an explicitly requested complex issue containing separately deliverable whole leaves. A complex seed remains one report; this skill never writes leaf directories, SERIES.md or lifecycle state.

Author the category-grouped breakdown under `## Recommended Direction` using the single canonical schema in [consult materialization](../consult-issue/series-materialization-reference.md#locked-breakdown-schema). Preserve locked scope, shared acceptance, leaf-specific criteria and real serial or barrier dependencies. Keep parallelization claims as design evidence, not scheduling authority. Do not introduce p/s names, execution modes, mandatory chunks or a smaller leaf merely to meet a timing target.

A sibling reference is not automatically a dependency. Declare the prerequisite when planning or implementation actually needs the sibling result. Serial gates both planning and implementation; barrier gates implementation only. A malformed supplied breakdown is reported with its offending fields rather than silently replaced. `create-issue` or the authorized consult materializer owns creation under the canonical grouped layout.

## Portability Rules

Describe the pattern that failed, not the one file that happened to expose it. This is the only bar the report must clear, and it needs no repo knowledge — a reporter who cannot name the broken contract can still describe the workflow that broke.

- Do not use raw one-off file paths unless one is truly required to explain the failure.
- Do not use exact local links as primary evidence.
- Do not describe one-off local remediation as part of the report.
- Do preserve the workflow pattern that revealed the bug.
- Do preserve the promise, contract, or boundary it broke, when the author can name it.

Good — "During workspace activation, the runtime treated workspace-scoped handoffs as if they were root-scoped."

Bad — "In `apps/client/src/foo.ts`, the regex missed `/Users/.../bar` and broke the page."

## Handoff To Consult Issue

This report is a portable pre-planning artifact, not the final issue root.

For normal intake, point `consult-issue` at the report later. That pass creates the issue folder, moves every section the report carries into `planning/plan.md` verbatim, grills the resulting brief with the operator, re-resolves any `## Grounding Anchors` entries against live surfaces, and archives the report as consumed.

FIXER intake does not enter `consult-issue`. Its monitor processes the published seed or consolidates overlapping FIXER seeds into a direct FIXER series.
