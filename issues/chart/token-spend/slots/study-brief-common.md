# Token cut study: shared context

Operator words 2026-10-17, verbatim: "We need to find out how to cut the tokens, because it's spending a lot without changing the process at all."
A's reading: find where the chart-issues door spends tokens and which cuts keep the process the same (same steps, same records, same decisions and quality). Cuts that change what the door does are out of scope; flag them separately if large.

Measured by A (2026-10-17, door session c954dd5e, claude, 1003 assistant calls 07:47-16:49Z):
- A fresh A call starts at about 58k context. A ran at 85k-200k; compaction drops ~200k to 85k-120k.
- Per chart, A made 36-110 calls at 122k-164k average context (issues/closed/usage-windows/usage-spans/implementation/report.md:37-41).
- Every call re-reads the whole context (mostly as cache read), so cost per chart is about calls x average context.

Sources (read-only; use scripts such as python3 or jq on the JSONL, never print whole files):
- A transcript: /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/c954dd5e-b178-44b7-8495-f725d95b59e5.jsonl (assistant `message.usage`, tool_use inputs, tool_result sizes, compaction markers).
- Today's charts and their seats/spans: /home/ivan/Work/infra/akrogon/issues/chart/{jev-classifier,base-red,loop-counts,failed-cause,fresh-consultants,usage-windows,door-handover}/ (seats.yaml has each seat's pane, kind and session; slots/ has briefs and returns).
- Consultant sessions: codex rollouts under ~/.codex/sessions (match session id), pi sessions under ~/.pi/agent/sessions.
- Usage measurement: /home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/chart-usage.ts (run `bun <it> <chart-folder>`).
- The process text the door loads: /home/ivan/.akrogon/releases/25fec20069ad59bbebe7dc36e4ff67e507427eb7/skills/chart-issues/ (SKILL.md, assets/), ~/.claude/CLAUDE.md, ~/.claude/rules/.

Return format, at your return path:
1. Findings F1..: where tokens go, each with a number and its source (path:line, or the script and its output).
2. Cuts C1..: each with the estimated saving (tokens per chart, and %), why the process stays the same, what it could break, and how to verify it.
3. Large cuts that would change the process, listed separately.
4. Inputs read vs skipped, and low-confidence items marked.
Read-only: change no file outside your return path.
