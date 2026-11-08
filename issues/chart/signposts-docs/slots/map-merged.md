# Merged map: signposts-docs

Sources: slots/map-A.md, map-B.md, map-C.md (codes are each slot's own).

## Inventory, merged

- files.md "Layout of issues/" `chart/<chart>/` row names only `CHART.md`, fork files and `direct/`; missing `forks/signposts.md` (session record, original in one chart, verbatim copies naming it), `INTAKE.md`, `seats.yaml`, `USAGE.md`, `slots/`. (A,B,C)
- plan-work.md "Open a chart": first reply also names the mode and who answers the signposts (C F4); "Each fork has its own file under `forks/`" and `status --charts` do not say `forks/signposts.md` is the session record and counts in TAKEN (B F8, C F5). (B,C)
- plan-work.md "Set the signposts": missing the consultant missed-angles exchange, the light round (4-7 questions, choices, a recommendation, what it steers, no research) and the account of priorities and trade-offs, original and copies, corrections and conflicts, chart order and drops, what a door session is, the autopilot unanswered rule. (B F2,F3,F5,F7; C F6)
- autopilot.md: mid-chart switch-on with no signposts asks them first (C F9); the signposts round is presented, not a wait, and unanswered questions are recorded with the built-in values filling (B F6, C F10); a drop A would make under full autopilot is recorded only (C F10); the next chart follows the signposts order (C F11); "Read the record" can name the `signposts:` line and the original's path, and handover entries carry the signposts path (B F4, C F13). (B,C)
- words.md "Chart door" and "Fork" entries assume the operator answers every fork; "Signposts" and "Autopilot" entries are current. (B F9, C F14)
- limits.md "What stays your job" and the product-questions bullet, why-it-works.md "A contract comes before code", what-it-is.md "Chart" word: operator-only answer wording; approvals stay operator-only. (B F10,F11,F16; C F19)
- commands.md `akrogon status` row: `--charts` columns undocumented; TAKEN counts every `forks/*.md` with a non-empty Taken, signposts included (`src/status.ts` `chartRow`). (B F8, C F20)
- skills.md chart-issues entry: no signposts or modes. (C F18, low)
- ways-to-run.svg label "door answers itself" omits the signposts exception. (B F12; C F16 low)
- chart-door.svg has no signposts or map step; plan-work's caption already says so. (A,B,C)
- skills/AREA.md Key files has no chart-issues entry. (B F13, C F22; both medium-low)
- Stories and examples: real earlier cases, untouched. (B,C)

## Forks and positions

1. Depth of the user pages: operator-visible behavior in plan-work and autopilot, linking the skill for records and procedure (A,B,C lean); not the whole rule.
2. Picture chart-door.svg: leave it, the caption covers the order (A,B,C lean). ways-to-run.svg: fix the label text only (B; C low).
3. files.md row: list the whole shapes.md chart tree (A,C).
4. Mode-aware wording on limits, why-it-works, what-it-is, words: include, approvals stay operator-only (B; C partly).
5. TAKEN counting: one home, the commands.md `status` row. (A)
6. skills/AREA.md: one Key files line for chart-issues and its assets (A pick; B,C medium-low).

## Pitfalls

- Copying skill steps into docs (where-things-go.md "One home per fact"). (A,B,C)
- plan-work "Answer one fork per round" (option-drawings leaf) and "Review the handoff" (proof-coverage, merged): stay out. (A,B,C)
- `tests/docs-links.test.ts` checks links and anchors; keep `#set-the-signposts`. (C)
- Stories stay as they happened. (B,C)

## Split

One akrogon docs leaf. (A,B,C)
