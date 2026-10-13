# Fork notes brief 2, slot C: limit-boundary (reshaped by measurement)

You are slot C. Blind notes again for the same fork, now reshaped. Do not read limit-boundary-2-A.md or the other peer's limit-boundary-2 file. Read only. No test runs, no transient units, no Chrome launches.

Note format: "Blind peer exchange" in /home/ivan/.claude/skills/chart-issues/assets/questions.md (five parts).

Read: /home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/limit-boundary.md in full, especially "Measurement 2026-10-13" and "Chrome self-scoping mechanism". Operator answers so far (verbatim): "1 - I'm leanign towards a, but how much will this slow everything down?" then "1a" to "measure one full run before deciding" then, after the crash report, "ok, let's continue".
Also: learnings/history/2026-10-13-chrome-escapes-cgroup.md, src/run-check.ts:41-56 (constructedEnv), framework issues/config.yaml pass_env.

New facts to weigh:
1. Test Chrome escapes any caller cgroup unless the session bus is unreachable (or SNAP/FLATPAK_SANDBOX_DIR set).
2. A TasksMax at 3000 crashed one suite; one run alone exceeds 3000 tasks, ~230 Chrome processes, ~14 GB in 2 minutes.

Question to give notes on: Is 1a (permit in run-check/base-run plus containment of every seat) still the right boundary, and if so what must change: how the session bus is cut for contained work (seat env, run env, or both; does any seat or test need the bus), what kind of ceiling is safe (hard caps vs CPUWeight/MemoryHigh style soft pressure vs none), or does an option not in the fork now win (for example containing only runs, or a browser-level limit)?

Return path, write only when finished: /home/ivan/Work/infra/akrogon/issues/chart/host-test-load/slots/limit-boundary-2-C.md
