# Design: needs-sheet-at-signposts

## Binding decisions, verbatim

### Signposts (issues/chart/autopilot-needs-and-test-isolation/forks/signposts.md), A's picks under full autopilot, 2026-11-09

- 5a: Skill text in chart-issues (SKILL.md and its assets), no new command, unless a fork finds a check only code can make. Foreclosed: a command that refuses a map while needs are unasked.
- 3a: the reported problem plus the boundary it directly implies; no wider sweep.
- 6a: No paid calls and no live mutations.

### Operator direction, Tamdoma/akrogon#129 Expected behavior (2026-11-05), verbatim

"even on full autopilot, slot A foresees every need the charting will require and asks the operator before charting. Needs may also be found and asked at the signposts round (manual or automatic signposts), but nothing after that."

### Needs before charting (forks/needs-before-charting.md), A's pick under full autopilot, 2026-11-09, checked by B and C

Q1. One needs sheet per door session, covering every handed chart, completed with the signposts round before the first map, in every mode, its rows answered only by the operator. The first reply previews it and no longer excludes approvals. Rows: every foreseeable key, login, file, account, resource and permission, human-only action, and operator-only authorization: grants for live changes and paid or nested launches, paid budget, fixture retention, secret-save, and closes that need an operator decision (delivered-identity closes the door runs under Open are not rows). A grant row names operation, identity, targets and bounds; a field the operator was not asked to approve is not approved, and a leaf's `grants` record binds only inside what was approved. A route whose authority cannot be named by then is unavailable under the sheet. "none" when empty. Charting proceeds while rows are pending; only the affected proofs and handoff wait; a pending row is never re-asked as a question. A chart added to the session after the signposts round (a changed-list yes) gets its rows asked with that proposal, before its charting. Canonical record in every mode: a `## Needs` list in the session's forks/signposts.md original, its own section after `## Taken`, one line per row with status (pending, supplied, late), re-copied verbatim to the session's charts like any correction; autopilot `wait:` lines reference rows.

Q2. A pending row is an ordinary wait. A new need or wider authority found later is a late find: if a useful outcome stays inside recorded authority, A continues it under Take's cut rule; otherwise the chart parks, drain moves on, and at that moment the door writes one terminal statement and runs one `akrogon notice --attention` naming the chart, what blocks it and the record path (never a secret value), records the notice path or its failed result on the row, and adds the row as `late`. The notice reports a blocker; it is not a new approval request. Once per park, never per pass or on resume. Outside hc or in an unregistered repo: terminal statement and record only. The operator's own next message resumes the chart (existing). A new-chart proposal's park sends the same one notice.

Q3. One skill-text leaf changes every restatement: SKILL.md Open, Take, Drain, Autopilot; assets/questions.md; assets/shapes.md; docs/use/autopilot.md; docs/use/plan-work.md; docs/reference/limits.md. Judged by scenario walkthrough and semantic review.

Rejected: sheet after the map or after forks (the operator's cutoff); conditional sheets per alternative (speculative authority); holding all charting until rows are supplied (stalls unrelated work); a late approval question by notice (breaks the cutoff); silent cut (loses handed work); a new command (signpost 5a). Standing dissent: B on the charting notice proof's target (real root vs a private fixture).

Excluded here: the test-fixture decisions of leaf fixture-repo-identity.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: a skill-text and docs change with no code, so no test is added (no vanity tests; a test exists only to prove a done-criterion, and these criteria are judged by the review seat reading the rules against the listed scenarios). No exact-phrase or ordering checks: lesson "Explanatory prose assertions couple behavior tests to wording" (learnings/LESSONS.md, 2026-10-01). The implementation report walks each scenario of criterion 1 and each park of criterion 2 against the changed text, citing section names.

## Leaf architecture

- Owned surfaces: skills/chart-issues/SKILL.md (`## Open` signposts paragraph and first-reply rules, `## Take` needs-sheet and grant timing, `## Drain` move-on, `## Autopilot` first-reply list, wait list and proposal park), skills/chart-issues/assets/questions.md (signposts round carries the sheet), skills/chart-issues/assets/shapes.md (`forks/signposts.md` shape gains `## Needs`; `## Autopilot` `wait:` line references a row and the notice result), docs/use/autopilot.md (`Switch it on`, `What still waits for you`), docs/use/plan-work.md (`Set the signposts`), docs/reference/limits.md (`What stays your job`).
- State changed: when operator-only needs are first asked, and where they are recorded. Consumers relying on it: the door's own Take presence check on draft `readiness.yaml` (`gaps` in src/readiness.ts, unchanged: rows still map to `inputs[].steps`), `akrogon status --charts` counting `## Taken` in forks/signposts.md (src/status.ts counts a fork taken when `## Taken` is followed by non-blank text; a `## Needs` section after it does not change that, checked 2026-11-09), the handover copy of forks/signposts.md (verbatim copies carry `## Needs` with no rule change).
- Existing machinery reused: `akrogon notice --attention --title --body` (src/akrogon.ts `notice`, src/notice.ts `writeNotice`), unchanged; proven at charting (readiness proofs).
- Exclusions: src/ and tests/ (no code change); issues/.
- Grep the old rules across skills/ and docs/ after the edit (lesson 2026-09-11 stale rule in docs) and report each remaining hit.
- The change reaches running doors only at the next release link.
