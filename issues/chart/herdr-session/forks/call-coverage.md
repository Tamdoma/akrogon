# Call coverage

## Question

Q1. Which herdr callers are pinned in this chart: all src lifecycle calls including raw bypasses, the land unit, and which skill scripts (chart peer scripts, watch observer)?

### Carries

- Split taken 2026-10-24: two charts (herdr-session, pull-gh-path), herdr-session first. Operator answer `1a | 2a`.
- Map: [slots/map-merged.md](../slots/map-merged.md)

## Findings

Notes: [A](../slots/call-coverage-A.md), [B](../slots/call-coverage-B.md), [C](../slots/call-coverage-C.md), [merged](../slots/call-coverage-merged.md), rebuttals [B](../slots/call-coverage-rebuttal-B.md), [C](../slots/call-coverage-rebuttal-C.md).

- Agreed (A,B,C): pin shell.ts herdr() and every caller, the raw bypasses (src/next.ts:192,611,646; src/reconcile.ts:387,667) on one argv builder used for both execution and records, land stops forwarding HERDR_SOCKET_PATH and resolves itself, tests/fake-herdr.ts goes multi-session with today's defaults in one session. Leave install integration and plugin link: plugin registration is global (herdr v0.9.1 src/cli/plugin.rs:82,131; live probe identical across sessions) (B,C).
- watch-issues observe.ts: pin in this chart as its own leaf blocked by the shell.ts work (A,B,C after rebuttal). It already imports repo source (observe.ts:5-12), and its OBSERVE_HERDR test seam must reach the shared resolver (C).
- Chart peer scripts: split out (A,B,C). Inside the split, B wants an explicit door session passed through every script; C wants each script to find the session from its pane id (unique hit, else refuse), because the door has no recorded herdr session name.
- Behavior change recorded: a repo whose session is stopped gets no visible notice; receipts persist (C).

## Taken

Operator 2026-10-24, verbatim: "1a | 2a" (Q3 on chart peer scripts not yet answered)

- Pinned in this chart: src/shell.ts herdr() and every caller. The raw bypasses src/next.ts:192,611,646 and src/reconcile.ts:387,667 move onto one argv builder, which is used for both execution and recorded or retried argv. Agent start and prompt keep their own waits, and the discovery deadline applies only to discovery reads. src/land.ts drops HERDR_SOCKET_PATH forwarding, and the land process resolves per repo. tests/fake-herdr.ts gains --session, per-session stores and session list --json, with today's defaults in one running session. src/install.ts and src/self-update.ts plugin link and integration install are left unchanged.
- watch-issues observe.ts is pinned as its own leaf, blocked by the shell.ts session work, through the shared resolver, with the OBSERVE_HERDR seam threaded to it.
- Recorded behavior change: a stopped repo session shows no notice, and receipts persist.

Operator 2026-10-24, verbatim: "3a - but we need to map it out immediately after this is done."

- The chart peer scripts and their prose (peer-ask, peer-wait, peer-restart, peer-create, door-reset, the questions.md wait chain, the SKILL.md agent list) are split into the sibling chart [peer-session](../../peer-session/CHART.md). The operator named it as the next chart after herdr-session hands off, ahead of pull-gh-path. Its open method question is B (explicit door session) vs C (session found from the pane id).
