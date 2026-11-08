# Fork notes A: engine-shape

## Q1 scope of 1a
- Pick: 1a binds steps an agent performs from skill text (door, consultants, watcher, check-issue direct review). The engine keeps its own code for the hc calls it makes today (prompt a seat, read status, close a finished leaf's tab). Reason: no agent drives the engine, and the operator said the workflow does not change (Carries). Cost: the engine keeps one small hc boundary module, which must not grow helpers for skills.
- Rejected: engine bound too. Nothing would prompt a leaf seat after start; an agent coordinator would have to exist, which changes the workflow.
- Evidence: better-than-training · `src/next.ts` `dispatchSlot` prompts seats from code today · 2026-11-06.
- Pitfall: the hc boundary module becomes a back door for skill helpers. Removed by: design, the module exports only what `src/` calls, skills call `hc` directly.
- Ask: should the operator confirm this reading of 1a? (B raised it.)

## Q2 wake-up
- Pick: one systemd user service `akrogon-listen` per hc session that hosts repos, running `hc events --json --label akrogon.repo=...` (filtered), calling `akrogon next` on turn end, blocked, finished; on start it runs `pull --all` and `next --resume` (replaces plugin startup). Installed and restarted by akrogon install and self-update, which already own the plugin link it replaces and systemd units (`src/install.ts` links `systemd/akrogon.slice`; `src/self-update.ts` relinks the plugin after flip). Cost: one always-on process to keep alive (systemd `Restart=always`).
- Rejected: herdr-app mod (stops with the window and layout; overnight leaves stall). herdr-setup owning it (the listener's job is akrogon routing; a cross-repo install order invites skew between engine and listener versions).
- Evidence: better-than-training · `plugin/herdr-plugin.toml`; `hc events --help` (filters `--terminal`, `--children-of`, `--label`, no replay cursor) · 2026-11-06. practitioner-adjacent · Supervisor's event listeners and superlance `crashmail` act only on unexpected exits and must tolerate redelivered events (https://superlance.readthedocs.io/en/latest/crashmail.html, Supervisor changelog) · 2026-11-06 · supports a filter plus an idempotent full re-read.
- Pitfalls: stream ends on core restart or `hc update` (`hc --skill` "streams end on loss, reattach"): service exits non-zero, systemd restarts it, start runs the resume sweep. Missed events while down: the same sweep. Service cannot reach the core socket: probe from systemd with `HC_SESSION` set. Event storms: ignore `working` as today and coalesce into one pass.
- Ask: which hc sessions host repos (only `infra` today?), a config key or discovery?

## Q3 advancement
- Pick: turn-end event, same as today. A seat runs `akrogon phase` mid-turn; when hc reports the turn over, the listener runs `next`, which prompts the next seat. Reason: same workflow; the same seat often takes the next phase (plan then implement), and it is busy until its turn ends. Cost: advancement depends on the listener being up; status shows listener liveness.
- Rejected: `akrogon phase` dispatches directly (prompts a seat that may still be mid-turn, needs a second path for same-seat phases, and duplicates `next`). Both (two paths to the same dispatch, double prompts unless guarded).
- Evidence: better-than-training · `src/akrogon.ts:79-96` (phase only wakes merge); `src/next.ts:1608` (working events ignored) · 2026-11-06.
- Pitfall: a seat's turn ends without calling phase (silent stop). Removed by: next sees no phase change and the watcher judges it, as today.
- Ask: does "every time the slot needs to communicate something with the other slot ... sends the message" require B to `hc send` A directly in check/repair, or is `akrogon phase` plus the engine's prompt the message?
