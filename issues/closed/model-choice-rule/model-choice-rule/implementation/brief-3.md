# Brief 3: plan-issue model-choice reading (U3)

## 1. Goal

plan.synthesis proves a model-choice criterion in two parts: the record takes cases, the choice takes none; a sourceless proxy in a criterion is read in this form. Plan decisions D1, D2. Design item W5.

## 2. Acceptance criteria

Common facts:
- Anchor: name it in plain text as "standing-design's model-choice line" (no Markdown link: the link checker refuses links leaving a skill folder). Read its landed wording in `skills/chart-issues/assets/standing-design.md` first and match its terms.
- Function-check keep list (name it inline where the clause needs it): schema and valid keys, references, a blank required record, spend, security and process bounds, text that runs literally.

1. In `skills/plan-issue/SKILL.md` `## plan.synthesis`, the command-mapping sentence ("plan.md maps each done-criterion to the observation that proves it ...", line 41) and the own-tests sentence ("A plan proves the brief's done-criteria with the leaf's own tests and `checks` commands ...", line 45) are scoped to cover mechanical behavior and a choice's record.
2. A new paragraph sits directly before the paragraph starting "Before writing the criterion tests" (line 51), carrying all of this: a model-choice criterion is proven in two parts. Its record, when it is a product artifact, takes the cases and tests this section requires (a record in a seat's own lifecycle file is read by the reviewing seat): it exists, keys and states are valid, references resolve, the reason is not blank. The choice takes none: no test, case or deliberate break holds an expected value for what the model chose or wrote; plan.md names instead the run the leaf makes anyway or the recording it already has, the paths of the record and outputs the reviewing seat reads, and what stays unproven, and this is not new proof machinery. A criterion or design line that decides a model's choice by a count, share, similarity score or text match with no named source is read in this form: the planner records that reading beside it in plan.md, keeps its function checks and plans no case for the number; applying the standing-design line this way is not changing a locked decision. A value with a named one-right-answer source (the operator's words for this outcome, an outside standard or provider limit, a schema or literal contract) is never read as a choice.
3. The per-condition paragraph ("Before writing the criterion tests ...") and the test-writing paragraph ("With `plan.md` written ...") are otherwise unchanged; the new paragraph governs them by coming first.
4. Name the reading so other files can cite it: "the model-choice reading" (implement-issue and check-issue will refer to "plan-issue's model-choice reading" recorded beside the criterion in plan.md).
5. `bun test tests/docs-links.test.ts tests/chart-shapes.test.ts` stays green.

## 3. Read-first

- skills/plan-issue/SKILL.md (66 lines), the landed standing-design.md line.
- Design /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/design.md, sections "proof-form" (with correction) and "Final shape" W5.
- /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Change list

- Owns `skills/plan-issue/SKILL.md`. Needs U1 landed (in your HEAD). No shared test resource.
- Output for later units: the exact term you use for the reading; report it in Known limitations or Changed files.

## 5. Do-not

- Do not change the proof-command correction paragraph, the machinery stop or the credential paragraph: out of scope.
- Do not add a tag, schema field or new proof form: the design rejected them.
- Do not add or edit tests: tests are locked.
- Return a mismatch with quotes on a conflict. Exception for all: a revised brief from A.
Reasons and exceptions restated: those paragraphs are out of scope, tags and new forms were rejected, tests are locked; a revised brief from A is the only exception.

## 6. Steps

1. Read the landed standing-design line.
2. Scope the two sentences (criterion 1).
3. Add the paragraph (criterion 2).
4. Run section 7. Commit.

Advisory size: 1 file, under 8 turns.

## 7. Commands

First, in your worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
Then: `akrogon run-check --name u3-links -- bun test tests/docs-links.test.ts tests/chart-shapes.test.ts`.

## 8. Done-when and report

Commit with message `skills: plan-issue proves a model choice by its record and a reading, never a case`, no Co-Authored-By trailer. Return the commit ID, the `check u3-links: <exit> <path>` line, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
