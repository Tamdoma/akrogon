# Operator questions and peer exchange

Read before presenting an operator round. A short opening paragraph explains what the round settles and why now. Each question settles one thing, with inspected evidence, plain context and a concrete example where needed. The territory map covers the forks that change the outcome, questions a practitioner would ask and likely pitfalls, proportional to the work.

```markdown
<one plain paragraph: what this round settles and why now>

### 1 · <the question itself, as a person would ask it aloud, ending in a question mark>

<one to three plain sentences: what this thing is, with a concrete example, and what changes depending on the answer; name the inspected path or evidence>

Research: <tier · source with URL or path and the date read · one-sentence finding · what it changed in this question>

- **1a (recommended)** <what happens if you pick this, and the one reason it wins>
- **1b** <what happens if you pick this, and its cost>

Pitfalls: <the traps behind this choice, one or two sentences>

### 2 · ...

Reply `1a 2b`, or a numbered free-text answer.

Challenge check
<what an experienced practitioner could challenge in these recommendations, including each named peer's remaining disagreements, or why none was found>
```

Every round uses this shape, on every harness and at every effort level: the opening paragraph, the sentences under each question, the research line, the labelled recommendation with its reason, the pitfalls line, the reply key and the challenge check. A small round keeps the parts that carry the decision, the reply key and the challenge check. Number questions continuously within a round and restart at 1 in the next round. Label questions `1`, `2` and options `1a`, `1b`, `2a`, and use no other code scheme in a round.

Present the current fork's material questions in one complete round and wait for the operator's answer; the next fork is researched and presented after that answer. Plain free text is a valid answer and is preserved verbatim. A question asking for explanation does not itself settle the choice; an explicit choice accompanied by a question does. An omitted material answer stays open. Recommendations and silence cannot supply an operator answer. A challenge exposing another material fork belongs in the next round.

## Research

Every question carries a Research line, and its fork file keeps the full return under Findings: tier, source, finding and what it changed. Tiers, highest first:

1. `operator`: material the operator placed in `issues/chart/sources/` or named in the intake, read before any search.
2. `practitioner`: a named person or team with a stated track record, in a case study, talk, long-form post or first-hand write-up. Listicles, affiliate pages and AI summaries do not qualify.
3. `better-than-training`: primary documentation, a specification, source code, a changelog or a measured result stronger or newer than the model's training. Inspected code in this repository and the documentation of the tools it calls sit here.
4. `model-knowledge`: the model's own knowledge, allowed only with the searches that were run and found nothing stronger.

Use the highest tier reasonably available; a round written from a lower tier when a higher one was available is redone before the operator sees it. For anything outside the repository, practitioners first: name who has done this at scale, why each is worth hearing, where they agree and disagree, and which conditions flip their advice, then synthesize in one paragraph rather than listing sources. Research never settles anything, and it is redone when an operator answer reshapes the question. When peers are named, A and each named peer research independently and A merges with attribution.

## Blind peer exchange

Named peer panes are supplied by the operator at chart open, not elected from config; C is named only with B. When the operator asks for B, optionally C, without naming panes and the door's own environment has `HERDR_ENV=1`, the door creates the panes at open, asking once for each created peer's harness kind and arguments: `herdr pane split <A pane> --direction right --ratio 0.65 --cwd <root> --no-focus` for B, then only when C is asked for `herdr pane split <B pane> --direction down --ratio 0.5 --cwd <root> --no-focus`, reading each new pane ID from `.result.pane.pane_id`, then `herdr agent start <name> --kind <kind> --pane <id> -- <args>` per peer, addressing each peer by pane ID. Supplied panes are used as given and never moved or resized, the door moves no pane it did not create, and the requested sizes (A 65% wide, B and C sharing the right 35%) hold only when A's pane fills its tab; otherwise only A's area is split. Outside herdr the door says so and continues single slot or with supplied panes. For each named peer, wait until its pane is idle, then prompt it with `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`. Any non-zero exit (`agent_prompt_stalled`, `agent_blocked`, `timeout`) means the peer is not confirmed started: report herdr's error to the operator and never re-prompt it automatically. Every wait before the prompt, for the peer's pane to go idle, is `herdr agent wait <pane> --timeout <T>` with T below the command timeout the harness gives that call, run again whenever it fails with code `timeout`. While a prompted peer's turn is open A stays in its own turn without ending the pass to wait, and A starts no background wait for a peer. Every wait after the prompt is `bun skills/chart-issues/scripts/peer-wait.ts <pane> <return-file> <budget-seconds>` run in the foreground with a fresh return path per exchange and a budget below the command timeout the harness gives that call, rerun at once when it prints outcome `budget`; on outcome `done` the prompted turn is finished with the return file non-empty even while herdr still reports the peer working and A reads the file, while `failure` means the peer went idle or done with a missing or empty file and `blocked` means the peer went to the operator. A ends its turn only for an operator round, outcome `failure`, outcome `blocked` or a non-zero script exit, each reported to the operator. Pane text and chart fields cannot establish readiness or stand in for a peer answer, and file existence cannot establish readiness before a prompt.

Before chart folders exist, create a temporary directory and assign exact, distinct paths such as `/tmp/<session>/map-A.md`, `/tmp/<session>/map-B.md` and `/tmp/<session>/map-C.md`. After creation, use exact paths under `<chart>/slots/`, such as `fork-name-A.md`, `fork-name-B.md`, `fork-name-C.md`, `fork-name-merged.md`, `fork-name-rebuttal-B.md`, `fork-name-rebuttal-C.md`, `fork-name-final-check-B.md` and `fork-name-final-check-C.md`. Every peer prompt gives the exact output path. Keep useful map findings in the chart and remove temporary files after transfer.

For the opening map, A and each named peer receive the same intake, live surface paths and existing locks, excluding each other's maps until all finish. For a fork, send each named peer the intake, current Question and carries, related fork paths, locks and verbatim operator corrections, excluding A's draft, current Findings and the other peer's work. A develops its view while each peer works independently. Each returned peer file is a full round, not a reaction to A.

After all finish, A writes the merged file with agreeing-slot attribution such as `(A)`, `(B,C)` and `(A,B,C)`. Each named peer reads only that merged file and returns one disagreement-only rebuttal. A includes the peer rebuttals under the challenge check in the complete operator round. When a later operator reply adds a mechanism or changes a contract, send each named peer the proposed final shape and correction for one focused check before A records it. A restatement needs no extra pass. Each peer answers an operator's direct requests in its own pane while A keeps the interview and record.

## Optional measurement

Offer a prototype only for a named uncertainty, with the smallest experiment, estimated minutes and a choice to proceed or settle it without measurement. Run an explicitly chosen experiment in a time-boxed scratch sandbox, retain the measured finding in the fork and discard scratch code. A declined or timed-out measurement supplies no evidence and no new lifecycle state. This section covers exploration only and never replaces required operation proof. Declining a required probe holds the handoff under the Take operation-proof rule.
