# Brief: lesson-write-rule

## What
One lesson-writing rule, in one shared file under `skills/`, referenced from every place a seat writes a lesson: `skills/plan-issue/SKILL.md:39`, the lesson-writing half of `skills/implement-issue/SKILL.md:31`, `skills/check-issue/SKILL.md:59,89`, `skills/chart-issues/SKILL.md:31`. The rule:
- Before adding a line, check the active list for a lesson with the same failure cause and scope; shared keywords are not a match, and an unsure match gets a new line. On a match, append the new case to that lesson's history file and add no line.
- A lesson whose mechanism a command could detect as a fixed pattern (the first clause of `/learn-issues`' Checkable definition, referenced, not copied; whether a running guard already covers it is left to charting), new or matched, gets `/seed-issue` run for it unless its history already links a report; the created or returned report URL is appended to the history file. A judgment lesson files nothing.
- A lesson about akrogon's own skills or command is written into akrogon's `learnings/` (root located by seed-issue's owner rule), left for the operator to commit; when the root cannot be found the seat says so and writes locally.

Consumes from seed-owner-routing: seed-issue's owner routing, its akrogon-root rule, and its existing-report outcome (URL printed, nothing posted).

Owned files: the five write-site lines above, the shared rule file, the lesson paragraphs of `docs/guide/learn.md`, `docs/guide/cheat.md:149`, `skills/AREA.md` if a key file is added.

## Why
Tamdoma/akrogon#73. Framework holds 145 active lessons, 3 Applied of 146 histories, about 4 new lines a day, with repeats. Nothing turns a checkable lesson into tracked work unless the operator runs /learn-issues, which the operator will not rely on.

## Done-criteria
1. The rule exists in one shared file; each write site points to it, and a sweep finds no restated copy in `skills/` or `docs/` (the fixed-pattern definition stays only in learn-issues).
2. A lesson whose failure cause matches an active line adds a case to that line's history and leaves the line count unchanged; a keyword-only or unsure match adds a line.
3. A checkable lesson whose history has no report link gets one `/seed-issue` run and the resulting URL in its history; a lesson with a linked report or a judgment lesson files nothing.
4. A lesson about akrogon's skills or command found in a consumer repo lands in akrogon's `learnings/`; with akrogon's root missing it lands locally with a visible notice.
5. A fresh agent that did not write the change, given only the shipped rule file, the files it references and each case's recorded evidence, decides five cases without posting, and the report records its verdicts, reasons and the subagent used; each matches: framework `2026-10-08-manifest-determinism-rewrites-checksums` repeated with the same cause (append, no line, seed if none linked), a new checksum failure with a different cause (new line), a judgment lesson on review style (line, no seed), a framework lesson about `skills/check-issue/SKILL.md` (written in akrogon, seed routed to Tamdoma/akrogon), a lesson whose history links a report (no seed). One deliberately broken rule variant (keyword match counts as a match) is run once and fails the second case.
6. `docs/guide/learn.md` links the rule file and names its outcome, `docs/guide/cheat.md:149` no longer presents /learn-issues as the only lesson outlet, and every relative link in the edited skill and guide pages resolves.
