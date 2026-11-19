# Brief 4: check-issue proxies and recorded choices (U4)

## 1. Goal

The reviewing seat treats a proxy for a model's choice in the diff as a Fix on sight, judges a recorded choice only by named harm, and hands judgment Fixes to A. Plan decisions D1, D2, D3. Design item W6.

## 2. Acceptance criteria

Common facts:
- Anchor: name it in plain text as "standing-design's model-choice line" (no Markdown link: links leaving a skill folder are refused). Read its landed wording in `skills/chart-issues/assets/standing-design.md` and plan-issue's landed model-choice reading paragraph in `skills/plan-issue/SKILL.md` first; use the same term for the reading.
- Function-check keep list, named inline: schema and valid keys, references, a blank required record, spend, security and process bounds, text that runs literally.
- Write "the reviewing seat", not "B", in check.review clauses.

In `skills/check-issue/SKILL.md`:
1. check.review Fix paragraph ("A Fix is wrong behavior ...", line 49): a check, gate, test or driver step in the diff that decides pass, fail or the next step by model-written text, or by a count, share or similarity score standing in for a model's choice without a named source, is a Fix under standing-design's model-choice line with no failed run needed; its realistic source is the model output the leaf produces; the Fix names the choice it replaced. Never this Fix: the keep list. A recorded model choice is a Fix only when the reviewing seat names a fact its recorded evidence contradicts, a required input it did not weigh, a broken function or a function-check breach; a different reading is a Nit that opens no repair; the same bar applies again to a redone choice, per named harm.
2. Test comparison paragraph (line 51): "a done-criterion has no test that would catch its failure" excludes the choice part, which the reviewing seat reads on the named run; "wording coupling that does not fail today" excepts a match on model-written text (a Fix under item 1); the restated "new behavior shows one deliberate break" covers mechanical behavior and a choice's record; "tests guarding real past regressions stay" does not keep a proxy for a model's choice. The sentence "reject akrogon tests of prose/output wording except commands, numbers or fixed references that run literally as written" is not widened or changed.
3. "scenarios a done-criterion names always block" (line 59): a sourceless proxy for a model's choice blocks as the plan's recorded model-choice reading, judged by the reviewing seat, not as the number; where no reading is recorded, the finding goes to A to record it before the choice is judged.
4. Both reusable-Nit lesson sentences, check.review "Before a verdict that is not `fix`, B records each reusable Nit ..." (line 63) and check.repair "Before its move to `merge`, B records each reusable Nit ..." (line 95): except a different reading of a recorded model choice, which is never written as a lesson line.
5. check.repair (line 79, the list "B repairs every Fix except ..."): a recorded model choice joins the Fixes B does not repair; it goes under `Handed to A`, and A has the writer redo it with the named harm as new evidence; for a product model that means changing its instructions and re-recording only under standing-design's recorded-output fresh-call rule and its grant.
6. Literals stay: `<chart>/direct`, `akrogon stop-run`, `pkill -f`. Existing `[lesson rule](lesson-rule.md)` links stay.
7. Both commands in section 7 stay green.

## 3. Read-first

- skills/check-issue/SKILL.md (110 lines), landed standing-design.md line, landed plan-issue paragraph.
- Design /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/design.md, sections "review" (with correction) and "Final shape" W6.
- tests/run-units.test.ts lines 683-719 (pinned literals).
- /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Change list

- Owns `skills/check-issue/SKILL.md`. Needs U1 and U3 landed (in your HEAD). No shared test resource.

## 5. Do-not

- Do not widen the akrogon prose-test rejection to every repo: the design rejected it.
- Do not add an operator stop or a `failed` route for an in-flight proxy criterion: rejected.
- Do not touch the Standalone review section beyond what items 1-5 imply: it inherits the check.review bar by reference.
- Do not add or edit tests: tests are locked.
- Return a mismatch with quotes on a conflict. Exception for all: a revised brief from A.
Reasons and exceptions restated: prose-test widening and per-leaf stops were rejected, Standalone inherits, tests are locked; a revised brief from A is the only exception.

## 6. Steps

1. Read the landed standing-design line and plan-issue paragraph.
2. Items 1-5, each as added clauses in place.
3. Run section 7. Commit.

Advisory size: 1 file, under 10 turns.

## 7. Commands

First, in your worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
Then: `akrogon run-check --name u4-links -- bun test tests/docs-links.test.ts tests/chart-shapes.test.ts` and `akrogon run-check --name u4-literals -- bun test tests/run-units.test.ts -t "^skills name"`.

## 8. Done-when and report

Commit with message `skills: check-issue fixes proxies for a model's choice and judges a recorded choice by named harm`, no Co-Authored-By trailer. Return the commit ID, both `check <label>: <exit> <path>` lines, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
