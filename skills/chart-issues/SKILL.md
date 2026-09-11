---
name: chart-issues
description: Turn operator notes or imported reports into charts of open decisions, then hand settled work directly to leaf contracts in a registered repository. Operator-invoked only.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt. After compaction on an unfinished chart, resume from CHART.md and the selected decision's linked context.

# Chart issues

Dependency: the installed `akrogon` command. This is an attended door, not a lifecycle phase.

## Shared context

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

Read [questions](assets/questions.md) before an operator batch, [shapes](assets/shapes.md) before creating a chart or handing off, and [standing design](assets/standing-design.md) when preparing leaf designs.

## Open

In the first reply, name the operator-supplied B pane or say single slot; read `akrogon config` and use its registered repo root for chart and handoff writes, resolving worktrees through their shared Git common directory rather than their inert issues copy. An unregistered repo can be charted locally, but handoff requires a registered destination; registration and initialization are outside this door.

Run `akrogon pull` at open: report an unregistered or non-GitHub repo and continue charting, while any other failed refresh blocks a drain relying on that refresh rather than permitting stale mirrored intake; independent operator notes can continue.

Read the configured `grounding.index` top file, relevant linked areas and `learnings/LESSONS.md` as resources, report absent resources as gaps, and offer a lesson prune at open; reusable findings get one mechanism/date/history-path line in LESSONS.md and a case/evidence/learning file at `learnings/history/<date>-<slug>.md`, with historical lessons treated as observations rather than rules.

Import operator notes, and mirrored `issues/seeds/*.md` and legacy `issues/open/<slug>.md` only when the door opens without an operator note or the note asks for them, using the provenance in shapes: skip exact GitHub identities already in open/closed leaf `sources` or any chart intake, and legacy source paths already imported, preserving original reports and copying imported text verbatim separately from agent findings and scope.

## Drain

Show a proportional territory map before grilling, including material forks, practitioner questions and pitfalls grounded in inspected surfaces; when B is named, A and B map independently before A merges with attribution, using the blind file exchange in questions.

Propose the split by destination and speed of resolution before writing: independently checkable outcomes sharing a destination can be parallel leaves of one issue, independent issues run side by side, and only an actual dependency orders work, never file overlap or presentation preference.

Write one chart folder per destination. When every chart still holds an unresolved decision, stop the seed drain for the operator to select one; when every decision in every chart is resolved, hand off each chart in order without asking for a selection, asking the debate question once for the whole batch. A direct single item whose map finds nothing unspecified writes the same chart structure and proceeds to handoff immediately.

## Decide

With B, A owns interviewing and recording, sends only intake, current Question and carries, related decision paths, locks and verbatim operator corrections while developing its own view, then merges the completed independent batches with `(A)`, `(B)`, `(both)` tags and obtains B's one disagreement-only rebuttal before presenting the complete operator batch with challenge check; B answers direct operator requests in its own pane and checks the final shape once before recording a late mechanism or contract change, with restatements exempt.

Record operator answers and their reasons in decision files, keep sharp questions distinct from material work not yet specifiable, and reshape the remaining chart after answers; handoff becomes ready only when no material decision or unspecified work requires the implementer to guess, with small optional prototypes explicitly chosen as measurements whose scratch code is discarded.

Warn as soon as a genuinely human-only prerequisite appears, name its owner and record completion before opening a leaf; credential access alone does not qualify, and the distinct operator choice `hand_built` cannot replace completing known prerequisites.

## Handoff

Prepare the complete contracts using shapes and standing design, and present one attended handoff batch with tree, scope, registered repo, relevant operator choices and the implementation debate recommendation: `debate` defaults to no and is asked once at the door, very small issues skip the question and use no, and naming B does not set this field; recognize concrete handoff authorization already supplied in the session instead of asking again.

Audit the proposed contracts as an implementer before writing: criteria execute inside their ownership, cross-leaf claims have an owner, every binding decision has a home or exclusion, destinations are unoccupied, `issues/closed/<top-level-owner-folder-name>` does not exist even as an empty folder without state or indexes (the owner is the standalone issue or epic, not a nested child issue), leaf slugs are unique, dependencies exist or are proposed prerequisites, and each source belongs to one completion owner whose every leaf receives it; refuse collisions naming the conflicting destination and refuse missing dependencies before any handoff write, then emit prerequisites before dependents and inspect `akrogon status` for schema-valid output as described in shapes.

After valid handoff append `Handed off <date>` to CHART.md, retaining the chart and source inputs in place; command dispatch remains the authority, so finish without running `akrogon next` or a chart phase transition.

## Printed footer

End each door pass with the actual result and reason no automatic pass follows, printed rather than saved:

```text
Last operation: <what this pass wrote or observed>
Next: none <awaiting operator answer, chart selection, dispatch, or named blocker>
```
