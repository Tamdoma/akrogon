# Slot B: remaining fork notes

Evidence date: **2026-11-04**. These are blind recommendations, not implementation. Operator evidence is `INTAKE.md`, `forks/direction.md` Taken/Round 2, list-shape Taken, and the newly settled sections Taken. Previously read direction, intake, D19 and manual sections remain in context. Primary code was inspected as named below. No outside practitioner or model-memory claim is needed.

## machine-lines

**Pick, reason and cost — D1.** Put a compact problem block above Needs you, present only when there is something to report. Scan failure: “Tasks unavailable” on first load; after a good snapshot, “Refresh failed · rows from 9m ago”. Deploy failure: affected deployment/step plus one short cause. Repo read failure: repo plus unreadable/error reason. Retain the waiting-run warning as one quiet “Run waiting” line, with the supplied table available on demand. Do not parse that table into invented structured fields. Keep historical slow-merge text off the routine board; it remains in status evidence. Task Failed/Missing alerts disappear from this block because task rows own those reasons.

The settled header counts env.red as problems. A later scan error makes retained counts/data stale too: indicate that, rather than inventing a new numeric total. Initial load failure has no reliable count. Cost: diagnostics need an on-demand readable surface, and repeated unreadable entries need a compact presentation without losing their source paths/errors.

**Rejected.** O1 Remove the waiting-run line until new fields exist: direction 3a explicitly retains it and skips fields. O2 Put all diagnostics after tasks: a failed scan or unreadable repo can explain missing task rows. O3 Keep a large historical slow-merge banner: it takes the opening position from current problems. O4 Keep task failure/missing banners as well as row reasons: duplicates the same obstruction.

**Evidence.** Operator tier: direction 1a/2a/3a and sections Taken 8/carries. Primary code: `main.js:start/render` retains old data after later failure and records stamp; `model.js:alerts` currently flattens all alert sources; `src/status.ts` supplies deploy/unreadable/run/slow data. The run string exists when at least one run record is waiting. Evidence is current local source, not a new live observation.

**Pitfalls/removal.** R1 A compact error loses its diagnostic: expose the full existing body/path on demand, with wrapping or a text viewer. R2 A repo with no readable tasks vanishes: machine-block visibility must not depend on task sections. R3 An old count looks current: stale age applies to the retained snapshot, not merely the error text. Keep count scope from sections Taken; do not reopen it here.

**Additional question.** None required. The fork already asks the missing freshness/placement questions.

## row

**Pick, reason and cost — D2.** Use one row with natural wrapping, not a narrow table. At 368 px, the first line is grey repo prefix plus the strongest slug and a small disclosure control. A following line carries the two locked program icons, readable phase/subphase, age and “blocks N” when positive. Add the one short current reason on its own line when it cannot fit alongside those items. A healthy row normally needs two lines; a problem/waiting row can need three. This keeps the name out of the original fixed-icon/status/time squeeze. At wide width, the same chunks can share space; their meanings and order do not change. Cost: slightly taller narrow rows in exchange for readable identities and an actionable reason. Do not shrink text or seat icons to recover a one-line layout.

Main row click navigates. Working: the producer's valid live seat target. A seat icon may address its own seat when both have live targets, with the default row target deterministic. Needs you: the failure/delivery slot's live target where one exists, otherwise the task's diagnostic log target. Waiting: the producer's relevant seat target if it exists, otherwise its diagnostic evidence. Paused/parked without a live target uses the known diagnostic destination, never an invented seat. A state with no pane is an expected destination choice, not a catch-and-silently-jump-elsewhere path after navigation fails. A stale target produces a visible error.

The producer contract needs real destinations, preserving identity/runtime and file or unit context. Native herdr-app navigation supports `run("pane.focus", {terminal})` and `{pane}`. Do not assume akrogon's stored legacy Herdr pane id belongs to this host. For log destinations, use an explicit read-only diagnostic viewer based on the shipped Editor/text surface, not an undocumented `file.open` command or an arbitrary command string. Include the current reason when a lifecycle log alone does not contain it. Parked folder-name entries cannot pretend to have seats, a worktree pin or a live target.

**Rejected.** O5 Keep the full existing line of tags/history: violates one short current reason and hides the actual obstruction. O6 Make a click expand and navigate simultaneously: two different visible effects from one action. O7 Guess the target from slug, harness or first seat: can jump to another task or ignore the implicated failure slot. O8 Put time/status at the far edge of the full window: recreates the scan distance complaint.

**Evidence.** Operator tier: direction 2a, Round 2 1b/3a/4c; sections Taken 4/5/7 and carries. Primary code: `main.js:row` currently toggles expansion; `model.d.ts:LeafJson` lacks navigation destinations; `src/state.ts:failureSchema` records slot; `src/status.ts` emits parked names rather than full leaves. Herdr-app primary API: `herdr.d.ts` PaneInfo/focused/navigation commands, manual “The herdr module”; shipped `mods/files/main.js:show` demonstrates a read-only Editor preview. The supplied screenshot shows only the older wide two-task state, not proof of the proposed narrow layout.

**Pitfalls/removal.** R4 Working+problem loses one truth: section follows the settled attention predicate while seat activity stays visible. R5 Many current reasons overwhelm the row: select one short dominant reason, with the others on demand. R6 “blocks N” crosses repos or includes merged references: use the settled direct unresolved same-repo count. R7 No-pane rows acquire dead buttons: model valid diagnostic targets and absent parked capabilities explicitly, rather than pretending every record is a full live leaf.

**Additional question — Q1.** Can the current akrogon seat identities be resolved to this herdr-app's live terminals, or are they still in the older Herdr session? This is an integration fact to inspect before promising pane jumps. Use a real diagnostic-log destination where no host pane exists; do not turn this board draft into a runtime migration.

## open-row

**Pick, reason and cost — D3.** Keep expansion behind the separate disclosure control, preserving the existing expand command and repo/slug state. Row body navigates. Expansion contains the full current failure/recovery text, all blockers and their states, full missing-artifact recovery steps, the last few moves, existing Files/Changes buttons and the locked kept treatment. Use three recent moves as a compact default; the diagnostic destination carries the longer log. Recovery text wraps instead of using field()'s truncation.

Remove seat command/config-source fields and bare plan/worktree path rows from the normal expanded presentation. They explain setup, not the current problem. Files/Changes already operate on the modeled worktree. Kept paths/reasons are the explicit exception and stay as locked. This is a change from my earlier preference to retain all seat configuration in expansion: the later direction now makes the panel a small pointer to the actual evidence. Cost: setup inspection moves back to status/config/source evidence instead of becoming another layer of panel UI. Do not add an extra “advanced” fold to keep everything.

**Rejected.** O9 Remove expansion entirely: loses existing Files/Changes and locked kept access. O10 Make every click expand: contradicts the selected navigation behavior. O11 Keep the current expanded dump: adds long paths and configuration before the evidence the operator needs. O12 Truncate recovery text even after disclosure: the operator cannot recover the information that was intentionally shortened on the row.

**Evidence.** Operator tier: direction Round 2 1b and existing kept lock. Primary code: `main.js:row/field/toggle/pin`, `model.js:leafRow/pinIntent`. Existing detail data already contains the selected reasons/history/kept; no new recovery taxonomy is needed. Existing click handlers demonstrate stop_propagation for distinct row actions.

**Pitfalls/removal.** R8 Disclosure, Files or Changes also triggers navigation: stop propagation and give each control its own target. R9 A task moves sections and closes its details: keep repo/slug as the identity. R10 Open means focused/working: use a disclosure cue and layout spacing, not the selected-item fill.

**Additional question.** None required. Keyboard activation should follow the same distinct navigation/disclosure actions; that is part of implementing the chosen interaction, not another product fork.

## type-and-color

**Pick, reason and cost — D4.** Keep two text sizes and use weight/value/spacing for hierarchy. Slug and panel title use the terminal-relative base size, with medium/semibold weight. Metadata and section labels use a consistent smaller fraction of that base. Slug is the strongest ordinary foreground. Repo, time and blocks count are quiet. Essential reasons stay readable; do not blanket-dim every secondary line.

Replace the colored stage pill with plain readable phase/subphase. Normal spinner is foreground/muted, not a stage color. Red marks the recorded problem through its short reason/marker and the settled problem count. Do not color elapsed time or an entire working row. Hover uses the shipped hover fill. Expanded rows have a disclosure indicator and no persistent selected fill merely because they are open. Section headings remain small; Needs you earns its position and problem cue, not an oversized dashboard title. Locked program artwork remains program artwork; monochrome status UI does not authorize replacing seat logos.

Cost: phase can no longer be recognized from an arbitrary stage hue; the state word must carry that information. This is expressly selected in direction 4a.

**Rejected.** O13 Keep the six stage tints because of D19: later direction explicitly overrides them for Tasks. O14 Make all problem text red or dim all nonproblem rows: both weaken the name/reason hierarchy. O15 Reuse selected fill for expansion: confuses disclosure with host focus. O16 Recolor or replace full-color program images to force a literal two-color asset palette: exceeds the seat-artwork lock.

**Evidence.** Operator tier: direction 4a and seat/font locks. Primary code/docs: `main.js:pillFor/seatIcon/row`; shipped agents status and Files/Changes rows; manual “The look”, “UI” and “The herdr module”. Named theme tokens support both appearances. The inspected Omarchy theme has muted #C9C3AF and dim #687061; their roles differ substantially. The half-scale screenshot does not establish measured readability.

**Pitfalls/removal.** R11 Essential obstruction text gets the same low emphasis as routine metadata: keep a separate reason role and verify the actual rendered row. R12 Hardcoded sidebar-white values break other themes: use host theme tokens. R13 Problems become hue-only: retain the short reason and section meaning when red is absent.

**Additional question.** None required. The seat lock is the boundary for artwork; no new palette permission is needed for ordinary status text.

## scale

**Pick, reason and cost — D5.** Scale all Tasks text from the effective settings().font_size. Scale the two inline seat icons to their row text, preserving their locked visual size relationship. Keep structural paddings/gaps/radii and the normal header's 42 px minimum close to shipped mods; let content and minimum heights grow to fit the scaled text. Do not multiply every container dimension by font_size/13. A header may grow if its text needs it, rather than clipping at a fixed height. Row height follows its actual number of lines, with ordinary fixed surrounding padding.

Cost: this replaces the current single S() multiplier for every dimension with an explicit distinction between text/inline artwork and container spacing. It is a small deliberate sizing rule, not many independent scales or configuration knobs.

**Rejected.** O17 Scale header/padding/radius/column cap with every font increase: makes Tasks feel like a separately zoomed application beside Files/Changes. O18 Force all Tasks text back to shipped 13 px: violates the terminal-relative text lock. O19 Scale row text only while fixing icons and line boxes: icons no longer fit the design and large text clips.

**Evidence.** Operator tier: font/seat locks and direction Round 2 6c. Primary code/docs: `main.js:S/render/seatIcon` currently scales almost every measurement; shipped Files/Changes use 42 px headers and fixed geometry. Manual “The look” distinguishes font_size and UI geometry; `herdr.d.ts:settings` returns the shown layout's effective look. Host zoom remains host-owned; do not add another zoom multiplier.

**Pitfalls/removal.** R14 Large text is forced into a short fixed box: use content-fitting/minimum heights. R15 Implementation partially retains S() and accidentally double-scales: establish the sizing rule once and review text/icon/container uses against it. R16 Font size becomes a density workaround: reflow the row instead of shrinking the locked base.

**Additional question.** None required. Verify the default and an actually supported larger configured size at 368 px; no new size setting is needed.

## width

**Pick, reason and cost — D6.** Open Tasks at the existing 368 px side width, so the operator keeps terminal context and the problem row can jump directly into it. Make this a Tasks-specific opening choice; do not change Files/Changes opening behavior. Keep the existing full-width toggle.

At full width, use one fluid list and the same content ordering. Give the identity a bounded share and let the one reason use the additional room; keep phase/time/blocks near their related content rather than pinned to the window edge. Align title/problem count and list to the same outer content padding. Prefer natural wrapping of a few content groups to a new column grid or details pane. Remove the scaled S(880) cap for this Tasks layout. This intentionally revisits D19's old 760 px reading measure under the later narrow-first/wide direction; it does not increase text sizes or force short reasons to become long descriptions. Some whitespace with few tasks is real, and must not be filled by restoring removed sections.

Cost: Tasks-specific opening behavior changes herdr-setup panel-bar in addition to the board repo. Both changes need their own landing/proof. A fluid list uses wide space but still needs a render at full width to keep identity/reason distances useful; it cannot manufacture useful content when only two tasks exist.

**Rejected.** O20 Keep opening full width because the screenshot did: the actual panel-bar request currently does that, but it is not evidence that this is the preferred problem-inspection workflow. O21 Keep a scaled 880 cap or a large far-right header count: preserves the current mismatch and scan distance. O22 Cards, masonry, split details or a responsive grid: adds a new layout to fill space without a selected content need. O23 Change the opening behavior of every panel: exceeds this Tasks scope.

**Evidence.** Operator tier: direction 5c, Round 2 1b/2b/6c. Primary code: `main.js:render` has S(880) and a full-width right-aligned header count; `/home/ivan/Work/infra/herdr-setup/mods/panel-bar/routine.js:request` opens full width, SIDE is 368, and shrink/grow support the existing toggle. Panel-bar main shrinks when focus jumps to another terminal. D19 supplied the earlier readable-width baseline, which this proposal explicitly changes for Tasks. The supplied screenshot proves only a full-width old design.

**Pitfalls/removal.** R17 A narrow row loses name/reason to fixed metadata: use D2's stacked groups and test long repo/slug/reason values with large text. R18 Width changes create a second interaction: keep the same click/disclosure/seat targets and stable row identity at every width. R19 An in-memory panel change is mistaken for saved behavior: verify closed-to-open, remembered per-space state, full-width toggle and navigation return in the real host. R20 A size listener repeatedly rebuilds the layout: use native wrapping first; add at most one measured layout transition only if actual host rendering requires it.

**Additional question — Q2.** Does reopening a previously full-width Tasks view preserve the user's chosen width or reset to side width? Default recommendation: side width when opening from closed, while an explicit width toggle in the current open view stays effective. Record that behavior so panel-bar and visual proof agree.
