# Brief 5: implement-issue proxy exception and reading (U5)

## 1. Goal

A may remove an existing proxy that refused the leaf's real output, records a model-choice reading after planning, and the restated test rules cover mechanical behavior and a choice's record. Plan decisions D1, D2, D3, D5. Design item W7.

## 2. Acceptance criteria

Common facts:
- Anchor: name it in plain text as "standing-design's model-choice line" (no Markdown link: links leaving a skill folder are refused). Read its landed wording in `skills/chart-issues/assets/standing-design.md` and plan-issue's landed model-choice reading paragraph in `skills/plan-issue/SKILL.md` first; use the same term for the reading.
- Function-check keep list, named inline: schema and valid keys, references, a blank required record, spend, security and process bounds, text that runs literally.

In `skills/implement-issue/SKILL.md`:
1. Fourth exception, in the paragraph starting "A test exists only as the proof ..." (line 56), where it lists "The three exceptions": A removes an existing check, gate, test or driver step that refused this leaf's real output by a proxy for a model's choice, in its own commit whose message cites the refused output and standing-design's model-choice line, with the `Test-Change:` trailer for a test file; the keep list is never removed this way, whatever the reason it was added; `implementation/report.md` lists every removal with the output it cites; the reviewing seat judges each removal, and a rejected removal is a Fix that restores it. Update the count word ("three" becomes "four").
2. Same paragraph, restated rules: "A test exists only as the proof ... a consequential edge or negative case is a done-criterion" covers cases with one right answer; the restated "new behavior shows one deliberate break" covers mechanical behavior and a choice's record; the restated "keeping tests guarding real past regressions" does not keep a proxy for a model's choice.
3. `## implement` first paragraph (line 52, "append one dated `## Implementation notes` section ... a locked decision is never changed there"): when planning is over, A records a criterion or design line's model-choice reading under plan.md `## Implementation notes`.
4. Locked-decision stop (line 36, "A fix that needs a locked decision changed ends the pass ..."): removing a sourceless proxy under the fourth exception, and recording a model-choice reading under `## Implementation notes`, are not changing a locked decision and are no mismatch; a gate or criterion whose value has a named source (the operator's words for this outcome, an outside standard or provider limit, a schema or literal contract) is never removed or read this way.
5. `## check.fix` (line 75, "revise the plan notes ... without weakening criteria or failing tests"): recording this reading and dropping a case for the number is not weakening a criterion.
6. `## Standalone` (line 87, "its only test rule is order: tests from the brief first, committed, then code") and the Direct form (line 97, "Direct follows the same order rule"): the tests-first order covers mechanical behavior and a choice's record; the choice is recorded in the report and, on the direct route, read by B under check-issue's recorded-choice bar.
7. Literals stay: `--holder <chart>/direct`, `akrogon stop-run`, `pkill -f`. Line 27's sentence holding both "Standalone" and "outside" stays on one line (test regex `standalone[^\n]*outside`). The existing `[lesson rule](lesson-rule.md)` link stays.
8. Both commands in section 7 stay green.

## 3. Read-first

- skills/implement-issue/SKILL.md (108 lines), landed standing-design.md line, landed plan-issue paragraph.
- Design /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/design.md, sections "existing-proxies" (with correction) and "Final shape" W7.
- tests/run-units.test.ts lines 683-719.
- /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Change list

- Owns `skills/implement-issue/SKILL.md` only. Needs U1 and U3 landed (in your HEAD). No shared test resource.
- Note: this repo file is the source of the skill; the installed copy at /home/ivan/.claude/skills/implement-issue is a separate release and must not be edited.

## 5. Do-not

- Do not edit worker-protocol.md, brief-template.md or ponytail.md: not owned.
- Do not edit the installed skill under /home/ivan/.claude/skills: it is the running release.
- Do not rewrite neighbouring rules; add clauses in place: review reads sentence by sentence, and the long paragraph carries pinned literals.
- Do not add or edit tests: tests are locked.
- Return a mismatch with quotes on a conflict. Exception for all: a revised brief from A.
Reasons and exceptions restated: other files are not owned, the installed release is not the product, pinned literals must survive, tests are locked; a revised brief from A is the only exception.

## 6. Steps

1. Read the landed standing-design line and plan-issue paragraph.
2. Items 1-6 as added clauses in place.
3. Run section 7. Commit.

Advisory size: 1 file, under 10 turns.

## 7. Commands

First, in your worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
Then: `akrogon run-check --name u5-links -- bun test tests/docs-links.test.ts tests/chart-shapes.test.ts` and `akrogon run-check --name u5-literals -- bun test tests/run-units.test.ts -t "^skills name"`.

## 8. Done-when and report

Commit with message `skills: implement-issue removes a proxy that refused real output and records a model-choice reading`, no Co-Authored-By trailer. Return the commit ID, both `check <label>: <exit> <path>` lines, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
