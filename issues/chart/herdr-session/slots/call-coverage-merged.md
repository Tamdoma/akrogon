# Call coverage, merged (A, B, C)

Sources: [A](call-coverage-A.md), [B](call-coverage-B.md), [C](call-coverage-C.md).

## Agreed

- Skills ship from this repo; edit tracked `skills/`, never release copies (A,B,C).
- Pin src/shell.ts herdr() and its list helpers as the single routing point, with the discovery deadline on discovery reads only, not on agent start/prompt waits (A,B; C agrees in rebuttal).
- Pin every herdr() caller: src/next.ts:206,383,426,441,473,476,505,866,880 and the inventory reads (activeCount, panesOnce, hook owners); src/phase.ts:43-108; src/scope.ts:123; src/verify.ts:241; src/log.ts:36-46 (A,B,C).
- Pin the raw bypasses by moving them onto the same argv builder, never by rewriting HERDR_SOCKET_PATH in spawn env: src/next.ts:192 busy notice, :611 agent start, :646 agent prompt; src/reconcile.ts:387, :667 tab closes (A,B,C). Keep their own return-code, wait and kept-resource behavior (B,C).
- One argv builder used for both execution and recorded/retried argv, so delivery_error.command and phase warnings show what actually ran (B,C). Exact-argv tests (tests/shell.test.ts:107, tests/next.test.ts:137, tests/status.test.ts:713) are updated, not the state field versioned (C).
- src/land.ts:33-35: stop forwarding HERDR_SOCKET_PATH; the land process and its wake calls resolve per repo like every other entry path; no forwarded session name (B,C; A listed both). Test the land path with the env var absent or stale (B,C).
- plugin/herdr-plugin.toml and its sh wrappers make no herdr calls; leave them, their consumers are pinned (A,B,C).
- Leave src/install.ts:136-137 and src/self-update.ts:284: integration install edits files, plugin registration is global and has an offline fallback (herdr v0.9.1 src/cli/integration.rs:88, src/cli/plugin.rs:82,131; live probe: identical `plugin list` in infra, mdconsultingny, personal) (B,C). This closes A's open check.
- tests/fake-herdr.ts gains `--session` parsing, per-session stores and `session list --json`; default set keeps today's w1/repo and w3/other in one running session so unmodified fixtures pass; new cases cover colliding ids across sessions, duplicate labels, stopped, error and deadline (A,B,C).
- Notice behavior change recorded: a stopped repo session gets no visible notice, receipts persist (C; consistent with stopped-and-ambiguous 4a).

## Differences

- D1. Chart peer scripts (peer-ask, peer-wait, peer-restart, peer-create, door-reset) and their prose (questions.md wait chain, SKILL.md agent list). A: leave, the door's own socket is correct. B: split as a separate outcome needing an explicit validated door session through ask/wait/restart/create/reset and the detached child. C: split as a named sibling leaf; interim risk named: peer-restart process-info then kill -TERM on a same-id pane in another session.
- D2. watch-issues observe.ts (and SKILL.md acting commands). B: pin in this chart, it observes repo seats and misreports after the src fix. A: parallel leaf blocked-by the shell.ts session API. C: in the scripts sibling, but it addresses repo seats so its lookup differs from peer scripts; C also asks how a deliberately standalone script (OBSERVE_HERDR seam) gets the shared resolver.

## A after merge

- D1: A withdraws "no change". C's kill-by-wrong-read risk is real. A sides with split (B,C); the door-session input is a new contract, not a reuse of repo resolution.
- D2: observe.ts reads repo seats by stored pane id, which is the repo-resolution contract taken here, not the peer contract. A leans pin in this chart as its own leaf blocked-by the shell.ts leaf (B's scope, A's ordering).

## Open questions carried

- Q2 (B): door-session sibling now, or record the limitation only.
- Q3 (B): live proof for land child routing and worktree cwd, chosen before handoff.
- C: whether `akrogon status` should show the resolved session per repo (display, not coverage); seat shells and hand-typed herdr calls stay outside the promise.
