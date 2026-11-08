# Fork notes board-focus: slot D

Practitioner sources: none searched; no web access in this seat.

## Q1. Scope

Pick: In this epic, but as one small leaf after the engine leaf, never inside it. It includes only the producer fields, the model's click target, and the mod click change; no placement of the Tasks mod into operator layouts.

Reason: this is not a new feature invented during migration. Direction 1b was taken earlier, and the intake records it as blocked solely because the old pane ids cannot be focused by herdr-app; seat terminals remove that blocker. Cutting over with the row still opening Files would knowingly leave a recorded behavior stranded. It is also small and bounded: state already records each seat's address (identity Taken), `herdr-app/tasks/model.js` is a pure model with tests, and `src/status.ts` already builds a per-seat object.

Cost: one additional leaf depends on the engine's recorded addresses and brings a live-window click into the proof trail; it must not delay the first switch.

Rejected: later issue (reopens a taken direction and leaves the board pointing at Files while the precise seat pane is available); folding it into the engine leaf (adds UI behavior and a window proof to the cutover's highest-risk landing).

Evidence: operator direction 1b/6c in `issues/chart/tasks-hierarchy/forks/direction.md`; INTAKE line 171 carry; `herdr-app/tasks/main.js:249` still pins Files; taken forks on identity/start. Read 2026-11-07.

Pitfalls: if the leaf lands before terminal addresses are always recorded, rows can silently fall back everywhere. Removed by ordering after the engine and by a done-criterion using one real recorded seat address from the proof leaf.

Not asked: should this leaf also make the Tasks mod appear in an operator layout? I say no; opening it by hand is today's practice.

## Q2. Shape

Pick: `run("pane.focus", { terminal: address })` on the row body's click, after the mod verifies that `panes()` currently contains that exact terminal in this window. If it does not, the click does exactly what it does today: pin the leaf folder to Files. The producer adds three leaf fields: `seats.a.terminal`, `seats.b.terminal` (the current session-qualified recorded address or `null`), and `focus_seat` (`"a"`, `"b"`, or `null`), computed beside `attention` and `waits_on` in `src/status.ts`, not re-derived in `model.js`. Choice order: on Needs you, the failure's recorded slot, else a delivery-error seat that contributed to attention, else no seat for non-seat problems (missing input, dead merge job, parked/missing dependency); on broadcast-pending or merge rows B; otherwise the earliest busy seat, then `waits_on[0]` if that seat has a terminal; otherwise no seat. Expanded Files and Changes controls remain unchanged.

Reason: `pane.focus` targets the actual pane showing a terminal, matching direction 1b and the intake; shipped agent lists use it for pane-backed agents (`~/.config/herdr-app/mods/agents/main.js:294`). Producer-owned `focus_seat` preserves Tasks model’s stated rule that it reads producer facts and never re-derives them (model.js:1-3). A session-qualified address plus a live `panes()` membership check prevents a board in one session from trying to focus another core's terminal with a colliding address. Files fallback preserves every current use when there is no live pane (not started, ended, another window's session, or a problem with no seat).

Rejected: `agent.focus` (its contract is “show an agent,” including a sub-agent, and can mean the focused-agent view rather than the leaf tab's own pane; herdr-setup's broad agent board uses it for agent cards, but a leaf row wants the recorded seat in its leaf tab). Expanding instead when no pane exists is also rejected because the row body currently has a useful Files action and the chevron already owns expansion. `terminal.peek` for a live terminal with no pane is rejected: leaf seats are required to have visible panes, so a missing pane is an anomaly to inspect, not a second viewing mode to normalize. Having the mod derive the problem seat from attention text is rejected as brittle duplicate judgment.

Cost: status gains a field whose semantics tests must pin, and a click can now leave the Tasks panel context for a pane, as operator direction intends. The mod must pay attention to the address's session qualification; a bare `t12` is not enough.

Evidence: better-than-training: direction and intake above; `herdr-app commands` descriptions for `pane.focus` and `agent.focus`; `herdr.d.ts` says `pane.focus {terminal}` prefers a visible terminal block, then a model pane; `src/status.ts:516-640` builds seats, attention, failure, delivery errors and `waits_on`; `herdr-setup/mods/board/main.js:37` uses `agent.focus` for generic agent cards. Read 2026-11-07.

Pitfalls: a recorded address can be stale after restart, so the mod should require it in current `panes()` and, where labels are available from `terminals()`, require the leaf/seat labels to match; otherwise fall back. In a layout with a composition terminal block, `pane.focus {terminal}` focuses that block rather than the source pane; still the terminal is shown and focused, but a live attended probe in both flat and board layouts must confirm it selects the leaf tab/pane as expected. An ended terminal's pane is closed, so the Files fallback covers finished seats; transcript opening is not part of this leaf.

Tests and probe: producer units for terminal nulls and every `focus_seat` order branch; pure model tests for click target and fallback; `herdr-app check` for the mod; one attended live click in a throwaway window proving cross-tab focus, and one ended-seat row proving Files still opens.

Not asked: should clicking a seat icon focus that specific seat even when `focus_seat` names the other one? I leave icons non-interactive in this leaf to avoid adding a second click grammar.