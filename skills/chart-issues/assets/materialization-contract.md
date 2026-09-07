# Materialization Contract

This is the one output contract for a settled item. `create-issue` and an
attended chart handoff use the same leaf files. A chart handoff may write a
series index beside several leaves. A chart run that cannot materialize writes
a proposal seed from `seed-shapes.md` instead.

The chart skill stamp is chart-only. An attended chart handoff and a proposal
seed carry the exact canonical stamp: Markdown outputs place it immediately
after their title, `state.yaml` carries it as a comment, never as a lifecycle
key, and archiving retains the stamped chart files. Ordinary `create-issue`
creation and ordinary seed import emit the same file shapes with no stamp
line at all. The stamp placeholder in each template below is written only by a
chart handoff and omitted everywhere else.

## Leaf folder

Each leaf is a directory at `issues/open/<slug>/` containing exactly these
files when the interview or chart handoff finishes:

```text
issues/open/<slug>/
├── brief.md
├── design.md
└── state.yaml
```

Planning adds chunk files later. The interview and chart handoff do not create
chunk files, phase folders, run status, or production code.

### `brief.md`

```markdown
# Brief: <slug>

<chart handoff only: Chart skill version: 1>

## What

<the requested change and its bounded outcome>

## Why

<why the change matters now>

## Done-criteria

1. <short, testable criterion>
2. <short, testable criterion>
```

`Done-criteria` is a numbered list. It contains only statements that can be
checked after implementation.

### `design.md`

```markdown
# Design: <slug>

<chart handoff only: Chart skill version: 1>

## Binding decisions, verbatim

<every relevant operator-locked decision, copied without paraphrase>

<the complete contents of `assets/standing-design.md`, unchanged>

consult-election: yes

## Leaf architecture

<the leaf-specific architecture, exclusions, ownership guidance, and rollout>
```

The exact election line appears once, outside a code fence, as
`consult-election: yes` or `consult-election: no`. The recommendation to the
operator is not emitted. The standing lines are copied byte-identically from
`assets/standing-design.md`. A leaf design is self-contained and never points
the implementer back to a chart archive for a binding decision.

### `state.yaml`

```yaml
# <chart handoff only: Chart skill version: 1>
slug: <slug>
phase: consult-position
created: '<YYYY-MM-DD>'
priority: n
repo: akrogon
```

The `repo` value is one of the current keys under `issues/config.yaml`'s
`repos:` table. `priority` is `h`, `n`, or `l`. An imported seed adds one
`seed_path` field containing the akrogon-checkout-relative path to its archived
seed. No chart decision or chart version is a lifecycle state. Do not add
retired posture keys, approval gates, or chart-specific state fields.

## Series index

When a chart hands off more than one leaf, write
`issues/open/SERIES-<series-slug>.md` beside the leaf directories:

```markdown
# Series Index: <series-slug>

<chart handoff only: Chart skill version: 1>

## Leaves

| Order | Leaf               | Path                            | Dependency barrier    |
| ----- | ------------------ | ------------------------------- | --------------------- |
| 01    | `<leaf-slug>`      | `issues/open/<leaf-slug>/`      | none                  |
| 02    | `<dependent-slug>` | `issues/open/<dependent-slug>/` | `serial: <leaf-slug>` |
```

Rows are in global execution order, starting at `01`. The dependency cell is
`none` or names a genuine earlier prerequisite as `serial: <slug>` or
`barrier: <slug>`. `serial` means planning and implementation wait. `barrier`
means planning may proceed but implementation waits for the named leaf to
merge. Do not invent a barrier to express preference or status.

The series index has no `State`, `Status`, phase, priority, ownership, or
consult columns. It carries no lifecycle field. Lifecycle state belongs to
each leaf's `state.yaml`; the index is only the ordered locator and dependency
map.

## Locked decision transfer

Copy each resolved chart decision into every leaf design it binds, preserving
its decision heading, answer, reason, and foreclosed alternatives. Put a
series-wide decision in every affected leaf design and a leaf-only decision in
that leaf alone. A decision that is not binding to a leaf is recorded as
explicitly deferred or out of scope, never silently dropped.

## Validation order

Before writing any output, check the one confirmation gate and confirm that
every destination is unoccupied: each planned leaf directory
`issues/open/<slug>/`, the series index path
`issues/open/SERIES-<series-slug>.md`, the proposal seed path a chart run
would newly write, and the chart archive destination
`issues/chart/archive/<destination-slug>/`. An occupied destination stops the
handoff before the first write and returns the collision to the operator for
reconciliation; never merge into or overwrite an existing leaf, series index,
newly written seed, or archive. The preflight covers only the paths this run
creates. It does not cover the tracked intake seed a `create-issue` import
archives in place, which that skill's import rule governs.
Validate each artifact after writing it and before writing or advancing to the
next artifact:

1. `brief.md` has the exact title and three required headings, and its done
   criteria are numbered.
2. `design.md` has the exact title, `## Binding decisions, verbatim`,
   `## Leaf architecture`, all standing lines byte-identically, and exactly one
   valid election line.
3. `state.yaml` has the carried fields, valid priority, and a repo key from the
   current config. Imported leaves also have a resolving `seed_path`.
4. The series index has ordered rows, only genuine earlier dependency
   barriers, and no state-bearing column. Every referenced leaf folder and
   artifact exists.

If any check fails, stop without advancing. There is no per-leaf operator
confirmation after the single series confirmation. Preserve the pre-handoff
audit and archive the chart after all emitted artifacts pass validation.
