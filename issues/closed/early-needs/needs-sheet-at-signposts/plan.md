# Plan: needs-sheet-at-signposts

Skill-text and docs change, no code. Judged by scenario walkthrough and semantic review, per design. No test is added: every done-criterion is judged by the review seat reading the changed rules against the listed scenarios plus one mechanical stale-rule sweep (standing-design interpretation recorded in design.md; lesson 2026-10-01 bars wording assertions, so no text-comparison test is written).

## Read-first paths

- skills/chart-issues/SKILL.md — `## Open` last paragraph (signposts round), `## Take` needs-sheet paragraph and grants paragraph, `## Drain` move-on rule, `## Autopilot` first-reply list, wait list, proposal park.
- skills/chart-issues/assets/questions.md — the signposts-round paragraph (light shape, 4-7 questions, unanswered/conflict rules).
- skills/chart-issues/assets/shapes.md — `forks/signposts.md` shape paragraph and template; `## Autopilot` record lines (`wait:`); the mode-record handover copy rule.
- docs/use/autopilot.md — `Switch it on`, `What still waits for you`.
- docs/use/plan-work.md — `Set the signposts`.
- docs/reference/limits.md — `What stays your job`, "Supply needs and credentials".
- Source of truth for the new rules: issues/chart/autopilot-needs-and-test-isolation/forks/needs-before-charting.md `## Taken` (Q1, Q2, Q3 and final shape) and forks/signposts.md.
- Reported failure: issues/seeds/129-chart-issues-autopilot-finds-operator.md.
- Consumers confirmed unchanged: src/status.ts `## Taken` counting (line ~489: `## Taken` followed by non-blank text; a `## Needs` section after it changes nothing — checked by design 2026-11-09), src/readiness.ts `gaps`, src/akrogon.ts `notice` / src/notice.ts `writeNotice`.

## Decisions

D1. `## Open` (SKILL.md signposts paragraph): state that the needs sheet is asked once per door session, completed with the signposts round before the first map, in every mode; rows cover every foreseeable key, login, file, account, resource and permission, human-only action, and operator-only authorization (grants for live changes and paid or nested launches, paid budget, fixture retention, secret-save, closes that need an operator decision — delivered-identity closes the door runs under Open are not rows); rows are answered only by the operator; "none" when empty; charting proceeds while rows are pending and only the affected proofs and the handoff wait; a pending row is never re-asked as a question; a chart added after the signposts round by a changed-list yes gets its rows asked with that proposal before its charting; a route whose authority cannot be named by then is unavailable under the sheet.

D2. `## Take` (SKILL.md): replace "after the forks settle and before the door's proof calls" timing with the signposts-round sheet; keep the row's fields (purpose, consuming leaves, exact permissions and resources, official source and date checked, destination, done), the presence check on draft readiness.yaml, inputs[].steps storage and the one-batch key creation; add the late-find rule in every mode: a need or wider authority found after the signposts round either continues a useful outcome inside recorded authority under the cut rule, or the chart parks with one terminal statement and one `akrogon notice --attention` naming the chart, the blocker and the record path (never a secret value), the notice path or its failed result recorded on the row added as `late`, once per park, never per pass or on resume; outside hc or in an unregistered repo the terminal statement and record only. The grants paragraph gains: a grant row names operation, identity, targets and bounds, a field the operator was not asked to approve is not approved, and a leaf's `grants` record binds only inside what was approved — so charting-time grant recording no longer invents authority.

D3. `## Drain` (SKILL.md): the move-on wait kinds name pending needs-sheet rows; a parked late find moves on under the same rule.

D4. `## Autopilot` (SKILL.md): the first-reply supply list no longer excludes approvals — it previews the needs sheet; the wait list references needs-sheet rows; a new-chart proposal's park sends the same one notice; a changed-list yes chart's rows are asked with its proposal.

D5. questions.md signposts paragraph: the needs sheet travels with the signposts round; rows are operator-only answers recorded under `## Needs` in the signposts record, not signposts questions, so the unanswered-signposts rules never apply to them and a pending row is never re-asked.

D6. shapes.md: the `forks/signposts.md` paragraph and template gain `## Needs` as its own section after `## Taken`, one line per row with status (pending, supplied, late); the correction re-copy rule carries `## Needs` verbatim; the `## Autopilot` `wait:` line template references the row and the notice result.

D7. docs/use/autopilot.md: `Switch it on` first-reply list includes approvals; `What still waits for you` names pending sheet rows, late finds, the proposal park notice and the outside-hc record-only case.

D8. docs/use/plan-work.md `Set the signposts`: one needs sheet per session asked with the signposts round, rows operator-answered, pending rows hold only the affected proofs and handoff.

D9. docs/reference/limits.md `What stays your job`: "Supply needs and credentials" says the door asks every need and approval with the signposts round before charting and a later find routes inside authority or parks with a notice.

## Units and waves

Serial-solo: one wave, one unit. A implements this plan itself, no workers.

- U1 owns: skills/chart-issues/SKILL.md, skills/chart-issues/assets/questions.md, skills/chart-issues/assets/shapes.md, docs/use/autopilot.md, docs/use/plan-work.md, docs/reference/limits.md. No shared test resource.

## Docs checklist

Agent docs: skills/chart-issues/SKILL.md, skills/chart-issues/assets/questions.md, skills/chart-issues/assets/shapes.md (one line each above). Human docs: docs/use/autopilot.md, docs/use/plan-work.md, docs/reference/limits.md (one line each above). No other doc affected; the stale-rule sweep confirms.

## Criterion proofs

### Criterion 1 — each scenario reaches the stated outcome in manual, autopilot, full autopilot

Where each scenario's outcome is stated in the changed text:

| Scenario | Stated outcome | Where it must be stated |
|---|---|---|
| No needs | sheet asks "none", charting proceeds | D1 (Open), D8 (plan-work) |
| Missing key | row pending; charting proceeds, that proof and handoff wait; presence check + inputs[].steps keep the need visible | D1, D2 |
| Paid/live grant incl. helpers | grant row names operation, identity, targets, bounds incl. transitive helpers | D1, D2 |
| Fixture retention, secret-save | row types on the sheet | D1 |
| Delivered-identity close | the door's own step under Open, no row | D1 |
| Close needing an operator decision | a sheet row | D1 |
| Early row still pending later | ordinary wait, never re-asked, only affected proofs/handoff wait | D1, D2, D3, D6 |
| Expanded operation after signposts | late find; continue inside recorded authority via cut rule | D2 |
| Useful alternative inside authority | continuation under cut rule | D2 |
| No useful alternative | park: terminal statement + one `akrogon notice --attention`, row `late` with notice result, once per park | D2, D4 |
| Notice fails/unavailable (outside hc, unregistered repo) | terminal statement and record only | D2 |
| Changed-list yes chart | rows asked with the proposal before its charting | D1, D4 |

Proof: the implementation report walks each scenario in each mode against the changed text, citing section names (design: judged by scenario walkthrough and semantic review). Command: the semantic check `grep -n "## Needs" skills/chart-issues/assets/shapes.md` plus read-back of each edited section — run under `akrogon run-check --name needs-sheet-walkthrough`. Size: seconds. Rerun trigger: any edit to a file in the set; no model-facing inputs, no recording.

Condition checks (decision → condition it can reachably break → case that fails on violation):

- D1 → crit 1 "close needing an operator decision is a row": if the Open text drops "closes that need an operator decision" from row types, that scenario has no stated outcome. Case: `grep -n "operator decision" skills/chart-issues/SKILL.md` must hit inside `## Open`/`## Take`. Red shown by temporary omission — see red record below.
- D1 → crit 1 "pending row is never re-asked": an early row still pending must not be re-asked as a question. Case: the changed text must hold "never re-asked" (semantic read); a mechanical variant: `grep -n "never re-asked\|re-ask" skills/chart-issues/SKILL.md`.
- D2 → crit 1 "notice once per park": the park must send exactly one notice, not one per pass. Case: changed text holds "once per park, never per pass or on resume"; grep "once per park".
- D4 → crit 1 "changed-list yes": rows asked with the proposal. Case: grep "changed list" co-occurrence with rows in `## Autopilot`.

### Criterion 2 — #129's four parks land as sheet rows, never mid-chart asks

Mapping each reported park to its row type under the changed rules:

| #129 park | Row type in changed text |
|---|---|
| CF_REGISTRAR_PROOF_TOKEN + account id + domain | key + account + resource rows |
| fixture re-record grant | grant row (paid launches) |
| recording-run grant | grant row (paid launches) |
| operator yes to a close | close-needing-decision row |
| (contrast) delivered-identity close | door's own step under Open, no row |

Proof: report maps each park to a row citing the changed row taxonomy; the sweep asserts the taxonomy names every type. Commands: `grep -n "grant\|account\|secret-save\|retention\|operator decision" skills/chart-issues/SKILL.md` under run-check, semantic read of hits. Size: seconds. Rerun: on edit.

Condition checks:

- D1/D2 → "never as a mid-chart ask": the sheet timing phrase must move to the signposts round everywhere. Case: `grep -rn "after the forks settle" skills/ docs/` must return no hit — the temporary edit keeping the old phrase is the red case (recorded below).
- D1 → the close contrast: "delivered-identity closes the door runs under Open are not rows" must be stated so the door's existing close step is not turned into a row. Case: grep "not rows\|are not rows".

### Criterion 3 — no file places first ask after signposts or excludes approvals from the opening list

Proof command (the stale-rule sweep, run under `akrogon run-check --name stale-needs-rule`):

```sh
grep -rniE "after the forks settle|during charting|no approvals on the list|missing need|first reply" skills/ docs/
```

Every hit is judged semantically (lesson 2026-09-14: ambiguous prose, Nit ambiguous hits; lesson 2026-09-11: stale rule in docs). Expected post-change: no hit places a first ask after the signposts round and no hit excludes approvals from the opening list, except the permitted changed-list case (rows of a chart added mid-session, asked with its proposal). Each remaining hit and its judgment is reported in implementation/report.md. Size: seconds. Rerun: on edit; also catches prose that escaped the listed set (e.g. docs/use/quick-fix.md, other skills).

Condition checks:

- The sweep phrase "missing need" must still hit legitimately: `## Autopilot`'s wait list retains "a missing need" semantics reframed as pending rows — judged hit, kept if it names rows, rewritten if it implies mid-chart discovery.
- Red record for the sweep: pre-change baseline run below shows the current hits the edit must remove or reframe.

## Red records (temporary-edit violations shown at planning)

No test exists to run red; the sweep commands are the cases. Baseline red outputs (pre-change) recorded here as the violations the change removes:

- `grep -rn "after the forks settle" skills/ docs/` → `check stale-needs-rule-baseline: 0` hit at skills/chart-issues/SKILL.md:63 (`## Take` sheet timing). Post-change: zero hits; shown by running the same command after the edit.
- `grep -rn "no approvals on the list" skills/ docs/` → same baseline run, hit at skills/chart-issues/SKILL.md:137 (`## Autopilot` first reply excludes approvals). Post-change: zero hits.
- `grep -rn "during charting" skills/chart-issues/SKILL.md` → hits in `## Take` grants line and `## Handoff`; the grants-timing hit is reframed to "bound inside the sheet's approved rows", other hits judged for whether they place a first ask late.
- Temporary-edit red for "closes that need an operator decision": verified by the grep case under criterion 1 — omitting the row type makes `grep "operator decision"` empty, shown before writing.

## Verification steps

1. Apply edits per D1–D9.
2. `akrogon run-check --name stale-needs-rule -- grep -rniE "after the forks settle|during charting|no approvals on the list|missing need|first reply" skills/ docs/` — judge every hit.
3. `akrogon run-check --name needs-sheet-walkthrough -- grep -n "## Needs\|operator decision\|once per park\|never re-asked\|changed list" skills/chart-issues/SKILL.md skills/chart-issues/assets/shapes.md skills/chart-issues/assets/questions.md` — confirm each scenario's outcome is stated.
4. Report walks all 12 scenarios × 3 modes, the 4 parks, and every sweep hit with judgment.
5. Checks: `format`, `typecheck`, `test` run per configured `checks` at implementation end (`test` is the `full` member); prettier's check scope covers src, tests and skills/chart-issues/scripts — the edited markdown files are outside it, but edits keep each file's existing style.

## Open limitations

- The change reaches running doors only at the next release link (design stated limit).
- `akrogon notice` proves publication to the operator's herdr-app session, not that a person saw it; outside hc or unregistered repos the record-only path is the stated fallback (proof limits, readiness.yaml).
- Standing dissent from B on the notice proof's target (real root vs private fixture) is carried in the fork record; the changed rules name the real session as the target per Take's real-identity rule.

## Notes for review (brief/design conflicts)

None found. Brief and design agree; the design's Q1/Q2/Q3 Taken text is the contract source.
