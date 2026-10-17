# chart-usage fixtures

Captured transcripts were produced 2026-10-06 by claude 2.1.291 and codex-cli 0.160.1,
then scrubbed: every message/tool body was replaced with the sentinel string
USAGE_LEAK_MARKER so tests can assert nothing leaks into output.

- claude/claude-A.jsonl - real seat-A claude session (trimmed; usage fields intact)
- claude/claude-A2.jsonl - hand-written second session for seat A (ended, cost-state)
- claude/claude-ops.jsonl - hand-written operator-turn edges (meta/tool_result/sidechain/unfinished)
- claude/claude-broken.jsonl - hand-written assistant record missing message.usage
- codex/rollout-B.jsonl - real seat-B codex rollout (trimmed; cumulative counters intact)
- codex/codex-diff.jsonl - hand-written cumulative counters straddling the window
- codex/codex-reset.jsonl - hand-written cumulative counter decrease (seat must be unmeasured)
- claude/claude-spans.jsonl - hand-written message.id groups straddling span edges and gaps
- codex/rollout-tur.jsonl - hand-written rollout with token_usage_record and a compacted embedded copy
- pi/pi-A.jsonl - hand-written pi session: assistant calls, one compaction call, zero/nonzero-error edge, gap records
- pi/pi-zero.jsonl - hand-written pi session whose only assistant is a zero-usage error (zero calls)
- pi/pi-nousage.jsonl - hand-written pi session with an assistant message missing usage (unmeasured)
