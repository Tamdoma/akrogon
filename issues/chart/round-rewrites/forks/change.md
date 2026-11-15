# The change

## Question

### 1 · How does the door get second-version quality on the first print?

The operator answers the `elid` rewrite of a round, not the round. What makes the first printed round read like that rewrite, with every element kept?

### 2 · Which operator-facing outputs does it cover?

Fork rounds, the signposts round, the split proposal and the handoff review all got `elid` in this session.

### 3 · How is the result shown?

What observable result says the change worked, given that "answered as first written" is the operator's behaviour.

### Carries

- forks/cause.md, Taken (operator, 2026-11-11, verbatim): `1 - look at the elid command in your system prompt. If we can make the Output similar to what I get the second time, then you can edit the skill so we get it. But we should not omit any elements, so everything needs to be in there: the question, the research, the recommendations, etc. All of the elements, including the diagrams, when needed. |`
- Binding from that answer: no element omitted from the printed round; each round type keeps its existing required elements; drawings when the drawing rule calls for them; the edit is permitted if the output can be reached; a rewrite as a permanent second step is not the end state.
- Before any rule edit, the next new round is written to match the `elid` output and the operator's response is recorded.
- Signposts (forks/signposts.md, Taken): 1a fewer parts first, then the operator's time, then clock time, then tokens; 2c no chart-door step removed; 3a a number from the factory's own records, and an outside practitioner source for a design claim; 5b one bounded paid run allowed, cap not stated, so no paid call; 6a akrogon only; 7a earlier decisions stay binding.
- Word caps declined 2026-10-26 (issues/chart/door-cost/CHART.md, O6).
- The alias text lives in the operator's private standing instructions (/home/ivan/.claude/CLAUDE.md and /home/ivan/.codex/AGENTS.md, section Aliases), not in akrogon.
- A leaf branch carries code and skill text only: no leaf may touch a path under `issues/`.

## Findings

Full returns: slots/change-A.md, slots/change-B.md, slots/change-merged.md, slots/change-rebuttal-B.md.

- better-than-training · A's reader over 28 claude door transcripts, 2026-11-11 (method in slots/map-A.md) · 52 of 64 rewritten rounds were answered after the first rewrite, 18 of 82 first prints were answered directly; rounds written "at the `elid` level" in one pass got `elid` on 3 of 3 rounds in this session · made a rewrite of the finished draft the recommendation over more rule wording. Limit (B): those rewrites followed a first reading, so a rewrite before printing is unmeasured.
- better-than-training · Anthropic, "Prompting best practices", section "Chain complex prompts", https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices, read 2026-11-11 · "The most common chaining pattern is self-correction: generate a draft → have Claude review it against criteria → have Claude refine based on the review." · supports draft-then-rewrite as the mechanism.
- practitioner · Anna Kaley, NN/g, "Match Between the System and the Real World" (2018), https://www.nngroup.com/articles/match-system-real-world/; Chip and Dan Heath, HBR, "The Curse of Knowledge" (2006-12), https://hbr.org/2006/12/the-curse-of-knowledge; read 2026-11-11 · write in the reader's concepts; the expert's summary words lack the listener's context · the rewrite's one job is the reader's side.
- better-than-training · issues/chart/shared-rules/USAGE.md, read 2026-11-11 · every chart prints "operator turns N" · context for operator effort only; it is not a first-read rate (B's rebuttal).
- (A,B) Question 1: the existing pre-send read becomes a rewrite of the finished draft, every element kept, stated in the skill's own words, replacing the read-once sentence; a separate rewriting seat or call and more "write simply" wording are rejected. (B) keeps "no edit" available; (A) rejects it as the end state.
- (A,B) Question 2: fork rounds, signposts round, split proposal and handoff review, each with its own required elements; after B's rebuttal the instruction covers every round, autopilot rounds included.
- (A,B) Question 3: no new counter, no paid run. Open between slots: whether the leaf waits on a later first-read answer by the operator.
- Charting observation for the kept criterion "the usual checks pass" (its pre-existing part is the existing checker's verdict on the base). Command: `bun test tests/docs-links.test.ts` at the registered root, the one test file that reads skill files. Inputs: main at 452a2f14, questions.md identical to the installed copy. Identity: local checkout, no credential. Version: bun 1.4.4. Date: 2026-11-11. Result: 11 pass, 0 fail. Cleanup: none needed, read-only. Limits: it shows the link test is green on the base; it does not run `format`, `typecheck` or the full `test` check, and it does not judge the new wording. Also read: `grep` over tests, src, docs and skills finds the register sentence only in questions.md itself, so no test or doc pins its words.
- Observation, 2026-11-11: A wrote this fork's round as a full draft off screen (scratchpad `rr/change-round-draft.md`, discarded with the session) and printed only its rewrite. Draft-to-print changes: the opening states the operator's own request and that the round is the test; the quoted rule sentence and file names left the context; slot tags moved from the options to the challenge check; each option says what happens for the operator after picking it ("the next session reads the old instructions and you are back to `elid`"); process names became what the message is for ("the final ok-to-hand-off review"); every element and every option, recommendation and number stayed. The operator's reply is recorded under Taken.

## Taken

Operator, 2026-11-11, door t126, verbatim, in reply to the first print of this round (no `elid` was sent): `1b - I don't want to spend more tokens on this. I don't have a problem repeating the command myself (elid). | 2a | 3a`

Account (A's reading):

- Question 1: 1b. The register rule gets stronger wording and the round is still written in one pass. Reason, the operator's: no more tokens for this, and repeating `elid` is acceptable. Picked against the recommendation of both slots (1a). Foreclosed: a hidden draft and rewrite before printing (1a); leaving the file unchanged (1c); a separate rewriting seat or call.
- Question 2: 2a. The wording covers fork rounds, the signposts round, the split proposal and the handoff review, each keeping its own required elements.
- Question 3: 3a. The work is finished when the wording is in the file, every part of a round is still required and the usual checks pass. A later need for `elid` is a new problem, not an open criterion.
- Binding from forks/cause.md stays: no round element is omitted; no word number (door-cost O6).
- Observation result: the round written as a hidden draft plus rewrite was answered as first printed, three questions, no clarify message. Bounded result (B): one round, and the operator had seen the topic in the cause round. The operator then declined that mechanism for its token cost, so the result is recorded and not built on.
- Expectation recorded for later readers: one-pass rounds written toward the `elid` level got `elid` on 3 of 3 rounds in this session, so the wording may reduce rewrites and is not expected to end them. The operator accepted that.
