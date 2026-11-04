# Design: tasks-sections-board

## Binding decisions, verbatim

### direction

Question: Seven high-level questions asked before A answers later rounds under autopilot: board purpose, row density, producer changes, colors, width, who starts the next seat, must keep / must go.

Answer and reason:

Operator 2026-11-04, reply verbatim: "1a | 2a | 3 - what do you want to change exactly? | 4a | 5c | 6a |"

- 1a: the board is for spotting problems; problems loud, the rest calm.
- 2a: little text per row: name, state word, one short reason; more on click.
- 3a (operator 2026-11-04, after A's explanation, reply verbatim: "3a"): change akrogon status too. (1) Two more problem cases in the producer's red flag: a task waiting on something that will never finish (dependency parked, missing or unreadable) and a merge whose background job died. (2) Report which seat a task waits for. The waiting-run warning stays a short line; fields for it are skipped. One small akrogon leaf before the board leaf.
- 4a: grey and white, color only for problems (like the sidebar). Overrides D19's colored status pills for Tasks.
- 5c: works narrow first, wide must not look empty.
- 6a: something automatic starts the next seat; between seats shows as calm Waiting.
- 7: not answered; treated as no extra must-keep or must-go beyond existing locks.

## Round 2 (angles from slot C, slots/direction-C.md)

Operator 2026-11-04, reply verbatim: "For questions for this issue: 1b | 2b | 3a | 4c | 5a | 6c | 7a"

- 1b: the board points; one short phrase, a click jumps to the agent's pane or log where the problem is read.
- 2b: opened when the red dot lights; opens on Needs you first, other sections may fold.
- 3a: age never turns a row red; time is shown, only recorded problems are loud.
- 4c: within a section, the row blocking the most other tasks first (each row shows how many wait on it).
- 5a: Needs you holds tasks only; charts stay off the board.
- 6c: the board is a draft for herdr-app's own version; follow how herdr-app's own panels work so decisions carry over.
- 7a: chart the direction-round idea (Tamdoma/akrogon#128) right after this chart in the same autopilot run.

### list-shape

Question: Should the Tasks board group rows by what they need from the operator (sections across repos, like herdr-app's Agents list), or keep repo then issue folder with each row showing its state?

Answer and reason:

1a, operator 2026-11-04 round 1, reply verbatim: "1a".
Sections by what each task needs, across all repos (Needs attention, Working, Waiting, Paused/parked; exact set settled in the sections fork). Each row starts with a grey repo name. Empty sections are hidden.
Binding avoidance: rows keep expand and pin across a section move (row key repo/slug); empty sections hidden; a row is "needs attention" only on a recorded fact (sections fork sets the list).
Consequence: repo headings and issue-folder headings as rows go; repo-level facts (paused, merge queue place, parked) become row facts.

### sections

Question: With the board grouped by state (list-shape 1a), which states go in which section: what counts as "Needs attention", where does a task between seats go (live phase, no blocker, its next seat not running), where do stopped tasks and merged tasks under a still-open epic go, and what does the header count?

Answer and reason:

A's pick under autopilot (2026-11-04), not operator words. Steered by direction 1a, 2a, 3a, 2b, 4c, 6c and the values simplicity, removing over adding.

1. Sections in order: Needs you, Working, Waiting, Paused. Empty ones hidden. No fold controls (2b is met by Needs you on top; removing over adding). Name "Needs you" from the Agents list (6c, direction 2b) (A,B,C after rebuttals).
2. One section per row, first match in this order: Needs you fact; clean merged leaf hidden; hold (Paused); recorded activity (Working); else Waiting. A hold is checked before activity because stop keeps `busy_since`. A spinner and hold word still show inside a Needs you row (B,C).
3. Needs you facts, all set in the producer's `leafRed` so `akrogon status`, the dot and the board agree (direction 3a): failed; recorded missing artifact; delivery error on a seat with no busy timestamp; a dependency labelled parked, missing or unreadable; a merge whose land job stopped with no recorded handoff (not `is-active` alone, so a finished land awaiting reconciliation never flashes red) (C pitfall, B qualification: the row says "merge job stopped", not "push failed"). Dependents of a readable failed owner are not promoted; they wait naming it (B).
4. Waiting reasons: "waiting on <repo/slug>"; "merge queue #N"; "next: A", "next: B" or "next: A+B" from a producer field listing the unfinished required seats that are not busy, computed from `src/routing.ts` beside `leafRed`; the mod never names a phase rule (B R3, A, C).
5. Paused: stopped, paused repo, parked, with that word. An attention fact beats a hold (B). Parked entries carry no seats or Files target (B,C).
6. Merged leaves under an open epic: hidden. A merged leaf with `broadcast_pending` stays in Waiting as "broadcast pending" (B). Rejected: Done section with "3 merged, 2 open" (A,C): an extra surface the problem-spotting board does not need (1a, 2a, removing over adding). Standing dissent: C keeps the Done line, folded.
7. Order inside a section: most direct unmerged dependents first (distinct leaves in the same repo whose unresolved `blocked_by` names this one), ties oldest first, stable (B,C; direction 4c). The row shows "blocks N" only when N > 0. Computed in the mod from `blocked_by`. Overrides the current-repo-first test (Test-Change citation).
8. Header: `env.red` labelled as problems ("2 problems"), red, shown only when above zero, so the dot and the number agree; non-task problems are always drawn in the machine block above Needs you (C; B's labelling condition met). Rejected: task-only count (B): a lit dot beside "0" sends the operator opened on the dot to an empty section (2b). Standing dissent: B prefers the task-only count.

Carries to other forks: the pane or log target for a click (direction 1b) goes into the producer leaf's scope (B R4, C) and is settled in the row fork; the waiting-run warning stays a short line (direction 3a, B R2) and is placed in the machine-lines fork.

### machine-lines

Question: Where do the non-task problems go and what does each line say: scan error (with the age of the rows still shown), deploy failed, repo unreadable or errored, the waiting-run warning (a short line, direction 3a), the historical slow merge? The old Failed and Missing task alerts leave the top (rows own them).

Answer and reason:

A's pick under autopilot (2026-11-04), not operator words.
One block above Needs you, drawn only when it has a line, no heading; visible whether or not any task section shows (A,B,C). Red lines: first-load failure "Tasks unavailable" with the error's first line; after a good snapshot "refresh failed · rows from Nm ago" from the mod's last good stamp; "deploy failed at <step>: <cause>", no sha; "<repo> · <file> unreadable: <error>" or "<repo> · <error>", wrapping (A,B,C). One dim line "run waiting" when `env.run` is set, its full text shown under it on a click; no parsing of the table (B; C withdrew per-row lines; direction 3a). Historical slow merge and the task Failed/Missing alerts leave the board (A,B,C).

### row

Question: What does one task row show at 368 px and at full width, and what does a click do? Parts in play: grey repo prefix, slug, state reason (one short phrase, direction 2a), subphase (review vs repair), seat icons and spinner (locked: program icons, no letters, sized to the row), time (busy duration for Working, phase age otherwise), "blocks N". Direction 1b says a click jumps to the agent's pane or log; which target for which state (busy seat pane, failed leaf with no pane, log), and what the producer must report for it.

Answer and reason:

A's pick under autopilot (2026-11-04), not operator words.
Two lines at every width (C; direction 2a, 5c). Line 1: grey repo prefix (`flex_none`) + slug (truncates first), seat icons at the right end with the busy one spinning, then the disclosure chevron. Line 2, all inline left: full phase word (subphase visible), the one reason phrase (red on Needs you, muted otherwise), "· 12m" (busy duration on Working, phase age otherwise), "· blocks N" when above zero; truncates, the expansion shows it whole (C; B's third line rejected: 2a, 5c). Nothing right-aligned except icons and chevron.
Click on the row body opens the leaf's own issue folder in Files (the folder of `plan`: state, reviews, design), the nearest record of the problem akrogon writes today, through the existing pin and panel request. Reason: direction 1b asks a click to point at the pane or log; no akrogon-recorded pane resolves in herdr-app today (Findings), so a pane jump has no valid target, and the leaf folder is where the failure and reviews are read. Rejected: body expands (A's notes; contradicts 1b, B,C); busy seat → tab → worktree cascade (C; B: a tab or worktree is not the problem record); a diagnostic log viewer (B; akrogon records no log path, a new producer field and surface for one draft board). Standing dissent: B wants a problem-specific live target or diagnostic viewer. Parked rows (folder names only) have no click target (B).
Carry, recorded only: the pane jump belongs to the herdr-app chart, when seats run as herdr-app terminals; added to issues/chart/herdr-app/INTAKE.md.

### open-row

Question: With a click jumping to the pane or log (direction 1b), does the row still expand, and if so how is expansion reached and what does it show (failure in full, waiting reason, last moves, Files/Changes, kept list which is locked), and what leaves (config sources, command text, absolute paths)?

Answer and reason:

A's pick under autopilot (2026-11-04), not operator words.
Expansion stays, behind the chevron with a full-row-height × 24 px hit area; the chevron and the Files/Changes buttons stop propagation (A,B,C). Shows: the reason in full, wrapping; blockers with their state; missing recovery steps; last 3 moves with age; Files and Changes (worktree); kept (locked). Out: seat config and source, command text, plan and worktree paths, attempts, verdict, history beyond 3 (A,B,C). No selected fill; the chevron direction shows open (A,B,C).

### type-and-color

Question: Type ladder and color under direction 4a (grey and white, color only for problems): section labels, slug, reason, repo prefix, time; what replaces the stage pills; what red marks; spinner color; hover and open fills (today the open row uses the focused-item fill).

Answer and reason:

A's pick under autopilot (2026-11-04), not operator words.
No stage pills; the phase word carries stage (A,B,C). Red (`ansi1`) only for: header problem count, the Needs you label, the reason on a Needs you row, machine red lines; the slug never turns red (C, B). Two text sizes: base for slug and header title (13 before scale), small (11) for section labels, line 2, expansion and machine lines (B,C). Slug foreground normal weight; repo prefix, phase, time, blocks and section labels `dim`; reason `muted`, so the read phrase is lighter than labels while the size step carries the ladder in every theme (C; A's `dim` rejected). Spinner `muted` (B,C). Hover `t.hover`; no selected fill (A,B,C). Seat icons drawn with the sidebar's one-color treatment (agents-by-tab TONE and mono assets), shapes unchanged (A,C; direction 4a "like the sidebar", said after the seat lock). Standing dissent: B keeps program artwork in color. Theme tokens only (B).

### scale

Question: Text follows settings().font_size (locked). Does the same scale apply to the header height, paddings and icon sizes, or to row text only, given Files and Changes stay at herdr-app's fixed 13 px and direction 6c says follow herdr-app's own panels?

Answer and reason:

A's pick under autopilot (2026-11-04), not operator words.
Row text, line 2, expansion text and inline seat icons follow `settings().font_size`; row heights fit their lines (A,B,C). Header 42 px with its 13 px title, section labels, paddings, gaps and radii stay fixed like Files and Changes, so switching views in the shared panel does not jump (C; direction 6c). One sizing rule in one place (B,C). Standing dissent: B scales every text role and lets the header grow.

### width

Question: Narrow first, wide not empty (direction 5c): the row at the panel's opening side width (368 px), the content cap at full width (D19 says 760, code says S(880)), header alignment with the list, and whether Tasks opens at side width or full width (a herdr-setup panel-bar change).

Answer and reason:

A's pick under autopilot (2026-11-04), not operator words.
Narrow first; the `S(880)` cap goes; header and list share the left edge; no `on_size_change` threshold (B,C; direction 5c; D19's 760 cap is overridden for Tasks because its job, keeping pill and time near the slug, is gone). Tasks opens at side width when opened from closed; Files and Changes unchanged; the ⤢ toggle in the open view stays effective (B,C; direction 2b). A herdr-setup panel-bar change keyed on the Tasks view (A's notes rejected: 760 cap and opening full).

Exclusions: sections item 3 (the Needs you facts) and item 4's seat computation are owned by status-attention-facts; this leaf reads `attention`, `red` and `waits_on` and never re-derives them. Width's "Tasks opens at side width" is owned by tasks-side-open (herdr-setup). Row's pane jump is recorded for the herdr-app chart, not here.

Standing design: /home/ivan/.akrogon/releases/7f697eee16682629d75754ef90d74686ecabc565/skills/chart-issues/assets/standing-design.md
Interpretation: no auth, secrets or backend mutations. Proof is the cheapest real-boundary test: the existing host harness in `tests/tasks-mod-host.test.ts` (mocked gpui-kit element tree over the real mod code) and `tests/tasks-mod.test.ts` for `model.js`. No pixel tests and no new machinery. Tests that lock removed behavior (stage pill compositing and tint, group heading rows, current-repo-first order, the second line of tags plus last move, `props().fill === "selected"`) are deleted or changed with their reason and a Test-Change citation; tests that guard kept behavior (seat icons and spinner, immediate redraw, repo-specific pins, kept detail) stay. Each new criterion shows one deliberate break turning its test red. A live screenshot through `herdr-app shot` in a session window on an existing workspace may be kept as evidence, never by creating or removing a headless output (learnings: 2026-11-03 headless output freezes the operator window).

## Leaf architecture

Owned surfaces: `herdr-app/tasks/main.js` (render, row, repoSection replaced by section rendering, alertLine replaced by the machine block, pillFor and withAlpha removed, note), `herdr-app/tasks/model.js` (board, leafRow, tags, alerts, repoRows replaced, leafRows), `herdr-app/tasks/model.d.ts`, `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts`, the Tasks entry in `src/AREA.md` if its description changes.

Interfaces:
- Reads per leaf `attention: string[]`, `red`, `waits_on: ("A"|"B")[]` (status-attention-facts, blocked-by); envelope `red`, `run`, `deploy`; repo `unreadable`, `error`, `queue`, `parked`, `paused`, `kept`.
- `board(env, ctx)` returns `{ machine: MachineLine[], sections: { name: "Needs you" | "Working" | "Waiting" | "Paused", rows: RowModel[] }[] }`; empty sections are omitted. Open for the plan: the exact RowModel fields.
- Section assignment, one function, first match: attention non-empty → Needs you; merged without `broadcast_pending` → hidden; merged with it → Waiting; stopped, paused repo, parked → Paused; a busy timestamp or live land → Working; else Waiting.
- Row click: `pinIntent` with the leaf folder `dirname(plan)` and view files; the chevron and buttons call `cx.stop_propagation()`.
- Seat icons: the same one-color treatment as herdr-setup `mods/agents-by-tab/main.js` `icon()` (svg tinted with a translucent white token for tinted programs, `image("mono/<basename>.png")` from the app home for colored ones). The mono PNGs are herdr-setup's `mono/`, copied into the app home by herdr-setup's `install` and `bin/herdrapp`; that is an existing dependency of this machine's setup, present now (checked 2026-11-04: `~/.config/herdr-app/mono/` holds 124 files), not a new install step and not owned by this leaf. No fallback for a missing file; the host draws nothing for it (C).
- Sizing: `S()` only for row text, line 2, expansion text, row heights and seat icons; plain numbers for header (42, title 13), section labels, paddings, gaps, radii, machine block.

States this changes and their consumers:
- `board()` shape changes: its production consumer is `main.js` render (header count, the repo loop, the empty-state test on `model.repos` and `model.quiet`), plus the two test files; tick rebuilds through `board()` and pin/findLeaf read the envelope (B); `leafRows()` is used only by `tests/tasks-mod.test.ts` (C).
- Shared `worktree.pin` and `panel.request` now also receive leaf folders: consumed by herdr-setup `mods/files-view/main.js` (plain directory listing of `pin.folder`, no git requirement) and `mods/changes-view/main.js` (`pins()`: diffs the pinned folder), so a row click roots both at the leaf folder until a Files or Changes button repins the worktree; accepted (A, after C's review): no new key and no herdr-setup change.
- The panel-bar dot keeps reading `envelope.red`; this leaf does not change the dot.

Exclusions: producer predicate and fields (status-attention-facts); panel opening width (tasks-side-open); the "kept ... live tab" treatment stays as is (operator lock); removed folds stay removed.
