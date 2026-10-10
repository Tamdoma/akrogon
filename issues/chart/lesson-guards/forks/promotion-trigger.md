# Promotion trigger

## Question
Q1. Who turns a new lesson into a GitHub report, and when?
Q2. How much may the automatic step do?

### Carries
- merge-throughput Off route: "#73 lessons to guards: separate destination, own chart later."
- learn-issues sort rules: guarded / checkable / stays (skills/learn-issues/SKILL.md:18-22).

## Findings
- Practitioner: Google SRE, Lunney/Lueder/Beyer, Postmortem Action Items (https://research.google/pubs/pub45906/) and Postmortem Culture workbook chapter (https://sre.google/workbook/postmortem-culture/), read 2026-10-10: lessons prevent recurrence only as tracked, owned items filed while fresh. Led to 1a. (A; B cited the workbook chapter only)
- Practitioner: Allspaw, SREcon24 slides (https://www.usenix.net/system/files/srecon24americas_slides-allspaw.pdf), read 2026-10-10: artifacts become a museum; not every learning is a fix. Led to keeping judgment lessons as lines. (A)
- Options: 1a writing seat files at write time (A); 1b separate pass after each leaf ends, merged or failed (B); 1c timed learn-issues sweep. 2a file intake only (A,B); 2b add the guard inside the finding leaf (rejected, B).
- Held disagreement: B prefers 1b because filing pulls the seat into investigation, dedupe and destination choice beyond its leaf (skills/check-issue/SKILL.md:59,89), and warns a success-only trigger strands failed-leaf lessons. 1a writes at the moment the lesson is written, so failed-leaf lessons are covered.
- Full exchange: slots/map-*.md.

## Taken
Operator 2026-10-10: "1a | 2a |"

- 1a: the seat that writes a lesson files a seed for it in the same step when a simple check could catch the mechanism, after a duplicate search. It does not trace existing guard coverage; charting does. Foreclosed: 1b separate completion pass, 1c timed sweep.
- 2a: the automatic step only files a seed. Charting decides scope and fix. Foreclosed: 2b editing checks or skills inside the finding leaf.
- Binding avoidance steps: duplicate search before filing (seed-issue's existing search); a real `gh` filing probe with the seat identity before handoff (pending); a seed is intake only, so a workaround lesson does not become a rule without charting.

## Proof: seed filing as a seat
- Approval: operator 2026-10-10 "1 yes" to: create one test report in Tamdoma/akrogon, read it back, delete it, confirm it is gone.
- Identity: gh keyring login ivanjuras (the login seats on this machine use), viewerPermission ADMIN. No secret values recorded.
- Target: Tamdoma/akrogon, PUBLIC, issues enabled. gh 2.102.0. Date 2026-10-10.
- Commands: `gh issue create -R Tamdoma/akrogon --title "[probe] lesson-guards seed filing test 20261010T080956Z" --body "...Marker: lesson-guards-probe..."`; `gh issue view 74 --json number,title,state,author`; `gh issue delete 74 --yes`; `gh issue view 74` and `gh issue list --search "lesson-guards-probe in:body" --state all`.
- Result: created https://github.com/Tamdoma/akrogon/issues/74, read back OPEN by ivanjuras, delete exit 0.
- Cleanup: absence confirmed, view returns "Could not resolve to an issue", search count 0.
- Limits: proves this login can create and delete issues in Tamdoma/akrogon. It does not prove filing into Tamdoma/tamdoma-framework, seed-issue's own dedupe search, or a seat's harness sandbox allowing gh network calls (seats run with full access per the harness templates in akrogon config). The issue was public for a few seconds and may have sent watcher notifications.

## Proof: framework destination and duplicate lookups (read-only, 2026-10-10)
- `gh repo view Tamdoma/tamdoma-framework --json visibility,viewerPermission,hasIssuesEnabled`: PRIVATE, ADMIN, issues enabled.
- `gh issue list -R Tamdoma/tamdoma-framework --state all --author @me --limit 3`: issues 212, 211, 210 created by this login on 2026-10-09, so real creation with this identity into framework is already on record.
- Duplicate lookup form `gh issue list -R Tamdoma/akrogon --state all --search "lessons learn-issues" --limit 5 --json number,title`: exit 0, returned #73.
- Limits: no fresh write into framework was made; the evidence is prior real creation by the same login.
