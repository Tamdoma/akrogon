# Merged content map (A, B, C)

Sources: content-A.md, content-B.md, content-C.md in this folder. Tags show which slots wrote the point.

## Inventory (agreed)

Header title and "N open" count; alert lines (scan error, run table, deploy failed, Failed per leaf, Missing per gap, repo unreadable/error, slow merge); repo name with "paused"; group headings from issue folders; merge queue and parked notes; row line 1 (two seat icons with spinner, slug, stage pill, phase age); row line 2 (tags then last move); open row detail (failure, seats with command and config source, plan path, worktree path, blocked by, missing, kept, last 10 history lines, Files and Changes buttons); empty states (A,B,C).

Built but never drawn: `done`, `attempts`, `verdict` (A,B,C); `busy_since` duration, envelope `generated`, `red` total, `first_prompt` (B,C).

## What the operator acts on

- Two seconds: what needs attention and why (A,B,C); B: "needs attention" is recorded evidence of a problem, distinct from "needs me", which no field records; what is working now (A,B,C); the machine broken, only when it is (B,C).
- On demand: full failure and recovery steps, the blocker and its state, queue place, last few moves, Files/Changes (A,B,C); verdict, attempts with fix rounds (C).
- Out of the routine scan: repeating one failure as alert + tag + detail (A,B,C); config source paths and command text (A,C; B keeps them in the expansion only); absolute paths as text (A,C); the run table as raw text (B,C); a historical slow merge as a top banner (A,B,C); fix-round counter and history on every healthy row (A,B).

## Categories

- K1 Needs attention: failed, a recorded missing artifact (not an unanswered question), a recorded delivery error on a seat with no busy timestamp (A,B,C); stopped (A; B and C: an operator-set hold in `stopped.yaml`, belongs with K5); blocked on a parked/missing/unreadable dependency, land dead (C). Each with one reason phrase (A,B,C).
- K2 Working: a seat busy now (A,B,C); a live land counts (B). A row can be K1 and K2 at once (B).
- K3 Waiting: on another leaf (A,B,C), in the merge queue (A,B,C).
- K4 Between seats (live phase, no blocker, a required seat idle): derivable from `busy_since` and the phase's required seats, akrogon's watch rule defines it (C); whether a dispatcher will come is not in the data, so "needs me" for K4 needs the producer's dispatch time or the operator's answer (B,C).
- K5 Paused, parked or stopped: quiet line or row fact, grey pill (A,B,C).
- K6 Recently done: merged leaves still under an open epic are rows today (muted slug, no pill); C keeps the fact as one dim line per repo, "3 of 5 merged". This is not the removed Last merges list (envelope `merges`), so dropping the rows would be a new removal (C). A and B had read it as Last merges.
- K7 Machine: scan error, deploy failed, repo unreadable (red) (A,B,C); a waiting run stays visible at a glance with the raw table on demand (B); a historical slow merge goes quiet (A,B,C).

## Missing that the operator would act on

- One reason phrase per K1 row as its second line (A,B,C).
- Busy duration of the working seat, from `busy_since` (C); it justifies a look, not a "stuck" label: no heartbeat field or agreed threshold exists (B).
- Review verdict after check (C).
- Last-success age when old rows stay after a scan error (B).
- Header count of rows needing the operator, equal to the panel-bar red dot (C); the dot's `env.red` also counts unreadable entries and a deploy failure, so decide task-only count vs all problems (B); "N open" counts blocked and stopped rows (C).
- Exact subphase (review vs repair) visible, not only the first word (B), and which seat the phase waits on (C).
- Delivery error details on demand (B).

## Forks

- N1 List shape: a) sections by category across repos, repo as a dim prefix, like the Agents list (A leans, C recommends via D19 match-the-mods; rows already move between sections there and the row key repo/slug keeps expand and pin across a move, C); b) repo → issue group with row states (B recommends; category sections split siblings and move rows). Group headings as rows go (C) vs stay (B).
- N2 Needs-attention definition: which recorded facts justify which category, and whether the current data supports them or needs a producer change (B); one producer-owned predicate so the CLI count, the panel-bar dot and the board agree (C); computed in the mod (C rejects: dot and board can disagree). The two are compatible; holds, normal waits and no recorded activity never become failures to make counts match (B).
- N3 A leaf between seats with no blocker: "waiting for next", dim (C recommends); needs me (C O2); producer records the last dispatch pass and turns it red past N minutes (C O3). C asks the operator whether a watch runs during the day.
- N4 Second line: the category reason, last move to the detail (A,B,C agree).
- N5 Task alerts: the row owns the task reason; the top keeps machine and repo problems (A,B,C agree). Repo read errors always stay visible (B).
- N6 Time column: busy duration for working rows, phase age otherwise, short form "9m" (C); quiet phase age, no overdue alarm without a threshold (B).
- N7 Open row: current reason, waiting reason, Files/Changes; config sources out (A,C); short plan path and last 3 moves (A); plan and worktree paths gone as text, history on demand at its current depth (C); keep diagnostics in the expansion, readable not truncated (B).
- N8 Repo scope: all repos, current first (A,B,C as now); current repo only (A option; breaks count-equals-dot because the panel-bar dot counts every repo, C).
- N9 Actions on the board: none, read-only (C; A,B add none).

## Pitfalls

- Categories must come from fields the producer emits (A,B,C); K4 may be derived from `busy_since` and required seats, but "needs me" for K4 needs the dispatch time or the operator's answer (C).
- A removed tag needs a place on demand or an explicit "never" (A); expanded `field()` truncates, so recovery text needs a readable treatment (B).
- Tests lock `tags()` text, alert lines, group headings and paused pills; changes cite them (A,C).
- The Needs you panel is gone, so Tasks is the only board (C).
- The kept treatment is locked (A,B,C).
- A producer change (`leafRed`, run table fields, dispatch time) is a second leaf in akrogon src with its own tests (C).

## Where slots differ

- N1 list shape (A,C vs B).
- Stopped: needs attention (A) vs intentional hold (B,C).
- Merged rows under an open epic: one dim line (C) vs leave out (A,B, who read it as Last merges).
- Seat config in the expansion: out (A,C) vs kept (B).
