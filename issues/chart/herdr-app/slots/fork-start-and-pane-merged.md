# start-and-pane: merged notes (A,B,C,D,E)

Sources: fork-start-and-pane-A.md .. -E.md.

## Corrections (verified by A, 2026-11-06)
- `akrogon start <slug>` already exists (resumes a stopped leaf, `src/akrogon.ts:158-162`, `src/stop.ts:97`); the new command needs another verb (B,E): `akrogon seat-start` (B) or `akrogon spawn` (E).
- `first_message` is only reported for hc template runs (`hc schema`: "Template runs: whether the first message went in"), so a direct `hc run <harness> "<task>"` cannot be checked with `first_message.sent` (B, v). A and C assumed it could. Delivery proof moves to the delivery fork (hc templates give sent/started/turn and a 60 s readiness retry, `hc --skill`).
- `hc run` has no `--env` flag; `terminal.run` in `hc schema` takes `env` (B,D). Leaf env (`AKROGON_BASE`, `TMPDIR`, `GIT_EDITOR`) needs `env K=V` in argv (D) or the API's `env` (B).
- Live document today: chart tab A 0.66 / column 0.34, consultants 0.61/0.50/0.42/0.47 after the operator's drag (C,D,E): the column is one flat list with per-child weights, so any count can be equal by weights.

## Q1. Lifetime
- Leaf seats `--no-parent` (all): closest to old herdr (panes owned by the server); otherwise B started by `next` inside A's terminal becomes A's child and dies with it (C,D,E). `--keep` comes with label adoption anyway (C); after a core loss a seat is a shell at the same address and the listener reports a crash (C,D).
- Consultants and direct reviewers: children of their door, die with it (all); explicit `--parent <door>` (B,E).
- E adds `--no-notify` for leaf seats; D adds watch and operator terminals as parentless.
- Open: a door whose program exits into its kept shell: do helpers die then or only when the terminal is removed (B).

## Q2. Leaf tab
- Labels with an akrogon-minted tab id in herdr-app's form (`tb` + 32 hex), A first, then B beside it (all): works with the window closed, no app command needed, no focus command issued.
- Tab name (no name label exists): `doc.set` on the core document, versioned (B as a herdr-setup operation, E in akrogon's hc module); a herdr-setup mod renaming a tab whose terminals carry `akrogon.leaf` (C); `tab.rename` when the window answers, retried each pass (A,D).
- Rejected by all: `tab.new` (needs the window, shows the new tab, no hc name, labels or parent).
- Probes: does adoption focus or activate the new tab (C,D); does a minted id work and B land right of A (D); does `env` in argv hide the harness from hc status (D); does the pane bind before the harness runs its first task (B).
- Open (B): with the window closed, does "visible pane" mean a terminal already placed in its saved tab, shown when the window opens? (B recommends yes, matching the old server-owned layout.)

## Q3. Consultant column
- Equal heights for any count, not accepted away (B,C,D,E): set the column children's weights equal and A vs column 1:1 through `doc.get` + `doc.set` with the read version, retry on conflict, verify by re-read; edit only weights and order of one column (all). A's fallback "accept halving" is dropped.
- Where the write lives: herdr-setup, per signpost 3 (B as a presentation operation, C as `herdrapp pane-weights`), or akrogon's hc module next to `doc.get`, because start is its only caller and a cross-repo call on every start invites skew (D,E; D asks the operator to confirm).
- Restart of one consultant: swap the terminal in its existing node, keeping siblings and geometry (B,E); or keep then equalize, re-place all if order breaks (C,D).
- Open: after the operator drags, does a restart keep the drag (B: keep, equal only when the roster changes) or reset to equal (D: reset on any start)?

## Q4. One start command
- One function used by the engine, exposed to skills as one CLI verb (all), taking role (leaf seat, consultant, direct reviewer), repo, seat, harness spec, first task; deriving name, labels, parent, cwd, env; placing the pane; returning name, address, tab and observed outcome (all).
- Harness spec for consultants: from `<chart>/seats.yaml` when given `--chart --seat` (E), from the caller's seat record (D); leaf seats from config as today (all).
- Restart as part of the verb (`--replace`/`--restart`: kill, wait finished, start, re-place) (C,D lean), or composition by the door (D asks).
- Codex argv without `--no-daemon` refused, not rewritten (D); config fork owns flags.
- A partial start (process created, placement failed) returns non-zero with the address and is never replayed blindly (B,C).

## Corrections after rebuttals (2026-11-06)
- B: restart is composed by the door (plain `hc kill`/wait, then the common start); a `--replace` wrapper widens code past signpost 1a and would need the operator's exception. Deferred `tab.rename` is not equivalent to old behavior: the name should be committed as part of start. A failed placement needs an explicit cleanup owner so no agent is left running without a pane; wrong geometry is a different, milder case.
- C: live consultants show `first_message: null`, `template: null`; a direct run's only proof is `turn >= 1` or `working` in one `hc get` after start. C now weighs hc templates (akrogon install could write `~/.config/herdr-core/templates/<kind>.md` from `harnesses:` with an empty body) against direct runs in the delivery fork. C holds herdr-setup for the weights write: a herdr-app format change then breaks a presentation script the door calls, not akrogon's engine tests and deploys; the engine never needs weights (leaf tabs are two panes); reading with a strict schema (identity) and writing structure are different risks.
- D: no lifetime claim for watch or operator terminals (misattributed). D withdraws its template rejection pending the delivery fork; D's start guarantee reads "observed outcome", not a verified first message.
- E: restarting a consultant under the same name kills the old terminal first, which removes its node; so snapshot the column before the kill, or order the column by seat letter when writing.
