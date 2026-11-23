# Final B: seat-rounds

Checked 'Taken' at main 814a2387. Picks 1, 3, 4 and 5 are ok. Pick 2 has two things to fix, one in the docs and one in my own text.

## Breaks

- B1. Pick 2 leaves a doc line false. `docs/start/why-it-works.md:19` says B hands back to A "such as a change to a test's expected result". After pick 2 B repairs that itself. Change the example in the same commit, for instance to a locked decision.
  - `docs/examples/autopilot-story.md:48` gives the same rule as the reason inside a story of a past run ("That was a test expectation change, so it went to A"). It teaches the old split. Reword it or leave it as history, A's call.
- B2. Pick 2 asks for evidence a missing case cannot have. The text says each correction keeps "the old and new value, the old one red on the head". An added case, capture or recording has no old value and nothing red before it. Read to the letter, B cannot meet it and hands the item to A, which loses the larger half of the saving (56% against 22% of hand-off lists).
  - Fix: one clause. For an added case, capture or recording the evidence is the deliberate break alone: the new case red with the break and green without it.

Checked and fine:

- No test pins the old split or the count of shared rules. `tests/docs-links.test.ts:257, :270-280` check only the known-red command, two red names and that five skills link the file.
- `skills/lifecycle-rules.md` is linked by five skills, chart-issues and merge-issue included. The new rule says "the seat", so the door's direct route gets it too.
- The new rule does not collide with the stops at `skills/implement-issue/SKILL.md:36, :52`. It says the replacement is not a change to a locked decision, and its note goes where `:52` already puts implementation notes.
- `skills/check-issue/SKILL.md:107` needs no edit. It sends leaf-caused merge reds to "the repair split above", which pick 2 changes.
