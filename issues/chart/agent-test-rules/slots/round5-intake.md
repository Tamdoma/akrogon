# Round 5 intake (blind; write round5-<slot>.md here, read no other round5-* file)

Chart: /home/ivan/Work/infra/akrogon/issues/chart/agent-test-rules (read CHART.md, forks/test-authority.md, forks/test-change-check.md, forks/outcome-criteria.md, forks/bad-base-test.md).
Current Question: forks/test-change-check.md Q10 and Q11. Constraints: fewest moving parts, works for every registered repo and every write path (apply_patch, scripts, recorders), mechanical check validates presence only (function over form), no fallback heuristics stacked on config. Consider: built-in path rule vs per-repo config key; reason in commit message trailer vs pass file vs a new file; old = existed at AKROGON_BASE and modified or deleted in base...HEAD; how merge (rebase, conflict resolution) and 8a fix-forward commits fit. Inspect src/phase.ts, src/config.ts and skills for file:line.
Output: diagnosis, options per question with one recommendation, pitfalls, under 50 lines.
