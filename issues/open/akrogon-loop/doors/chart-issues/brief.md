# Brief: chart-issues

Chart skill version: 4

## What

Rewrite `skills/chart-issues` under the cap as the one door: it serves a fuzzy single issue and a territory alike (a map that surfaces nothing unspecified goes straight to handoff; a chart folder with CHART.md and INTAKE.md is still written first); takes slot B from a pane named at open, else single slot said in the first reply, with a blind map at open and B answering the operator's direct requests in its own pane; runs `akrogon pull` on open (an unregistered or non-GitHub repo is reported and the door continues), reads `issues/seeds/` and old proposal seed files at `issues/open/<slug>.md`, skips seeds already in `sources` under issues/open, issues/closed or a chart intake, copies imported seed text into the intake or brief, drains into one chart per destination at `issues/chart/<slug>/` (INTAKE.md as source text verbatim plus scope, decisions/, never moved) then stops for the operator to pick one; offers a LESSONS.md prune at open and reads LESSONS.md and the top index as resources; runs the per-decision blind pass, tagged merge, one rebuttal and the focused check on late changes, restatements need no check; warns on human-only steps and completes the known ones before a leaf opens; asks the debate question once at the door, skipping debate for very small issues; consolidates by destination and speed of resolution and shows the split before writing; hands off directly into `issues/open/<epic>/<issue>/<leaf>/` with EPIC.md and ISSUE.md, plain unique slugs, blocked-by, `sources`, `debate`, and `hand_built` only when true, and writes "Handed off <date>" into CHART.md. It carries the compaction first lines, references with read-when triggers, Pocock's four lines, and ends each pass with the footer (`Next: none` at the door). Its assets replace the materialization contract, seed shapes, standing design and the archive rule with the shapes this handoff used; `fixtures/`, `scripts/` and `tests/` under the skill folder are deleted. `create-issue`, `braindump-issues` and `consolidate-issues` are deleted.

## Why

One protocol, one install, one set of learnings, the same slot B check on every issue (# One Door Skill, # Skill Rewrite, # Door Second Slot).

## Done-criteria

1. The skill is under 300 lines, 4k tokens and 20 rules with its assets beside it, names the akrogon command as its dependency, and its folder holds no `fixtures/`, `scripts/` or `tests/`.
2. A dry read by a fresh agent of the open, decision, and handoff sections finds: pane-named second slot with a blind map, pull on open, sources skip, speed-of-resolution consolidation shown before writing, lessons prune, blind pass and rebuttal and focused check, human-step warning and completion, debate question, one chart per destination then stop, direct handoff into the tree with EPIC.md and ISSUE.md, the footer.
3. A handoff dry run on a temp repo under `AKROGON_HOME` writes a leaf whose `state.yaml` has slug, phase, created, priority, repo, debate, blocked-by and sources, plus EPIC.md and ISSUE.md, refuses a blocked-by that names a missing folder, and `akrogon next` with herdr substituted prints the prompt line for that leaf (checker verifies).
4. `skills/create-issue`, `skills/braindump-issues`, `skills/consolidate-issues` are deleted and no skill this leaf owns references them.
5. The chart-issues assets carry no reference to `issues/chart/archive/`, `SERIES-`, `consult-position`, parking, or per-leaf confirmation.
