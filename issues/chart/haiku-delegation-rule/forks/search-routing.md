# Search routing

## Question
Q1. How does the main model decide, per job, whether Haiku or the main model does it, so that most searches go to Haiku while harder work stays with the main model? Seen as a system: what are the stocks and flows, which reinforcing and balancing loops push the wrong way today, and which change fixes them at the structure rather than with more instructions? Does the Explore override file belong in that fix, and is "most searches go to Haiku" itself right?

### Carries
- Operator 2026-10-10, verbatim: "1 - That's the reason why I haven't implemented this. A harder job should still route to the smarter model. But how does it decide what job it needs haiku or, what job it needs the smarter model for? Look at it as a systems thinker from the perspective of a system and consult with slot B. Look at what the stock flow analysis is and what the bad reinforcing loops are and what the bad balancing loops are right now and try to see if you can fix them systemically so that I get what I want. ost of the time for searches it should be using haiku. I I suppose, but challenge me on that. But for hard work it should default to itself."
- Taken: [rule-rewrite](rule-rewrite.md) Q2 = 2a (draft haiku.md), Q3 = 3a (7-day recount). Routing lines found here amend that draft.
- Locks: no akrogon skill changes; Haiku never runs lifecycle skill work; `CLAUDE_CODE_SUBAGENT_MODEL=haiku` excluded.
- Unanswered: rule-rewrite's old Q1 (Explore.md with model haiku); the operator rejected it as stated because a hard search would also land on Haiku.

## Findings
Notes: [A](../slots/search-routing-A.md), [B](../slots/search-routing-B.md), [merged](../slots/search-routing-merged.md), [B rebuttal](../slots/search-routing-rebuttal-B.md). After rebuttal A and B agree on every point.

Research:
- better-than-training · local transcripts, 2026-10-10 · 686 main-model searches since the rule loaded; 46% single lookups under 2K chars carry 8% of text; calls of 8K and over are 13% of calls and 51% of text; runs: 144 singles, 65 pairs, 42 triples, 28 of 5 or more · produced the one-call bound and the challenge to the premise. (A; B accepts)
- better-than-training · code.claude.com/docs/en/sub-agents, read 2026-10-10 · per-call `model` outranks the agent file's `model`; a user `Explore` overrides the built-in; Explore skips CLAUDE.md · produced the escalation field and the output contract in Explore.md. (A,B)
- better-than-training · framework transcript 47f624e2 · three calls with `"model":"haiku","subagent_type":"Explore"` · the per-call field works in this harness. (B)
- better-than-training · Prompting Claude Fable 5 and best practices, read 2026-10-10 · brief precise instructions; spawn and keep working; task shapes over counts · plain wording, parallel hand-offs. (A,B)

Agreed design (A,B):
- Default on the side whose mistake is visible: Explore runs on Haiku by file; a hard search calls Explore with `model` set to the main model. A thin Haiku return fails the spot-check and is escalated; an expensive run on an easy search would never show.
- Decision 1, inline or hand off: one search or read that answers the question stays inline; if it does not, the rest goes to Haiku. Raw text you will edit or argue line by line stays inline.
- Decision 2, Haiku or main model: if the brief's output is facts checkable at cited lines, Haiku; if it is an explanation or judgment, the main model (Explore with your model, or yourself).
- "Already in your context" narrowed to the exact text already present.
- Rejected: Explore on the main model plus a Haiku scout; two agents picked by name; difficulty or keyword classifiers; thoroughness flavours; a hook.

## Taken
2026-10-10, operator reply verbatim: "1a | 2a"

- 1a: `~/.claude/agents/Explore.md` with `model: haiku` makes Haiku the default for Explore; a hard search calls Explore with `model` set to the main model; a Haiku return that fails the spot-check or flags low confidence or needs judgment is rerun on the main model. Foreclosed: a second always-smart helper (1b); no override (1c).
- 2a: haiku.md gains the two tests: one search or read that answers the question stays inline, otherwise the rest goes to Haiku; facts checkable at cited lines go to Haiku, explanation or judgment to the main model. "Already in your context" narrows to the exact text present. Foreclosed: every unopened-file search to Haiku (2b).
