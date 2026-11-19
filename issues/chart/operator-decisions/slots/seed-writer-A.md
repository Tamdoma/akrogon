# Fork notes, slot A: seed-writer, 2026-11-19

## Q1 When and what
- Pick: seed-issue writes the section only when a person with write access (marker 2a) states a settled decision in the session and asks for it to be recorded. It holds that person's decided points, in their words or in wording they read back and approved, plus the name and date in the heading; nothing the agent adds. One exception sentence beside "adding no recommended fixes or planning metadata" in `## Report`, one optional block in the template after `Unverified intake.`. Reason: keeps the no-fixes rule for agent text, sanctions the operator's. Cost: the agent must ask once "record this as your decision?" when it is unclear.
- Rejected: agent drafts the section from discussion without approval (marker inflation); leaving seed-issue as is (the contradiction #144 reports).
- Pitfall: agent puts its own advice under the heading; removed by the writer rule and the door showing the decider at the opening map.

## Q2 Edit route
- Pick: yes. seed-issue may add the section to an open report: read the body and `updatedAt` (`gh issue view --json body,updatedAt`), insert the section after `Unverified intake.`, write back with `gh issue edit <n> -R <repo> --body-file -`, re-read and confirm the rest of the body is byte-identical; when `updatedAt` moved between read and write, stop and report. Replacing an existing section is the same edit. Reason: #714's real path; decisions usually come after filing and after consultants read the report.
- Rejected: filing time only (forces a second report and fights the covering-report rule); edits outside the skill (unsanctioned, as today).
- Pitfall: `gh issue edit --body-file` replaces the whole body (gh 2.104.0 help), so a concurrent edit is lost; removed by the updatedAt compare and the re-read. Proof: `gh issue edit` is a live write; it needs one real create/edit/delete cycle on a throwaway issue under an operator grant before handoff, or the edit route is cut.

## Q3 Evidence beside it
- Pick: allowed as separate attributed sections that lock nothing (heading names who wrote it and that it is evidence, as #714's `## Proposed solution (operator-requested, …; agent and Fable 5.2 review)`); the door reads them as operator-tier research named in the intake. Reason: saves re-research around the decision, which is the operator's point ("I already did a quasi-charting process").
- Rejected: decision only (evidence lost or leaks into locked text).
- Pitfall: evidence read as locked; removed by marker decision 1 (lock ends at the next `## `).
