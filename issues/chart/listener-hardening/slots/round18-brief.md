# Round 18 (door A): review S1

Review commit a9cac8c4 on branch fix/handover-no-warmup in /tmp/claude-1000/-home-ivan-Work-infra-akrogon/4a3df037-e5ba-4393-85f4-67eb6d4ba7e8/scratchpad/k6 (`git show HEAD`). It is round 17's S1, merged from your three answers:

- Helper: started, wait-turn-end, input-check, reset-keys, start-prompt (enter once if `started` false). Warm-up, code, replySchema, reply wait, code-lookup, differing-path, label stages, `transcriptByCode`, `resetCandidates` deleted.
- SKILL.md:161,163: the helper confirms nothing after the reset; ANY session that gets a start prompt checks before other chart work, re-runs transcript.ts once on `-` or an equal path, then says `handover not continued: <unknown or same> transcript` and stops with the entry unconsumed (B F1, C F5, D A2).
- pi: scripts/transcript.ts asked about its own seat (`address === HC_TERMINAL_ID`) prints and labels `PI_SESSION_FILE`; src/transcript.ts lets a pi label answer over pi's argv path (C edit 2, B's watcher point). Without either one the pi stage case fails.
- Not taken: D's idle wait before the start send (C and B: the warm-up already went in at that moment, 200 ms after the keys, and landed in the new conversation twice live); B's per-tool identity env for claude/codex/agy (the resolver already names their current conversation; the torn-record case is covered by the re-run).

Tests: 10/10 handover cases, full suite 1145 pass / 3 known env fails.

Concrete defects only, file:line: anything S1 still reads from outside after the reset, the pi label rule's edge cases (stale pi label, a non-pi seat, a pi seat without --session-id), whether the skill prose closes the failed-reset case for every harness, and test gaps that matter. Read-only. Write round18-<letter>.md with a verdict. Reply with the path.
