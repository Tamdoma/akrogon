# Round 14 (door A): slot A must work with any harness, and the launch line creates no folder

Operator: "I don't want anything to be hardcoded to a specific agent. Slot A (in chart-issues) can be anything, not just claude code." Also: no folders created that did not exist.

## Q1: review commit ab97c2ed

Branch fix/handover-log in /tmp/claude-1000/-home-ivan-Work-infra-akrogon/4a3df037-e5ba-4393-85f4-67eb6d4ba7e8/scratchpad/k5 (`git show HEAD`). Drops `mkdir -p` from the launch line (SKILL.md:159, door-reset.ts:3, the test) and names the log `door-reset.log` in the next chart's folder, which old A creates before the handover (SKILL.md:159). Concrete defects only: any handover path (attended, autopilot SKILL.md:151, shapes.md:53-54) where that folder may not exist yet, or another place that still creates folders.

## Q2: harness-specific code in the handover

Facts so far:
- door-reset.ts: `Kind = claude|codex|pi` (:15); reset keys per kind (SKILL.md:161: /clear vs /new); inputSchema and replySchema per kind; an unknown kind stops at `started: unsupported harness` (:91).
- src/transcript.ts: per-kind lookup (claude session record, codex open rollout, pi --session-id, agy db) and `transcriptKind` (:226) returns only claude|codex|pi.
- The herdr-era helper (`git show af28d63e^:skills/chart-issues/scripts/door-reset.ts`:26-27,37-60,108-112) had the same per-kind tables. The one neutral part was the session id, which herdr got from each harness's own hook or integration (`agent_session`).

Answer: (a) list every harness-specific piece on the handover path with file:line, and say for each whether it is unavoidable (the reset command and transcript format really differ per harness) or removable; (b) what happens today if slot A is agy, or a harness akrogon has never seen; (c) the smallest design that lets slot A be any harness: e.g. all per-harness facts in one table so adding a harness is one entry, a neutral warm-up proof that needs no transcript parsing (hc screen? status?), or the identity moving into hc (O3); say what each costs and what it removes. Prefer fewer parts. Read-only. Write round14-<letter>.md with file:line. Reply with the path.

## Operator decision (added after sending)

"If it was hardcoded, that's fine, as long as all of them were included. The only thing you need to add is agy as well." So keep the per-harness tables. Drop the neutral-proof and hc options from Q2(c). Instead, answer for agy (antigravity-cli 1.5.3, `~/.local/share/mise/installs/antigravity-cli/latest/agy`), from its binary, docs and data on disk, read-only, with no live agy reset:
- the reset command that starts a fresh conversation in place (like /clear, /new), and whether it runs as a status turn;
- where one conversation's prompts and replies are stored: akrogon only knows `conversation_summaries.db` (src/transcript.ts:155), a shared database, not a per-conversation file. Give the table, columns and the query that finds the conversation holding a code, plus its user-prompt record (operator input check) and assistant-reply record (warm-up proof);
- what the transcript path and `akrogon.transcript` label should name for agy, and every consumer (log, timing, observe, log-tail, usage) that assumes a JSONL file;
- the smallest change set to add agy to door-reset and src/transcript.ts, with file:line.
