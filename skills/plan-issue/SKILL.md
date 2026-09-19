---
name: plan-issue
description: Write a leaf's execution plan through blind positions, one rebuttal round, or slot B synthesis, including direct synthesis when debate is off.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt.

# Plan issue

The prompt is `plan-issue <slug> slot=<A|B> phase=<phase> leaf=<folder>`; it supplies slot, phase and the authoritative leaf folder, independent of harness.

## Shared context

Read `akrogon config` once for the registered repo, locate the unique slug under its authoritative `issues/open/`, and read `brief.md` and `design.md` there, using the worktree for live code inspection.

Pass artifacts are written under the `leaf=` folder while code is read and edited only in the worktree, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`.

The command owns phase, completion and dispatch, while this skill owns only the pass artifact; a repeated pass resumes remaining work from that artifact and the live checkout.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

Read the configured `grounding.index` top file, relevant linked areas and `learnings/LESSONS.md` as resources, then preserve the useful paths as the plan's read-first list.

A missing resource is reported as a gap, not invented content; lessons describe what happened, not rules to obey, and history is opened only to verify a cited lesson's evidence.

When the brief and the locked design disagree, never ask the operator: the design wins, the conflict is written into the plan as a note for review, and planning continues.

A reusable lesson found here is one line in `learnings/LESSONS.md` naming mechanism, date and history path, plus `learnings/history/<date>-<slug>.md` with the case, evidence and abstract learning.

## plan.positions

Write only `positions-<slot>.md` under the `leaf=` folder from the shared brief and live surfaces, without reading the peer's position, covering recommendation, concrete changes, risks, simpler alternative and acceptance evidence.

With repo `rebuttal: true`, a substantive behavioral fork belongs in the rebuttal round; a conceded defect or wording preference needs no new debate.

Finish with `akrogon phase <slug> plan.rebuttal --slot <A|B>` when rebuttal is enabled, otherwise `akrogon phase <slug> plan.synthesis --slot <A|B>`, then print the footer and stop.

## plan.rebuttal

Read both independent positions and write only `rebuttal-<slot>.md` under the `leaf=` folder, resolving real forks against the locked design and live evidence without reading or answering the peer's rebuttal.

No real fork is a substantive agreement statement, not a manufactured objection; this is the one configured round.

Finish with `akrogon phase <slug> plan.synthesis --slot <A|B>`, then print the footer and stop.

## plan.synthesis

As B, write `plan.md` under the `leaf=` folder with stable D1…Dn decisions, read-first paths, needed interfaces, ordered file/criterion checklist and concrete verification, integrating both positions and any configured rebuttals when debate ran, or directly using the brief/design when `debate: no`.

The synthesis resolves implementation choices without reopening locked scope; it contains acceptance criteria before implementation derives tests, preserves a real open limitation, and names a dependency only when execution actually requires ordering.

Every credential the design names by variable name is checked in the registered repo's gitignored `.env`; each absent one goes into the plan under `## Operator actions` as `add <VAR> to .env` with what it is and where the operator obtains it, and the footer repeats that list so the operator fills `.env` before implement starts.

Finish with `akrogon phase <slug> implement --slot B`, then print the footer and stop.

## Printed footer

The final two lines describe the command's actual result, including `recorded` while the other slot is outstanding:

```text
Last operation: <artifact written and observed phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase> leaf=<folder>
```

`Next: none <reason>` covers waiting or terminal outcomes; neither line is saved or parsed, and the command's dispatched prompt is authoritative.
