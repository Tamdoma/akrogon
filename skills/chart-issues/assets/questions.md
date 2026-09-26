# Operator questions and peer exchange

Read before presenting an operator round. A short opening paragraph explains what the round settles and why now. Each question settles one thing, with inspected evidence, plain context and a concrete example where needed. The territory map covers the forks that change the outcome, questions a practitioner would ask and likely pitfalls, proportional to the work.

```markdown
<one plain paragraph: what this round settles and why now>

### Q1 · <the question itself, as a person would ask it aloud, ending in a question mark>

<one to three plain sentences: what this thing is, with a concrete example, and what changes depending on the answer; name the inspected path or evidence>

Research: <tier · source with URL or path and the date read · one-sentence finding · what it changed in this question>

- **A (recommended)** <what happens if you pick this, and the one reason it wins>
- **B** <what happens if you pick this, and its cost>

Pitfalls: <the traps behind this choice, one or two sentences>

### Q2 · ...

Reply `1-A 2-B`, or a numbered free-text answer.

Challenge check
<what an experienced practitioner could challenge in these recommendations, including each named peer's remaining disagreements, or why none was found>
```

Every round uses this shape, on every harness and at every effort level: the opening paragraph, the sentences under each question, the research line, the labelled recommendation with its reason, the pitfalls line, the reply key and the challenge check. A small round keeps the parts that carry the decision, the reply key and the challenge check. Number questions continuously within a round and restart at 1 in the next round.

Present the current fork's material questions in one complete round and wait for the operator's answer; the next fork is researched and presented after that answer. Plain free text is a valid answer and is preserved verbatim. A question asking for explanation does not itself settle the choice; an explicit choice accompanied by a question does. An omitted material answer stays open. Recommendations and silence cannot supply an operator answer. A challenge exposing another material fork belongs in the next round.

## Research

Every question carries a Research line, and its fork file keeps the full return under Findings: tier, source, finding and what it changed. Tiers, highest first:

1. `operator`: material the operator placed in `issues/chart/sources/` or named in the intake, read before any search.
2. `practitioner`: a named person or team with a stated track record, in a case study, talk, long-form post or first-hand write-up. Listicles, affiliate pages and AI summaries do not qualify.
3. `better-than-training`: primary documentation, a specification, source code, a changelog or a measured result stronger or newer than the model's training. Inspected code in this repository and the documentation of the tools it calls sit here.
4. `model-knowledge`: the model's own knowledge, allowed only with the searches that were run and found nothing stronger.

Use the highest tier reasonably available; a round written from a lower tier when a higher one was available is redone before the operator sees it. For anything outside the repository, practitioners first: name who has done this at scale, why each is worth hearing, where they agree and disagree, and which conditions flip their advice, then synthesize in one paragraph rather than listing sources. Research never settles anything, and it is redone when an operator answer reshapes the question. When peers are named, A and each named peer research independently and A merges with attribution.

## Blind peer exchange

Named peer panes are supplied by the operator at chart open, not elected from config; C is named only with B. For each named peer, use the supported herdr interface to wait for that pane to be idle before prompting it, then `herdr agent wait` without a timeout after prompting and read the specified return file. Pane text, file existence and chart fields cannot establish readiness or stand in for a peer answer.

Before chart folders exist, create a temporary directory and assign exact, distinct paths such as `/tmp/<session>/map-A.md`, `/tmp/<session>/map-B.md` and `/tmp/<session>/map-C.md`. After creation, use exact paths under `<chart>/slots/`, such as `fork-name-A.md`, `fork-name-B.md`, `fork-name-C.md`, `fork-name-merged.md`, `fork-name-rebuttal-B.md`, `fork-name-rebuttal-C.md`, `fork-name-final-check-B.md` and `fork-name-final-check-C.md`. Every peer prompt gives the exact output path. Keep useful map findings in the chart and remove temporary files after transfer.

For the opening map, A and each named peer receive the same intake, live surface paths and existing locks, excluding each other's maps until all finish. For a fork, send each named peer the intake, current Question and carries, related fork paths, locks and verbatim operator corrections, excluding A's draft, current Findings and the other peer's work. A develops its view while each peer works independently. Each returned peer file is a full round, not a reaction to A.

After all finish, A writes the merged file with agreeing-slot attribution such as `(A)`, `(B,C)` and `(A,B,C)`. Each named peer reads only that merged file and returns one disagreement-only rebuttal. A includes the peer rebuttals under the challenge check in the complete operator round. When a later operator reply adds a mechanism or changes a contract, send each named peer the proposed final shape and correction for one focused check before A records it. A restatement needs no extra pass. Each peer answers an operator's direct requests in its own pane while A keeps the interview and record.

## Optional measurement

Offer a prototype only for a named uncertainty, with the smallest experiment, estimated minutes and a choice to proceed or settle it without measurement. Run an explicitly chosen experiment in a time-boxed scratch sandbox, retain the measured finding in the fork and discard scratch code. A declined or timed-out measurement supplies no evidence and no new lifecycle state.
