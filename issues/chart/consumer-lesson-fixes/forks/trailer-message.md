# trailer-message

## Question

See the round below and slots/trailer-message-merged.md.

### Carries

- Signposts: forks/signposts.md ## Taken (1a 2a 3a 4a 5a 6a).
- Opening maps: slots/map-A.md, map-B.md, map-C.md, map-D.md.

## Findings

Merged notes: slots/trailer-message-merged.md. Rebuttals: slots/trailer-message-rebuttal-B.md, -C.md, -D.md.

Charting observations (free, scratch repo, git 2.56.1, 2026-11-17): `git log --format=%(trailers:key=Test-Change,valueonly,unfold)` on a commit whose reason wraps flush-left printed nothing; the same reason with space-indented continuation printed one unfolded value; framework 106ac8ce printed nothing and its message wraps flush-left. B (final check) showed a paragraph with a git-generated trailer still parses despite a prose line, so "one other line hides every citation" is not git's whole rule. Limits: git 2.56.1 only. Final check: slots/final-shape.md, slots/final-check-B.md, -C.md, -D.md.

## Taken

A's pick under full autopilot, 2026-11-17, not operator words: 1a, Q2 one builder.

- Both refusals in src/phase.ts (`requireTestChangeCitations`, `requireFrozenCitations`) print one shared text that names each missing path and gives the writer form: one line per `Test-Change: <path> <source and reason>` citation, in the final trailer block (the commit message's last paragraph) holding only trailer lines; a later empty commit may carry it. It keeps the words "final trailer block" that two existing tests assert (C, D), does not advertise indented folding (C, D), and does not claim a wrap happened (B). git stays the only reader.
- Writer sites unchanged (B, D): the five skill lines already say "final trailer block" and do not misstate git's rule; copying a rule into five files with no agreement test is what standing-design's writer/checker line warns against.
- Proof: one case on the existing citation fixture in tests/phase.test.ts: an edited test cited only by a flush-left wrapped trailer is refused and stderr names the path and the phrase "one line" (red before the fix on that phrase only, D); the same reason on one line on a later empty commit lets the move pass. The review seat reads the full text.
- Rejected: 1b raw-body diagnosis (A, D's first pick): a second reader beside git's and range plumbing in the frozen guard (B, C, D). 1c own parser: signposts hard limit. C's writer-side edits.
- Standing dissent: B would not test the phrase, only path, refusal and repair; C would add writer lines.
- Done record: the refusal now states the writer form; whether the framework lesson `history/2026-10-24-test-change-trailer-single-line.md` retires is the framework pass's call; its added-path half is untouched (Off route).
- Correction after leaf review, 2026-11-17 (A's pick, C): four of the five writer lines say "final trailer block" and plan-issue points at "the trailer rule"; none misstates git's rule, so the writer-sites decision stands.
