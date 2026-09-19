# Where a failure notification goes

## Question

### Q1 · Which channel pushes a failed leaf to you: the existing broadcast Discord webhooks, a separate alerts webhook list, or herdr only?
### Q2 · Is the push sent once on the event with a bounded retry, or does it need to survive a crash between send and record?

### Carries
- Lock: no clocks or polls, so no outbox that needs a timer.
- Related: `blocked-ends-attempt.md`.

## Findings
- (both) Every alert is `herdr notification show` (src/next.ts:199, 477), in-app only. The operator did not see it overnight.
- (A) Transport exists: broadcast.discord.webhook_env (src/config.ts:46), env in ~/.config/akrogon/env, curl in skills/broadcast-issue. (B) Its contract is team completion broadcasts, not private failures; the target must be chosen explicitly. Not every repo configures broadcast, so herdr stays the floor.
- (both) Missing env must be loud (lesson 2026-09-14 env-grep-digit). A 200 from the webhook does not prove the operator saw it.
- (B) Notification must be invoked by the CLI at the transition, never by the blocked model calling a skill. Failure stays visible in status even if the push fails.

- Operator 2026-09-19 verbatim: "6 - No webhooks and no  external programs like Discord. Come up with a more elegant solution inside of Herdr". Q1 reshaped below; Discord and any webhook foreclosed.
- Q2 taken 2026-09-19 "7a": send once at the transition, one bounded retry, record the delivery outcome, failed stays visible regardless. Foreclosed: an outbox.
- (A, herdr docs read 2026-09-19) `herdr notification show <title> --body --sound request` uses `[ui.toast] delivery` = herdr | terminal | system | off (cli-reference.mdx:99-102, configuration.mdx:364-372); the response reports shown | disabled | rate_limited | no_foreground_client | busy (socket-api.mdx:326-332). ~/.config/herdr/config.toml sets no `ui.toast`, so overnight delivery was the in-app default.
- (A) `herdr workspace report-metadata <ws> --source akrogon --token <name>=<value>` persists a Space-row token until replaced or cleared, no TTL required (cli-reference.mdx:123, 258-283). Tokens are visual only.

## Question (reshaped 2026-09-19)
### Q1 · Inside herdr only: at the failed transition akrogon shows a notification with the needs-attention sound and records the delivery reason, and sets a persistent workspace token so the Space row reads the failure until it is cleared; the operator sets `ui.toast.delivery = "system"` so notifications reach the OS notification centre. Is that the contract?

### Q1 reshaped again after B's focused check (slots/final-check-B.md, 2026-09-19)
- (B) A workspace token needs a Space-row layout change to be visible (herdr configuration.mdx:291-300, 335-353), is a latest-wins patch not a collection (socket-api.mdx:725-741), does not survive a server restart (:739), and leaf state records `tab`, not workspace (src/shell.ts:85). Dropped.
- (A) Replacement: `herdr tab rename <state.tab> "<slug> failed"`, renamed back to `<slug>` on the next phase move. One tab per leaf, already labeled with the slug by allocate (src/next.ts:311-316), `herdr tab rename` exists (CLI 2026-09-19), no layout change, nothing to reconstruct.
- (B) System delivery is best effort through the foreground attached client and can return `no_foreground_client` (socket-api.mdx:323-332). Herdr has no off-device push. The contract requests system delivery and records the actual reason; it does not promise the operator was reached away from the machine.

## Taken
2026-09-19 operator: "2a" on the reshaped Q1 (originally Q6), after "No webhooks and no  external programs like Discord". At the failed transition akrogon runs `herdr notification show "<leaf> failed" --body "<cause>: <text>" --sound request` and records the returned reason as the delivery outcome, then `herdr tab rename <state.tab> "<slug> failed"`, renamed back to `<slug>` on the next phase move. Toast delivery stays at the herdr default; the operator withdrew `[ui.toast] delivery = "system"` on 2026-09-19 because herdr 0.9.1 has one global delivery and no per-notification override, so `system` routed every herdr toast to the Omarchy shell (configuration.mdx:364-374, socket-api.mdx:314-334). The failed signal is the sound, the renamed tab and the in-app toast. Q2 "7a": once, one bounded retry, outcome recorded, failed visible regardless. Foreclosed: Discord, any webhook, any external program, a workspace token, an outbox. Accepted limitation: herdr cannot reach the operator off-device; system delivery is best effort and needs a foreground attached client.

### Measurements 2026-09-19 (operator request: prove the API during charting)
- `herdr notification show "akrogon probe" --body "blocked: probe text" --sound request` returned `{"id":"cli:notification:show","result":{"reason":"shown","shown":true,"type":"notification_show"}}`. Schema for the leaf: `{ result: { shown: boolean, reason: string } }`.
- `herdr tab create --label probe-leaf --workspace w8 --no-focus`, then `herdr tab rename w8:t5X "probe-leaf failed"` returned `result.tab.label = "probe-leaf failed"`, `herdr tab get` confirmed it, rename back to `probe-leaf` succeeded, tab closed. Rename is idempotent text replacement, no layout side effects.
