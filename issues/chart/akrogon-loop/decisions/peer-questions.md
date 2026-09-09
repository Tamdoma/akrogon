# Peer Questions

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Outside the door, a question from one agent goes to the peer pane in the same Question and Option text, the peer answers, the asker synthesizes. July 28 sent a remaining real fork to the user, that line changes to the synthesizer deciding. What exactly changes in consult-issue's synthesis text, and what does an agent do when the peer pane is busy? Roles are fixed, slot A strategist, slot B implementer.

Coverage pass 2026-09-08 adds: the intake says herdr's prompt wait is capped at five minutes (123); checked on 0.9.0 on 2026-09-08, it is not, the wait is indefinite after activity.

Reshape 2026-09-08 after # Debate Count, # Turn Within Phase, # Driver State: busy peer: `akrogon next` already checks the peer idle before prompting, so the open part is what an agent does mid-pass when it needs the peer and the peer is working.

Reshape 2026-09-08 after # Skill Rewrite: the peer writes its answer to `<leaf>/questions/<id>.md`; the asker waits for idle and reads the file. Pane read is no longer the return path (both-ends read failure observed the same day).

Operator explanation 2026-09-08 (chat, recorded for handoff): the asker prompts the peer through herdr with the question text and the instruction to write the answer to `<leaf>/questions/<id>.md`, runs `herdr agent wait` on the peer with no timeout, then reads the file. One exchange, then the asker decides; ties break by the hierarchy simplicity, clarity, elegance, cost, speed, quality. State is untouched.
