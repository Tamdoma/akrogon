# Slot C, fork cut-boundary, 2026-10-06

Blind round. Sources read: forks/cut-boundary.md (Question, Carries), slots/map-merged.md, skills/chart-issues/assets/questions.md:5-27 and :44-50, skills/chart-issues/SKILL.md:49, the slots/ folders of seed-root-cause and merge-turn.

## New measurements for this round

N1. What a peer full round is made of (bytes, average per fork file, this chart's and seed-root-cause's slots/). C: 10,125 B (merge-turn) and 9,705 B (seed-root-cause). B: 6,739 B and 7,220 B. Share of bytes by section: option lines 23-30%, Research lines 13-24%, Pitfalls-avoided lines 11-16%, Challenge check 10-14%. The rest is headings, question stems, Carries restated and operator-facing prose.

N2. How much peer text survives into the merged file. 8-word-sequence overlap between each merge-turn merged file and its three slot files: 0-4% of the merged text comes from any slot file, and 0-2% of each slot file is reused. A rewrites every round from scratch regardless of how peers format theirs. The formatted round the peers produce is read once by A and never shown to anyone.

N3. Size of a position-only peer file today. Rebuttal files are the nearest existing example of "choice, evidence, disagreements" without the round template: C 499-5,323 B (median 2,900), B 1,170-5,318 B (median 1,650). That is 25-35% of a full round by bytes.

N4. Peer turn time already small and flat: C fork rounds 0.9-2.6 min, rebuttals 0.3-0.7 min; B 1.5-2.0 and 0.6-0.7 min (slots/ mtimes, both charts). The cost of a full round is tokens, not operator wait.

## Q1. Short peer position or full formatted round

### Options
- O1. Keep the rule as written (questions.md:48): each peer returns a full round in the questions.md:5-25 template.
- O2. Peer returns a short position per fork: for each question, its chosen option and the options it rejected, the evidence with file:line or source tier (questions.md:33-40), the pitfalls it sees with what removes each, and its disagreements with the Carries. A alone writes the formatted round. Blind reading, rebuttal after merge, final-shape check and the operator round shape are untouched.
- O3. Hybrid: peers return the template but only the option lines and Pitfalls-avoided lines, no Research prose or Challenge check. Rejected below.

### Recommended: O2
One reason: N2. The peer template is written for an operator who never reads it and is rewritten 100% by A, so the template's bytes (roughly two thirds of each peer file, N1 against N3) are output tokens, then cache-write tokens in A's context (M5), that produce nothing the operator sees. Removing the template removes that class of cost without changing a line of what the operator receives, which is the lock.

Cost of O2:
- Expected saving per fork: peer output falls from about 10 KB (C) and 7 KB (B) to about 3 KB and 2 KB (N3). On C that is roughly 65-70% of C's per-round output, and C's output is where the Fable premium sits (M4). Unmeasured until K8 runs on a chart.
- A's merge reads 5 KB of peer text instead of 17 KB per fork. Small, but it is cache write that recurs every fork.
- What is lost: a peer's draft wording of the Research and Pitfalls-avoided lines. N2 says A does not reuse that wording today, so the loss is the peer's chance to check that its evidence reads correctly in operator register. The rebuttal round still gives the peer that check on the merged file.
- O3 rejected because it keeps the template's structure cost and drops the two sections (research evidence, challenge check) that carry the independent judgement the blind lock exists for.

### Pitfalls over the lifetime and what removes each
- P1. Thinner peer file, same `(B,C)` tags: A infers a peer's agreement from silence and tags it. Removes: the position must name the options it rejects, not only the one it picks, so a tag can only cite an explicit line. Merge rule at questions.md:50 stays and gains "tag only what the peer file states".
- P2. Peers stop listing pitfalls because the questions.md:27 Pitfalls-avoided rule lives in the template they no longer fill. Removes: the short position has four fixed parts (choice with rejected options, evidence, pitfalls with removal, disagreements). peer-wait.ts already waits for the file; a presence check that the four parts are non-empty is a function check, not a format check.
- P3. Challenge check disappears. Today it is 10-14% of each peer file (N1) and is the place peers say the question is wrong. Removes: "disagreements" in the short position is defined to include disagreement with the question and the Carries, not only with options.
- P4. Rule drift: questions.md:48 says "full round", SKILL.md:49 describes the merge, the peer brief templates in A's scratchpad say what to return. Three places. Removes: one commit changes questions.md:48 and SKILL.md:49 together, and the peer brief points at questions.md rather than restating the shape (same mechanism K3 peer-packet needs).
- P5. Saving claimed without measurement. Removes: K8 proof-of-saving measures peer output tokens per fork on the next three charts, against N1 and the dedup C figures (72k and 110k out per chart).
- P6. A's round grows to compensate, because A now has no peer draft to lean on and writes longer Research lines. Removes: operator round length is already bounded by the template (3.6-5k chars avg today, measured in map-C). K8 records it alongside.

## Q2. Which model runs slot C

### Options
- O4. Keep claude-fable-5-1, effort medium (C's start flags since 10-01).
- O5. Switch C to claude-opus-5-5, effort medium. Fable output is about 2.2x Opus output per token (M4 fit).
- O6. Switch C to claude-sonnet-5-5.
- O7. Decide after O2 lands: keep Fable for the next measured chart, switch to Opus 5.5 at a chart boundary if C still costs more than A.

### Recommended: O7, with O5 as the switch target
One reason: the three-slot design pays for independent judgement, and A already runs Opus (M5 is fitted from A's Opus sessions). Putting C on A's model removes one of two model-family differences the blind rounds rest on, for a saving that O2 is about to take anyway: most of C's premium is on output (M4), and O2 removes most of C's output. Deciding Q2 before Q1 is measured would spend the independence to buy a saving twice.

Cost of O7:
- C stays the priciest slot per output token for at least one more chart. On the two 10-05 charts that was $11.37 and $18.84 (M4). After O2, the Fable share of that is unmeasured.
- If the measured chart still shows C above A, the switch to O5 happens at a chart boundary, not inside a chart, so the cost-state comparison stays clean.
- O6 rejected for now: no measurement of Sonnet quality on this door exists, and the quality loss would show up as weaker rebuttals, which M-after-rebuttals shows are the part of peer work A accepts most (all 4 of my rebuttal points and 3 of B's were accepted on the map round).

### Pitfalls over the lifetime and what removes each
- P7. Switching models mid-chart breaks the cost comparison and the peer's context. Removes: model changes only when a chart starts, recorded in the chart's CHART.md with the start flags.
- P8. The harness stall in M2 (inlined brief delivered as pasted content, 9 minutes) is a Claude harness behaviour, not a Fable one. Any Claude model keeps it. Removes: K3 peer-packet, file-delivered one-line briefs, which seed-root-cause already used.
- P9. Thinking share grows with the harder forks (C thinking 32-44% of output, dedup). Lowering effort below medium trades that for unmeasured quality. Removes: leave effort at medium, let O2 cut the written output instead.
- P10. Two slots on the same model converge on the same answer and the `(B,C)` tag loses meaning. Removes: if O5 is taken, B stays on codex gpt-6.1-sol, so the A/C pair shares a model but B does not. Note it in the chart's standing design so a later operator does not move B too.

## What I could not measure
- U1. The token cost of a short position in practice. N3 uses rebuttals as the proxy. The first O2 chart gives the real figure.
- U2. Quality delta of O2 against full rounds (does A's merged round lose evidence it would have had). Only visible by comparing merged files across charts after the change.
- U3. B's dollars (codex cost-state not recorded), so whether C or B is the larger peer bill is open.
- U4. The split of C's $11-19 per chart between output and cache tokens, which decides how much O2 removes of the Fable premium.
- U5. Fable against Opus 5.5 quality on this door. No chart has run C on Opus 5.5 in the window.
