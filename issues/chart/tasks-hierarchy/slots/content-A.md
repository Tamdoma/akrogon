# Content map, slot A

Inspected: `herdr-app/tasks/model.js` (tags, leafRow, alerts, board), `model.d.ts` (Envelope, LeafJson, RowModel), `main.js` (row, repoSection, note, render), screenshot `issues/chart/herdr-panels/direct/live/tt-01-small.png`.

## Inventory (element, source)

Header
- "Tasks" title (fixed); "N open" count = rows with a pill (`render`).

Alerts (top of list, `alerts()`)
- run line, `env.run` (yellow).
- deploy failed, `env.deploy` (red).
- "Failed: repo/slug" per failed leaf (red). Repeats the row's own red state.
- "Missing: repo/slug kind name in holder: steps" per missing input (red). Repeats the row tag and the detail line.
- unreadable path / repo error, `repo.unreadable`, `repo.error` (red).
- "Slow merge: …", `repo.slow` (yellow), shown even when the repo has no open leaf.
- scan error, `this.error` (red).

Repo section (`repoSection`)
- repo name, "paused" word, group headings from `leaf.group`, "merge queue" note (`repo.queue` with place and "no merge record"), "parked" note (`repo.parked`).

Row, line 1 (`row`)
- seat icons A and B (`busy_since`, harness icon), slug (red if `leaf.red`, muted if merged), stage pill (`leaf.phase`, muted if stopped or repo paused), time in phase (`phase_since`).

Row, line 2 (`tags()` + last history move)
- blocked-by slug (label), stopped, broadcast pending, land alive/dead, "a prompt <code>", failure cause: reason, missing kind name, fix rounds N, then last move "from → to".

Open row detail
- failed (cause: reason), seats "A harness command — config source path" x2, plan path, worktree path, blocked by, missing (full), kept slices (repo-wide, repeated under every open row), last 10 history lines with age, Files and Changes buttons.
- Built but not shown: `done`, `attempts`, `verdict`.

Empty and error states
- "Loading tasks…", "Board unavailable; retrying on the next tick", "No registered repos".

## What the operator acts on

Two seconds: "does anything need me?", then "is work moving?". Evidence: the operator removed Charts, Last merges, Housekeeping and the quiet line as clutter today (INTAKE of tasks-panel, D19 era), kept the seats big and spinning (wants to see motion), and asked which issue is "active".

- See at a glance: needs me (failed, missing input, a prompt delivery error, red check, stopped), working now (a busy seat), how long it has been in its stage.
- On demand (open row): why it failed in full, what it is waiting on, the last few moves, Files and Changes, plan path.
- Never by default: config source paths, harness command text, fix-round count, attempts, broadcast pending, land alive/dead, the repo-wide kept list under every row, history beyond the last few moves.

## Categories proposed

1. Needs you: failed, missing input, prompt delivery error, red, stopped. One line each saying what to do.
2. Working: a seat busy now.
3. Waiting: blocked-by another leaf, in the merge queue, between seats (no seat busy, not done).
4. Parked or paused: parked leaves, paused repo. One quiet line.
5. Machine: deploy failed, scan error, unreadable state, slow merge, run line. Not about a task.

"Recently done" stays out: the operator removed Last merges today.

## Forks

- C1 Order of the board. a) Sections by category across repos (like herdr-app's Agents list: Needs you / Working / …), repo as a small label on each row. b) Repo then issue tree as now, category shown on the row only. a answers the two-second question first but loses the issue tree and moves a row between sections as it advances; b keeps the tree but a stuck row can sit below the fold.
- C2 Second line. a) One plain sentence by category: "Needs you: add KEY to framework env", "Working: check by B, 4m", "Waiting on fixture-weave-recorder". b) Tags joined with dots as now. a needs one wording per state and drops tags nobody acts on; b keeps every flag and stays noisy.
- C3 Duplicate alerts. a) Drop the top "Failed" and "Missing" lines because the row says it. b) Keep both. Duplication is today's loudest clutter.
- C4 Machine problems. a) One line at the bottom, header count turns red. b) Top banner as now. c) Attached to the repo section, hidden when the repo has no open leaf (slow merge on a quiet repo disappears).
- C5 Repos in scope. a) All registered repos, the current space's repo first (now). b) Only the current space's repo, others as one count line. b fits the side column but hides another repo's failure.
- C6 Open row content. a) Failure, waiting reason, last 3 moves, Files/Changes, plan path short; everything else gone. b) Keep all fields, short paths. a removes the paths that dominate width today.

## Pitfalls

- Category logic must come from `akrogon status --json` fields that exist (phase, busy_since, blocked_by, missing, failure, delivery_errors, red, stopped, queue, parked); inventing a state the producer does not emit makes the board lie.
- Removing a tag removes information from the only place it shows; each removed field needs a place on demand or an explicit "never".
- Host and model tests lock `tags()` text and the alert lines; a content change updates them with Test-Change citations.
- The "kept … live tab" row is locked as is; the repo-wide kept list in the detail is a separate element and is not that row (check before touching).
