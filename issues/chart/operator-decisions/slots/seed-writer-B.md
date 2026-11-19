# Fork notes: seed-writer, slot B, 2026-11-19

Read: INTAKE.md and #714 (held from earlier), forks/seed-writer.md `## Question` and `### Carries`, forks/marker.md `## Taken`, seed-issue `## Report`, body template, `## Lifecycle filing`, `## Submit and finish`. Read-only `gh` only.

## Q1. When may seed-issue write the section, and what may it hold?

Pick: only on the explicit order of a person in the session, given after that person was shown the exact section text. The agent may draft the points. The person's order to record them as a decision is what makes them a decision.
- Reason: this is the one moment a human vouches for words that later bind unattended (signpost 1a). It matches the door's own rule that a recommendation or silence is never an answer (questions.md, operator rounds paragraph).
- Holds: the decided change, and when the person states them, `Not in scope:` and `Done when:`. It stands alone, since the lock is only this text (marker decision 1). A pointer such as #714's "Details and evidence are in Proposed solution below" may stay as a signpost and binds nothing.
- Never holds: anything the agent adds unasked, a grant or approval for a live or paid action, a secret, or handoff authorization. Those stay in the door (chart-issues `## Take`, grants paragraph).
- Heading name: the person who gave the order, with that day's date. Never an agent or model name.
- Never written by `## Lifecycle filing` callers, lesson-triggered reports, or any session with nobody present to give the order.
- Unchanged: the title rule, the six sections, `Unverified intake.` (the observation is still unverified), and the ban on recommended fixes for every report without this order.
- Cost: one extra message, the shown text and the yes.
Rejected:
- The person's verbatim words only. #714's five points were agent-drafted from a consult. Verbatim-only blocks the real flow or turns into "write what you said".
- The agent judges that a decision was made. Agent advice gets the heading and binds unattended.
- Hand edits on GitHub only, seed-issue never writes. #714's edits ran through `gh` under the operator's account. #144 asks for a sanctioned place.
Evidence:
- operator · #714 body, read 2026-11-18 · the section holds five points, `Not in scope:`, `Done when:` and a pointer to agent-written text · it set what the section holds and the stands-alone rule.
- better-than-training · seed-issue `## Report` · "adding no recommended fixes or planning metadata" has no exception today · the rule needs one sentence beside it, not a rewrite.
- practitioner · Michael Nygard, "Documenting Architecture Decisions", 2011-11-15, read 2026-11-19 · a record is "proposed" until stakeholders agree and "accepted" once agreed · the order is the step from proposed to accepted.
Pitfalls:
- "Sounds good" in passing gets recorded as a decision. Removed by requiring the order after the text was shown.
- A section that reads as a grant ("approved to run the paid test"). Removed on both sides: seed-issue never writes one, and door-record should say a seed decision is never a grant.
Questions the fork does not ask:
- May a colleague's session write the section with the colleague's name? My pick: yes. Marker decision 2 already lets write-level accounts decide.

## Q2. May seed-issue add the section to a report already filed, and how?

Pick: yes, for an open covering report on the routed repo, by one body edit. Read the body, insert the section after `Unverified intake.`, change nothing else, write it back with `gh issue edit <n> -R <repo> --body-file -`, read the body again and confirm it is the old body plus the section. The final two lines print the edited URL.
- Reason: this is how every real decision will arrive. #714 was created at 21:53 and its last edit was 22:32 the same evening. A decision usually follows the consult, and the consult follows the filing.
- One section per report. A changed decision replaces the section text with a new date. GitHub's edit history keeps the old one. Once a door has taken it, changes go through the door.
- Cost: seed-issue gains its first write to an existing issue. The rule names this one edit and no other. Comments, labels, state changes and closed reports stay untouched.
Rejected:
- At filing only. A later decision then has no route, since a covering report means "the pass posts nothing" (seed-issue `## Report`, lookups paragraph).
- A second report that carries the decision and names the first. Two reports for one defect, plus exceptions to the covering rule and to the door's duplicate check.
- Edit only reports the filing account authored. A colleague's decision on the operator's report would need the second report above.
- A comment holding the section. Comments are not mirrored (`pullRepo` in src/pull.ts writes title, Source, URL and body), and signpost 4a names the body.
Evidence:
- better-than-training · GraphQL read 2026-11-19 · #714: 5 body edits, every editor the author. #144: none · the edit path is the observed one.
- better-than-training · `gh issue edit --help`, gh 2.104.0, 2026-11-19 · `-F, --body-file file` reads standard input with `-` · the same quoting route as `gh issue create` in `## Submit and finish`.
Pitfalls:
- The edit clobbers text. Removed by the read-back check. A mismatch is reported as a failure with the URL, and GitHub's edit history holds the prior body.
- Someone edits between the read and the write, and the write overwrites it. `gh` has no conditional write. Stated limit, recoverable from the edit history.
- The report's author lacks write on the repo, so the door shows "marked, not taken". Not removed here. The operator takes it in the door (marker decision 2).
- A chart already imported the report, so the edit is never read (chart-issues `## Open`, import paragraph, and signpost 4a). Not removable in seed-issue. Door-record should name, at open, a mirror that holds a marked section its intake copy lacks.

## Q3. May the evidence sit beside the decision, and what standing has it?

Pick: yes, only in a report that carries a decision section, as separate `## ` sections after `## Suspected cause`. Each heading names who wrote it and the date, as #714's do. It locks nothing. The door reads it as unverified agent findings, to be checked against live code like any reporter claim. Where it differs from the decision, the decision wins.
- Reason: the consult's rejected options and risks save the door's research around the decision. Kept outside the section, they cannot become binding by accident.
- Each evidence section says what was read, run and not checked, as #714 does ("Nothing was run").
- Cost: longer seeds. Evidence is copied into INTAKE.md once and never into leaf designs.
Rejected:
- Inside the decision section under `### `. The lock runs to the next `## `, so agent-written text would bind.
- No evidence at all. It is lost, or it gets packed into the locked text.
- A link to a file or transcript in the consumer repo. The door in another repo cannot read it. Only the body is mirrored.
- Evidence allowed with no decision. That reopens "recommended fixes" for ordinary intake.
Evidence:
- operator · #714 body · `## Proposed solution (operator-requested, 2026-11-18; agent and Fable 5.2 review)` and `## Second review (Gemini 4 Neon high, 2026-11-18)` sit after the six sections and name their authors · the shape already works.
- operator · #714 · the second review's item 3 is "Optional" and the decision puts it out of scope · evidence and decision can differ, so the decision must win.
- practitioner · Nygard, as above · an ADR keeps Context apart from Decision ("This section describes our response to these forces") · the same split.
Pitfalls:
- The door treats the evidence as proven. Removed by the stated standing and the Take key-part rule, which needs a real observation before handoff.
Questions the fork does not ask:
- #714's proposal was written into the issue before the decision, so another consultant could review it. Is an operator-requested proposal with no decision allowed? My pick: no. It is ordinary intake and the ban stands.
