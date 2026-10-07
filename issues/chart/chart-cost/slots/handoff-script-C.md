# Slot C notes, fork handoff-script, 2026-10-06

Read: INTAKE.md, forks/handoff-script.md, SKILL.md:55-79 (needs, grants, fixtures, save, handoff, presence check), skills/chart-issues/scripts/ (peer-wait.ts only), src/readiness.ts exports, issues/chart/merge-turn/slots/handoff-*.md names.

## Q1. Does any of the door's handoff work move into a script, and which part?

The measured share is too small to act on. The handoff is $1.34-2.40 per chart (13-20% of the door's bill). Inside it, the scriptable parts are the presence check (2 calls, 1.4-2.7k characters, 1.7-6.9% of visible characters) and the proof command (1 call, 682 characters). At Opus output prices that is under $0.10 per chart and two to three tool calls. A script cannot save more than that, because that is all the model spends on them.

Options I name:
- 1a. No script. The fork closes with the measurement on record.
- 1b. A `scripts/presence-check.ts` that wraps the `bun -e` line and runs it for every draft folder in one call.
- 1c. A per-chart proof runner: the chart's proof calls written into one script and run once.
- 1d. A handoff script that also writes the leaf files from the merged drafts.

1. Pick: 1a.
   One reason: the only handoff work a script can replace is already a fixed string the model copies verbatim (SKILL.md:75-77), so the tokens it costs are the command text plus its JSON result, measured at 1.4-2.7k characters per chart, and a script leaves the result in context all the same. Where the handoff money goes is writing leaf drafts twice (13.5k characters before peer review, 22.7k after on merge-turn) and thinking (over half of 47.5k output tokens), neither of which a script touches.
   Cost: the presence check stays one `bun -e` call per draft folder, so a chart with many leaves pays one call each. On the two measured charts that was 2 calls.

2. Rejected:
   - 1b: saves at most one tool call per extra leaf and no characters of output, since the loop's result still enters context. Adds a file under scripts/ that must track src/readiness.ts and src/config.ts signatures, which `bun -e` already imports live. The lock keeps the check; wrapping it changes nothing the operator sees and nothing measurable in cost.
   - 1c: proof calls differ per chart by rule ("Proof calls are written per chart, since each chart names different operations", Carries). A generic runner has nothing generic to run, and a per-chart script is the same call text written into a file first, which is more output, not less.
   - 1d: writes leaf files without the attended review and the peer exchange that the lock keeps, and the writing is the model's own text in either case.

3. Evidence:
   - Tier better-than-training. Source: forks/handoff-script.md Carries, A's measurement of the door's transcripts 2026-10-06. Finding: handoff $2.40 (20%) and $1.34 (13%); presence check 2 calls, 1.4k and 2.7k characters; proof command 1 call, 682 characters; drafts 13.5k then 22.7k characters, design 11.0k, readiness 3.1k; more than half of output is thinking.
   - Tier better-than-training. Source: skills/chart-issues/SKILL.md:75-79, read 2026-10-06 by C. Finding: the presence check is one fixed `bun -e` line importing `readGlobal`, `readReadiness` and `gaps` from src/, run per draft folder, printing names only. It is already the smallest form a check can take short of not running it.
   - Tier better-than-training. Source: skills/chart-issues/scripts/ (peer-wait.ts) and src/readiness.ts:85-87, read 2026-10-06 by C. Finding: the one existing door script replaced a polling loop that cost model turns (M10, "peer-wait.ts costs no tokens"). The presence check has no loop and no wait, so the precedent does not transfer.
   - Tier practitioner: not searched. The question is about this door's own two tool calls.

4. Pitfalls:
   - A later chart with ten leaves pays ten presence calls and the fork is reopened as "the check is slow". Removed by: proof-of-saving records handoff calls and characters per chart; if the check passes the cost of one leaf draft on a measured chart, 1b is written then, against a number.
   - "Scriptable" parts are read as the handoff's cost because they are the only parts with a command. Removed by: the fork's Findings record the split (drafts and thinking against checks) so the next cost question starts from the drafts.
   - The presence check is dropped as "not worth running" because it is small. Removed by: the lock; the check is how a missing env or file is found before `issues/open/` has a leaf, and `akrogon status` cannot see drafts (SKILL.md:79).

5. Missing question: the one handoff cost above noise is that A writes each leaf twice, 13.5k characters of drafts and then 22.7k of final files on merge-turn, and the shipped text is regenerated rather than the reviewed text moved. Should the merged draft be edited in place and moved into `issues/open/` instead of rewritten? That is not a script and the fork does not ask it. Its saving is the second writing (about 6k output tokens on merge-turn) and it removes the gap between what the peers reviewed and what ships; I have not measured that gap on leaf files.

## Not measured
- The thinking share spent on proofs against drafts (Carries says unmeasured; I found no way to split it from the transcript).
- Whether shipped leaf files differ from the reviewed drafts, and by how much.
