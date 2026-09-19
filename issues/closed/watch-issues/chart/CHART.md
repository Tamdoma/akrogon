# Chart: the lead session watches a run on an interval and moves what stalled

## Destination
An operator in a Claude Code lead session runs `/watch-issues` at the registered root before stepping away. Every 20 minutes the same skill fires: it reads every open leaf and live seat fresh, runs `akrogon next` where a leaf waits for a pass, recovers a failed leaf as long as the move log shows each recovery moved forward, stops and resteers once a seat that loops or works outside its brief and lets akrogon's own pass re-prompt the phase, notifies through herdr on anything it may not act on, and deletes its own job when every open leaf is done or only the operator can move what is left. It never kills an agent process, edits state or worktrees, or opens the env file; one `esc` per looping seat is the operator's chosen exception. One skill folder with one read-only script, no core code.

## Forks taken
- [Watch policy](forks/watch-policy.md): Q1 whole open tree, Q2 20 min, Q3 one skill owning its job, Q4 unlimited judged recovery bounded by the move log, Q5 stop on empty open tree or all human-blocked and notified, Q6 no ledger (operator 2026-09-19).
- [Seat loops](forks/seat-loops.md): loop and off-scope evidence from a pane read for every harness and subagents through the parent; stop and resteer once (`esc`, settled wait, pane read, one corrective prompt), akrogon's own event pass re-prompts the phase; mid-turn steer only when tools are completing; then notify (operator 2026-09-19, explicit exception to the no-kill lock for a confirmed loop).

## Fog
None.

## Off route
- Any akrogon-core detector, timer or poll: ruled out at `../seat-stall-detection/` and `../stall-notifier-removal/`.
- Hung shell commands: pi-extensions leaf `bash-timeout-default` (#23, #24). Undelivered prompts: `issues/open/seat-prompt-delivery`. Env exposure: `issues/open/env-file-rule` and pi-extensions `env-guard-hooks`.
- Seat questions and the #18 artifact copy: gone (b24717e, b35ed04, #18 fixed); no old workaround enters the skill.
- Codex or pi lead sessions: no scheduler exists there; the skill states the Claude Code requirement.

## Territory findings
See `slots/map-merged.md`, `slots/map-rebuttal-B.md`, `slots/final-shape-A.md` and `slots/final-check-B.md`.

Handed off 2026-09-19
