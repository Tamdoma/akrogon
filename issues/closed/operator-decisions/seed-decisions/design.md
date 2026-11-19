# Design: seed-decisions

## Binding decisions, verbatim

Chart: issues/chart/operator-decisions (registered akrogon root). Consultant: B claude claude-fable-5-2 high. Options and reasons are in each fork's `## Question` and `## Findings`.

### Signposts (issues/chart/operator-decisions/forks/signposts.md, Taken, verbatim) (A,B)

Operator reply, door message 2026-11-18, verbatim:

"What do you mean by unreliable tests? | Yes that's correct. We can still chart, but around it. And if we find out that the actual original solution is not good during the charting, when we're doing the charting around it, that's still fine. But the initial idea has to be the one that we are charting around. Simply because I already did a quasi-charting process inside of the consumer repo. | 1a | 2a | 3a | 4a | 5a | 6a |"

Picks: 1a 2a 3a 4a 5a 6a. Harness for B not answered; claude kept.

Operator correction on 2a, binding: charting starts from the recorded decision and charts around it; when charting finds the original solution is not good, that finding is still fine to raise, but the starting point is always the operator's recorded decision, because the operator already ran a quasi-charting process in the consumer repo.

Ranked priorities: (1) a decision the operator recorded in a seed is never asked again and is the starting point of the chart; (2) everything the decision leaves open is still charted; (3) the change stays small.

Hard limits: rule text in existing skill files only; free proofs only; akrogon repo only; one entry point, the marked seed section as pulled at door open.

Account: the session makes a marked operator decision in a seed count as taken in every mode and carry into every leaf's binding decisions, while charting still covers what it leaves open and may surface findings against it. It gives up command code, paid door runs, later-edit and comment entry points, and charting #714 now.

Chart order: operator-decisions only. Dropped: Tamdoma/tamdoma-framework#714 (charted in a later session after release).

Correction 2026-11-19 (operator, leaf-carry round, "2a"): hard limit 5a reads "rule text in existing files only", covering the docs sentences the change makes false; no new file.

### Marker (issues/chart/operator-decisions/forks/marker.md, Taken, verbatim) (A,B)

Operator, 2026-11-19: Q1 "1a"; Q2 after the reshape "2a".

Binding decisions:
1. Marker (Q1 1a): a heading line starting `## Operator decision (<name>, <date>)`, rest of the line free. The lock is the text under it up to the next `## ` heading. The body is free; `Not in scope:` and `Done when:` are locked when present and never required. A mention in prose is not a marker. Text the section points to is not locked. Counts only in mirrored GitHub seeds. A near miss (a decision-like heading not matching) is named in the opening map as "marked differently, not taken". Sub-headings inside the section use `### `. The literal lives once as this binding decision, copied into each affected leaf; an agreement test on that one literal is allowed.
2. Who counts (Q2 2a): the section counts when the issue author and every body editor have `permission` write or admin (maintain maps to write) on the issue's own repo, read per distinct login with `gh api repos/<r>/collaborators/<login>/permission` after the pull at door open; `permission`, never `role_name`. Anything else, a failed read, or a body edit later than the pull is "marked, not taken" with the reason, and the operator may take it in words in the door. The opening map names the deciding login.
Reasons: one literal the door finds without judging (Q1); colleagues with write decide, strangers on the public akrogon repo do not, with no list to keep (Q2, operator: "how are my colleagues going to make any decisions?").
Foreclosed: required parts, door-judged decision text, labels; marker alone, door account only, org membership, config account list, last editor only.
Limits recorded: the permission read is proven only as admin (ivanjuras); a write-level caller and the Moderate role mapping are unobserved. Operator did not ask for the colleague run.

### Seed writer (issues/chart/operator-decisions/forks/seed-writer.md, Taken, verbatim) (A,B)

Operator, 2026-11-19: Q1 free text (verbatim above), Q2 2a, Q3 3a, Q4 4a.

Binding decisions:
1. Writing the decision (Q1, operator correction): seed-issue writes the `## Operator decision (<name>, <date>)` section when the person's own words in the request to seed, or to add to a filed report, state a settled decision; the agent infers the decided points from those words, including words that point at a fix settled earlier in the same session ("record the fix we agreed"), and writes them with no confirmation step and no display of the section. Unclear words ("I think we should do X") write no section. The final printed lines say in one clause that a decision section was written, without its text. It holds only what the person's words decided, never the agent's own advice. The heading names that person (git `user.name`) and the day, never an agent or model. It never holds a grant, live or paid approval, secret or handoff authorization. Colleagues write under their own name.
2. Edit route (Q2 2a): seed-issue may add or replace the section on an open report: the report the person names, else the covering report the lookups found. Read the body, put the section after `Unverified intake.` (top of the body when that line is absent), change nothing else, write with `gh issue edit <n> -R <repo> --body-file -`, read back and confirm that the text outside the section is unchanged and the section equals what was written, ignoring trailing whitespace; a mismatch is a failure printed with the URL. One section per report; a changed decision replaces it with a new date. Comments, labels, state and closed reports are untouched. The concurrent-edit window is a stated limit; GraphQL `lastEditedAt` is the body-edit time.
3. Background (Q3 3a): sections the person's words ask for, before or after a decision, each headed with wording to the effect "proposed, not decided" plus author and date (not a literal; the door gives it no meaning), lock nothing, hold no research tier of their own (each claim takes the tier of the source that confirms it), and lose to the decision where they differ.
4. One exception sentence beside "adding no recommended fixes or planning metadata" covers both the decision section and requested background; `## Lifecycle filing` callers, lesson-triggered reports and sessions with no person's request write neither.
5. Proof (Q4 4a): grant and proof recorded above; one of two cycles used, fixture deleted and absent.
Reasons: the operator's words are the decision ("It has to infer it from my own text … No formal ways, and no displaying the entire thing"); #714's real path was an edit after filing; the consult's write-ups save door research.
Foreclosed: show-then-confirm, agent-judged decisions, filing-time only, second reports, comments, background only after a decision.

[Door line (A,B): the seed-writer Taken refers to fork text outside this design. The operator's round-2 words, verbatim: "1 - It has to infer it from my own text that I say when I tell it to seed the issue. No formal ways, and no displaying the entire thing. | 2a | 3a | 4a". The grant and proof it names are in this leaf's readiness.yaml (`grants`, `proofs`) and in issues/chart/operator-decisions/forks/seed-writer.md `## Findings`.]

### Door record (issues/chart/operator-decisions/forks/door-record.md, Taken, verbatim) (A,B)

Operator, 2026-11-19, verbatim: "1a | 2a | 3a | 4a |"

Binding decisions:
1. Record (Q1 1a): at import, right after the account check, one fork file per counting section in normal fork shape. `## Taken` holds the section verbatim, heading included, plus one label line: seed decision from owner/repo#n, taken at import on <date>, not asked, decided by <login>; an unstated reason or alternative is written "not stated". `## Findings` holds the check record (logins and `permission`, `lastEditedAt`, pull time, commands). CHART.md Forks taken points to it without restating the answer. It is shown first in the opening map, in the signposts round's opening paragraph, in every consultant brief's carries as a lock, at the handoff review, and under autopilot in the pass-end line. An operator objection is a dated correction under `## Taken`, earlier text kept. A line saying the decision settles another open fork is labelled the door's reading (A's under autopilot) and the operator may correct it. Taken stays taken: the account check is not re-run on a later open.
2. Rule home (Q2 2a): one definition sentence in questions.md's round paragraph (the one holding "Recommendations and silence cannot supply an operator answer"): an operator answer is a reply in a round or a counting decision section in an imported seed, pointing to chart-issues `## Open`, where the test and the record step live. The "one exception" lines in questions.md and autopilot.md and the "operator answer" lines in shapes.md stay as written.
3. Later section (Q3 3a): read at the next door open, never mid-chart, by comparing each GitHub source's current mirror with its INTAKE copy. Chart still open: the door takes it, appends a dated `## Source` block to INTAKE.md (first copy untouched) and writes the fork as in 1; a taken fork it contradicts goes to finding-against; a replaced section that counts is a dated correction. Chart handed off, closed, or identity in a leaf's `sources`: named only, and in the autopilot pass-end line. A taken section later removed from the seed: the fork stays taken, the absence is named as a fact, and only the operator's words change it.
4. Not counted (Q4 4a): plain intake in every mode, no fork file; the reason in INTAKE `## Agent findings` and the opening map. Manual: the operator may take it in words in the door, which writes the fork as in 1 with the section verbatim, the operator's words and date, labelled taken in the door; silence leaves it not taken. Autopilot: ordinary forks A answers, the reason in CHART.md `## Autopilot` and the pass-end line, no wait. "Edited after the pull" and a failed permission read get one retry at that open.
Foreclosed: per-point forks, INTAKE only, per-file exceptions, first-import only, mid-chart re-reads, waiting on a not-counted section.

### Finding against (issues/chart/operator-decisions/forks/finding-against.md, Taken, verbatim) (A,B)

Operator, 2026-11-19, verbatim: "1a | 2a | 3a | 4a"

Binding decisions:
1. What counts (Q1 1a): a finding is a fact with evidence and a concrete consequence if the decision is built as written (check-issue `## check.review` Fix bar); a simpler design, preference, untried alternative or doubt is not one. The door runs no research into whether the decision is right; findings come only from work it does anyway (map, open-fork research, Take proofs, leaf writing). Blocking (cannot be written or proven as decided: a named surface gone, a done-test proof fails, the shapes audit refuses the done-test, a clash with a lock): its own open fork, asked as keep or change, the door may offer the smallest change labelled the door's. Other (buildable, something real still goes wrong): under the decision fork's `## Findings`, shown once as keep or change; silence keeps; a keep is not raised again. A change is a dated correction under the decision's `## Taken`. Charting around the decision continues meanwhile.
2. Autopilot (Q2 2a): A never answers a finding or edits the decision's `## Taken`. Blocking: the chart waits under the existing approval-that-is-not-a-grant wait, with one `akrogon notice --attention` (new clause in autopilot.md); other charts go on; A cannot cut a locked done-test. Other: the chart goes on; the finding goes to the fork's Findings, each affected leaf design as a held disagreement, CHART.md `## Autopilot` and the pass-end line.
3. Conflicts and two readings (Q3 3a): a conflict between operator answers (two seed decisions, or a seed decision against a round reply) is asked of the operator in every mode and waits under autopilot; a later date does not win. questions.md's "an unresolved conflict about a fork becomes a fork answered per mode" gets the clause that a conflict between operator answers is asked in every mode. A seed decision against an earlier A autopilot pick supersedes the pick (kept, marked superseded) and that fork is re-answered around it. A round reply contradicting a taken seed decision: the clash is shown before recording. Two readings apply only when the text supports both and the leaf differs: manual asks one question; autopilot A takes the reading the seed's text and background support best, labelled A's with the other named, in the pass-end line, never against the plain words.
4. Colleague vs door operator (Q4 4a): the person at the door wins, as a dated correction naming both; under autopilot the colleague's decision holds until the operator next opens the door.
Costs accepted: A's reading of two-reading text can be wrong and is seen first at pass end; a conflict labelled "two readings" is shown by the label but not fully preventable.
Foreclosed: any doubt as a finding; findings as ordinary forks; every finding parks; later date wins; two readings always wait; owner always wins.

### Leaf carry (issues/chart/operator-decisions/forks/leaf-carry.md, Taken, verbatim) (A,B)

Operator, 2026-11-19, verbatim: "1a | 2a | 3a"

Binding decisions:
1. Carry (Q1 1a): the decision fork's `## Taken` is copied whole under the design's `## Binding decisions, verbatim`. The brief's done-criteria are the door's, each naming the `Done when:` clause it covers; a restatement keeps the same observable result; a clause the shapes audit refuses is a blocking finding (finding-against 1), never a silent rewrite; door criteria for what the decision leaves open are labelled the door's; a decision with no `Done when:` leaves criteria an ordinary open fork. `Not in scope:` items go to CHART.md Off route with the decision as the reason and into each affected design as exclusions; nothing is filed for them unless asked. A finding against a decision that the operator kept, or left unanswered, sits under a design heading `## Held disagreements` after the binding decisions, present only when needed, each entry naming what it is against, the fact, evidence, consequence, who raised it and its state (kept by the operator on a date, or unanswered), opening with "not a decision, the decision stands". No rule text about consultants' held disagreements is added.
2. Docs (Q2 2a): signposts 5a corrected to "rule text in existing files": the leaf fixes only the docs sentences the change makes false (docs/use/report-an-observation.md, docs/use/plan-work.md, docs/use/autopilot.md, and any other hit of the changed rules in docs/), adding no page.
3. Split (Q3 3a): one issue, one leaf, lifecycle route; direct not taken (changes the door's own rules for every consumer; B shaped every fork). Test cases: a made-up seed body in the marker shape (taken) and #144's public body (a mention, not taken); no text from a private seed enters the repo. The seed-writer charting grant is recorded in the leaf's `grants` with `expires` at charting and a stop line forbidding any covered operation by the leaf.
Foreclosed: `Done when:` as criteria verbatim; held findings inside binding decisions or as `Open for the plan:`; docs left false or seeded separately; two leaves; direct route.

### Standing design

/home/ivan/.akrogon/releases/5efc625d9624a30c7ff09e5ad2073449690a3eca/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: the product is rule text in existing skill, docs and test files, so most done-criteria are read by the reviewing seat against fixed made-up cases written in the brief, with no test. The one mechanical rule is the marker literal, written in seed-issue (writer) and chart-issues (reader): it has two kept copies because seed-issue is standalone and links may not leave its skill folder (tests/docs-links.test.ts), so the writer-and-checker line asks for one agreement case that reads both files and fails when the heading start differs, shown red by one deliberate break; it goes into tests/chart-shapes.test.ts, which already reads skill text (A,B). No paid or live call; no machinery. Nothing stays unproven inside this leaf except what signposts 5a gives up: that a live door stops re-asking, observed later when Tamdoma/tamdoma-framework#714 is charted after release.

### Exclusions

- No command code, no new file, no new config key (signposts 5a, corrected) (A,B).
- No rule text about consultants' held disagreements on drafts (leaf-carry 1).
- No text from a private seed (Tamdoma/tamdoma-framework#714) enters the repo; test cases are made up, plus #144's public body (leaf-carry 3).
- No GitHub call by the leaf: the seed-writer grant expired at charting (readiness.yaml `grants`).
- Comment and mid-chart entry points, charting #714 (signposts 4a, 6a).
- The `chartRow` empty-Taken bug in src/status.ts (CHART.md Recorded only).

## Leaf architecture

Owned surfaces (A,B): these files whole; the named sections are the expected homes, and a sentence the decisions need elsewhere in them (for example chart-issues `## Handoff`, the signposts paragraph, consultant brief carries) is inside ownership.
- skills/seed-issue/SKILL.md: `## Report` (one exception sentence beside "adding no recommended fixes or planning metadata", seed-writer 1, 3, 4), body template (an optional `## Operator decision (<name>, <date>)` block after `Unverified intake.` and optional background sections after `## Suspected cause`), the lookups paragraph and `## Submit and finish` (the edit route, seed-writer 2, and the final-lines clause naming a written section, seed-writer 1).
- skills/chart-issues/SKILL.md: `## Open` import paragraph (the counting test: marker literal and lock, account check with `gh api graphql` author and `userContentEdits` plus `lastEditedAt`, per-login `gh api repos/<r>/collaborators/<login>/permission`, one retry; the record step and the later-section compare, door-record 1, 3, 4); `## Take` (finding-against 1 and 4: what counts, blocking and other, person at the door wins).
- skills/chart-issues/assets/questions.md: the round paragraph holding "Recommendations and silence cannot supply an operator answer" (door-record 2 definition sentence; finding-against 3 conflict clause).
- skills/chart-issues/assets/autopilot.md: finding-against 2 (A never answers a finding or edits a seed decision's Taken; blocking waits with one `akrogon notice --attention`), finding-against 3 (two readings), door-record 4 (not-counted sections as ordinary forks, reason in `## Autopilot` and pass-end).
- skills/chart-issues/assets/shapes.md: fork-record shape for a seed decision (label line, check record) beside the fork shape; `## Leaf files` design shape gains the optional `## Held disagreements` heading (leaf-carry 1); `Not in scope:` to Off route.
- docs/use/report-an-observation.md, docs/use/plan-work.md, docs/use/autopilot.md and any other docs/ line stating a changed rule (leaf-carry 2).
- tests/chart-shapes.test.ts: one agreement case for the marker literal (A,B).

Consumers that rely on changed state:
- `chartRow` in src/status.ts counts a seed-decision fork as taken from non-blank text under `## Taken` (observed: `akrogon status --charts` shows this chart 6/6). Reusable as is.
- plan-issue `## Shared context` ("the design wins") and check-issue `## check.repair` (no repair changes a locked brief or design decision) read the copied decisions; no change. check-issue is unchanged; the entry's opening line "not a decision, the decision stands" is what the reviewer reads (A,B).
- `pullRepo` in src/pull.ts keeps the issue body unparsed, so the section reaches the mirror; no change.
- Nothing in src/ or tests/ validates design headings (`grep -rln "Binding decisions\|Leaf architecture" src/ tests/` empty), so the optional heading parses.

Door readings (A,B), labelled the door's, each inside a binding decision:
- Marker decision 1 "a heading line": a line inside a fenced code block is not a heading, so a quoted template or example never counts.
- Marker decision 2 "anything else": an edit list longer than the read returns (`userContentEdits(first:50)` with `totalCount` above 50) is a failed read, so the section is marked, not taken.

Recorded limits copied from the marker fork: the permission read is proven only as admin (ivanjuras); a write-level caller and the Moderate role mapping are unobserved; a concurrent body edit between read and write is a stated limit.

Necessary dependencies: none. Reaches doors at the next release link (chart-issues `## Handoff`).
