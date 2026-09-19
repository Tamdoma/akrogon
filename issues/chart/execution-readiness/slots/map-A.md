# Territory map (A) 2026-09-19

Nine events, four problem classes. One is already closed.

## Class 1 · A seat waits for a human and nothing ends the wait (#19, #20 items 3, 4, 7)
Mechanism: the pi extension's global promptGuidelines tell every pi session to ask "whenever it needs you to decide" (tamdoma-request-user-input README, Default interaction policy). A dispatched seat obeys, the pane turns `blocked`, and akrogon classifies `blocked` as busy (src/next.ts:169-171). `next` does receive the blocked event: nextCommand returns early only on `working` (src/next.ts:602), so observeBusy runs on the very event and then does nothing but record busy_since. STALL_MS fires one in-app herdr notification after 60 minutes (src/next.ts:195-203) that reaches nobody asleep.
Elegant removal: two moves that each remove a whole class.
- Seats dispatched by akrogon never ask. The operator rule is absolute. The clean mechanism is at the tool, not the prose: launch dispatched seats with the ask tool disabled (the pi extension policy "disappears automatically if you intentionally disable the tool"), so the illegal state cannot be represented. Owner: pi-extensions repo (a disable switch, env or flag) plus akrogon harness launch line. Skill prose (implement-issue :39 "tell the operator ... and wait") changes to: end the pass with the operator step in the report, no waiting.
- akrogon treats `blocked` as the end of the attempt, not as busy. On the blocked event it already holds the leaf; commitMove to `failed` with the reason and the existing "Failed leaf" notification (src/next.ts:475-480). No clock, no poll, event-driven, and status already shows `failed` distinctly. Residual questions from any harness become a visible failure within seconds.
Forks: F1a disable the tool for dispatched seats vs prose only. F1b blocked ends the attempt immediately vs counts as one failed attempt of three. F1c where the operator step is written (report.md known limitations, already exists in the implement skill) vs a new file.
Pitfalls: `blocked` also means an approval dialog in herdr's classifier; pi runs with `-a` so approvals should not occur, but codex/claude harnesses may. Ending on blocked must not delete work: the seat committed partial work; failed keeps the worktree.

## Class 2 · Notifications do not reach the operator (#19, #20 items 3, 6)
Mechanism: every alert is `herdr notification show` (src/next.ts:199, 477), an in-app toast list. Discord push already exists: broadcast.discord.webhook_env (src/config.ts:46) with webhooks in ~/.config/akrogon/env, used by skills/broadcast-issue via curl.
Elegant removal: one notify function in akrogon that posts to the configured Discord webhook when present and to herdr always; the `failed` transition calls it. Reuses the configured channel, adds no new config.
Forks: F2a webhook from the same broadcast.discord list vs a separate alerts list. F2b which events push: failed only (recommended) vs failed and stall.
Pitfalls: webhook read must be loud on missing env (lesson 2026-09-14 env-grep-digit); not every repo configures broadcast, so herdr stays the floor.

## Class 3 · Board lies after merge (#20 item 6)
Mechanism: dispatchLeaf skips observeBusy for merged leaves (src/next.ts:463-468) and commitMove never clears busy_since/busy_notified/pane on merged (src/phase.ts:26-40). Status prints busy from busy_since (src/status.ts:88-92).
Elegant removal: commitMove to `merged` clears seat bookkeeping (busy_since, busy_notified, pane, prompted). One place. Tiny leaf, no fork.

## Class 4 · Dispatch assumes the remote default branch exists (#20 item 1)
Mechanism: ensureWorktree runs `git worktree add -b <slug> <path> origin/main` (src/next.ts:246, target at src/config.ts:111) with no check; on a fresh repo it fails per leaf with git's message.
Elegant removal: one verification of `target(repo)` before the first worktree, with a message naming the push needed; or the same check in chart-issues handoff preflight. Recommend both are the same check in one function used by `next`; the preflight already runs `akrogon status`, which could report it.
Forks: F4a refuse in next only vs also surface in status. Small.

## Class 5 · Chart preflight proves external writes (#19 second observation, #20 item 5)
Mechanism: skills/chart-issues/SKILL.md Take section names human-only prerequisites and credentials but nothing requires a reversible write probe; the boulevard chart probed with GETs. The operator's probe script (scripts/probe-ghl-scopes.ts, tier 1) is the shape: POST then DELETE, 201 proves the scope.
Elegant removal: one rule in chart-issues: every external write a leaf performs is proven at chart time by a reversible probe recorded in the chart (scope, call, status, date), and a brief may not name a scope that was not proven. Skill prose in this repo; it is our own skill.
Forks: F5a probe at chart time by A (recommended) vs a probe leaf. F5b where recorded: fork Findings vs INTAKE.
Pitfalls: probes create and delete real objects; naming and cleanup must be in the rule.

## Already closed
#20 item 2 is #18, merged today (c9e31af, c8dac2a).

## Split by destination
- Chart A "seats never wait for a human": classes 1 and 2 together (one destination: a blocked seat becomes a visible, pushed failure within one event). Two or three leaves: blocked-ends-attempt + push notify (akrogon), skill prose (implement/plan/check/merge: no questions, operator step in report), tool disable (pi-extensions repo, separate registered repo, separate chart there).
- Chart B "merged clears seats": class 3, direct item, no fog, handoff immediately.
- Chart C "dispatch verifies the target ref": class 4, one small fork.
- Chart D "chart proves external writes": class 5, skill-only leaf in this repo.
Off route: herdr `agent prompt` on blocked panes (herdr upstream); the consumer's probe script stays in boulevard.
