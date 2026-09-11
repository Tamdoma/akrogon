# Operator questions and peer exchange

Read before presenting an operator batch. A short opening paragraph explains what the batch settles and why now. Each question decides one thing, with inspected evidence, plain context and a concrete example where needed. The territory map covers the forks that change the outcome, questions a practitioner would ask and likely pitfalls, proportional to the work.

```markdown
<one plain paragraph: what this batch settles and why now>

### Q1 · <the question itself, as a person would ask it aloud, ending in a question mark>

<one to three plain sentences: what this thing is, with a concrete example, and what changes depending on the answer; name the inspected path or evidence>

- **A (recommended)** <what happens if you pick this, and the one reason it wins>
- **B** <what happens if you pick this, and its cost>

Pitfalls: <the traps behind this choice, one or two sentences>

### Q2 · ...

Reply `1-A 2-B`, or a numbered free-text answer.

Challenge check
<what an experienced practitioner could challenge in these recommendations, including B's remaining disagreements, or why none was found>
```

Every batch uses this exact shape, on every harness and at every effort level: the opening paragraph, the sentences under each question, the labelled recommendation with its reason, the pitfalls line, the reply key and the challenge check are never cut, even for a small item. Number questions continuously within a batch and restart at 1 in the next round.

Present all currently material questions in one complete batch and wait for the operator's answer. Plain free text is a valid answer and is preserved verbatim. A question asking for explanation does not itself settle the choice; an explicit choice accompanied by a question does. An omitted material answer stays open. Recommendations and silence cannot supply an operator decision. A challenge exposing another material fork belongs in the next round.

## Blind B exchange

The named B pane is supplied by the operator, not elected from config. Use the supported herdr interface to wait for that pane to be idle before prompting it, then `herdr agent wait` without a timeout after prompting and read the specified return file. Pane text, file existence and chart fields cannot establish readiness or stand in for a peer answer.

Before chart folders exist, create a temporary directory and assign exact, distinct paths such as `/tmp/<session>/map-A.md` and `/tmp/<session>/map-B.md`. After creation, use exact paths under `<chart>/slots/`, such as `decision-name-A.md`, `decision-name-B.md`, `decision-name-merged.md`, `decision-name-rebuttal-B.md` and `decision-name-final-check-B.md`. Every peer prompt gives the exact output path. Keep useful map findings in the chart and remove temporary files after transfer.

For the opening map, both slots receive the same intake, live surface paths and existing locks, excluding each other's map until both finish. For a decision, send B the intake, current Question and carries, related decision paths, locks and verbatim operator corrections, excluding A's draft and current Findings. A develops its view while B works independently. The returned B file is a full batch, not a reaction to A.

After both finish, A writes the merged file with `(A)`, `(B)` and `(both)` attribution. B reads that file and returns one disagreement-only rebuttal. A includes it under the challenge check in the complete operator batch. When a later operator reply adds a mechanism or changes a contract, send B the proposed final shape and correction for one focused check before A records it. A restatement needs no extra pass. B answers an operator's direct requests in its own pane while A keeps the interview and record.

## Optional measurement

Offer a prototype only for a named uncertainty, with the smallest experiment, estimated minutes and a choice to proceed or decide without it. Run an explicitly chosen experiment in a time-boxed scratch sandbox, retain the measured finding in the decision and discard scratch code. A declined or timed-out measurement supplies no evidence and no new lifecycle state.
