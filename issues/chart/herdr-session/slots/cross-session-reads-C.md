# Fork notes, seat C: cross-session-reads

Blind notes, written without A's draft, this fork's Findings, or another seat's notes. Locks read: session-address Taken and `sa-proposed-shape.md`. All evidence dated 2026-10-24. No herdr mutation was run.

## Settled with evidence

### S1. A hook pass can name its emitting session from the injected socket

herdr v0.9.1 source (tag peeled to `065ef9d6a531c49fb8bee7e818ef837065b21ee9`, cloned 2026-10-24; installed binary reports 0.9.1):

- Every plugin command gets `HERDR_SOCKET_PATH` set to `crate::api::socket_path()` (`src/app/api/plugins/runtime.rs:40-45`), which is `session::active_api_socket_path()` (`src/api/mod.rs:98-100`) — the firing server's own session socket, resolved from that server's `--session` (`src/session.rs:173-181`).
- The command is built by `command_for_argv_in_dir` and then `.envs(env)` (`src/app/api/plugins/runtime.rs:122-126`), so injected keys override inherited ones but the rest of the parent environment is inherited unchanged.
- Matching that socket string against `session list --json`'s `socket_path` per session (`src/session.rs:216-224`) names the emitting session exactly, with no path parsing.

### S2. The event JSON is server-generated and carries `workspace_id`; akrogon drops it

- `HERDR_PLUGIN_EVENT_JSON` is `serde_json::to_string(event)` of the event the server just handled (`src/app/api/plugins/runtime.rs:61-63,241`).
- `TabClosed` carries `tab_id` and `workspace_id` (`src/api/schema/events.rs:474-477`); pane events carry `pane_id` and `workspace_id` (`src/app/api/plugins/context.rs:154-186` destructures both for focused, output, exited, detected and status-changed).
- akrogon's `hookEventSchema` (`src/next.ts:75-98`) keeps only `pane_id` or `tab_id`. `workspace_id` is parsed away, so the tab_closed route has nothing but a bare tab id (`src/next.ts:1432-1435`).

### S3. `HERDR_PANE_ID` is injected only when the event has a focused pane

`src/app/api/plugins/runtime.rs:70-72` pushes `HERDR_PANE_ID` only `if let Some(pane_id) = context.focused_pane_id`. For `tab.closed` the context sets `workspace_id` and `tab_id` and no focused pane (`src/app/api/plugins/context.rs:106-115`), so no injection happens — but the inherited environment still passes through (S1), so a stale `HERDR_PANE_ID` from the server's own parent can reach a tab_closed hook. Pane events do set it (`src/app/api/plugins/context.rs:154-186`).

### S4. A stopped session contributes no live panes

A stopped server's pane processes are gone; on restart panes come back as new shells in saved directories (herdr session-state docs at tag v0.9.1, "Snapshot restore"). So "stopped" is a known-empty contribution to any cross-session pane read, not an unknown one. Only a session listed running whose read fails is unknown.

## Q1. How do capacity, reconcile vetoes and hook ownership read panes across sessions?

### Pick

One union read per pass: list panes and tabs in every running session, each row tagged with its session name, cached once per invocation like today's `panesOnce` (`src/next.ts:1348-1356`). Consumers split by purpose:

- Keep-vetoes and capacity read the union. `tabLive` (`src/reconcile.ts:255`), `livePaneInside` (`:245`), `foreignPaneInside` (`:251`), `broadcastInProgress` (`:183-193`), `sliceKeepReason` (`:195-213`) and `activeCount` (`src/next.ts:354-370`) ask "is anything alive in this path or tab", and a pane in the worktree from any session is exactly the thing they must not delete under.
- Destructive and attributing calls route by the tag: `closeMergedTab` (`src/reconcile.ts:383-389`), `closeTab` (`:666-675`), `ownsPane` (`src/next.ts:159`), and the pane close in allocate (`src/next.ts:383`) act only on a row whose session matches the repo's resolved session, or whose cwd proves the worktree.
- Unknown discipline per session: a stopped session contributes empty (S4); a running session whose read fails contributes unknown, and any unknown makes the union unknown for vetoes (keep everything, as `panes().catch(() => null)` does today) and full for capacity (as `inventory.unknown` already does at `src/next.ts:356-368`).

Reason: the veto's failure mode is asymmetric. A missed live pane deletes a worktree under a running seat; a spurious keep costs disk until the next pass. Scoping reads to the repo's own session (the tempting minimal fix) makes every foreign-session pane invisible, which is precisely the state the seed incident created and the second-seat guard only refuses for at allocation time — a pane that arrives later, or an operator opening the worktree by hand in another session, is not covered by that guard. The union is the only shape where the veto cannot be fooled by which session a process happens to live in.

Cost: `Pane` and `Tab` gain a session tag (`src/shell.ts:150-170`), so every bare-id match must be audited — `ownsPane`, allocate's recorded-pane filter and tab match, `tabLive`, `closeTab`, `src/log.ts:40`. The pass pays one list per running session instead of one total, on a path that fires on every pane event. And the union makes the pass's pane view depend on every running session, so one wedged session stalls or degrades the whole read (see the deadline work in `sa-proposed-shape.md` Q3).

### Rejected

- Per-repo session-scoped lists only: cheapest and matches the resolution model, but it silently weakens every keep-veto to "panes in the repo's own session", which is the deletion-under-a-live-process failure above. It also under-counts capacity for a leaf whose seat sits in a foreign session, admitting past `max_active`.
- Union without a session tag: cannot route a close or a prompt, and every bare-id match becomes ambiguous across servers. Workspace ids already repeat across sessions (`w8` in infra and mdconsultingny, live probe 2026-10-24); pane and tab ids are per-server and a collision is unproven but unexcluded.
- Match panes by cwd only, dropping ids: `cwd` is nullable in `paneSchema` (`src/shell.ts:150-162`) and `inWorktree` returns false for null (`src/next.ts:155-157`), so a pane with unknown cwd becomes invisible to the veto — the same failure as scoping, arrived at differently. It also cannot answer "is this tab still live" at all.
- Keep the single ambient list: the current defect.

### Evidence

- better-than-training · herdr v0.9.1 source and docs, read 2026-10-24 · S1-S4 lines above; session-state docs "Snapshot restore" for stopped-session process loss.
- better-than-training · this repo at c5cf7be7, read 2026-10-24 · every consumer line named in the pick; `panesOnce` sharing at `src/next.ts:1348-1356`; `panes().catch(() => null)` at `src/next.ts:1352`; `activeCount` unknown handling at `:356-368`.
- practitioner · my live probes, 2026-10-24 · three running sessions hold registered repos; workspace id `w8` exists in two of them; `session list --json` exposes `socket_path` per session.
- operator · INTAKE Scope, 2026-10-24 · act only in the repo's workspace, refuse visibly; the veto is the part of that promise that protects running work.

### Pitfalls

- Q1-P1 A union read makes `tabLive` true for a same-id tab in another session, keeping a slice or worktree alive forever. Safe direction, but it hides a real leak. Removed by: the tag, so `tabLive` compares session plus id, and the untagged union is never used for liveness.
- Q1-P2 `closeTab` and `closeMergedTab` act on a bare id (`src/reconcile.ts:387,667`). Under a union, a same-id tab in another session could be closed. Removed by: routing closes through the tag and treating a tag mismatch as "not ours, keep" rather than an error.
- Q1-P3 `ownsPane` accepts a stored pane id with no corroboration (`src/next.ts:159`), so a hook pane in another session that happens to share an id attributes the pass to a wrong leaf, and the hook route throws on multiple owners (`src/next.ts:1465`). Removed by: session tag plus the cwd arm that `ownsPane` already has.
- Q1-P4 `paneOwners` calls `panes()` uncaught (`src/next.ts:1330`); under a union that is N calls and N failure points on the hottest path. Removed by: the per-repo containment from stopped-and-ambiguous Q2 plus the shared cached read.
- Q1-P5 Capacity counts per repo against a global `max_active` (`src/next.ts:354-370`). With a union, a leaf whose seat is in a foreign session now counts as active — correct, but it changes admission behavior for any repo currently mis-placed, so the first pass after the change may admit fewer leaves than before. Removed by: nothing; it is the intended correction and should be stated in the leaf's criteria so it is not read as a regression.
- Q1-P6 `reconcileNeedsPanes` (`src/reconcile.ts:396+`) decides whether to fetch panes at all. If it keeps deciding per repo, a repo with no pane-dependent candidate skips the union read while another repo's veto needs it. Removed by: the union read being pass-level and lazy, requested by any consumer, not per repo.

### Questions the fork does not ask

- Does the union include running sessions that hold no registered repo? It must for vetoes (a scratch session's pane can sit in a worktree), but then the pass reads sessions akrogon otherwise ignores, and the second-seat guard's "outside the repo's workspace" refusal starts firing for panes in sessions the operator never associated with akrogon.
- Does `reconcileHost` (`src/next.ts:1322`) get the union too? It takes the shared pane list today and its repo-independent work is exactly the kind that must not depend on one repo resolving.
- What is the union's lifetime when a session starts mid-pass? A session that comes up after the read contributes nothing, so a pane it creates is invisible until the next pass — acceptable for vetoes only if the next pass is soon, which for hook-driven passes it is and for a manual `next` it is not.

## Q2. When is an inherited `HERDR_PANE_ID` trusted?

### Pick

Prefer the event JSON's `pane_id` whenever an event is present, and use `HERDR_PANE_ID` only when there is no event (a manual `akrogon next` typed inside a pane), and then only after corroboration: the pane exists in the resolved session and its cwd is inside a leaf worktree. For the tab_closed route, stop treating it as uncorroboratable: parse `workspace_id` from the event (S2), take the emitting session from the injected socket (S1), and match leaves by `state.tab` within that session whose repo resolves to that session and whose workspace id equals the event's.

Reason: the event JSON is produced by the firing server from the event it just handled, so it cannot be stale; `HERDR_PANE_ID` can be inherited from a long-lived parent, which is the seed's exact mechanism, and S3 shows it is not even injected for tab_closed. The tab_closed deferral in session-address Taken rested on "no live tab to corroborate"; S1 and S2 remove that premise — the event carries the workspace and the process carries the session, which together are stronger evidence than a live tab lookup.

Cost: manual runs from inside a seat pane lose attribution unless the corroboration passes, so a hand-typed `akrogon next` in a pane whose shell has cd'd out of the worktree no longer attributes to that leaf. `src/log.ts:36` currently prefers the env over the recorded slot pane and would need the same rule, changing what `session` lands in `log.jsonl` for phase moves.

### Rejected

- Trust `HERDR_PANE_ID` as today (env first): the seed's mechanism, and S3 shows the var is absent exactly where the event is the only source.
- Never trust it: breaks the manual-run path, which has no event and is a normal operator action.
- Trust it when `HERDR_ENV=1` and the socket matches a running session: `HERDR_ENV=1` is inherited too (S1: the whole parent environment passes through), so it proves nothing about the pane id's age. It would only prove the process descends from some herdr pane.
- Keep the tab_closed deferral: S1 and S2 make it unnecessary, and leaving it deferred keeps a route that matches bare tab ids across every repo and throws on multiple owners (`src/next.ts:1432-1435`).

### Evidence

- better-than-training · herdr v0.9.1 source, read 2026-10-24 · S1 (socket injection and env inheritance), S2 (event JSON provenance and `workspace_id`), S3 (conditional pane-id injection, tab_closed context).
- better-than-training · this repo at c5cf7be7, read 2026-10-24 · `hookEventSchema` dropping `workspace_id` (`src/next.ts:75-98`); `hookPane` from env (`:1345`); tab_closed owner match (`:1432-1435`); `ownsPane` (`:159`); `src/log.ts:36` env-first pane choice.
- operator · seed process tree in INTAKE, 2026-10-24 · a background job carried `HERDR_PANE_ID=w4:p2` from an unrelated pane, proving the inherited value can be both stale and live.

### Pitfalls

- Q2-P1 A tab_closed hook inherits a stale `HERDR_PANE_ID` (S3) and akrogon's `hookPane` reads it unconditionally (`src/next.ts:1345`). Today the tab_closed branch runs before the hookPane branch so it is not used there, but any future reordering or a pane event whose context lacks a focused pane would attribute wrongly. Removed by: the event-first rule, with env read only when no event exists.
- Q2-P2 Matching the injected socket to a session name assumes the socket string equals `session list --json`'s `socket_path`. For the default session that is `~/.config/herdr/herdr.sock`, not a `sessions/<name>` path (live `--json` output), so any path-shape parsing breaks on the default session. Removed by: exact string comparison against the listed `socket_path`, never parsing.
- Q2-P3 `src/log.ts:36` prefers env over the recorded slot pane, so a stale env writes a wrong `session` into `log.jsonl` and into timing reads. Diagnostic only, and the catch already tolerates an unreachable herdr (`src/log.ts:42-46`). Removed by: recorded slot pane first, env only when the slot is null.
- Q2-P4 Corroborating a manual run by cwd fails when the pane's shell has cd'd out of the worktree while the agent still runs there. Removed by: accepting the recorded pane id as corroboration when it belongs to a leaf in the resolved session, cwd as the fallback rather than the only proof.

### Questions the fork does not ask

- Should a hook pass whose event names a pane or tab that no leaf owns do anything at all, or is silence correct? Today it returns early (`src/next.ts:1436,1466`), and with event-first attribution that early return becomes the normal case for every pane in sessions akrogon does not manage.
- Does the event's `workspace_id` need to be compared against the repo's resolved workspace, or is session plus tab id enough? Comparing it catches a leaf whose tab was moved to another workspace in the same session, which the tab id alone would miss.
