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

Pitfalls anticipated: <the traps behind this choice, from the practitioner evidence and the agent's own reasoning, one or two sentences>

Reply `N-A`, or a numbered free-text answer.
```

Before sending any batch, including opening and destination questions, check
that each question's options and recommendation follow from inspected evidence
applied to the operator's actual use case and constraints. Reading sources or
listing features alone does not satisfy this check. In each question's existing
background, cite the source, date and tier, explain the relevant finding and
why it supports the choice here, and distinguish observed results from inference.
If evidence is insufficient, continue research before asking; if unavailable,
state the gap using the skill's source tiers and do not claim a proven benefit.
Ask the operator for preferences or inaccessible facts, not research you can do.
Questions introduced while merging obey the same check, and the batch waits
for that research and for the partner slot's return. Each Question and its options carry what practitioners with a
track record do here, what they disagree on, and the agent's own reasoning on
top of that, so the operator answers from evidence rather than supplying it.
The pitfalls line names the traps anyone could fall into on this choice,
beginner or practitioner, and the option order guides away from them.

A partner slot's batch is read from its pane and the read is complete only
when it spans both ends: the prompt that asked for the batch at the top and
the challenge check at the bottom. A read missing either end is repeated with
more lines before anything is merged. The line count is a guess, the two
ends are the proof.

With a second slot, every question and recommendation in the merged batch
carries who raised it, `(A)`, `(B)` or `(both)`, and the merge is followed by
one rebuttal round: slot A sends slot B the merged batch, slot B replies once
with only the points it disagrees with and why, and those appear under the
challenge check as `Slot B disagrees:`. One extra slot B pass, no file, no
state. The operator sees who proposed what and where the slots part.

A shortened or plain-language restatement of a batch keeps each question's
evidence line, who found what and at which tier, even when everything else
is cut. The operator decides from evidence, and a restatement without it is
a different question.

Write for someone who has never seen this system. The heading is a real
question a person would ask out loud, never a topic label. The background
first says what the thing is, with one concrete example, then what changes
with the answer. One question decides one thing. Short plain sentences, one
consequence per option, no jargon without a one-word gloss, background capped
at three sentences, because a wall of text hides the choice.

A batch opens with one plain paragraph before the first question: what this
decision is about, why it exists now, and what the whole batch settles. The
operator must be able to read the paragraph alone and know what the questions
are for. A batch that starts with a question has no ground.

Use two to four lettered options. Gather all currently material questions into
one batch. Number continuously from 1 within a batch and restart at 1 in the
next round. Deliver one batch, end the turn, and wait for the operator's reply.
Numbered free text is that question's verbatim answer. A reply key with a
letter is a decision, even when a question follows it: the operator agrees
and wants the explanation while the work continues. A number with a question
and no letter is not a decision; the question stays open until a letter
arrives. A decision resolves only when every material question has its
letter. The agent never supplies a missing letter from the explanation it
gave. An omitted material
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
- pitfalls anyone could fall into without noticing, beginner or practitioner

Use the repository and notes as evidence, but add the domain questions that
follow from first principles. Surface newly discovered decisions as chart
decisions. Do not begin destination grilling, architecture grilling, or any
other decision question until this map is shown.

## Expert-challenge close

Question authoring applies an expert-challenge lens to every question and every
round. The check is the last item of the batch itself, challenging the batch's
own recommendations, so the operator answers questions and challenge in one
reply. It is never a separate exchange after the answers. A round is one
message out and one reply back. The operator makes one pass over the
questions and answers, everything present. Slots waiting on each other and
on research is the accepted cost; a second operator pass is not:

```text
Challenge check
What would an experienced practitioner challenge in this round's answers?
<name the challenge, or say that no challenge was found and why>
Reply with the challenge check, or confirm no challenge.
```

This check is shown and answered even when a round has no new decision
questions, inside the same message as the round's questions. It is never silently omitted. If the answer exposes a new fork,
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
