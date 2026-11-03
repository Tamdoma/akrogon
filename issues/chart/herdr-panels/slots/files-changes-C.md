# Files and Changes (A1-A3) — seat C notes

Facts verified 2026-11-03: mods/files/main.js, mods/changes/main.js, mods/worktree/main.js, mods/tabs/main.js, herdr.d.ts (shared/setShared:385-388, pane.split:56, PaneInfo.mod:180), gpui-kit.d.ts TextView.markdown:20709, AGENTS.md "Commands" pane.split {direction, mod, props}:525-526, live `git worktree list --porcelain` on akrogon.

## Q1 — What changes the existing interfaces, and clone vs new panel

**Pick.** Every A1-A3 item lands inside clones of `files` and `changes`; no new side panel. The right panel gains two buttons only because Tasks and Needs-you need them (already settled); Files and Changes themselves get these additions:
- Changes: scope control in the header (new UI), Commit button removed (UI removed), taller file list (F5).
- Files: markdown rendering for .md (content change + a raw toggle), filter input (new UI), a Recent filter mode (new UI).
- Both: a worktree pin picker (new UI) and "open as pane" (new affordance).
Rationale for clone-not-new: the operator's lock is about *behavior and look of what exists*, not about refusing additions to those panels — his own A1-A3 requests are explicitly "the Files and Changes tabs in the top right... modify". A separate "Files+" panel beside them would be a second interface for the same job, the exact complication he rejected. Cost: clones are frozen at `cloned_from` (README convention; AGENTS.md "Layouts: clones are yours and never updated") — two more entries to diff on each Herdr update. That's the price of touching them at all; it applies to every option.

**Rejected.** R1 New panels beside Files/Changes: doubles the button row and duplicates the follow-focus logic (files/main.js location(), changes/main.js location()) in frozen code. R2 Do it by editing shipped mods in place: AGENTS.md "Layouts" — shipped mods are replaced whole on every start; edits move to `<name>-edited`. Clone is the only path.

**Pitfalls.** The visible surface grows; keep each addition to one control row or one header element so a `herdr-app shot` side-by-side shows the panels still look like themselves (done-criterion). Order of build: scope/commit changes first (Changes is the smaller diff), pin picker second (shared contract), open-as-pane last (props plumbing in both clones).

## Q2 — Commit button and scopes

**Pick.**
- Commit button: remove entirely. `git add -A` + `git commit -m` from a button (changes/main.js:151-160) sweeps akrogon's `issues/*.jsonl` and every other agent's edits in a shared worktree — the failure class is the button's existence, not its UI. Agents commit their own work; the operator's flow is review-then-let-it-merge.
- Scopes: two, not three — `Working tree` and `Branch` (merge-base vs the repo's default: `git merge-base origin/HEAD HEAD`... actually `git diff <default>...HEAD`, default from `origin/HEAD`, else `main`, else `master`; disabled when HEAD is the default). Dropped: `Recent commits` — it's a log viewer, a second navigation mode, and `git log -p` in a 368px panel solves a problem nobody reported; Files' "changed recently" (Q3) covers the "what moved lately" need.
- Switch: a two-segment control in the header (Working | Branch), one click, visible state; not a dropdown. Default: Working tree (today's behavior — the operator sees his live checkout first).
Cost: the branch scope needs a merge-base exec on refresh (cheap; the READ flags pattern already in the file).

**Rejected.** R1 Keep commit but stage-selected-only: a staging UI in 368px + shared index with agents = still dangerous; removal is the elegant fix. R2 Commit button kept with a confirm dialog: still `add -A` semantics. R3 Recent-commits scope kept as read-only list: doubles the panel's job; the intake "Recent commits" idea (A1) was the agent's proposal, not operator verbatim — he never asked for it.

**Pitfalls.** `git diff main...HEAD` on a branch tracking nothing: resolve default branch once per folder change, cache; on detached HEAD or no upstream, disable Branch with a title hint. Merge-base vs literal `main`: settled in the merged map (merge-base, not `main`), keep it.

## Q3 — Markdown, filter, recent

**Pick.**
- Markdown: `TextView.markdown` for `.md`/`.mdx` (gpui-kit.d.ts:20709) with a raw/rendered toggle that persists per file (localStorage keyed by path — the Editor fallback stays for everything else). Rendered default for `.md` — the operator's intake finding F4 is "previews markdown as raw code", so his ask is formatted-first.
- Filter: over the already-loaded tree entries only (the mod caps at 500/folder, 5,000 total on purpose — files/main.js:14,166). Match on path substring of loaded `entries`; folders expand automatically when a descendant matches. No recursive repo walk — it breaks the cap contract and is slow on big trees for a filter box.
- Recent: one toggle "Recent" that lists paths from `git log --name-only -n 20` plus the dirty files the panel already marks (`this.marks`, files/main.js:34,144), deduped, most-recent-commit first, dirty first. Count-based (20 commits), not a time window — windows produce empty lists on quiet weeks and walls on busy ones.
Cost: markdown tables/wide code will sometimes read worse rendered than raw — the toggle exists for exactly that.

**Rejected.** R1 mtime-based recent: directory listing returns name+kind only (files/main.js:23 script), stat-per-entry over 5000 paths on every refresh is the wrong cost. R2 Search including file contents: a `rg` from a side panel is scope creep; filter names the ask. R3 No raw toggle: fails when markdown renders badly — the toggle is one header button.

**Pitfalls.** Filter while folders are unloaded: only loaded folders filter; a hint under the list ("filtering loaded folders") removes the silent-miss class. `git log` on a non-git folder: hide the Recent toggle entirely (mod already knows root is not a repo via marks failure).

## Q4 — Worktree picker and open-as-pane

**Pick.**
- Where it sits: one small control in each panel's header — a pin icon with the pinned folder's short name; click opens the worktree list (same overlay pattern as agents-by-tab's sort menu, mods/agents-by-tab/main.js:422 `openOverlay`). A second click or "Follow pane" clears it.
- What it lists: `git worktree list --porcelain` from the panel's current repo (`repoOf`/`list` code in mods/worktree/main.js:28-31,99 — copy that parse shape), main checkout first, then linked worktrees with branch names. Akrogon worktrees (`~/.akrogon/worktrees/<repo>/<slug>`) appear automatically — they're linked worktrees of the repo (verified today: `git worktree list` on akrogon shows the mechanism).
- Relation to Tasks: Tasks' "Show in Files/Changes" writes the same pin — `setShared("panel.folder.<space>", {cwd, on})`; both panels read the pin before their `location()` focus-follow (single early branch in location(), not scattered flags). Shared key per space because the pin is per working context, not per panel. `on` included so a worktree on another machine still resolves (`location().on` already threads through, files/main.js:9).
- Open as pane: yes, keep it. `pane.split {direction:"right", mod:"changes", props:{folder:{cwd,on}}}` — a mod pane gets a header like any pane (AGENTS.md "Commands":525-526). The clone reads `props().folder` in location() and skips follow-focus when set. Needed because a 368px diff/file column is the common "I want this wider" complaint (F5: 200px file list cap) and Tasks' click flow produces exactly that moment.
Cost: props make each clone two-mode (follow vs pinned) — hold it to the single location() branch so the diff stays one place.

**Rejected.** R1 Picker as a separate panel: an action, not a surface; it would be an empty panel 95% of the time. R2 Pin per panel (not shared): then pointing Changes at a worktree leaves Files behind — Tasks' two buttons would need two pins and the operator sets it twice. R3 No open-as-pane: the pin alone doesn't solve "I need the diff full width"; it's the operator's own A3 ask.

**Pitfalls.** Pinned folder removed (worktree cleaned): validate `cwd` on refresh, auto-clear the pin with a brief "pin removed" state — never show a dead path silently. Pin chip must always show when set (name, click to clear): an invisible global folder override is the class of state that makes the operator distrust the panel (done-criterion: shot with pin set shows the chip).

## Probes before build

- P1 `TextView.markdown` at 368px and at mod-pane width: one real INTAKE.md and one table-heavy file; decide rendered-default vs raw-default from the screenshot. Cheap, settles Q3's default.
- P2 `setShared` timing: does a `setShared` from the Tasks mod re-render the Files mod while both are live (shared() read in location())? herdr.d.ts:385-388 names it but not reactivity semantics — a scratch mod setting + another reading settles it; if not reactive, the pin needs a watchFolder-free nudge (e.g. panels also poll `shared` on focus events).
- P3 `pane.split {mod:"changes", props}`: confirm a mod pane renders the clone with props() set and survives focus/zoom/close like a terminal pane (AGENTS.md asserts; verify once before building both modes).

## Questions this fork doesn't ask

- Should the pin be per-machine or global? `on` is in the pin tuple; `space.machine` vs `f.terminal.split("/")[0]` handling means pins on remote machines are possible but weird (worktree list runs `git` `on` that machine). Say "pin stores cwd+on; UI lists only local worktrees v1" in the contract.
- After Tasks lands: does a row-click "Show in Changes" also *open* the right panel? Suggest yes (layout.show panel + select changes) — otherwise the click writes invisible state, same trust problem as the pin chip.
