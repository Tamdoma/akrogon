# Merged notes: stall-removal (A, B)

## Q1
- 1a (A,B): `harnessArgv` enforces `permissions.denyInsteadOfPrompting: true` in the claude argv's one settings object. Removes the indefinite subagent wait without approving an uncertain removal; reaches leaf seats and door-created consultants. Cost (A,B): a legitimately needed action that would prompt is denied; the seat rewrites or reports. Side effects (B, confirmed by A from docs): it also leaves out AskUserQuestion, EnterPlanMode and ExitPlanMode, cancels MCP elicitation unless a hook answers, and denies classifier-billing actions. Seats start in bypass mode, never plan mode, so losing the plan tools removes a way to get stuck rather than a needed step (A).
- Rejected (A,B): 1b per-machine and untested; 1c guidance only, misses other causes; 1d admits uncertain targets (signpost 4a).
- Evidence: map-A O1-O6 (A's free stub probes, 2.1.325; B did not repeat them). code.claude.com/docs/en/settings-reference.md "permissions.denyInsteadOfPrompting" and "What else denyInsteadOfPrompting stops" (read 2026-11-16 by A and B): applies to interactive sessions and subagents, needs 2.1.319+, scope user/managed/`--settings`.
- Pitfalls: a second `--settings` drops the env (A,B): removed by Q2. Prove a subagent gets the denial AND a later permitted tool completes (B). Keep version in proofs (A,B). A future Claude Code dropping the key: stated limit (A).

## Q2
- Agreed (A,B): transform the parsed argv, never the template string. Inline JSON in `--settings <v>` or `--settings=<v>`: set the key true, keep every other key including an explicit false being overridden, emit one flag. No flag: add one. Non-JSON value (file path), malformed JSON, non-object: throw a named error at launch naming the harness and operand; no file read, no temp file.
- Differs: several `--settings` flags. A: refuse. B: take the last (matching observed CLI replacement), emit one merged flag, never combine shadowed objects.
- B only: interpret settings only in the option part before a `--` delimiter; insert before it. (A: the task is appended by `startSeat`/`startConsultant` after `harnessArgv`, so harnessArgv's argv holds no task; a template containing `--` is a case to decide.)
- Evidence: src/seat.ts harnessArgv parses the substituted template with shell parse; src/config.ts validates harness lines as strings only.

## Q3
- 3a conditional (A,B): no watch keys for hypothetical classes; prove the classes on harnesses in use; agy excluded (no slot uses it; future adoption needs fresh evidence).
- Inventory (A, B): claude under 1a: no mid-turn prompt class left. codex `-a never` returns failures to the model (`codex --help`). pi: no per-call approval (installed pi docs/security.md, B); only dialog tool `request_user_input` excluded by the machine line (A,B); no extension calls `ui.confirm/select/input` from a running turn (A grep; B: UI calls exist in user commands only).
- B: workspace trust and project MCP approval can still wait (docs "A session can still wait on..."). A checked: all 100 recorded framework seat worktrees in ~/.claude.json have `hasTrustDialogAccepted: true`; framework's `.claude/settings.local.json` sets `enableAllProjectMcpServers: true`; seats start there daily. These are startup dialogs, which the start proof (`firstTask`, src/seat.ts) already reports as a start that never begins work; they are not the reported mid-turn stall.
- Differs: B wants startup classes either removed or given a proven consumer path before #135 closes; A records them as a stated limit with the evidence above.
- 3b (A,B): only for an identified residual eligible class that cannot be removed more simply; none identified.

## Open questions
- B: what exact harness/configuration/startup boundary does the completion claim cover, recorded before closing #135 and #139.
