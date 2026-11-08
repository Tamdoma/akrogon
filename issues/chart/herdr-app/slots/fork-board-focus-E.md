# Fork Notes: `board-focus` — Seat E

## Q1: Scope — part of this epic or its own later issue?

1. **Pick:** **In this epic** (bundled with the `status --json` / Tasks board update leaf).
   - *Reason:* `INTAKE.md:169-172` explicitly carries operator direction 1b (`issues/chart/tasks-hierarchy/forks/direction.md:23`) into this chart because it was blocked only by legacy `wA:p1` pane IDs. `src/status.ts` already changes in this epic to read the new `hc` seat state (`identity` Taken Q2 2a), and the board change is ~20 lines in `herdr-app/tasks/{model.js,model.d.ts,main.js}`.
   - *Cost:* One small addition to `src/status.ts`, `herdr-app/tasks/`, and `tests/tasks-mod*.test.ts`.
2. **Rejected:** *Separate later issue* — leaves an explicit `INTAKE.md:171` carry unfinished and touches `src/status.ts` + `tests/fixtures/status-envelope.json` twice.
3. **Evidence:**
   - `operator` · `issues/chart/tasks-hierarchy/forks/direction.md:23` (1b) & `INTAKE.md:169-172,204` · 2026-11-07.
   - `better-than-training` · `src/status.ts:516-519,556-558`, `herdr-app/tasks/main.js:249`, `tests/tasks-mod-host.test.ts:150-176` · 2026-11-07.
4. **Pitfalls:**
   - *Fixture drift:* Updating `JsonLeaf.seats` without updating `tests/fixtures/status-envelope.json` breaks `tests/tasks-mod*.test.ts`. *Removed by:* Leaf done-criterion running `bun test tests/tasks-mod.test.ts tests/tasks-mod-host.test.ts`.
5. **Unasked question:** None.

## Q2: Shape — command, target seat, `status --json` field, and no-pane fallback

1. **Pick:**
   - **Command:** `run("pane.focus", { terminal: row.terminal })` when `row.terminal !== null && panes().some((p) => p.terminal === row.terminal)`.
   - **Target seat (`model.js` pure selector):** On `Needs you`, problem seat first: `leaf.failure?.slot` (`A`/`B`), else unbusy seat with `leaf.delivery_errors` (`a`/`b`), else `B` when `phase === "merge"` (`merge job stopped`). Otherwise: busy seat (`leaf.busy_since.a !== null ? "a" : leaf.busy_since.b !== null ? "b"`), else `leaf.waits_on[0]`, else `B` on `broadcast_pending`; if the chosen seat's `terminal` is `null`, fall back to the other seat's `terminal`.
   - **`status --json` addition:** `seats.a.terminal: string | null` and `seats.b.terminal: string | null` in `src/status.ts:516-519,556-558` (bare `hc` terminal address `t<N>` stripped of `<session>/`, or `null`).
   - **No-pane fallback:** **Files as today (`this.pinFolder(row.folder, "files")`)** when `row.terminal === null` or `!panes().some((p) => p.terminal === row.terminal)` (with `row.parked` rows keeping no click handler as today).
   - *Reason:* (a) `pane.focus` matches `herdr-app`'s own `agents` (`~/.config/herdr-app/mods/agents/main.js:294,338`) and `peek` (`~/.config/herdr-app/mods/peek/main.js:51,70`), and focuses a seat's pane even if the agent process exited to a shell or reports `status: null` (`INTAKE.md:174`), whereas `agent.focus` opens a floating peek overlay when a terminal is paned-out; (b) `waits_on` excludes busy seats (`src/status.ts:621-623`), so `Working` rows must check `busy_since` before `waits_on`; (c) falling back to `pinFolder(row.folder, "files")` satisfies direction 1b (*"jumps to the agent's pane or log where the problem is read"*) for `Needs you` rows that have no started seat (`missing` readiness, parked/missing blocker) or whose pane was closed.
   - *Cost:* Adding `panes` import in `herdr-app/tasks/main.js:8` and ~15 lines in `model.js` + `src/status.ts`.
2. **Rejected:**
   - *`agent.focus`:* Opens a floating `peek` popup if the terminal has no pane (`~/.config/herdr-app/mods/peek/main.js:1`) and relies on agent status registration rather than `panes()`.
   - *Do nothing when seat has no pane:* Makes clicking `Needs you` rows with `missing` env/skills, parked blockers, or closed panes a dead click with no way to read `state.yaml`/`plan.md` unless the user expands the row.
3. **Evidence:**
   - `operator` · `issues/chart/tasks-hierarchy/forks/direction.md:23,28` (1b, 6c) & `INTAKE.md:171` · 2026-11-07.
   - `better-than-training` · `~/.config/herdr-app/mods/peek/main.js:51,70`, `~/.config/herdr-app/mods/agents/main.js:294,338`, `~/.config/herdr-app/herdr.d.ts:57,82,175-202`, `src/status.ts:576-623` · 2026-11-07.
   - `practitioner` · Multi-agent TUI dashboards (`workmux`, `Orca`, `peek/main.js`) check live pane presence first and fall back to static folder/log view when no live pane exists · 2026-11-07.
4. **Pitfalls:**
   - *`waits_on` is empty for busy seats (`src/status.ts:621-623`):* Using only `waits_on[0]` on a `Working` row yields `null` while A or B is actively working. *Removed by:* Checking `busy_since` before `waits_on` in `model.js` and testing a `Working` row click in `tests/tasks-mod.test.ts`.
   - *Session-qualified address (`infra/t12`) vs `panes()` bare address (`t12`):* `identity` Taken Q2 2a stores `<session>/t<N>` in `state.yaml`, while `panes()` in `herdr-app` uses bare `t<N>` (`herdr.d.ts:82`). *Removed by:* Emitting bare `t<N>` (or stripping `<session>/`) in `src/status.ts` and matching only when the repo's space is in `spaces()`.
5. **Unasked question:** Should `main.js` also check `spaces().some((s) => s.name === row.repo)` before `panes().some((p) => p.terminal === row.terminal)` so a `t7` in another `HC_SESSION` cannot collide with `t7` in the current window? (Yes — one guard in `main.js` prevents cross-session `t<N>` collisions.)
