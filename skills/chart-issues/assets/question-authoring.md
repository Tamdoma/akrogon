# Question Authoring

Use this file for every operator-facing question in a chart. It is self
contained so a copied chart skill does not depend on a repository document.

## Question Authoring Standard

- State the decision context in plain language, define jargon when it first
  appears, and explain why the answer matters.
- Give only the current-state inventory needed for this choice: existing
  surfaces, settled constraints, and the known gap. Do not replay the whole
  history.
- Make every option consequence-bearing. Say what behavior, scope, or tradeoff
  selecting it authorizes.
- Put the evidence-based recommendation first and label it recommended. State
  the uncertainty when the evidence is a tiebreak. Never silently choose the
  recommendation.

Teach each question in this form:

```markdown
### Q<N> · <the question itself, ending in a question mark>

<one to three plain sentences: what this thing is, with a concrete example,
and what changes depending on the answer>

- **A (recommended)** <what happens if you pick this, and the one reason it wins>
- **B** <what happens if you pick this, and its cost>

A beginner would miss: <the pitfall behind this choice, one sentence>

Reply `N-A`, or a numbered free-text answer.
```

The research is done before the batch is written, never as a step the
operator sees. Each Question and its options carry what practitioners with a
track record do here, what they disagree on, and the agent's own reasoning on
top of that, so the operator answers from evidence rather than supplying it.
The beginner line names the mistake the operator could make without noticing
and the option order guides away from it.

Write for someone who has never seen this system. The heading is a real
question a person would ask out loud, never a topic label. The background
first says what the thing is, with one concrete example, then what changes
with the answer. One question decides one thing. Short plain sentences, one
consequence per option, no jargon without a one-word gloss, background capped
at three sentences, because a wall of text hides the choice.

Use two to four lettered options. Gather all currently material questions into
one batch. Number continuously from 1 within a batch and restart at 1 in the
next round. Deliver one batch, end the turn, and wait for the operator's reply.
Numbered free text is that question's verbatim answer. An omitted material
question stays open and is presented again in a later batch. A recommendation
is not an answer.

## Authoring budgets

Keep one Question under 50 lines. Keep one debate recommendation under 50
lines. These are chart authoring limits, not lifecycle artifacts, so the
chart never invokes `budget-check` for them. Compress repetition before
compressing a decision, option consequence, operator reply key, or challenge
check.

## Territory map

Before any chart decision is grilled, including destination framing, present a
first-principles territory map to the operator. The map is the root from which
the decision tree grows and must be proportional to the named effort. It lists:

- the main forks that could change the route or outcome
- questions an experienced practitioner would ask before choosing a route
- mistakes a beginner could make without noticing

Use the repository and notes as evidence, but add the domain questions that
follow from first principles. Surface newly discovered decisions as chart
decisions. Do not begin destination grilling, architecture grilling, or any
other decision question until this map is shown.

## Expert-challenge close

Question authoring applies an expert-challenge lens to every question and every
round. After the answers and any research are recorded, visibly close the
round with this exact check:

```text
Challenge check
What would an experienced practitioner challenge in this round's answers?
<name the challenge, or say that no challenge was found and why>
Reply with the challenge check, or confirm no challenge.
```

This check is shown and answered even when a round has no new decision
questions. It is never silently omitted. If the answer exposes a new fork,
add it to the next frontier before the chart can terminate.

## Micro-prototype question

A prototype is an optional way to measure one uncertain decision. Propose it as
a normal Question, not as an automatic action:

```text
Question N
Would a short sandbox measurement reduce the uncertainty in # <Decision Name>?
Estimate: <number> minutes (10 minutes by default)
Option A (recommended): run the smallest time-boxed experiment in an isolated sandbox and keep its measured result.
Option B: settle the decision from the available evidence without an experiment.
Veto: reply with V to decline the prototype.
Reply with N-A, N-B, or V.
```

The estimate is minutes-scale by default and is stated before the operator
chooses. A chosen prototype has an isolated sandbox and a hard time box. Keep
only the measured finding in the decision file, discard all code and scratch
artifacts, and never merge or promote the prototype into production. A veto or
timeout records that no prototype finding was obtained and does not create an
implementation hold.
