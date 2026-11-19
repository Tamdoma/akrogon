# Brief 2: chart-issues operator decision rules (U2)

## 1. Goal

Rule text in the chart-issues skill so a counting `## Operator decision (` section in an imported GitHub seed becomes one taken fork at import, later sections are picked up at the next open, findings against a decision are evidenced breakage only, conflicts between operator answers go to the operator, autopilot never answers on a seed decision, and leaf designs carry the decision with an optional `## Held disagreements`. Plan decisions D1, D6, D7, D8, D9, D10. Only rule text: no code, no new file.

## 2. Numbered acceptance criteria

1. `skills/chart-issues/SKILL.md` contains the heading start `## Operator decision (` in `## Open`, and every case-insensitive `#… operator decision (` mention in that file is exactly `## Operator decision (`. The assets name it in words ("a counting decision section") and link to `../SKILL.md#open`; they never write the literal. Planned test: `tests/chart-shapes.test.ts` "seed-issue and chart-issues share the operator decision heading start" (green only after U1 also lands).
2. The four files state marker decisions 1–2, door-record 1–4, finding-against 1–4 and leaf-carry 1 (design.md). A reviewer reading them gets:
   - (d) mirrored seed `issues/seeds/12.md` for Example/widgets#12, author `dlee` with `permission` `write`, `userContentEdits.totalCount` 0, `lastEditedAt` null, body: `Origin repo: Example/widgets`, `Unverified intake.`, then `## Operator decision (Dana Lee, 2026-11-10): settled` with two numbered points, `Not in scope: XLSX export.`, `Done when: a 500-row list exports 500 data rows.`, then `## Observation …`. Expected: one fork file whose `## Taken` holds the section from its heading through the `Done when:` line verbatim plus the label line `seed decision from Example/widgets#12, taken at import on <date>, not asked, decided by dlee`; `## Findings` holds the check record (dlee `write`, `lastEditedAt`, pull time, commands); CHART.md Forks taken points to it without restating; listed first in the opening map; XLSX export to Off route with the decision as reason.
   - (e) #144's body, where "Operator decision (Ivan Juras, 2026-11-18)" appears only inside a quoted sentence: no taken fork, plain intake.
3. These lines stay word for word and still read true: questions.md "The one exception is an autopilot session (`autopilot.md`), where A's own recorded pick counts; approvals stay operator-only."; autopilot.md "this is the one exception to "Recommendations and silence cannot supply an operator answer" in [questions.md](questions.md), while approvals stay operator-only"; shapes.md's "operator answer" lines (fork Taken template `<operator answer verbatim, …>`, "A fork file with no operator answer — …", the preflight "lacks an operator answer", `answer: <recorded operator answer>`). They stay true because a counting decision section is defined as an operator answer, not an exception.
4. `bun test tests/docs-links.test.ts` and `bun test tests/chart-shapes.test.ts` (other two cases) stay green; `../SKILL.md#open` and `../SKILL.md#take` anchors resolve.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/operator-decisions/seed-decisions/design.md` §§ Marker, Door record, Finding against, Leaf carry (binding decisions verbatim), and `## Leaf architecture` (owned sections, door readings, recorded limits).
- `/home/ivan/Work/infra/akrogon/issues/open/operator-decisions/seed-decisions/plan.md` D6–D10, C3.
- `skills/chart-issues/SKILL.md` `## Open` (paragraph starting "Import operator notes"), `## Take` (paragraph "Record operator answers"), `## Handoff`.
- `skills/chart-issues/assets/questions.md` paragraph 3 of the round rules ("Present the current fork's material questions…") and the signposts paragraph after it.
- `skills/chart-issues/assets/autopilot.md` paragraphs 1 and 3.
- `skills/chart-issues/assets/shapes.md` fork shape and the paragraph after it (~lines 146–167), `## Leaf files` design shape and the paragraph after it (~lines 271–285).
- `skills/check-issue/SKILL.md` `## check.review` (the Fix bar the finding definition cites).
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.
- Pattern: each file's existing style is long single-paragraph rules; add sentences or one paragraph where named, matching it.

## 4. Change list and needed interfaces

Owned paths: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/autopilot.md`, `skills/chart-issues/assets/shapes.md`. Prerequisites: test commit `c07722ff` (landed). Shared test resource: none. Worktree created at commit `c07722ff`: `/home/ivan/.akrogon/worktrees/akrogon/seed-decisions-u2`.

- **SKILL.md `## Open`, after the "Import operator notes" paragraph (D6, D7):** a new paragraph (or two) with the counting test, account check, record step, later-section compare and not-counted handling. Write: a heading line starting `## Operator decision (` (rest of line free) in a mirrored GitHub seed is a decision section; a line inside a fenced code block is not a heading (door reading); the lock is the text under it to the next `## ` heading, `Not in scope:` and `Done when:` locked when present and never required, sub-headings use `### `; a mention in prose is not a marker; text the section points to is not locked; local notes and legacy paths never count; a decision-like heading not matching is named in the opening map as "marked differently, not taken". Account check, right after the pull: `gh api graphql` reading the issue's `author{login}`, `lastEditedAt` and `userContentEdits(first:50){totalCount nodes{editor{login} editedAt}}`; per distinct login `gh api repos/<owner/repo>/collaborators/<login>/permission --jq .permission`; counts when the author and every body editor read `admin` or `write` (maintain reads as write), using `permission`, never `role_name`. Anything else, a failed read, `totalCount` above 50 (door reading), or `lastEditedAt` later than the pull is "marked, not taken" with the reason; "edited after the pull" and a failed read get one retry at that open. The opening map names the deciding login. Record: door-record 1 verbatim intent (one fork file per counting section right after the check, in the seed-decision shape in shapes.md; shown first in the opening map, in the signposts round's opening paragraph, in every consultant brief's carries as a lock, at the handoff review, and under autopilot in the pass-end line; a line saying it settles another open fork is labelled the door's reading, A's under autopilot, and the operator may correct it; taken stays taken, the check is not re-run on a later open). Later section: door-record 3 verbatim intent (next door open, never mid-chart, compare each GitHub source's current mirror with its INTAKE copy; open chart: take it, append a dated `## Source` block to INTAKE.md with the first copy untouched, write the fork; a contradicted taken fork goes to the finding rule in `## Take`; a replaced counting section is a dated correction; chart handed off, closed, or identity in a leaf's `sources`: named only, and in the autopilot pass-end line; a taken section later removed: fork stays taken, absence named as a fact, only the operator's words change it). Not counted: door-record 4 (plain intake, no fork file, reason in INTAKE `## Agent findings` and the opening map; manual: the operator may take it in words, fork written with the section verbatim, the operator's words and date, labelled taken in the door; silence leaves it not taken; autopilot per autopilot.md). Recorded limit sentence: the permission read is proven only with an admin caller.
- **SKILL.md `## Take`, new paragraph after "Record operator answers…" (D8):** finding-against 1 and 4 plus the parts of 3 not placed in questions.md/autopilot.md, as in plan D8: what counts (fact, evidence, concrete consequence if built as written, the check-issue `## check.review` Fix bar; not a simpler design, preference, untried alternative or doubt), no research into whether the decision is right, findings only from work the door does anyway (map, open-fork research, Take proofs, leaf writing); blocking (named surface gone, done-test proof fails, shapes audit refuses the done-test, clash with a lock) is its own open fork asked keep or change with the smallest change offered labelled the door's; other findings under the decision fork's `## Findings`, shown once as keep or change, silence keeps, a keep not raised again; a change is a dated correction under the decision's `## Taken`; charting around it continues. Seed decision against an earlier A autopilot pick: supersedes it (kept, marked superseded), that fork re-answered around it. Round reply contradicting a taken seed decision: the clash is shown before recording. Two readings apply only when the text supports both and the leaf differs; manual asks one question. Person at the door vs a colleague's decision: the person at the door wins, as a dated correction naming both.
- **SKILL.md `## Handoff`:** if the existing review sentence does not already cover it, the review shows seed-decision forks (door-record 1 "at the handoff review"); one short clause is enough.
- **questions.md (D9):** right after "Recommendations and silence cannot supply an operator answer." insert one definition sentence: an operator answer is a reply in a round or a counting decision section in an imported seed ([Open](../SKILL.md#open)), where the test and record step live. In the signposts paragraph, "an unresolved conflict about a fork becomes a fork answered per mode" gains: except a conflict between operator answers (two seed decisions, or a seed decision against a round reply), which is asked of the operator in every mode and waits under autopilot; a later date does not win.
- **autopilot.md (D9):** one new paragraph after paragraph 3 (waits): A never answers a finding against a seed decision or edits that decision's `## Taken`; a blocking finding makes the chart wait under the existing approval-that-is-not-a-grant wait with one `akrogon notice --attention`, other charts go on, and A cannot cut a locked done-test; an other finding lets the chart go on, recorded in the fork's Findings, each affected leaf design as a held disagreement, CHART.md `## Autopilot` and the pass-end line; a conflict between operator answers waits; two readings: A takes the reading the seed's text and background support best, labelled A's with the other named, in the pass-end line, never against the plain words; a not-counted decision section is an ordinary fork A answers, reason in `## Autopilot` and the pass-end line, no wait; a colleague's decision holds until the operator next opens the door. Paragraph 1 stays word for word.
- **shapes.md (D10):** after the fork-shape paragraph, a seed-decision fork paragraph (shape in words or a short fenced block): `## Question` names the seed and section; `## Taken` the section verbatim, heading included, plus the label line `seed decision from <owner/repo#n>, taken at import on <date>, not asked, decided by <login>`, unstated reason or alternative written "not stated", an operator objection as a dated correction keeping earlier text; `## Findings` the check record (logins and `permission`, `lastEditedAt`, pull time, commands). CHART.md Forks taken points to it without restating the answer. `Not in scope:` items go to Off route with the decision as reason and into each affected design as exclusions; nothing filed unless asked. `## Leaf files` design shape: add optional `## Held disagreements` after `## Binding decisions, verbatim` with a placeholder: present only when needed; each entry opens "not a decision, the decision stands" and names what it is against, the fact, evidence, consequence, who raised it and its state (kept by the operator on a date, or unanswered). Paragraph after the shapes gains leaf-carry 1: a seed decision fork's `## Taken` is copied whole under `## Binding decisions, verbatim`; brief done-criteria name the `Done when:` clause each covers, a restatement keeps the same observable result, a clause the shapes audit refuses is a blocking finding, never a silent rewrite; door criteria for what the decision leaves open are labelled the door's; a decision with no `Done when:` leaves criteria an ordinary open fork. A fenced block holding `## Held disagreements` is fine (docs-links ignores fenced headings), but do not write the operator decision literal in shapes.md.

## 5. Do-not, reasons and exceptions

- Edit only the four owned files: U1 owns seed-issue, U3 owns docs. Exception: none.
- Write the literal `## Operator decision (` only in SKILL.md, and never a variant spelling there: the agreement test fails on any case-insensitive variant.
- Do not change the three "one exception"/"operator answer" lines named in criterion 3.
- No rule text about consultants' held disagreements on drafts (leaf-carry 1 exclusion); no command code, no new file, no config key.
- Do not write or edit any test; a planned test that looks wrong returns a mismatch to A.
- Do not run `gh` or any GitHub call: the leaf has no grant.
- Never run any `git stash` subcommand: every worktree shares one stash. Set work aside with a WIP commit and, before returning, `git reset --soft c07722ff` and make the unit's single returned commit.
- Return a mismatch with evidence instead of changing scope; exception: a revised brief from A.

Reasons and exceptions restated: disjoint owned files keep the wave safe; the literal is the agreement test; the unchanged lines are a done-criterion; the exclusions are locked design; tests are A's; no grant covers GitHub; the shared stash can lift a sibling's edit; scope changes go through A.

## 6. Ordered steps

1. Read the design sections and the owned files' named sections (criteria 1–3).
2. SKILL.md `## Open` paragraph(s) (criteria 1, 2d, 2e).
3. SKILL.md `## Take` paragraph and `## Handoff` clause (criterion 2).
4. questions.md sentence and clause (criteria 2, 3).
5. autopilot.md paragraph (criteria 2, 3).
6. shapes.md fork paragraph, design shape and carry sentences (criteria 2d, 3).
7. Re-read all four files against cases (d) and (e) and criterion 3; fix any contradiction between them.
8. Run the commands; commit once.

Advisory size: 4 files, under 20 turns.

## 7. Commands

- `cd /home/ivan/.akrogon/worktrees/akrogon/seed-decisions-u2 && bun install --frozen-lockfile --backend=copyfile`
- `akrogon run-check --name u2-docs-links -- bun test tests/docs-links.test.ts`
- `akrogon run-check --name u2-chart-shapes -- bun test tests/chart-shapes.test.ts` (the marker case is expected red only on the seed-issue file: report which file it names)

## 8. Done-when, evidence and report

Done when criteria 1–4 hold, one commit `skills: chart-issues takes counting operator decision sections in seeds` exists in the worktree (no co-author line, no trailer needed), and the report below is filled with the `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
