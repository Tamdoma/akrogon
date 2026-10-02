# Chart-issues opening map (blind peer): akrogon slow phases

Work blind: do not read other files in this slots folder except this prompt. Ask no questions. Edit no repo file except your output. Do not run anything that changes the repo or other leaves.

Read `issues/chart/akrogon-slow-phases/INTAKE.md`. Locks: `issues/chart/check-reruns/` (handed off 2026-10-01: after implement and repair A runs criterion proof, changed tests and every `checks` command; `merge_checks` only at merge; check-record runner off route), `issues/chart/reviewer-repair/` (B repairs most Fixes itself, in progress).

Task: where does wall time go inside akrogon implement and merge passes, and what would cut it?
1. Measure. `issues/log.jsonl` gives phase entry/exit and the seat session id (Claude sessions live under `~/.claude/projects/<escaped cwd>/<id>.jsonl`; worktrees are `issues/worktrees/<slug>`; codex sessions under `~/.codex/sessions`). From session transcripts, split recent akrogon implement and merge passes (since 2026-09-25) into: test/check command runtime (which commands, how often, how long), subagent/worker time, model time, waiting. Also time `bun test`, `bun run typecheck`, `bun run format` once each on a scratch copy if useful (`akrogon config` checks list). Cite numbers.
2. Material forks for cutting the slow part.
3. Practitioner research where it applies (test-suite speed, agent harness check scheduling). Sources with URLs and dates read.
4. Pitfalls grounded in file:line.
5. Recommended destination in one paragraph.

Write the result to: /home/ivan/Work/infra/akrogon/issues/chart/akrogon-slow-phases/slots/map-B.md
