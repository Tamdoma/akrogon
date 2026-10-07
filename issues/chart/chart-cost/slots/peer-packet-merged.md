# peer-packet, merged notes (A, B, C)

Q1. How does A hand a peer its task?

Options
- O1 (A,B,C) A brief file plus a one-line prompt that names the file and the slot letter. The brief is finished before the prompt is sent, is not edited during the exchange, uses absolute paths and holds what questions.md:48 lists. A fresh brief or return path per exchange stays, and so does the confirmed-start check with no automatic re-prompt (B).
  - Reason: it is the only form measured to start both peers at once. The 1,936-character inline brief on merge-turn stalled C for 9 minutes (A,B,C). The file is also the record of what each peer was sent, the only evidence the blind lock was kept (C).
  - Cost: one small file per exchange (six briefs, 4.7KB on this chart) (C). No token saving is claimed, since the brief still enters context when read (B).
- O2 Task text inside the prompt. Rejected (A,B,C): the measured stall, and the paste threshold is undocumented and differs per harness.
- O3 Both prompt text and file. Rejected (B,C): two copies that can disagree.
- O4 A length limit on prompt text. Rejected (A).

Where slots differ on Q1
- Where the return path goes. B: in the prompt line too, since questions.md:46 says every peer prompt gives the exact output path. C: in the brief only, so the prompt stays one short line. A: unstated.
- Where briefs live. C: under `<chart>/slots/` from the map on, with the temporary-path rule of questions.md:46 before the chart folder exists. This chart's map and first-fork briefs were in A's scratchpad and are not in the chart (C). A and B did not address it.

Q2. What bounds the context a peer carries from one turn to the next?

Options
- O5 (A,B,C) No new mechanism. One session per peer per chart, with the harness's own compaction. What bounds new context is the brief: it is complete for its exchange, so a peer needs nothing from earlier turns (C), and it links existing evidence rather than copying maps or earlier exchanges (B).
  - Reason: carried context is a small cost and any reset costs about what it saves. Cache read on all C turns after the map was $1.60, 12% of $13.3. A compaction turn cost $0.81 and a fresh Fable session $0.90 before work (A,B,C). B took 1-3 minutes at every context size (A,B,C).
  - Cost: no hard bound and no proven saving (B). B carries its map context all session at unmeasured dollars (A). Compaction lands at a moment nobody chooses (C).
- O6 A fresh peer session per fork. Rejected (A,B,C): about doubles a notes turn on Fable, and a reset between notes and rebuttal removes the position a peer needs to detect misattribution (B).
- O7 A forced compaction or restart after the map. Rejected (A,B,C): net saving at most a few tenths of a dollar per chart, and it writes a harness-specific command into the door (A,C).
- O8 A reset at a context threshold. Rejected (B,C): A cannot see a peer's context size through herdr (C).

Evidence
- better-than-training · slots/map-C.md F2 and this chart's prompts, measured 2026-10-05 and 2026-10-06 · inline brief stalled 9 minutes, every file-pointer prompt started at once (A,B,C).
- better-than-training · forks/peer-packet.md Carries, measured 2026-10-06 by A · the figures above.
- practitioner · Anthropic Applied AI team, "Effective context engineering for AI agents", https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents, and Justin Young, "Effective harnesses for long-running agents", https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents, read 2026-10-06 by B · references and targeted retrieval over wholesale loading; compaction can lose subtle context; durable files support recovery · supports linked briefs and chart files as the recovery state, shows no chart-specific saving.
- Unmeasured: B's dollars, codex behaviour at its context limit, any saving from O1 or O5.

Pitfalls and what removes each
- A brief thinner than questions.md:48 because the prompt feels like the whole task. Removed by the brief carrying that list (C).
- A peer answering from stale carried context. Removed by the brief naming the current Question, Carries and verbatim corrections, and by the rebuttal step (C).
- Compaction losing a peer's dissent. Removed by the peer's own notes and rebuttal files staying in the chart (B).
- Compaction in the middle of a peer turn. Removed by peer-wait's `failure` outcome, reported to the operator (C).
- A linked file that changed after the peer first read it. Removed by re-reading changed material (B).
- Carried-context cost growing unseen. Removed by proof-of-saving recording cache read share and B's input tokens per turn, with the fork reopened if the share passes the cost of one reset (A,C).

Open question
- C: do briefs stay in slots/ as part of the chart record, or is that clutter in the chart folder?

## After rebuttals
- C: no disagreement. peer-wait printed `failure` for C 10 seconds before C's file appeared, the second false failure on this chart (Fog).
- B R1 to R4 accepted (slots/peer-packet-rebuttal-B.md).
- O5 no longer says a peer needs nothing from earlier turns. The brief supplies the current task, and the peer's own earlier position stays relevant for rebuttal and recovery, which is one reason sessions are kept (R1).
- The reset figures are not a measured net result. A reset is rejected because no saving is demonstrated, and reopening the question needs a full-fork comparison (R2).
- peer-wait's `failure` and the peer's files support recovery after a compaction. They do not remove the risk of reasoning lost inside a turn (R3).
- A retained brief shows what A sent. It does not alone show the peer worked blind; transcripts add that (R4).
- Options as shown to the operator: Q1 brief file with a one-line prompt (A,B,C), with the return path in the brief and in the prompt line (B) or in the brief only (C). Q2 no new mechanism (A,B,C).
