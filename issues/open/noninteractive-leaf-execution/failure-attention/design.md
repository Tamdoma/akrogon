# Design: failure-attention

## Binding decisions, verbatim

### forks/push-notification.md
2026-09-19 operator: "2a" on the reshaped Q1 (originally Q6), after "No webhooks and no  external programs like Discord". At the failed transition akrogon runs `herdr notification show "<leaf> failed" --body "<cause>: <text>" --sound request` and records the returned reason as the delivery outcome, then `herdr tab rename <state.tab> "<slug> failed"`, renamed back to `<slug>` on the next phase move. Operator step: `[ui.toast] delivery = "system"` in ~/.config/herdr/config.toml. Q2 "7a": once, one bounded retry, outcome recorded, failed visible regardless. Foreclosed: Discord, any webhook, any external program, a workspace token, an outbox. Accepted limitation: herdr cannot reach the operator off-device; system delivery is best effort and needs a foreground attached client.

### forks/blocked-ends-attempt.md
2026-09-19 operator: "1a | 2a | 3a". Q2: reuse `failed` with a typed cause (`blocked` | `attempts`), interrupted phase, seat and text; status shows the cause; stop and merge clear live busy fields and keep pane, tab, worktree. (Owned by failed-with-cause; this leaf reads `failure` and `tab`.) Q1 and Q3: excluded here, owned by failed-with-cause. Correction 2026-09-19 after Tamdoma/akrogon#21, verbatim: "The herdr blocked cannot work like this. The child asking the parent is not a blocking event." No event-driven stop exists; this leaf reacts only to the `failed` transition.

### forks/ask-tool-availability.md
2026-09-19 operator: "4a" and "1a": excluded here, owned by the operator config step, failed-with-cause and skills-never-ask.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: no secrets, no external services. The herdr fake in tests covers the error path. Warnings log dynamic values as structured fields.

## Leaf architecture
Owned: src/phase.ts `commitMove` (after `saveState` for a move to `failed`: notification, persist `failure.delivery` immediately, then rename when `state.tab` is set (B) F9; on a move out of `failed`: rename back to `<slug>`; any final herdr failure is raised after state is persisted and both calls were attempted, so the command exits non-zero with the last herdr error (B) final check F2), src/next.ts (remove the "Failed leaf" `herdr notification show` block and `failed_notified` handling), src/state.ts (remove `failed_notified` from the schema and add it to the legacy keys `readState` strips (B) F8), tests including a legacy-shaped state.
Interfaces: `herdr(['notification', 'show', title, '--body', body, '--sound', 'request'], z.object({ shown: z.boolean(), reason: z.string() }))` and `herdr(['tab', 'rename', tab, label], z.object({ tab: z.object({ label: z.string() }) }))`, since the helper in src/shell.ts:93-101 already unwraps `result` (B) F7; the CLI envelope measured on 2026-09-19 (chart forks/push-notification.md, Measurements) is the transport shape. `failure.delivery` is one of the five herdr reasons or `error`. Retry reuses the existing retryable herdr error check in src/next.ts, moved to a shared module if phase.ts needs it.
Exclusions: toast configuration is an operator step (`[ui.toast] delivery = "system"` in ~/.config/herdr/config.toml); no workspace tokens; no webhook.
Dependencies: failed-with-cause.
