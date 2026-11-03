# Needs-you parser fixtures

Real `hc read <t> --lines 0` screens, recorded 2026-11-03 (hc 0.1.17) in throwaway herdr-app sessions; re-record, never hand-edit.

- `round-<harness>.txt`: a finished decision round with coded options and a reply line, one per harness (Claude Code 2.1.317 on haiku, Codex 0.166.0, Pi 1.5.0, Antigravity 1.4.12, default models). Prompt: "Do not use any tools. Reply with only this decision round, formatted as you normally format markdown: question 1 "Color" with options 1a Red (recommended) and 1b Blue; question 2 "Size" with options 2a Small and 2b Large (recommended); then the final line: Reply `1a 2b`, or change either." Each screen also shows the echoed prompt, which must not produce buttons on its own. Rendered screens drop the backticks.
- `none-*.txt`: screens that must produce no buttons: each harness's folder-trust prompt (numbered menu items), code-bearing replies with "1a"/"2b" in a code block and a table, and idle consultant screens.

Status seen while recording: Claude Code's and Codex's trust prompts reported no status (not `blocked`); Antigravity's reported `blocked`, `kind: permission`; after answering, Antigravity reported `idle` where the others reported `done`.
