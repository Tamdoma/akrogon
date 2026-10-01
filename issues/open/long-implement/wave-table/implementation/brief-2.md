# Brief 2: implement side (U2)

## 1. Goal
Seat A runs each plan wave whole and the fallback "one at a time when unsure" is gone. Plan decisions D2, D3, D5, D6, D7, D8, D9. Prose only.

## 2. Numbered acceptance criteria
1. `skills/implement-issue/worker-protocol.md` line 11, opening wave sentence only: in delegated mode A runs each plan wave whole, up to 3 workers at once, once its prerequisites have landed, and waits on all of them together. A unit leaves a wave only for a recorded reason: an unmet prerequisite puts it in a later wave, and a shared owned path or shared test resource keeps it out of the wave of the unit it shares with. No other reason splits a wave. A plan without a wave grouping (written before this change) is grouped by A from the sub-brief records by the same rule. ", one at a time when unsure" is deleted. The standalone clause ("standalone workers keep running one after another in the current checkout") and everything after the opening sentence stay unchanged.
2. `skills/implement-issue/SKILL.md` line 44 (the implement paragraph): the delegation clause says A runs each plan wave whole, up to 3 workers at once, and waits on all together; ", one at a time when unsure" is deleted; the inline clause says inline mode follows wave order, then listed order inside a wave (replacing "implement the plan's checklist in order").
3. `skills/implement-issue/SKILL.md` check.fix paragraph (starts "Read the recorded findings and reviewed commit", line 66): repair sub-briefs are grouped by the same rule, so findings with disjoint paths and no shared resource repair in one wave. Keep the existing "use worker waves before the last allowed repair round" meaning.
4. `skills/implement-issue/brief-template.md` line 21 (section 4), closing sentence "A uses these records to pick wave members and judge independence": the records carry the plan's wave values into the sub-brief, and A groups from them only when the plan has no wave grouping. Record fields stay unchanged (chunks that must land first, owned paths, shared test resource or consumed output).
5. The phrase "one at a time when unsure" appears nowhere in these three files. Line 3 of `SKILL.md` (description) stays unchanged.
6. No new test (design: a wording test is a vanity test).

## 3. Read-first list
- `skills/implement-issue/worker-protocol.md` line 11
- `skills/implement-issue/SKILL.md` lines 3, 44, 66
- `skills/implement-issue/brief-template.md` line 21
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces
Edit only the sentences named in the criteria, in the three files listed. Keep the dense one-paragraph style. Another leaf (proof-order) edits other sentences of `worker-protocol.md:11` and `SKILL.md`; touch only the sentences named here so a later rebase stays clean.
Chunks that must land first: none. Paths this unit owns: `skills/implement-issue/worker-protocol.md`, `skills/implement-issue/SKILL.md`, `skills/implement-issue/brief-template.md`. Shared test resource: none. Consumed output: none.

## 5. Do-not, reasons and exceptions
- Do not edit `skills/plan-issue/SKILL.md`, `skills/AREA.md` or `docs/`. Other units own them. Exception: none.
- Do not add a clock, state field, size gate or count other than the cap of 3. The design locks wording-only. Exception: none.
- Do not touch other sentences of those lines or paragraphs (worktree, cherry-pick, report rules). Exception: none.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
Reasons and exceptions restated: wording-only scope, three owned files, named sentences only; only a brief from A can widen it.

## 6. Ordered steps
1. Read the four locations. (criteria 1-4)
2. Edit worker-protocol.md:11. (criterion 1)
3. Edit SKILL.md:44. (criterion 2)
4. Edit SKILL.md check.fix paragraph. (criterion 3)
5. Edit brief-template.md:21. (criterion 4)
6. `grep -rn "one at a time when unsure" skills/implement-issue` prints nothing. (criterion 5)
7. Run the command in section 7. Advisory size: 3 files, under 14 turns.

## 7. Commands
Install dependencies in the worktree first (`bun install`). Then:
`AKROGON_BASE=2b796e98a2da6f914332e736974b93a0bc645715 bash -c 'bun test --changed="$AKROGON_BASE"'`
(a prose-only diff may run no tests; report that).
Commit only this chunk in your worktree and return the commit ID.

## 8. Done-when, evidence and report
Done when criteria 1-5 hold on a re-read and the grep and command results are pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
