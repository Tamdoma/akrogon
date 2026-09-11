# Chart and handoff shapes

Read before creating a chart or handing off. Paths below are relative to the authoritative registered root from `akrogon config` (`repo` identifies the key in `repos`), not an issues copy in a worktree. When effective config reports `repo: none` (the literal string `none` from `effectiveConfig`), chart locally and stop before leaf handoff until a registered destination is available.

## Chart records

```text
issues/chart/<chart-slug>/
  CHART.md
  INTAKE.md
  decisions/<decision-slug>.md
  slots/<pass>.md                 # only for peer exchanges
```

Charts stay here after handoff. They have no state.yaml or lifecycle phase. Create decisions/ even for a fully settled direct item. On resume, CHART.md points to the selected decision and its context rather than requiring a full chart reread.

```markdown
# Chart: <destination>

## Destination
<observable outcome>

## Decisions So Far
- [<decision>](decisions/<decision-slug>.md): <settled answer>

## Open Decisions
- [<question>](decisions/<decision-slug>.md): <what blocks it, if anything>

## Not Yet Specified
<material work in scope whose question cannot yet be stated precisely>

## Out Of Scope
<excluded work and reasons>
```

Preserve useful territory-map findings under the relevant chart section or decision. After valid handoff, append `Handed off <YYYY-MM-DD>` to CHART.md without moving it. A handed-off chart remains part of duplicate detection and a later contract change becomes new intake, not an edit to emitted contracts.

```markdown
# Intake: <chart-slug>

## Scope
<destination and proposed grouping, separate from source text>

## Provenance
- GitHub: owner/repo#12
- Legacy path: issues/open/older-report.md
- Operator: <date or message reference>

## Source: owner/repo#12
<entire mirrored report copied verbatim>

## Source: issues/open/older-report.md
<entire legacy report copied verbatim>

## Source: operator <reference>
<operator notes verbatim>

## Agent findings
<inspected evidence and interpretation, not attributed to the reporter>
```

GitHub identity comes from the mirror's `Source: owner/repo#n` line. Compare exact identities against parsed `sources` in all open/closed leaf states and GitHub provenance entries in all chart intakes, including handed-off charts. Compare legacy repo-relative paths against legacy provenance entries, not substrings in report bodies. Deduplicate repeated identities in the current batch too. A local path never enters leaf `sources`. Keep source files unchanged and preserve copied report bytes beneath the source headings. An unsuccessful GitHub refresh supplies no permission to drain a stale mirror.

```markdown
# <Decision question>

## Question
<the precise question>

### Carries
<existing locks, related decision paths and verbatim operator corrections>

## Findings
<grounded evidence, independent A/B attribution and remaining disagreements>

## Resolution
<operator answer verbatim, reason and foreclosed alternatives>
```

Unresolved questions have no invented Resolution. A sharp question gets its own file even while blocked. Work whose question is not sharp stays in Not Yet Specified. Ruling work out of scope records the reason in Out Of Scope instead of pretending a route decision was settled. Reshape the remaining questions after each answer.

## Handoff tree

One issue uses `issues/open/<issue>/<leaf>/`. Two or more grouped issues use:

```text
issues/open/<epic>/
  EPIC.md
  <issue>/
    ISSUE.md
    <leaf>/
      brief.md
      design.md
      state.yaml
  <other-issue>/
    ISSUE.md
    <other-leaf>/
      brief.md
      design.md
      state.yaml
```

EPIC.md lists immediate issues, ISSUE.md lists immediate leaves, each one line per child with purpose:

```markdown
# Epic: <epic>

- [<issue>](<issue>/ISSUE.md): <purpose>
- [<other-issue>](<other-issue>/ISSUE.md): <purpose>
```

```markdown
# Issue: <issue>

- [<leaf>](<leaf>/brief.md): <purpose>
```

Container indexes hold no lifecycle state or global order. Slugs are lowercase hyphenated words without ordering markers. Leaf slugs are unique across the proposed batch and existing open/closed leaves in the destination repo. Independently checkable outcomes can run in parallel, even when files overlap; only actual prerequisites enter blocked-by.

## Leaf files

```markdown
# Brief: <leaf>

## What
<bounded change and observable outcome>

## Why
<problem this solves>

## Done-criteria
1. <concrete check executable inside this leaf's ownership>
```

```markdown
# Design: <leaf>

## Binding decisions, verbatim
<each applicable resolved decision, retaining heading, answer, reason and
foreclosed alternatives>

<standing creation-locked block and current interpretation from standing-design.md>

## Leaf architecture
<owned surfaces, literal interfaces, exclusions and necessary dependencies>
```

Each design is self-contained. Copy every binding decision into each affected leaf, with explicit exclusions for decisions that do not belong there. Cross-leaf claims name an owner whose own brief/design accepts that responsibility. Known human-only prerequisites have a named owner and recorded completion before handoff, separately from any `hand_built` choice.

```yaml
slug: sample-change
phase: plan.synthesis
created: '2026-09-11'
repo: registered-key
debate: 'no'
blocked-by: []
sources: []
```

Replace sample values with the chosen slug, creation date and registered repo key. `debate: 'no'` starts at `plan.synthesis`; `debate: 'yes'` starts at `plan.positions`. Debate is one door election, default no, with very small issues using no without a question. Every leaf gets `sources`, empty when unsourced. Emit `hand_built: true` only for that explicit operator choice, otherwise omit the field. Attempts, done, fix_rounds, verdict, pane, tab, prompted and worktree belong to the command and are not door-authored.

A GitHub report has exactly one completion owner, an issue or an epic: every leaf beneath that owner carries its exact identity in sources. For an epic owner, that includes leaves of every child issue. Do not distribute one identity across unrelated completion owners. Legacy source paths stay in intake provenance, not sources.

## Preflight and validation

Prepare the complete contracts and attended handoff batch before writing. Check all proposed destination folders and index files for occupancy, including partial leaf folders without state.yaml, and refuse the handoff on any collision. Before any handoff write, also refuse an existing `issues/closed/<top-level-owner-folder-name>` and name that conflicting destination, even if empty or missing state and indexes. The completion owner is the standalone issue or the epic, not a nested child issue. Never overwrite a sentinel brief or reuse an occupied leaf destination. Check slug uniqueness across open/closed and the proposal. Resolve every blocked-by slug to an existing leaf folder with valid state or a proposed prerequisite, and refuse missing targets and circular prerequisites before writes. Emit prerequisite leaves before dependents so no written state names a not-yet-created prerequisite.

Read the briefs as an implementer: each criterion can be fulfilled within ownership and dependencies, cross-leaf promises have a matching owner, all binding decisions have a home or explicit exclusion, and known human prerequisites are complete. Obtain the operator's decision for this concrete tree and contracts, honoring session authorization already given.

Write the leaf files and immediate-child indexes directly at the registered root, then run `akrogon status` there and inspect the actual result. It parses states with the command's schema and checks repo/slug consistency; it does not prove source ownership, dependency existence or prose quality, which require the preceding audit. A failed validation is an unfinished handoff requiring repair, not permission to mark the chart handed off. A successful handoff retains the chart and original inputs, appends the handoff date and ends at the printed footer without dispatch.
