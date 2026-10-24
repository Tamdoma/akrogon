# Operation proofs

## Question

Q1. Does the operator approve real herdr calls, including one pi agent start and prompt, in a throwaway workspace in the personal session, to prove `--session` routing before handoff?

### Carries

- Leaf split taken 2026-10-24 (three leaves). Leaf seats make no real herdr calls; their tests use tests/fake-herdr.ts.

## Findings

Log: [slots/operation-proofs.log](../slots/operation-proofs.log). Date 2026-10-24, herdr 0.9.1, identity: operator's local user ivan, no credential. Inherited HERDR_SOCKET_PATH was set to the infra socket for every call. Target: throwaway workspace `akrogon-proof` (w4) in session personal, cwd under A's scratchpad.

- P1 `herdr session list --json`: exit 0, five sessions with name, running, socket_path, session_dir, default. Read only.
- P2 `herdr --session personal workspace list | tab list | pane list | pane get w4:p2`: exit 0, personal's rows returned despite infra socket. Read only.
- P3 `herdr --session personal workspace create --label akrogon-proof --cwd <dir> --no-focus`: fixture create only, never used by akrogon (session-address: never create a workspace).
- P4 `herdr --session personal tab create --workspace w4 --cwd <dir>/wt --label proof-tab --no-focus`: exit 0, root pane cwd equals <dir>/wt. This is the worktree-cwd property.
- P5 `pane split w4:p2 --direction right --cwd <dir>/wt`, `pane swap --source-pane w4:p2 --target-pane w4:p3`, `tab focus w4:t2`, `tab rename w4:t2 proof-renamed`, `pane process-info --pane w4:p2`, `notification show "akrogon proof" --body ...`: all exit 0 under `--session personal`.
- P6 `agent start akrogon-proof --kind pi --pane w4:p3 --timeout 60000`, `agent prompt w4:p3 "reply ok" --wait --until working --timeout 15000`, `agent wait`, `agent list`, `agent read`: all exit 0. The agent replied "ok", and `agent list` showed it in workspace w4 of personal. Paid model use was one short pi turn.
- P7 cleanup `pane close w4:p3`, `tab close w4:t2`, `workspace close w4`: exit 0. Absence read-back: no `akrogon-proof` workspace or agent in personal or infra.
- Collision context: ids are per server. infra has no w4, but personal created w4 while infra holds w8 and others.
- Limits: this does not prove behavior when a session stops mid-pass (covered by stopped-and-ambiguous rules and fake tests), nor reconcile's or next's own code paths, which the leaves prove with the fake. The pi session log file under ~/.pi/agent/sessions for the proof cwd was kept.

## Taken

Operator 2026-10-24, verbatim: "1a"

All proposed calls were approved and run as above. Foreclosed: skipping the agent proofs (1b) and holding the handoff (1c).
