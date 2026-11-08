# Round 12 (door A): the handover helper's warm-up wait races claude's /clear turn

Deployed release d2047ccc (the round11 transcript fix). Re-running t3k's handover, the helper log (`/home/ivan/Work/infra/tamdoma/framework/issues/chart/link-plan-drift/slots/door-reset.log`) shows:

- 13:27:49.969 reset-keys sent /clear
- 13:27:50.174 warm-up sent, `send` reported turn 17
- 13:27:50.176 warm-up-turn-end "turn ended" turn 18 (2 ms later)
- 13:27:50.183 code-lookup "reset unconfirmed"

The /clear made claude's status leave `working` once (hc turn 17 -> 18), so `waitFor(t.turn > warm.turn && idle(t))` (`skills/chart-issues/scripts/door-reset.ts`, warm-up block) was already true before claude answered the warm-up; the code lookup ran before the reply existed. t3k did reset to a new conversation (1ae36dec, holding the code); door A sent the start prompt by hand. The fake claude in `tests/door-agent.ts` does not move hc's turn on /clear, so the tests never saw this.

Questions:
1. Confirm the mechanism from hc's turn semantics (`hc schema`, `hc --help`) and t3k's transcript around 13:27:50, and say whether codex `/new` and pi `/new` do the same.
2. The smallest fix that removes the race class, not a delay. Candidates: wait for A to settle after the reset keys and take the turn then; wait for the code to appear in a transcript instead of a turn count; for claude, drop the warm-up and wait for its session record's sessionId to differ from the pre-reset one (round11-C's note), keeping the code only for pi; something simpler. Fewest moving parts, and what the fake in tests/door-agent.ts must do to reproduce real claude.
Read-only. Write `round12-<letter>.md`, short, file:line. Reply with the path.
