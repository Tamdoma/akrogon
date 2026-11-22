# Merged notes: timer-design (A, B, C)

Charting probes (A, 2026-11-20, under N1; full record in forks/timer-design.md Findings): plain `watch-issues tick <root>` loaded the skill in claude, codex and pi; agy did not load it from its cwd or `~/.agents/skills` (it grepped the akrogon repo) and did load it from `~/.gemini/config/skills` in a non-akrogon cwd. `hc run --bg` from each harness's tool shell made a child whose parent is the agent terminal (HC_TERMINAL_ID set in all four). Text sent while the agent worked merged into the running turn on all four (no separate turn). Resolved transcript path changed after /clear before any prompt on claude and agy; unchanged after codex /new; pi unknown (`-`). A child survives an inner program's exit under a live shell; ends when the parent root exits. `hc send --if idle` to a status-null shell types nothing (exit 10). A second live `--name` is refused (`name_taken`). `hc ls --json --label k=v` filters.

## Q1 checks run where
- (a) invoking conversation (A,B,C): keeps the operator's harness, model, permissions, replies and per-watch memory; cost: shares input with the operator.
- (b) dedicated terminal: rejected (A,B,C): extra launch config, trust dialogs, second lifetime.

## Q2 timer host and binding
- (a) parent-bound bun child, pinned harness {pid, start time} checked before every send (A,B,C). Reason: hc's parent rule misses an agent exiting under a live shell (probe; C). Cost: ancestor walk at start.
- Delivery race (agent exits during a send held on a draft): A: `hc send --if idle` makes hc refuse typing when status is not idle, and a bare shell is silent (probe); C: add an `hc events` listener to abort; B: open, test replacement during delivery.
- (b) parent rule alone, (c) pid file: rejected (A,B,C).

## Q3 reset
- (b) timer-side transcript-path comparison before each send plus the skill's first-prompt stop (B,C; A after probe): catches claude and agy resets even after an intervening prompt; first-prompt rule covers codex and pi where the path does not move; null at start latched lazily (C). Cost: one resolver call per send.
- (a) first-prompt only (A's draft): rejected (B,C): one intervening prompt defeats it.

## Q4 busy
- (a) wait for idle/done, then one tick; dues collapse (A,C): sends while working merge into the running turn on all four (probe), so (b) cannot keep separate checks; a second back-to-back check observes the same state. Cost: the e2e's two-queued-ticks assertion becomes one catch-up check.
- (d) count dues, deliver each as its own turn (B): preserves one check per due; cost: backlog and a receipt problem (what releases the next due).
- (c) skip: rejected (A,B,C).

## Q5 one per repo
- (a) fixed hc name from the repo prefix + label `akrogon.watch=<repo>` in the repo's session, claimed before the immediate check (B,C), stop from any terminal in the session, several reported untouched (A,B,C); tick carries `timer=<address>` and the skill checks a live labelled timer at that address parented to this terminal before any check or first-prompt stop (B,C; A agrees).
- (b) lock file: rejected (A,B,C).
- § Never carve-out: stop may kill and remove only the verified timer (A,B,C).

## Q6 tick text
- (a) `watch-issues tick <root> timer=<address>` for every harness (A,B,C), sent untagged (C: via src/hc.ts `send`, whose env drops HC_TERMINAL_ID). Root with spaces arrives as one value (B).
- (b) native syntax per harness: rejected (A,B,C).

## Q7 agy
- (a) add `.gemini/config/skills` to `src/install.ts` planSkillLinks (A,C): probe shows agy reads it and not `~/.agents/skills` from a normal cwd. Cost: every akrogon skill appears in agy (agy seats gain plan-issue etc. too).
- B: no install change unless discovery fails, and if it does, an explicit scope exception from the operator, since 5a names the skill folder.

## Q8 old Claude cron
- (a) no cron text; old `/watch-issues tick <root>` lacks `timer=` and is refused before any check or stop (A,B,C).

## Added questions
- Start ordering: claim the name before the first check (B,C) — adopted under Q5.
- Watcher in a different hc session than the repo's: refuse at start (C).
- Test-only interval override env (C; A's map F7).
- Already-open Claude session picking up the changed skill on its next tick (B): upgrade observation.

## Where slots differ
Q4 (B vs A,C), Q7 (B vs A,C), Q2 delivery race mechanism (A vs C vs B).
