# Opening map, merged (A, B)

Sources: slots/map-A.md, slots/map-B.md. Live facts read by A after both maps, 2026-10-17:
- The in-place consultant restart in peer-restart.ts (an operator direct request in this chart, uncommitted on main) supersedes B's F3: it no longer closes or splits. It sends SIGTERM to the agent's process group, waits until herdr drops the pane's row, then starts in the same pane. Waiting for the row to drop also removes `agent_name_taken`, so the same name can be reused.
- A's pane w8:pNP has no herdr agent name. Its foreground argv is `claude --resume b961e376-...` (`herdr pane process-info --pane w8:pNP`), so copying argv would restore old history.

## Forks

### 1. When A hands over
- Only at the switch from one chart to the next runnable chart in the handed list. Before the switch, the outgoing chart's bookkeeping is done, every consultant return is collected and its span is closed. The new A enters the next chart directly and runs the normal consultant restart once. No handover after compaction, at pass end, or when every remaining chart is waiting. (A,B)
  - Cost: a single-chart pass never hands over, and one large chart keeps one session. (A,B)
- Also mid-chart, after each fork: rejected. It means more restarts and seat entries, and a larger change. (A)
- At every chart entry: rejected. It risks a restart loop and duplicate opening work. (B)
- At every pass end: rejected. A pass waiting on the operator would lose the session the operator answers into. (A)

### 2. Mechanism and turn boundary
- A new self-detaching helper runs on A's own pane. It stops A's foreground process group, waits for the shell and starts a fresh A in the same pane with a continuation prompt. (A,B)
- Boundary option a: the helper waits for `herdr agent wait` idle or done before it kills. It gives up and logs on blocked or timeout. (A)
- Boundary option b: invoking the helper is old A's final action. All records and text come before it. The helper rechecks A's identity (pane, kind, process group) right before the kill and does not wait on idle. (B)
  - The difference: idle is not a proven turn end for claude (peer-wait.ts:157), and the default wait also accepts `blocked`. Option a can kill during silent thinking, but by then old A has nothing left to do. Option b can cut off the last reply.
- Reuse: B rejected reusing peer-restart because of its old close-and-split behavior (F3). That is outdated. The in-place mechanics (kill the process group, wait for the row to drop, start in the same pane) now match A's need. The remaining differences are self-detach and the new argv. (A, from the live facts above)
- A mode flag on peer-restart: rejected. It would put a second behavior behind a flag. (A)

### 3. What lets the new A continue autopilot
- Only the replacement named by an explicit handover inherits the mode. A new session without one starts attended as it does today. (A,B)
- Record form option a: old A appends a `handover <new agent name>` mode line to each handed chart still open. The new A finds that the latest entry is a handover for its own pane, appends `continue autopilot (handover)` with its session id and continues. SKILL.md:143 gains one clause. (A)
- Record form option b: a one-use structured transfer record (origin pane and session, switch-on reference, exact handed list, next chart, consultant panes, losses, transfer id). The new A claims it once. A later off or changed-list entry supersedes it. (B)
  - The difference: option a reuses the existing per-chart mode record and the pass state already in each CHART.md `## Autopilot`. Option b adds one new artifact but holds the pass state in one place (B Q3).
- Any session inherits the latest `on` entry: rejected. An unrelated later session would silently get autopilot. (A,B)

### 4. Launch form and harnesses
- Do not copy argv as is, because it would carry `--resume`. (A,B)
- Option a: a plain `<kind>` plus the prompt. Settings files still apply, but flags such as `--model` given on the command line are not carried. (A)
- Option b: keep the harness and its launch settings, refuse history argv, and never replay the original prompt. (B)
  - The difference: telling flag values apart from a positional prompt needs per-harness flag knowledge. Option a has no such parsing but changes the launch when the operator used flags.
- The start prompt is an absolute skill and record instruction, not an unproven slash command. (B) A lists the slash-command start as a probe question. (A)
- Proven harnesses: claude only (2026-10-17 probe). Others need their own proof or a stated limit. (A,B)

### 5. Failure
- One bounded attempt with no retries. Validate before the kill and leave old A untouched when validation fails. Bound the shell and start waits. Record the exact failed step. If the start fails, a shell stays visible in the pane. A second A is never spawned. (A,B)
- The outcome goes to a log in the chart folder, which the new A reads. (A)
- A stale or repeated transfer must not launch again. (B)

## Evidence
- SKILL.md:143: a new session id starts attended. (A,B)
- Probe 2026-10-17, slots/probe-log-self.txt: self-detach, kill in 0.5 s, fresh session ran the prompt, pane and layout unchanged, claude only. (A,B)
- Reusing an agent name before its row drops fails with `agent_name_taken` (slots/probe-log-external.txt:6). (A,B) Waiting for the row to drop removes this. (A, live finding in this chart)
- peer-wait.ts:157: claude can show idle during silent thinking. (B)

## Pitfalls
- P1 name reuse: wait for the old row to drop before starting, or use a fresh name. (A,B)
- P2 killing the wrong process: recheck pane, kind and process group right before the kill. (A,B)
- P3 the probe copied into production unchanged: its wait does not stop on failure, and it starts even when the shell poll expires. Use checked steps. (B)
- P4 dropped consultants revived: losses persist across the whole pass, and consultant restart runs only at the new A's chart entry. (A,B)
- P5 usage double count: close the outgoing span before the handover, keep `opened`, and append the new A's seat entry only once its session is visible. (A,B)
- P6 permission: the installed bun invocation must be proven under the real auto mode. The probe used a shell helper. (A,B)
- P7 runaway restarts: at most one handover per chart boundary, bounded by the handed list. (A)
- P8 the footer claims the next session started: print "handed over" wording only at a handover, and keep `Next: none` elsewhere. (B)

## Open questions
- Q1 Is the helper invocation old A's final act (2b), or must a normal final reply come first (2a)? (B)
- Q2 Which A launch forms must this delivery support? (A,B)
- Q3 Where does the pass state live after the replacement: per-chart lines or one transfer record? (B)
- Q4 How is success observed? A new session id is not enough. The new A must be seen starting the next chart with no operator input. (B)
- Q5 Can a bun script detach itself, and does auto mode allow it? (A)

## Off route (A,B)
No supervisor, scheduler or context-size trigger. No change to approvals or the handed list. No support for non-claude A beyond a stated limit. B's "consultant-restart rewrite" off-route item is moot, because the operator asked for that fix directly in this chart and it is done.
