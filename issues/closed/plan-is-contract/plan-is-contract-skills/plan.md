# Plan: plan-is-contract-skills

## Goal

Remove the whole-leaf `implementation/brief.md` contract. `plan.md` becomes the leaf's contract; `implementation/report.md` becomes the single completion record. Prose only: seven files, no command, test or worker-protocol change.

## Decisions

- D1 (locked, operator 7a): `implementation/report.md` is the one completion record, written by B after the last check with five contents: changed files and reasons, commands run with pasted results and artifact paths, the base and committed head, known limitations, unverified criteria. Worker returns fold into it. check-issue and merge-issue read `plan.md` and `report.md`. Foreclosed: a `## Completed` section in plan.md; per-worker `report-N.md` files.
- D2 (locked, operator 8a): B appends one dated `## Implementation notes` section to `plan.md` before coding, only when an implementation-only constraint is missing, naming each constraint and the decision it refines. Locked decisions are refined, never changed; a conflict with a lock is a mismatch recorded for review. Foreclosed: deviations only in the report; a separate notes file.
- D3 (locked, operator 9a): Delegated mode always writes one sub-brief per unit from the eight-section template, one unit included. Inline mode writes nothing. The template drops the whole-leaf brief; standalone keeps its task brief from the template. Foreclosed: handing a worker plan.md with the command in the prompt.
- D4 (locked, operator 10a): check-issue reads `plan.md`, `design.md` and `implementation/report.md` before the diff and judges scope against the design's exclusions and the plan's decisions. Foreclosed: an Exclusions section copied into plan.md.
- D5: This leaf is one implementation unit. The seven edits are one coupled contract change verified by greps spanning all files, so delegated mode writes exactly one sub-brief (`implementation/brief-1.md`) covering all seven.
- D6: Commit order is code first, report second. `report.md` lives in the registered checkout (an issue artifact, refused on the branch), and it must record the committed head, so the code commit precedes writing it.
- D7: Verification is the three blocking checks plus the criterion-9 grep artifact. The user-visible flow is an agent reading the changed skills at its next leaf phase; fixtures cannot run a skill, so no end-to-end invocation exists. The checker reads the changed sections end to end as a fresh implementer would.

## Read-first list

- `skills/implement-issue/SKILL.md` — lines 3, 21, 33, 39, 47, 51 change.
- `skills/implement-issue/brief-template.md` — lines 3 and 5 change; the eight `## N.` headings and four fill-in lines stay verbatim.
- `skills/check-issue/SKILL.md` — lines 14 and 27 change.
- `skills/merge-issue/SKILL.md` — line 14 changes.
- `skills/AREA.md` — line 25 changes.
- `docs/guide/phases.html` — line 61 changes.
- `docs/guide/files.html` — line 104 changes.
- `skills/implement-issue/worker-protocol.md` — read for the delegation contract; not edited.
- `skills/implement-issue/ponytail.md`, `skills/check-issue/ponytail.md` — read per each skill's shared context; not edited.
- `design.md` — the literal interface sentences below are copied from it verbatim.

## Needed interfaces

The replacement sentences that run as rules. File names, the section name `## Implementation notes` and the five report contents are literal; other wording is by content.

- implement-issue:3 → "using eight-section worker sub-briefs and sequential workers or configured inline execution".
- implement-issue:21 → "use its `plan.md`, `design.md` and current review findings while editing only the leaf worktree."
- implement-issue:33 → "Before coding, when an implementation-only constraint is missing from `plan.md`, append one dated `## Implementation notes` section naming each constraint and the decision it refines; a locked decision is never changed there, and a conflict with one is a mismatch recorded for review. Then implement the plan's checklist in order yourself when config says `inline`, otherwise write one sub-brief per unit from the template, one unit included, and delegate each to a subagent sequentially in this worktree using the worker protocol."
- implement-issue:39 → "... then commit the code on the leaf branch and write `<leaf>/implementation/report.md` with changed files and reasons, commands run with pasted results and artifact paths, the base and committed head, known limitations and unverified criteria, folding worker returns into it, before handoff; ..." with the rest of the sentence unchanged.
- implement-issue:47 → "revise the plan notes and affected sub-briefs around those defects"; :51 → "append the repair's before and after commits to `report.md`".
- brief-template:3 → "Read when B writes or revises a worker sub-brief or a standalone task brief; ..."; :5 → "A delegated leaf writes `implementation/brief-1.md`, `brief-2.md`, etc., one per unit and one unit included, each with these eight sections and only its own scope, with the binding facts for that scope copied in rather than pointed at; the leaf has no whole-leaf brief because `plan.md` is its contract. Standalone writes one task brief with these sections."
- check-issue:14 → "then read its `plan.md` including any implementation notes, `design.md`, `implementation/report.md` and this skill's ponytail before inspecting the worktree diff."; :27 → "judge the whole initial diff against the plan's decisions, criteria, change list and checklist, the design's exclusions, the report and live contracts, ..." with the rest unchanged.
- merge-issue:14 → "read its plan, `implementation/report.md` and reviews".
- phases.html:61 → "writes `implementation/report.md`"; files.html:104 → `implementation/report.md` row with the same description; skills/AREA.md:25 → "gives the eight-section worker sub-brief."

## Ordered checklist

Each step names its file and the done-criteria it satisfies.

1. `skills/implement-issue/SKILL.md` — six edits: description line 3, leaf read sentence 21, implement step 33, report/commit sentence 39, check.fix revise phrase 47, check.fix report phrase 51. The standalone sentence at line 55 keeps `implementation/brief.md` untouched. Criteria 1, 2, 4, 6, 7.
2. `skills/implement-issue/brief-template.md` — two edits: read-when clause line 3, opening rule line 5. Keep the eight `## N.` headings in order, the four fill-in lines, and the 1,500-word/20-rule limit verbatim. Criteria 2, 3, 6, 7.
3. `skills/check-issue/SKILL.md` — two edits: read list line 14, judgment sentence 27. Criteria 2, 5.
4. `skills/merge-issue/SKILL.md` — one edit: "implementation report" → `implementation/report.md` at line 14. Criterion 2.
5. `skills/AREA.md` — one edit: line 25 "eight-section contract" → "eight-section worker sub-brief". Criterion 6.
6. `docs/guide/phases.html` — one edit: line 61 `implementation/brief.md` → `implementation/report.md`. Criteria 1, 2.
7. `docs/guide/files.html` — one edit: line 104 row `implementation/brief.md` → `implementation/report.md`, same description. Criteria 1, 2.
8. Run the blocking checks: `bun test`, `bun run typecheck`, `bun run format`. Criterion 8.
9. Run the verification artifact: `bash -o pipefail -c 'grep -rn "implementation/brief.md\|implementation/report.md" skills/ docs/guide/ 2>&1 | tee /tmp/akrogon-plan-is-contract-skills-grep.log'`; confirm exit 0 and output satisfying criteria 1 and 2. Criterion 9.
10. Commit the code on the leaf branch, then write `implementation/report.md` with the five contents including the grep log path. Criteria 2, 9.

## Acceptance criteria

1. `grep -rn "implementation/brief.md" skills/ docs/guide/` returns exactly one line: the standalone sentence in `skills/implement-issue/SKILL.md`.
2. `grep -ln "implementation/report.md" skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md docs/guide/phases.html docs/guide/files.html` lists all five files.
3. `grep -c "^## [1-8]\. " skills/implement-issue/brief-template.md` prints 8; headings keep order; the four fill-in lines (Changed files and reasons, Tests run, Known limitations, Unverified criteria) are present unchanged.
4. The implement section of implement-issue states in order: the conditional dated `## Implementation notes` append with the never-change-a-lock rule; one sub-brief per unit in delegated mode with one unit included; no sub-brief in inline mode; `report.md` with the five contents written after the commit and before handoff.
5. The check-issue read list names `plan.md`, `design.md`, `implementation/report.md` and ponytail; its judgment sentence names the design's exclusions; check-issue and the implement-issue description line no longer name a whole-leaf implementation brief.
6. No sentence in implement-issue or the template asks B to restate the plan's criteria, read-first list, change list or ordered steps in a whole-leaf `implementation/brief.md`.
7. Standalone, the worker protocol, the peer-question rule, the footer rules, the lesson rules and the template's 1,500-word and 20-rule limit read unchanged except the template's line 3 read-when clause.
8. `bun test`, `bun run typecheck` and `bun run format` pass.
9. `bash -o pipefail -c 'grep -rn "implementation/brief.md\|implementation/report.md" skills/ docs/guide/ 2>&1 | tee /tmp/akrogon-plan-is-contract-skills-grep.log'` exits 0, its output satisfies criteria 1 and 2, and the report records the path.

## Verification

- Blocking: `bun test`, `bun run typecheck`, `bun run format` in the worktree.
- Changed-tests command for the worker: `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=26a7bc2613af4a2c9d579351bc66e87cd1af1427`; a prose-only diff runs zero tests and exits 0 (verified on this base).
- Artifact: the criterion-9 grep pipeline, log at `/tmp/akrogon-plan-is-contract-skills-grep.log`, path recorded in `report.md`.

## Exclusions

Everything under Off route in the chart; `worker-protocol.md`, both ponytails, plan-issue, the standalone sentence, `src/`, `tests/`, other guide pages, closed leaves and their files, and L1's guide lines (phases.html:74, problems.html, next.html, setup.html, cheat.html).

## Dependencies

None. `command-deletions-batch` edits other lines of `docs/guide/phases.html`; file overlap does not order work.

## Open limitations

The grep artifact proves file contents, not that a future agent follows the new contract; that judgment belongs to check.review reading the changed sections as a fresh implementer.
