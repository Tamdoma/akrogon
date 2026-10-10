# Slot A notes: search-routing

## Measurement (better-than-training, local transcripts, 2026-10-10)
Main-model search/read calls since haiku.md loaded (Read, Grep, Glob, and shell `rg/grep/find/cat/ls/head/tail/sed -n/wc/git log|show|diff/jq`), akrogon + framework, eval sessions excluded:
- 686 calls, median result 2.3K chars, p90 9.7K.
- Under 2K chars: 318 calls (46%) but 8% of the text. 8K and over: 89 calls (13%) but 51% of the text.
- Runs of consecutive search calls: 144 singles, 65 pairs, 42 triples; 28 runs of 5 or more.
Reading: by count, most searches are single targeted lookups between other actions. By volume, a small tail of big reads and long sweeps carries the cost.

## Stock and flow
- Stock S1, main context: everything read stays and is re-sent on every later turn (cached, but paid per turn). Inflow: each self-read. Outflow: only compaction. Decided by the main model, per call. A big read early in a long session is paid many times.
- Stock S2, routing rule: fixed text at the top of context. Its share of attention shrinks as S1 grows. No inflow during a session.
- Stock S3, the main model's trust in Haiku inside a session: starts at the rule's prior, falls on each visible Haiku miss, has no inflow (the cost of self-reads is never shown). Resets every session; no memory across sessions.
- Flow F1, delegation: moves a read from S1 into a Haiku context and returns a summary, a much smaller inflow to S1. Gated by the main model's guess about difficulty, made before it knows how hard the search is.

## Loops pushing the wrong way
- R1 context lock-in (reinforcing): self-read, so the file is in context, so the next question hits "already in your context" / "a lookup whose target you already know", so self-read again. The first read decides the session. The accepted draft's "a file already in your context" exit feeds this loop unless it is narrowed to the exact text already present.
- R2 invisible cost, visible failure (reinforcing toward self): self-read cost never shows; a Haiku miss shows. S3 only falls. Each miss makes the next hand-off less likely.
- R3 blanket Haiku Explore (reinforcing, appears under rule-rewrite's old 1a): a hard search lands on Haiku, returns weak facts, the main model redoes it, paying twice, then avoids Explore. This is the operator's objection.
- B1 harness damping (balancing, holds delegation low): "do it yourself when it is a handful of tool calls ... when in doubt, don't spawn". Countered by the taken override clause.
- B2 verification tax (balancing): delegate, then re-read, so delegation costs about the same. Countered by the taken spot-check line.
- B3 salience decay (balancing): S2 is fixed while S1 grows, so the rule weakens over a long session, exactly when big reads are most expensive.
- B4 latency (balancing): each hand-off adds wall time in interactive sessions, which pushes toward self.

## Fix: route by job type at the point of decision, escalate on observation
1. Route by job type, which the main model knows before it starts, not by difficulty, which it cannot know. Retrieval (find, read, summarize, extract; the answer is a fact) goes to Haiku. Judgment (why, which is better, trace a cause, decide relevance) stays with the main model.
2. Put the routing table where the decision is made. Claude Code chooses agents from their descriptions in the Agent tool listing, read at every spawn decision. Two agents side by side: `Explore` with `model: haiku`, described as retrieval returning facts; and one with `model: inherit` for searches that need judgment (built-in general-purpose already inherits; a named read-only `investigate` agent makes the split explicit). This weakens B3 (the rule is restated at the decision point) and removes R3 (hard searches have their own route).
3. Escalation adds a corrective balancing loop. Haiku returns found / not found / low confidence / needs judgment. On any flag the main model takes over or sends the job to the inherit agent. This turns a guess into an observation, and Haiku misses become cheap signals instead of trust losses (weakens R2).
4. Narrow R1: "already in your context" means the exact text is present, not the neighbouring files.
5. Feedback for the operator: the taken 7-day recount (3a) is the slow loop. Nothing faster is added now.

Pick: 1, 2 (Explore on Haiku + an inherit route), 3, 4. Cost: one or two small agent files beyond haiku.md; a hard search tagged as retrieval pays one Haiku attempt before escalation (cheap in money, slower in time).

Rejected:
- Explore stays on the main model plus a separate Haiku "scout" agent. Uncertain jobs would default to the main model and B1 already pushes there, so volume stays near zero.
- Difficulty prediction in the rule ("hard searches stay with you"). The model cannot judge it before searching, and it reopens the self-judged exit that failed.
- A hook that reroutes reads. Fires inside lifecycle workers; deferred under 3a.

## Challenge to the operator's premise
"Most searches should go to Haiku" is wrong by count and right by volume. 46% of searches are single sub-2K lookups. A subagent's own startup and round trip cost more than the lookup, and latency rises. The test: will you need the raw text in your own context (code you will edit or argue about line by line), or only the answer? Only the answer, or a sweep across files, logs or transcripts, goes to Haiku. Raw text you will work with stays with you.

## Pitfalls and removers
- Haiku answers a judgment question: Explore description says facts only; return flag "needs judgment" triggers escalation.
- Double pay on misrouted hard searches: escalation after one Haiku attempt, never a Haiku retry loop.
- Over-delegation of tiny lookups: the raw-text test plus the one-known-line exit.
- Lifecycle work on Haiku: skills name their own agents; Explore is never referenced by akrogon skills (B checked).

## Questions the fork does not ask
- Should the inherit route be the built-in general-purpose (no new file) or a named read-only agent (explicit split)?
