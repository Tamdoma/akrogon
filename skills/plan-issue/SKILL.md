---
name: plan-issue
description: Write a leaf's execution plan through blind positions, one rebuttal round, or slot B synthesis, including direct synthesis when debate is off.
---

After compaction, re-read this file, the slug's brief or plan, and this phase's references.

# Plan issue

The prompt is `plan-issue <slug> slot=<A|B> phase=<phase>`; it supplies slot and phase, independent of harness.

## Shared context

Read `akrogon config` once for the registered repo, locate the unique slug under its authoritative `issues/open/`, and read `brief.md` and `design.md` there, using the worktree for live code inspection.

The command owns phase, completion and dispatch, while this skill owns only the pass artifact; a repeated pass resumes remaining work from that artifact and the live checkout.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

Read the configured `grounding.index` top file, relevant linked areas and `learnings/LESSONS.md` as resources, then preserve the useful paths as the plan's read-first list.

A missing resource is reported as a gap, not invented content; lessons describe what happened, not rules to obey, and history is opened only to verify a cited lesson's evidence.

For a necessary peer question outside blind positions, wait for the peer to be idle, ask once through herdr in Question/Option form with instructions to write `<leaf>/questions/<id>.md`, run `herdr agent wait` without a timeout, read that file and decide by simplicity, clarity, elegance, cost, speed and quality.

A reusable lesson found here is one line in `learnings/LESSONS.md` naming mechanism, date and history path, plus `learnings/history/<date>-<slug>.md` with the case, evidence and abstract learning.

## plan.positions

Write only `positions-<slot>.md` from the shared brief and live surfaces, without reading the peer's position, covering recommendation, concrete changes, risks, simpler alternative and acceptance evidence.

With repo `rebuttal: true`, a substantive behavioral fork belongs in the rebuttal round; a conceded defect or wording preference needs no new debate.

Finish with `akrogon phase <slug> plan.rebuttal --slot <A|B>` when rebuttal is enabled, otherwise `akrogon phase <slug> plan.synthesis --slot <A|B>`, then print the footer and stop.

## plan.rebuttal

Read both independent positions and write only `rebuttal-<slot>.md`, resolving real forks against the locked design and live evidence without reading or answering the peer's rebuttal.

No real fork is a substantive agreement statement, not a manufactured objection; this is the one configured round.

Finish with `akrogon phase <slug> plan.synthesis --slot <A|B>`, then print the footer and stop.

## plan.synthesis

As B, write `plan.md` with stable D1…Dn decisions, read-first paths, needed interfaces, ordered file/criterion checklist and concrete verification, integrating both positions and any configured rebuttals when debate ran, or directly using the brief/design when `debate: no`.

The synthesis resolves implementation choices without reopening locked scope; it contains acceptance criteria before implementation derives tests, preserves a real open limitation, and names a dependency only when execution actually requires ordering.

Finish with `akrogon phase <slug> implement --slot B`, then print the footer and stop.

## Printed footer

The final two lines describe the command's actual result, including `recorded` while the other slot is outstanding:

```text
Last operation: <artifact written and observed phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase>
```

`Next: none <reason>` covers waiting or terminal outcomes; neither line is saved or parsed, and the command's dispatched prompt is authoritative.

For scrambled context only, the first 50–100 words of the other pane may confirm what happened, but cannot supply slot, phase, readiness, completion or a peer answer; missing text does not block.
