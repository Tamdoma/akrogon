# Brief 2: chart door clauses (U2)

## 1. Goal

Stop proxies where they are born: the fork round's removers, the handoff audit and autopilot's own picks. Plan decisions D1, D2. Design items W2, W3, W4.

## 2. Acceptance criteria

Common facts for every clause:
- Anchor: name it in plain text as "standing-design's model-choice line" or link `[standing-design.md](standing-design.md)` (same folder, allowed). It is the bullet in `skills/chart-issues/assets/standing-design.md` that starts after the cheapest-sufficient-test bullet; read its landed wording first and match its terms.
- Named one-right-answer sources: the operator's words for this outcome, an outside standard or provider limit, a schema or literal contract.

1. `skills/chart-issues/assets/questions.md` (W2): in the round template line "Pitfalls avoided: <...>" (line 27) and in the "Known traps are designed out ..." sentence of the long paragraph (line 37), removers are: a part of the option, a probe, a done-criterion, the model's own recorded choice for a quality call (naming who judges, on what evidence and where the reason is recorded), or a named operator step with its owner, used only when the operator alone can grant or know the answer.
2. `skills/chart-issues/assets/shapes.md` audit paragraph under `## Preflight and validation` (line 386), beside "the audit refuses a guessed wall-second or CPU-second cap" (W3): the audit refuses a criterion or design line whose pass rests on a count, share, similarity score, keyword or text match standing in for a model's choice, unless the design cites the operator words for this outcome, outside standard or literal contract that supplies the value; it refuses an operator stop that answers a quality call per item; the refusal names the rewrite: who decides, on what evidence, where the choice and reason are recorded.
3. shapes.md's two proof-form lists, "the own-test, end-to-end, real-outside-call and live-run forms" in the Leaf files brief template (line 267) and in the audit paragraph (line 386), gain the model-choice form: the record's function checks plus the reviewing seat's reading under standing-design's model-choice line.
4. `skills/chart-issues/assets/autopilot.md` limits sentence (line 9, "The door never turns autopilot on, extends the handed list, ...") (W4): the door never answers a fork with a count, share, similarity score or text match on model output unless the operator's words for this outcome or an outside standard supply it; its pick never supplies that source, so it takes the model-decides option and parks the chart for no number.
5. shapes.md's `### readiness.yaml` block is untouched. `bun test tests/docs-links.test.ts tests/chart-shapes.test.ts` stays green.

## 3. Read-first

- The three owned files at the named lines, and the landed standing-design.md in your worktree.
- Design /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/design.md, sections "charting", "proof-form" correction (B5) and "Final shape" W2-W4.
- /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Change list

- Owns `skills/chart-issues/assets/questions.md`, `shapes.md`, `autopilot.md`. Needs U1 (standing-design line) landed; it is in your worktree's HEAD. No shared test resource.

## 5. Do-not

- Do not edit `skills/chart-issues/SKILL.md`: the design leaves its Take key-part rule unchanged.
- Do not edit the readiness.yaml example: criterion 4 depends on it parsing.
- Do not rewrite neighbouring sentences; add clauses or sentences in place: review reads sentence by sentence.
- Do not add or edit tests: tests are locked.
- Return a mismatch with quotes on a conflict with existing text. Exception for all: a revised brief from A.
Reasons and exceptions restated: SKILL.md and the yaml example are out of scope, review needs local edits, tests are locked; a revised brief from A is the only exception.

## 6. Steps

1. Read standing-design.md's new line.
2. questions.md edits (criterion 1).
3. shapes.md edits (criteria 2, 3).
4. autopilot.md edit (criterion 4).
5. Run section 7. Commit.

Advisory size: 3 files, under 14 turns.

## 7. Commands

First, in your worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
Then: `akrogon run-check --name u2-links -- bun test tests/docs-links.test.ts tests/chart-shapes.test.ts`.

## 8. Done-when and report

Commit with message `skills: chart door refuses sourceless proxies and per-item quality stops`, no Co-Authored-By trailer. Return the commit ID, the `check u2-links: <exit> <path>` line, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
