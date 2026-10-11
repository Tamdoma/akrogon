# Merged notes: keep running

Sources: slots/keep-running-B.md, slots/keep-running-C.md, A's own reading.

## Q1 A pass overnight with no agent event
- Passes today: herdr events (`plugin/herdr-plugin.toml:13-27`), startup `--resume` (`:10-11`), merge wake and dependents after a phase move (`src/next.ts:1374-1406`), unpause, manual, and the watch session cron (`skills/watch-issues/SKILL.md:12-18,36-45`). None fires for a seat that never started, a leaf waiting at merge while main moves elsewhere, or an all-idle repo (A,B,C).
- Option W, watch: keep the operator-started watch as the one periodic pass; delete its self-delete stop rule (`SKILL.md:45`) so it ends only on `/watch-issues stop`; its Waiting rule (`:36`) already runs `next <slug>` for idle/absent seats, covering S1 waiters and S5 retries. Cost: a Claude Code session must stay open, 20-minute latency, 7-day job expiry needs a weekly restart (C). B rejects as the required clock: session loss and expiry remain, and agent work judges the inventory just to trigger.
- Option T, timer: one systemd user timer runs `akrogon next --resume` (allocated work only, respects pause) every 5 minutes with catch-up; survives logout (Linger=yes observed), session-independent (B). C rejects: foreclosed by the operator rule "no hidden watchdogs, clocks or polling" (`issues/chart/seat-stall-detection/CHART.md:18`, forks/stall-detection.md:34-36, 2026-09-18, which forecloses "the systemd user timer" by name).
- Lock check (A): the seat-stall-detection lock names the systemd timer as foreclosed; the round must show that T reverses it. Herdr v0.9.1 plugins have no periodic trigger (`seat-stall-detection/CHART.md:19`).
- Rejected by both: timer running `next --all` (bypasses pause, releases unreleased work) (B,C); re-arming from events only (no event source for the gaps) (B,C); a long-lived `akrogon watch` process (C; B: adds runtime ownership).
- Pitfalls: S1 must fetch before the empty-queue return or no pass sees main move (B, carried in stop-rules); weekly expiry (C: the tick reports remaining life under a day); hung pass (B: oneshot service blocks re-activation).
- Open: is the operator-started watch outside the "no hidden clocks" rule (C Q1a)? Should unattended passes continue only released work (B Q3: yes, `--resume`)?

## Q2 Landed work deploys when the checkout holds local commits
- Pick (B,C): self-update integrates and pushes when every local-only commit touches only sync-eligible issue records (`src/sync.ts:22-31` predicate), by sharing sync's inner rebase-and-push sequence under the lock self-update already holds, not by calling `syncCommand` (nested `flock -x` deadlocks, `src/state.ts:204-214`). A code commit ahead keeps today's skip. `docs/guide/install.md:40` operator step goes.
- Boundary: classify every ahead commit's paths, not the net diff (B; C used the net diff). Integrate committed history only; leave dirty record edits in place, no staging (B).
- Conflicts: rebase or autostash conflicts are reported with paths, never force-pushed or guessed; a rejected push retries next trigger (B,C).
- Rejected: door push at handoff only (fixes one producer, the handoff push already failed when 26 behind) (B,C); separate runtime checkout (more parts, off route) (B,C); unrestricted sync on every trigger (B,C).
- Open: who resolves a record conflict and how the next pass sees a pending rebase (B Q4); are local code commits ahead ever intentional (C Q2a).

## Where slots differ
- D1 Q1: watch kept alive (C) vs systemd timer on `--resume` (B), the timer reversing a standing operator lock.
- D2 Q2 boundary: per-commit (B) vs net diff (C).
