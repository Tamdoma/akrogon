# Design: pi-exec-tail

## Binding decisions, verbatim

From issues/chart/watch-live-speed/forks/disposition.md `## Taken` (A under autopilot): "6. Second leaf pi-exec-tail: log-tail.ts reads pi exec code's `tools.<name>(` calls (bash command, edit, read, write, ls targets) so the watcher sees pi worker commands. Independent of watch-timer." Correction 1: "Item 6 (B F7): log-tail also reads pi exec outcomes, verified against a captured pi call and result pair; a record with no outcome stays unknown."

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: mechanical parsing with one right answer, proven free under the `test` check with fixtures cut from a real pi transcript (the U1 worker transcript `~/.pi/agent/sessions/--home-ivan-.akrogon-worktrees-akrogon-watch-timer-u1--/2026-11-20T14-25-44-288Z_01a1f959-5760-75b0-ba6d-92fd661f2b43.jsonl` holds 176 exec calls), one deliberate break per criterion. No live session.

## Leaf architecture

Owned surfaces: `skills/watch-issues/scripts/log-tail.ts` (`collectPi`, the exec source scanner, `execBlockStatus`), `skills/watch-issues/scripts/log-tail.test.ts` and its fixtures.

Consumers: the watch-issues skill's Busy rule reads log-tail output; each line keeps today's format, and a multi-call exec gives one line per inner call. Source of truth: `details.traces` for calls with a result (169 of 176 exec results carry them; the result text is only "Script completed" or "Script error", and the source scan disagrees with what ran in 6 of 176, slots/leaf-review-e.md X1); the source scan only for running calls. Evidence for traces: the U1 transcript's exec results carry `message.details.traces` per call; `exec:69` has `tools.edit` in its code, a syntax error and no trace (slots/leaf-review-b.md F7).

Exclusions: no change to claude or codex parsing output, the skill text or observe.ts. Leaf watch-timer also edits `skills/watch-issues/scripts/` but not log-tail.ts.
