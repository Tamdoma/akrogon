# Brief 3: docs sentences made false by the seed decision rules (U3)

## 1. Goal

Fix only the docs sentences the landed seed-issue and chart-issues rules make false, adding no page. Plan decision D11, done-criterion 4 (leaf-carry decision 2).

## 2. Numbered acceptance criteria

1. No `docs/` line states a changed rule in its old form. The reading starts at "never proposes a fix" (`docs/use/report-an-observation.md`), "answer the signposts and every fork" (`docs/use/plan-work.md`, `docs/use/autopilot.md`) and the six-section body list (`docs/use/report-an-observation.md` step 4). A true sentence that keeps one of these strings with its new qualifier passes.
2. No new file under `docs/` (`git diff --stat 369e502c -- docs/` shows only modified files).
3. `bun test tests/docs-links.test.ts` stays green; any link added resolves.
4. Docs describe the section in words ("an operator decision section"); they never write the heading literal starting with two hashes, so the marker keeps exactly two copies (seed-issue and chart-issues).

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/operator-decisions/seed-decisions/plan.md` D11 and C4.
- The landed rule text in this worktree: `skills/seed-issue/SKILL.md` (`## Report` exception, template, lookups paragraph, `## Submit and finish`), `skills/chart-issues/SKILL.md` (`## Open` decision-section paragraphs, `## Take` finding paragraph), `skills/chart-issues/assets/autopilot.md` (the new seed-decision paragraph).
- `docs/use/report-an-observation.md`, `docs/use/plan-work.md` (§ Set the signposts, § Answer one fork per round), `docs/use/autopilot.md` (§§ Modes, What the door does, What still waits for you), `docs/reference/skills.md` `## seed-issue`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.
- Pattern: docs are short plain sentences for a human operator, second person ("you"); match it.

## 4. Change list and needed interfaces

Owned paths: `docs/use/report-an-observation.md`, `docs/use/plan-work.md`, `docs/use/autopilot.md`, `docs/reference/skills.md`, plus any other `docs/` or `README.md` line found false by the grep in step 5. Prerequisites: U1 and U2 landed. Shared test resource: none. Worktree created at commit `369e502c`: `/home/ivan/.akrogon/worktrees/akrogon/seed-decisions-u3`.

- `report-an-observation.md` line 3 "It never proposes a fix.": qualify, e.g. it never proposes a fix of its own; when you state a settled decision in your request, it writes that decision into the report as an operator decision section, which charting then treats as already taken.
- Step 3 (covering report → files nothing): when your request states a decision and the covering report is open, it adds the decision to that report instead (read, insert after "Unverified intake.", whole-body write, read-back check).
- Step 4 (six sections): the six sections, plus an operator decision section after "Unverified intake." when your words decided something, and background sections you ask for, marked proposed, not decided.
- The end-lines paragraph: `Last operation:` also says when a decision section was written, without its text.
- Optional one short sentence on who counts: the chart door counts the section only when the issue author and every body editor have write or admin on the repository.
- `plan-work.md` § Set the signposts, "In the default manual mode you answer the signposts and every fork.": add the qualifier that a fork already taken from an operator decision section in an imported seed is not asked again. If § Answer one fork per round needs one sentence for that, add it there instead and keep the § Set the signposts sentence true.
- `autopilot.md` "Three modes exist…" same qualifier; § What the door does, "Where it would ask you a fork, seat A … answers it itself": add that A never answers a seed's operator decision, or a finding against it, and that a decision counted from a seed stays yours; § What still waits for you: add a bullet for a blocking finding against a seed decision (one `akrogon notice --attention`) and a bullet for a conflict between your answers (two seed decisions, or a seed decision against a reply).
- `docs/reference/skills.md` `## seed-issue` Result "one GitHub issue that records an observation as unverified intake": add "or adds your stated decision to an open report".

## 5. Do-not, reasons and exceptions

- Edit only docs/README lines a landed rule makes false: the leaf fixes false sentences, nothing else (no rewording of true sentences, no new page). Exception: none.
- Do not write the heading literal (two hashes then "Operator decision (") anywhere: the marker has two kept copies with an agreement test.
- Do not edit `skills/`, `src/` or `tests/`: other units own them and tests are A's.
- Do not run `gh` or any GitHub call.
- Never run any `git stash` subcommand: every worktree shares one stash. Set work aside with a WIP commit and, before returning, `git reset --soft 369e502c` and make the unit's single returned commit.
- Return a mismatch with evidence instead of changing scope; exception: a revised brief from A.

Reasons and exceptions restated: the design allows only fixes of false sentences and no new file; the literal has exactly two copies; other paths belong to other units; no grant covers GitHub; the shared stash can lift a sibling's edit; scope changes go through A.

## 6. Ordered steps

1. Read the landed rule text named in section 3.
2. Edit `report-an-observation.md` (criterion 1).
3. Edit `plan-work.md` and `autopilot.md` (criterion 1).
4. Edit `docs/reference/skills.md` (criterion 1).
5. Run `grep -rn "never proposes a fix\|every fork\|six\|Observation, Location\|operator answer\|covers the same failure\|files nothing\|Recommendations and silence" docs/ README.md` and fix any other line the landed rules make false; list each hit and its verdict in the report.
6. Run the commands; commit once.

Advisory size: 4 files, under 16 turns.

## 7. Commands

- `cd /home/ivan/.akrogon/worktrees/akrogon/seed-decisions-u3 && bun install --frozen-lockfile --backend=copyfile`
- `akrogon run-check --name u3-docs-links -- bun test tests/docs-links.test.ts`

## 8. Done-when, evidence and report

Done when criteria 1–4 hold, one commit `docs: seed decisions count as taken forks` exists in the worktree (no co-author line), and the report below is filled with the `check <label>: <exit> <path>` line and the step 5 grep verdicts.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
