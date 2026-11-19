# Seed-writer, merged notes, 2026-11-19

## Q1 When and what
- Pick (A,B): written only on the explicit order of a person in the session, given after that person saw the exact section text; the agent may draft the points (B), the order makes them a decision. Heading names that person and the day, never an agent or model (B). Holds the decided change and, when stated, `Not in scope:` and `Done when:`; stands alone (A,B). Never holds a grant, approval for a live or paid action, a secret or handoff authorization (B). Never written by `## Lifecycle filing` callers, lesson-triggered reports or sessions with nobody to give the order (B). One exception sentence beside "adding no recommended fixes" and one optional template block after `Unverified intake.` (A); title rule, six sections and `Unverified intake.` unchanged (B). Colleagues' sessions may write it with their own name (B, from marker 2a).
- Rejected: verbatim words only (B: blocks #714's agent-drafted points); agent judges a decision was made (A,B); seed-issue never writes it (B); leave as is (A).
- Evidence: #714 body (A,B); seed-issue `## Report` (A,B); Nygard proposed vs accepted (B).
- Pitfalls: "sounds good" in passing recorded, removed by shown-text-then-order (B); a section reading as a grant, removed here and in door-record (B); agent advice under the heading, removed by the writer rule and the decider named at the map (A).

## Q2 Edit route
- Pick (A,B): yes, for an open report on the routed repo, one body edit: read body (A: and `updatedAt`), insert after `Unverified intake.`, change nothing else, `gh issue edit <n> -R <repo> --body-file -`, read back and confirm old body plus section; print the edited URL. One section per report; a changed decision replaces it with a new date, history kept by GitHub (B). Comments, labels, state, closed reports untouched (B).
- Rejected: filing time only (A,B); second report (B); author-only edits (B); a comment (B: not mirrored; signposts 4a).
- Pitfalls: whole-body replace (A: gh help); concurrent edit lost, A: stop when `updatedAt` moved, B: no conditional write in gh, recoverable from history; read-back mismatch reported as failure (A,B); a chart already imported the report, belongs to door-record (B).
- Proof (A): `gh issue edit` is a live write the brief names; one real create/edit/read-back/delete cycle on a throwaway issue under an operator grant before handoff, else the edit route is cut.

## Q3 Evidence beside it
- Pick (A,B): allowed only in a report that has a decision section (B), as separate `## ` sections after `## Suspected cause`, each heading naming who wrote it and the date; locks nothing; each says what was read, run, not checked (B).
- Standing differs: A read it as operator-tier research named in the intake; B as unverified agent findings checked against live code like any reporter claim, decision wins where they differ. Merged: read first as named intake material, its claims checked like any reporter claim (B's standing, A's read order).
- Rejected: inside the section under `### ` (B); none (A,B); a link to a consumer file (B); evidence without a decision (B).
- Evidence: #714 sections (A,B); #714 decision puts second-review item 3 out of scope, so decision wins (B); Nygard context vs decision (B).

## Where slots differ
- Q3 standing (above). Q2 concurrency handling (updatedAt stop vs stated limit). Q2 live-write proof raised by A only.
