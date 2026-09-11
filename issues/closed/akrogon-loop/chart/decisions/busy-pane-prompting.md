# Busy Pane Prompting

Chart skill version: 4

Status: resolved
Type: prototype

## Question

Does herdr refuse a prompt to a pane whose agent is still working, and does 'done' mean the assigned work finished?

## Findings

Measured 2026-09-08, herdr 0.9.0, Codex 0.153.4 pane in YOLO mode. Prompt sent 6 seconds into a working turn: exit 0, agent_prompted, status stayed working. Codex took the second message mid-turn, answered it, and the first task's reply never appeared. herdr agent wait returned done while the first task's shell command was still running in a Codex background terminal. Blocked half not measurable: YOLO mode never shows an approval UI. Confirmed by docs research (tier 2, herdr CLI help): the only refusal is `agent_blocked`, an option to refuse when not idle is not documented, and `agent.prompt` with a `wait` object is the one atomic primitive, which waits but does not guard.

## Resolution

Herdr does not refuse prompts to a working pane, it types them in, and the agent may drop the earlier instruction. 'done' means the pane stopped, not that the work finished. The driver must check idle before every prompt and must read completion from the phase, never from the pane state. Forecloses relying on herdr for never-stack.
