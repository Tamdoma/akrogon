# Where the seat setting lives and its shape

## Question

Q1. Where does a per-epic, per-issue or per-leaf seat choice live, and how does it reach each leaf's launch: live front matter in `EPIC.md`/`ISSUE.md` with an optional leaf `state.yaml` override and walk-up resolution, or leaf `state.yaml` only with the door copying the owner's choice into every leaf at handoff?

Q2. Is the block a whole seat `{harness, model, effort}` per seat (`a`, `b` or both, omitted seat inherits), the same schema as the existing repo override, or a partial patch of single fields?

### Carries

- Lock: `seats()` at `src/config.ts:60-71` stays the single resolver and `launch()` at `src/next.ts:252-260` the single consumer.
- Lock: nothing under `issues/` is written by a leaf branch; the door or the operator on main writes the setting.
- Operator constraint (verbatim): "include that in the issue folder itself, but only as a setting that doesn't necessarily create new files, so maybe we can do it in the epic or issue config itself".
- Related: forks/worker-model.md, forks/visibility.md.

## Findings

See slots/map-merged.md and slots/map-rebuttal-B.md. Tier better-than-training, inspected 2026-10-07: `src/config.ts:11-16,49,60-71,110-120`, `src/next.ts:252-260,405-437,527`, `src/state.ts:60-87,114-129`, `src/phase.ts:185-195`, `skills/chart-issues/assets/shapes.md:122`, `tests/config.test.ts:130-174`.

- Live front matter with walk-up (B): one owner per inherited choice, an epic edit reaches every descendant's next start, new leaves inherit. Cost: bounded front-matter parser and ancestor lookup, index contract amended.
- Leaf-only copy at handoff (A): fewest levels, no parser. Cost: an epic change after handoff edits each remaining leaf, copies hide deliberate exceptions.
- Whole-seat block (A,B). Partial merge rejected (A,B): invites a claude model under a pi harness.
- Pitfalls (B): a container `state.yaml` would be read as a leaf by `leavesUnder()`; malformed front matter must fail with its path; whitespace-only values pass `z.string().min(1)` (LESSONS 2026-09-19).

## Taken

2026-10-07. Operator verbatim: "1 - Leaning towards a, but we need one place to do this per issue, or per epic. Not per leaf. Come up with a solution for that | 2 - full line, but look what full lines look like in config.yaml in the root. It's diffrerent for different harnesses. These need to be the same. |"

Q1 taken: 1a without the leaf level. The seat setting lives only in YAML front matter at the top of `EPIC.md` and `ISSUE.md`; `state.yaml` gains no field. Resolution per seat, nearest index wins: parent `ISSUE.md`, then grandparent `EPIC.md` at depth 3, then repo `issues/config.yaml`, then machine `config.yaml`. An issue inside an epic may carry its own block for its leaves. Reason: one place per owner. Foreclosed: leaf `state.yaml` override, copy at handoff, slug-keyed repo map, new file.

Q2 taken: whole seat `{harness, model, effort}`, identical shape in every file, nonblank, keys `a`/`b` only, strict. The machine `harnesses:` launch templates differ per CLI and never appear in an issue file. Foreclosed: field patch.

Binding: malformed front matter or schema failure throws with the file path; an index without front matter means no override; `seats()` takes the leaf path and remains the only resolver; harness template presence validated in the resolver before tab or worktree allocation. B final-shape check: no disagreements (slots/setting-home-final-check-B.md).
