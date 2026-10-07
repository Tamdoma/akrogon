# peer-packet, A's notes

Q1
- Pick: the task travels in a brief file under slots/ and the prompt is one line that names the file and the slot letter. Reason: it removes the pasted-content stall (9 minutes on merge-turn) on any harness. Cost: one small file per exchange, which also records what the peer was asked.
- Rejected: a length limit on prompt text. The limit at which a harness treats text as pasted is not documented and differs per harness.
- Evidence: slots/map-C.md F2; this chart's 11 file-pointer prompts all started at once.
- Pitfalls: a brief that points at a file A edits later. Removed by a fresh brief file per exchange, as with return files.

Q2
- Pick: no new mechanism. Peers keep one session per chart and the harness's own compaction. Reason: after the notes format, re-read context is 12% of C's bill, a fresh session per exchange costs more than it saves ($0.90 of cache write against $0.11-0.15 of cache read per notes turn), and B's time does not move with context size. Cost: B carries its map context all session, at unmeasured dollars.
- Rejected: a fresh peer session per exchange. Sending a harness command such as compact or clear to the pane after the map: the command differs per harness, and nothing harness-specific is written into the skill.
- Evidence: the measured carries in forks/peer-packet.md.
- Pitfalls: B's cost growing with context unseen. Removed by proof-of-saving recording B's input tokens per turn.
- Missing question: none.
