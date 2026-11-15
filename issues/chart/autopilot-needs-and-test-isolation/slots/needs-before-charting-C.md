# Fork notes: needs-before-charting, slot C

## Q1 — the sheet lives in the signposts round and holds approvals as classes

Pick: one sheet, presented inside the signposts round (the round already pauses for the operator in manual/autopilot; under full autopilot it is presented and recorded). Contents: every foreseen need — keys, logins, files, destinations and done-states — plus every foreseen approval class: grant approvals for live changes and paid launches, a paid budget, fixture retention, secret-save, human-only prerequisites, and expected `akrogon close` steps. The first-reply supply list in `## Autopilot` stays as a best-guess preview, but its "no approvals" clause is deleted — that clause is precisely the contract that let paid-proof and close asks surface mid-chart.

Reason: it is the operator's verbatim ceiling ("at the signposts round at the latest") and this session already ran it — this chart's `forks/signposts.md ## Taken` holds a needs sheet asked there. Cost: needs are foreseen from intake+map, less precise than post-forks; a sheet row may turn out unnecessary when forks settle differently. That cost is a stale row, not a parked chart, so it is cheap.

Grant concreteness at that point: a grant's full scope (verified principal, targets, operations, repeat bounds — Take's list) cannot exist before leaf shapes settle, so the sheet asks approvals by class with purpose and consuming work; each leaf's concrete `grants` record keeps its existing during-charting recording before its first covered proof. If the class was not foreseen, see Q2.

Charting does not wait for sheet answers. Items stay pending; only the affected proofs and the affected leaves' `readiness` gaps wait — the asynchronous-approval sentence in Take already says this and stays. A missing foreseen item never blocks unrelated forks.

Rejected: (a) sheet in the first reply — asked before the map, so it would hold near-guesses, and the map is where needs become foreseeable; the operator's own "at the signposts round" picks the later point. (b) Keep post-forks placement with a "last ask" rule — still lands mid-chart, the reported failure. (c) Chart parks on unanswered sheet — the operator answers at their own pace today and waiting would stall all handed charts on one missing key.

## Q2 — park, and the park itself notifies; `akrogon notice` is the transport

Pick: a need or approval found after the signposts round is still operator-only. The chart parks — `wait:` line, drain moves on, span closes — exactly as today. The change is the notification: at the moment it parks, the door runs `akrogon notice --attention --title "chart <slug> waits: <the ask>" --body <details>` — existing machinery (src/akrogon.ts `notice` → src/notice.ts `writeNotice` into the session's `akrogon-notices/`, shown by herdr-setup's session-status bar as a toast with the attention sound; docs/commands.md:25 records it as "the watcher's needs-you notice" path). The `wait:` line records that the notice was sent (id/path), so the ask's delivery is auditable, and the pass-end line stays as the second surface.

Reason: the defect is invisibility over days, not the wait. A toast reaches the operator at the event, inside hc, no new command (signpost 5a), reuses the notification surface already built for "needs you". Cost: a toast can be missed; the `wait:` line and pass-end summary remain. Under full autopilot this matters most — the notice makes the parked state visible without A ending its turn for a round.

Cut-vs-park: the Take cut rule stays as the internal mechanism for operations that cannot be proven, but any cut that removes the chart's outcome is already required to park for the operator — so for needs, park is the only route; a silent cut under autopilot would lose handed work without consent. "Continue inside recorded authority" applies only where authority was already recorded (a granted class); a find inside a granted class needs no new ask.

Rejected: (a) presented mid-chart round — under full autopilot A would answer it itself, defeating the point; approvals stay operator-only. (b) Pass-end only — the reported failure. (c) Cut the contract — forfeits the outcome silently.

## Q3 — the edit list, and how it is judged

Surfaces to change:

1. SKILL.md `## Open` — the signposts paragraph gains that the round carries the session's needs sheet.
2. SKILL.md `## Take` — the needs-sheet sentence moves from "after the forks settle and before the door's proof calls" to the signposts round; the presence-check on draft `readiness.yaml` and the async-approval rule stay.
3. SKILL.md `## Autopilot` — first-reply list loses "no approvals" (it previews the sheet); the wait list's entries note the park sends a notice.
4. SKILL.md `## Drain` — the move-on list unchanged, but the park step gains the `akrogon notice` call.
5. assets/questions.md — the signposts-round light shape names the sheet as part of the round.
6. assets/shapes.md — the `wait:` line names that the notice id/path is recorded.
7. docs/use/autopilot.md — `Switch it on` first-reply paragraph and `What still waits for you` (a wait now also sends you a notice).
8. docs/use/plan-work.md — `Set the signposts` paragraph names the sheet.
9. docs/reference/limits.md:24 — "the chart door lists every key, file and approval" gets the sheet's location.

Judgment: skill text has no executable gate (signpost 5a, no new command). The done-criterion is a defect-narrative walk: replay each of the four parked charts in #129 (token+domain+account-id, fixture re-record grant, recording-run grant, `akrogon close` yes) against the changed text and show where each now lands — a sheet row at signposts or a park that notifies — with no route to a silent mid-chart ask. Plus B's implementer review of the diff. A grep for the removed sentences ("no approvals on the list", "after the forks settle and before the door's proof calls") across SKILL.md and docs/ verifies no stale copy survives (lesson 2026-09-11).

## Pitfalls

- A sheet asking "every need" before the map can only name classes for approvals; word it so it binds the ask's timing, not the grant's scope — otherwise operators pre-approve blanket grants. Removed by Q1's class-level ask.
- Notice spam: one notice per park event, recorded on the `wait:` line — never per pass or per fork.
- `notice` needs a resolvable session (repoSpace); outside hc the door can't reach it — the `wait:` line remains the only surface, stated as a limit.
- The first reply must not promise the sheet's contents it can't foresee yet — it says "the signposts round will carry the needs sheet", not a fabricated list.
- Restated text in docs/ drifting: the sweep in Q3 is a leaf requirement, not optional.

## Evidence

- better-than-training: SKILL.md `## Take` (sheet placement, async approvals, grant block), `## Autopilot` (first-reply list "no approvals", wait list), `## Open` (signposts paragraph: "after intake import and the consultant restart and before any map"), `## Drain` (move-on), `## Handover` (span closes on wait); assets/questions.md `## Operator questions` signposts paragraph; assets/shapes.md `## Autopilot` wait line; src/akrogon.ts `notice` case; src/notice.ts `writeNotice`; docs/use/autopilot.md, docs/use/plan-work.md `## Set the signposts`, docs/reference/limits.md:24, docs/reference/commands.md:25; issues/chart/.../forks/signposts.md `## Taken` (sheet at signposts, precedent). Read 2026-11-09.
- operator: #129 expected-behavior wording (intake verbatim).

## Questions the fork does not ask

- Does the signposts sheet's unanswered rows make the chart unchartable in manual mode (a material unanswered signposts question is re-asked before the first fork)? A sheet row is a supply, not a question — the text must say a pending row never re-asks, or manual sessions stall.
- Should a *grant* whose class was foreseen but whose scope came out different mid-chart re-ask? My answer folds into Q2 (park+notify), but the round should name it explicitly.
