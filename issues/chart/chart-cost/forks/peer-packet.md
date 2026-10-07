# Peer packet

The map's K3 (B,C) with M7, plus the carry from map-size: map text stays in each peer's context.

## Question
Q1. How does A hand a peer its task: text inside the prompt, or a brief file with a one-line prompt that points at it?

Q2. What bounds the context a peer carries from one turn to the next?

### Carries
- Lock (operator 2026-10-06, verbatim): "cutting down the costs and optimizing the process without necessarily changing how it works because I I actually do like the new way it works."
- Lock: peers B and C, blind independent work, one fork per round, rebuttal after merge, the focused final-shape check and the operator round shape stay. No model or effort is hard coded in skill, config or docs (forks/cut-boundary.md, forks/peer-effort.md).
- Taken: peers return blind five-part notes; merged notes are compact (forks/cut-boundary.md, forks/round-writing.md). The map rule is unchanged (forks/map-size.md).
- Rules today: questions.md:44 gives the prompt command as `herdr agent prompt <pane> "<text>"`. questions.md:46: "Every peer prompt gives the exact output path." questions.md:48 lists what a peer is sent for a fork. Neither says whether the task travels in the prompt or in a file. SKILL.md:6: "A file already read in this thread and not edited since is not read again for a later phase prompt."
- Measured, merge-turn 2026-10-05 (slots/map-C.md F2): A put a 1,936-character brief inside the prompt. C's harness delivered it as pasted content, C did not start, and the operator typed "go" 9 minutes later. In seed-root-cause and in this chart A sent one line pointing at a brief file and both peers started at once.
- Measured, this chart, C's session (Fable 5.1, fitted prices), 14 turns, about $13.3 in total: output $4.63, cache write $5.91, cache read $2.79. The map turn alone was $6.90. C's context was 206-213k tokens after the map, then the session compacted to 49k (the compaction turn cost $0.81) and grew to 130k over the next ten turns. A notes turn after that cost $0.64-0.90 (output $0.27-0.44, cache write $0.22-0.39, cache read $0.11-0.15). A rebuttal turn cost $0.19-0.29. Cache read on all turns after the map was $1.60, 12% of C's bill.
- Measured, this chart, B's session (codex, medium effort): context grew from 21k to 237k tokens with no compaction until the last turn. Each B turn read 0.4-1.4M input tokens, 97% cached, and took 1-3 minutes at any context size. B's dollars are unmeasured.
- Measured: a fresh Claude session starts at about 45k tokens of context, which is about $0.90 of cache write on Fable before any work.
- Related forks, not yet written: handoff-script, proof-of-saving.

## Findings
- better-than-training · slots/map-C.md F2 and this chart's prompts, measured 2026-10-05 and 2026-10-06 by A, B, C · a 1,936-character brief typed into the prompt stalled C for 9 minutes; every one-line prompt pointing at a brief file started both peers at once · the task travels in a file.
- better-than-training · C's and B's transcripts on this chart, measured 2026-10-06 by A · cache read on C's turns after the map was $1.60 of $13.3; one compaction turn cost $0.81 and a fresh Fable session about $0.90 before work; B took 1-3 minutes at 21k to 237k tokens of context · no reset mechanism is justified. The net effect of a reset is unmeasured (B).
- practitioner · Anthropic Applied AI team, "Effective context engineering for AI agents", https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents, and Justin Young, "Effective harnesses for long-running agents", https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents, read 2026-10-06 by B · references and targeted retrieval over wholesale loading, durable files for recovery · supports briefs that link evidence and chart files as the recovery state.
- Peer notes: slots/peer-packet-A.md, -B.md, -C.md. Merged notes and rebuttal outcome: slots/peer-packet-merged.md.

## Taken
- Operator answer, 2026-10-06, verbatim: "1a | 2a |"
- Q1 = 1a. A hands every peer task as a brief file with a one-line prompt that names the file and the slot letter.
  1. The brief is finished before the prompt is sent and is not edited during the exchange. A new exchange gets a new brief or a new return path.
  2. The brief uses absolute paths and holds what questions.md:48 lists for that exchange, with the exact return path.
  3. Briefs live under `<chart>/slots/` and stay in the chart. Before the chart folder exists the temporary-path rule of questions.md:46 applies and the map briefs move into slots/ with the maps.
  4. The confirmed-start check and the rule against automatic re-prompting stay.
  5. Skill edit in the same commit as the other questions.md edits: questions.md:44 to :48 say the task travels in a brief file.
  6. Held for leaf review: whether the one-line prompt also repeats the return path (B, per questions.md:46) or the brief alone carries it (C).
- Q2 = 2a. No new mechanism. Each peer keeps one session per chart with its harness's own compaction. No skill edit and no leaf.
- Carried to proof-of-saving: cache read share of each peer's bill and B's input tokens per turn, per chart.
- The round was restated once on the operator's elid request before the answer.

## Operation proof
- Operation: `herdr agent prompt <pane> "<one-line pointer to a brief file>" --wait --until working --timeout 5000`, the call that starts a peer task from a brief file.
- Command and inputs: the call above with the text `Slot <letter>. Read <absolute brief path> and follow it exactly. Your slot letter is <letter>.`, sent to w8:pGY (codex) and w8:pGZ (claude) for the notes and rebuttal exchanges of map-size, peer-packet, handoff-script and proof-of-saving.
- Identity: the operator's local user, no credential.
- Version and date: herdr 0.9.3, 2026-10-06.
- Observed result: exit 0 on all 16 calls, and each peer wrote the return file named in its brief.
- Cleanup: none. The brief files stay in slots/.
- Limits: does not prove delivery to a pane that is not idle, a harness other than claude and codex, or a brief outside the chart folder.
