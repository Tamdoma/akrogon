# Brief: trailer-rule-refusal

## What

`requireTestChangeCitations` and `requireFrozenCitations` in `src/phase.ts` print one shared refusal text that names each missing path and gives the writer form: one line per `Test-Change: <path> <source and reason>` citation, in the final trailer block (the commit message's last paragraph) holding only trailer lines; a later empty commit may carry it. The text keeps the words "final trailer block", does not advertise indented folding and does not claim a wrap happened. git stays the only reader of what counts as a citation: nothing reads raw commit bodies and no citation is accepted that git does not parse.

Owned files: `src/phase.ts`, `tests/phase.test.ts`.

## Why

When a `Test-Change:` reason wraps onto lines that do not start with whitespace, git reads no trailer block, the guard reports "need a citation" and says to add the line to the final trailer block, which the writer believes they did (Tamdoma/akrogon#142; framework commit 106ac8ce; framework history `learnings/history/2026-10-24-test-change-trailer-single-line.md`). The guard agrees with git; the message hides the repair.

## Done-criteria

1. A phase move on a branch whose edited test file is cited only by a flush-left wrapped `Test-Change:` trailer is refused, and the refusal names that path and states the one-line writer form; the same path and reason on one line on a later empty commit lets the move pass. Proven by the leaf's own test. (B,D)
2. The frozen-citation refusal prints the same shared text, read by the reviewing seat in `src/phase.ts`, and no existing test is edited (the `test` check passes). (B,D)
3. The report states that the refusal now gives the writer form, that whether the framework lesson `history/2026-10-24-test-change-trailer-single-line.md` retires is the framework's call, and that its added-path half is untouched.
