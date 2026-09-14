# Sub-brief 1: plan-is-contract-skills

## 1. Goal

Remove the whole-leaf `implementation/brief.md` contract from the skills and guide. `plan.md` becomes the leaf's contract; `implementation/report.md` becomes the single completion record. Prose only: seven files, no command, test or worker-protocol change. Plan decisions D1–D7.

## 2. Numbered acceptance criteria

1. `grep -rn "implementation/brief.md" skills/ docs/guide/` returns exactly one line: the standalone sentence in `skills/implement-issue/SKILL.md` ("plan briefly in `implementation/brief.md`").
2. `grep -ln "implementation/report.md" skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md docs/guide/phases.html docs/guide/files.html` lists all five files.
3. `grep -c "^## [1-8]\. " skills/implement-issue/brief-template.md` prints 8; headings keep order; the four fill-in lines (Changed files and reasons, Tests run, Known limitations, Unverified criteria) are present unchanged.
4. The implement section of implement-issue states in order: the conditional dated `## Implementation notes` append with the never-change-a-lock rule; one sub-brief per unit in delegated mode with one unit included; no sub-brief in inline mode; `report.md` with the five contents written after the commit and before handoff.
5. The check-issue read list names `plan.md`, `design.md`, `implementation/report.md` and ponytail; its judgment sentence names the design's exclusions; check-issue and the implement-issue description line no longer name a whole-leaf implementation brief.
6. No sentence in implement-issue or the template asks B to restate the plan's criteria, read-first list, change list or ordered steps in a whole-leaf `implementation/brief.md`.
7. Standalone, the worker protocol, the peer-question rule, the footer rules, the lesson rules and the template's 1,500-word and 20-rule limit read unchanged except the template's line 3 read-when clause.
8. `bun test`, `bun run typecheck` and `bun run format` pass (B runs these; worker runs only the section-7 command).
9. `bash -o pipefail -c 'grep -rn "implementation/brief.md\|implementation/report.md" skills/ docs/guide/ 2>&1 | tee /tmp/akrogon-plan-is-contract-skills-grep.log'` exits 0 and its output satisfies criteria 1 and 2.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` — edits at lines 3, 21, 33, 39, 47, 51.
- `skills/implement-issue/brief-template.md` — edits at lines 3 and 5 only.
- `skills/check-issue/SKILL.md` — edits at lines 14 and 27.
- `skills/merge-issue/SKILL.md` — edit at line 14.
- `skills/AREA.md` — edit at line 25.
- `docs/guide/phases.html` — edit at line 61.
- `docs/guide/files.html` — edit at line 104.
- `skills/implement-issue/ponytail.md` — this skill folder's ponytail.
- Pattern to copy: the surrounding sentence structure of each file; every edit is an in-place sentence replacement, not a rewrite.

## 4. Change list and needed interfaces

Apply these exact replacements. Old text is quoted from the live files; new text is literal.

### skills/implement-issue/SKILL.md

Edit A, line 3 (description frontmatter):
- old: `using an eight-section brief and sequential workers or configured inline execution`
- new: `using eight-section worker sub-briefs and sequential workers or configured inline execution`

Edit B, line 21:
- old: `and use its `plan.md`, `implementation/brief.md` and current review findings while editing only the leaf worktree.`
- new: `and use its `plan.md`, `design.md` and current review findings while editing only the leaf worktree.`

Edit C, line 33 (whole paragraph):
- old: `Write `<leaf>/implementation/brief.md` from the template, then implement it in order yourself when config says `inline`, otherwise delegate each bounded sub-brief to a subagent sequentially in this worktree using the worker protocol.`
- new: `Before coding, when an implementation-only constraint is missing from `plan.md`, append one dated `## Implementation notes` section naming each constraint and the decision it refines; a locked decision is never changed there, and a conflict with one is a mismatch recorded for review. Then implement the plan's checklist in order yourself when config says `inline`, otherwise write one sub-brief per unit from the template, one unit included, and delegate each to a subagent sequentially in this worktree using the worker protocol.`

Edit D, line 39 (whole paragraph):
- old: `After the last implementation unit, run the full suite once as B and every other blocking check, repair any failure by the protocol (yourself in inline mode), then fill the report with command evidence and commit the code on the leaf branch before handoff; `akrogon phase` refuses a dirty worktree and refuses any file under `issues/` on the branch, because every issue artifact is written only in the registered checkout.`
- new: `After the last implementation unit, run the full suite once as B and every other blocking check, repair any failure by the protocol (yourself in inline mode), then commit the code on the leaf branch and write `<leaf>/implementation/report.md` with changed files and reasons, commands run with pasted results and artifact paths, the base and committed head, known limitations and unverified criteria, folding worker returns into it, before handoff; `akrogon phase` refuses a dirty worktree and refuses any file under `issues/` on the branch, because every issue artifact is written only in the registered checkout.`

Edit E, line 47 (phrase inside the sentence):
- old: `revise the brief around those defects`
- new: `revise the plan notes and affected sub-briefs around those defects`

Edit F, line 51 (phrase inside the sentence):
- old: `update affected docs/index lines and report with the repair's before/after commits`
- new: `update affected docs/index lines and append the repair's before and after commits to `report.md``

Do not touch line 55 (the standalone sentence keeps `implementation/brief.md`).

### skills/implement-issue/brief-template.md

Edit G, line 3 (clause inside the sentence):
- old: `Read when B writes or revises the task brief;`
- new: `Read when B writes or revises a worker sub-brief or a standalone task brief;`

Edit H, line 5 (whole paragraph):
- old: `One verifiable unit uses `implementation/brief.md`; a delegated leaf with several units keeps that overall brief and writes `implementation/brief-1.md`, `brief-2.md`, etc., each with these same eight sections and only its own scope.`
- new: `A delegated leaf writes `implementation/brief-1.md`, `brief-2.md`, etc., one per unit and one unit included, each with these eight sections and only its own scope, with the binding facts for that scope copied in rather than pointed at; the leaf has no whole-leaf brief because `plan.md` is its contract. Standalone writes one task brief with these sections.`

Everything below line 5 stays byte-identical: the eight `## N.` headings in order and the four fill-in lines.

### skills/check-issue/SKILL.md

Edit I, line 14 (clause inside the sentence):
- old: `then read its `plan.md`, `implementation/brief.md` and this skill's [ponytail.md](ponytail.md) before inspecting the worktree diff.`
- new: `then read its `plan.md` including any implementation notes, `design.md`, `implementation/report.md` and this skill's [ponytail.md](ponytail.md) before inspecting the worktree diff.`

Edit J, line 27 (clause inside the sentence):
- old: `then judge the whole initial diff against the plan, brief criteria/change list/exclusions/done/report and live contracts,`
- new: `then judge the whole initial diff against the plan's decisions, criteria, change list and checklist, the design's exclusions, the report and live contracts,`

### skills/merge-issue/SKILL.md

Edit K, line 14 (phrase inside the sentence):
- old: `and read its plan, implementation report and reviews,`
- new: `and read its plan, `implementation/report.md` and reviews,`

### skills/AREA.md

Edit L, line 25:
- old: `- `skills/implement-issue/brief-template.md` gives the eight-section contract.`
- new: `- `skills/implement-issue/brief-template.md` gives the eight-section worker sub-brief.`

### docs/guide/phases.html

Edit M, line 61 (phrase inside the `<li>`):
- old: `writes <code>implementation/brief.md</code>,`
- new: `writes <code>implementation/report.md</code>,`

### docs/guide/files.html

Edit N, line 104 (whole row):
- old: `<tr><td>implementation/brief.md</td><td>B</td><td>What was built, check output, the commit.</td></tr>`
- new: `<tr><td>implementation/report.md</td><td>B</td><td>What was built, check output, the commit.</td></tr>`

## 5. Do-not, reasons and exceptions

- Do not edit any file outside the seven listed: no `worker-protocol.md`, no ponytails, no plan-issue, no `src/`, no `tests/`, no other guide pages, no `docs/guide/phases.html` line 74 or problems/next/setup/cheat pages. Reason: the design's exclusions foreclose them; the exception is a revised brief from B authorizing the change.
- Do not touch the standalone sentence at implement-issue line 55. Reason: criterion 1 requires it to remain the only `implementation/brief.md` hit; the exception is a revised brief.
- Do not alter the template's eight `## N.` headings, the four fill-in lines, or the 1,500-word/20-rule limit. Reason: criteria 3 and 7; the exception is a revised brief.
- Do not add tests, comments, or reformat untouched lines. Reason: prose-only leaf, `bun run format` must pass on the existing style; the exception is a revised brief.
- If any quoted old text does not match the live file, return a mismatch with evidence naming the conflicting requirement and the smallest brief correction instead of improvising. Reason: wrong-scope edits break criteria 1–7; the exception is a revised brief from B authorizing that change.

Restated: the exclusions exist to keep the diff to the locked seven-file contract change; the only exception to any of them is a revised brief from B.

## 6. Ordered steps

1. Apply edits A–F in `skills/implement-issue/SKILL.md`. Criteria 1, 2, 4, 6, 7.
2. Apply edits G–H in `skills/implement-issue/brief-template.md`. Criteria 2, 3, 6, 7.
3. Apply edits I–J in `skills/check-issue/SKILL.md`. Criteria 2, 5.
4. Apply edit K in `skills/merge-issue/SKILL.md`. Criterion 2.
5. Apply edit L in `skills/AREA.md`. Criterion 6.
6. Apply edit M in `docs/guide/phases.html`. Criteria 1, 2.
7. Apply edit N in `docs/guide/files.html`. Criteria 1, 2.
8. Run the section-7 changed-tests command, then the criterion-9 grep pipeline. Criteria 1, 2, 9.

Advisory size: about 7 files and under 28 turns (4 per file). Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=26a7bc2613af4a2c9d579351bc66e87cd1af1427`. A prose-only diff runs zero tests and exits 0.

Then the artifact: `bash -o pipefail -c 'grep -rn "implementation/brief.md\|implementation/report.md" skills/ docs/guide/ 2>&1 | tee /tmp/akrogon-plan-is-contract-skills-grep.log'`.

## 8. Done-when, evidence and report

All fourteen edits applied; the changed-tests command exits 0; the grep pipeline exits 0 with `implementation/brief.md` appearing only in the implement-issue standalone sentence and `implementation/report.md` present in all five required files. Paste both command outputs and record the log path `/tmp/akrogon-plan-is-contract-skills-grep.log`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
