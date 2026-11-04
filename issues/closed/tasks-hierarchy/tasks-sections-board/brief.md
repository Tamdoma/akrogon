# Brief: tasks-sections-board

## What

The herdr-app Tasks board (`herdr-app/tasks`) is regrouped and restyled per chart tasks-hierarchy: one list across repos in sections Needs you, Working, Waiting, Paused (empty ones hidden), a machine block above Needs you, two-line rows (grey repo prefix + slug with seat icons and a chevron; phase, one reason, time, "blocks N"), the row body opening the leaf's issue folder in Files, a chevron expansion with the reason in full, grey and white with red only for problems, row text following the terminal font size inside fixed herdr-app chrome, and no width cap. It consumes `attention`, `red` and `waits_on` per leaf from `akrogon status --json`, delivered by the prerequisite leaf status-attention-facts, and never re-derives them.

## Why

The operator: "the active issue that has the same color and typography hierarchy... the hierarchy overall isn't that good... the initial layout might not be ideal" and "what really matters for me to be displayed". Today every row looks alike, task alerts repeat the rows, a historical slow merge is the loudest line, and the open row dumps config paths.

## Done-criteria

1. With an envelope holding a failed leaf, a working leaf, a leaf blocked by a live leaf, a stopped leaf and a merged leaf under an open epic, the board shows them under Needs you, Working, Waiting and Paused in that order, hides the merged leaf (a merged leaf with `broadcast_pending` shows in Waiting as "broadcast pending"), hides empty sections, and draws no repo or issue-folder heading rows.
2. A leaf whose `attention` is non-empty is in Needs you even while a seat is busy (spinner still shown); a stopped leaf with a busy timestamp and no attention is in Paused, not Working; Needs you rows show their first attention phrase as the reason.
3. Waiting rows show their reason: "waiting on <repo/slug>" for a live blocker, "merge queue #N", or "next: <seats>" from `waits_on`; rows with a busy seat show the busy duration and other rows (including a Working row held by a live land job with no busy seat) the phase age, in the short form ("9m", "4h").
4. Inside each section, rows with more distinct unmerged same-repo dependents come first, ties oldest first, and a row with N > 0 dependents shows "blocks N".
5. The header shows the envelope `red` as "N problems" in red when above zero and nothing when zero; the machine block above Needs you shows scan failure (first load "Tasks unavailable"; after a good snapshot "refresh failed · rows from Nm ago"), deploy failure with its step, repo unreadable or errored, and one dim "run waiting" line whose full text shows on a click; no slow-merge line and no task Failed or Missing alert lines appear.
6. Clicking a row body pins the leaf's issue folder (the folder of its `plan`) for the active space and opens the Files view; the shared pin means the Changes view then also roots at that folder until a Files or Changes button in the expansion pins the worktree as today; clicking the chevron toggles the expansion without pinning; parked rows have no click target.
7. The expansion shows the reason in full without truncation, blockers with their state, missing recovery steps, the last 3 moves with age, Files and Changes, and the kept list; it shows no seat config or source, command text, plan or worktree path, attempts or verdict; an open row has no selected fill.
8. No stage pills render; red (`ansi1`) appears only on the header count, the Needs you label, Needs you reasons and machine red lines; the slug is never red; the spinner uses `muted`; seat icons use the sidebar's one-color treatment with unchanged shapes: tinted program icons as tinted svg, colored ones as the app home's `mono/<name>.png`.
9. Row text, line 2, expansion text and seat icons scale with `settings().font_size`; the header stays 42 px with a 13 px title and section labels stay at their fixed size at any font size; the list has no maximum width and header and list share the left edge.
