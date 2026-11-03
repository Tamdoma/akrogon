# Merged opening map (A from map-A, B from map-B, C from map-C, D from map-D)

Tags name the seats whose map holds the line.

## Settled across seats (no disagreement)

- Source lives in /home/ivan/Work/omarchy-customizations/herdr-app; never edit shipped mods in ~/.config/herdr-app (A,B,C,D). Shipped files/changes must be cloned with `mod.clone`, which rewrites asset paths (C).
- Delivery gaps: new mod folders reach running sessions only on the next `herdrapp` launch; `workspace.panels` in a session's shared.json is copied only at session creation; install.sh switches to `board` while live shared.json says `flat` (B,C,D).
- Repo is not registered with akrogon (`repo: none`), so leaf routing is unresolved (A,B,C,D).
- `issues/log.jsonl` alone cannot feed Tasks: current phase, active seats, busy_since, blocked-by, worktree live in `issues/open/**/state.yaml`; a new leaf has no log rows; the log's slot is the finishing slot (B,C,D). Logs exceed `readTextFile`'s 1 MiB cap (akrogon timings.jsonl 2.97 MB, framework log 2.3 MB) (B,C).
- Today's leaf state holds old-herdr pane ids; a stable leaf-to-terminal identity belongs to the akrogon herdr-app port (labels) (A,B,C,D). A mod sees only its own session's core terminals, so cross-session rows have no live target (B,C).
- Needs-you must include `done` agents, not only `blocked`: a door asking a question ends its turn as done/idle (A,C,D; B: "idle prose").
- `report.msg` from hc is a short status, not the question; question text only from `hc read` (screen while blocked/working) (B,C,D).
- Any reply must bind to the exact target terminal and turn, revalidate before send, and show errors; never blind retry (B,C,D).
- A6 sends only after an explicit Send on an editable draft that allows free-text notes ("1a - note") (B,C,D).
- Changes branch scope = merge-base diff against the repo's default branch, not a literal `main` (A,B,C,D).
- Markdown via `TextView.markdown` with a raw toggle (B,C,D).
- Worktree selection: one shared per-space selection used by Files and Changes, default "follow focused pane", discovered with `git worktree list --porcelain` (A,B,C,D). Open-as-pane = `pane.split {mod, props}` with the source pinned in props (A,B,C,D).
- Spaces already scrolls (mods/spaces/main.js:375); the defect is flat.json giving Spaces and Agents weight 1 each (A,B,C,D).
- Look: only `theme()` tokens, no hex; logos via `Program.icon` (tint → svg in a text color, else image), never mapped by name; native spinners, no redraw timers; git reads keep `--no-optional-locks -c core.fsmonitor=false` (A,B,C,D).
- `herdr-app check` alone is not proof; done needs in-app shots of empty, busy and narrow states (B,C).

## Where seats differ

1. Tasks data source.
   - Akrogon gains a read-only JSON snapshot (`akrogon status --json`), mod consumes only that; separate akrogon outcome (A,B; C long-term). Cost: second destination, Tasks waits on it.
   - Mod reads `~/.akrogon/config.yaml`, `state.yaml` and log tails itself, watchFolder per repo `issues/` (D; C as interim). Cost: duplicates akrogon's state and queue rules in JS; breaks on schema changes; YAML parsing without a library.
2. "Red past normal".
   - Show elapsed always; color only past an operator-chosen per-phase threshold (C) or only when a defined baseline exists (B).
   - Median of the last 20 visits with fallbacks, red at max(1.5×median, median+2m) (D).
   - Reuse akrogon's own slow judgment (A).
3. Jump before the port lands.
   - Match pane cwd to the leaf worktree now; no jump when nothing matches (C,D).
   - No fuzzy matching; wait for the port's identity labels and a cross-session probe (B).
4. Needs-you reply transport.
   - `hc send --if idle` for idle prose; `--force` only after the operator's explicit submit to that identified question; permission/auth dialogs open the terminal instead (B). Probe each harness first; drop the reply box if menus dominate (C).
   - Always `hc send --raw --force` (D).
   Needs-you placement: separate sidebar block (B,C) vs top of `agents-by-tab` so it collapses to 0 px, since a layout block keeps its size when empty (D).
5. Decision detection (A6).
   - Agents write a small structured record of the current question and options; UI never parses prose (B).
   - Trust only a trailing block of 2+ coded lines after the last blank line; state that convention in the shared rules (C).
   - Parse `hc read --lines 120` after the last prompt line with a strict grammar (A,D).
   Strip placement: a layout block reserves space even when empty (C,D) → floating block (C) or a cloned `pane` header/footer (D).
6. Clones.
   - `tabs`: clone it, since it hardcodes only Files/Changes buttons and per-space panel memory (B,D); or no clone, reach Tasks by a prefix key (C).
   - `spaces`: clone to add `.id("spaces-list")` for stable scroll (D); probe first (B); layout-only (A,C).
   Commit button: remove (A,B,C) vs per-file checkbox staging (D).
   Files filter: repo-wide path filter over tracked and non-ignored files (B) vs filter loaded entries only (C). "Recent": git history plus uncommitted (B,C) vs mtime (A).
   Layout scope: ask whether `board` still matters (B,C) vs edit both (D). Panel card radius: keep files/changes rounded cards (C) vs 0 radius to match flat (D).

## Questions seats raised for the operator

- Which layout is daily, flat or board? (B,C,D)
- Tasks: all repos in every session? A row with no live terminal, useful or noise? Which seat when A and B both run? (B,C)
- Which harnesses must Needs-you and decisions support on day one? (B,C)
- Can agents publish a structured question record, or is A6 best-effort? (B)
- Logos: tinted glyphs vs full-color logos, decided once for all surfaces (C).
- How much sidebar height for Spaces and Needs-you? (B)
- Recent: time window or commit count? (B)

## Pitfalls and what removes them

- Clone drift after Herdr updates: fewest clones; README lists each clone with `cloned_from` (B,C).
- Wrong-target send after focus change, restart or new turn: target and turn captured at render, revalidated at click (B,C).
- Stale or partial board looks healthy: per-repo errors and snapshot age shown (B,C).
- Hidden copies polling and redrawing: watchFolder on `issues/` only, coalesced; age text on a ≥60 s timer (B,C,D).
- `layouts/.state` clicks mask layout edits: test from a fresh state and in every session (C,D).

## Splits proposed

- A: L1 Changes, L2 Files, L3 Tasks (needs akrogon JSON), L4 Needs-you + decisions, L5 sidebar.
- B: W1 layout/tabs/sidebar/install, W2 shared checkout context, W3 Changes, W4 Files, W5 akrogon JSON, W6 Tasks, W7 Needs-you, W8 decisions.
- C: U1 sidebar, U2 Changes, U3 Files, U4 shared folder + picker + pane, U5 Tasks, U6 Needs-you list, U7 reply box, U8 decisions (U7/U8 gated on probes).
- D: one foundation leaf (layout, sessions, tabs, spaces) then three parallel: Files+Changes, Tasks, Needs-you+decisions.
