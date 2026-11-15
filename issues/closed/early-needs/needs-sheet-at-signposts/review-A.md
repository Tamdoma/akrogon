# Review A: needs-sheet-at-signposts

Base: 632f9139. Reviewed head: 8647fc24. Diff: 6 files, +20/−14, one commit.

## Evidence

- `git diff 632f9139..HEAD` read in full; each changed section checked against plan D1–D9 and the brief's done-criteria.
- `check stale-needs-rule: 0` (implementation) re-read: every remaining hit judged — SKILL.md:25, docs/use/plan-work.md:24 use "first reply" for consultant/mode naming; SKILL.md:67 "during charting" describes the leaf `grants` record bound inside approved rows; "missing need" hits describe pending rows or the status display. No file places a first ask after the signposts round; no file excludes approvals from the opening list.
- `check needs-sheet-walkthrough: 0`: `## Needs` shape after `## Taken` (shapes.md:97,110), "operator decision" rows (SKILL.md:43), "once per park" (SKILL.md:65), "never re-asked" (SKILL.md:43, questions.md:41), changed-list rows (SKILL.md:43,143).
- `verify leaf 8647fc24: green`: format, typecheck, test (1144 pass, 0 fail) on the committed head.
- Extra sweep beyond plan: `docs/use/quick-fix.md:17` ("work needs keys or files you supply, a live-account grant…") describes direct-route eligibility and stays true — a draft with `inputs`/`grants` is still refused direct. `docs/use/when-work-fails.md:21`, `docs/reference/files.md:51`, `docs/use/watch-while-away.md:30` describe leaf-level `Missing:` behavior, unchanged and still correct.

## Criterion walkthroughs

Criterion 1: all 12 scenarios have a stated outcome in the changed text, per report's walkthrough, verified against the diff: sheet/"none" (`## Open`), pending-row wait semantics (`## Open`, `## Take`, `## Drain`, `## Autopilot`, shapes `wait:`), grant rows incl. helpers binding only inside approval (`## Open`, `## Take`), delivered-identity close vs operator-decision close (`## Open`), late-find continue/park/notice once-per-park and record-only fallback (`## Take`, `## Autopilot`), changed-list rows with proposal (`## Open`, `## Autopilot`). Mode coverage: `## Open`/`## Take` bind all modes; `## Autopilot` restates waits and the first-reply preview; rows are "answered only by the operator and never A's pick under autopilot" — correct under full autopilot.

Criterion 2: the four #129 parks map to row types named in `## Open`; the close distinction is preserved.

Criterion 3: no file in the set places a first ask after signposts or excludes approvals; the changed-list carve-out is stated.

Design conformance: `## Needs` is its own section after `## Taken`, one line per row with pending/supplied/late status, verbatim re-copy on correction or status change (shapes.md); `wait:` lines reference rows and the notice result; `## Taken`-counting unchanged (`## Needs` follows non-blank `## Taken` content). No code, no tests added — matches standing-design interpretation (semantics judged by review).

## Findings

None. A `## Implementation notes` section was not needed; plan had no missing constraints.

## AREA.md check

No `AREA.md` in the diff. Docs behavior described by the changed pages matches the new rules; no dead pointer introduced.

## Verdict

ready
