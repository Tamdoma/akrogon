# An unclear question is a skill defect

## What was not good
Two of seven destination questions came back with "I don't understand". Q5 bundled two decisions, which harness pair runs first and who has to install the tool, and assumed the reader knew what a herdr integration is. Q6 used "handoff" and "stack a prompt" without saying what they mean in practice.

## What the updated way does
`assets/question-authoring.md` now says: one question decides one thing, and when a question rests on a mechanism the operator may not picture, the first sentence explains it with a concrete example before the options. Every "I don't understand" from the operator is logged here as a learning and produces one rule change, not a rephrase of that single question.

## Why
The operator is the only source of the answer. A question they cannot picture gets a guess or a skip, and both cost a round. Fixing the rule fixes every later question, fixing the wording fixes one.

## How it gets improved
Count "I don't understand" replies per round. The count should fall to zero within a few rounds. If a rule change does not lower it, the rule was wrong, replace it instead of adding another.
