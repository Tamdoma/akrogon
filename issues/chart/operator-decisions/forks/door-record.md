# Door record

## Question

Q1. How does the door record a counting decision section as taken, and where does it show it?
Q2. Where does the rule that a counting seed decision is an operator answer live, so the existing "only a round reply answers" lines stay true?
Q3. What happens when a counting section appears in a seed after a chart already imported that seed?
Q4. What does the door do with a section that is "marked, not taken" (fails the account check, near miss, edited after the pull), in manual and in autopilot?

### Carries

- Signposts `## Taken` (forks/signposts.md): 1a binds in every mode without being asked again, shown as taken in the opening map; 2a locks exactly what it states, with the operator's correction (chart around it; a finding that it is not good may be raised; the starting point is always the recorded decision); 3a reaches every step through taken forks copied into leaf designs; 4a one entry, the section as pulled at door open; 5a rule text in existing skill files, free proofs.
- Marker `## Taken` (forks/marker.md) and seed-writer `## Taken` (forks/seed-writer.md): the literal, lock extent, account check with `lastEditedAt`, "marked, not taken" with the reason, operator may take it in words in the door; the section never holds a grant.
- Live surfaces: chart-issues SKILL.md `## Open` (import, skip identities already in a chart intake), `## Take`; questions.md paragraph holding "Recommendations and silence cannot supply an operator answer" and "The one exception is an autopilot session"; shapes.md fork shape and `## Preflight and validation` ("lacks an operator answer"); autopilot.md opening paragraphs.
- Related forks: finding-against (findings against a taken decision, conflicting decisions), leaf-carry.

## Findings

Notes: slots/door-record-A.md, slots/door-record-B.md, merged slots/door-record-merged.md (picks agree; Q3 resolved toward B). B rebuttal slots/door-record-rebuttal-B.md accepted: R1 a line saying the decision settles an open fork is labelled the door's reading (A's under autopilot), correctable by the operator, at first import and later; R2 a taken section later removed from the seed: fork stays taken, absence named as a fact, only the operator's words change it; R3 a manual take in the door writes the Q1 fork with the section verbatim, the operator's words and date, labelled taken in the door; R4 evidence: chart-issues `## Open` import and close-offer paragraphs (Q3 attaches to an existing step), Nygard 2011 superseded-not-deleted (Q3 replace), Willison 2025-06-16 (Q4 a refused section loses its authority claim), autopilot.md wait list has no intake entry (Q4 no wait), `chartRow` in src/status.ts counts a fork with text under `## Taken` (Q1).

## Taken

Operator, 2026-11-19, verbatim: "1a | 2a | 3a | 4a |"

Binding decisions:
1. Record (Q1 1a): at import, right after the account check, one fork file per counting section in normal fork shape. `## Taken` holds the section verbatim, heading included, plus one label line: seed decision from owner/repo#n, taken at import on <date>, not asked, decided by <login>; an unstated reason or alternative is written "not stated". `## Findings` holds the check record (logins and `permission`, `lastEditedAt`, pull time, commands). CHART.md Forks taken points to it without restating the answer. It is shown first in the opening map, in the signposts round's opening paragraph, in every consultant brief's carries as a lock, at the handoff review, and under autopilot in the pass-end line. An operator objection is a dated correction under `## Taken`, earlier text kept. A line saying the decision settles another open fork is labelled the door's reading (A's under autopilot) and the operator may correct it. Taken stays taken: the account check is not re-run on a later open.
2. Rule home (Q2 2a): one definition sentence in questions.md's round paragraph (the one holding "Recommendations and silence cannot supply an operator answer"): an operator answer is a reply in a round or a counting decision section in an imported seed, pointing to chart-issues `## Open`, where the test and the record step live. The "one exception" lines in questions.md and autopilot.md and the "operator answer" lines in shapes.md stay as written.
3. Later section (Q3 3a): read at the next door open, never mid-chart, by comparing each GitHub source's current mirror with its INTAKE copy. Chart still open: the door takes it, appends a dated `## Source` block to INTAKE.md (first copy untouched) and writes the fork as in 1; a taken fork it contradicts goes to finding-against; a replaced section that counts is a dated correction. Chart handed off, closed, or identity in a leaf's `sources`: named only, and in the autopilot pass-end line. A taken section later removed from the seed: the fork stays taken, the absence is named as a fact, and only the operator's words change it.
4. Not counted (Q4 4a): plain intake in every mode, no fork file; the reason in INTAKE `## Agent findings` and the opening map. Manual: the operator may take it in words in the door, which writes the fork as in 1 with the section verbatim, the operator's words and date, labelled taken in the door; silence leaves it not taken. Autopilot: ordinary forks A answers, the reason in CHART.md `## Autopilot` and the pass-end line, no wait. "Edited after the pull" and a failed permission read get one retry at that open.
Foreclosed: per-point forks, INTAKE only, per-file exceptions, first-import only, mid-chart re-reads, waiting on a not-counted section.
