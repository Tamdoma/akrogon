# Final B: paid-budget

ok, with one line to add. Checked at main 814a2387.

- [1,5] names only `skills/watch-issues/consultant-brief.md:27` for dropping "spend past a recorded grant". The same stop is listed for the operator at `docs/use/watch-while-away.md:30`. Left as is, the doc says the watch stops on spend past a grant and the consultant no longer does. Drop the phrase there too.

Checked and fine:

- Dropping `budget.jsonl` from `src/state-home.ts:17`: the list is only copied from (`src/state-home.ts:71`). Nothing refuses or deletes on an entry that is not listed.
- `bounds: none` parses. `bounds` is plain required text (`src/readiness.ts:46`).
- No test asserts the stop-list wording (no hit for "recorded grant" in `tests/`).
