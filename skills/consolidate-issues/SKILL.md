---
name: consolidate-issues
description: Consolidate three or more overlapping open seeds and parked in-flight issues into fewer series with explicit ordering, so lanes stop blocking each other. Use when the operator, FIXER, or ISSUE-MASTER wants a consolidation pass over crowded intake, when three or more open items share predicted footprint, or when a board review shows lanes serializing behind shared files. Normal and parked in-flight consolidation remains operator-approved; canonical FIXER may automatically materialize an unimported FIXER-seed cluster without consult-issue.
---

# Consolidate Issues

Reduce overlapping open intake into fewer, topically connected units whose ordering is explicit. A consolidation pass reads open work and clusters it by evidence. Normal intake produces an operator-approved consult-issue proposal. Canonical FIXER intake may automatically materialize one direct FIXER series under the exception below.

## Input Set

Exactly two kinds of open work enter a pass:

- Unimported seeds: `issues/open/<slug>.md` files with no sibling issue folder `issues/open/<slug>/`.
- Parked in-flight issues: open issue folders whose run status shows an unresolved block or an operator park.

FIXER mode instead reads direct pending seed files under `issues/open/fixer/`. It never includes normal seeds, parked issue folders, an active FIXER seed, or an active FIXER series.

Running unparked lanes are never touched, never absorbed, and never proposed for absorption. A seed whose sibling folder exists is already imported and is out of scope; its folder may still enter as a parked in-flight issue.

## Evidence

Clustering is evidence-driven, in this order:

1. Recorded implementation footprints and check-overlap output, for in-flight issues that have them.
2. Predicted file paths extracted from seed and plan text.
3. Topical similarity, as tiebreaker only — never the sole basis for a cluster.

Run `scripts/cluster-open-work.ts` from the repository root to gather the input set and compute candidate clusters with per-edge evidence. The script is advisory: it proposes, the pass judges. Drop any cluster whose evidence is topical-only unless the members' own text names the same surface.

The report's `pathless` field counts items naming no extractable path. Those items have no admissible evidence and can join no cluster. State that count when reporting a pass, so a partial view is never read as full coverage.

## Output Contract

A normal consolidated cluster becomes exactly one `### Issue Series Breakdown` block satisfying the locked schema in `series-materialization-reference.md` (mirrored into this skill's folder), routed through consult-issue's series materialization. Leaves that are disjoint run parallel; overlapping members get explicit `serial` or `barrier` edges.

A FIXER cluster becomes `issues/open/fixer/series--<earliest-arrival>--<series-slug>/`, containing `SERIES.md` and `seeds/<original-report>` for every member. `SERIES.md` records priority, members, overlap evidence, execution order, dependencies, and source mapping. Any urgent member makes the series urgent. FIXER executes one member chunk at a time and never routes the series through consult-issue.

Information loss is forbidden by construction: every sentence of every absorbed member must land in a leaf field, in the leaf's planning brief at materialization, or in `SERIES.md ## Series Context`. The proposal must state, per member, where its content goes.

## Carryover Rule

- A parked in-flight issue that survives as its own untouched leaf carries its planning and implementation artifacts verbatim and resumes at its recorded state.
- Any leaf formed by merging two or more members replans. Every source artifact is mandatory replanning input, so content merges rather than being moved or overwritten.

The proposal marks each member `carry-verbatim` or `merge-replan`.

## Approval Gate

Every normal pass ends at a proposal, never at a materialization. Present to the operator:

1. The clusters, each with its member list and per-edge evidence.
2. The authored breakdown block per cluster, validated against the locked schema.
3. The carryover marking per member.
4. What stays unconsolidated, and why.

Only after explicit operator approval does the breakdown go to consult-issue (series election on import for seed-rooted clusters; series materialization entry when the breakdown is in hand). Rejection or silence consolidates nothing.

FIXER mode is the only automatic exception. When three or more pending FIXER seeds form one evidence-backed cluster, canonical FIXER selects a one-to-three-word series slug and materializes the complete cluster without asking. Any cluster containing a parked in-flight issue remains subject to the normal approval gate.

## Invocation

Operator, FIXER, or ISSUE-MASTER may invoke a pass directly. ISSUE-MASTER invokes it to stage a proposal; the normal approval gate remains unchanged.

Canonical FIXER first gathers pending intake, excluding its active filename when one exists:

```text
bun --no-install <skill-root>/scripts/cluster-open-work.ts --root <canonical-root> --fixer [--exclude <active-seed-file>]
```

For each returned cluster of three or more members, choose the series slug and pass every item's exact `sourceFile` value:

```text
bun --no-install <skill-root>/scripts/materialize-fixer-series.ts --root <canonical-root> --series <series-slug> --member <source-file> --member <source-file> --member <source-file> [...]
```

The materializer recomputes overlap, requires the exact current cluster, hard-links complete source seeds into a private staging directory, publishes the complete directory atomically, and removes the original pending files only after publication succeeds. On failure before publication, every source seed remains pending.

## Boundaries

- Outside FIXER mode, never write issue folders, `state.yaml`, `SERIES.md`, or lifecycle state — consult-issue owns materialization.
- Never delete or edit an absorbed seed; import archives it as consumed.
- In FIXER mode, preserve every absorbed seed byte-for-byte under the generated `seeds/` folder; only the atomic materializer may remove the original pending paths.
- Never consolidate across repositories; companion seeds stay per-repo.
- Scripts in this skill are self-contained: they import only within this skill's folder and read repository files at runtime by path.
