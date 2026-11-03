# Look of the New Panels (Round 5) — Blind Notes (Seat D)

## 1. Panel shape (today vs side size `368px` and full width)

- **(1) Pick with reason and cost**
  - **Pick**:
    - **Today's defect**: Shipped `files` (`/home/ivan/.config/herdr-app/mods/files/main.js:159`) and `changes` (`/home/ivan/.config/herdr-app/mods/changes/main.js:179`) wrap their root `v_flex()` in `.rounded(10).overflow_hidden().bg(t.background).border_1().border_color(t.border)`. That was designed for Herdr's shipped `main.json` (`/home/ivan/.config/herdr-app/layouts/main.json:103-119`), where `work-body` has `"padding": 8, "gap": 8` and `"radius": 10` floating cards. In the operator's `flat.json` (`/home/ivan/Work/infra/herdr-setup/layouts/flat.json:116-118,156-157,178-181`), `work-body` has `"padding": 0, "gap": 0`, `"main"` has `"radius": 0`, and adjacent edges already have `1px` borders (`tabs/main.js:92` `.border_b(1)`, `session-status/main.js:24` `.border_t(1)`, and `flat.json:178-181` `"divider": { "width": 1, "color": "border" }`). As a result, `.rounded(10).border_1()` leaks 4 corner triangles of `t.canvas` and doubles the top, bottom, and left borders to `2px`.
    - **What all four right-panel mods (`tasks`, `needs-you`, `files`, `changes`) should use at both `368px` side size and full width**:
      1. **Outer panel container (both `368px` and full width)**: **Flat edge (`.rounded(0)`, no outer `.border_1()`)** on the root `v_flex().size_full().min_h(0).bg(t.background).text_color(t.foreground).text_size(13)`. The `1px` top border from `tabs`, `1px` bottom border from `session-status`, and `1px` left divider from `flat.json` frame the panel cleanly at `368px` (between `main` and `panel`) and at full width (between `sidebar` and `panel`).
      2. **Header row (both sizes)**: `h_flex().h(42).flex_none().px(14).gap(8).items_center().border_b(1).border_color(t.border)` (matching `files/main.js:160` and `changes/main.js:183`).
      3. **Body padding & inner rows/cards**:
         - `Files` and `Changes` keep `.p(6)` on list containers (`files/main.js:164`, `changes/main.js:187`) and `.rounded(7)` on individual rows (`changes/main.js:189`).
         - `Tasks` and `Needs you` use `.p(8)` (`.px(12).py(10)` when width `>= 640px` via `.on_size_change`) on the scrollable list container, with `.rounded(8)` on interactive leaf rows and question cards (matching `agents-by-tab/main.js:330`).
  - **Reason**: Eliminates double borders and corner bleed in `flat.json` at `368px`, makes full-width mode visually seamless when replacing `main` (`radius: 0`), and keeps inner interactive rows/cards soft (`.rounded(7)`/`.rounded(8)`).
  - **Cost**: Changing `.rounded(10)...border_1().border_color(t.border)` to flat `v_flex().size_full().min_h(0).bg(t.background)` in the cloned `files` and `changes` mods (`2` lines each) and using the same root container in `tasks` and `needs-you`.

- **(2) Rejected options with reasons**
  - **Keep `.rounded(10).border_1()` on the root panel at `368px` or full width**: Rejected; inside `flat.json:156-157` (`padding: 0, gap: 0`), `rounded(10)` leaves notched corners against flat neighbors and duplicates borders against `tabs`, `session-status`, and `work-body` divider.
  - **Switch between `.rounded(10).border_1()` at `368px` and `.rounded(0)` at full width**: Rejected; `flat.json` is zero-gap at `368px` too (`flat.json:116,156-157`), so `.rounded(0)` is right at both sizes.

- **(3) Evidence**
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:116-118,156-157,178-181` — `main` has `radius: 0, gap: 0`, `work-body` has `padding: 0, gap: 0`, `root` has `divider: { width: 1, color: "border" }`.
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/layouts/main.json:103-104,112-113` — shipped `main` layout uses `padding: 8, gap: 8, radius: 10`, explaining why `files/main.js:159` and `changes/main.js:179` had `.rounded(10).border_1()`.
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/tabs/main.js:92` & `/home/ivan/Work/infra/herdr-setup/mods/session-status/main.js:24` — top bar has `.border_b(1)` and status bar has `.border_t(1)`.

- **(4) Pitfalls and what removes each**
  - **Pitfall**: In full-width mode (`1200px+`), prose in `Files` markdown (`TextView.markdown`) or `Needs you` question cards stretches across the entire monitor width and becomes hard to scan.
  - **Removal**: Keep the scrollable container full-width (so scrollbars sit at the right window edge and diffs/code tables can use full width), and cap `TextView.markdown` and `Needs you` card bodies at `.max_w(860)` inside the container.

- **(5) Unasked question**
  - *In full-width mode (`>= 800px`), should `Changes` stack the file list above the diff (as at `368px`) or place the file list and diff side-by-side?*
  - **Answer**: Keep the stacked layout at `< 720px`, or allow the file list height cap in `changes/main.js:187` to breathe (`240px`), keeping the structure identical to today (`INTAKE.md` `## Round 4` item 1a).

---

## 2. Logos (matching `agents-by-tab` in `Tasks` and `Needs you`, and two-seat rows)

- **(1) Pick with reason and cost**
  - **Pick**:
    1. **Exact rendering helper from `agents-by-tab`**: Use the exact `icon(p, size, color)` function from `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:66-69`:
       ```js
       function icon(p, size, color) {
         if (!p?.icon) return null;
         return p.tint ? svg(p.icon).size(size).flex_none().text_color(color) : image(p.icon).w(size).h(size).flex_none();
       }
       ```
       Render main row logos at `16px` (`icon(p, 16, t.foreground)`, matching `agents-by-tab/main.js:284`) and sub-row / expanded seat detail logos at `14px` (`icon(p, 14, t.foreground)`, matching `agents-by-tab/main.js:176`).
    2. **Why `p.tint` must be respected (resolving tinted vs full-color)**: In Herdr's embedded `defaults/programs.json` and `/home/ivan/.config/herdr-app/icons/`:
       - `claude` (`icons/claude.svg:1`, `#D97757`), `codex` (`icons/codex.svg:1`, purple-blue gradient), and `antigravity` (`icons/antigravity.svg:1`, Google multi-color gradient) have `tint: false` and render in **full brand color** via `image(p.icon)`.
       - `pi` (`icons/pi.svg:1-20`, `#fff` monochrome path) and `opencode` (`icons/opencode.svg`, `gemini.svg`) have `tint: true` and render tinted to `t.foreground` via `svg(p.icon).text_color(t.foreground)`.
       Using `p.tint ? svg(...) : image(...)` reproduces the exact left-sidebar logos the operator approved (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` `## Source: operator 2026-11-03` message 2, `## Round 2` A8).
    3. **How each panel resolves `Program` (`{ icon, tint, name }`):**
       - **`Needs you`**: Reads `a.program` (or `k.program`) directly from `agents()` / `terminals()` (`/home/ivan/.config/herdr-app/herdr.d.ts:167,212`), which Herdr populates from `programs.json`.
       - **`Tasks`**: `akrogon status --json` (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/tasks-panel-final.md:8`) emits the configured harness key for seat `A` and seat `B` (`"pi"`, `"codex"`, `"claude"`, `"agy"`, etc., from `/home/ivan/.akrogon/config.yaml:15-26`). On `init`, the `Tasks` mod calls `await knownAgents()` (`/home/ivan/.config/herdr-app/herdr.d.ts:33`, used in `/home/ivan/.config/herdr-app/mods/new-menu/main.js:28`) and indexes each `Program` by both `p.key` and `p.run?.[0]` (which maps `"agy"` $\rightarrow$ `antigravity` automatically because `antigravity` has `"run": ["agy"]` in `defaults/programs.json`), with a synchronous fallback map `{ claude: { icon: "icons/claude.svg", tint: false }, codex: { icon: "icons/codex.svg", tint: false }, pi: { icon: "icons/pi.svg", tint: true }, agy: { icon: "icons/antigravity.svg", tint: false }, antigravity: { icon: "icons/antigravity.svg", tint: false } }` before `knownAgents()` resolves on the first frame.
    4. **What a `Tasks` row with two seats (`A` and `B`) looks like**:
       - Every akrogon leaf has two configured slots (`A` and `B`, `/home/ivan/Work/infra/akrogon/src/config.ts:20,25`).
       - On line 1 of the two-line leaf row (`tasks-panel-final.md:10`), draw a fixed-width `36px` logo pair `h_flex().w(36).gap(4).items_center().flex_none()` holding `[logoA, logoB]` (`16px` each + `4px` gap = `36px`) before the leaf slug:
         - When both seats participate in the current phase (`plan`, `plan-rebuttal`, `check`) or neither is busy, both logos render at full opacity (`1.0`).
         - When only one seat is active in the current phase (`plan-merge`, `implement`, `fix` run on `A`) or only one seat is currently `busy` (`busy A` or `busy B`), the active seat's logo renders at full opacity and the inactive seat's logo is wrapped in `div().opacity(0.4)` (`color` set to `t.dim` if `tint: true`).
         - In the expanded row detail (`tasks-panel-final.md:11`), the `Seats` line renders `A` with its `14px` logo + model (`[pi logo] A: devin/swe-2-max`) and `B` with its `14px` logo + model (`[codex logo] B: gpt-6.1-sol`).
  - **Reason**: Matches `agents-by-tab/main.js:66-69,284` pixel-for-pixel, keeps leaf slugs aligned in a clean vertical column (`w(36)`), shows both assigned harnesses (`A` and `B`) without text clutter (`INTAKE.md` `## Round 2` A8), and visually distinguishes which seat is currently active.
  - **Cost**: `~18` LOC in `tasks` and `6` LOC in `needs-you`.

- **(2) Rejected options with reasons**
  - **Force all logos through `svg(p.icon).text_color(...)` (monochrome tint everywhere)**: Rejected; turns `claude.svg`, `codex.svg`, and `antigravity.svg` into flat monochrome shapes and breaks visual parity with `agents-by-tab/main.js:68`.
  - **Force all logos through `image(p.icon)` (un-tinted everywhere)**: Rejected; `icons/pi.svg:3` is hardcoded `fill="#fff"`, which becomes invisible on light themes (`paper`) unless drawn via `svg(p.icon).text_color(t.foreground)`.
  - **Show only 1 logo on a `Tasks` row**: Rejected; hides seat `B` during dual-seat phases (`plan`, `check`) and violates `tasks-panel-final.md:8,10` (`seat kinds A/B (for Program logos)`, `two-line leaf rows (logos, slug, phase, time / tags)`).

- **(3) Evidence**
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:66-69,176,284` — defines `icon(p, size, color)` using `p.tint ? svg(...) : image(...)` at `16px` (main rows) and `14px` (sub-rows).
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/icons/claude.svg:1`, `icons/codex.svg:1`, `icons/pi.svg:1-20`, `icons/antigravity.svg:1` — verifies `claude`, `codex`, and `antigravity` are multi-color (`tint: false`) while `pi` is monochrome white (`tint: true`).
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/new-menu/main.js:28,57` & `/home/ivan/.config/herdr-app/herdr.d.ts:33,141-153` — `knownAgents()` returns Herdr's `Program` entries with `key`, `run`, `icon`, and `tint`.

- **(4) Pitfalls and what removes each**
  - **Pitfall**: In `~/.akrogon/config.yaml`, a user names a harness `"claude-max"` whose command starts with `"claude --model ..."`, so looking up `"claude-max"` in `knownAgents()` by key misses `"claude"`.
  - **Removal**: Have `akrogon status --json` emit both the slot's harness key and the first executable token of the harness template (`config.harnesses[slot.harness].trim().split(/\s+/)[0]`, e.g. `"claude"`, `"codex"`, `"pi"`, `"agy"`), which always matches `knownAgents()` (`p.key` or `p.run[0]`).

- **(5) Unasked question**
  - *When seats `A` and `B` are configured to the same harness (e.g. both `claude`), how does the operator tell whether seat `A` or seat `B` is the one working?*
  - **Answer**: Position (`left = A`, `right = B`) plus opacity (`1.0` for active/busy seat, `0.4` for idle seat) and the existing `busy A 12m` tag on line 2 (`tasks-panel-final.md:8,10`) make it unambiguous without adding bracketed harness names.

---

## 3. Top bar (`Tasks`, `Needs you`, `Files`, `Changes`, `⤢`/`⤡` toggle, narrow window, count badge)

- **(1) Pick with reason and cost**
  - **Pick**:
    1. **Button order & icons in cloned `tabs/main.js` (`/home/ivan/.config/herdr-app/mods/tabs/main.js:82-98`)**:
       - Place a `1px` subtle separator (`div().w(1).h(16).mx(3).bg(t.border)`) after the `+` (`tab-new`) button, followed by:
         1. **`⤡` / `⤢` width toggle** (rendered only when `!panel.hidden`, per `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/files-changes-final.md:13`): `button("panel-width", isFull ? "⤡" : "⤢", toggleWidth)` (`size(26)`, `.rounded(6)`, `.text_color(t.muted)`). Putting `⤡`/`⤢` immediately to the **left** of the 4 panel buttons keeps `Tasks`, `Needs you`, `Files`, `Changes` anchored at fixed screen coordinates whether the panel is open or closed.
         2. **`Tasks`** (`id: "tasks"`): icon `svg("mods/workspace-chrome/layers.svg").size(14)`, label `"Tasks"`.
         3. **`Needs you`** (`id: "needs-you"`): icon `svg("mods/workspace-chrome/clock.svg").size(14)` (or a `14px` inbox/bell SVG in `mods/needs-you/inbox.svg`), label `"Needs you"`.
         4. **`Files`** (`id: "files"`): existing `svg("mods/files/file.svg").size(14)`, label `"Files"` (`tabs/main.js:97`).
         5. **`Changes`** (`id: "changes"`): existing `svg("mods/changes/changes.svg").size(14)`, label `"Changes"` (`tabs/main.js:98`).
       - Each panel button uses the exact `panelButton` geometry in `tabs/main.js:82-91`: `h_flex().id("panel-" + id).h(26).px(8).gap(5).flex_none().items_center().rounded(6).text_size(12).bg(on ? t.selected : t.chrome).text_color(on ? t.foreground : t.muted).hover(s => s.bg(t.hover))`.
    2. **Count badge on `Needs you` (Yes, when `count > 0`) and alert dot on `Tasks`**:
       - **`Needs you` count badge**: Compute `blockedCount` and `doneCount` in `tabs/main.js` from `agents()` + `terminals()` (matching `INTAKE.md` `## Round 2` 1a: blocked agents/sub-agents + top-level done agents, plus any active draft in `shared("needs-you.drafts")`).
         - When `total === 0`: show **no badge** (keep the top bar clean when nothing waits).
         - When `blockedCount > 0`: append a compact pill `div().px(5).h(16).rounded(4).bg(t.blocked + "26").text_size(10.5).font_semibold().text_color(t.blocked).flex().items_center().child(String(total))` (matching `agents-by-tab/main.js:203-204`), and tint the `Needs you` icon `t.blocked`.
         - When `blockedCount === 0 && doneCount > 0`: append the same `16px` pill using `bg(t.done + "26").text_color(t.done)` (matching `tabs/main.js:71` / `agents-by-tab/main.js:207`).
       - **`Tasks` red dot**: When the last `Tasks` snapshot has `redCount > 0` (published via `shared("tasks.redCount")`), show a `6px` dot `div().size(6).rounded(3).bg(t.blocked)` inside the `Tasks` button (matching the `6px` status dot in `tabs/main.js:71`); nothing when `0`.
    3. **Narrow window behavior (collapse panel button labels to icons below `720px`)**:
       - Attach `.on_size_change((size, cx) => { const compact = size.width < 720; if (compact !== this.compact) { this.compact = compact; cx.notify(); } })` to the root `h_flex()` in `tabs/main.js:92` (`/home/ivan/.config/herdr-app/AGENTS.md` `### A mod`, `/home/ivan/.config/herdr-app/herdr.d.ts:380`).
       - When `this.compact` is true (`width < 720px`), omit the text label inside `panelButton` (keeping the `14px` icon + count pill/dot and `.px(6)`), and attach `.tooltip(label)` so all 4 buttons shrink from `~290px` to `~120px` and leave room for `#tab-scroll` (`tabs/main.js:95`).
  - **Reason**: Fits naturally into `tabs/main.js:82-101`, surfaces waiting questions (`Needs you` count) and real task blocks (`Tasks` red dot) even when the right panel is closed, and prevents tab-bar overflow on narrow/tiled windows.
  - **Cost**: `~35` LOC in `/home/ivan/Work/infra/herdr-setup/mods/tabs/main.js`.

- **(2) Rejected options with reasons**
  - **Always show `0` badge on `Needs you` (`Needs you 0`)**: Rejected; permanent visual noise when no agent is waiting.
  - **Put `⤡`/`⤢` to the right of `Changes` (between `Changes` and window buttons)**: Rejected; showing/hiding `⤡`/`⤢` when the panel opens/closes would shift `Tasks`, `Needs you`, `Files`, and `Changes` left and right by `29px` right under the user's cursor when they click a panel button.
  - **Never collapse labels in narrow windows**: Rejected; on a half-screen tiled window (`~960px` total, minus `268px` sidebar = `692px` for `tabs`), `290px` of right-panel buttons plus window buttons leaves `< 340px` for terminal tabs.

- **(3) Evidence**
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/tabs/main.js:53-54,70-71,82-101` — defines `button()`, `panelButton()`, `6px` status dots, and the `#tab-scroll` flex row.
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:203-204` — uses `bg(t.blocked + "26").text_size(10.5).font_semibold().text_color(t.blocked)` for `Needs you` badges.
  - `[Tier 1 | Doc | 2026-11-03]` `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/files-changes-final.md:13` — specifies one `⤢`/`⤡` button in the top bar beside the panel buttons while the panel is open.

- **(4) Pitfalls and what removes each**
  - **Pitfall**: Looking at a `done` agent in the terminal turns its live `a.status` from `"done"` to `"idle"` immediately (`agents-by-tab/main.js:117-124`), which could make the `Needs you` count badge drop by 1 while the user is still typing a draft reply.
  - **Removal**: Include active non-empty drafts (`shared("needs-you.drafts")`) in the count and keep the currently focused `done->idle` agent held until focus leaves (`agents-by-tab/main.js:119-129`, `INTAKE.md` `## Round 2` 1a).

- **(5) Unasked question**
  - *When the right panel is open at side size (`368px`) and the user clicks a **different** panel button in the top bar (e.g. switching from `Tasks` at `368px` to `Files`), should it stay at `368px` or jump back to full width?*
  - **Answer**: Keep the current width (`368px` stays `368px`, full stays full) when switching between open views in `panel-body`, and start full width only when opening `panel` from closed (`panel.hidden === true`, matching `files-changes-final.md:13-14`: *"Every new opening starts full"*).

---

## 4. Status colors (`theme()` tokens for red, stage pills, tags, alerts, and missing tokens)

- **(1) Pick with reason and cost**
  - **Pick**:
    1. **Tokens that `theme()` lacks (`/home/ivan/.config/herdr-app/herdr.d.ts:260-265`)**:
       - `theme()` has **no `error`/`danger`, `warning`, `success`, or `info` named tokens** (shipped `/home/ivan/.config/herdr-app/mods/toast/main.js:9` maps `{ error: "blocked", warning: "working", success: "done", info: "accent" }`).
       - `theme()` has **no pre-alpha badge surface tokens**; all shipped mods append 2-digit hex alpha to `#rrggbb` theme tokens (`t.blocked + "26"` in `agents-by-tab/main.js:203-204`, `t.blocked + "14"` and `t.blocked + "40"` in `machine-add/main.js:132-134`, `t.ansi2 + "18"` and `t.ansi1 + "18"` in `changes/main.js:170`).
       - Additionally, `/home/ivan/Work/infra/herdr-setup/omarchy/apply-herdr-app-theme:37-53` currently writes `canvas`, `chrome`, `surface`, `popover`, `raised`, `hover`, `selected`, `border`, `input`, `muted`, `dim`, `accent`, `accent_foreground`, `solid`, `solid_foreground` into `themes/omarchy.json`, omitting `blocked`, `working`, `done`, `idle` from `colors` (leaving Herdr to derive them). Adding explicit mappings in `apply-herdr-app-theme` (`blocked: $(color red)`, `working: $(color yellow)`, `done: $(color green)`, `idle: $(color muted)`) guarantees that `t.blocked` is always the Omarchy theme's exact `red` (`#D47C61`), `t.working` is `yellow` (`#D6AE64`), and `t.done` is `green` (`#A3B18A`).
    2. **Exact `theme()` token mapping across `Tasks` and `Needs you`**:
       - **Red (real blocks only — `tasks-panel-final.md:9`: `failed`, prompt delivery error, `Missing:` key, `deploy failed`, unreadable repo, seat `blocked` on a prompt)**:
         - Pill / tag: `bg(t.blocked + "26")`, `text_color(t.blocked)`, `font_semibold()` (exact match to `agents-by-tab/main.js:203-204` and `pane/main.js:67`).
         - Top alert banner / error card: `bg(t.blocked + "14")`, `border_1().border_color(t.blocked + "40")`, `text_color(t.blocked)` (exact match to `machine-add/main.js:132-134`).
       - **Amber / non-red warnings (`tasks-panel-final.md:9`: slow merge episode, vanish-pin notice, merge queue contention)**:
         - Text/icon: `t.ansi3` (ANSI yellow/amber, `#D6AE64` in `omarchy.json:10`), pill/banner `bg(t.ansi3 + "1f")`, `border_color(t.ansi3 + "40")`.
       - **Stage pills on `Tasks` leaf rows (`tasks-panel-final.md:8-10`)**:
         - **Active / in-progress stages (`plan`, `plan-merge`, `plan-rebuttal`, `implement`, `check`, `fix`)**: Quiet surface pill `bg(t.raised).border_1().border_color(t.border).text_color(t.foreground)`, paired with the native spinning arc `svg("mods/workspace-chrome/spinner.svg").size(12).text_color(t.working).spin(900)` when a seat is actively `busy` (matching `agents-by-tab/main.js:202` and `tabs/main.js:70`). Keeping normal stage pills neutral prevents 10+ active rows from turning into rainbow confetti and reserves strong color for agent logos and real `t.blocked` blocks.
         - **Landable / review stages (`reviewing`, `ready`)**: Positive sage/green pill `bg(t.ansi2 + "22").text_color(t.ansi2)` (matching `machine-add/main.js:242` and `spaces/main.js:255`).
         - **Failed stage (`failed`)**: Red block pill `bg(t.blocked + "26").text_color(t.blocked)`.
       - **Neutral tags & times (`tasks-panel-final.md:9-10`)**:
         - `stopped` tag, `paused` repo badge, `attempt N`, `fix N/3`, `land: ...`: `bg(t.raised).border_1().border_color(t.border).text_color(t.muted)`.
         - `blocked-by: <slug>` (waiting on another leaf): `bg(t.raised).text_color(t.dim)` (unless the target is `missing`, which is a red `Missing:` block in `t.blocked`).
         - `parked` rows: row text in `t.dim`, tag `bg(t.chrome).text_color(t.dim)`.
         - `TIME` / `age` / `total time`: plain uncolored text in `t.dim` (`text_size(11).text_color(t.dim)`, matching `agents-by-tab/main.js:353`).
       - **`Needs you` cards & buttons**:
         - `blocked` badge: `bg(t.blocked + "26").text_color(t.blocked)`.
         - `done` badge: `bg(t.done + "26").text_color(t.done)`.
         - Option chips: `bg(t.raised).border_1().border_color(t.border).text_color(t.foreground)` (selected: `bg(t.selected).border_color(t.accent)`), `(recommended)` label in `t.accent`.
         - Primary `Send` button: `bg(t.solid).text_color(t.solid_foreground)` (`changes/main.js:204`, `confirm/main.js:49`).
  - **Reason**: Uses 100% live `theme()` tokens (zero hardcoded hex colors), matches Herdr's shipped token conventions (`t.blocked + "26"`, `t.blocked + "14"`, `t.ansi2`, `t.ansi3`, `t.working`, `t.done`, `t.solid`), and ensures `INTAKE.md` (`### Round 3b` 2a: *"Red marks real blocks only"*) is visually unmistakable.
  - **Cost**: `4` lines added to `/home/ivan/Work/infra/herdr-setup/omarchy/apply-herdr-app-theme:52` so `blocked`, `working`, `done`, `idle` are explicitly bound to Omarchy's `red`, `yellow`, `green`, `muted` on every theme switch.

- **(2) Rejected options with reasons**
  - **Color each workflow phase (`plan`, `implement`, `check`, `fix`) with a different bright ANSI color (`ansi4`, `ansi5`, `ansi6`, `ansi3`)**: Rejected; clashes with full-color agent logos (`claude`, `codex`, `antigravity`) and dilutes the visual pop of `t.blocked` red alerts.
  - **Hardcode hex colors (`#ef4444`, `#f59e0b`, `#22c55e`) in mods**: Rejected; violates `/home/ivan/.config/herdr-app/AGENTS.md` (`### A mod`: *"Use `theme()` colors so the mod follows the user's theme"*) and `INTAKE.md` (`## Source: operator 2026-11-03` message 2: *"the underlying theme has to stay the same"*).

- **(3) Evidence**
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/herdr.d.ts:260-265` — enumerates every token returned by `theme()`.
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/Work/infra/herdr-setup/omarchy/apply-herdr-app-theme:31-54` & `/home/ivan/.config/herdr-app/themes/omarchy.json:24-40` — shows which `colors` keys the Omarchy hook currently populates.
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:200-208`, `/home/ivan/.config/herdr-app/mods/machine-add/main.js:132-134,242`, `/home/ivan/.config/herdr-app/mods/toast/main.js:9`, `/home/ivan/.config/herdr-app/mods/changes/main.js:170,190,204` — establishes how shipped and operator mods use `t.blocked`, `t.working`, `t.done`, `t.ansi1..3`, and `t.solid`.

- **(4) Pitfalls and what removes each**
  - **Pitfall**: Appending `"26"` or `"14"` alpha to a color fails if a theme ever supplies an 8-digit `#rrggbbaa` string instead of 6-digit `#rrggbb`.
  - **Removal**: Use a 1-line helper `const alpha = (hex, a) => (hex ?? "").slice(0, 7) + a;` (`AGENTS.md:311` guarantees theme colors are `#rrggbb`, and `.slice(0, 7)` makes it defensive).

- **(5) Unasked question**
  - *Does `omarchy/apply-herdr-app-theme` currently set `blocked`, `working`, `done`, and `idle` in `themes/omarchy.json`?*
  - **Answer**: No (`/home/ivan/Work/infra/herdr-setup/omarchy/apply-herdr-app-theme:37-53` omits them). Adding `blocked: $(color red)`, `working: $(color yellow)`, `done: $(color green)`, and `idle: $(color muted)` to `apply-herdr-app-theme` ensures those four status tokens always use Omarchy's exact palette (`~/.local/state/omarchy/current/theme/colors.toml:6,18-21`).

---

## Probes that must run before building

- **P-Look-1 (`knownAgents()` logo resolution in `Tasks`)**: Verify in a live session that `await knownAgents()` returns entries matching `"claude"`, `"codex"`, `"pi"`, and `"agy"` (`p.key === h || p.run?.[0] === h`) with `p.icon` and `p.tint` matching `agents-by-tab`.
- **P-Look-2 (Shot check at full width, `368px` side size, and `< 720px` narrow window)**: Capture `herdr-app shot` in all three widths verifying: (a) zero double borders or corner bleed on `Tasks`, `Needs you`, `Files`, `Changes`; (b) top-bar labels collapse cleanly to icons with tooltips when narrow; and (c) `t.blocked` red alerts, `t.ansi3` slow-merge amber, and `t.ansi2` ready pills follow `apply-herdr-app-theme`.
