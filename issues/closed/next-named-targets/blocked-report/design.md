# Design: blocked-report

## Binding decisions, verbatim

### Blocked report (issues/chart/next-named-targets/forks/blocked-report.md)
Operator answer 2026-10-08: `1a | 2a | 3a`. B final-shape check: [slots/blocked-report-final-check-B.md](../slots/blocked-report-final-check-B.md), both corrections applied (--all subjects, merged exclusion).
- Subjects are the leaves a manual invocation selects: the selectLeaves result for `next <name|path>` and typed bare `next` without event JSON, and the swept inventory for `next --all` (current repo, or every registered repo outside one, src/next.ts:1260-1270). An explicit target or --all is manual even with inherited event JSON. --resume, Herdr events and mergeWake are automatic. Dependents started after a completion and mergePass leaves are never subjects. Real errors keep reporting on every path. Reason: one rule for everything typed, and the operator sees why picked work did not start.
- Each subject is evaluated when its dispatch is attempted, against current inventory, with at most one error line (existing report() dedupe). Merged leaves keep today's completion branch first and are never diagnosed (src/next.ts:618-621). Then, in order: failed phase gives one line saying the leaf is failed and needs phase recovery; else every unmet dependency with its phase, or parked, missing or unreadable (parked detected by name, src/state.ts:146-158); else every missing input by kind, name and holder, never values.
- Dependencies are checked before inputs, matching eligibility (src/turn.ts:8-20). eligibility's truth value and merge order do not change.
- One-leaf and many-leaf selections behave the same. Today's explicit-only throws (src/next.ts:629-644) become this shared report. Ready siblings still start. Any report sets exit 1. Reason for inputs and failed (2a, 3a): no difference by leaf count, and no silent skip of picked work.
- Merge turn, capacity and busy seats are never reported. Automatic passes keep today's silent waiting.
- Binding tests: epic target with ready, dep-blocked, input-blocked and failed leaves starts the ready one, prints three lines, exits 1; single leaf gives the same lines; a hook pass on the same tree prints nothing for waits; a manual leaf target whose completion starts a still-blocked dependent does not report that dependent; merged closed dependency satisfies; parked and missing dependencies are labelled; --all inside and outside a repo reports.

### Leaf split (issues/chart/next-named-targets/forks/leaf-split.md)
Operator answer 2026-10-08: `1a`. B final-shape check: [slots/leaf-split-final-check-B.md](../slots/leaf-split-final-check-B.md), no problem.
- Leaves `named-targets` and `blocked-report` in one standalone issue, no blocked-by. Reason: each outcome is checkable alone and parallel is fastest.
- Composition proven by two criteria, not a combined test. named-targets: for an epic and a nested issue, `next <name>` from the repo root gives the same Selection (repo and leaf set) as `next <its repo-relative folder path>`. blocked-report: reporting subjects are the Selection's leaves (or the --all inventory), independent of input form; a one-leaf folder target and that leaf's slug give the same report, and a multi-leaf folder target reports each subject.
- Docs: named-targets owns target forms and the same-name path example (docs/guide/parts.md, target text in docs/guide/next.md). blocked-report owns report and automatic-silence text in docs/guide/next.md.
- Whichever merges second resolves the overlap in src/next.ts, tests/next.test.ts and docs/guide/next.md.

Superseded by Leaf split (A,B): "epic target" in the Blocked report binding tests means the epic's folder path, never its bare name. Name targets get the report through the two composition criteria above, not a combined test in this leaf.

Classification lock from issues/chart/repo-pause/forks/boundary.md Taken: `--resume` is always automatic; an explicit target, path or `--all` is manual even with an inherited `HERDR_PLUGIN_EVENT_JSON`; a no-input `next` is automatic only with a plugin event; the merge wake after a phase move is automatic. Never classify by `HERDR_PANE_ID` or leaf count.

Exclusions: Names (issues/chart/next-named-targets/forks/names.md) belongs to the sibling leaf named-targets. This leaf does not change target resolution; its tests pick leaves by slug, folder path, bare `next` and `--all`, never by owner name.

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md: no auth, secrets, outside calls or chains here. Proof is the smallest test at the CLI boundary: `akrogon next` and `akrogon phase` run against isolated registered repos (tests/helpers.ts) with the fake herdr (tests/fake-herdr.ts), asserting herdr calls made or not made, the error records on stderr (leaf, reason kind, blockers, phases, input names) and exit codes, never full prose wording. Criterion 5 is the composition proof the Leaf split decision names. Each new behavior shows one deliberate break turning its test red (for example dropping one blocker from the list). No live herdr run is required.

## Leaf architecture
- Owned: a picked-leaf set carried through the typed invocation (the `selectLeaves` result, or the `--all` inventory, src/next.ts:1260-1270, :698-717); the report in `dispatchLeaf` (src/next.ts:593-660) replacing the explicit-only throws at :629-644 with one shared line for picked leaves; blocker detail beside `eligibility` (src/turn.ts:8-20) that keeps its truth value, its deps-before-inputs order and merge-queue behavior; parked detection by name as `missingLeafMessage` does (src/state.ts:146-158); tests under tests/; the report text in docs/guide/next.md.
- Order per picked leaf at its dispatch attempt, against current inventory: merged completes as today (src/next.ts:618-621) with no line; failed gives the recovery line; else unmerged dependencies; else missing inputs; else normal dispatch, where merge turn, capacity and busy seats wait silently.
- Output: the existing `report()` JSON record on stderr (src/next.ts:111-118), one per picked leaf through its slug dedupe; any record sets exit 1 (src/next.ts:1341).
- Automatic passes (plugin events, `--resume`, merge wake) and dependents started by `dispatchDependents` carry no picked set and keep returning `waiting` silently.
- Excluded: no change to target resolution, `Selection`, eligibility truth values, merge order, capacity, or anything under `issues/`. The second leaf of this issue to merge resolves overlap in src/next.ts, tests/next.test.ts and docs/guide/next.md.
