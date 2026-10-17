# Restart rule for consultants

## Question
Q1. When does the door restart the named consultants: once per door open, at each chart's start (and again when it resumes a chart it left), or before every exchange?

Q2. How does it restart them, and which panes may it restart: close + split + start for every named consultant (the operator's tested words), end the agent process in place and start it again in the same pane, or only panes the door itself created?

Q3. What happens when a restart step fails, and does the first codex exchange after a start need a provable turn end?

### Carries
- Operator 2026-10-17, verbatim: "I would rather you restarted both panes so close them and then restart them in herder simply because I don't want to send these short messages because they are prone to getting buggy over time."
- Operator 2026-10-17, verbatim: "#99: operator chose restarting consultant panes (herdr pane close + split + agent start) over /clear plus warm-up messages. The restart test result is in the #99 comment."
- Lock: issues/chart/chart-peer-panes/forks/peer-panes.md Taken Q3-A, "the door arranges only panes it creates and never moves supplied or unrelated panes."
- Lock: skills/chart-issues/SKILL.md Autopilot, a dropped consultant is never re-prompted; the door never changes the consultants.
- Related: issues/chart/peer-wait-harness/forks/turn-end-signal.md; sibling chart usage-windows (#100).
- Map: slots/map-merged.md.

## Findings
Blind notes: slots/restart-rule-A.md, -B.md, -C.md; merged: slots/restart-rule-merged.md; rebuttals: slots/restart-rule-rebuttal-B.md, -C.md.

- Q1: all three slots pick restart at chart entry and at re-entry after the consultants worked on another chart, keeping sessions within a chart (A,B,C). "Left" means another chart used the consultants (B,C). One fresh start before a shared opening map (A,B).
- Q2: close + split + start under the operator's words (B,C) vs in-place stop + start in the same pane (A). After A's probe, B and C accept in-place as proven for no-argument and argument launches but hold that it reopens the operator's explicit choice (rebuttals).
- Q3: first codex exchange unchanged (A,B,C). Failed restart under autopilot: drop and continue (A,C) vs stop and ask (B, rebuttal: drop does not resolve a surviving old process or empty pane, and adds a drop condition).
- Research: better-than-training only (local tool and code); no practitioner source applies to herdr pane control. Searches not run: the decision turns on the local CLI and skill.

### Proofs
- operation: `herdr pane close` + `herdr pane split <A pane> --direction right --ratio 0.65` / `<B pane> --direction down --ratio 0.5` + `herdr agent start <name> --kind <kind> --pane <id>`; identity: local operator account, herdr 0.9.1; target: consultant panes w8:pNQ, w8:pPY; date 2026-10-17 ~09:59Z; result: new panes w8:pRX (codex, session none until first turn, adopted by peer-wait), w8:pRY (pi, new session file at start), one peer-ask exchange each `done`, `signal proven`; cleanup: none needed (the new panes are the live consultants); limits: no-argument launches only; record: Tamdoma/akrogon#99 comment.
- operation: argument-preserving restart, `herdr pane process-info --pane <id>` argv[1:] passed after `--` to `herdr agent start`; identity: local operator account, herdr 0.9.1; target: throwaway panes split from w8:pNP; date 2026-10-17 ~10:20Z; result: codex `-c model_reasoning_effort=high` survived close + split + start (w8:pR0 -> w8:pS1, argv identical); pi `--append-system-prompt probe` passed through; cleanup: probe panes closed, absent from `herdr agent list`; limits: argv is passed as an array here; a shell-joined string would split arguments containing spaces; settings changed inside a running agent (for example an in-session model switch) are not in argv and are not preserved.
- operation: in-place restart (alternative, not taken), `kill -TERM <pid from process-info>` then `herdr agent start` in the same pane; identity and version as above; target: throwaway pane w8:pRZ; date 2026-10-17 ~10:14Z; result: shell back in 2 s, codex ready in ~3.4 s on the same pane id, two pi starts gave two new session paths; cleanup: pane closed, no rollout or pi file left; limits: not chosen, kept as evidence.

## Taken
Autopilot pick by A, 2026-10-17 (not operator words; mode record in CHART.md). Matches the round recommendation.

Q1 = 1a. The door restarts every named consultant when it enters a chart, before that chart's first consultant exchange, and again when it re-enters a chart after the consultants worked on another chart. One restart before a shared opening map covers the map. A's own work or compaction alone triggers no restart. Restart only after every prompted turn is collected.
Reason: the growth is across charts; each exchange already travels as a self-contained brief (questions.md:48). Rejected: once per door (keeps the reported growth); before every exchange (drops same-chart context, more launches).

Q2 = 2a, the operator's recipe. For each named consultant still active: read kind from `herdr agent list` and argv from `herdr pane process-info --pane <id>` before closing; close consultant panes in reverse naming order; recreate them with the split sequence the skill already uses for created peers (B right of A at 0.65, each later peer below the previous at 0.5); `herdr agent start <lowercase seat name> --kind <kind> --pane <new id> -- <argv[1:] as an array>`; use the new pane ids for every later brief, wait and seat entry. The operator's 2026-10-17 words authorize this for supplied consultant panes, a narrow exception to peer-panes Q3-A that covers named consultant panes only, never A or unrelated panes.
Reason: the operator chose this mechanism explicitly, and it is proven with and without arguments. Accepted cost: pane ids change on every restart, and a supplied pane that sat elsewhere is recreated next to A. Rejected: in-place stop and start (proven, removes those costs, but reverses the operator's explicit choice; kept as a proven alternative for the operator, B,C rebuttals); only door-created panes (leaves supplied consultants growing).

Q3 = 3a. The first codex exchange after a start keeps today's peer-wait behavior: a return file ends it as done, a missing file waits to budget as unproven. A failed close, split or start ends the turn with the failed command and surviving pane state when attended. Under autopilot it counts like a herdr prompt refusal: that consultant is dropped for the session with the surviving pane state recorded under `consultant:`, never prompted again, and the door continues with the rest. No step is retried automatically.
Reason: a failed restart leaves the door unable to prompt that consultant, the same class as the existing prompt-refusal drop (SKILL.md Autopilot); speed. Standing dissent (B): stop and ask the operator instead, because a drop does not clean up a surviving old process or empty pane and adds a drop condition.

Correction from leaf review, 2026-10-17 (slots/leaf-review-B.md, slots/leaf-review-C.md; both proposed it, so it was recorded without a further final-shape check):
- Q3 failure result: a failed step stops the whole restart; under autopilot only consultants whose fresh start completed stay, and every seat that is closed, failed or still on its pre-restart session is dropped; attended mode stops and reports (B,C).
- Q2 launch: before any close, the command refuses (nothing closed) when a seat's launch is not one unique foreground process-group leader, its argv restores or forks history (codex `resume`/`fork`; pi `--continue`/`-c`, `--resume`/`-r`, `--session`, `--session-id`, `--fork`; claude `--continue`/`-c`, `--resume`/`-r`, `--session-id`), or its agent name is held by a pane outside the restart (B,C).
- Seat letters are explicit input and kept; agent names are unique per door and seat; a codex seat entry is appended once its session appears, never as null (B,C).
