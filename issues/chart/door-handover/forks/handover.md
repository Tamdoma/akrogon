# Door A handover

## Question
- Q1 When does A hand itself over? Options: only at the switch to the next runnable handed chart, after the outgoing span is closed and every consultant return is collected. Or also mid-chart, at every chart entry, or at every pass end.
- Q2 What marks the moment old A gives up its process? Options: (a) the helper waits for herdr to show A idle or done before it kills. (b) Running the helper is old A's last act, so all records and printed lines come before it and the helper kills right away.
- Q3 How does the fresh A know it may continue without the operator? Options: (a) old A appends a `handover <time>` mode line to each handed chart still open. The fresh A's start prompt names that time, and the fresh A continues only when the latest mode entry is that handover, appending `continue autopilot (handover <time>)`. (b) A separate one-use transfer record holds the pass state and a transfer id, and the fresh A claims it once.
- Q4 What command line starts the fresh A? Options: (a) the plain harness kind plus a start prompt with an absolute instruction (skill path, registered root, handover time). (b) Copy A's launch flags with the history flags removed, plus the prompt.
- Q5 Which harnesses get the handover? Options: (a) claude only. Any other kind keeps today's behavior and continues in its same session. (b) Every kind, each proven live before handoff.

### Carries
- Operator switch-on words (INTAKE.md): "The next session should start unattended, so the self-handover needs to be changed. Keep in mind, every change needs to be minimal, and the entire system has to be taken into context without breaking anything. The manual mode still has to work the same."
- Locks: pane structure unchanged. Attended mode unchanged. SKILL.md:143 rule for unrelated new sessions stays.
- Opening map: slots/map-merged.md, slots/map-rebuttal-B.md.
- Live surface: the working-tree skills/chart-issues/scripts/peer-restart.ts (in-place restart: SIGTERM to the process group, wait until herdr drops the pane row, start in the same pane under the same name).

## Findings
- Merged notes: slots/handover-merged.md. B's blind notes: slots/handover-B.md. Rebuttal: slots/handover-rebuttal-B.md.
- Agreed (A,B): Q1 next-runnable-chart switch only, Q2b, Q5a.
- B rebuttal F1: name the sources of the full handed list and the losses. Resolved by having the handover line carry the remaining handed list and surviving consultants, in the same shape as the `on` line.
- B rebuttal F2: add a launch-side stale check. Resolved by the helper taking the calling session id and refusing unless the pane's current claude session matches it, before any kill.
- B rebuttal F3: settings equivalence. Resolved by choosing settings defaults explicitly as scope: the fresh A runs on the operator's settings files, and in-session changes and extra flags are not carried. The proof observes the model and permission mode.
- `claude --help` 2.1.302 (2026-10-17): history forms are `--resume [value]`, `-r [value]`, `--continue`, `-c`.
- This door's A argv: `claude --resume b961e376-2c8a-47da-8fcc-2de88d7b3ed4` (`herdr pane process-info --pane w8:pNP`, 2026-10-17).
- B final-shape check (slots/handover-final-check-B.md), points against 4b:
  - F4: the leftover-word check misses `pi -a "task"` and wrongly refuses `claude --allowedTools Read Edit`.
  - F5: the history table misses claude `--from-pr` and `--teleport`, and codex `resume [OPTIONS] [SESSION_ID] [PROMPT]`.
  - F2: recheck the target in the detached child right before the destructive step.
  - F6: the proof must show continuation, not just the prompt running.
- In-place reset probe, 2026-10-17, throwaway tab w8:tDH (panes w8:pSX claude `--model claude-haiku-5-5`, w8:pSY codex `-c model_reasoning_effort=low`, w8:pSZ pi `--thinking low`; claude 2.1.302, codex-cli 0.163.0, pi 1.3.0, herdr 0.9.1), via `herdr agent prompt <pane> /clear` (claude) or `/new` (codex, pi):
  - Idle agent: the same process (claude pid and argv unchanged) started a new conversation. herdr showed a new session at once for claude and pi, and for codex after the next exchange. Asked afterwards for a code word given before the reset, all three answered NONE.
  - Busy agent (reset sent during `sleep 20`): pi reset correctly (NONE). Claude ran the queued prompt before `/clear` (LION). Codex refused with "'/new' is disabled while a task is in progress" (LION). So the reset must be sent only after the agent's turn has ended.
  - Cleanup: the tab was closed, the agent list held no row for those panes, and the scratch folder was removed.
  - Limits: probed with a short context and a prompt-driven reset from outside the agent, not yet self-triggered by a door A.
- Self-triggered reset probe, 2026-10-17, throwaway tab w8:tDJ (w8:pS0 claude `--model claude-haiku-5-5`, w8:pT1 codex `-c model_reasoning_effort=low`, w8:pT2 pi `--thinking low`; same versions as above). Prototype and logs are in slots/reset-probe/. Each agent was told a code word, then ran the prototype itself through the wrapper at $CLAUDE_JOB_DIR/tmp/handover/handover.sh (claude under auto mode via the temporary allow rule). The prototype checked the session, detached, waited for the proven turn end (claude transcript `turn_duration`, codex rollout `task_complete` of the last `task_started`, pi hook authority idle or done), rechecked the session, sent the reset, then sent the start prompt:
  - claude: turn end seen 2 s after the child started. The new session appeared 0.5 s after `/clear`. Start prompt answer: NONE. Same process (pid 439118, argv `--model claude-haiku-5-5`).
  - pi: same timeline. New session file. Answer: NONE.
  - codex: turn end seen and `/new` accepted. The screen showed a fresh session (Context 0%), but herdr kept the old session id. A codex account notice ("Set up security for Daybreak mode") then swallowed the start prompt, even though `herdr agent prompt` exited 0. After esc and a resend with `--wait --until working --timeout 5000` the answer was NONE, and herdr showed a new session after that exchange.
  - Refusal: a run with a wrong session id exited 1 with "refused", wrote no log and left the agent untouched.
  - Cleanup: the tab was closed and no agent row was left.
  - Limits: the wrapper path stood in for the installed `bun <skill-folder>/scripts/...` path. Continuation under 3a needs the new skill text, so it is a leaf done-criterion (B F6).
- Design consequences:
  - Codex shows its new session only after the first exchange, so for codex the reset is confirmed after the start prompt by a session change. An unchanged session means the old context ran the prompt, which is logged.
  - The start prompt is sent with `--wait --until working --timeout 5000`, so a swallowed prompt (`agent_prompt_stalled`) is logged as a failure instead of passing silently.

## Taken
A's pick under autopilot, 2026-10-17, not operator words: `1a 2b 3a 4c 5a`.
- 1a. Hand over only when switching to the next runnable handed chart, after the outgoing chart's records are written, every consultant return is collected and its span is closed. The fresh A enters that chart directly and does not hand over on entry. Rejected: mid-chart, every entry, every pass end.
- 2b. Running the helper is old A's last act, after all records and printed lines. Before any kill the helper checks that the pane's herdr agent is claude, that its session equals the calling session id and that the foreground argv passes 4c. On any mismatch it refuses with old A untouched. It then detaches, stops A's process group, waits until herdr drops the pane row (bounded), and starts `claude` in the same pane under the derived name with the start prompt. The first failure stops, and every outcome line goes to the log the handover line names. Rejected: 2a, because idle does not prove the turn ended (peer-wait.ts:157).
- 3a. Old A appends `handover <time> <log>: handed <remaining list>; consultants <surviving>` to the mode record of every handed chart still open. The start prompt names the pane, the time, the next item and the absolute skill path. A session in that pane whose latest mode entry is that handover appends `continue autopilot (handover <time>)` and continues as after the operator's words. Every other new session starts attended as today. Rejected: 3b, a second store of pass state. Rejected: inheriting the latest `on`.
- 4c. Launch plain `claude <start prompt>`, and hand over only when A's argv after the binary is empty or exactly one history form. Otherwise refuse, and A continues in its same session. The fresh A runs on the settings defaults, and extra flags and in-session changes are not carried. This limit is stated in the skill and guide. Rejected: 4a (silent flag loss), 4b (flag parser).
- 5a. Claude only. Other kinds keep today's same-session behavior, and the limit is stated. Rejected: 5b.
- Standing consultant dissent: B preferred 4b, keeping flags. B accepts 3a if it names its sources for the list and losses, which the handover line now does.

Operator answer 2026-10-17 (door pane), verbatim: "1a 2b | 3a - Are you sure this is gonna be valid 100 percent of the time? Do we need something deterministic or not? You tell me and challenge me | 4c | 5 - I don't want to limit myself to only one slot A harness or model, so presume and fix it so it works for any harness and any model. I'm mostly using Claude, Codex and Pi like I'm using now. So maybe focus on these thee only for now. |", then after A's challenge (4c blocks model flags on codex and pi), verbatim: "4b |".
- Binding, replacing A's autopilot pick: 1a, 2b, 3a, 4b, 5 = claude, codex and pi.
- 3a reason given to the operator: every exact step (which process, which pane, one launch, the handover time) is code in the helper; the fresh A's only judgment is reading the line, and a misread falls back to today's attended start, so no checker script is added.
- 4b shape: the fresh A gets A's own foreground argv with the history form removed (per-kind table already in peer-restart.ts:50) plus the start prompt; model, effort and other flags carry. A leftover task word on the command line makes the helper refuse before the kill, and A continues in its same session.
- 5: claude, codex and pi, each proven live with a real handover before handoff. Other kinds keep today's same-session behavior.

Operator answer 2026-10-17 (door pane), after A's report of B's F4/F5 and the in-place reset probe, verbatim: "reset".
- Binding, replacing 2b and 4b: no process stop and no relaunch. The helper waits for A's proven turn end, rechecks the pane's session, sends the kind's new-conversation command (`/clear` for claude, `/new` for codex and pi) through herdr, confirms a new conversation, then sends the start prompt. Old A ends its turn normally. 1a, 3a and 5 (claude, codex, pi) stand. A reset that is not confirmed is logged, and no start prompt is sent.
- Leaf review by B (slots/leaf-review-B.md), applied to slots/leaf-draft/ with (A,B) tags:
  - F7: codex now gets one harmless check prompt to expose its new session before the start prompt, keeping "no start prompt when unconfirmed".
  - F1: old A creates the next chart's folder when absent, and the `handover` line goes there too.
