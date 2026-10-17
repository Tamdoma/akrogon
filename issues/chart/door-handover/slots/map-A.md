# Opening map, slot A

## Surfaces
- SKILL.md:143 makes a new A session start attended until the operator says "continue autopilot"; this is the line that blocks an unattended handover.
- SKILL.md:29 peer-restart rule; scripts/peer-restart.ts already derives a relaunch from `herdr pane process-info` (unique foreground leader argv, history tokens refused, peer-restart.ts:44-50,151-161) and starts with `herdr agent start <name> --kind <kind> --pane <id> -- <argv...>` (peer-restart.ts:210-220).
- shapes.md:42,72 mode record shape lists on | off | changed list | continue autopilot.
- docs/guide/chart.md:251-265 Autopilot guide.
- Probe 2026-10-17 (slots/probe-*): a claude ran a self-detaching helper on its own pane; `herdr agent wait` returned at turn end, `kill -TERM -- -<pgid>` gave the shell back in 0.5 s, `herdr agent start <new name> --kind claude --pane <same> -- "<prompt>"` started a fresh session that answered the prompt; pane id and layout unchanged. A reused name fails `agent_name_taken`.
- This A pane runs `claude --resume <id>` (process-info), so a relaunch copying argv would restore history; peer-restart refuses such argv.

## Forks
1. When A hands over.
   - a (pick) when A leaves a chart and the handed list still holds a chart, after every consultant turn is collected and the chart's span is closed. Cost: a single-chart pass never hands over.
   - b also mid-chart (after each fork). Breaks: fork context is in files but the round flow is long; more restarts, more seat entries; larger change.
   - c at every pass end. Breaks: an operator-awaiting pass would lose the session the operator answers into.
2. Mechanism.
   - a (pick) a new script `scripts/door-restart.ts <A pane> "<prompt>"` that detaches itself, waits for A's turn to end, stops A's foreground process group, waits for the shell, and starts `<kind>` in the same pane with the prompt under a fresh name. Plain `<kind>` argv, no copied flags (copying would carry `--resume`). Cost: operator flags like `--model` are not carried; settings files still apply.
   - b extend peer-restart.ts with an A mode. Breaks: peer-restart closes and splits panes; a same-pane mode is a second behavior behind a flag.
3. How the new A knows it may continue.
   - a (pick) old A appends `handover <new agent name>` to the mode record of every handed chart still open; the new A, started with a prompt naming that, finds the latest entry is a handover for its pane, appends `continue autopilot (handover)` with its own session id, and continues the drain. SKILL.md:143 gains one clause. Attended mode never writes a handover line, so it is unchanged.
   - b the new A always continues if the latest entry is `on`. Breaks: an operator opening a fresh door session later would silently get autopilot.
4. Harness scope.
   - a (pick) any kind: the script is kind-agnostic, A writes the prompt in its own harness's skill syntax; proof only for claude, so other kinds are a stated limit.
   - b claude only, other kinds skip the handover.
5. Failure visibility: the detached script cannot report to A. Pick: it appends its outcome lines to a log in the chart folder that the new A reads, and a failed start leaves a shell in the pane the operator sees.

## Practitioner questions
- Does the start prompt really invoke the skill (`/chart-issues ...` as claude's initial argv)? Needs a probe.
- Does auto mode let a fresh A run the restart command without a prompt? The allow rule `Bash(bun /home/ivan/.claude/skills/*/scripts/*)` is unproven in auto mode, where wildcard interpreter rules may be dropped; the probe was approved through a helper path rule.
- Can a bun script detach itself (`setsid -f` from inside the script, or node `spawn` with `detached`)?

## Pitfalls
- P1 agent name reuse: a fresh name per restart (pane plus timestamp) removes it.
- P2 killing the wrong process: kill only the pane's foreground process group read by process-info, refuse when the leader's kind differs from the herdr agent kind.
- P3 turn not ended: `herdr agent wait` returns on idle, done or blocked; the script must only kill on idle or done and give up (logged) on blocked or timeout.
- P4 lost consultant state: consultants restart at chart entry anyway (SKILL.md:29), so the new A needs no consultant handover; dropped consultants stay dropped via `## Autopilot` lines.
- P5 seat record: the new A's session is appended to seats.yaml by the existing rule (SKILL.md:39) on its first chart write; spans close at handoff before the handover.
- P6 permission: the operator adds an allow rule covering the script; human-only prerequisite, already done on this machine.
- P7 runaway restarts: one handover per chart boundary; the mode ends at the last chart, so restarts are bounded by the handed list.

## Off route
- Fixing peer-restart.ts's layout when an unnamed old consultant pane remains beside A (seen at this chart's entry): a separate defect.
- Codex and pi as door A beyond the stated limit.
