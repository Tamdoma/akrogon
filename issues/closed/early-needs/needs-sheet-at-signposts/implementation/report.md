# Report: needs-sheet-at-signposts

Base: 632f9139 (AKROGON_BASE). Head: 8647fc24. No refresh needed: branch sat on current origin/main at pass start (`git fetch` clean, no rebase moves).

## Changed files

- skills/chart-issues/SKILL.md — `## Open` gains the needs-sheet paragraph (D1): one sheet per session with the signposts round before the first map, row taxonomy, operator-only answers, pending semantics, changed-list case. `## Take` needs-sheet paragraph retimed to the signposts round and gains the canonical `## Needs` record plus the late-find park-and-notice rule (D2); grants paragraph binds records to approved rows (D2). `## Drain` wait kinds name pending rows (D3). `## Autopilot` first reply previews the sheet and the wait list references rows; late-find and proposal parks send one notice (D4).
- skills/chart-issues/assets/questions.md — signposts paragraph: the sheet travels with the round; rows are not signposts questions, never re-asked (D5).
- skills/chart-issues/assets/shapes.md — `forks/signposts.md` shape gains `## Needs` after `## Taken` with one line per row and status; re-copy rule; `wait:` template names the row and notice result (D6).
- docs/use/autopilot.md — `Switch it on` supply list includes approvals; `What still waits for you` lists pending rows, proposal park notice, late-find park notice and the record-only fallback (D7).
- docs/use/plan-work.md — `Set the signposts` states the sheet, its `## Needs` record and pending semantics (D8).
- docs/reference/limits.md — `Supply needs and credentials` states signposts-round timing and the late-find rule (D9).

## Commands run

- `check stale-needs-rule-baseline: 0` — pre-change sweep, hits at SKILL.md:63 (`after the forks settle`) and SKILL.md:137 (`no approvals on the list`). Recorded in plan.md as the violations removed.
- `check stale-needs-rule: 0` — post-change sweep `grep -rniE "after the forks settle|during charting|no approvals on the list|missing need|first reply" skills/ docs/`. Remaining hits judged: none places a first ask after the signposts round and none excludes approvals from the opening list. SKILLS.md:25 and plan-work.md:24 use "first reply" for consultant/mode naming, not needs. SKILL.md:67 "during charting" describes when the leaf `grants` record is written inside already-approved bounds, not a first ask. SKILL.md:65/141 and docs/reference/files.md:51 use "missing need" for pending rows and the status display, not mid-chart discovery.
- `check needs-sheet-walkthrough: 0` — grep confirms each scenario's outcome is stated: `## Needs` shape (shapes.md:97,110), "operator decision" close rows (SKILL.md:43), "once per park" (SKILL.md:65), "never re-asked" (SKILL.md:43, questions.md:41), changed-list rows (SKILL.md:43,143).
- `verify leaf 8647fc24: green` — format, typecheck, test (1144 pass, 0 fail) on the committed head. All runs seconds-to-minutes; test suite ~58 s.

## Done-criteria

### 1. Each scenario reaches its stated outcome, in manual, autopilot and full autopilot

The changed rules state each outcome once, in sections that bind every mode (`## Open`, `## Take`) plus autopilot-specific ones (`## Autopilot`):

- No needs: sheet asks "none" (SKILL.md `## Open`), charting proceeds (all modes).
- Missing key: a row pending; charting proceeds, the affected proof and the handoff wait (`## Open`, `## Take`); presence check on draft readiness.yaml and `inputs[].steps` keep it visible (`## Take`), a pending row is never re-asked (`## Open`).
- Paid or live grant incl. helpers: a grant row names operation, identity, targets and bounds; the record binds only inside what was approved; helper operations are listed as rows (`## Open`, `## Take`).
- Fixture retention and secret-save: named row types (`## Open`); under autopilot they stay operator-only (`## Autopilot` wait list).
- Delivered-identity close: the door's own step under `## Open` close rule, explicitly "not rows" (`## Open` sheet paragraph).
- Close needing an operator decision: a sheet row (`## Open`).
- Early row still pending later: ordinary wait (`## Take` "rows stay pending", `## Drain` wait kind, `## Autopilot` wait list); `wait:` line names the row (shapes.md).
- Expanded operation after signposts / useful alternative inside authority: late find continues under `## Take`'s cut rule.
- No useful alternative: chart parks, drain moves on, one terminal statement and one `akrogon notice --attention` naming chart, blocker and record path; result recorded on the row added `late`, once per park (`## Take`).
- Notice fails or unavailable (outside hc, unregistered repo): terminal statement and record only (`## Take`).
- Changed-list yes chart: rows asked with the proposal before its charting (`## Open`, `## Autopilot` proposal rule unchanged in mechanism).

Mode coverage: the sheet is asked with the signposts round in manual and autopilot (operator answers the round and the rows) and in full autopilot (A answers signposts; rows are still operator-only — "`answered only by the operator and never A's pick under autopilot`"). The autopilot wait list and first-reply preview are restated in `## Autopilot` and docs/use/autopilot.md.

### 2. #129's four parks land as sheet rows, never mid-chart asks

- Cloudflare token + account id + domain → key, account and resource rows (`## Open` row taxonomy: "keys, logins, files, accounts, resources").
- Fixture re-record grant → grant row for paid launches (`## Open`: "grants for live changes and paid or nested launches").
- Recording-run grant → same grant-row type.
- Operator yes to a close → "closes that need an operator decision" row.
- Contrast: a delivered-identity close is the door's own step under `## Open`, "not rows" — matches the criterion's distinction.

### 3. No file in the set places the first ask after the signposts round or excludes approvals from the opening list

Proven by `check stale-needs-rule: 0` with per-hit judgments above: the only "after the forks settle" and "no approvals on the list" hits are gone; remaining hits are the new text or neutral mentions. The permitted exception (rows of a changed-list chart asked with its proposal) is stated in `## Open` and matches the criterion's carve-out. Product forks and the handoff review stay answered per mode (unchanged rules).

## Limitations

- The change reaches running doors only at the next release link (design stated limit).
- `akrogon notice --attention` proves publication to the operator's herdr-app session, not that a person saw it; outside hc or unregistered repos only the statement and record run (charting proof, readiness.yaml `proofs`).
- Standing dissent: B held the notice proof should target a private fixture; the fork records A's reason for the real session (Take's real-identity rule).

## Unverified criteria

None. All three criteria are text-semantics criteria verified by the reads and greps above; no code path changed.
