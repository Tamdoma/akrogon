# Opening map brief: slot C

You are slot C, an independent consultant for a chart-issues door. Work blind: do not read any other slot's map file under /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots.

## Task

Write an independent territory map for five akrogon charts (destination repo: /home/ivan/Work/infra/akrogon, current main). For each chart give, grounded in inspected code with file:function or file:line:

1. The mechanism as it really is today (confirm or refute the seed's suspected cause).
2. The material forks: the decisions that change what gets built, each with 2-3 options, what each option could break or invite later (not only now), and your pick with its reason.
3. Practitioner questions a seasoned engineer would ask, and pitfalls over the work's lifetime with what removes each.
4. The smallest set of leaves (default one leaf per chart) and any real dependency between charts.
5. Which outside operations or pre-existing facts a leaf would rely on (commands, hc fields, harness behavior) that need a real observation before handoff.

Charts and their intakes (each INTAKE.md holds the seed verbatim):

- seat-turn-idle: /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/INTAKE.md (Tamdoma/akrogon#157)
- fresh-leaf-base: /home/ivan/Work/infra/akrogon/issues/chart/fresh-leaf-base/INTAKE.md (#156)
- run-check-display: /home/ivan/Work/infra/akrogon/issues/chart/run-check-display/INTAKE.md (#155)
- merge-test-facts: /home/ivan/Work/infra/akrogon/issues/chart/merge-test-facts/INTAKE.md (#154)
- direct-visible: /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/INTAKE.md (#153)

Live surfaces to start from (find others yourself): src/next.ts (dispatchSlot, ensureWorktree), src/hc.ts, src/config.ts (base), src/run-check.ts (constructedEnv), src/verify.ts, src/land.ts, src/phase.ts, src/pack.ts, src/status.ts, skills/chart-issues/assets/direct-route.md, skills/broadcast-issue/SKILL.md, docs/reference-index.md, the hc CLI (`hc --help`, `hc get --json <your own terminal>`; hc 0.1.22), framework records at /home/ivan/Work/infra/tamdoma/framework/issues/verify-runs.jsonl and merge-attempts.jsonl (read only).

## Locks (do not argue against these; chart around them)

- #157 operator decision: /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/seed-decision.md section "## Taken".
- #153 operator decision: /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/forks/seed-decision.md section "## Taken".
- Session signposts: /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/signposts.md section "## Taken" (fix the mechanism itself, free tests at the real boundary, extend existing records only, one leaf per chart, old records keep parsing).

## Rules

- Read only. Change no file except your return file. Run no paid model launch. Do not kill, move or message any terminal except the report step below.
- Reading rule: read process text by named section for the step you answer; locate the section before reading it, batch independent reads, bound output to those sections, and read content you already hold at most once. Unread sections, changed content and content lost to compaction stay readable; the full source is allowed when the source is the subject of the work. Name sections, never line ranges, when citing process text. Code citations use file:function or file:line.
- Be concise: plain words, one fact once. Mark low-confidence claims.

## Return

Write your map to /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots/map-C.md, then run:

hc send t126 "done C: /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots/map-C.md"
