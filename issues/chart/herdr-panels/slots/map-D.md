# Territory Map — Consultant D (Antigravity)

## 1. Material Forks

### Fork 1 · Source of Truth, Session Propagation, and Layout Persistence

Where edited files live and how they reach every `herdr-app` session (`default` in `~/.config/herdr-app` plus `--session` homes in `~/.config/herdr-app-sessions/{infra,personal,mdconsultingny}`).

- **Option 1a (recommended) — Author in `/home/ivan/Work/omarchy-customizations/herdr-app/`, sync via an idempotent deploy helper (and `install.sh` / `herdrapp`), preserve active layout (`flat`), and sync `workspace.panels` across all session homes.**
  - *Mechanism*:
    1. Keep all personal layouts (`layouts/flat.json`, `layouts/board.json`) and personal mods in `/home/ivan/Work/omarchy-customizations/herdr-app/` (`herdr-app/README.md` `## Files`).
    2. Fix `/home/ivan/Work/omarchy-customizations/install.sh:316-325` so it no longer forces `layout.switch --name board` / `.layout = "board"` when the operator's active layout is `flat` (currently `"layout": "flat"` in `/home/ivan/.config/herdr-app/shared.json:3` and `/home/ivan/.config/herdr-app-sessions/infra/shared.json:3`).
    3. Update `/home/ivan/Work/omarchy-customizations/herdr-app/herdrapp:78-93` and `install.sh:301-315` so when new personal mods are installed into `~/.config/herdr-app/mods/`, symlinks are also created in every existing `~/.config/herdr-app-sessions/*/` directory immediately (not only on next `herdrapp --session` cold launch) and `"workspace.panels"` in each session's `shared.json` includes `["files", "changes", "tasks"]`.
  - *What it could break or invite later*: Requires touching both `omarchy-customizations/install.sh` and `herdrapp` in addition to the mods/layouts.
- **Option 1b — Edit `~/.config/herdr-app/` directly and rely on `herdrapp` session launch to symlink later.**
  - *What it breaks now and later*:
    1. Running `/home/ivan/Work/omarchy-customizations/install.sh:301-325` later overwrites `~/.config/herdr-app/layouts/` and switches layout back to `board`.
    2. Already-running sessions (`infra`, `personal`, `mdconsultingny`) will not have symlinks for newly created mod folders (`mods/tasks`, cloned `mods/files-*`, etc.) until restarted via `herdrapp --session`, and their `shared.json` (`herdrapp:116-120`, copied only once before `.herdrapp-ready` exists) will retain `"workspace.panels": ["files", "changes"]`, hiding the new `tasks` panel button.
- **Recommendation**: **Option 1a**. It keeps the operator's dotfiles repo (`omarchy-customizations`) authoritative, makes hot-reload work immediately across all four live sessions, and stops `install.sh` from clobbering `flat` with `board`.

---

### Fork 2 · Cloned vs. Written-New Mods and `tabs` Panel-Toggle Wiring

Shipped mods listed in `/home/ivan/.config/herdr-app/installed.json:1-28` are overwritten on every `herdr-app` start (`AGENTS.md` `## Layouts: layouts/<name>.json`).

- **Option 2a (recommended) — Clone `files`, `changes`, `tabs`, and `spaces` into personal mods (`files-fleet`, `changes-fleet`, `tabs-fleet`, `spaces-fleet`), keep `agents-by-tab` personal, and write new personal mods for `tasks` (A4), `needs-you` (A5), and `decision-strip` (A6).**
  - *What is cloned vs. written new*:
    - **Cloned from shipped (`installed.json:2-18`)**:
      - `files` (`/home/ivan/.config/herdr-app/mods/files/main.js:1-169`) $\rightarrow$ `mods/files-fleet/` (adds worktree picker, file filter, Markdown preview toggle, open-as-pane button).
      - `changes` (`/home/ivan/.config/herdr-app/mods/changes/main.js:1-206`) $\rightarrow$ `mods/changes-fleet/` (adds worktree picker, `Working tree` vs `Branch vs main` scope switch, safe staging/commit or removal of `git add -A`, open-as-pane button).
      - `tabs` (`/home/ivan/.config/herdr-app/mods/tabs/main.js:1-103`) $\rightarrow$ `mods/tabs-fleet/`. **Why `tabs` must be cloned**: `mods/tabs/main.js:80,97-98` hardcodes only two right-hand panel toggle buttons (`enabled.includes("files")` and `enabled.includes("changes")`), and `syncPanel` (`mods/tabs/main.js:21-46`) hides `"panel"` on space switch if the active panel is not in `enabled` or `this.panels[space.id]`. Adding a `tasks` child to `panel-body` in `flat.json` without cloning `tabs` leaves `tasks` unreachable from the top bar and causes space switches to collapse the panel! Also update `/home/ivan/Work/omarchy-customizations/herdr-app/mods/prefix/main.js:58-60` if prefix shortcuts cycle or toggle `tasks`.
      - `spaces` (`/home/ivan/.config/herdr-app/mods/spaces/main.js:1-379`) $\rightarrow$ `mods/spaces-fleet/` (see Fork 7: adds `.id("spaces-list")` to the scroll container at `spaces/main.js:375` so GPUI preserves scroll offset across re-renders).
    - **Already personal (modify in place)**:
      - `agents-by-tab` (`/home/ivan/Work/omarchy-customizations/herdr-app/mods/agents-by-tab/main.js:1-447`) and `layouts/flat.json` (`/home/ivan/Work/omarchy-customizations/herdr-app/layouts/flat.json:1-91`).
    - **Written new**:
      - `mods/tasks/` (`main.js` + `mod.json` with `{"place":"none"}`) — A4 Tasks board in `panel-body`.
      - `mods/needs-you/` (`main.js` + `mod.json`) — A5 Needs-you inbox in `sidebar-lists` (or embedded at the top of `agents-by-tab`; see Fork 4).
      - `mods/decision-strip/` (`main.js` + `mod.json`) — A6 Decision buttons bar under `main` inside `work-body`.
  - *What it could break or invite later*: Upstream updates to shipped `files`, `changes`, `tabs`, or `spaces` won't auto-apply to the clones until re-merged (`mod.json` records `cloned_from` so diffs against shipped mods stay trivial).
- **Option 2b — Edit shipped mods in `~/.config/herdr-app/mods/` or skip cloning `tabs` and rely only on `layout.set` CLI calls to switch to `tasks`.**
  - *What it breaks*: Any edit to shipped mods is wiped on next `herdr-app` launch (`AGENTS.md` `## Layouts: layouts/<name>.json`). Skipping `tabs` means no top-bar `Tasks` toggle button, and `mods/tabs/main.js:21-46` will clobber `panel-body` state whenever the active space changes.
- **Recommendation**: **Option 2a**.

---

### Fork 3 · A4 Tasks Board Data Source, "Normal" Time Threshold, and Leaf-to-Terminal Mapping

`INTAKE.md` (`# Change`, item 4) states: *"one row per open akrogon leaf across registered repos (repo, slug, phase, slot, time in phase, red past normal), merge queue, last merges; click jumps to the leaf's pane; fed by `issues/log.jsonl` via watchFolder."*

- **Option 3a (recommended) — Direct multi-file reader in the mod (`~/.akrogon/config.yaml` + `<repo>/issues/open/**/state.yaml` + `<repo>/issues/log.jsonl` + `<repo>/issues/timings.jsonl`) with `watchFolder("<repo>/issues")` per registered repo, plus dual leaf-to-pane resolution (`herdr.tab` / tab name + worktree `cwd`).**
  - *Why `issues/log.jsonl` alone is insufficient (verified in `akrogon` code)*:
    1. In `/home/ivan/Work/infra/akrogon/src/state.ts:81-109` and `/home/ivan/Work/infra/akrogon/src/status.ts:68-109,186-205`, `issues/log.jsonl` only appends *completed* phase transitions (`from -> to`). A newly handed-off leaf in `issues/open/` that has not completed its first phase has **zero** entries in `log.jsonl`.
    2. In `log.jsonl`, `slot` is the slot that *finished* the `from` phase (`null` on command phases), NOT the currently active slot(s) in `to`! Current `phase`, active `slot` (`A`, `A,B`, etc.), `busy_since`, `blocked-by`, `batch`, `delivery_error`, `failure`, and `worktree` live in `issues/open/**/state.yaml` (`src/state.ts:10-40`).
    3. Merge queue priority in `/home/ivan/Work/infra/akrogon/src/turn.ts:105-131` depends on `state.yaml` (`phase === "merge"`, `batch` lock holder, `blocked-by` dependent counts, and `merge_stamp` / transition timestamp).
  - *How A4 reads state cleanly*:
    - Parse `/home/ivan/.akrogon/config.yaml:1-81` (`repos:` map) via `readTextFile("${home()}/.akrogon/config.yaml")`.
    - Watch each registered repo's `<repo>/issues` folder via `watchFolder("${repoRoot}/issues", ...)` (11 light directories—never watch `<repo>` root or `node_modules`).
    - On load/change (debounced 150ms), read `issues/open/**/state.yaml` (via `listDir`), tail `issues/log.jsonl` (for phase entry timestamp and last `to === "merged"` rows), and optionally `issues/timings.jsonl` (`src/timing-report.ts:53-76`).
  - *How "red past normal" is computed*:
    - Compute per-phase median duration across the last 20 completed visits of that phase in `issues/log.jsonl` / `issues/timings.jsonl` (matching `/home/ivan/Work/infra/akrogon/src/verify.ts:367-387` and `src/timing-report.ts:16-17`), with sensible phase fallbacks when history < 5 runs (e.g., `plan`/`review`/`verify` 15m, `do` 25m, leaf total 35m median / 45m limit, seat stall 60m from `src/next.ts:220`). Flag red when `elapsed > max(1.5 * median, median + 2m)` or when `state.yaml` has `delivery_error` / `failure` / stalled seat.
  - *How A4 maps a leaf to a terminal/pane in `herdr-app` (both today while `akrogon` uses legacy `herdr` and after `akrogon`'s `herdr-app` cutover)*:
    1. **Post-cutover (`herdr-app` native)**: Match `terminals()` / `panes()` by label (`t.labels?.["herdr.tab"] === slug` or `t.labels?.["akrogon.slug"] === slug`, per `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md` `# Context`), or match `spaces().flatMap(s => s.tabs)` where `tab.name === slug` (and `slot` matches `t.labels?.["akrogon.slot"]` or pane title).
    2. **Worktree `cwd` match (works both today and post-cutover)**: Every leaf worktree lives at `~/.akrogon/worktrees/<repo>/<slug>` (or `state.worktree`). Match `panes()` / `terminals()` where `cwd === worktreePath || cwd.startsWith(worktreePath + "/")`. If a matching pane is found in `spaces()`, call `run("pane.focus", { id: pane.id })`. If a matching terminal is a headless sub-agent (`t.pane == null`), open `peek` (`shared().set("peek.terminal", t.address)`).
    3. **Pre-cutover fallback (when leaf is only in legacy `herdr` or has no open `herdr-app` pane yet)**: Clicking the row (or an "Inspect worktree" action) sets the shared worktree target (`workspace.worktree = worktreePath`) and switches to `changes` or `files` (or spawns a tab in that worktree on middle-click / button click), with a badge showing legacy `state.tab` (`w8:t18`).
- **Option 3b — Spawn `exec("akrogon", ["status"])` on a polling timer or parse only `issues/log.jsonl`.**
  - *What it breaks*: Parsing only `log.jsonl` misses newly opened leaves, shows the *previous* phase's slot instead of the active slot, cannot see `busy_since` or `delivery_error`, and cannot compute the merge queue. Spawning `akrogon status` (`npx tsx ...`) every few seconds adds Node/tsx startup overhead and returns ANSI text rather than structured JSON with worktree paths and pane targets.
- **Recommendation**: **Option 3a**.

---

### Fork 4 · A5 Needs-You Inbox: Trigger Scope, Prompt Extraction, and Reply Delivery

`INTAKE.md` (`# Change`, item 5) specifies: *"Needs-you inbox (above Agents in left sidebar): compact block listing only agents waiting on the operator, with the question text and an inline reply input; hidden when empty."*

- **Option 4a (recommended) — Trigger on `status === "blocked"` AND optionally chart-door/agent turns that ended with a question (`status === "done"` matching a question/option footer), extract text via cached `hc(["read", addr, "--lines", "0", "--json"])`, and support both free-text replies (`hc send --force`) and quick dialog key-presses (`hc keys`).**
  - *Crucial protocol reality discovered in `hc --skill` and `akrogon`*:
    1. **When is `status === "blocked"` vs `"done"`?** Harnesses emit OSC 7501 `state=blocked` when paused inside a tool-permission prompt or interactive TUI widget (e.g., Claude Code permission dialog or `AskUserQuestion`). When an agent asks a conversational question in normal output (such as a chart door asking `Reply 1a 2b, or a numbered free-text answer` in `skills/chart-issues/assets/questions.md` `# Operator questions and peer exchange`), the agent finishes its turn and emits `state=done` (which becomes `idle` once the pane is focused)! If A5 *only* checks `a.status === "blocked"`, conversational/chart-door questions will never appear in A5.
    2. **Why `hc(["read", addr, "--lines", "0", "--json"])` is safe and fast**: Per `hc --skill` (`## Status, recovery, and cleanup`), while status is `working`, `blocked`, or `error`, history reads return only the visible screen immediately with zero scroll input sent. Calling `hc(["read", addr, "--lines", "0", "--json"])` once per `${a.address}:${a.seq}` transition reads the visible screen non-intrusively in <5ms.
    3. **Why naive `hc(["send", addr, reply])` FAILS on `blocked` agents**: Per `hc --skill` (`## Status, recovery, and cleanup`) and `hc send --help`, `hc send` refuses when the target is `blocked` (exit code 9 `blocked`) unless `--force` is passed! Moreover, if an agent is blocked on a numbered permission selector (`1. Yes / 2. No` or `Esc`), `hc(["keys", addr, "1"])` or `hc(["send", "--force", addr, text])` is required.
  - *Placement sub-choice*:
    - Either embed the `Needs-you` block at the very top of `agents-by-tab` (so when empty it takes literally `0px` and requires zero layout node overhead in `flat.json`) OR make it a separate mod in `sidebar-lists` only if `flat.json` can collapse a 0-height child cleanly. **Watch out**: in `layouts/flat.json:27-45`, `sidebar-lists` is a `column` with `gap: 0`, and each child in a layout stack has a `size` (`weight` or `px`) and `min` (`herdr.d.ts:10` / `AGENTS.md` `## Layouts: layouts/<name>.json`). A layout child in `flat.json` cannot dynamically shrink its layout slot to `0px` when its internal state is empty—it still occupies its `weight`/`px` allocation in `sidebar-lists`! Embedding the `Needs-you` section at the top of `agents-by-tab` (above the `AGENTS` header) allows it to truly collapse to `0px` when empty and grow up to a capped height when non-empty.
- **Option 4b — Separate layout node in `sidebar-lists` filtering strictly on `a.status === "blocked"` and calling `hc(["send", addr, text])`.**
  - *What it breaks*:
    1. A separate layout node in `sidebar-lists` reserves fixed `px` or `weight` space even when 0 agents are waiting, violating *"hidden when empty"* (`INTAKE.md` `# Change`, item 5).
    2. `hc(["send", addr, text])` without `--force` exits with code 9 (`blocked`) and silently drops the operator's reply!
    3. Agents in `done` status waiting on a chart-door fork reply won't show up.
- **Recommendation**: **Option 4a** (render `Needs-you` at the top of `agents-by-tab` so it truly disappears when empty, detect both `blocked` agents and `done` agents whose last screen lines contain a question/decision prompt, cache screen reads by `address:seq`, and use `hc send --force` / quick keys).

---

### Fork 5 · A6 Decision Strip: Option Detection Grammar, Layout Wrapping, and Multi-Question Staging

`INTAKE.md` (`# Change`, item 6) specifies: *"Decision buttons (under main terminal pane): when the focused agent's last reply contains coded options (`1a`/`1b`/`2a`…), render clickable buttons that send the choice + optional note; hidden when none."*

- **Option 5a (recommended) — Render `decision-strip` inside the main pane / `agents` wrapper (or as an auto-collapsing footer inside a custom `pane` clone / bottom overlay) using turn-scoped `hc read --lines 120 --json`, strict multi-option group parsing, and a multi-group composer (`1a | 2b` + optional note + `elid`).**
  - *Layout trap to solve upfront*: Just like Fork 4, in `layouts/flat.json:19-24`, `work-body` is a `row` containing `sidebar`, `main` (`"content": { "tab": "active" }`), and `panel`. If you wrap `main` in a `column` in `flat.json` with a second layout child `{ "content": { "mod": "decision-strip" }, "size": { "px": 44 } }`, `herdr-app`'s layout engine allocates that `44px` bottom strip permanently unless toggled via `layout.set` (`{ id: "decision-strip", visible: true/false }`) or rendered inside a cloned `pane` mod (`/home/ivan/.config/herdr-app/mods/pane/main.js:1-75`) below the terminal surface!
    - **Best layout mechanism**: Either (i) clone `pane` (`mods/pane-fleet/main.js:68-73`) which wraps the terminal slot and already renders the per-pane top header bar—adding the collapsible decision bar at the bottom of the focused pane costs zero layout-state writes and collapses to `0px` instantaneously without mutating `layouts/.state/flat.json` on every focus change—OR (ii) use a layout node in `flat.json` driven by `run("layout.set", { id: "decision-strip", visible })`. Mechanism (i) (or a non-layout-mutating footer) avoids writing `.state/flat.json` every time the operator clicks between panes!
  - *Reliable detection rules*:
    - Trigger when `focused()?.terminal` is an agent in `done`, `idle`, or `blocked`, keyed on `${terminal}:${seq}`.
    - Read `hc(["read", terminal, "--lines", "120", "--json"])` so multi-question chart rounds that scroll above a 30-row pane are still captured in full.
    - Slice text after the last user prompt line (`❯` / `>` / `<hc>`) so options from earlier rounds in scrollback are ignored.
    - Match line-anchored option definitions:
      - Standard chart-door format (`skills/chart-issues/assets/questions.md` `# Operator questions and peer exchange`): `- **1a (recommended)** — ...`, `- **1b** — ...`, or `1a) ...` / `1a: ...` / `01a ...`.
      - Require either $\ge 2$ distinct options sharing a question prefix (e.g., `1a` and `1b`) OR an explicit footer cue (`Reply \`1a...`) OR a `(recommended)` tag.
      - Explicitly exclude duration/size tokens (`1s`, `1m`, `1h`, `1d`, `1b` when preceded by digits/hex without option punctuation) so git SHAs, file sizes, and timings (`12m`, `3d`) never trigger false buttons.
  - *Composer UX for multi-question rounds*:
    - Group chips by question (`Q1: [1a ★] [1b]`, `Q2: [2a ★] [2b] [2c]`).
    - Clicking `1a` selects `1a` for Q1; if there is only 1 question group and no note is being typed, clicking can either send immediately or stage into the `1a | 2b` composer bar with:
      - `[★ All recommended]` one-click button
      - `[elid]` button ("even less if doable", used heavily by the operator in `INTAKE.md` `# Context`)
      - Inline note field (`input("decision-note")` appending ` - <note>` to the active question or ` | <note>`)
      - `[Send ↵]` button dispatching `hc(["send", "--force", terminal, payload])`.
- **Option 5b — Regex-scan `hc read --lines 0` for any `/\b\d[a-z]\b/` and send immediately on single click.**
  - *What it breaks*:
    1. `--lines 0` misses Q1/Q2 whenever a 4-question round is taller than the terminal viewport.
    2. Loose `/\b\d[a-z]\b/` matches git short SHAs (`8a4f1b`), durations (`5m`, `2h`), and markdown list items.
    3. Immediate single-click send makes it impossible to answer a 3-question round (`1a | 2b | 3a`) in one turn—sending `1a` immediately submits the turn before the operator can pick `2b` and `3a`!
- **Recommendation**: **Option 5a**.

---

### Fork 6 · A1/A2/A3 Files & Changes: Worktree Target, Scope Switch, Safe Commit, and Full-Width Pane Mode

Addressing `INTAKE.md` (`# Context` F1–F6 and `# Change` items 1–3).

- **Option 6a (recommended) — Shared worktree selector (`workspace.worktree` in `shared()` defaulting to `"Follow focused pane"`), merge-base branch diff (`git diff --numstat <base>...HEAD`), file-checkbox staging instead of `git add -A`, Markdown preview toggle, and one-click "Open as pane" (`pane.split` / `tab.new`).**
  - *A3 Worktree switcher*:
    - Discover worktrees via `git -C <repoRoot> worktree list --porcelain` AND scan `~/.akrogon/worktrees/<repo>/*` when the current repo is registered in `~/.akrogon/config.yaml`.
    - Default mode: **Follow focused pane** (`focused()?.cwd`), with a header dropdown in both Files and Changes to pin any active worktree (`main` checkout or an `akrogon` leaf worktree) so inspecting a background leaf doesn't require keeping its terminal focused.
  - *A1 Changes (`mods/changes-fleet`)*:
    - **Scope toggle**: `Working tree` (current unstaged + staged + untracked vs `HEAD`) vs `Branch vs main` (`git merge-base HEAD main` $\rightarrow$ `git diff --numstat <base>...HEAD` and `git diff <base>...HEAD -- <path>`).
    - **Fixing F3 (`git add -A` sweeping `issues/*.jsonl`)**: In `/home/ivan/.config/herdr-app/mods/changes/main.js:90-98`, `commit()` unconditionally runs `git(["add", "-A"])`, which stages dirty `issues/log.jsonl`, `issues/timings.jsonl`, and scratch files. Replace `git add -A` with per-file checkboxes (defaulting to excluding `issues/*.jsonl` or requiring explicit selection / staging via `git add -- <selected-paths>`), plus an option to hide the commit box when viewing `Branch vs main`.
    - **Rich inline diff & Open in $EDITOR**: Keep `/home/ivan/.config/herdr-app/mods/changes/main.js:150-169` (`TextView.diff(this.diffText, row.path)`), increase default expanded diff viewport height (from fixed `.h(220)` at `changes/main.js:165` to resizable/larger `.h(360)` in sidebar and `.flex_1()` in full-width pane mode), and add an `Open in pane` / `$EDITOR` button per file.
  - *A2 Files (`mods/files-fleet`)*:
    - **Markdown preview toggle**: In `/home/ivan/.config/herdr-app/mods/files/main.js:126-143`, `preview()` renders all files via `TextView.code("file-preview", this.previewText, this.selected)`. When `this.selected.endsWith(".md")`, default to `TextView.markdown("file-md-preview", this.previewText)` (`gpui-kit.d.ts:21923-21936`) with a `[Rendered | Raw]` toggle button in the preview header!
    - **Quick filter / changed-files filter**: Add `input("files-filter").placeholder("Filter files…")` at the top of the tree plus a `[All | Changed]` chip filter.
  - *A1/A2 Full-width pane mode (fixing F1/F6)*:
    - Both `files-fleet` and `changes-fleet` check `this.props?.asPane` (or measure container width / context). In sidebar mode, add an `[↗ Pane]` button in the panel header that calls `run("pane.split", { direction: "right", mod: "changes-fleet", props: { asPane: true, cwd: this.cwd, selected: this.selected } })` (or `run("tab.new", { mod: ..., name: ... })`). In pane mode (`asPane: true`), render a master-detail horizontal split (`h_flex().flex_1()`: left file list `260px`, right full-height `TextView.diff` or `TextView.markdown`/`TextView.code`).
- **Option 6b — Keep `files` and `changes` strictly inside the right sidebar and simply widen `panel` in `flat.json` from `280px` to `520px`.**
  - *What it breaks*: Permanently steals `520px` from the central terminal pane even when the operator just wants a quick file glance, while still feeling cramped for side-by-side diffs or long `INTAKE.md` / `map-*.md` artifacts.
- **Recommendation**: **Option 6a**.

---

### Fork 7 · A8 Left Sidebar Proportions and Spaces Vertical Scrolling

`INTAKE.md` (`# Change`, item 8) specifies: *"Left sidebar layout (`flat.json`): shrink Spaces so Needs-you + Agents get the height; Spaces scrolls vertically when it overflows."*

- **Option 7a (recommended) — Cap `spaces` height in `flat.json` (e.g. `size: { px: 165 }, min: 90, max: 220` while `agents` has `size: { weight: 1 }, min: 180`) AND clone `spaces` (`spaces-fleet`) to add `.id("spaces-list")` on the scroll container (`spaces/main.js:375`).**
  - *What we verified in the code*:
    1. In `/home/ivan/Work/omarchy-customizations/herdr-app/layouts/flat.json:27-45`, `spaces` and `agents` currently both have `"size": { "weight": 1 }, "min": 90` (50% / 50% split of `sidebar-lists`). Worse, `/home/ivan/.config/herdr-app-sessions/infra/layouts/.state/flat.json:33-51` caches `sidebar-lists` node sizes!
    2. In `/home/ivan/.config/herdr-app/mods/spaces/main.js:375`, the list container already has `.child(v_flex().flex_1().min_h(0).px(8).pb(14).overflow_y_scrollbar().mode("always").children(rows))` — **HOWEVER**, that `v_flex()` has **no `.id(...)`**! Per `/home/ivan/.config/herdr-app/gpui-kit.d.ts:1071-1076`, GPUI requires a stable `.id("spaces-list")` on scroll containers (compare `mods/agents-by-tab/main.js:420` which has `.id("agents-list").overflow_y_scrollbar()`, `mods/changes/main.js:204` `.id("changes-list")`, and `mods/files/main.js:165` `.id("files-tree")`). Without `.id("spaces-list")`, scroll position resets or fails to track cleanly when rows re-render or drag states update.
  - *What it could break or invite later*: Needs `spaces-fleet` clone (1-line fix adding `.id("spaces-list")` at `spaces/main.js:375` + optional compact row padding) and updating `flat.json`.
- **Option 7b — Change only `flat.json` weights without cloning `spaces`.**
  - *What it breaks*: Scroll state on the un-ID'd `v_flex` in `spaces/main.js:375` is unstable across reactive updates in `gpui-kit`.
- **Recommendation**: **Option 7a**.

---

### Fork 8 · Visual Language, Agent Logos, and Theme Fidelity

How agent logos/program icons are drawn and what "beautiful" means concretely in the operator's Omarchy theme.

- **Option 8a (recommended) — Strict semantic `theme()` tokens + native `Program` SVG/image rendering (`tint ? svg().text_color() : image()`) + translucent status pills (`t[status] + "26"`).**
  - *How agent logos / program icons work (`herdr.d.ts:137-153`, `AGENTS.md` `## Programs: programs.json`, `mods/agents/main.js:66-69`)*:
    - Every terminal/pane/agent carries `program: { key, name, icon, tint, tile, color, shell, agent }`.
    - Built-in icons in `/home/ivan/.config/herdr-app/icons/`:
      - `claude` $\rightarrow$ `icons/claude.svg` (`tint: false`, warm terracotta `#D97757` starburst)
      - `codex` $\rightarrow$ `icons/codex.svg` (`tint: false`, indigo/violet gradient tile)
      - `pi` $\rightarrow$ `icons/pi.svg` (`tint: true`, monochrome vector path that **must** be rendered via `svg(p.icon).size(px).text_color(t.foreground)`—if rendered with `image()`, it stays raw `#fff` and ignores theme contrast!)
      - `antigravity` $\rightarrow$ `icons/antigravity.svg` (`tint: false`, multi-color gradient emblem)
    - When rendering an `akrogon` seat/harness in A4 Tasks where no live `herdr-app` terminal exists yet, resolve the harness name (`claude`, `codex`, `pi`, `antigravity` from `~/.akrogon/config.yaml:13-77`) through a shared `programIcon(keyOrProgram, size, fallbackColor)` helper that uses `svg(icon).size(size).text_color(fallbackColor)` for `tint: true` (`pi`, `opencode`, `gemini`, `cursor`, `copilot`, `hermes`) and `image(icon).w(size).h(size)` for `tint: false` (`claude`, `codex`, `antigravity`).
  - *What "beautiful" means concretely in this theme (`/home/ivan/.config/herdr-app/themes/omarchy.json:1-49`, `/home/ivan/Work/omarchy-customizations/herdr-app/apply-herdr-app-theme:1-55`)*:
    - The operator's live theme is a warm botanical dark palette at 89.5% window opacity (`herdr-app/README.md` `## Look`):
      - Surfaces: `chrome` `#191D18`, `surface`/`canvas` `#1F241E`, `raised`/`hover` `#2A3028`, `selected`/`border` `#3C4839`.
      - Typography (`JetBrainsMono Nerd Font`): `foreground` `#E8DFC9` (warm parchment), `muted` `#C9C3AF`, `dim` `#687061`.
      - Semantic accents: `accent`/`ansi2`/green `#A3B18A` (sage), `ansi1`/terracotta-red `#D47C61`, `ansi3`/amber-gold `#D6AE64`, `ansi4`/slate-blue `#7F9AA8`, `ansi5`/mauve `#B98E91`, `ansi6`/teal `#8FB9A8`.
    - Concrete design rules so every mod looks native and survives live `omarchy` theme switches:
      1. **Zero hardcoded hex colors** in mods—always read `const t = theme()` in `render()` and use `t.chrome`, `t.surface`, `t.raised`, `t.border`, `t.foreground`, `t.muted`, `t.dim`, `t.accent`, `t.working`, `t.blocked`, `t.done`, `t.error`, `t.ansi1..6`, plus 2-digit hex alpha suffixes (`t.blocked + "26"` fill, `t.blocked + "66"` border) for badges and callout cards.
      2. **Zero outer card border-radius in flat layout** (`flat.json:4` uses `radius: 0, gap: 0` with `1px` `t.border` hairlines), while inner pills/buttons/inputs use subtle `.rounded(4)` or `.rounded(5)` (`mods/agents-by-tab/main.js:187,315`, `mods/changes/main.js:189`).
      3. **Left-edge status stripe + logo pairing**: Match `mods/agents-by-tab/main.js:204` (`3px` left status bar in `t[status]` + `14px` agent logo + `12px` primary label in `t.foreground` + right-aligned tabular metadata in `10px` `t.dim`).
      4. **GPU-only motion**: Use `svg("mods/workspace-chrome/spinner.svg").spin(900)` for active `working` phases (`AGENTS.md` `## Keep in mind`), never `setInterval` ticks unless displaying a coarse minute counter (updated at most every 15–30s).

---

## 2. Questions an Experienced Practitioner Would Ask Before Building This

1. **GPUI Scroll Identity & Virtual List Event Constraints**
   - *Question*: Do all scrollable containers in custom/cloned mods carry a stable `.id(...)`, and do any virtualized lists attach `.on_click` inside item renderers?
   - *Why it matters*: In `gpui-kit`, `overflow_y_scrollbar()` without `.id(...)` loses scroll state on re-render (`/home/ivan/.config/herdr-app/gpui-kit.d.ts:1071-1076`), and `v_virtual_list` throws at runtime if elements inside its item renderer attach `.on_click` instead of using `.on_item_click` (`AGENTS.md` `## Keep in mind`).
   - *Source*: `better-than-training` (`AGENTS.md` `## Keep in mind`; `/home/ivan/.config/herdr-app/gpui-kit.d.ts:1071-1076`; `/home/ivan/.config/herdr-app/mods/spaces/main.js:375`).

2. **Layout Tree Sizing vs. "Hidden When Empty" Panels (A5 & A6)**
   - *Question*: If A5 (`Needs-you`) and A6 (`Decision buttons`) are declared as standalone nodes in `layouts/flat.json`, how do they collapse to `0px` when empty without leaving dead chrome or writing `layouts/.state/flat.json` on every focus change?
   - *Why it matters*: In `herdr-app`, every visible child in a layout `column`/`row` occupies its configured `size` (`px` or `weight`) and `min` (`AGENTS.md` `## Layouts: layouts/<name>.json`). Embedding `Needs-you` at the top of `agents-by-tab` and rendering `decision-strip` inside a cloned `pane` wrapper (or toggling `layout.set` `{ visible }` only when presence flips) prevents permanent dead space.
   - *Source*: `better-than-training` (`AGENTS.md` `## Layouts: layouts/<name>.json`; `/home/ivan/.config/herdr-app/herdr.d.ts:10`; `/home/ivan/.config/herdr-app-sessions/infra/layouts/.state/flat.json:1-90`).

3. **Terminal Multiplexer Focus vs. Background Inspection (`wezterm` / `zellij` / `tmux` practitioner pattern)**
   - *Question*: When the operator is monitoring 4–8 parallel agent worktrees across tabs, does inspecting a background leaf's diff in Changes force a terminal focus switch (which marks a `done` agent `idle` and changes the active tab), or can Changes/Files pin a worktree independently of terminal focus?
   - *Why it matters*: Focusing a pane with `done` status immediately clears its `done` badge (`AGENTS.md` `## herdr-core (hc)`). Pinning a worktree in A3 lets the operator review a background leaf's changes or markdown artifacts without disturbing terminal focus or `done` indicators.
   - *Source*: `operator` (`INTAKE.md` `# Context` F2 & `# Change` A3) and `better-than-training` (`AGENTS.md` `## herdr-core (hc)`).

4. **Agent Harness `blocked` Guardrails & TUI Input Modes (`hc` / Claude Code / Codex / Pi)**
   - *Question*: What happens when an inbox or decision button sends text via `hc send <addr> <text>` while the target agent is in `blocked` state, or when the reply starts with a slash command like `/clear`?
   - *Why it matters*:
     1. `hc send` refuses with exit code 9 (`blocked`) when the agent's status is `blocked` unless `--force` is passed (`hc --skill` `## Status, recovery, and cleanup`).
     2. `hc send` wraps messages in `<hc from="...">...</hc>` when the sender is an agent (or when `HC_TERM` is set in the environment), which turns slash commands like `/clear` into literal text unless `--raw` is passed (`hc --skill` `## Sending input`). Even in GUI mods, passing `--raw` (or `--force` when answering a prompt) ensures the operator's exact keystrokes (`1a | 2b`) arrive unwrapped as direct user input!
   - *Source*: `better-than-training` (`hc --skill` `## Sending input` & `## Status, recovery, and cleanup`; `hc send --help`).

5. **Git UI Watcher Feedback Loops & Accidental Bulk Staging (VS Code SCM / `lazygit` / GitHub Desktop pattern)**
   - *Question*: Does the `watchFolder` callback in `changes` run `git status` without `--no-optional-locks`, or stage untracked operational logs (`issues/*.jsonl`) on commit?
   - *Why it matters*: Shipped `/home/ivan/.config/herdr-app/mods/changes/main.js:55` properly passes `--no-optional-locks` to `git status` so `.git/index.lock` writes don't re-trigger `watchFolder(cwd)` in an infinite loop (`AGENTS.md` `## Keep in mind`). Any new `git diff` / `git worktree` / `git merge-base` calls added for A1/A3 **must** also pass `--no-optional-locks` and never watch `<repo>` root across 11 repos in A4 (watch `<repo>/issues` instead). And `changes/main.js:94` (`git add -A`) must be replaced with explicit file selection so operational files (`issues/log.jsonl`, `issues/timings.jsonl`) are never swept into a commit.
   - *Source*: `operator` (`INTAKE.md` `# Context` F3) and `better-than-training` (`AGENTS.md` `## Keep in mind`; `/home/ivan/.config/herdr-app/mods/changes/main.js:54-56,90-98`).

---

## 3. Pitfalls Over the Work's Lifetime and What Removes Each

| # | Pitfall | When It Strikes | What Removes It |
|---|---|---|---|
| **P1** | **New personal mods missing in existing `--session` homes (`infra`, `personal`, `mdconsultingny`)**: `herdrapp:78-93` only symlinks personal mods when launching a session, and `herdrapp:116-120` only copies `shared.json` (`workspace.panels`) when `.herdrapp-ready` doesn't exist yet. | Immediately on handoff when testing in `infra` or `personal` sessions. | **Done-criterion + deploy step**: Update `install.sh` / `herdrapp` and run a sync step that symlinks all personal mods into `~/.config/herdr-app-sessions/*/` and adds `"tasks"` to `"workspace.panels"` in every session's `shared.json`. |
| **P2** | **`install.sh:316-325` overwrites active layout back to `board`**: Running `omarchy-customizations/install.sh` switches `herdr-app` to `board` even though the operator runs `flat` across all sessions. | Whenever `install.sh` is run now or in future dotfile syncs. | **Option choice (Fork 1a)**: Update `/home/ivan/Work/omarchy-customizations/install.sh:316-325` to preserve the current layout (defaulting to `flat`). |
| **P3** | **`tabs` mod hides or ignores the new `tasks` panel**: Shipped `/home/ivan/.config/herdr-app/mods/tabs/main.js:21-46,80,97-98` only renders buttons for `files` and `changes` and collapses `"panel"` on space switch if the active panel isn't in `this.panels[space.id]`. | As soon as `tasks` is added to `panel-body` in `flat.json`. | **Option choice (Fork 2a)**: Clone `tabs` $\rightarrow$ `tabs-fleet`, add the `tasks` toggle icon/button, and include `"tasks"` in `enabled` panel syncing. |
| **P4** | **`hc send` fails with exit code 9 on `blocked` agents OR wraps operator replies in `<hc>` tags**: If `HC_TERM` is inherited in the environment or the target agent is `blocked`, `hc(["send", addr, text])` either fails (`exit 9`) or wraps the text in `<hc from="...">`. | When clicking a decision button in A6 or sending a reply in A5. | **Option choice + Done-criterion**: Always call `hc(["send", "--raw", "--force", addr, text])` for operator-initiated replies in A5 and A6. |
| **P5** | **A4 reading only `issues/log.jsonl` shows wrong slots and misses new leaves**: `log.jsonl` records the slot that *finished* `from`, not the active slot in `to`, and has 0 rows for newly opened leaves. | During live `akrogon` runs whenever a leaf opens or transitions phases. | **Option choice (Fork 3a)**: Read `issues/open/**/state.yaml` for open leaves, current phase, active slots, `busy_since`, `batch`, and `blocked-by`, joined with `issues/log.jsonl` for transition timestamps and last merges. |
| **P6** | **Watching 11 full repo roots with `watchFolder` saturates file watchers and CPU**: Watching `<repoRoot>` across 11 repos fires on every compiler output, `.git` loose object, or `node_modules` touch. | Continuously across all sessions once A4 is loaded. | **Option choice (Fork 3a)**: Only call `watchFolder("${repoRoot}/issues")` for each repo in `~/.akrogon/config.yaml`, debounced at 150ms. |
| **P7** | **Git index lock loop in A1/A3**: Running `git` commands inside a `watchFolder` handler without `--no-optional-locks` creates `.git/index.lock`, re-triggering the watcher endlessly. | Whenever Changes or Files refreshes on a repo with uncommitted changes. | **Done-criterion**: Every `git` invocation in `changes-fleet` and `files-fleet` must pass `--no-optional-locks` before the subcommand (`git(["--no-optional-locks", "diff", ...])`). |
| **P8** | **Cached layout state in `layouts/.state/flat.json` masks `flat.json` edits**: Each session caches `panel-body.active` and node sizes in `layouts/.state/flat.json`. | When resizing `spaces` (A8) or adding `tasks` to `panel-body` (A4). | **Done-criterion**: After updating `layouts/flat.json`, verify via `herdr-app layout.get` in both default and `--session infra` (and clear stale node overrides in `layouts/.state/flat.json` if needed). |

---

## 4. Work Split Into Independently Checkable Outcomes & Dependencies

The work splits cleanly into **4 independent leaves** (or 1 foundation leaf + 3 parallel feature leaves):

```
[Leaf 1: Layout, Session Pipeline, Tabs & Spaces Scroll (A8 + Foundation)]
       │
       ├───────────────────────────────┬───────────────────────────────┐
       ▼                               ▼                               ▼
[Leaf 2: Worktree-Aware         [Leaf 3: Akrogon Tasks          [Leaf 4: Needs-You Inbox (A5)
 Files & Changes + Pane          Board (A4)]                     & Decision Strip (A6)]
 Mode (A1, A2, A3)]
```

1. **Leaf 1 — Layout Foundation, Session Propagation, `tabs-fleet`, and Spaces Vertical Scroll (A8)**
   - *Scope*:
     - Clone `spaces` $\rightarrow$ `spaces-fleet` (add `.id("spaces-list")` on scroll container at `spaces/main.js:375`) and `tabs` $\rightarrow$ `tabs-fleet` (support `files`, `changes`, `tasks` toggles in top bar + `prefix` shortcut).
     - Update `/home/ivan/Work/omarchy-customizations/herdr-app/layouts/flat.json` (and `board.json` panel stack) to shrink `spaces` (`px: 165, min: 90, max: 220`), give `agents` `weight: 1`, wire personal mod names, and add placeholder/slot for `tasks` in `panel-body`.
     - Update `omarchy-customizations/install.sh` and `herdrapp` so `flat` is preserved as active layout and all personal mods + `workspace.panels: ["files", "changes", "tasks"]` propagate to `~/.config/herdr-app` and `~/.config/herdr-app-sessions/*/`.
   - *Independently checkable done-criteria*:
     - `herdr-app check` passes (`0 errors`); `herdr-app layout.get` shows `spaces-fleet`, `tabs-fleet`, and shrunk `spaces` height; `Spaces` scrolls vertically when overflowed; top right bar shows `Files`, `Changes`, and `Tasks` toggles across `default` and `infra` sessions.

2. **Leaf 2 — Worktree-Aware Changes & Files with Scope Switch, Markdown Render, and Pane Mode (A1, A2, A3)** *(depends on Leaf 1 mod wiring)*
   - *Scope*:
     - In `changes-fleet`: worktree selector (`Follow focused pane` + git worktrees / `~/.akrogon/worktrees/<repo>/*`), `Working tree` vs `Branch vs main` (`git merge-base HEAD main`) toggle, safe per-file checkbox staging (removing blind `git add -A`), larger diff view, and `[↗ Pane]` button (`pane.split` / `tab.new` with `asPane: true`).
     - In `files-fleet`: shared worktree selector, file name filter + `[All | Changed]` toggle, `TextView.markdown` default for `.md` files with `[Rendered | Raw]` toggle, and `[↗ Pane]` button.
   - *Independently checkable done-criteria*:
     - Selecting an `akrogon` worktree updates both Files and Changes without changing terminal focus; switching Changes to `Branch vs main` shows branch-level `+add -del` and diffs; selecting a `.md` file renders formatted Markdown; clicking `[↗ Pane]` opens a full-width master-detail pane in the workspace; `herdr-app check` passes.

3. **Leaf 3 — Akrogon Tasks Board (A4)** *(depends on Leaf 1 `panel-body` & `tabs-fleet` wiring)*
   - *Scope*:
     - Build `mods/tasks/main.js` reading `~/.akrogon/config.yaml`, `<repo>/issues/open/**/state.yaml`, `<repo>/issues/log.jsonl`, and `<repo>/issues/timings.jsonl` with `watchFolder("<repo>/issues")`.
     - Render open leaves (repo pill, slug, phase badge, active slot + harness logo via `programIcon`, live time-in-phase, red alert past normal or on `delivery_error`/`failure`), merge queue section (`src/turn.ts:105-131` order), and last merges section.
     - Click row $\rightarrow$ jumps to matching `herdr-app` pane/tab (by `herdr.tab` label, tab name, or worktree `cwd`), or pins that leaf's worktree in Changes/Files if running in legacy `herdr`.
   - *Independently checkable done-criteria*:
     - Opening `Tasks` panel displays all live open leaves across registered repos matching `akrogon status`, shows merge queue and recent merges, highlights overdue phases in `t.ansi1`/`t.error`, and focuses the target pane (or worktree) on click; `herdr-app check` passes.

4. **Leaf 4 — Needs-You Inbox & Decision Buttons Strip (A5, A6)** *(can run in parallel with Leaves 2 & 3)*
   - *Scope*:
     - **A5**: Add collapsible `Needs-you` inbox at the top of `agents-by-tab` (hidden with `0px` height when no agent is waiting). Detect `blocked` agents (and `done` agents with pending question prompts), fetch screen tail via cached `hc(["read", addr, "--lines", "0", "--json"])`, show agent logo + space/tab + extracted question + inline reply `input()` and quick-action buttons (`hc(["send", "--raw", "--force", addr, text])`).
     - **A6**: Add collapsible decision strip below the focused terminal (via cloned `pane-fleet` wrapper or auto-toggled layout node). Parse last assistant turn via cached `hc(["read", addr, "--lines", "120", "--json"])` for grouped option codes (`1a`/`1b`, `2a`/`2b`), render multi-question option buttons + `[★ Recommended]` + `[elid]` + inline note input + `[Send ↵]`.
   - *Independently checkable done-criteria*:
     - When no agent is waiting, `Needs-you` is completely hidden; when an agent is `blocked` or waiting on a question, `Needs-you` appears with the question text and sends the inline reply via `hc send --raw --force`; when a focused pane displays coded options (`1a`/`1b`), A6 renders clickable chips below the terminal that compose and send `1a | 2b` + optional note, and hides when switching to a pane without options.

---

## 5. What in the Intake Is Wrong, Unneeded, or Missing

1. **Wrong / Incomplete in `INTAKE.md` (`# Change`, item 4): *"fed by `issues/log.jsonl` via watchFolder"***
   - `issues/log.jsonl` alone **cannot** feed A4's open-leaf rows, active slots, or merge queue. Verified in `/home/ivan/Work/infra/akrogon/src/state.ts:81-109` and `/home/ivan/Work/infra/akrogon/src/status.ts:68-109`:
     - Newly handed-off leaves in `issues/open/` have zero entries in `issues/log.jsonl` until their first phase finishes.
     - The `slot` field in `log.jsonl` is the slot that *completed* `from`, not the currently active slot in `to`.
     - Current `phase`, active `slot`, `busy_since`, `batch`, `blocked-by`, `delivery_error`, and `worktree` only exist in `issues/open/**/state.yaml`.
   - **Fix**: Watch `<repo>/issues` via `watchFolder`, and read `issues/open/**/state.yaml` + `issues/log.jsonl` (+ `issues/timings.jsonl`).

2. **Missing in `INTAKE.md` (`# Change`, item 4): `mods/tabs/main.js` hardcodes only `files` and `changes`**
   - `INTAKE.md` says *"new mod in the `panel-body` stack alongside `files` and `changes`"*, assuming adding a third child to `panel-body` in `flat.json` is enough. In reality, `/home/ivan/.config/herdr-app/mods/tabs/main.js:21-46,80,97-98` hardcodes only `files` and `changes` buttons and collapses `panel` on space switch if the active panel isn't in `enabled` (`shared.json` `"workspace.panels"`).
   - **Fix**: Clone `tabs` and add `"tasks"` to `"workspace.panels"` across all sessions' `shared.json`.

3. **Subtle Mismatch in `INTAKE.md` (`# Change`, item 5): `blocked` status vs. conversational questions**
   - In `herdr-app`, `a.status === "blocked"` only fires when a harness is paused inside a tool-permission prompt or TUI dialog (`hc --skill` `## Status, recovery, and cleanup`). When a chart door or agent asks a conversational fork question (`1a / 1b`) and finishes its turn, its status is `done` (or `idle` if focused). Also, `hc send` without `--force` fails with exit code 9 when `status === "blocked"`.
   - **Fix**: A5 must pass `--raw --force` to `hc send`, and should surface both `blocked` agents and `done` agents whose last turn ends with a question/decision prompt.

4. **Misdiagnosed Root Cause in `INTAKE.md` (`# Change`, item 8): `spaces/main.js` already has `overflow_y_scrollbar()`**
   - `/home/ivan/.config/herdr-app/mods/spaces/main.js:375` already calls `.overflow_y_scrollbar().mode("always")`. It fails to scroll properly only because (a) `flat.json:37` gives `spaces` `"weight": 1` (50% of sidebar height, so 5 spaces never overflow) and (b) `spaces/main.js:375` omitted `.id("spaces-list")` on the scroll container (`gpui-kit.d.ts:1071-1076`).

5. **Missing Operational Constraint: `omarchy-customizations` is not registered in `~/.akrogon/config.yaml`, and `install.sh` clobbers `flat` layout**
   - `/home/ivan/.akrogon/config.yaml:1-81` does not list `omarchy-customizations` as a registered repo, and `/home/ivan/Work/omarchy-customizations/install.sh:316-325` forces `layout.switch --name board`. Execution must update `omarchy-customizations/herdr-app/` directly, fix `install.sh` so it preserves `flat`, and propagate symlinks to `~/.config/herdr-app-sessions/{infra,personal,mdconsultingny}`.
