# Plan: seed-decisions

Rule text in existing skill, docs and test files so a `## Operator decision (<name>, <date>)` section in a seed, written by a person with write access, counts as a taken fork. Sources: brief.md, design.md (locked), worktree `/home/ivan/.akrogon/worktrees/akrogon/seed-decisions` at base `5efc625d`.

No brief/design conflict was found. The design has no `Open for the plan:` question.

## Read first

- `docs/reference-index.md`, `skills/AREA.md`, `tests/AREA.md`
- `learnings/LESSONS.md`: 2026-09-11 stale-rule-in-docs (grep `docs/` for a changed rule), 2026-09-14 ambiguous-prose-after-rename (sweep prose, not only paths), 2026-10-01 wording assertions (the agreement test asserts one literal that runs as written, nothing else)
- `skills/seed-issue/SKILL.md` `## Report`, body template, lookups paragraph, `## Submit and finish`
- `skills/chart-issues/SKILL.md` `## Open` (import paragraph, line beginning "Import operator notes"), `## Take`, `## Handoff`
- `skills/chart-issues/assets/questions.md` round paragraph ("Recommendations and silence cannot supply an operator answer") and signposts paragraph ("an unresolved conflict about a fork becomes a fork answered per mode")
- `skills/chart-issues/assets/autopilot.md` paragraphs 1 ("one exception") and 3 (waits)
- `skills/chart-issues/assets/shapes.md` fork shape and its paragraph, `## Leaf files` design shape and the paragraph after it, CHART.md `## Forks taken` / `## Off route`
- `skills/check-issue/SKILL.md` `## check.review` (the Fix bar finding-against 1 cites)
- `skills/chart-issues/assets/standing-design.md` writer-and-checker line
- `tests/chart-shapes.test.ts`, `tests/docs-links.test.ts` (skill links stay inside their own folder)
- Docs: `docs/use/report-an-observation.md`, `docs/use/plan-work.md`, `docs/use/autopilot.md`, `docs/reference/skills.md` `## seed-issue`

Resource gaps: none.

## Decisions

- **D1 Marker literal.** The heading start `## Operator decision (` is written in exactly two files: `skills/seed-issue/SKILL.md` (body template line `## Operator decision (<name>, <date>)` and the Report exception) and `skills/chart-issues/SKILL.md` `## Open` (the counting test). The assets and docs name it "a counting decision section" in words and link to chart-issues `## Open`; they never write the literal. Reason: seed-issue is standalone and links may not leave its folder (two kept copies, standing-design writer-and-checker line); a third copy would need its own agreement.
- **D2 Agreement test.** One case in `tests/chart-shapes.test.ts` reads both files, finds every case-insensitive `#…operator decision (` mention, and requires at least one per file and every mention equal to the literal. The literal in the test is the independent expected result from marker decision 1. Changing both copies together also fails, which is intended.
- **D3 seed-issue exception sentence.** Beside "adding no recommended fixes or planning metadata" in `## Report`, one sentence: except an operator decision section and the background sections the person's words ask for (seed-writer 1, 3, 4). It states: written only when the person's own words in the request to seed or to add to a filed report state a settled decision, including words pointing at a fix settled earlier in the same session; decided points inferred from those words, no confirmation step, no display; unclear words ("I think we should do X") write none; holds only what the person decided, never the agent's advice; heading names the person by `git config user.name` and the day (`YYYY-MM-DD`), never an agent or model; never a grant, live or paid approval, secret or handoff authorization; `## Lifecycle filing` callers, lesson-triggered reports and passes with no person's request write neither. Background: each section headed to the effect "proposed, not decided" with author and date, locks nothing, each claim takes its confirming source's tier, loses to the decision where they differ.
- **D4 seed-issue body template.** Optional `## Operator decision (<name>, <date>)` block directly after `Unverified intake.`, with sub-headings at `### `; optional background sections after `## Suspected cause`. The template comment says both are present only under the D3 exception.
- **D5 seed-issue edit route.** In the lookups paragraph and `## Submit and finish`: when the person's words ask to add a decision to a filed report, or a covering report was found and the request states a decision, the pass edits that open report instead of posting nothing: read the body with `gh issue view <n> -R <repo> --json body`, put the section after `Unverified intake.` (top of the body when absent), replace an existing decision section with the new one and new date (one per report), change nothing else, write with `gh issue edit <n> -R <repo> --body-file -` from a quoted heredoc, read back and confirm outside text unchanged and the section equal, ignoring trailing whitespace; a mismatch is a failure printed with the URL. Closed reports, comments, labels and state are untouched; a closed covering report is never edited. Stated limit: a concurrent body edit between read and write. The final `Last operation:` line adds one clause "operator decision section written" (and "background section written" when one was), never the text.
- **D6 chart-issues counting test (`## Open`, after the import sentence).** For each mirrored GitHub seed imported: a heading line starting `## Operator decision (`, outside a fenced code block (door reading), is a decision section; the lock is the text under it to the next `## ` heading; `Not in scope:` and `Done when:` locked when present, never required; prose mentions and text it points to lock nothing; local notes and legacy paths never count. Account check right after the pull: `gh api graphql` for the issue's `author{login}`, `lastEditedAt` and `userContentEdits(first:50){totalCount nodes{editor{login} editedAt}}`; per distinct login `gh api repos/<owner/repo>/collaborators/<login>/permission --jq .permission`; counts only when every login reads `admin` or `write` (`maintain` reads as `write` in that field; never `role_name`). Not counting: any other permission, a failed read, `totalCount` above 50 (door reading), or `lastEditedAt` later than the pull; "edited after the pull" and a failed read get one retry (re-pull, re-read) at that open. A decision-like heading not matching is named in the opening map as "marked differently, not taken". The opening map names the deciding login.
- **D7 chart-issues record and later section (`## Open`).** Door-record 1, 3, 4 as written in the design: one fork file per counting section at import, right after the account check, in the seed-decision fork shape (D10); shown first in the opening map, in the signposts round's opening paragraph, in every consultant brief's carries as a lock, at the handoff review, and under autopilot in the pass-end line; Taken stays taken and the check is not re-run. Next door open compares each GitHub source's current mirror with its INTAKE copy (never mid-chart): open chart takes a new counting section, appends a dated `## Source` block (first copy untouched), and a contradicted taken fork goes to finding-against; a replaced counting section is a dated correction; chart handed off, closed, or identity in a leaf's `sources`: named only; a removed taken section: the fork stays taken, the absence named. Not counted: plain intake, reason in INTAKE `## Agent findings` and the opening map; manual: the operator may take it in words, written as in D10 labelled "taken in the door"; silence leaves it not taken; autopilot rule in D9.
- **D8 chart-issues findings and conflicts (`## Take`, new paragraph after "Record operator answers").** Finding-against 1, 3 (the parts not in questions.md/autopilot.md) and 4: a finding is a fact with evidence and a concrete consequence if built as written (check-issue `## check.review` Fix bar), never a simpler design, preference, untried alternative or doubt; the door runs no research into whether the decision is right; blocking (named surface gone, done-test proof fails, shapes audit refuses the done-test, clash with a lock) is its own open fork asked keep or change, with the smallest change offered labelled the door's; other findings go under the decision fork's `## Findings`, shown once as keep or change, silence keeps, a keep is not raised again; a change is a dated correction under `## Taken`; charting continues meanwhile. A seed decision against an earlier A autopilot pick supersedes it (kept, marked superseded) and that fork is re-answered; a round reply contradicting a taken seed decision shows the clash before recording; two readings, manual: one question; the person at the door beats a colleague's decision as a dated correction naming both. A line saying the decision settles another fork is labelled the door's reading (A's under autopilot).
- **D9 questions.md and autopilot.md.** questions.md round paragraph: right after "Recommendations and silence cannot supply an operator answer." add one definition sentence: an operator answer is a reply in a round or a counting decision section in an imported seed ([Open](../SKILL.md#open)). The "one exception" sentence stays word for word; it stays true because a decision section is an operator answer by definition, not an exception. Signposts paragraph: "an unresolved conflict about a fork becomes a fork answered per mode" gains ", except a conflict between operator answers (two seed decisions, or a seed decision against a round reply), which is asked of the operator in every mode, waits under autopilot, and is never settled by the later date". autopilot.md: one new paragraph after the waits paragraph: A never answers a finding against a seed decision or edits its `## Taken`; a blocking finding parks the chart under the approval-that-is-not-a-grant wait with one `akrogon notice --attention`, other charts go on, A cannot cut a locked done-test; other findings go to the fork's Findings, each affected leaf design's `## Held disagreements`, `## Autopilot` and the pass-end line; a conflict between operator answers waits; two readings: A takes the reading the seed's text and background support best, labelled A's with the other named, in the pass-end line, never against the plain words; a not-counted section is an ordinary fork A answers, reason in `## Autopilot` and the pass-end line; a colleague's decision holds until the operator next opens the door; seed-decision forks and later sections of closed charts appear in the pass-end line. Paragraph 1's "one exception" sentence stays word for word.
- **D10 shapes.md.** After the fork shape paragraph, a seed-decision fork shape: `## Question` names the seed and section; `## Taken` holds the section verbatim, heading included, plus one label line `seed decision from <owner/repo#n>, taken at import on <date>, not asked, decided by <login>`, unstated reason or alternative written "not stated", objections as dated corrections; `## Findings` holds the check record (logins and `permission`, `lastEditedAt`, pull time, commands). CHART.md `## Forks taken` points to it without restating. `Not in scope:` items go to Off route with the decision as reason and into each affected design as exclusions, nothing filed unless asked. `## Leaf files`: design shape gains optional `## Held disagreements` after `## Binding decisions, verbatim`, each entry opening "not a decision, the decision stands" and naming what it is against, the fact, evidence, consequence, who raised it and state (kept on a date, or unanswered); the paragraph after gains: a seed decision's `## Taken` is copied whole; brief criteria name the `Done when:` clause each covers, a restatement keeps the same observable result, a refused clause is a blocking finding, door criteria for what the decision leaves open are labelled the door's, no `Done when:` leaves criteria an ordinary open fork. The existing "operator answer" lines (fork Taken template, the open-fork sentence, the preflight refusal, `answer: <recorded operator answer>`) stay word for word.
- **D11 Docs.** Fix only sentences the change makes false, no new page: `docs/use/report-an-observation.md` line 3 ("It never proposes a fix." gains: except your own decision, written when you ask), step 3 (a covering report can get your decision added), step 4 (the six sections plus the optional decision and requested background sections), end lines (the clause naming a written section); `docs/use/plan-work.md` "you answer the signposts and every fork" gains "except a fork taken from a seed's operator decision section"; `docs/use/autopilot.md` the same qualifier in "Three modes exist", "Where it would ask you a fork" gains that A never answers a seed decision or a finding against it, and "What still waits for you" gains a blocking finding against a seed decision and a conflict between your answers; `docs/reference/skills.md` `## seed-issue` Result gains "or adds your decision to an open report". Other hits checked and still true: `docs/reference/words.md` Seed, `docs/use/a-working-day.md` step 1, `docs/README.md` report line, `skills/AREA.md` chart-issues line.
- **D12 Commits.** The agreement test is committed first with a `Test-Change: tests/chart-shapes.test.ts` trailer naming the added case; product commits follow per unit. No co-author line.

## Interfaces

- Literal: `## Operator decision (` (D1).
- `gh api graphql -f query='{repository(owner:"<o>",name:"<r>"){issue(number:<n>){author{login} lastEditedAt userContentEdits(first:50){totalCount nodes{editor{login} editedAt}}}}}'` (proven read-only at charting, readiness `proofs[0]`).
- `gh api repos/<o>/<r>/collaborators/<login>/permission --jq .permission` (readiness `proofs[1]`).
- `gh issue view <n> -R <repo> --json body`, `gh issue edit <n> -R <repo> --body-file -` (readiness `proofs[2]`).
- The leaf runs none of these; they are rule text. No grant is drawn (readiness `grants[0]` expired at charting, stop line forbids the leaf's use). No count lines: this pass made no covered launch.

## Credentials

The design names no credential by variable name; `akrogon status seed-decisions` printed no `Missing:` line.

## Units and waves

Implementation mode `subagents`. Wave 1 holds two units; the run is not serial-solo.

### Wave 1

- **U1 seed-issue rules.** Owns `skills/seed-issue/SKILL.md`. Decisions D1, D3, D4, D5. Prerequisites: test commit (landed at planning). Shared test resource: none (the agreement test is a file read, green only after U1 and U2 both land; the worker's evidence is `bun test tests/docs-links.test.ts`).
- **U2 chart-issues rules.** Owns `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/autopilot.md`, `skills/chart-issues/assets/shapes.md`. Decisions D1, D6, D7, D8, D9, D10. Prerequisites: test commit. Shared test resource: none (evidence as U1).

### Wave 2

- **U3 docs.** Owns `docs/use/report-an-observation.md`, `docs/use/plan-work.md`, `docs/use/autopilot.md`, `docs/reference/skills.md`. Decision D11. Prerequisites: U1, U2 (docs state the landed rules). Before finishing, grep `docs/` and `README.md` for "never proposes a fix", "every fork", "six", "Observation, Location", "operator answer", "covers the same failure" and fix any other false hit.

### Checklist

- [ ] C1: literal in both files (U1, U2); agreement test green; deliberate break shown once at implement.
- [ ] C2: seed-issue cases (a), (b), (c) below read true (U1).
- [ ] C3: chart-issues cases (d), (e) read true; "one exception" lines and shapes "operator answer" lines unchanged and true (U2).
- [ ] C4: docs read (U3).
- [ ] C5: `test` check green, docs-links included.
- Docs affected: human docs in U3 (four files). Agent docs: none affected (`skills/AREA.md` chart-issues line and `tests/AREA.md` stay true; the new case extends an existing test file).

## Criteria and proof

### C1 Marker agreement (mechanical)

- Boundary: the two skill files as read from the worktree. Before: neither holds the literal (test red). After: both do (green). Catches: writer and reader drifting apart, so seeds written by seed-issue stop counting at the door.
- Test: `tests/chart-shapes.test.ts` "seed-issue and chart-issues share the operator decision heading start".
- Command: `akrogon run-check --name marker-agreement -- bun test tests/chart-shapes.test.ts -t "operator decision heading"`; the configured `test` check also runs it. Size: seconds. Rerun trigger: any edit to either file's marker text or the test.
- Red at planning (missing behavior), `check marker-agreement-missing: 1 /home/ivan/Work/infra/akrogon/issues/open/operator-decisions/seed-decisions/implementation/check-marker-agreement-missing-1795047800061-1280640.log`:
  ```text
  -   "mentions": true,
  +   "mentions": false,
  (fail) seed-issue and chart-issues share the operator decision heading start
  ```
  (An earlier run `check-marker-agreement-missing-1795047796007-1280308.log` failed on `Cannot find package 'zod'` before `bun install`; not the intended red.)
- Conditions traced (criterion: "a change to one copy alone fails"), decision D2, cases run with temporary edits to both skill files, discarded with `git checkout` before the test commit:
  1. Both copies present: green, `check marker-both-copies: 0 …/check-marker-both-copies-1795047806242-1280940.log` (the test can pass).
  2. One copy changed to a near variant (`## Operator Decision (` in seed-issue): red, `check marker-one-copy-changed: 1 …/check-marker-one-copy-changed-1795047806378-1281028.log`, output `"differing": ["## Operator Decision ("]`.
  3. One copy changed while another exact mention stays in the same file: red, `check marker-one-copy-changed-other-kept: 1 …/check-marker-one-copy-changed-other-kept-1795047806518-1281141.log`, same output.
  4. One copy renamed to non-matching text: the file has no mention, the same failure as the missing-behavior red above.
- Implement: one deliberate break (edit seed-issue's template copy to `## Operator Decision (`), run the command red, revert, run green; both logs in `implementation/report.md`.

### C2 seed-issue writer (rule text, read by the reviewing seat)

No test: the product is instructions to a model; the reviewing seat reads `skills/seed-issue/SKILL.md` against these made-up cases. What stays unproven: a live seed-issue run producing these bodies (no paid or GitHub call by the leaf).

- (a) Session: the person and the agent settled "export writes every row, filtered rows included; header order unchanged". Request: "seed this; record the fix we agreed as my decision". `git config user.name` prints `Dana Lee`, today 2026-11-20. Expected: body opens `Origin repo:`, blank, `Unverified intake.`, blank, `## Operator decision (Dana Lee, 2026-11-20)` holding the two decided points, then the six sections; no confirmation question and no display of the section; final `Last operation:` line names the created URL and that an operator decision section was written, without its text.
- (b) Request "I think we should do X" about the same failure: no decision section; the six sections only; no fix text anywhere (the ban holds).
- (c) Request "add my decision to Example/widgets#12: export writes every row" where #12 is open with a body holding `Unverified intake.` and the six sections: the rule reads the body with `gh issue view 12 -R Example/widgets --json body`, inserts the section after `Unverified intake.`, writes with `gh issue edit 12 -R Example/widgets --body-file -`, reads back and compares the outside text unchanged and the section equal, ignoring trailing whitespace; a mismatch prints a failure with the URL. Comments, labels and state untouched.
- Also read: a lesson-triggered or `## Lifecycle filing` report writes neither section; every other report keeps "adding no recommended fixes or planning metadata".

### C3 chart-issues reader (rule text, read by the reviewing seat)

No test. Cases, not committed as fixtures:

- (d) Mirrored seed `issues/seeds/12.md` for Example/widgets#12, author `dlee` with `permission` `write`, `userContentEdits.totalCount` 0, `lastEditedAt` null, body:
  ```markdown
  Origin repo: Example/widgets

  Unverified intake.

  ## Operator decision (Dana Lee, 2026-11-10): settled

  1. Export writes every row, filtered rows included.
  2. The CSV header keeps the current column order.

  Not in scope: XLSX export.
  Done when: a 500-row list exports 500 data rows.

  ## Observation

  CSV export drops the last row when the list has 500 rows.
  ```
  Expected from the rules: one fork file whose `## Taken` holds the section from its heading through the `Done when:` line verbatim plus the label line `seed decision from Example/widgets#12, taken at import on <date>, not asked, decided by dlee`; `## Findings` holds the check record (dlee `write`, `lastEditedAt` null, pull time, the two commands); CHART.md Forks taken points to it; it is listed first in the opening map; XLSX export goes to Off route with the decision as reason.
- (e) #144's body as copied in `issues/chart/operator-decisions/INTAKE.md` `## Source: Tamdoma/akrogon#144`: the words "Operator decision (Ivan Juras, 2026-11-18)" appear inside a sentence in quotes, not as a heading line, so no taken fork; no decision-like heading exists, so no "marked differently" line; the report stays plain intake.
- Also read: questions.md "The one exception is an autopilot session…" and autopilot.md "this is the one exception to…" unchanged and still true; shapes.md's "operator answer" lines unchanged and still true.

### C4 Docs (read by the reviewing seat)

Reading starts at "never proposes a fix" (`docs/use/report-an-observation.md`), "answer the signposts and every fork" (`docs/use/plan-work.md`, `docs/use/autopilot.md`) and the six-section body list (`docs/use/report-an-observation.md` step 4). A true sentence keeping the old string with its new qualifier passes. `git diff --stat 5efc625d...HEAD -- docs/` shows no added file.

### C5 Links (mechanical)

- Command: the configured `test` check, run by `akrogon verify` at implement end; quick form `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`. Boundary: every Markdown link in README, docs/ and skills/. Catches: a new link in seed-issue that leaves its folder, or a broken anchor such as `../SKILL.md#open`. Size: minutes for the full check, seconds for the file. Rerun trigger: any changed Markdown file. Already green at base for unchanged files; no new test.

## Limits kept

- A live door's behavior is unproven inside this leaf (signposts 5a); observed later when Tamdoma/tamdoma-framework#714 is charted after release.
- The permission read is proven only as admin (ivanjuras); a write-level caller and the Moderate role mapping are unobserved.
- A concurrent body edit between read and write is a stated limit.
- The change reaches doors only at the next release link.

## Implementation notes

- 2026-11-19 (F2): Apply the full named-and-dated heading shape in chart-issues Open, as required by design.md Marker decision 1 and the brief's What.
- 2026-11-19 (F3): Capture the pull cutoff before fetching bodies on each attempt, including the retry, so design.md Marker decision 2 rejects edits newer than the mirror.
- 2026-11-19 (F4): Document the named-report edit separately from the filing path in the existing docs, as required by design.md Seed writer decision 2 and Leaf carry decision 2.
