# Opening map brief (chart-issues door, blind)

You are a charting peer for the chart-issues door. Slot letter given in the prompt. Work independently: do not read other slots' map files in /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/door.

Read: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/door/intake.md (the intake).
Live surfaces (inspect as you see fit): /home/ivan/Work/infra/akrogon/src/permit.ts, src/run-check.ts, the seat containment code in src/ (search "slice", "scope", "DBUS"), skills/implement-issue/SKILL.md (esp. line 57 "resolved changed-tests command" and line 27), skills/check-issue/SKILL.md, the pi harness bash tool timeout (~/.pi/agent/extensions), framework issues/config.yaml at /home/ivan/Work/infra/tamdoma/framework, live processes and akrogon.slice.
Existing locks (binding unless the operator reopens them): /home/ivan/Work/infra/akrogon/issues/chart/host-test-load/CHART.md and its forks, especially forks/limit-boundary.md (1b "direct runs bypass, known limit" was foreclosed; revised 1a chosen), forks/ceiling-values.md, forks/queue-order.md, forks/permit-release.md. Also issues/chart/leaf-speed and issues/chart/check-reruns locks.

Task: write a proportional territory map for "patch everything needed" after this report. Cover:
1. Is the report's claim right? What exactly failed: mechanism, design gap, or a seat instruction gap. Cite file:line.
2. The material forks (each with options), what each option could break or invite later, not only now.
3. Practitioner questions and pitfalls over the work's lifetime (cite sources with tier: practitioner / primary docs-code / model-knowledge with searches run).
4. Any other defect visible in the live state (queue of run-check waiters, pi 300 s tool timeout, /tmp log path outside leaf TMPDIR, speed vs the 12-minute baseline, ceiling-values reopen trigger).
5. Proposed destination(s) and split.
Keep it compact notes, not prose. Do not edit any repo file and do not touch running leaves.

Return: write your map to /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/door/map-<your slot letter>.md (e.g. map-B.md). Write nothing else there.
