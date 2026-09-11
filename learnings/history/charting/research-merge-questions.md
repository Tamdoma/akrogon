# A question invented during the merge is researched before it is asked

## What was not good
Q2 on recovery was created while merging, from a pitfall slot B raised. It went out the same turn with the only option slot A could think of, a timer. The operator answered with a question instead, research then found herdr event hooks, and the question had to be asked again with different options.

## What the updated way does
The batch waits for two things before it goes out: slot B's return and research on every question in it, including questions that appeared during the merge. If a merge question needs a subagent or a web read, the batch waits for it. Now a rule in `question-authoring.md`.

## Why
The operator should answer every question once. A re-asked question costs an operator turn and signals that the first options were guesses.

## How it gets improved
If a question is re-asked again, find which research step was skipped and name it in this file.
