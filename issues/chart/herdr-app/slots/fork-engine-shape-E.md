# Fork Notes: `engine-shape` (Slot E)

## Q1: Scope of Signpost 1a ("akrogon code only for starting an agent")

1. **Pick, reason, cost:** **Signpost 1a binds only agent-performed steps in skills** (door, consultants, direct reviewers, watcher), while **the deterministic engine (`src/`) keeps its own `hc` and `herdr-app` calls in TypeScript** (`dispatchSlot`, `observeBusy`, `reconcile`, `closeMergedTab`, `status`), sharing the single agent-start helper (`allocate` + `hc run` + pane placement) with the skills. *Reason:* Skills are executed by LLM agents reading markdown (`skills/*/SKILL.md`), whereas the engine (`src/next.ts`, `src/reconcile.ts`, `src/status.ts`) is deterministic TypeScript with no skill text; Signposts 4a and 6a require porting the engine first with an unchanged workflow. *Cost:* ~150 lines of `hc`/`herdr-app` shell calls and corresponding unit tests remain in `src/`.
2. **Rejected options:**
   - *Bind the engine too (push leaf prompting, status reads, and tab closing into leaf seat skills):* Rejected because leaf seats lack global state to evaluate `max_active` (`src/next.ts:435-465`), merge queue order (`src/next.ts:1166-1168`), dependent leaf unblocking (`src/next.ts:1391-1406`), broadcast handoffs (`src/next.ts:1280-1312`), or 2-slot barrier completion (`src/phase.ts:444-456`), violating Signpost 4a ("workflow unchanged").
3. **Evidence:**
   - `operator`: `issues/chart/herdr-app/forks/signposts.md` `## Taken` (1a, 4a, 6a) & `INTAKE.md:72-78,187` (read 2026-11-06).
   - `better-than-training`: `src/next.ts:513-988,1280-1406`, `src/reconcile.ts:375-425`, `src/status.ts:46-54` (read 2026-11-06).
4. **Pitfalls & removals:**
   - *Drift between engine start logic and skill start logic:* **Design part:** expose one shared start helper (`akrogon` CLI verb + internal function) used by both `src/next.ts` (`allocate`/`dispatchSlot`) and `skills/chart-issues/SKILL.md`.
5. **Unasked question:** Should `akrogon stop` (`src/stop.ts`) and `akrogon leftovers` (`src/leftovers.ts`) also call `hc kill` / `herdr-app do tab.close` directly in engine code when stopping a leaf? *(Lean: yes, engine lifecycle commands own their `hc` cleanup.)*

## Q2: What wakes the engine and who installs/restarts it

1. **Pick, reason, cost:** **A systemd user service (`systemd/akrogon-events.service`) owned, linked, and restarted by `akrogon install` and `akrogon` `self-update`** (`src/install.ts:36-39,145`, `src/self-update.ts:274-289`), running an `akrogon` listener that executes `pull --all` + `next --resume` on start, tails `hc events --json`, coalesces bursts into single-flight `next` passes under `.lock`, and runs a catch-up `next --resume` sweep after any stream reconnect. *Reason:* Every merge to `akrogon` self-deploys via `deployStage` (`src/self-update.ts:215-298`); `akrogon` must `systemctl --user restart` its own listener when `current` flips (`src/self-update.ts:273-289`) so the resident daemon never runs stale code, and systemd `Restart=always` survives `herdr-app` window closes and `herdr-core` restarts. *Cost:* One new unit file in `systemd/`, a reconnect loop with single-flight coalescing, and one `systemctl --user restart` call in `src/install.ts` and `src/self-update.ts`.
2. **Rejected options:**
   - *`herdr-app` mod listener:* Rejected because mods die when the GUI window closes (`AGENTS.md:881-891`) and WebKit mods lack a silent subprocess API (`AGENTS.md:455-561`).
   - *`herdr-setup` owning listener install/restart:* Rejected because `src/self-update.ts:215-298` deploys new `akrogon` releases automatically on merge without running `herdr-setup/install`; if `akrogon` does not restart the service on flip, the daemon runs old code.
   - *No resident listener (cron/manual only):* Rejected by Signpost 4a and operator's no-polling requirement (`forks/engine-shape.md:13-14`).
3. **Evidence:**
   - `operator`: `forks/signposts.md` `## Taken` (4a) (read 2026-11-06).
   - `practitioner`: Event-stream supervisors (`docker events`, `swaymsg -t subscribe`, `tmux -CC`) drop transitions across socket resets unless reconnect triggers a state-reconciliation sweep before resuming live events (web search: Docker/Sway/tmux control-mode reconciliation pattern, read 2026-11-06).
   - `better-than-training`: `plugin/herdr-plugin.toml:7-27`, `src/install.ts:36-39,145-147`, `src/self-update.ts:274-289`, `hc events --help` (no replay cursor) (read 2026-11-06).
4. **Pitfalls & removals:**
   - *Missed events while `hc events` reconnects after `herdr-core` restart:* **Design part:** buffer incoming stream lines while running a full catch-up `next --resume` sweep on every connect/reconnect.
   - *Core restart downgrades kept agent terminals to plain bash shells (`slots/map-merged.md:34`):* **Design part:** listener/engine detects "terminal live + foreground process is shell + `prompted` recorded" as a seat crash for `watch-issues`, never auto-resending the prompt to bash.
   - *Event storm triggering concurrent `next` processes:* **Design part:** single-flight coalescing in the listener (at most one active `next` pass, one pending dirty flag per session/repo).
5. **Unasked question:** Does one listener instance watch `HC_SESSION=infra` (configured in `config.yaml` or `akrogon-events@.service` template), or dynamically watch all running sessions from `herdrapp session list --json`? *(Lean: `akrogon-events@.service` template or multi-session watcher driven by `config.yaml` / `herdrapp session list --json`.)*

## Q3: What advances a leaf on success (`hc events` turn-end, `akrogon phase`, or both)

1. **Pick, reason, cost:** **Both:** `akrogon phase` directly invokes leaf dispatch (`dispatchLeaf` + `mergeWake`, extending `src/akrogon.ts:79-97`) for any required seat that is already `idle`/`done`, **and** the `hc events` listener triggers `next` when a seat's turn ends (`status` -> `idle`/`done`). *Reason:* Neither path alone covers all transitions:
   - When Seat A runs `akrogon phase <slug> plan.synthesis --slot A` or `akrogon phase <slug> check.review --slot A`, **Seat A itself is required in the new phase**, but during the `akrogon phase` tool call Seat A's terminal is still `working`! `dispatchSlot` must not inject the next phase's prompt mid-turn (`src/next.ts:765,814`); Seat A can only be prompted when its current turn finishes and `hc events` reports `idle`/`done`.
   - Conversely, when Seat A's move wakes an already-idle Seat B (`check.repair -> merge`, or `implement -> check.review` for B), or when the operator runs `akrogon phase <slug> <phase>` from a shell to recover a failed leaf (`src/phase.ts:394-397`, where **no** agent turn ends), or when a Claude seat is backgrounded and emits no `hc` status (`INTAKE.md:173-174`), `akrogon phase` dispatching immediately advances work without waiting for a non-existent turn-end event.
   *Cost:* ~15 lines in `src/akrogon.ts:79-97` + idempotency guard in `dispatchSlot` under `.lock`.
2. **Rejected options:**
   - *`akrogon phase` only:* Rejected because same-seat phase transitions (`plan.Author -> plan.synthesis` on A, `implement -> check.review` on A) occur while A is still `working` inside `akrogon phase`; sending mid-turn corrupts the active turn, and skipping `working` seats stalls the leaf forever without a turn-end wakeup.
   - *`hc events` turn-end only:* Rejected because operator CLI recovery (`akrogon phase <slug> <phase>` without `--slot`, `src/phase.ts:394-397`) and backgrounded seats (`INTAKE.md:173-174`) emit no turn-end event, and cross-seat handoffs wait unnecessarily for the caller's post-command chatter to finish.
3. **Evidence:**
   - `operator`: `INTAKE.md:149,173-174,187` (read 2026-11-06).
   - `better-than-training`: `src/akrogon.ts:76-98`, `src/phase.ts:394-397,444-477`, `src/next.ts:761-842,1608` (read 2026-11-06).
4. **Pitfalls & removals:**
   - *Double-dispatch when `akrogon phase` and `hc events` both fire for the newly-idle sibling seat:* **Design part + Done-criterion:** serialize both paths under global `.lock` (`src/next.ts:1666`) and record `prompted[slot]` (`terminal` + `turn`) before releasing `.lock` so the second caller is a no-op (`src/next.ts:766-772`).
   - *`hc send --if idle` refuses seats in `done` state (`INTAKE.md:149`):* **Design part:** engine checks `status.state === 'idle' || status.state === 'done'` via `hc get --json` under `.lock` and sends with plain `hc send` (never `--if idle`).
5. **Unasked question:** When a seat finishes its turn (`idle`/`done`) without having called `akrogon phase` (e.g., it stopped early or printed a question), how does the engine distinguish "needs watcher attention" from "normal turn end after `akrogon phase`"? *(Lean: if the seat is still required for the current `phase` and not in `done[]`, its turn ended without advancing the phase—surface it to `watch-issues` / status as stalled/unadvanced.)*
