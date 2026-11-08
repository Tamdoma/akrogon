# Brief: chart-door-on-hc

## What

The chart-issues door runs on herdr-core:

- the five peer scripts (`peer-create.ts`, `peer-ask.ts`, `peer-wait.ts`, `peer-restart.ts`, `peer-anchor.ts`) and their tests are deleted; consultants are started and restarted through the engine's start verb with `--parent <door>` (restart is `hc kill`, `hc rm`, then the same start under the same name) (C), asked by plain `hc send`, collected by their `<hc>` report from the seat's current address plus the exchange's return file, with one `hc wait --children all` per exchange; the consultant column beside the door, equal heights included, comes from herdr-setup's `herdr-consultant-column` when a consultant is added, removed or restarted (start-and-pane correction, P11) (B,C,E);
- the handover reset (`door-reset.ts`) becomes one small helper on hc: started with `hc run --bg --no-notify --rm`, it follows A's turn end on `hc events`, cancels if the operator submitted input (A's transcript input records per kind, as today; operator 3a), types the reset as keys, sends a warm-up "reply OK <code>", waits for that turn to end, finds the new transcript by the code, requires it to differ from the pre-reset one, writes it to A's transcript label, then sends the start prompt;
- the session-id resolver gains the code lookup used after an in-place reset;
- `chart-usage.ts` reads transcript paths for claude, codex and pi and the new seats.yaml entry shape (E);
- the chart skill text (`SKILL.md`, `assets/questions.md`, `assets/shapes.md`) moves to hc: gate `HC_TERMINAL_ID` set and `hc get` answering ("outside hc"), seats.yaml written at Open with hc address, name, launch recipe and transcript path, supplied consultants never restarted, session wording as transcript paths, the direct-route reviewer B by `hc send` plus report.

Consumes from engine-on-hc (blocked-by): the start verb with `--parent` from the caller's `HC_TERMINAL_ID`, the consultant name `<prefix>-slot-<letter>`, the transcript resolver and the `akrogon.transcript` label, the real-core test fixture and stand-in agent.

## Why

The door's peer scripts and reset helper drive old herdr panes (`herdr agent`, `herdr pane`), which go away. The door must start, ask, collect and reset consultants and itself through hc with `<hc>` messages and events instead of polling (signposts, forks/chart-door.md).

## Done-criteria

1. On a real throwaway core with stand-in children, the exchange wiring works: the start verb starts children of the door, a child's `hc send` report arrives as an `<hc>` message, and `hc wait --children all` returns at once on a report, on a blocked, errored or exited child, and when every child stopped working. Proof: own tests in the `test` check (C).
2. In one attended consultant round in a throwaway session, following the ported skill text, a consultant that stops without its return file gets one nudge naming what is missing, and a second silent stop drops it for the session with harness kind and model recorded. Proof: attended paid run under this leaf's grant, logs kept; it names the live-interaction property (a real door judging a real silent consultant) no stand-in shows (C).
3. On a real throwaway core with a stand-in A, the reset helper's stages run in order (turn end, operator-input check, reset keys, warm-up, warm-up turn end, code lookup, differing path, label write, start prompt), and an operator input record in A's transcript cancels it with nothing more sent; unsubmitted typed text is not seen (operator 3a, stated limit). Proof: own tests in the `test` check.
4. For each of claude, codex and pi, a real A in a throwaway session reset by the helper ends with a new transcript path on its label that differs from the pre-reset one and contains the warm-up code, and fresh A receives the start prompt naming the next chart. Proof: attended paid per-kind tier, logs kept, under this leaf's grant; it names the live-interaction property (keys typed into a live agent producing a new transcript) recordings cannot show (E).
5. `chart-usage.ts` reports the same numbers as today on recorded claude, codex and pi transcripts when given their paths, and reads seats.yaml entries holding address, name, recipe and path. Proof: own test in the `test` check on committed recordings.
6. A Claude door in auto mode with the operator's existing settings runs the start verb without a permission prompt; if it is refused, the leaf stops with the observed refusal as an operator blocker (akrogon never writes Claude settings). Proof: attended paid run under this leaf's grant; it names the live-interaction property (Claude Code's permission decision on a real call) (E).
7. In a throwaway herdr-app session, consultants started by the door sit as children of the door's terminal in the door's tab, unboxed, named `<prefix>-slot-<letter>`; adding or removing one leaves them in one column beside the door at equal heights through `herdr-consultant-column`; restarting one keeps dragged sizes; a supplied consultant is never killed or restarted. Proof: attended window tier with stand-in consultants, artifact in the report.
8. No skill text or script of the chart door names `herdr agent`, `herdr pane`, `HERDR_ENV` or the deleted scripts; the door outside hc says so and continues single slot. Proof: a scoped grep recorded in the report.
9. The leaf's verify `test` duration and today's baseline (median 75 s) are both recorded in the implementation report; a rise of more than about 10 s is explained there, and every old test this leaf replaces is named.
