# Fork notes merged: handover (A, B)

Sources: A's view (below), slots/handover-B.md.

## Q1 When
- Hand over only when switching to the next runnable handed chart. Before that, finish the outgoing chart's records, collect every consultant return and close its span. The fresh A enters that chart directly, runs the consultant restart once and does not restart A again on entry. (A,B)
  - Cost: a single-chart pass, or one large chart, keeps one session. (A,B)
- Rejected:
  - mid-chart: decisions and exchanges may still be open. (A,B)
  - every entry: risks a restart loop. (A,B)
  - every pass end: a pass waiting on the operator would lose the session the operator answers into. (A,B)
- Open point: the next handed item may have no chart folder yet. (B) A's answer: the start prompt names the next item itself, and that item gets its folder on entry as it does today. (A)

## Q2 Kill boundary
- Pick 2b. Running the helper is old A's last act. All records and printed lines come first. The helper validates kind and process group before the kill, detaches, and leaves old A untouched when validation fails. (A,B)
- Rejected 2a: an idle wait adds no proof that the last reply finished (peer-wait.ts:157). (A,B)
- Failure visibility: the helper writes its outcome lines to a log in the outgoing chart's slots/, and the handover line names that log. Never claim "handed over" before the fresh A is seen. On a failed start, record the failed step and what is in the pane, and do not assume an empty shell. (A,B)

## Q3 Continuation record
- Option 3a: reuse the existing continuation path. Today the operator's words "continue autopilot" let a new session resume the same handed list, with lost consultants still lost (SKILL.md:143). For a handover, old A instead appends `handover <time>` to the mode record of every handed chart still open, naming the log. The start prompt names the pane, the time and the next item. A fresh session in that pane whose latest entry matches that time appends `continue autopilot (handover <time>)` and continues exactly as after the operator's words. Any other new session, including one the operator opens by hand, has no matching prompt and starts attended. One launch is guaranteed because the helper is run once and old A dies. One continuation is guaranteed because the appended `continue` line makes the handover no longer the latest entry. (A)
  - Cost: the handed list and losses are rebuilt from the per-chart records, as they already are after the operator's words.
- Option 3b: one transfer record with the pass state and a transfer id, claimed once. (B)
  - B's reason: 3a's lines do not say how to rebuild the order, items without folders, or losses on charts already handed off.
  - A's answer: the same rebuild already happens today after "continue autopilot", so 3b would add a second source of pass state beside the one the skill already trusts.
- Rejected, any session inherits the latest `on`: an unrelated session would silently get autopilot. (A,B)

## Q4 Launch form
- Do not copy argv as is, and never replay the original task prompt. (A,B)
- Option 4a: the plain kind plus the start prompt. Cost: flags given on the command line are dropped silently. (A, first pick)
- Option 4b: keep the launch flags, strip history flags with their values, add the prompt. Cost: argument parsing for each supported harness, plus a proof that flags are kept. (B)
- Option 4c, A's synthesis after B's notes: launch the plain kind plus the start prompt, and run the handover only when A's argv after the binary is empty or exactly one claude history form (`--resume <id>`, `-r <id>`, `--continue`, `-c`). Any other argv makes the helper refuse before the kill, so that A continues in its same session as today. Nothing is dropped silently, and no flag parser is built. Cost: an A launched with extra flags does not get the handover. (A)
- Live fact: this door's A runs `claude --resume b961e376-...` (`herdr pane process-info --pane w8:pNP`, 2026-10-17), so 4c would hand it over.
- Proof must observe: the fresh A has a different session in the same pane and starts the next item without the operator. (B)

## Q5 Harnesses
- Pick 5a: claude only. Other kinds keep today's same-session behavior, and the limit is stated in the skill and guide. (A,B)
- Rejected 5b: each kind's self-detach, start prompt and permissions would need its own proof, which is larger than this minimal change. (A,B)

## Pitfalls
- Wrong process killed: the kill targets only the process group validated just before. (A,B)
- Name reuse: start under the derived peer-restart name after herdr drops the old row. That is the in-place restart pattern. (A) B requires bounded waits. (B)
- Probe shortcuts copied: every step is checked and the first failure stops. (B)
- Installed bun invocation blocked in auto mode: needs a live proof. (A,B)
- Dropped consultants revived: losses stay lost, as under "continue autopilot". (A,B)
