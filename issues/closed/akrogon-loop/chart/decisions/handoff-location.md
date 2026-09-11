# Handoff Location

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Where does the last-action-and-next-step line live that the next agent reads first: the pane tail via herdr agent read, or the end of the plan file? Who reads it: the next agent, there is no driver.

Reshape 2026-09-08 after # Debate Count, # Turn Within Phase, # Driver State: only the next agent reads the line; the peer wake-up path from # Next Command Owner also reads the pane tail, so the two readers should agree on one place.

## Findings

Operator position, 2026-09-08: the next agent should get its clues first from the end of the previous response, where grounding, last operation and next step already appear, before rereading files. Not to be relied on, but first.

Slot A challenge, same day: the driver's phase read is a program opening a four-line file, zero tokens, so the reread cost does not apply to it. The tail is prose and a driver parsing it is the August seam. The busy-pane prototype showed a pane ending cleanly while its task was unfinished. Alternate-screen harnesses can return an empty tail. The split proposed: driver reads phase only, next agent reads the handoff prose first, and the plan file end is the cheaper and more robust home for that prose. To be settled here.

From # Bootstrap 2026-09-09: the hand-built leaves have no `akrogon next`; the operator types each pass prompt, so the last-action line must be readable by a person as well as the next agent.

From # Multi Chart Layout 2026-09-09, operator rule: every skill pass ends with two standardized lines, "Last operation" and "Next", that say exactly what to do next in plain words; the same labels every time, content judged by the reader (agent or operator on a hand-built leaf), never parsed by the command. This decision picks where those lines live.

Slot A (Claude, blind) 2026-09-09: `<leaf>/handoff.md` overwritten each pass with Phase, Last operation, Next; skill reads it first; no paste into the prompt; staleness judged by the Phase line.

Slot B (Codex, blind) 2026-09-09: save the lines in the artifact the slot already writes and print them; try one bounded pane read before the files; write before `akrogon phase`. Rebuttal: one shared file loses a note under concurrent blind passes; a phase mismatch alone does not mean stale.

Operator 2026-09-09, on the eli round: "Why do we even need this if the agents never read the content of the other pane?" Slot A conceded: the next pass already has the prompt line (skill, slug, slot, phase), the state file, and the leaf files; "Next" is implied by the phase and "Last operation" by the diff and the pass artifact. A saved file has no reader. Both slots had proposed files for a reader that does not exist.

Operator ruling: printed only, standardized shape, and "Next" names the skill command and the actual prompt the next pass receives. The printed tail is also the probabilistic backup already locked in # Skill Rewrite 6-A (line 54): when something looks scrambled an agent may read the first 50 to 100 words of the other pane to confirm, never to infer slot, phase, readiness or completion. Codex check confirmed the lock (skill-rewrite.md lines 54 and 92), added "Next: none" when no pass is due and that an absent footer must never block progress.

## Resolution

The two lines are printed, never saved. Every skill pass ends its response with exactly this shape, judged by a reader, never parsed:

```text
Last operation: <what this pass did and observed, one or two sentences, naming the phase it moved to>
Next: <skill> <slug> slot=<A|B> phase=<phase>
```

"Next" is the prompt line the next pass receives, reproduced from the state the pass just wrote. When no pass is due (merged, failed, waiting on a peer answer) it reads `Next: none` plus the reason. The hook and `akrogon next` are the authority; if retry or peer routing sends the real prompt elsewhere, the printed line is simply wrong and nothing breaks. A note meant for the next agent goes in the artifact the pass already writes (plan, review, report), not in the footer.

Backup use: the footer is the probabilistic backup layer from # Skill Rewrite. An agent that finds its context scrambled may read the first 50 to 100 words of the other pane to confirm what happened. It never derives slot, phase, readiness or completion from it, and a missing or empty tail never blocks the pass.

Why: the next pass already receives its prompt line, the state file and the leaf files, so a saved copy of two prose lines has no reader. Printing costs nothing, serves the operator on hand-built leaves, and keeps the backup.

Forecloses: `handoff.md`, a handoff section in the plan, pasting the lines into the `next` prompt, the July 28 Grounding footer line, and any reader that parses the footer.
