# Rebuttal: herdr-skill (Seat E)

## Q3. Why B's four per-harness startup hooks should be rejected

- **Signpost 5a and the 2026-11-06 direction ("the goal is not to invent new stuff... least amount of things can break") foreclose building four separate startup hooks/extensions** (Claude `SessionStart`, Codex hook, Pi extension, `agy` `hooks.json`). Every harness already injects skill descriptions into every session's system prompt, `hc` already injects `reach="hc send <t> when done or stuck"` on `<hc>` messages, and akrogon's briefs/tasks already include their explicit `hc send` / `akrogon` commands.

## Open ask: `HC_TERMINAL_ID` gate vs offline customization (`AGENTS.md`)

- Stopping live `hc` and `herdr-app do` control commands when `HC_TERMINAL_ID` is unset is right, but the gate should still allow reading `${HERDR_APP_HOME:-$HOME/.config/herdr-app}/AGENTS.md` and `herdr-app commands` when the user explicitly asks to edit `herdr-app` layouts, keys, or mods from outside `hc` (for example in `herdr-setup`).
