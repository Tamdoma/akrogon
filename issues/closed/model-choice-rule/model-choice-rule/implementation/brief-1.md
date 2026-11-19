# Brief 1: standing-design model-choice line (U1)

## 1. Goal

Add the model-choice line to `skills/chart-issues/assets/standing-design.md` and scope six sibling lines so they cover mechanical behavior and a choice's record, never the choice itself. Plan decisions D1, D2 (plan.md under /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/). Design item W1.

## 2. Acceptance criteria

1. A new bullet sits directly after the bullet starting "Each done-criterion is proven by the cheapest sufficient test". It carries all of the W1 substance below.
2. The six scoping edits below are made as added clauses in their existing bullets. The writer/checker bullet's last sentence ("A model-judged such check tests one known-acceptable and one known-unacceptable case at target size and states what stays unproven.") is deleted.
3. No other bullet changes. No Markdown link is added.
4. `bun test tests/docs-links.test.ts tests/chart-shapes.test.ts` stays green.

W1 substance, binding (exact wording is yours; every element must be present):

New line: a script decides only what has one right answer: a file, key, state or reference exists and is valid, nothing required is blank, a value sits inside a bound whose source is named (the operator's words for this outcome, an outside standard or provider limit, a schema or literal contract), text that runs literally (a command, number, fixed reference or a marker command code parses) matches, process bounds (rounds, waves, retries, timeouts) hold, and security, spend and destructive effects stay inside their grants; a mechanical rejection always overrides a model approval. What a model is asked to decide (quality, sufficiency, relevance, similarity, wording, intent, which items apply and the like) is the model's choice: the model doing the work makes it, and when a done-criterion or next step depends on it, records the choice, its reason and the evidence it weighed in an artifact the work already writes; no count, share, similarity score, keyword or output-text match, or per-item operator stop stands in for it. Whoever proposes a script check on model output names its one-right-answer source; without one the call is the model's, and under autopilot the door's own pick never supplies that source. A number standing in for a model's choice with no named source decides nothing; a script may compute it and hand it to the model as evidence. A model-choice done-criterion says who decides, on what evidence and where the choice and reason are recorded; its record, when it is a product artifact, takes function checks only (it exists, keys and states are valid, references resolve, the reason is not blank, never the reason's length, words or format), a record in a seat's own lifecycle file is read by the reviewing seat with no case, and the choice itself takes no test, case or deliberate break holding an expected value: the reviewing seat reads it on a run the leaf makes anyway or a recording it already has, a choice never buys a paid call by itself, and the leaf states what stays unproven. A capture driver or gate advances on product state, the record's presence or the recorded choice's key value, never on model wording.

Scoping edits:
- "A test exists only as the proof ..." bullet: the consequential negative or edge case written as a criterion is one with one right answer.
- "Each done-criterion is proven by the cheapest sufficient test ..." bullet: it covers mechanical behavior and a choice's record; the choice part is read, not tested, and never buys a paid call.
- Slow-run bullet ("A slow or live-run leaf fixes another leaf's bug in-branch only when ... no acceptance rule changes"): a removal under the implement-issue proxy exception is not an acceptance-rule change.
- "Delete a false or outdated expectation ..." bullet, its "keep every test that guards a real past regression": a proxy for a model's choice is a false expectation under it, even when added after a past regression.
- "A bug fix shows its test failing before ..." bullet: fail-first and deliberate break apply to mechanical behavior and a choice's record, never to the choice.
- "Writer and checker share one rule definition ..." bullet: scoped to mechanical rules; delete its last sentence; a rule needing a model's judgment has no script checker.

## 3. Read-first

- skills/chart-issues/assets/standing-design.md (whole file, 22 lines).
- Design: /home/ivan/Work/infra/akrogon/issues/open/model-choice-rule/model-choice-rule/design.md, sections "rule-core" and "Final shape" W1.
- /home/ivan/.claude/skills/implement-issue/ponytail.md.

## 4. Change list

- Owns only `skills/chart-issues/assets/standing-design.md`. Needs nothing landed first. No shared test resource.
- Interface for later units: other files will call this bullet "standing-design's model-choice line". Keep the keep list readable as a list a clause can restate: schema and valid keys, references, a blank required record, spend, security and process bounds, text that runs literally.

## 5. Do-not

- Do not edit any other file: other units own them. Exception: a revised brief from A.
- Do not rewrite neighbouring bullets beyond the named clauses: the leaf is reviewed sentence by sentence.
- Do not add or edit any test: tests are locked after planning.
- Do not add a Markdown link: the link checker refuses links leaving a skill folder.
- If a W1 element conflicts with a kept bullet, return a mismatch with the two quotes instead of choosing.
Reasons and exceptions restated: scope is one file (exception: revised brief); tests are locked (no exception for workers); a conflict is A's call.

## 6. Steps

1. Read the file and design W1.
2. Add the new bullet after the cheapest-sufficient-test bullet.
3. Make the six scoping edits.
4. Reread the whole file once: each scoped bullet still reads correctly for mechanical behavior.
5. Run the command in section 7. Commit.

Advisory size: 1 file, under 8 turns.

## 7. Commands

First, in your worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
Then: `akrogon run-check --name u1-links -- bun test tests/docs-links.test.ts tests/chart-shapes.test.ts`.

## 8. Done-when and report

Commit with message `skills: standing-design states the model-choice line and scopes test rules to mechanical behavior`, no Co-Authored-By trailer. Return the commit ID, the `check u1-links: <exit> <path>` line, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
