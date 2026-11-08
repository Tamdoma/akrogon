# board-focus: merged notes (A,B,C,D,E)

Sources: fork-board-focus-A.md .. -E.md.

## Corrections (A, 2026-11-07)
- `waits_on` excludes busy seats (`src/status.ts:621-623`, pinned by `tests/status-json.test.ts:354`), so "the seat the leaf waits on" (A) misses a Working row's busy seat; busy seat first, then `waits_on` (B,D,E).
- Addresses are per core: a bare `t7` can collide across sessions, so the click checks the target belongs to this window before focusing (B,C,D,E).

## Q1. Scope
- In this epic (all): the operator already chose it (tasks-hierarchy 1b), it was blocked only by old pane ids, and `src/status.ts` seat fields change in this epic anyway. One small leaf after the engine leaf, producer field plus click, never inside the engine leaf (C,D); B,E: one leaf owning both producer and board. No layout change; the Tasks board stays opened by hand (all).

## Q2. Shape
- Command:
  - `pane.focus {terminal}`, only after the mod sees that terminal in its current `panes()` (B,D,E): matches the direction's "jump to the agent's pane", herdr-app's own `agents` and `peek` mods use it for pane-backed agents (`~/.config/herdr-app/mods/agents/main.js:294`), it works for a seat reporting no status, and the branch is chosen from native data before the call, with no try-then-fallback (B).
  - `agent.focus {terminal}` as herdr-setup's board does (A,C): one family with `agent.next`/`prev`, shows sub-agents and terminals without a pane. Against it: it can open a floating peek overlay for a pane-less terminal (E) and depends on status registration (B,E). C asks a probe for a no-status terminal.
- Target seat: computed by the producer beside `attention` and `waits_on`, never re-derived in the mod (`model.js:1-3` reads producer facts) (B,C,D); E puts the selector in `model.js`. Order: on Needs you the failed seat (`failure.slot`), else a seat with a delivery error, else none for non-seat problems (missing input, dead merge job, parked dependency); merge and broadcast rows B; otherwise the busy seat, then `waits_on[0]` (B,D,E; C similar). One problem per click, the first shown (B).
- Producer fields: each seat's terminal address (null when no live seat) and a `focus` seat (B,C,D); session qualification kept (B,C,D) or bare address plus a space check in the mod (E).
- No pane, ended seat, other session, unrecorded address: Files as today (all). Parked rows stay inert, Files/Changes buttons and the chevron keep their actions (B,D,E). No launching, attaching or recreating a terminal on click (B).
- Proof (B,D): producer unit tests for each branch, model tests, `herdr-app check`, one attended click in a throwaway window (cross-tab focus, ended seat opens Files, buttons do not trigger focus), free stand-in, no paid run.

## Corrections after rebuttals (2026-11-07)
- B: a finished terminal whose pane is still inspectable gets focused for its scrollback; Files only when no inspectable pane exists. `pane.focus {terminal}` prefers a visible layout terminal block while `panes()` lists model panes, so availability must respect that; core membership and ownership are checked beside the address. Selection follows the first shown problem before looking for any delivery error (missing-input facts come first in `leafAttention`), so such a row gets no seat. B did not prove `agent.focus` needs status registration.
- C: moves to `pane.focus`, chosen from native data before the call: `panes()` covers every pane in every tab with `terminal` and `status` (null allowed) (`herdr.d.ts:178-202`), and herdr-app's own `agents` mod clicks `run("pane.focus", { pane })` (`mods/agents/main.js:294,338`); `agent.focus` reaches only status-reporting agents (`agents()`), so a backgrounded Claude seat would be missed. Producer emits only `focus: "A" | "B" | null`; the mod finds the live terminal in `terminals()` whose `akrogon.repo`, `akrogon.leaf`, `akrogon.seat` labels match the row (identity Q2 labels; `terminals()` describes this window's core, `herdr.d.ts:209-212`), then its pane. That removes cross-session collisions by construction and needs no address or session field.
- D, E: no disagreement.
- A: moves to `pane.focus` on C's evidence.
