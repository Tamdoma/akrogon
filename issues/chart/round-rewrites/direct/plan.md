# Direct plan: round-rewrites

Task: forks/change.md, Taken (1b, 2a, 3a) and forks/cause.md, Taken. Read in place, not rewritten.

## Unit 1 (serial, A itself)

- File: `skills/chart-issues/assets/questions.md`, the paragraph starting "Every round uses this shape".
- Edit: add one sentence after the register sentence ("The register of a round is everyday words…") and before "Before sending a round, A reads it once…".
- The sentence says: the first print of every operator-facing output is written, in the same single pass, as the simpler second version an operator would otherwise ask for. It names the four outputs (fork round, signposts round, split proposal, handoff review), each keeping its own required parts.
- Unchanged: the register sentence, the pre-send read sentence (it still covers every round, autopilot rounds included), every required round part, the drawing rule.
- Not added: a hidden draft or rewrite pass, a new step, a word number, a reference to the operator's private alias.

## Done-criteria and proof

1. The rule says the first print is the simpler second version, in one pass, every part kept. Proof: the diff.
2. The rule names the four outputs. Proof: the diff.
3. Existing checks pass. Proof: `bun test tests/docs-links.test.ts` in the worktree, then `akrogon verify --holder <chart>/direct` at landing.

## Docs

`grep` for the register wording finds live text only in questions.md. The other matches are closed issue records under `issues/`, which a branch never touches. No doc to update.

## Tests

None written. No done-criterion needs a new test (3a: the usual checks pass).
