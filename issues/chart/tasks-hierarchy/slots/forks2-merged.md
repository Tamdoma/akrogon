# Merged notes: remaining forks (A, B, C)

Sources: forks2-A.md, forks2-B.md, forks2-C.md.

## machine-lines

- One block above Needs you, drawn only when it has a line, no heading (A,B,C).
- Scan failure: first load "Tasks unavailable" with the error (B,C); after a good snapshot "refresh failed · rows from 9m ago" from the mod's last good stamp (A,B,C).
- Deploy failed with step and short cause, no sha (A,B,C). Repo unreadable or error naming repo and file (A,B,C); full path and error readable on demand, wrapping (B).
- Waiting run: each data row of the producer's table as one dim line, title and header dropped, split on newlines only (C); one quiet "Run waiting" line with the table on demand (B); generic line (A).
- Historical slow merge off the board (A,B,C). Task Failed/Missing alerts gone (A,B,C).
- Visibility never depends on task sections (B).

## row

- Layout: line 1 grey repo prefix + slug, seat icons at the right end, line 2 full phase (subphase), reason (red on Needs you, muted otherwise), "· 12m", "· blocks N", all inline left (C); line 1 prefix + slug + disclosure, line 2 seat icons + phase + age + blocks, a third line for the reason when it does not fit (B); one line, second line only for Needs you (A).
- Time: busy duration on Working, phase age otherwise (A,C; B "age"). Nothing pinned to the far edge (A,B,C).
- Click on the row body jumps (B,C; direction 1b). A: body expands, seat icon jumps.
- Target order: busy seat's pane; else the seat the reason names; else the leaf's tab; else pin the worktree in Files (C). Valid live target, else a read-only diagnostic log viewer (shipped Editor surface), a stale target shows a visible error (B).
- Producer adds real destinations; akrogon's recorded pane ids come from the older herdr session and may not resolve in herdr-app: verify before relying (A,B,C). Parked entries get no target (B).
- Both seats busy: default A (C).

## open-row

- Expansion stays, behind a separate disclosure chevron; the row body navigates (B,C). A: body click expands.
- Shows: full reason wrapping, blockers with state, missing recovery steps, last 3 moves with age, Files and Changes, kept (locked) (A,B,C).
- Out: seat config and source, command text, plan and worktree paths, attempts, verdict, history beyond 3 (A,B,C; B changed its earlier view).
- No selected fill; the chevron shows open (A,B,C). Hit area full row height × 24 px (C). Controls stop propagation (B).

## type-and-color

- Pills gone; the phase word carries stage (A,B,C).
- Red only: header count, Needs you label, Needs you reason, machine red lines; slug never red (C; B: red marks the problem through its reason, not time or whole rows; A: Needs you text and count).
- Sizes: slug 13 foreground; section label 11 dim (C) / 11.5 dim semibold (A); line 2 at 11 (C) / one smaller fraction (B); two sizes overall (B).
- Reason in `muted`, labels and time in `dim`; the size step holds the ladder in themes where muted ≈ foreground (C). B: keep the reason readable, not blanket-dimmed. A: reason in `dim`.
- Spinner `muted`, not `t.working` (B,C). Hover `t.hover`; open row no fill (A,B,C).
- Seat icons: the sidebar's one-color treatment (A,C; direction 4a "like the sidebar"); B: the seat lock keeps program artwork; recoloring exceeds it.
- Use theme tokens, never hardcoded whites (B).

## scale

- Text and inline seat icons follow font_size; row height follows its lines (A,B,C).
- Header 42, paddings, gaps, radii fixed like Files and Changes (A,B,C).
- Header title, section labels and machine block: fixed chrome (C); all Tasks text scales, header grows to fit (B).
- One sizing rule in one place; no extra zoom multiplier (B,C).

## width

- Narrow first; no content cap at full width; nothing right-aligned except the chevron; header and list share the left edge (B,C). A: cap 760 per D19.
- Tasks opens at side width from closed (herdr-setup panel-bar change keyed on the Tasks view); Files and Changes unchanged; the ⤢ toggle stays (B,C). A: keep opening full.
- Reopening from closed opens side; a toggle in the open view stays effective (B Q2).
- No `on_size_change` threshold; native wrapping first (B,C).

## Where slots differ

- Row: two lines (C) vs two-three lines with seats on line 2 (B) vs one line (A).
- Click: body jumps (B,C) vs body expands (A). No-target fallback: tab then Files pin (C) vs diagnostic log viewer (B).
- Reason color: muted (C) vs dim (A).
- Seat icons: one color like the sidebar (A,C) vs program artwork kept (B).
- Header and labels: fixed chrome (C) vs scale (B).
- Width: no cap, open at side (B,C) vs 760 cap, open full (A).
- Run line: per-row dim lines (C) vs one line with table on demand (B).
