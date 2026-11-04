# Slot B: Tasks content map

## Recommendation

D1 Keep one board with repository and issue-group context. Make the issue name the strongest text, give each row one plain operational state, and show a short reason only when it explains a current obstruction. Routine history belongs in expansion. Keep both program icons and working spinners as locked.

D2 Use three task categories as vocabulary: **Needs attention**, **Working**, **Waiting**. Keep **Board/system problems** separate from task status. Categories need not become four permanent sections. With two tasks, extra headings would consume more attention than they save. Do not add Recently done: Last merges was explicitly removed.

D3 Treat “needs attention” as evidence of a problem, not proof that the operator must answer a question. The current envelope has failures, missing artifacts and delivery errors. It has no general operator-question or approval field. Do not infer “needs me” or “queued” from a stationary phase or an absent spinner.

## Evidence

F1 Inspected `herdr-app/tasks/main.js` (render, row, repoSection, alertLine, pillFor, loadEnvelope, tick, pin), `model.js` (board, repoRows, leafRow, tags, alerts), `model.d.ts`, and `schedule.js`. The inventory below describes the current render, not a proposed mockup.

F2 Inspected `src/status.ts` (blockedBy, undelivered, leafRed, leafJson and the envelope's run construction). `red` means failed phase, missing artifacts, or delivery error for a seat that is not busy. A recorded delivery error can exist while its seat is busy. The board's tags show it regardless. `busy_since` is recorded activity, not a general “needs operator” signal.

F3 Viewed `issues/chart/herdr-panels/direct/live/tt-01-small.png`. Both leaves have similarly bright names. One has a working seat and `check review → check repair`; the other has `blocked-by fixture-weave-recorder (check.repair)`. The colored stage badges do not make the operational difference obvious. The slow-merge alert belongs to lingua-relay while the visible task repo is framework. This is one observed frame, not evidence of every state or the normal narrow width.

F4 Inspected the supplied D19 look rule, the herdr-app manual's “The look”, “Mods”, “UI”, and “herdr-core” sections, and shipped agents/files/changes/tabs render declarations. The existing toolkit supports the required text hierarchy, native row fills and tooltips. Shipped Files/Changes use h42 headers, and Changes places its count beside its title. Tasks already scales from terminal settings. Do not fix hierarchy by shrinking all text below the locked terminal-relative baseline.

F5 Checked test names in `tests/tasks-mod.test.ts` and `tests/tasks-mod-host.test.ts`. Existing coverage names the seat icon/spinner lock, immediate redraw, repo-specific pins, paused pills, kept detail and removed footer sections. No tests were run because this deliverable changes no implementation.

All recommendations below are judgments from these local sources and the supplied operator instructions. No outside UX authority is claimed.

## Current inventory and data sources

| Ref | Element shown today | Rendered source and meaning |
| --- | --- | --- |
| I1 | Header: Tasks, N open | Literal title. Count sums modeled leaf rows whose pill is non-null. Thus a failed, stopped, paused or blocked leaf counts. Merged rows do not. Count has no attention/activity breakdown. |
| I2 | Initial loading state | `model === null` without the initial error path: “Loading tasks…”. |
| I3 | Board unavailable | First load failure from exec/read/JSON parsing, with the error and “Board unavailable; retrying on the next tick”. |
| I4 | Later scan error above retained rows | `this.error` after a prior envelope succeeded. Existing rows remain visible. No visible last-success time or stale-data label. `stamp` is recorded but not rendered. |
| I5 | Run warning | `env.run`, passed through as one amber alert string. Producer builds a multiline run table when any run record is waiting. This is not a typed per-task question. |
| I6 | Deploy failure | `env.deploy.failed`, attempted commit prefix, step and error. Red dot, foreground text. |
| I7 | Failed-task alerts | One red-dot “Failed: repo/slug” per leaf with exact phase `failed`. The row remains below too. |
| I8 | Missing-artifact alerts | One red-dot line per `leaf.missing`, including repo/slug, kind, name, holder and steps. Repeated in row tags and expansion. |
| I9 | Repository read errors | Every `repo.unreadable` path/error, or `repo.error` if no unreadable entries. Red-dot alerts. |
| I10 | Slow merge | `repo.slow`: repo, first leaf/run, duration and normal duration. Amber alert. Producer selects the last verification run carrying a slow record, so this does not by itself prove a merge is currently slow. |
| I11 | Repository heading and paused marker | `repo.name`, `repo.paused`. Active-space repo is first, then alphabetical. Active space matches repo name/root/worktree store. Quiet repos with no leaves or read errors are omitted. Repo heading is strong foreground text, like task names. |
| I12 | Nested issue-group headings | `leaf.group`, derived from issue-folder ancestry. Headings inserted when group path changes. Dim text with depth indentation. Leaves themselves have a fixed inset, not depth indentation. |
| I13 | Two seat positions | `leaf.seats.a/b` resolves through host `knownAgents()` by harness or first command word. Busy timestamp becomes a spinner. Otherwise program icon, or an empty slot if unresolved. A/B position is implicit. No letters on the row. |
| I14 | Issue identity | `leaf.slug`, one truncated line, medium weight. Red foreground from `leaf.red`, muted if merged, normal otherwise. No human title field exists in this envelope. |
| I15 | Stage badge | First dot-separated word of `leaf.phase`. Plan/implement/check/merge/failed have separate ANSI colors. Stopped or repo-paused uses muted color without changing badge text. `merged` has no badge. Subphase is absent here. |
| I16 | Elapsed time | Time since `leaf.phase_since`, displayed as hours/minutes. Blank if timestamp missing. Not time since last action, working-seat duration or total task age. |
| I17 | Secondary row: dependency and control tags | All `blocked_by` slug/label pairs, stopped, broadcast pending, land alive/dead, and per-seat delivery-error code. Always combined into one truncated muted line with the remaining tags/history. |
| I18 | Secondary row: diagnostics and history | Failure cause/reason, every missing kind/name, positive fix-round count, then latest history move. JSON moves become from → to. Current and historical information have equal styling. |
| I19 | Hover/expanded state | Whole row clicks to expand. Hover fill is `t.hover`; open row gets `t.selected`. Multiple rows can be open. There is no model field identifying a single “active issue”. Expansion must not imply current execution or focused terminal. |
| I20 | Expanded failure | Full cause/reason from `leaf.failure`, foreground value. |
| I21 | Expanded seats | A and B harness, command and source from seat config. Plain field lines. |
| I22 | Expanded plan and worktree | `leaf.plan` path and `leaf.worktree` path, truncated field values, not file-open links. |
| I23 | Expanded blocked by and missing | Dependency slug/phase labels. Missing artifact kind/name/holder/steps, red values. |
| I24 | Expanded kept | Entire `repo.kept` list copied into each leaf detail, path and reason. Preserve the kept/live-tab treatment under the operator lock. |
| I25 | Expanded history | Last ten source log entries, age plus phase move for JSON entries, raw text otherwise. Each remains truncated as a field. |
| I26 | Files and Changes buttons | Pins the active space to the leaf worktree and emits a request to the corresponding panel. These inspect work, not advance its lifecycle. |
| I27 | Merge queue note | `repo.queue`: slug and holder/place, plus “no merge record” when present. One truncated repo-level line below rows. |
| I28 | Parked note | `repo.parked` slugs, one truncated repo-level line below rows. Omitted with a quiet repo, so it is not a complete global parked inventory. |
| I29 | No registered repos | Shown only when both visible repos and quiet repos are empty. All registered repos quiet yields just header/blank body, per the removed-empty-line lock. |
| I30 | Layout | Scrollable list with a max width of scaled 880, left aligned under a full-width header. Header count therefore stays farther right at full width than task content. Current D19 text says 760, so the intended measure needs resolution rather than silent adoption of either number. |

Not rendered: model detail `done`, `attempts`, `verdict`; envelope generation time, first prompt, total red count, deploy active commit, top-level kept, merges, charts, unpacked/housekeeping and quiet repo names. Do not inventory these as visible UI. `repo.folded` is fixed false and no repo-fold control is rendered.

## What the operator needs

| Ref/category | In two seconds | On demand | Exclude from routine scan |
| --- | --- | --- | --- |
| C1 Needs attention | Repo/task identity and one current reason: failed, missing artifact, undelivered prompt. Keep the row locatable. | Complete failure/missing recovery information and delivery error context. | Repeating the same task failure as a global alert, tag and detail before expansion. |
| C2 Working | Task identity, actual activity through locked seat spinners, and enough phase text to tell the current step. A live command-owned land also counts as activity evidence even without a busy seat. | Seat command/source, plan/worktree, history and Files/Changes. | Latest historical move on every healthy row, fix-round counters, repeated lifecycle evidence. |
| C3 Waiting | A named dependency or merge-queue position. Stopped and repo-paused are explicit intentional holds, visible as such rather than red failures. Parked can remain a small repo-level note where currently present. | Full blocker list and labels, queue metadata including missing merge record, exact subphase and history. | Labeling every motionless task “waiting for you”, treating a paused repo as broken, or calling every nonbusy plan task queued. |
| C4 Board/system problems | Failure to read/refresh the board, deployment failure, repo read errors, or a waiting run. Identify the affected repo/scope. Preserve useful rows. | Raw command/path/run IDs, error body, last successful snapshot age, historical slow-run comparison. | A permanent prominent historical slow-merge banner without current relevance. Do not delete the evidence, demote it to diagnostics. |

D4 Keep ordinary repo and group context quieter than the task name. For the supplied two-leaf example, the working row should read as working and the blocked row as waiting even without comparing two colors. Use a small textual state/reason, not a new dashboard of counts and folds. Preserve subphase somewhere easily visible: a generic “check” hides repair versus review.

D5 There is no need to add a Recently done section, Charts, Last merges, Housekeeping, or a replacement “No open tasks” message. Those directly contradict existing locks. Historical move records remain available in expansion. Do not expand this content exercise into lifecycle buttons.

## Missing information the operator could act on

F6 A later scan error leaves old data on screen without saying how old it is. Add a stale/last-success indication when that error occurs. Reuse the existing host stamp or envelope generated time with a clear meaning. A permanent “updated every N seconds” indicator would misstate the actual event/file-driven scan behavior.

F7 An undelivered prompt is actionable, but the row only shows a code on a truncated mixed line and expansion has no delivery-error field. Preserve the error details on demand and make the current obstruction distinguishable from a past delivery error during a new busy attempt. The producer already computes this distinction in `leafRed`.

F8 Dependency labels already distinguish parked/unreadable/missing targets. Those reasons can change what the operator does. Keep them recoverable and do not collapse all dependencies into an unexplained “blocked”. Likewise retain queue place/holder and “no merge record” in details if removing their repo note.

F9 General human approval/input need, per-task human title and focused agent/terminal are absent from the model. Do not invent those states from phase/idle/expanded state. If the operator wants actual “needs me”, that is a separate data-contract decision. The minimum redesign can use the existing slug, reason and activity fields.

## Forks that change the result

| Ref | Options | Recommendation and consequence |
| --- | --- | --- |
| Q1 Primary organization | O1 Keep repo → issue group with row states. O2 Global Needs attention/Working/Waiting sections with repo labels on rows. | Prefer O1 for this panel. O2 raises cross-repo urgency but splits sibling issues, repeats repo/group context and moves rows on status changes. If O2 is chosen, retain repo-qualified identity and group context. Do not stack both complete hierarchies. |
| Q2 Meaning of active | O1 Recorded activity. O2 Focused terminal/current space. O3 Expanded row. | Define each independently. Only O1 is execution evidence. Current repo sorting approximates O2 at repo scope; there is no single active-leaf field. O3 is disclosure. Coloring all three alike would recreate the ambiguity. |
| Q3 Attention classification | O1 Evidence-backed problem reasons from current contract. O2 Broad “needs me” covering idle/phase/holds. | Prefer O1. O2 creates false requests for action, especially normal dependency waits and deliberate pause/stop. Never suppress a failure just because another seat is busy. One row can carry a problem and live spinner simultaneously. |
| Q4 Stage vocabulary | O1 Exact readable phase/subphase with restrained color. O2 Generic stage badge plus operational state/reason. | Prefer O1 if it fits at the actual panel width; otherwise O2 with exact phase in expansion. Existing first-word badges lose review/repair information. Display strings should be readable without making a new workflow taxonomy. |
| Q5 Alerts versus row reasons | O1 Put task failures/missing evidence on their rows and reserve top alerts for board/repo/system problems. O2 Keep global task alerts. | Prefer O1. O2 duplicates content and pushes live tasks down. O1 still needs affected task visibility across repo ordering and enough visible text to distinguish the reason. Do not remove repo read errors whose leaves cannot render. |
| Q6 Time and warning relevance | O1 Quiet phase age, stale-data indicator only on scan failure, slow-run history on demand. O2 Promote long ages/slow records to live urgency. | Prefer O1. No universal overdue threshold is present. A long check phase and a completed historical slow merge are not proof of a current stall. O2 requires an explicit data/threshold decision. |
| Q7 Initial geometry | O1 One left-aligned readable list with title/count and row metadata visually near their content. O2 Wider columns/cards or a full-width right-aligned status column. | Prefer O1, matching shipped mods and D19. Resolve scaled 880 versus stated 760 with slot A. Verify actual narrow width and full width. O2 increases scan distance and gives sparse data dashboard weight. No new details pane is needed. |

## Constraints for the chart

R1 Keep icons, spinner behavior, font scaling, immediate clicks, removed sections, and kept/live-tab treatment intact. Make hierarchy with grouping, weight, concise reasons and spacing before multiplying colors or controls.

R2 Do not sort or classify by guessing from the slug or parsing the multiline `env.run` table. Keep that diagnostic as supplied unless a separately authorized producer change supplies structured data.

R3 Essential recovery text cannot disappear into one truncated secondary line. Expansion must recover the reason. Current `field()` truncates expanded values too, so long dependencies/errors require a deliberate readable treatment if their collapsed versions are removed.
