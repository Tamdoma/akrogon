# Design: trailer-rule-refusal

## Binding decisions, verbatim

### Signposts (issues/chart/consumer-lesson-fixes/forks/signposts.md, Taken, verbatim) (A,B)

Chart: issues/chart/consumer-lesson-fixes (registered akrogon root). Consultants: B pi openai/gpt-6.2-astra high, C pi meta/muse-wonder-full-1.0 high, D claude claude-fable-5-2 medium. Options are listed in that file's ## Question.

A's picks under full autopilot (signposts: A), 2026-11-17, not operator words. The operator's words that handed the round to A, verbatim: "Full autopilot mode, even the signposts."

- 1a. Decided by the operator's "consolidate them" and by speed: one map, one consultant set, three issues that close independently. Rejected 1b (three handovers and restarts for no dependency), 1c (D M1 shows the other two do not depend on #143's wording once today's Retire is the bar; C's shared-file point orders nothing under the split rule).
- 2a. Decided by removing over adding and systems thinking. Rejected 2b (the lesson rule keeps prose-fixed lessons active forever, which is the #143 loop), 2c (two mechanisms for one failure).
- 3a. Decided by simplicity and price: a per-harness hook needs a paid launch per harness to prove (D M3).
- 4a. Decided by function over form: a fix that passes its own tests while the cited lessons stay stuck did not deliver the report's outcome (C M3). Reading is free. Rejected 4b (other repo's records), 4c.
- 5a. Carried from model-judgment's hard limits; removing over adding.
- 6a. Decided by price and the evidence: #142 already changed shape on inspection (C M1). Rejected 6b: no report needs a model run.

Ranked priorities: (1) each fix stops its failure where it happens, in every harness; (2) each change stays small and in existing files; (3) each completion says honestly which framework lessons can now leave.

Hard limits: akrogon repo only; no paid launches; no new script, registry, record kind or scanner for #143; never a second parser beside git's.

Account: the session fixes the three failures at their source in akrogon, checks each report reproduces before fixing it, and reports what the framework can now retire. It gives up framework-side edits and any harness-specific guard.

Chart order: consumer-lesson-fixes only (one chart). A dropped nothing.

### trailer-message (issues/chart/consumer-lesson-fixes/forks/trailer-message.md, Taken)

A's pick under full autopilot, 2026-11-17, not operator words: 1a, Q2 one builder.

- Both refusals in src/phase.ts (`requireTestChangeCitations`, `requireFrozenCitations`) print one shared text that names each missing path and gives the writer form: one line per `Test-Change: <path> <source and reason>` citation, in the final trailer block (the commit message's last paragraph) holding only trailer lines; a later empty commit may carry it. It keeps the words "final trailer block" that two existing tests assert (C, D), does not advertise indented folding (C, D), and does not claim a wrap happened (B). git stays the only reader.
- Writer sites unchanged (B, D): four of the five skill lines already say "final trailer block" and plan-issue points at the trailer rule; none misstates git's rule (C); copying a rule into five files with no agreement test is what standing-design's writer/checker line warns against.
- Proof: one case on the existing citation fixture in tests/phase.test.ts: an edited test cited only by a flush-left wrapped trailer is refused and stderr names the path and the phrase "one line" (red before the fix on that phrase only, D); the same reason on one line on a later empty commit lets the move pass. The review seat reads the full text.
- Rejected: 1b raw-body diagnosis (A, D's first pick): a second reader beside git's and range plumbing in the frozen guard (B, C, D). 1c own parser: signposts hard limit. C's writer-side edits.
- Standing dissent: B would not test the phrase, only path, refusal and repair; C would add writer lines.
- Done record: the refusal now states the writer form; whether the framework lesson `history/2026-10-24-test-change-trailer-single-line.md` retires is the framework pass's call; its added-path half is untouched (Off route).

Excluded here: #141 and #143 decisions (their own leaves); `requireFrozenCitations` requiring citations for added test paths (Off route); writer skill lines (unchanged by the decision above).

/home/ivan/.akrogon/releases/39e203a79c5c4ebeef51d1e76a3d8ea43389debc/skills/chart-issues/assets/standing-design.md


Interpretation (B,D): git decides what is a citation. This is a bug fix in a message, so it gets one red-first case at the real boundary (the `akrogon phase` CLI on the existing citation fixture in `tests/phase.test.ts`), red before the fix on the phrase "one line" only, since the wrapped trailer is already refused today; the case asserts only the refusal, the path and that phrase, never the whole sentence, and also shows the one-line repair on a later empty commit passing. The two existing assertions `toContain('final trailer block')` stay unchanged. The reviewing seat judges whether the full text explains the writer form.

## Leaf architecture

- Owned surfaces: `src/phase.ts` `requireTestChangeCitations` and `requireFrozenCitations` refusal text, one shared builder for it; `tests/phase.test.ts` one new case.
- Consumers of the refusal: seats reading `akrogon phase` stderr (implement-issue, check-issue, merge-issue); the two existing assertions `toContain('final trailer block')` in tests/phase.test.ts.
- Unchanged: `citedPaths`, `emptyCommitTrailerValues`, `trailerValues` and git's `%(trailers:key=Test-Change,valueonly,unfold)` reading.
- Open for the plan: the shared builder's name and whether it takes the missing-path list only.
