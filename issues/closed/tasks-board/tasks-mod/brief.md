# Brief: tasks-mod

## What

A herdr-app mod `tasks` shipped in akrogon and linked into `~/.config/herdr-app/mods/tasks` by `akrogon install`. It reads only `akrogon status --json` (from leaf `status-json`) and shows the board: alerts on top, repo groups with epic/issue folders, two-line leaf rows with seat logos, stage pills and tags, folded charts per repo and folded last merges. A click expands the row with its history, seats, plan path and kept paths, and Files and Changes buttons that pin those panels to the leaf's worktree and open them. Read-only, straight outer edges.

## Why

The operator asks "Is everything moving? Nothing stuck? did it merge?" about 83 times in two weeks and runs `akrogon status` by hand (intake "Agent findings").

## Done-criteria

1. With the mod linked into a throwaway herdr-app session and shown in a probe layout, the board renders every repo from a recorded `akrogon status --json` envelope, the current space's repo first, then alphabetical; repos with no open leaves fold into one line.
2. A leaf row shows its seat logos ("<logo>A <logo>B", the letter alone when no Program matches, the Agents-list spinner in `t.working` on a working seat), slug, stage pill, uncolored time and tags; red marks only rows the envelope marks `red`; slow merge is an amber alert line (D).
3. Stage pills use the theme's ANSI slots (plan `ansi4`, implement `ansi6`, check `ansi5`, merge `ansi2`, failed `ansi1`, parked/stopped/paused grey), drawn as the stage word in `t.foreground` on a `t.background` base with a ~12% stage tint and a 6 px stage-colored dot; merged rows have no pill. Screenshots of every pill on plain, hovered and selected rows in the operator's current Omarchy theme (herdr theme `omarchy`) show cyan and green apart and the text readable (B).
4. Clicking a row expands it in place; its Files and Changes buttons set `worktree.pin` for the current space to `{ machine: null, folder: <leaf worktree> }` and send `panel.request` `{ op: "open", view: "files" | "changes" }`. That the panels then open pinned needs herdr-setup's `panel-top-bar`, `files-panel` and `changes-panel` landed; that end-to-end look is the chart's pending check, not this leaf's criterion (B).
5. When a status exit 1 envelope arrives, healthy repos render and the error shows; the board is never blank.
6. Shown times advance at least once a minute while the board is visible without rerunning the command; the command reruns on changes under the envelope's `watch.folders`, never overlapping a running scan (B).
7. `akrogon install` and the self-update deploy both link the mod folder into `<home>/.config/herdr-app/mods/tasks` (proven against a temporary home); a second run changes nothing; `herdr-app check` passes on the mod folder (D).

Proof: the view model (envelope in, rows out) is a pure module proven by the repo's `test` check over an envelope recorded from `status-json`; criteria 1, 3, 4 and 6 are a live run in a throwaway herdr-app session (`herdrapp --session <name>` with `HERDR_APP_HOME` and `HC_SESSION` set, the mod folder linked into that session home, deleted afterwards). Sessions with shots run one after another: every window shares the one display and a covered window stops drawing (P6) (D). Theme screenshots never change the operator's Omarchy theme: each theme's herdr theme file is generated into the throwaway session home by running herdr-setup's `omarchy/apply-herdr-app-theme` with `XDG_STATE_HOME` pointed at a temporary folder holding that theme's files under `omarchy/current/theme` and `HERDR_APP_HOME` at the session home (A).
