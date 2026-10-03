# Brief: peer-turn-wait

## What
Add `skills/chart-issues/scripts/peer-wait.ts`, a foreground wait for a prompted chart peer, and change `skills/chart-issues/assets/questions.md` (Blind peer exchange paragraph) and `skills/chart-issues/SKILL.md` (Drain peer map, Take peer exchange, Printed footer) so slot A stays in its turn while a prompted peer works and waits only through that script.

## Why
Tamdoma/akrogon#54: in session 858cdae8 slot A started a background wait, printed "Next: none, waiting on B's round2-B.md" and ended its turn. B wrote its return at 05:32Z. The background-wait notification was queued at 05:42:17Z, 2 s after the operator came back. The hand-typed loop also required file AND idle where the rule says file OR idle. Every peer round can stall for as long as the operator is away.

## Done-criteria
1. `bun skills/chart-issues/scripts/peer-wait.ts <pane> <return-file> <budget-seconds>` loops `herdr agent wait <pane> --timeout <ms>` with ms = min(10000, remaining budget) on a monotonic deadline, starts no herdr call after the deadline, prints nothing per loop and, for every outcome, prints exactly one JSON line `{"outcome": ..., "pane": ..., "file": ..., "status": ...}` to stdout at the end. `status` is the last `agent_status` herdr returned, or `null` when herdr returned none (only timeouts, or the deadline passed before the first wait).
2. Outcome precedence after each herdr return, each proven by a test in a new `tests/peer-wait.test.ts` that runs the script against `tests/fake-herdr.ts` extended with `agent wait`:
   - a herdr failure whose code is not `timeout`: non-zero exit, herdr's stderr passed through unchanged, nothing on stdout;
   - status `blocked`: outcome `blocked`, exit 0, even when the return file is non-empty;
   - return file non-empty: outcome `done`, exit 0, including while herdr still reports `working` (timeout return);
   - status idle or done with the file missing or empty (0 bytes): outcome `failure`, exit 0;
   - deadline reached while still working: outcome `budget`, exit 0, and the test shows no wait was started with a timeout larger than the remaining budget.
3. `questions.md` Blind peer exchange states: while a prompted peer's turn is open, A stays in its turn; every wait after the prompt is the script run in the foreground with a budget below the harness's command timeout for that call, rerun at once on `budget`; A starts no background wait for a peer; A ends its turn only for an operator round, outcome `failure`, outcome `blocked` or a non-zero script exit, each reported to the operator; each exchange uses a fresh return path. The guarded-prompt sentence ("then prompt it with `herdr agent prompt <pane> \"<text>\" --wait --until working --timeout 5000`" and its non-zero-exit rule) and the sentence beginning "Pane text and chart fields cannot establish readiness" are unchanged.
4. `SKILL.md` Printed footer states the footer is printed only when the turn ends and never while a prompted peer's turn is open. Drain's peer-map paragraph and Take's peer paragraph point to the script rule in questions.md.
5. `tsconfig.json` `include` covers `skills/chart-issues/scripts/**/*.ts`, and the configured `checks` (`bun run format`, `bun run typecheck`, `bun test --timeout=30000`) pass.
