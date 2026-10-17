# Brief for slot B: focused final-shape check, handover

The operator answered the handover fork. Verbatim, in /home/ivan/Work/infra/akrogon/issues/chart/door-handover/forks/handover.md, after "Operator answer 2026-10-17". Binding: 1a, 2b, 3a, 4b (your pick), 5 = claude, codex and pi.

Check this proposed final shape once. Return only disagreements with evidence, or "No disagreement".

1. Helper `skills/chart-issues/scripts/door-handover.ts <A pane> <A session> <log> <start prompt>`. Old A runs it as its last act, after the `handover` mode lines and its printed lines.
2. Before any stop, the helper does three things. A failure in any of them exits non-zero with old A untouched.
   - It reads `herdr agent list` and requires the pane's agent to be claude, codex or pi with session equal to `<A session>`.
   - It reads `herdr pane process-info --pane` and requires one foreground leader, as peer-restart does.
   - It builds the new argv: the leader argv with the history form removed, plus the start prompt.
3. History removal reuses the per-kind table in peer-restart.ts:50, extended with which tokens take a value:
   - claude: `--continue`, `-c`. `--resume` and `-r` with an optional value (the next token when it does not start with `-`). `--session-id <v>`.
   - codex: the `resume` or `fork` subcommand with its following `--last` or session id.
   - pi: `--continue`, `-c`, `--resume`, `-r`. `--session <v>`, `--session-id <v>`, `--fork <v>`.
   - `--flag=value` forms are removed whole.
4. Leftover check: after removal, any bare word (not starting with `-`) that does not directly follow an option token without `=` means a task or file was given on the command line. That is a refusal before the stop.
   - Stated limit: a task word right after a boolean flag is read as that flag's value, so it is not caught.
5. Then the helper re-spawns itself detached (new session, output to `<log>`), and the parent prints `queued` and exits 0. The detached child:
   - sends SIGTERM to the process group,
   - waits until herdr drops the pane row (bounded, as peer-restart's STOP_TIMEOUT_MS),
   - runs `herdr agent start <agentName(pane, "a")> --kind <kind> --pane <same pane> -- <new argv>`.
   The first failure stops, and every step's outcome goes to `<log>`. No retries.
6. Prose: SKILL.md Autopilot gains the handover step and one clause at SKILL.md:143 (a session started by the handover prompt whose latest mode entry is that `handover <time>` appends `continue autopilot (handover <time>)` and continues; all others start attended). shapes.md mode record lists `handover`. The guide gets one sentence, and the footer says "handover queued", never "handed over".
7. Live proof before handoff, per kind (claude, codex, pi), on a throwaway pane:
   - the agent, launched with a model flag and a history form, runs the helper itself;
   - observe the same pane, a new session, the argv minus history with the flag kept, the start prompt's marker file written, and an unchanged layout;
   - also observe one refusal (session mismatch) leaving the agent untouched.

Read-only. Return path: /home/ivan/Work/infra/akrogon/issues/chart/door-handover/slots/handover-final-check-B.md
