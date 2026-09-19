# Merged round 2026-09-19 (tags: (A) (B) (both))

Q1 who ends the attempt
- (both) akrogon ends it on a blocked event for the currently required unfinished seat only; excludes inactive peers, unknown, merged.
- (B) also a seat-declared stop, since a seat without the ask tool goes idle with a blocker and never emits blocked; without a declared stop the leaf is re-prompted up to the attempts cap, a hidden retry loop. (A) accepts: the seat entry is the existing `akrogon phase <slug> failed` made legal from every active phase with a reason, one commitMove path for both entries, no new command. Recommendation: both, one operation.

Q2 state
- (both) reuse failed with a typed cause (human-blocked vs attempts-exhausted), interrupted phase, seat, explanation; status shows the cause. No needs-operator state.
- (B) stop clears live busy metadata; merged clears too; old merged records rendered terminal-aware; keep pane/tab/worktree for cleanup.

Q3 preserve and recovery
- (both) keep files, uncommitted changes, commits, worktree, interrupted phase, seat, blocker text; no requireClean on the stop; no auto-commit, no cleanup, no answering.
- (both) recovery is explicit operator `akrogon phase` from failed, never automatic on idle.
- (B) the herdr blocked message field must be verified in the pane schema before promising extraction; otherwise record "blocked, no explanation" plainly.

Q4 tool removal
- (A) `pi --exclude-tools request_user_input` exists (`pi --help` 2026-09-19); add it to the pi harness template in akrogon config. Akrogon-launched panes are execution-only; the operator's charting pane is a different process. Zero pi-extensions work. Recommended.
- (B) Pi exposes setActiveTools/getActiveTools (installed extensions.md:1681-1697,1919); a launch flag cannot restore questions if the same session later charts; wants a per-pass context contract with pi-extensions. (A) disagrees: no akrogon seat is ever a charting pane; a per-pass switch is a second mechanism for a case that does not occur. Held for B's rebuttal.
- (both) skills also say never ask in prose, so codex/claude harnesses are covered by the rule plus Q1.
- (both) verify at implement that --exclude-tools also drops the promptGuidelines.

Q5 seat at a human-only blocker
- (both) record the blocker and the exact operator action in the pass artifact, run the stop from Q1, end the pass. Never wait, never ask for a secret.
- (B) planning passes have no report.md; the artifact is the current pass file (plan.md etc.), the stop reason references it.
- (both) implement-issue :39 and plan-issue :55 rewritten to this.

Q6 channel
- (both) Discord through the existing broadcast.discord.webhook_env targets, from the CLI at the transition; herdr notice continues. Operator must explicitly accept that failures go to the completion channel; otherwise a separate alerts list (B option).
- (B) herdr notification has system/terminal modes and reports disabled/rate_limited/no_foreground_client (herdr socket-api.mdx:312-332); the sender is fetch, not curl (skills/broadcast-issue/scripts/discord-send.ts:89-105), and its completion payload shape does not fit a failure. New payload, same transport and env loading.
- (both) missing env is loud; delivery success is not "operator saw it".

Q7 delivery
- (both) persist failed first, send once in the same flow with one bounded retry, record the delivery outcome, failed stays visible on delivery failure. No outbox, no timer.
