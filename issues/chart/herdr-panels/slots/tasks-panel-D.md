# Fork Notes: Tasks Panel (A4) — Seat D

## 1. What does one row show, and how are rows grouped (by repo, by phase, by attention)? Include where paused, stopped, blocked-by, missing keys, deploy failed, broadcast pending and the merge queue appear.

### (1) Pick, reason, and cost
- **Pick**: **Group by repo (with a top Alerts banner for global/repo blockers and an optional `[By repo | Attention]` header toggle), folding idle (`0 open leaves`) repos into one summary line.**
  - **1. Top Alerts Banner (hidden when empty)**:
    - **`deploy failed`** (`/home/ivan/Work/infra/akrogon/src/status.ts:522-527`): Red (`t.error`) callout card at the very top showing `attempted` SHA, `active` SHA, `step`, and `error`.
    - **`unreadable` repo / leaf errors** (`src/status.ts:516-521`): Red (`t.error`) alert row per unreadable `config.yaml` or `state.yaml`.
    - **`Missing:` readiness gaps** (`src/status.ts:534-542`): Amber/red (`t.blocked`/`t.ansi1`) alert card (`<repo>/<slug>: <kind> <name> in <holder> — <steps>`), plus a `Missing` pill on the leaf row itself.
    - **`Slow merge:` episode** (`src/status.ts:546-559`): Amber (`t.ansi3`) banner (`<repo>: last Xm vs normal Ym, since <first.leaf>`).
    - **`Unpacked:` reminders** (`src/status.ts:545`): Collapsible muted banner (`N unpacked folders`, click to list exact `akrogon pack ...` / `akrogon next ...` commands).
  - **2. Per-Repo Sections**:
    - *Repo header*: Repo name (`t.foreground`, bold) + **`paused` pill** (`t.blocked` fill when in `readPaused()`, `src/status.ts:563`) + **`slow merge` pill** (when active on this repo) + open leaf count.
    - *Epic/owner subheader*: Shown when leaves sit under an epic folder (`issues/open/<epic>/<slug>`, `src/status.ts:227-234`).
    - *What one leaf row shows (2 compact lines inside a 368px panel)*:
      - **Line 1 (Primary)**: Active seat **Program icon(s)** (resolved from `seats.a`/`seats.b` kind `claude`/`codex`/`pi`/`agy` via `Program.icon`, dimmed when idle, spinning ring when `busy_since` is set) + **`slug`** (`t.foreground`, truncate) + **`phase` pill** (theme-colored matching `src/status.ts:260-266`: `plan` `t.ansi4`, `implement` `t.ansi3`, `check` `t.ansi5`, `merge` `t.ansi2`, `failed` `t.ansi1`, `parked` `t.dim`) + **merge-queue `turn` badge** (`holder` in `t.ansi2` or `#2`, `#3` in `t.muted`, plus `no merge record` warning from `src/status.ts:208-211`) + right-aligned **time** (`clock(elapsed)`, colored `t.error`/`t.ansi1` when `slow.flagged`).
      - **Line 2 (Status & note pills, rendered only when non-empty)**:
        - **`stopped`** pill (`t.ansi1`, `src/status.ts:217`)
        - **`failed <cause>: <reason>`** pill (`t.error`, `src/status.ts:163-165`)
        - **`<seat> prompt <code>`** delivery-error pill (`t.error`, `src/status.ts:158-161`)
        - **`broadcast pending`** pill (`t.ansi3`, `src/status.ts:171`)
        - **`land` / `land dead`** pill (`src/status.ts:170,487-490`)
        - **`blocked by <slugs>`** pill (`t.dim`, `src/status.ts:216`)
        - Compact progress note (`busy A 12m · done A · verdict A:pass · A:1 B:1 · fix 1 · seats ISSUE.md` from `src/status.ts:144-184`, plus `Kept:` badge if `readKept` has entries for the repo/leaf).
    - *Parked issues* (`src/status.ts:572`): Collapsed `"Parked (N)"` row at the bottom of the repo block.
  - **3. Merge Queue, Check Admission Line (`run line`), and Last Merges Footer**:
    - **Merge queue & `run line`** (`src/status.ts:95,578-582`): When any leaf is in `mergeQueue` or `lineRuns()` has `waiting`/`running` check admissions, render a compact queue block showing `holder` $\rightarrow$ `#2` $\rightarrow$ `#3` and `run line` (`repo`, `leaf`, `check`, `running` vs `waiting N`, `age`).
    - **Last merges** (`INTAKE.md` `## Agent findings` A4): Collapsible bottom section showing the last 5 `to === "merged"` transitions across repos (`repo/slug`, age, total time).
- **Reason**: Preserves 100% of `akrogon status`'s information hierarchy (`src/status.ts:516-583`) while folding empty `"no open leaves"` repos so active leaves, alerts, and queues fit in a single screen without scrolling past 10 empty repos.
- **Cost**: A two-line card per active leaf is ~48px tall vs 28px for a single-line row, so ~8–10 active leaves fit above the fold before scrolling.

### (2) Rejected options
- **Group only by phase across all repos**: Rejected because `paused`, `slow merge`, `mergeQueue` (`holder` vs `#2`), and epic subfolders (`issues/open/<epic>/<slug>`) are all scoped per repo (`/home/ivan/Work/infra/akrogon/src/status.ts:95,227,546,563`).
- **Group only by attention**: Rejected as the sole view because dependent leaves (`blocked-by`) and epic siblings in the same repo get separated; offering `[By repo | Attention]` with `By repo` as default gives both.
- **Show all 11 repos expanded when empty**: Rejected because today (`(cd / && akrogon status)`), 11 repos print `no open leaves`, which would push `Unpacked:`, `Slow merge:`, and `Last merges` off the bottom of a 368px panel.

### (3) Evidence
- `operator`: `INTAKE.md` (`## Agent findings` A4, `## Round 1` Q2) — Tasks shows everything `akrogon status` shows (`paused`, `stopped`, `blocked-by`, `Missing:`, `deploy failed`, `broadcast pending`, `slow merge`, `merge queue`), plus last merges, so the operator never needs to run the CLI command (2026-11-03).
- `better-than-training`: `/home/ivan/Work/infra/akrogon/src/status.ts:144-245,352-368,392-427,470-583` — defines exact fields and conditions for `note()`, `cells()`, `rows()`, `lineRows()`, `unpackedLines()`, `deploy failed`, `Missing:`, `Slow merge:`, and single-leaf `status <slug>` details (2026-11-03).

### (4) Pitfalls and what removes each
- **10 idle repos filling the panel with `"no open leaves"`**: Removed by the option choice to collapse repos with 0 open leaves, 0 parked issues, and 0 alerts into a single expandable `"N repos idle"` footer line (except the current space's repo; see Question 5).
- **Truncating `Missing:` steps or `deploy failed` error text in a 368px panel**: Removed by a done-criterion wrapping alert text inside the top Alerts banner and expanding full leaf details on row click.

### (5) Unasked question
- Should `Unpacked:` lines (`run akrogon pack ...`, `src/status.ts:392-427`—currently 8 lines across repos on this machine) have a one-click `[Pack]` button in the panel, or stay read-only text?

---

## 2. When should a job be marked as taking too long, and who computes it (akrogon in `--json`, or the panel)?

### (1) Pick, reason, and cost
- **Pick**: **Computed entirely by `akrogon status --json` (the panel only reads `leaf.slow` and `repo.slow_merge`), flagging a job when any of akrogon's three timing bounds is exceeded:**
  1. **Seat stall (`> 60m`)**: Any active seat `s` with `now - Date.parse(state.busy_since[s]) > 60 * 60_000` (`STALL_MS` in `/home/ivan/Work/infra/akrogon/src/next.ts:220,247`).
  2. **Leaf total active time (`> 45m`)**: Leaf active elapsed time (`now - start` from `starts(timings)` at `/home/ivan/Work/infra/akrogon/src/status.ts:134-142`) exceeds `45 * 60_000` (`F_LIMIT_MS` in `/home/ivan/Work/infra/akrogon/src/timing-report.ts:17`).
  3. **Phase visit past repo median (`decideSlow` formula)**: For the leaf's current `phase`, take the last 20 completed visits of that phase in that repo (`visitsOf` in `/home/ivan/Work/infra/akrogon/src/timing-report.ts:14,53-76`). When $\ge 5$ completed visits exist (`/home/ivan/Work/infra/akrogon/src/verify.ts:383-385`), let `normal_ms = median(durations)` and flag when `phase_elapsed_ms > 1.5 * normal_ms && phase_elapsed_ms - normal_ms >= 120_000` (`/home/ivan/Work/infra/akrogon/src/verify.ts:387`). When $< 5$ historical visits exist for that phase in the repo, `normal_ms` is `null` and only rules (1) and (2) apply.
  4. **Repo-level `slow_merge`**: Directly from `scan.slow?.slow` (`issues/verify-runs.jsonl`, `/home/ivan/Work/infra/akrogon/src/status.ts:98,546-559`).
- **Reason**:
  - Computing slowness inside `src/status.ts` avoids shipping multi-megabyte `timings.jsonl` histories over `--json` and keeps all threshold logic in TypeScript where `akrogon`'s tests verify it.
  - Using akrogon's own constants (`STALL_MS = 60m`, `F_LIMIT_MS = 45m`, and `decideSlow`'s `20`-visit median with `> 1.5× && +2m` at $\ge 5$ runs) means zero arbitrary hand-tuned per-phase numbers.
- **Cost**: `scanRepo` in `src/status.ts:68-109` already reads `log` and `timings` into memory (`lines 94,96`), so computing per-phase median over `timings` in `status.ts` adds $<2\text{ ms}$ of CPU and ~15 lines of TypeScript.

### (2) Rejected options
- **Panel computes slowness in JS**: Rejected because the panel would need raw historical `timings.jsonl` / `log.jsonl` records in `--json` and would duplicate `src/timing-report.ts` and `src/verify.ts` logic.
- **Only repo-level `slow_merge` from `verify-runs.jsonl`**: Rejected for leaf rows because `decideSlow` in `/home/ivan/Work/infra/akrogon/src/verify.ts:369-387` only runs after a `verify` command finishes, never flagging a live leaf stuck in `plan`, `implement`, or `check`.
- **Hardcoded operator-chosen per-phase minute thresholds**: Rejected because repo complexity varies and akrogon already defines statistical cohort medians (`src/verify.ts:383-387`, `src/timing-report.ts:14-17`).

### (3) Evidence
- `better-than-training`: `/home/ivan/Work/infra/akrogon/src/next.ts:220,246-254` (`STALL_MS = 60 * 60 * 1000`), `/home/ivan/Work/infra/akrogon/src/timing-report.ts:14-17,53-76` (`COHORT_SIZE = 20`, `F_MEDIAN_MAX_MS = 35m`, `F_LIMIT_MS = 45m`, `visitsOf`), and `/home/ivan/Work/infra/akrogon/src/verify.ts:383-387` (`eligible.slice(-20)`, `eligible.length >= 5`, `ms > 1.5 * normal && ms - normal >= 120000`) (2026-11-03).

### (4) Pitfalls and what removes each
- **Wall-clock time counting hours while a repo was `paused` or a leaf was `parked` / waiting on `blocked-by`**: Removed by an option choice in `status.ts`: compute `active_elapsed_ms` subtracting `waitTotals` (`repo_pause`, `parked`, `prerequisite`, `merge_turn` via `/home/ivan/Work/infra/akrogon/src/timing-report.ts:91-125`) so a leaf that waited 40m on a prerequisite is not falsely marked red 5m into `plan`.

### (5) Unasked question
- Should the leaf row display wall-clock elapsed time since first prompt (as `akrogon status` `TIME` does today at `src/status.ts:134-142,205`), or both `phase_elapsed` and `total_elapsed` (`12m / 28m`)?

---

## 3. What does clicking a row do today (seats still in old herdr) and after akrogon's herdr-app port?

### (1) Pick, reason, and cost
- **Pick**: **One unified click handler with three fallbacks that works both today and after the `herdr-app` port:**
  1. **If a matching terminal/pane exists in the current `herdr-app` session, jump to it (`pane.focus` or `terminal.peek`)**:
     - Match `terminals()` / `panes()` (`/home/ivan/.config/herdr-app/herdr.d.ts:202,212`) by:
       - (a) Post-port identity labels or tab name (`t.labels?.["herdr.tab"] === leaf.slug` or `t.labels?.["akrogon.slug"] === leaf.slug` per `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md` `## How I picture it`, or a tab in `spaces()` with `tab.name === leaf.slug`), preferring the busy/active seat's pane; OR
       - (b) Exact worktree `cwd` match (`p.cwd === leaf.worktree || p.cwd?.startsWith(leaf.worktree + "/")` when `leaf.worktree` is set).
     - When a model `pane` matches, call `run("pane.focus", { pane: match.pane })`. When a headless `hc` terminal matches (`!match.pane`), call `run("terminal.peek", { terminal: match.address })`.
  2. **Regardless of whether a live terminal matched, toggle the row's inline `status <slug>` detail drawer AND offer one-click worktree inspection (`[Changes] [Files] [plan.md]`)**:
     - Today (while leaf seats run in old `herdr`, or post-port when the leaf runs in another `herdrapp --session`), no live terminal in the current window matches, **but `leaf.worktree` (`/home/ivan/.akrogon/worktrees/<repo>/<slug>`) and `leaf.plan_path` (`<leaf.path>/plan.md`) exist on disk!**
     - Clicking the row expands its inline detail drawer (`akrogon status <slug>` history, `seats`, `Kept:`, and old-herdr `tab`/`pane` badge e.g. `old herdr: w8:t18`), and provides `[View Changes]`, `[View Files]`, and `[Read plan.md]` buttons that set the shared A3 worktree path (`setShared("workspace.worktree", leaf.worktree)`) and switch `panel-body` to `changes` or `files` (or split `plan.md` as a markdown preview pane).
- **Reason**: Makes clicking a leaf row immediately useful today (inspecting the leaf's worktree diff, files, `plan.md`, and `status <slug>` history inside `herdr-app`) and seamlessly switches to focusing the live `herdr-app` tab/pane once the port lands—without dead clicks or fuzzy guessing.
- **Cost**: Requires `akrogon status --json` to include `worktree`, `leaf_path`, `plan_path`, `tab`, `pane`, and `history` (last 10 `log.jsonl` lines) per open leaf so expanding a row needs no second `exec("akrogon", ["status", slug])` call.

### (2) Rejected options
- **Do nothing on click until the `herdr-app` port lands**: Rejected because every open leaf already has a real git worktree on disk (`state.worktree` at `/home/ivan/Work/infra/akrogon/src/state.ts:96`) and `plan.md` (`src/status.ts:498`) that the operator can inspect in `Changes`/`Files` today.
- **Fuzzy-match tabs by substring**: Rejected because substring matching can jump to the wrong tab when slugs share prefixes.

### (3) Evidence
- `better-than-training`: `/home/ivan/Work/infra/akrogon/src/state.ts:95-99` (`tab`, `worktree`, `pane`), `/home/ivan/Work/infra/akrogon/src/status.ts:470-508` (`status <slug>` output: `log.slice(-10)`, `plan.md`, `seats`, `Kept:`), and `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md` (`## How I picture it`: `herdr.space` and `herdr.tab` labels) (2026-11-03).
- `better-than-training`: `/home/ivan/.config/herdr-app/herdr.d.ts:56-61,188,202,212` (`pane.focus`, `terminal.peek`, `panes()`, `terminals()`) (2026-11-03).

### (4) Pitfalls and what removes each
- **Cross-session leaf rows appearing broken when clicked because a `herdr-app` window only sees its own session's terminals (`INTAKE.md` `## Round 1`)**: Removed by showing a clear badge when no terminal in the current session matches and opening the inline detail + `[View Changes]` / `[View Files]` worktree actions instead of silently failing.

### (5) Unasked question
- When a leaf is in `implement` or `check` with both seat `A` and seat `B` panes present in the leaf's tab after the port, should clicking the row focus the leaf's tab (leaving pane focus on whichever seat is currently `working`/`blocked`), or have separate `[A]` and `[B]` seat chips on the row?

---

## 4. Is Tasks the panel that shows by default, and what does that mean given the shipped `tabs` mod remembers a panel per space (`/home/ivan/.config/herdr-app/mods/tabs/main.js`) and the operator wants existing interfaces unchanged?

### (1) Pick, reason, and cost
- **Pick**: **`Tasks` is the first tab in `panel-body` (`"active": "tasks"` in `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:145`) and the first top-right panel button (`[Tasks] [Needs you] [Files] [Changes]`), while `panel` remains `"hidden": true` for spaces where no panel was opened, and `tabs`'s per-space `localStorage` memory (`syncPanel`) is preserved unchanged.**
  - *Concretely what happens*:
    1. Clone shipped `/home/ivan/.config/herdr-app/mods/tabs` into `/home/ivan/Work/infra/herdr-setup/mods/tabs`.
    2. In `mods/tabs/main.js:80,97-98`, change the default `enabled` fallback from `["files", "changes"]` to `["tasks", "needs-you", "files", "changes"]` (and update `shared.json` `"workspace.panels"` in `herdr-setup/install` and `bin/herdrapp:119`), adding the `Tasks` and `Needs you` buttons beside `Files` and `Changes`.
    3. Keep `syncPanel` (`mods/tabs/main.js:20-46`) untouched: each space remembers in `localStorage.getItem("panels")` which right-hand panel (`"tasks"`, `"needs-you"`, `"files"`, `"changes"`, or `null` for closed) the operator last left open in that space.
    4. In `layouts/flat.json:130-154`, place `tasks` and `needs-you` before `files` and `changes` in `panel-body` with `"active": "tasks"`, keeping `"hidden": true` on `panel` (`flat.json:153`) so spaces where the operator hasn't opened the right panel keep 100% terminal width.
- **Reason**:
  - Directly honors the operator's Round 2 rule (`INTAKE.md` `## Round 2`: *"I like the way the terminal area is done here. I don't want to change that main part. I want it all to be under the new pane like what Files and Changes are today"* and *"I don't want to be complicating the existing interfaces. I like what they are today"*).
  - Keeping `syncPanel` intact means `Tasks` and `Needs you` behave *identically* to `Files` and `Changes` today: one click in the top-right bar opens `Tasks` (and remembers `Tasks` for that space); clicking `Tasks` again closes the panel.
- **Cost**: Requires cloning `tabs` into `herdr-setup/mods/tabs` and updating `workspace.panels` in existing sessions' `shared.json` (`~/.config/herdr-app/shared.json` and `~/.config/herdr-app-sessions/*/shared.json`) because existing sessions already persisted `"workspace.panels": ["files", "changes"]`.

### (2) Rejected options
- **Force `panel` (`"hidden": false`) open on `tasks` in every space by default, overriding `tabs/main.js` `syncPanel`**: Rejected because it steals 368px from the terminal area in every space (including non-akrogon spaces) and breaks `tabs/main.js:20-36`'s per-space panel memory, violating *"I don't want to be complicating the existing interfaces"*.
- **Do not clone `tabs` (rely only on prefix keys)**: Rejected because `/home/ivan/.config/herdr-app/mods/tabs/main.js:29-34,97-98` hardcodes only `files` and `changes` buttons and actively calls `run("layout.hide", { id: "panel" })` on space switch if the active panel is not in `enabled`.

### (3) Evidence
- `operator`: `INTAKE.md` (`## Round 2` Q5) — *"I want it all to be under the new pane like what Files and Changes are today"* and *"New features live only in the right-hand panel, reached by buttons beside Files and Changes."* (2026-11-03).
- `better-than-training`: `/home/ivan/.config/herdr-app/mods/tabs/main.js:17-46,80-98` and `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:130-154` — `enabled = shared("workspace.panels") ?? ["files", "changes"]`; `syncPanel` hides `panel` if `stored` is not in `enabled` (2026-11-03).

### (4) Pitfalls and what removes each
- **Existing sessions (`default`, `infra`, `personal`, `mdconsultingny`) already have `"workspace.panels": ["files", "changes"]` written in their `shared.json`, so `enabled` in `tabs/main.js:80` ignores the `??` fallback and hides the `Tasks` and `Needs you` buttons**: Removed by an install step + done-criterion in `herdr-setup/install` (and `akrogon`'s mod installer) that updates `"workspace.panels"` in `~/.config/herdr-app/shared.json` and `~/.config/herdr-app-sessions/*/shared.json` to include `"tasks"` and `"needs-you"`.
- **`layouts/.state/flat.json` caching old `panel-body` state across sessions**: Removed by a done-criterion testing button clicks and space switches in `infra` after reloading the layout (`layout.switch` board then flat, per `INTAKE.md` `## Round 1`).

### (5) Unasked question
- For a brand-new space (`!(space.id in this.panels)`), should the right panel start closed (as `Files`/`Changes` do today in `tabs/main.js:29`), or start open on `Tasks`?

---

## 5. Which repos does it show (all registered, or the current space's repo first), and what must the `--json` output contain for all of the above (field list)?

### (1) Pick, reason, and cost
- **Pick**:
  - **Which repos and order**: Show **all registered repos** from `~/.akrogon/config.yaml`, ordered as:
    1. **Current space's repo first** (matched when `focused()?.cwd` or active `space.folder` is inside `repo.root`), always shown expanded at the top even if it has `0` open leaves.
    2. **Active registered repos** (any repo with open leaves, `paused`, `slow_merge`, `unreadable`, `missing`, `failed`, or `unpacked`), sorted alphabetically.
    3. **Idle registered repos** (`0` open leaves, `0` parked, `0` alerts), collapsed into one muted expandable footer row (`"N repos idle"`).
  - **Crucial fix required in `/home/ivan/Work/infra/akrogon/src/status.ts:511-515` for `--json`**:
    - Today, `statusCommand` runs `const current = await currentRepo(global, process.cwd())` and filters `global.repos` to `current === null || name === current.name` (`src/status.ts:511-513`). When `akrogon status` runs inside `/home/ivan/Work/infra/akrogon`, it omits all other 10 registered repos!
    - `akrogon status --json` (when called without a `<slug>` argument) **must scan all `global.repos` regardless of `process.cwd()`** (while setting `current_repo: current?.name ?? null`), or accept `--all`. Scanning all 11 repos takes `348 ms` (measured 2026-11-03).
  - **Exact `akrogon status --json` field list**:
    ```ts
    interface StatusJson {
      generated_at: string;              // ISO timestamp
      current_repo: string | null;       // repo matching process.cwd(), if any
      watch_dirs: string[];              // [globalHome(), ...each repo's "<root>/issues"] for watchFolder()
      deploy_failed: {                   // non-null when deploy !== null && !deploy.ok (src/status.ts:522-527)
        attempted: string;
        active: string | null;
        step: string | null;
        error: string | null;
      } | null;
      host_kept: { path: string; reason: string }[]; // readHostKept() (src/status.ts:493)
      run_line: {                        // lineRuns() (src/status.ts:352-368, 578-582)
        repo: string;
        leaf: string;
        check: string;
        state: "running" | "waiting" | "ended";
        wait_place: number | null;       // 1, 2, ... when state === "waiting"
        since: string;
        age_ms: number;
        run: string;
      }[];
      repos: ({
        name: string;
        root: string;
        ok: false;
        error_path: string;
        error: string;
      } | {
        name: string;
        root: string;
        ok: true;
        paused: boolean;                 // paused.has(name) (src/status.ts:563)
        parked: string[];                // issues/parked/* (src/status.ts:103, 572)
        unpacked: { path: string; command: string }[]; // unpackedLines() (src/status.ts:392-427)
        failures: { path: string; error: string }[];   // unreadable/foreign/unknown state.yaml (src/status.ts:82-92)
        kept: { path: string; reason: string }[];      // readKept(repo) (src/status.ts:492)
        slow_merge: {                    // scan.slow?.slow when open (src/status.ts:98, 546-559)
          first_leaf: string;
          first_run: string;
          last_ms: number;
          normal_ms: number;
        } | null;
        leaves: {
          slug: string;
          group: string[];               // epic path segments under issues/open (src/status.ts:227)
          leaf_path: string;             // absolute path to leaf dir
          plan_path: string;             // resolve(leaf.path, "plan.md") (src/status.ts:498)
          worktree: string | null;       // state.worktree (src/state.ts:96)
          phase: string;                 // plan | implement | check | merge | failed | merged
          created: string;
          started_at: string | null;     // first delivered prompt ts (src/status.ts:134-142)
          elapsed_ms: number | null;     // wall-clock ms (src/status.ts:199-205)
          active_elapsed_ms: number | null; // elapsed minus waitTotals (src/timing-report.ts:91)
          phase_entered_at: string | null;
          phase_elapsed_ms: number | null;
          slow: {
            flagged: boolean;
            reason: "seat_stall" | "leaf_limit" | "phase_median" | null;
            threshold_ms: number | null;
          };
          stopped: boolean;              // stopped.has(`${repo}/${slug}`)
          blocked_by: string[];          // state["blocked-by"]
          broadcast_pending: boolean;    // broadcastPending(state) (src/state.ts:115)
          land: { active: boolean; alive: boolean | null; unit: string | null } | null; // src/status.ts:170, 487-490
          queue: { place: number; holder: boolean; no_record: boolean } | null; // mergeQueue (src/turn.ts:103-131)
          busy_since: { A?: string; B?: string };
          busy_elapsed_ms: { A?: number; B?: number };
          done: ("A" | "B")[];
          attempts: { A: number; B: number };
          fix_rounds: number;
          verdict: { A?: "pass" | "fail"; B?: "pass" | "fail" };
          delivery_error: { A?: { code: string; message: string; pane: string; at: string }; B?: { code: string; message: string; pane: string; at: string } };
          failure: { cause: "blocked" | "attempts"; phase: string; slot: string; reason: string } | null;
          seats: {                       // seats(global, repo, leaf.path) (src/status.ts:80, 499-506)
            A: { kind: string; model?: string; effort?: string; source: string };
            B: { kind: string; model?: string; effort?: string; source: string };
          };
          tab: string | null;            // state.tab (src/state.ts:95)
          pane: { A?: string; B?: string }; // state.pane (src/state.ts:99)
          missing: { kind: string; name: string; holder: string; steps: string }[]; // leafGaps (src/status.ts:59-66)
          note: string;                  // pre-formatted note() string for parity (src/status.ts:144-184)
          history: string[];             // last 10 log.jsonl lines for this slug (src/status.ts:480-482)
        }[];
        recent_merges: {                 // last 5 log.jsonl rows with to === "merged"
          slug: string;
          ts: string;
          elapsed_ms: number | null;
        }[];
      })[];
    }
    ```
- **Reason**: Gives the Tasks panel every field needed to render the board, alerts, merge queue, `run line`, harness icons (`seats.A.kind` / `seats.B.kind`), click-to-jump targets (`worktree`, `slug`, `tab`, `pane`), and inline `status <slug>` expansion in a single `~350 ms` call, plus `watch_dirs` so the mod watches `issues/` and `~/.akrogon` without hardcoding paths.
- **Cost**: `landAlive()` (`src/status.ts:489`) runs `systemctl --user` only for leaves where `phase === "merge" && batch?.owner === "command"` (typically 0 or 1 leaf across the fleet).

### (2) Rejected options
- **Show only the current space's repo**: Rejected because the operator runs `akrogon` across 11 registered repos (`INTAKE.md` `## Agent findings` A4: *"across registered repos"*) and monitors the whole fleet from one window.
- **Alphabetical repo order without pinning the current space's repo first**: Rejected because when the operator is working in `framework` or `lingua-relay`, they shouldn't have to scroll past `akrogon` and `blepsis` to see the current space's repo.

### (3) Evidence
- `better-than-training`: Measured `(cd / && akrogon status)` vs `akrogon status` inside `/home/ivan/Work/infra/akrogon` (`0.348s` for all 11 repos; running inside a repo filters out the other 10 repos because of `/home/ivan/Work/infra/akrogon/src/status.ts:511-515`) (2026-11-03).
- `better-than-training`: `/home/ivan/Work/infra/akrogon/src/pause.ts:20`, `/home/ivan/Work/infra/akrogon/src/stop.ts:18`, `/home/ivan/Work/infra/akrogon/src/state-home.ts:9-18`, and `/home/ivan/Work/infra/akrogon/src/admission.ts:5` — global state files (`paused.yaml`, `stopped.yaml`, `runs/`, `reconcile-host.json`) live in `globalHome()`, so watching `globalHome()` + each `<repo.root>/issues` catches every state transition without polling (2026-11-03).

### (4) Pitfalls and what removes each
- **`akrogon status --json` returning only 1 repo when `herdr-app` invokes `exec("akrogon", ["status", "--json"])` with `cwd` inside a registered repo (`src/status.ts:511-515`)**: Removed by an option choice + done-criterion in `src/status.ts`: when `--json` is passed without a positional `<slug>`, scan all `global.repos` (and record `current_repo` separately).
- **Non-zero exit code (`process.exitCode = 1` at `src/status.ts:583`) when one repo has an unreadable leaf**: Removed by a done-criterion in the Tasks mod: parse `res.stdout` as JSON whenever `res.stdout` is non-empty, even if `res.code === 1`, so one broken repo renders its error card instead of blanking the whole board.

### (5) Unasked question
- Should `akrogon status --charts --json` (or a `charts` array per repo in `akrogon status --json`, from `chartRows` in `/home/ivan/Work/infra/akrogon/src/status.ts:448-464`) also be included so the operator can see open charts (`TAKEN`, `FOG`, `STAGE`, `AGE`) in a collapsible section of the Tasks panel?

---

## Required Probes Before Building

- **No blocking runtime uncertainty remains for A4**: We verified `(cd / && akrogon status)` across all 11 registered repos (`348 ms`, 2026-11-03) and inspected `src/status.ts:1-584`. One integration check belongs in the leaf's done-criteria: verify how `akrogon` installs/links its `tasks` mod into `~/.config/herdr-app/mods/tasks` and existing `~/.config/herdr-app-sessions/*/mods/tasks` (`src/install.ts` / `src/self-update.ts` + `herdrapp session link`) so `herdr-app check ~/.config/herdr-app/mods/tasks` passes.
