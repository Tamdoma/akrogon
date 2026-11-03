# Stage Palette and Needs-You Shortcut (Round 5b) — Blind Notes (Seat D)

## 1. Stage color palette (practitioner grounding, reserved meanings, and cross-theme behavior)

- **(1) Pick with reason and cost**
  - **Pick**: Map each leaf/chart lifecycle stage to the theme's `ansi` and neutral tokens by separating the **four low-saturation forward workflow hues** (`ansi4`, `ansi6`, `ansi5`, `ansi2`) from the **two high-salience alert/rework hues** (`ansi3` amber and `ansi1` red) and **neutral inactive states** (`muted`/`dim`):

    | Stage / State in `akrogon` | Token (`theme()`) | `sage-terra` Hex & HSL | Semantic Role & Why |
    | :--- | :--- | :--- | :--- |
    | **`plan`** (`plan.synthesis`, `plan.positions`, `plan.rebuttal`) & chart **`charting`** | `t.ansi4` (Blue) | `#7F9AA8` (`H:200° S:19% L:58%`) | **Discovery / Blueprint**: Cool slate-blue for specification and design before code is touched (matches `src/status.ts:260`). |
    | **`implement`** | `t.ansi6` (Cyan / Teal) | `#8FB9A8` (`H:156° S:23% L:64%`) | **Active Construction**: Steps forward along the cool spectrum from blue (`200°`) toward green (`82°`) via eucalyptus/teal (`156°`), matching `plan`'s muted saturation (`23%` vs `19%`) without colliding with `ansi3` amber warnings. |
    | **`check.review`** (and `check` default) | `t.ansi5` (Purple / Rose-Magenta) | `#B98E91` (`H:356° S:23% L:64%`) | **Verification / Review Gate**: Matches Linear's `In Review` purple, GitHub Primer's review/done purple, and `src/status.ts:262` (`check: '35'`). |
    | **`check.fix`** & **`check.repair`** (and chart/admission `waiting`, slow merge) | `t.ansi3` (Amber / Yellow) | `#D6AE64` (`H:39° S:58% L:62%`) | **Cautionary Rework / Attention**: A leaf in `check.fix` or `check.repair` failed a verification check or review and is in a bounded fix round (`src/routing.ts:6-7`). Sharing `t.ansi3` amber with slow-merge alerts (`INTAKE.md` `## Round 3`, `## Round 5`) means amber always signals *"attention / rework / slow"*, never normal coding. |
    | **`merge`** (and chart **`handed off`**, admission **`running`**) | `t.ansi2` (Green) | `#A3B18A` (`H:82° S:20% L:62%`) | **Ready / Landing**: Constructive green for verified work landing on `main` (matches `src/status.ts:263`, Primer, ADS, Linear, Pajamas). |
    | **`failed`** (and all real blocks: delivery error, `Missing:`, deploy failed, unreadable repo, `blocked` seat) | `t.ansi1` (Red) | `#D47C61` (`H:14° S:57% L:61%`) | **Real Block / Danger**: Locked by `INTAKE.md` (`### Round 3b`, `## Round 5`). |
    | **`parked`**, **`stopped`**, **`paused`**, historical **`merged`**, chart **`empty`**, admission **`ended`** | `t.muted` / `t.dim` on `t.raised` | `#C9C3AF` (`S:19%`) / `#687061` (`S:7%`) | **Inactive / Archived**: Carries zero chromatic hue so active leaves own the visual hierarchy. |

  - **Why this fits Omarchy's saturation structure (`sage-terra` and across all 24 installed Omarchy themes)**:
    - In `/home/ivan/.config/herdr-app/themes/omarchy.json:6-23` (`/home/ivan/.local/state/omarchy/current/theme/colors.toml:18-33`), the palette is split into **two distinct saturation tiers**:
      1. **Botanical / calm tier (`S: 19%–23%`, `L: 58%–64%`)**: `ansi4` blue (`S: 19%`), `ansi2` green (`S: 20%`), `ansi5` magenta (`S: 23%`), `ansi6` cyan (`S: 23%`), and `muted` (`S: 19%`).
      2. **High-salience alert tier (`S: 57%–58%`, `L: 61%–62%`)**: `ansi1` red (`S: 57%`) and `ansi3` yellow/amber (`S: 58%`)—nearly **3× the saturation** of the calm tier.
    - Putting the four healthy forward stages (`plan`, `implement`, `check.review`, `merge`) in the `19%–23%` saturation quartet (`ansi4`, `ansi6`, `ansi5`, `ansi2`) and reserving the `57%–58%` high-saturation pair (`ansi3`, `ansi1`) for rework/warnings (`check.fix`, `check.repair`, slow merge) and real blocks (`failed`) makes the board calm when healthy and makes real issues pop immediately.
    - Across all 24 installed Omarchy themes (`/usr/share/omarchy/themes/*/colors.toml`), avoiding `ansi3` for normal `implement` also prevents a severe cross-theme hazard: in `/usr/share/omarchy/themes/matte-black/colors.toml:19`, `yellow` (`ansi3`) is `#b91c1c` (**dark red**), which would make normal `implement` leaves look red/failed if `implement` used `ansi3`.
  - **Practitioner grounding (where design systems agree and disagree)**:
    1. **Atlassian Design System (`@atlaskit/lozenge` / Jira Status Categories)** — Worth hearing because Jira pioneered standardized status lozenges across high-density engineering boards. Uses `neutral` (gray) / `discovery` (purple) for early/new work, `information` (**blue**) for `In Progress`, `warning` (**amber**) for transitional/rework states (`Moved`/`Blocked`), `success` (**green**) for `Done`, and `danger` (**red**) for `Failed`.
    2. **GitLab Pajamas (`gl-badge` & CI/CD Pipeline Status)** — Worth hearing because GitLab models automated multi-stage pipelines (`plan/prepare` $\rightarrow$ `build` $\rightarrow$ `verify` $\rightarrow$ `merge`) directly analogous to `akrogon`. Uses **blue/cyan** (`info`) for active running stages, **amber/orange** (`warning`) for retries/warnings, **green** (`success`) for passed/merged, **red** (`danger`) for failed, and **neutral** (`muted`) for canceled/skipped.
    3. **GitHub Primer (`StateLabel` & PR/Actions status tokens)** — Worth hearing as the daily git/PR mental model. Uses **green** (`open.fg`/`success.fg`) for active/passing, **yellow/amber** (`attention.fg`) for pending/attention, **purple** (`done.fg`) for review completion/merged, and **red** (`danger.fg`) for failed/closed.
    4. **Linear (`Workflow States`)** — Worth hearing as the benchmark for dark-mode developer boards. Uses **slate/blue** for unstarted/planned, **amber or blue** for `In Progress`, **purple/indigo** for `In Review`, **green** for `Completed`, and **red/gray** for `Canceled`.
    - **Agreement across all four**: Red (`ansi1`) is exclusively `failed`/`danger`; Green (`ansi2`) is `merge`/`success`; Purple/Magenta (`ansi5`) is the signature `In Review` / verification color; Inactive (`parked`/`stopped`) is neutral gray.
    - **Disagreement & resolution**: Linear and `src/status.ts:261` use yellow (`ansi3`) for `In Progress`/`implement`, whereas Atlassian Jira and GitLab Pajamas use blue/cyan (`ansi4`/`ansi6`) for active work and reserve amber (`ansi3`) for warnings/rework. Because `INTAKE.md` (`## Round 3`, `## Round 5`) locks `ansi3` amber for slow-merge alerts and `sage-terra` gives `ansi3` `58%` alert saturation, Atlassian/GitLab's split (`plan = ansi4` blue, `implement = ansi6` teal/cyan, `check.review = ansi5` purple, `check.fix/repair = ansi3` amber, `merge = ansi2` green) wins.
  - **Cost**: A 10-line stage-to-token lookup table in the `Tasks` mod (`0` runtime overhead).

- **(2) Rejected options with reasons**
  - **Use `src/status.ts:259-266` verbatim (`implement = ansi3` yellow, `check.* = ansi5` magenta)**: Rejected; (a) `ansi3` is locked for slow-merge warnings (`look2-brief.md` `## Context`), so normal `implement` rows would wear the warning color; (b) in `sage-terra`, `ansi3` has `58%` saturation vs `19%–23%` on `plan`/`check`/`merge`, making `implement` visually overpower the board; (c) it fails to distinguish `check.review` from `check.fix`/`check.repair`; and (d) in `/usr/share/omarchy/themes/matte-black/colors.toml:19`, `ansi3` is `#b91c1c` (red).
  - **Use `t.accent` for a single stage while other stages use `ansi`**: Rejected; in `/home/ivan/.config/herdr-app/themes/omarchy.json:9,36`, `t.accent` (`#A3B18A`) is identical to `t.ansi2`, so assigning `t.accent` to `plan` or `implement` would make two different stages share the exact same color.

- **(3) Evidence**
  - `[Tier 1 | Operator/Intake | 2026-11-03]` `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` (`## Round 3`, `### Round 3b`, `## Round 5`) — locks `ansi1` red for real blocks only, `ansi3` amber for slow merge, uncolored time, and requests a researched stage palette matching Omarchy's saturation.
  - `[Tier 1 | Code/Config | 2026-11-03]` `/home/ivan/.config/herdr-app/themes/omarchy.json:2-40` & `/home/ivan/.local/state/omarchy/current/theme/colors.toml:4-33` — `sage-terra` hex values and computed HSL saturations (`ansi2/4/5/6` at `19%–23%` vs `ansi1/3` at `57%–58%`).
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/Work/infra/akrogon/src/routing.ts:2-24` & `/home/ivan/Work/infra/akrogon/src/status.ts:259-279` — defines exact `phaseSchema` values (`plan.synthesis`, `implement`, `check.review`, `check.repair`, `check.fix`, `merge`, `merged`, `failed`) and existing CLI colors.
  - `[Tier 1 | Code/Config | 2026-11-03]` `/usr/share/omarchy/themes/matte-black/colors.toml:18-24` — demonstrates cross-theme `yellow = "#b91c1c"` hazard if `ansi3` is used for normal `implement`.
  - `[Tier 2 | Practitioner | 2026-11-03]` Atlassian Design System, *Lozenge component & status color semantics* (`https://atlassian.design/components/lozenge/`); GitLab Pajamas, *Badge component & status variants* (`https://design.gitlab.com/components/badge/`); GitHub Primer, *StateLabel & status color tokens* (`https://primer.style/product/components/state-label/`); Linear, *Configuring workflows & state types* (`https://linear.app/docs/configuring-workflows`).

- **(4) Pitfalls and what removes each**
  - **Pitfall**: Treating `check.fix` and `check.repair` identically to `check.review` hides when a leaf bounced back from verification into a fix loop.
  - **Removal**: Key the stage color on the full phase string first (`check.fix` and `check.repair` $\rightarrow$ `t.ansi3` amber; `check.review` $\rightarrow$ `t.ansi5` purple), falling back to `phase.split(".")[0]` (`plan` $\rightarrow$ `t.ansi4`).

---

## 2. Pill rendering (fill alpha, border alpha, text color, and computed contrast numbers)

- **(1) Pick with reason and cost**
  - **Pick**:
    - **Anatomy of a colored stage pill (`c` = stage token `t.ansi4`, `t.ansi6`, `t.ansi5`, `t.ansi3`, `t.ansi2`, `t.ansi1`)**:
      - **Geometry**: `h_flex().px(6).h(18).rounded(5).items_center().text_size(10.5).font_medium()` (matching the `h(18).px(6).rounded(5).text_size(10.5)` pill geometry in `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:204`).
      - **Tinted background (`9.4%` alpha = `"18"`)**: `.bg(c.slice(0, 7) + "18")` (matching `/home/ivan/.config/herdr-app/mods/changes/main.js:170` `t.ansi2 + "18"`).
      - **Subtle border (`22%` alpha = `"38"`)**: `.border_1().border_color(c.slice(0, 7) + "38")` (matching the bordered tint pattern in `/home/ivan/.config/herdr-app/mods/machine-add/main.js:132-134`).
      - **Text color**: `.text_color(c)` (or for dark themes when a row is hovered/selected on `t.raised`/`t.selected`, `.text_color(bright)` using the corresponding bright ANSI token `ansi12`/`ansi14`/`ansi13`/`ansi11`/`ansi10`/`ansi9` when `settings().dark !== false`).
      - **Neutral pill (`parked`, `stopped`, `paused`, `merged`)**: `.bg(t.raised).border_1().border_color(t.border).text_color(t.muted)`.
    - **Computed WCAG 2.1 contrast numbers on `sage-terra` (`/home/ivan/.config/herdr-app/themes/omarchy.json`, `background = #1F241E`, `raised = #2A3028`)**:
      | Stage Pill | Base `c` (`ansi1..6`) | Contrast of `c` on `bg(c + "18")` ( passes $\ge 4.5:1$) | Contrast of `c` on `bg(c + "26")` (3 fail $4.5:1$) | Bright `ansi9..14` on `bg(c + "18")` (normal / hovered `raised`) |
      | :--- | :--- | :--- | :--- | :--- |
      | **`plan`** (`ansi4` / `ansi12`) | `#7F9AA8` (`S:19%`) | **`4.63 : 1`** | `4.20 : 1` (fails AA) | **`6.00 : 1`** / **`5.12 : 1`** |
      | **`implement`** (`ansi6` / `ansi14`) | `#8FB9A8` (`S:23%`) | **`6.09 : 1`** | `5.44 : 1` | **`7.34 : 1`** / **`6.25 : 1`** |
      | **`check.review`** (`ansi5` / `ansi13`) | `#B98E91` (`S:23%`) | **`4.78 : 1`** | `4.35 : 1` (fails AA) | **`6.04 : 1`** / **`5.16 : 1`** |
      | **`check.fix`** (`ansi3` / `ansi11`) | `#D6AE64` (`S:58%`) | **`6.34 : 1`** | `5.62 : 1` | **`7.44 : 1`** / **`6.34 : 1`** |
      | **`merge`** (`ansi2` / `ansi10`) | `#A3B18A` (`S:20%`) | **`5.86 : 1`** | `5.22 : 1` | **`7.20 : 1`** / **`6.14 : 1`** |
      | **`failed` / red** (`ansi1` / `ansi9`) | `#D47C61` (`S:57%`) | **`4.54 : 1`** | `4.15 : 1` (fails AA) | **`5.47 : 1`** / **`4.68 : 1`** |
      | **Neutral** (`muted` on `raised`) | `#C9C3AF` on `#2A3028` | **`7.68 : 1`** | — | — |
  - **Reason**:
    1. At `"26"` (`14.9%` fill alpha), `ansi1` (`4.15:1`), `ansi4` (`4.20:1`), and `ansi5` (`4.35:1`) fall **below** WCAG AA (`4.5:1`) because the stronger fill lightens the pill background toward the mid-lightness (`L: 58%–64%`) text.
    2. Lowering the fill alpha to `"18"` (`9.4%`, already used in `changes/main.js:170`) and adding a `"38"` (`22%`) border brings **all six base tokens (`ansi1..6`) above `4.5:1` (`4.54:1` to `6.34:1`)** while keeping the pill's fill whisper-quiet so it matches `sage-terra`'s low-saturation aesthetic (`#1F241E` blended with `9.4%` `#7F9AA8` produces `#28302B`, `S: 9%`).
  - **Cost**: One `stagePill(t, phase)` helper (`~12` LOC).

- **(2) Rejected options with reasons**
  - **Solid opaque fills (`bg(c).text_color(t.background)`)**: Rejected; turns every row into a neon lozenge (`57%–58%` solid blocks on `check.fix`/`failed`), violating Atlassian/GitLab dense-table guidance and overwhelming the 16 px harness logos.
  - **`"26"` (`15%`) or `"33"` (`20%`) fill alpha with no border**: Rejected; drops `ansi1`, `ansi4`, and `ansi5` below `4.5:1` contrast in `sage-terra` and looks muddy in light themes (`catppuccin-latte`, `flexoki-light`, `rose-pine`) where a `1px` `"38"` border defines the pill edge cleanly.
  - **Border-only pill with `bg(t.background)` (`0%` fill)**: Rejected; disappears when a row is hovered (`bg(t.hover)`) or selected (`bg(t.selected)`), whereas a `"18"` translucent tint layers over both `t.background` and `t.hover`.

- **(3) Evidence**
  - `[Tier 1 | Code/Measured | 2026-11-03]` `/home/ivan/.config/herdr-app/themes/omarchy.json:2-40` — WCAG 2.1 relative luminance and alpha-composited contrast ratios computed directly from `omarchy.json` hex values.
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/changes/main.js:170` (`t.ansi2 + "18"`), `/home/ivan/.config/herdr-app/mods/machine-add/main.js:132-134` (`bg(t.blocked + "14").border_color(t.blocked + "40")`), `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:204` (`px(6).h(18).rounded(5).text_size(10.5)`).

- **(4) Pitfalls and what removes each**
  - **Pitfall**: On hovered/expanded rows (`bg(t.raised)` `#2A3028`), base `ansi4` (`3.96:1`) and `ansi1` (`3.89:1`) dip slightly below `4.5:1`.
  - **Removal**: In dark themes (`settings().dark !== false`), using the paired bright token (`ansi12`, `ansi14`, `ansi13`, `ansi11`, `ansi10`, `ansi9`) for the pill's text while keeping the base token (`ansi4`, `ansi6`, `ansi5`, `ansi3`, `ansi2`, `ansi1`) for `bg(c + "18")` and `border_color(c + "38")` keeps contrast at **`4.68:1`–`6.34:1` even on `t.raised`**, while preserving the exact same hue and `19%–29%` saturation family.

---

## 3. Most intuitive free shortcut for opening `Needs you` (and collision audit)

- **(1) Pick with reason and cost**
  - **Pick**: **`ctrl-b y`** (prefix `ctrl-b`, then `y`) in `/home/ivan/Work/infra/herdr-setup/mods/prefix/main.js:28-60`, with toggle behavior identical to `ctrl-b t` (`INTAKE.md` `### Round 3b` item 1a: opens the right panel on `Needs you` in full width; pressed while `Needs you` is showing, closes the panel and restores `main`).
  - **Reason**:
    1. **Why a `ctrl-b` prefix key beats any global `ctrl-*` or `alt-*` key**:
       - Consistent with `ctrl-b t` (`Tasks`, `INTAKE.md` `### Round 3b` item 1a) and `ctrl-b f` (`Files`, `/home/ivan/Work/infra/herdr-setup/mods/prefix/main.js:59`).
       - Zero terminal collision: `ctrl-b` opens the `Prefix` popup (`/home/ivan/Work/infra/herdr-setup/keys.json:61`), which captures the next keystroke (`prefix/main.js:81-86`) so the second key never collides with Claude Code, Codex, Pi, Agy, Neovim, or readline.
    2. **Why `y` ("Needs **Y**ou") is the best free prefix key**:
       - **`n` is taken** (`prefix/main.js:51`: `n: () => run("tab.next")`, and `shift-n` is `space.next` at `line 57`).
       - **`o` is taken** (`prefix/main.js:37`: `o: openNotificationTarget`, which jumps terminal focus directly to the single most urgent agent rather than opening the `Needs you` inbox panel).
       - **Dual mnemonic + spatial pairing with `ctrl-b t`**:
         - **Mnemonic**: `"Needs` **`Y`**`ou"` (the distinguishing word of `"Needs you"`, since `n` is `next tab`).
         - **Physical QWERTY adjacency matches top-bar adjacency**: On a QWERTY keyboard, **`T` and `Y` sit immediately side-by-side (`[T][Y]`)**, matching the exact settled top-bar button order **`[Tasks] [Needs you]`** (`INTAKE.md` `## Round 5` item 3a)! Left finger on `T` opens `Tasks` (`ctrl-b t`); right adjacent key `Y` opens `Needs you` (`ctrl-b y`).
  - **Cost**: `1` line in `/home/ivan/Work/infra/herdr-setup/mods/prefix/main.js:60` calling the shared panel-toggle routine for `"needs-you"`.

- **(2) Rejected options and full collision table**

  | Candidate | Binding Type | Collision / Why Rejected |
  | :--- | :--- | :--- |
  | **`ctrl-b n`** | Prefix | **COLLIDES**: Bound to `run("tab.next")` in `/home/ivan/Work/infra/herdr-setup/mods/prefix/main.js:51` (`shift-n` is `space.next` at `line 57`). |
  | **`ctrl-b o`** | Prefix | **COLLIDES**: Bound to `openNotificationTarget` in `/home/ivan/Work/infra/herdr-setup/mods/prefix/main.js:37` (focuses the most urgent agent terminal directly). |
  | **`ctrl-b u`** | Prefix | Free in `prefix/main.js` (mnemonic: "Needs yo**u**" / "**U**rgent"), one key further right (`[T][Y][U]`); viable runner-up, but `y` ("Needs **Y**ou", directly adjacent to `t`) is a stronger mnemonic and spatial pair. |
  | **`ctrl-b q`** | Prefix | Free in `prefix/main.js` (mnemonic: "**Q**uestions"), but mismatches the visible UI label `"Needs you"` (which also includes finished `done` agents, not only questions) and in standard tmux `ctrl-b q` is `display-panes`. |
  | **`ctrl-b i`** | Prefix | Free in `prefix/main.js` (mnemonic: "**I**nbox"), but the word `"Inbox"` appears nowhere in the UI (`"Needs you"`). |
  | **`ctrl-b !` (`shift-1`)** | Prefix | Free in `prefix/main.js` (`1..9` are bound at `line 52`, not `shift-1`), matches the `!` badge in `agents-by-tab/main.js:203`, but requires releasing `Ctrl` and pressing `Shift+1` (slower 2-modifier chord vs single key `y`). |
  | **`alt-n` / `alt-y` / `alt-u`** | Global (`keys.json`) | **COLLIDES with terminal / readline / TUI**: In bash/zsh/readline and Emacs mode, `alt-y` is `yank-pop`, `alt-u` is `upcase-word`, `alt-n` is `history-search-forward` (and in Neovim/TUIs `Alt+<letter>` bindings are heavily used, cf. `alt-t` colliding with Claude Code's `meta+t` in `INTAKE.md` `### Round 3b` item 1a). |
  | **`ctrl-n` / `ctrl-y` / `ctrl-u`** | Global (`keys.json`) | **COLLIDES with Unix/readline/agents**: `/home/ivan/.config/herdr-app/AGENTS.md` (`## Keys: keys.json`) explicitly warns against binding plain `ctrl+<letter>`; `ctrl-n` is next-line/menu-down, `ctrl-u` is `unix-line-discard` (clear prompt in shells and Claude Code), `ctrl-y` is `yank`. |
  | **`ctrl-shift-y` / `ctrl-shift-u`** | Global (`keys.json`) | **COLLIDES on Linux**: `ctrl-shift-u` is the standard GTK/IBus/Wayland Unicode hex input shortcut on Linux (`Omarchy`), and neither follows the operator's `ctrl-b` prefix workflow (`INTAKE.md` `## Round 3` item 3a). |

- **(3) Evidence**
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/Work/infra/herdr-setup/mods/prefix/main.js:28-60` — complete `ACTIONS` map showing `b, c, d, e, f, g, h, k, n, o, p, r, s, v, w, x, z, ?, 1..9, shift-*` taken and `y, u, q, i, a, j, l, m` free.
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/Work/infra/herdr-setup/keys.json:1-80` — complete `global` and `terminal` keybindings.
  - `[Tier 1 | Doc | 2026-11-03]` `/home/ivan/.config/herdr-app/AGENTS.md` (`## Keys: keys.json`) & `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` (`## Round 3` item 3a, `### Round 3b` item 1a, `## Round 5` item 3a) — documents terminal `ctrl-*`/`alt-*` collisions, `ctrl-b t` toggle behavior, and top-bar order `Tasks, Needs you, Files, Changes`.

- **(4) Pitfalls and what removes each**
  - **Pitfall**: Implementing `ctrl-b t` and `ctrl-b y` inside `prefix/main.js` with raw `run("layout.show", { id: "panel" })` (like `f` on `line 59`) bypasses the full-width / `main`-restore logic settled in Round 4 (`slots/files-changes-final.md` `Panel width`).
  - **Removal**: Have `prefix/main.js` trigger the single open/close routine in the cloned `tabs` mod (`run("tabs.toggle", ...)` or shared command, per `slots/files-changes-final.md` `Panel width`) for `t` (`"tasks"`), `y` (`"needs-you"`), and `f` (`"files"`).
