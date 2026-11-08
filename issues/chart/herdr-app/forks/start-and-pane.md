# Start command, lifetime and visible panes

## Question

Q1. Lifetime: which agents outlive the terminal that started them? Today old-herdr panes belong to the herdr server, so a leaf seat survives any door or engine process ending. On hc, children end with their parent unless `--outlive-parent` or `--no-parent` (`hc run --help`); the intake tests started consultants as children of the door. Leaf seats are started by the engine (from the listener service or `akrogon phase`/`next` in some seat's terminal). Direct-route reviewers and consultants are started by a door.

Q2. Leaf tab and seats: today the engine creates one tab per leaf in the repo's workspace, labelled with the slug, without taking focus (`tab create --label <slug> --no-focus`, `src/next.ts:581-592`), seat A in the first pane, seat B split right. On hc/herdr-app: (a) start each seat with `hc run --label herdr.space=<space> --label herdr.tab=<new tab id akrogon mints>`, which makes herdr-app create the tab from the core side (AGENTS.md "The model": "An id Herdr doesn't know becomes a new space or tab (unnamed: Herdr's names)"; works with the window closed; B arrives beside A); the tab then needs its slug name (`tab.rename` is an app command needing the window; no name label exists); (b) `herdr-app do tab.new --name <slug> --argv ... --task ...` (needs the window; starts the agent in a shell that stays open); (c) other. Which, and how does the tab get its name and stay unfocused?

Q3. Consultant column: proven by hand: start unlabeled, then `terminal.keep` in balanced order gives 4 equal heights (INTAKE agent findings 2026-11-06); 3 seats cannot be equal by halving (50/25/25); herdr-app has no pane-weight command. The core's `doc.set` (versioned write of the `herdr-app` document, `hc schema`) could set weights, as could a herdr-setup piece built on it. Is unequal acceptable for 3, 5, 6 seats, or does a herdr-setup helper set equal weights? And does the same column logic restart a single consultant into its old spot?

Q4. One start command: what does it take and guarantee (name, labels, harness argv from config, first task in `hc run`, pane, `first_message.sent` check), and who calls it (engine internally, door and direct review from skill text as `akrogon start ...`)?

### Carries

- Signposts `## Taken` and correction: closest to old herdr unless less elegant or not working; 1a code only for the start step; 3 gaps patched in herdr-setup.
- engine-shape Taken: engine keeps one hc module; listener service; phase runs next.
- identity Taken: space by name via `doc.get`; state keeps tab id, seat address, turn; names `<prefix>-<slug>-<a|b>` (code only when cut), consultants `<prefix>-slot-<letter>`; constant filter label plus `akrogon.repo/leaf/seat`.
- Intake (operator): every agent akrogon starts gets its own visible pane in the same step that starts it, and again after any restart; A takes the left 50% of the chart tab, consultants stacked right in naming order with equal heights; the start helper owns this so a door cannot skip it.
- Intake findings: `terminal.keep` is pending and racy (retry until `herdr-app ls` shows the pane); every restart lost placement; codex sandboxed argv needs `sandbox_workspace_write.network_access=true`.
- Related forks: delivery.md, config.md, chart-door.md, board-focus.md.

## Findings

Merged notes: slots/fork-start-and-pane-merged.md (with rebuttal corrections); seat notes slots/fork-start-and-pane-{A,B,C,D,E}.md.

- Q1: leaf seats `--no-parent`; consultants and direct reviewers children of their door (all).
- Q2: leaf tab created core-side by labels with an akrogon-minted tab id, A then B (all); the name written at start through the core document (B,E) or by a herdr-setup mod reacting to labels (C) or by `tab.rename` when a window answers (A,D; B rejects as weaker than today).
- Q3: equal heights for any count by `doc.set` weights (B,C,D,E); the writer in herdr-setup (B,C, signpost 3) or in akrogon's hc module (D,E).
- Q4: one start function plus one CLI verb other than the existing `akrogon start <slug>`; restart composed by the door (B) or a replace mode (C,D).
- Verified: `first_message` exists only for hc template runs (`hc schema`), so direct runs need another start proof (delivery fork).
- Research: better-than-training · `src/next.ts:568-676,786-811`, `src/akrogon.ts:158-162`, `herdr-app commands`, AGENTS.md "The model", `hc run --help`, `hc schema` (`terminal.run` env, `doc.set` CAS, `first_message` template-only), live `doc.get` tab tree · 2026-11-06. practitioner · tmuxinator issues 206/651 (layout replay mis-sizes panes until the layout is applied explicitly), tmux `select-layout even-vertical` after splits, WezTerm `pane:split` with explicit size, Evil Martians Overmind (independent worker lifetime) · 2026-11-06.

## Taken

Operator 2026-11-06, door t15, verbatim: "1a | 2a - but it needs to show as a visible tab in herdr-app if herdr-app turns on or is turned on | 3a 3c | 4a"

Read as:
- Q1 1a: leaf seats start `--no-parent` and outlive doors and listener restarts; consultants and direct reviewers start with `--parent <door>` and die with it.
- Q2 2a: a leaf's seats join a tab through labels with an akrogon-minted tab id (A first, then B beside it); no app command and no focus change at start. Operator addition: the tab must show as a visible tab both in an already running herdr-app window and when herdr-app starts later. That is a done-criterion of start, proven live in a throwaway session for both cases. Tab naming: see Q2b.
- Q3 3a 3c: equal consultant heights come from a herdr-setup helper the door calls, which reads the core document, sets equal weights in the consultant column with the read version and re-reads to verify; the engine never calls it. A consultant restart keeps the operator's dragged sizes; heights go back to equal only when a consultant is added or removed.
- Q4 4a: one start function in akrogon, exposed to skills as one CLI verb with a new name; it derives name, labels, parent, cwd and env, starts, places, and on failed placement kills the agent it started and exits non-zero with the address. Restart is the door's `hc kill`, then the same start.

Operator 2026-11-06, door t15, verbatim, on Q2b (tab name, 2c mod vs 2d write at start): "whatever is the closest to how it it now. Don't invent new stuff. WE can always improve later"

Superseded 2026-11-06 by the final-shape check (C,D,E; `hc schema` doc.get/doc.set "opaque JSON document"): only a running herdr-app window creates a tab entry, with an empty name, after `hc run` returns; with the window closed there is no tab to name, and akrogon writing the entry itself makes herdr-app skip adoption (E). Re-asked as N1 (herdr-setup mod names the tab when herdr-app creates it) vs N2 (akrogon renames with `tab.rename`).

Operator 2026-11-06, door t15, verbatim: "N2"

Read as:
- Q2b N2: akrogon names the leaf tab itself, as today, with herdr-app's `tab.rename`. Window open at start: start waits until the tab and pane show (its placement check) and renames the tab to the slug. Window closed: the first engine pass that finds the window open renames any leaf tab of a recorded leaf whose name is not its slug. No mod and no `doc.set` from akrogon. Cost: after the window opens, a tab may show its place number until the next turn ends.
- F1 (B): any versioned `doc.set` (the 3a weights helper) re-reads the latest document on conflict and applies its change to that, never resending a stale copy; a probe changes another tab between read and write and checks the change survives.
- F2 (C): start reads the caller's `HC_TERMINAL_ID` before stripping inherited hc variables and passes it as `--parent` for consultants and direct reviewers.
- F3 (C): the engine's hc module list (engine-shape Q1) also holds the start command and `doc.get`; akrogon also calls herdr-app's `tab.rename`; `doc.set` lives only in the herdr-setup weights helper.
- F4 (D): the open-window probe also checks that the active tab and focused pane do not change.
- F5 (D): a failed rename leaves the seat running and status shows the tab unnamed; only a pane that never shows kills the agent (Q4).
- Probes for Q2: tab and slug name show in an already open window and in a window opened after start; B splits into A's tab in both; a running window keeps the name after B joins and after a split (C3).
- Corrections from the N2 check (B,C,D,E, 2026-11-06), recorded without changing a pick:
  - Window check first (C,E): start asks `herdr-app ls` with the session's `HERDR_APP_HOME`; only the "no Herdr window" answer means closed, any other error is reported (`doc.get` alone cannot tell, it serves the saved document with no window). Open: wait for the pane, kill on timeout (Q4), then `tab.rename`. Closed: start returns after `hc run` with the labels set, and adoption plus naming wait for the window; a closed window is never a failed placement (B,E).
  - Expected name follows the leaf's phase (D): `<slug> failed` when failed (`src/phase.ts:125-127`), the slug otherwise (`src/phase.ts:230-231`). akrogon owns leaf tab names as today, so a manual rename of a leaf tab is not kept (C note).
  - Scope (C): every engine pass that finds the window open renames every recorded leaf tab of the repo whose name differs from its expected name.
  - Window home source (C): `~/.config/herdr-app-sessions/<session>` is herdr-setup's convention and `default` has no such folder; where akrogon reads it goes to the config fork.
  - Probes added: window closed longer than start's pane wait, then opened: seats alive, named tab shows (B); a leaf failed while the window was closed shows `<slug> failed` after opening (D); window closed gives a clean pass with status showing the tab unnamed (C).

Correction proposed 2026-11-07 by A within Q3 (leaf review K3: B,C,E; forks/proofs.md P11), pending the operator's final approval: labels alone put a door and its consultants in one row with uneven weights, and an added consultant joins as a split of the last pane, so the herdr-setup helper also builds the column. Consultants start with the door's `herdr.space` and `herdr.tab` labels (read by the start verb from `doc.get` for the caller's terminal); the helper lays the door's tab out as the door on the left and one column on the right holding the door-created consultants in seat-letter order (door and column 50% each when it first builds it, per the operator's 2026-11-03 rule in INTAKE), equal heights when the set changes, and on a restart keeps the weight at that position; it works from its argument list and the current document only, and never moves supplied consultants or other panes (final check B,C,E). `doc.set` still lives only in herdr-setup; the engine never calls the helper.

Operator 2026-11-07, door t15, verbatim: "1a | 2a | 3a" (final handoff review Q1 approves the column correction above).
