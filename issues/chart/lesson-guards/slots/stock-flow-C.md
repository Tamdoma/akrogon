# Fork notes, slot C: stock-flow

## System map (current)

Stock: active lines in `learnings/LESSONS.md` (akrogon 30 lines, framework 145 bullet lines, 199 file lines).

Inflows (every one writes a line plus a history file, none reads the stock first):
- plan-issue (skills/plan-issue/SKILL.md:39), chart-issues (skills/chart-issues/SKILL.md:31), implement-issue (skills/implement-issue/SKILL.md:31), check-issue A (skills/check-issue/SKILL.md:59), check-issue B at merge handoff (skills/check-issue/SKILL.md:89).
- Measured rate, framework: 67 lines dated 2026-09-23..10-09, about 4 per day, 10 on 2026-10-08 alone.

Outflows:
- implement-issue "applying a lesson removes its active line" (skills/implement-issue/SKILL.md:31): never fires, because implement does not read the stock. Framework history holds 3 `Applied` files out of 146.
- learn-issues Guarded delete: operator-invoked, foreclosed as the drain.

Readers: plan-issue and chart-issues read the whole file each pass. This is where stock size has a real cost (about 15k tokens per plan on framework) and where noise lowers quality. Implement and check do not read it, so for them the size is free.

Loops today: one open chain (write) with no balancing loop. Taken decisions already close one loop for checkable lessons: write -> seed (promotion 1a) -> chart -> guard leaf -> line removed in the same diff (lifecycle 4a). Its delay is the charting cadence. The gaps the Question names: judgment lessons, already-guarded lines, cross-repo lines, backlog.

## Q1 pick

P1. Dedupe at the inflow: before writing a line, the writing seat greps `learnings/LESSONS.md` for the mechanism's key terms (the same search 1a already requires before seeding, pointed at the local file first). A hit means append the new case to the existing history file and leave the line count unchanged. No hit means write the line as today.
- Reason: this is a balancing loop on the inflow at the only point where every seat already touches the stock. Recurrence then concentrates evidence instead of adding lines, and a history file with several cases is the recurrence signal charting needs to rank seeds, with no new state. Framework already shows the duplication: "checksum" 6 lines, "schema" 6, "receipt" 3, and three 2026-09-12 history files already carry more than one `## Case` section, so the appended-case form exists.
- Cost: one grep per lesson written, inside a step the seat already performs. No new component, pass, command, state or file format.

P2. A lesson lives where its guard will live: a lesson about a shared akrogon skill or command is written into akrogon's `learnings/` (located through the installed command, as lifecycle 1a already does for the seed), not the consumer's.
- Reason: lifecycle 4a drains a line only when the guard leaf and the line are in the same repo. Routing the line with the seed makes the cross-repo gap disappear instead of needing a retirement owner. Same rule as seeds, so no second routing rule to learn.
- Cost: none beyond the path lookup 1a already pays. Framework's current file has 0 lines naming akrogon skills, so the change affects future lines only.

P3. Judgment lessons and the backlog: no option meets the bar. Under lifecycle 3a a judgment lesson can never be Applied, so by definition nothing automatic drains it, and the 145-line backlog never passed through 1a. Least-cost: one bounded operator run of the existing `/learn-issues` per repo (one pass, not a dependency), which deletes guarded lines and prints seeds for the rest. After that the P1 and 4a loops hold the stock near its judgment-lesson floor. State this plainly to the operator rather than inventing a drain.

## Rejected options

- Reader drains (plan-issue or chart-issues removes a line when it finds the mechanism guarded while planning): slowdown, since tracing 145 mechanisms through code on every plan is a learn-issues pass hidden inside planning, and quality loss when a planning seat deletes a lesson outside its leaf.
- Age-based expiry on the date already on the line: needs a pass to execute it, and deletes unread lessons on a clock, which is a quality loss. Also a new rule with no owner.
- Judgment lesson leaves when a docs leaf absorbs it into grounding (AREA.md): sound in principle, but it introduces a second exit reason beside Applied ("Moved to <doc>" in history) and 3a foreclosed instruction rules as applied. Raise only if the operator reopens 3a.
- Writer traces existing guard coverage before writing: foreclosed by promotion 1a ("it does not trace existing guard coverage; charting does") and it slows every seat.
- Stop writing lessons from implement and check (cut inflow to plan and chart only): removes real signal, the check seat finds most reusable nits.
- Timed sweep, completion pass, any new akrogon command: foreclosed by the bar and by promotion-trigger.

## Evidence

- E1 (tier: local measurement, 2026-10-10): framework LESSONS.md 145 lines, 3 Applied history files of 146, 67 lines in the last 17 days, repeated classes (checksum 6, schema 6, receipt 3), 0 lines naming akrogon skills. akrogon LESSONS.md 30 lines.
- E2 (tier: skill text, read 2026-10-10): the only outflow rule is skills/implement-issue/SKILL.md:31 and it cannot fire because implement does not read the stock; plan-issue and chart-issues are the only readers (plan-issue/SKILL.md:25, chart-issues/SKILL.md:31).
- E3 (tier: practitioner essay): Meadows, "Leverage Points: Places to Intervene in a System", 1999, https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/ . Changing a rule (where a lesson is written, what counts as a new line) is a higher leverage point than adjusting a flow rate or adding a buffer. Used for P1 and P2 over a sweep. Not re-read today.
- E4 (tier: practitioner essay): Senge, The Fifth Discipline, 1990, "shifting the burden" archetype, summary at https://thesystemsthinker.com/the-shifting-the-burden-archetype/ . A symptomatic fix (an operator pass) weakens the fundamental fix (seats closing their own loop). Used to reject learn-issues as the standing drain while keeping it for the one-time backlog. Not re-read today.
- E5 (tier: practitioner guide): Google SRE Workbook, Postmortem Culture, 2018, https://sre.google/workbook/postmortem-culture/ . Recurrence prevention comes from owned tracked items filed while fresh, not from a growing document. Supports keeping 1a as the drain and P1 as the counter.

## Pitfalls

- Pt1. The seed queue becomes the new stock (burden shifts from LESSONS.md to GitHub intake). Removed by: the seed carries the history path and case count, so charting ranks by recurrence, and P1 keeps one seed per class.
- Pt2. Grep misses a duplicate because the mechanism is worded differently. Removed by: a miss only costs one extra line, and the next writer's grep on the newer line still finds the earlier one through shared file or command names, which is what the measured duplicates share.
- Pt3. P2 writes into a checkout the seat does not own and leaves it uncommitted, as check-issue already does for the consumer checkout (SKILL.md:59). Removed by: same "left for the operator to commit" rule, and a missing akrogon checkout fails visibly and the lesson stays local, mirroring lifecycle 1a's invalid-target rule.
- Pt4. Plan seats on akrogon now see consumer-found lessons about skills. That is the intended reader. No action.
- Pt5. P1 appends a case to a history file whose line a guard leaf later removes; 4a's "Applied" append still works on the same file. No action.

## Questions the fork does not ask

- Q-C1. Is stock size itself the cost, or only reader noise? If plan-issue read-first kept only lessons matching the leaf's touched paths, 145 lines would be harmless. That changes the goal from "shrink the stock" to "shrink what readers consume", and may be the cheaper lever.
- Q-C2. Should framework's bold-date, "mechanism:" line format be aligned with akrogon's, since P1's grep and 1a's seed text both read the line? Different formats are a hidden cost per consumer repo.
- Q-C3. Is the operator willing to run `/learn-issues` exactly once per repo for the backlog, as a one-time step rather than a standing dependency?
