# Territory Map — Slot E

## 1. Material Forks

### F1: How does `akrogon` receive crash/exit events and startup wakeups after `plugin/herdr-plugin.toml` is retired?
- **Context:** Old Herdr fired `plugin/herdr-plugin.toml:1-27` (`plugin/next.sh:1-3`) on `agent.status_changed`, `pane.process_exited`, `pane.closed` (`HERDR_EVENT`), and `herdr.started` (`akrogon pull --all` + `akrogon next --resume`, `src/next.ts:1604-1792`). Signpost 4a requires an event listener that notices crashes and triggers `watch-issues` automatically.
- **Options:**
  1. **Systemd user daemon (`akrogon-events.service`)** running a long-lived `akrogon listen` (or `herdrapp` watcher) that tails `hc events` (`hc --skill` §"Waiting & Watching") across active sessions from `herdrapp session list --json` (`herdr-setup/bin/herdrapp:182-196`), invoking `akrogon next` on terminal exit/status transitions and `pull --all` + `next --resume` on service/session start.
  2. **`herdr-app` mod listener** inside `herdr-app/tasks/main.js:158-221` (which already runs in every `herdr-app` window and polls `akrogon status --json`).
- **Lean:** **Option 1 (systemd user daemon tailing `hc events` per session)** paired with `herdrapp` session start hook (`herdr-setup/bin/herdrapp:210-237`).
- **Why & long-term consequences:**
  - *Option 1* works headless even if the `herdr-app` GUI window is closed/restarted (`hc` server outlives `herdr-app`, `AGENTS.md:881-891`), streams transitions immediately without 2s polling lag, and isolates event handling from WebKit mod API limits (`AGENTS.md:455-465` has no subprocess spawn API for mods other than `app.terminal.create`). *Risk later:* must dynamically discover new `herdr-core` sessions started via `herdrapp --session <name>` (`herdr-setup/bin/herdrapp:201-238`).
  - *Option 2* fails because `herdr-app` mods have no silent background subprocess API (`AGENTS.md:455-561`); spawning hidden terminals for every event poll would pollute `hc ls` and break when the window closes.

### F2: How does `akrogon` resolve a repo to its `herdr-core` session and `herdr-app` window?
- **Context:** `src/shell.ts:379-422` (`resolveSession`) currently probes `herdr session list` sockets and matches `workspace.label === repo.name`. Live inspection of `herdrapp session list --json` (`herdr-setup/bin/herdrapp:182-196`) shows multiple named sessions (`default`, `infra`, `omarchy`, `sims`), where each non-default session sets `HC_SESSION=<name>` and `HERDR_APP_HOME=~/.config/herdr-app-sessions/<name>` (`herdr-setup/bin/herdrapp:58-64`). Live `herdr-app ls` in `infra` shows `space.folder` is stale (e.g. `framework`, `blepsis`, and `herdr-setup` all report `"folder": "/home/ivan/Work/infra/akrogon"`), while `space.name` accurately names the repo (`akrogon`, `framework`, `portal`, `blepsis`, `pricing`, `herdr-setup`).
- **Options:**
  1. **Enumerate running sessions via `herdrapp session list --json` (or `~/.config/herdr-app-sessions/*` + `default`) and run `herdr-app ls` with each session's `HERDR_APP_HOME`, matching `space.name === repo.name`.** Return `{ hcSession, herdrAppHome, spaceId }` and thread both `HC_SESSION` and `HERDR_APP_HOME` into every `hc` / `herdr-app` call.
  2. **Match by `space.folder` or `hc ls --json` terminal `cwd`.**
- **Lean:** **Option 1 (`space.name === repo.name` across sessions, threading both `HC_SESSION` and `HERDR_APP_HOME`).**
- **Why & long-term consequences:**
  - *Option 1* preserves `src/shell.ts:404`'s exact multi-session contract (`no workspace`, `ambiguous`) and survives `cd` inside terminals. *Risk later:* spaces must be explicitly named (`space.rename`), matching today's setup (`AGENTS.md:109-115`).
  - *Option 2* breaks immediately on the live `infra` session where 4 spaces share `"folder": "/home/ivan/Work/infra/akrogon"`, or when an empty space has no terminals in `repo.root`.

### F3: What is the contract of the single `akrogon` agent-start helper (Signpost 1a)?
- **Context:** Signpost 1a restricts `akrogon` `hc`/`herdr-app` code to starting an agent (name, labels, visible pane, harness argv), while skills use plain `hc` commands for everything else (`hc send`, `hc wait`, `hc capture`, `hc kill`, `hc get`). Both the engine (`src/next.ts:513-677,786-811`) and `chart-issues` (`skills/chart-issues/scripts/peer-create.ts:33-94`, `peer-restart.ts:199-243`, `door-reset.ts:241-276`) need to start agents in specific pane layouts:
  - Leaf tab (`i-<slug>`): A left 50%, B right 50% (`INTAKE.md:78`).
  - Chart tab (`c-<repo>`): Door A left 50%, consultants B/C/D/E stacked right at 25% height each (`INTAKE.md:79`).
  - Operator/watch tabs (`w-<repo>`, `o-<slug>`): single pane in tab (`src/next.ts:554-563,655-672`).
- **Options:**
  1. **One CLI command + internal function (`akrogon spawn` / `spawnAgent`)** taking `--role <leaf-a|leaf-b|chart-door|chart-slot|watch|operator>` (or `--tab <name> --seat <A|B|C|D|E> --slot <a|b|c|d|e> --cwd <dir> [--name <hc-name>] [--prompt <text>]`): it resolves `(HC_SESSION, HERDR_APP_HOME, spaceId)`, creates/finds the tab or splits the target pane via `herdr-app`, runs `hc run --name <name> --parent <p> --cwd <dir> --label herdr.space=<sp> --label herdr.tab=<tb> -- <harness-argv>`, attaches the terminal to the pane (`herdr-app do pane.attach_terminal`), and rebalances column weights.
  2. **Low-level helper that only wraps `hc run`, leaving tab/pane layout to callers.**
- **Lean:** **Option 1 (shared start helper owning `hc run` + visible pane placement + systemd slice wrap).**
- **Why & long-term consequences:**
  - *Option 1* satisfies Signpost 1a literally ("name, labels, visible pane, harness argv"), lets `chart-issues` delete `peer-create.ts`, `peer-restart.ts`, and `door-reset.ts` (`INTAKE.md:107-115`) in favor of one `akrogon` start command + plain `hc`, and keeps systemd cgroup containment (`src/scope.ts:76-158`) in one place.
  - *Option 2* pushes multi-step `herdr-app do` JSON plumbing (`tab.new`, `pane.split`, `pane.attach_terminal`, `pane.close`) into markdown skill prompts, which is brittle and duplicates layout math.

### F4: How do we achieve equal pane heights (25% each for B/C/D/E) when splitting the right column?
- **Context:** `herdr-app` binary splitting (`pane.split` with `direction: "down"`) divides the target pane 50/50 (`AGENTS.md:274-275`), producing 50% / 25% / 12.5% / 12.5% after three downward splits (`INTAKE.md:79,179`), and `herdr-app commands` has `pane.resize` (`delta: -0.9..0.9`) only for the currently focused pane! Wait: `AGENTS.md:519-550` documents `app.layout.capture()` and `app.layout.apply(layout)` in the mod JS API, where splits are binary trees with explicit `weight` (`0.1` to `0.9`, e.g. `1/4 = 0.25`, `1/3 = 0.333`, `1/2 = 0.5`).
- **Options:**
  1. **Patch in `herdr-setup` (Signpost 3):** add a small `herdr-setup` mod or `herdrapp` helper (e.g. a mod command or `pane.focus` + `pane.resize` sequence in `herdrapp`) that equalizes vertical stack weights (to `0.25` top vs `0.75` bottom, `0.333` vs `0.667`, `0.5` vs `0.5`) or calls `pane.focus` + `pane.resize` with exact deltas (`-0.25`, `-0.167`) after each split.
  2. **Pure `herdr-app do` sequence (`pane.focus` + `pane.resize`)** inside `akrogon`'s start helper without modifying `herdr-setup`.
- **Lean:** **Option 2 if a live probe confirms `pane.focus` + `pane.resize` (`delta`) sets exact weights (`0.25`, `0.333`, `0.5`); otherwise Option 1 (`herdr-setup` mod/wrapper).**
- **Why & long-term consequences:**
  - In a binary split tree (`B` top, `rest` bottom), setting `B vs (C,D,E)` weight to `0.25` (`delta: -0.25` from `0.5`), `C vs (D,E)` weight to `0.333` (`delta: -0.167` from `0.5`), and `D vs E` weight to `0.5` gives exact 25%/25%/25%/25% heights! If `pane.resize` works reliably via `herdr-app do`, zero custom layout mod is needed; if `pane.resize` is relative to window pixels or clamping, a 20-line `herdr-setup` mod using `app.layout.capture()`/`apply()` guarantees exact weights across upstream updates.

### F5: How are leaf turns dispatched, tracked in `state.yaml`, and advanced on `akrogon phase`?
- **Context:** Under old Herdr, `src/next.ts:803-825` ran `herdr prompt --pane <id> <message>` and polled `paneSessionId` until a transcript `.jsonl` appeared on disk (`src/state.ts:95-102`), storing `pane: {A, B}` and `agent_session: {A, B}` in `state.yaml`. When an agent ran `akrogon phase <slug> <next> --slot A`, `src/phase.ts:930-946` updated `state.yaml` and relied on Herdr's `agent.status_changed` (`idle`) event to trigger `akrogon next` for the next slot (`src/next.ts:1632-1672`).
- **Options:**
  1. **Store `terminal: {A, B}` (named e.g. `ak-<repo>-<slug>-a` or address `t..`), `pane: {A, B}` (`p..` for `herdr-app/tasks` `pane.focus`), and `turn: {A, B}` (integer turn from `hc get --json`) in `state.yaml`.** Pass the first prompt via `hc send <t> <prompt>` (or `hc run` initial prompt if supported by all 3 harnesses), and have `akrogon phase` directly trigger `next` (or `hc send` to the next seat) synchronously before returning, while `hc events` handles crash/idle recovery.
  2. **Rely only on `hc events` (`status` -> `idle`) to dispatch the next turn after `akrogon phase`.**
- **Lean:** **Option 1 (store `terminal`, `pane`, `turn`; dispatch next seat directly from `akrogon phase` + `hc events` fallback).**
- **Why & long-term consequences:**
  - *Option 1* eliminates the race where an agent calls `akrogon phase` during its turn (while its harness status is still `working`) and `next` wouldn't fire until the turn finishes. Storing both `terminal` (`t..` / name for `hc`) and `pane` (`p..` for `herdr-app/tasks/main.js:116-123` `pane.focus`) keeps `herdr-app/tasks` click-to-focus working (`herdr-app/tasks/model.js:76-82`).

### F6: How does `watch-issues` (`observe.ts` + `log-tail.ts`) inspect stalled seats once `agent_session` and `src/session-file.ts` are removed?
- **Context:** `INTAKE.md:64` lists `src/session-file.ts:1-76` as "only needed because old Herdr keyed state on `agent_session`", and `INTAKE.md:94-99` says `akrogon log` (`src/log.ts:1-70`) can be retired in favor of `hc capture` / `hc get`. However, `skills/watch-issues/SKILL.md:44` and `skills/watch-issues/scripts/observe.ts:171-180` use `sessionFile(...)` + `skills/watch-issues/scripts/log-tail.ts:424-488` to parse the last 20 tool calls from the harness JSONL transcript to spot edit/shell loops!
- **Options:**
  1. **Replace `session_file` + `log-tail.ts` with `hc capture <terminal>` in `observe.ts` and `skills/watch-issues/SKILL.md`**, deleting `src/session-file.ts`, `src/log.ts`, and `skills/watch-issues/scripts/log-tail.ts`.
  2. **Keep `log-tail.ts` for loop detection, and have `observe.ts` locate the active transcript JSONL by `(harness, cwd, terminal start time / open fd of foreground.pid from /proc/<pid>/fd)`** without storing `agent_session` in `state.yaml`.
- **Lean:** **Option 1 (`hc capture <terminal>` + `hc get <terminal> --json`), unless operator wants structured JSONL tool-call hashes preserved via `/proc/<foreground.pid>/fd` (Option 2).**
- **Why & long-term consequences:**
  - *Option 1* removes all brittle per-harness `~/.claude`, `~/.codex`, `~/.pi` file-layout acoplamiento (`src/session-file.ts:28-75`) that breaks whenever a harness changes its session file format. *Risk later:* terminal scrollback (`hc capture`) truncates long tool inputs that `log-tail.ts` hashed.

### F7: How is the global `herdr` skill structured so `herdr-app` startup overwrites never break skill discovery?
- **Context:** Signpost 5a specifies one global `herdr` skill whose content comes from `herdr-app`'s `AGENTS.md`, linked into `pi`, Claude Code, and Codex. Live inspection shows:
  - `~/.config/herdr-app/AGENTS.md:1-3` is overwritten by `herdr-app` on every start and **lacks YAML frontmatter** (`---\nname: herdr\ndescription: ...\n---`), which Claude Code (`~/.claude/skills/herdr/SKILL.md:1-4`), Pi (`~/.pi/agent/skills/herdr`), and Codex (`~/.codex/skills/herdr`, `~/.agents/skills/herdr`) require on `SKILL.md`.
  - `~/.config/herdr-app/AGENTS.md:934-936` covers the GUI/mod surface and tells agents to run `hc --skill` for the `hc` CLI manual.
- **Options:**
  1. **Skill folder `<herdr-setup>/skills/herdr/` (or generated by `herdr-setup/install`)** containing a tracked `SKILL.md` with valid YAML frontmatter + the `hc --skill` reference (or instruction) + a symlink `AGENTS.md -> ~/.config/herdr-app/AGENTS.md` (or `herdrapp` wrapper regenerating `SKILL.md` = frontmatter + `AGENTS.md` + `hc --skill` on launch), symlinked into `~/.claude/skills/herdr`, `~/.codex/skills/herdr`, `~/.pi/agent/skills/herdr`, and `~/.agents/skills/herdr`.
  2. **Direct symlink `SKILL.md -> ~/.config/herdr-app/AGENTS.md`.**
- **Lean:** **Option 1 (`herdr-setup/install` manages the skill directory with YAML frontmatter in `SKILL.md` + symlinked/embedded `AGENTS.md` and `hc --skill`).**
- **Why & long-term consequences:**
  - *Option 2* loses YAML frontmatter on the very next `herdr-app` start (`AGENTS.md:3`), causing skill loaders that require `name`/`description` frontmatter to silently drop the `herdr` skill!

---

## 2. Practitioner Questions (Unanswered by Intake)

1. **Notifications (`herdr notify` replacement):** `src/next.ts:249-258,1050-1085`, `src/phase.ts:105-120`, and `src/verify.ts:325-361` call `herdr notify` for lands, holds, blocks, and verify failures. `hc` has `--notify` on terminal exit (`hc --skill:75`), and `herdr-app` has `app.toast(msg)` inside JS mods (`AGENTS.md:559`), but neither `hc` nor `herdr-app do` has a CLI toast command (`herdr-app commands`). Should `herdr-setup` add a tiny toast bridge in `herdr-app/tasks` (e.g., reading toast events from `akrogon status --json` or a file) or should `akrogon` call `notify-send`? *(Lean: surface notifications via `herdr-app/tasks` mod `app.toast()` or `notify-send`.)*
2. **Chart consultant harness `agy` (Antigravity):** `INTAKE.md:140,187` lists `agy` alongside `claude`, `codex`, `pi`, and live `hc ls --json` shows slot E running `agy` in `t6g`, yet `akrogon config` (`~/.config/akrogon/config.yaml`) only defines `claude`, `codex`, `pi` under `harnesses`. Should `agy` be added to `src/config.ts` / `config.yaml` and tested in the live probe?
3. **Codex `--no-daemon` flag in `config.yaml`:** `hc --skill:262` and `INTAKE.md:41,140,180` require `codex --no-daemon`, but live `akrogon config` currently has `codex: codex -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access` without `--no-daemon`. Should `akrogon preflight` / `src/config.ts` enforce or migrate `--no-daemon` for `codex`?
4. **Multi-session mod linking (`src/install.ts:46-49`):** `akrogon install` and `src/self-update.ts:238` link `herdr-app/tasks` into `~/.config/herdr-app/mods/tasks`, but `herdrapp` sessions use `~/.config/herdr-app-sessions/<name>/mods/` (`herdr-setup/bin/herdrapp:98-117`). Should `akrogon install` / `self-update` invoke `herdrapp session link` when `herdrapp` is on `PATH`?
5. **`timings.jsonl` schema (`src/timing.ts:11-28`):** `TimingEntry` requires `agent_session: z.string().min(1)`. When `agent_session` is removed from `state.yaml`, should `TimingEntry.agent_session` be renamed to `terminal` (or populated with `<terminal>:<turn>` for backwards compatibility with historical `issues/timings.jsonl` rows)? *(Lean: accept `terminal` or `agent_session` in `timingEntrySchema` so historical `issues/timings.jsonl` files in repos still parse.)*

---

## 3. Pitfalls Over the Work's Lifetime

| Pitfall | Surface | What Removes It |
| :--- | :--- | :--- |
| **`space.folder` drift in `herdr-app ls`** causes repo-to-space resolution to pick the wrong space or fail with `ambiguous`. | `herdr-app ls` in `infra` (4 spaces report `/home/ivan/Work/infra/akrogon`); `src/shell.ts:379-422` | **Design choice:** Match `space.name === repo.name` across `herdrapp session list --json` sessions, never `space.folder`. |
| **Missing `HERDR_APP_HOME` when calling `herdr-app`** targets the `default` session window instead of `infra` (`HC_SESSION` alone only routes `hc`, not `herdr-app`). | `herdr-setup/bin/herdrapp:58-64`; `src/shell.ts:304-377` | **Design choice:** `resolveSession(repo)` returns both `hcSession` and `herdrAppHome` and injects both env vars into every `hc`/`herdr-app` spawn. |
| **Orphaned terminals on `herdr-app do pane.close` or `tab.close`:** closing a GUI pane/tab does NOT kill the underlying `hc` terminal (`AGENTS.md:885-891`). | `src/next.ts:219-247`; `src/reconcile.ts:375-425`; `skills/chart-issues/SKILL.md` | **Design choice + Done-criterion:** Always `hc kill <terminal>` before/with `pane.close`/`tab.close`, and `hc prune` during `reconcile`. |
| **`hc run` into a visible pane leaves a zombie default shell terminal:** `tab.new` and `pane.split` auto-spawn a fresh shell terminal (`AGENTS.md:274,891`); attaching a second `hc run` terminal via `pane.attach_terminal` orphans the auto-spawned shell! | `AGENTS.md:269-279,885-891`; `herdr-app commands` (`pane.attach_terminal`) | **Probe + Design choice:** Either (a) `hc kill` the displaced shell terminal returned by `herdr-app ls` before/after `pane.attach_terminal`, or (b) verify in probe whether `hc run` with `--label herdr.space=<sp> --label herdr.tab=<tb>` + `pane.attach_terminal` cleanly replaces it. |
| **Seat cgroup containment (`src/scope.ts:76-158`):** `hc run` forks terminals as children of the `herdr-core` server daemon, not the caller (`hc --skill:76`). | `src/scope.ts:115-158`; `src/reconcile.ts:392-416` | **Design choice:** Read `pid` (holder shell) and `foreground.pid` from `hc get <t> --json` and move `pid` into `akrogon-seat-<repo>-<slug>-<slot>.scope` via `adoptPid` (`src/scope.ts:76-113`), or wrap the harness argv in `systemd-run --user --scope` inside `hc run`. |
| **CLI verb contract test failure:** adding/removing any `akrogon` verb without updating both `docs/reference/commands.md` and `tests/command-reference.test.ts:10-39` breaks `bun test`. | `tests/command-reference.test.ts:10-39`; `tests/docs-links.test.ts:83-101` | **Done-criterion:** Update `docs/reference/commands.md` and `tests/command-reference.test.ts` in the same leaf that changes `src/akrogon.ts`. |
| **Codex daemon escaping `hc` lifecycle and cgroups:** without `--no-daemon`, Codex spawns background processes that outlive the `hc` terminal and prevent clean turn detection. | `hc --skill:262`; `INTAKE.md:41,140,180` | **Operator step + Config gate:** Add `--no-daemon` to `codex` in `~/.config/akrogon/config.yaml` and enforce in `src/config.ts`. |

---

## 4. Proposed Split (Destinations, Leaves, Dependencies)

Following **Signpost 6a** (port engine first, prove end-to-end on the new substrate, then remove old `herdr` artifacts and port skills) and **Signpost 2a** (no fallbacks kept after cutover):

### Destination 1: `herdr-setup` repo (`/home/ivan/Work/infra/herdr-setup`)
- **Leaf HS-1 (`herdr-setup` skill, layout/toast helpers, session link):**
  - Create global `herdr` skill in `herdr-setup` with valid YAML frontmatter + `hc --skill` + `AGENTS.md` integration; update `herdr-setup/install:26-50` to link the skill into `~/.claude/skills/herdr`, `~/.codex/skills/herdr`, `~/.pi/agent/skills/herdr`, and `~/.agents/skills/herdr` (replacing old `~/.claude/skills/herdr/SKILL.md:1-195`).
  - Add any needed `herdrapp` helper/mod patch for equal 4-pane column weights (`F4`) and toast notifications (`Q1`).
  - *Dependencies:* None (can run first or in parallel with AK-1).

### Destination 2: `akrogon` repo (`/home/ivan/Work/infra/akrogon`)
- **Leaf AK-1 (Engine core port + `fake-hc` / `fake-herdr-app` test harness):**
  - Port `src/shell.ts:304-422` (`resolveSession`, `hc`/`herdr-app` callers with `HC_SESSION` + `HERDR_APP_HOME`), `src/state.ts:88-105` (terminal/pane/turn schema), `src/scope.ts:115-158` (`hc get --json` `pid`/`foreground.pid` for cgroup adoption, `HC_TERMINAL` replacing `HERDR_PANE_ID`), `src/next.ts` (shared agent-start helper per Signpost 1a, `hc send` dispatch, `hc kill` + `herdr-app do` cleanup), `src/phase.ts:879-947`, `src/reconcile.ts:375-425`, `src/status.ts:46-54`, `src/timing.ts:11-28`, `src/install.ts:25,40-49`, `src/self-update.ts:230-260`.
  - Replace `tests/fake-herdr.ts:1-524` (`tests/isolation.ts:65-79`, `tests/helpers.ts:132-154`) with `fake-hc` + `fake-herdr-app` and port engine tests (`tests/next.test.ts`, `tests/phase.test.ts`, `tests/reconcile.test.ts`, `tests/session-routing.test.ts`, `tests/session-reads.test.ts`, `tests/seat-containment.test.ts`, `tests/leaf-slices.test.ts`, `tests/install.test.ts`, `tests/self-update.test.ts`).
  - *Dependencies:* Live probes (Section 5).
- **Leaf AK-2 (Crash/event listener & startup wakeup — Signpost 4a):**
  - Replace `plugin/herdr-plugin.toml:1-27` and `plugin/next.sh:1-3` with `hc events` listener service (`F1`) + startup `pull --all` & `next --resume`, and update `herdr-app/tasks/main.js` if toast notifications route through it.
  - *Dependencies:* Depends on **AK-1** (`resolveSession` and `next` engine). Can run in parallel with **AK-3** and **AK-4**.
- **Leaf AK-3 (`chart-issues` skill port & `peer-*.ts` / `door-reset.ts` deletion — Signpost 1a & 2a):**
  - Rewrite `skills/chart-issues/SKILL.md` to use the shared `akrogon` agent-start command + plain `hc send`, `hc wait`, `hc capture`, `hc kill`, `hc get --json`.
  - Delete `skills/chart-issues/scripts/peer-create.ts`, `peer-ask.ts`, `peer-wait.ts`, `peer-restart.ts`, `peer-anchor.ts`, `door-reset.ts` (`INTAKE.md:107-115`) and their obsolete tests (`tests/peer-*.test.ts`, `tests/door-reset.test.ts`), updating `tests/chart-usage.test.ts`.
  - *Dependencies:* Depends on **AK-1** (shared agent-start command). Runs in parallel with **AK-2** and **AK-4**.
- **Leaf AK-4 (`watch-issues` & remaining skills, docs, and dead-code removal — Signpost 2a):**
  - Port `skills/watch-issues/SKILL.md` and `skills/watch-issues/scripts/observe.ts:1-272` to `hc ls --json` / `hc get --json` / `hc capture` (`F6`).
  - Delete `src/log.ts:1-70`, `src/session-file.ts:1-76`, `tests/log-reader.test.ts`, and update `skills/implement-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `README.md`, `docs/**`, and `tests/command-reference.test.ts`.
  - *Dependencies:* Depends on **AK-1**. Runs in parallel with **AK-2** and **AK-3**.

### Destination 3: Operator Machine Outside Any Repo
- **Step OP-1:** Update `~/.config/akrogon/config.yaml` (`codex --no-daemon`, add `agy` if used in charts), run `herdr-setup/install` and `akrogon install`, enable the event listener unit, and delete `~/.config/herdr/plugins/akrogon/` (`src/install.ts:25`) once end-to-end verification passes.

---

## 5. External Operations Needing One Live Observation Before Handoff

Per **Signpost 7a**, run all probes inside one throwaway session (`herdrapp --session ak-probe`, setting `HC_SESSION=ak-probe` and `HERDR_APP_HOME=~/.config/herdr-app-sessions/ak-probe`) within one operator-approved budget, then `hc shutdown` + `herdrapp session delete ak-probe`:

1. **Pane attachment & displaced shell cleanup (`herdr-app` + `hc`):**
   - *Why:* Verify whether `herdr-app do '{"command":"tab.new"}'` + `hc run --name probe-a ...` + `herdr-app do '{"command":"pane.attach_terminal","terminal":"<t>"}'` leaves the auto-created tab shell alive in `hc ls --json` and whether `hc kill <old-shell>` cleanly removes it without closing the pane.
   - *Smallest call:* `herdr-app do '{"command":"tab.new"}'` -> `herdr-app ls` -> `hc run --name probe-a --cwd /tmp -- sh -c 'sleep 30'` -> `herdr-app do '{"command":"pane.attach_terminal","terminal":"probe-a"}'` -> `hc ls --json`.
2. **4-pane right-column equal-height split math (`herdr-app`):**
   - *Why:* Confirm whether `pane.split` (`right` then 3x `down`) + `pane.focus` + `pane.resize` (`delta: -0.25`, `-0.167`) produces 4 equal-height stacked panes or requires a `herdr-setup` layout mod (`F4`).
   - *Smallest call:* Run the split + `pane.resize` sequence in `ak-probe` and inspect `herdr-app ls` and visual layout.
3. **Agent lifecycle (`hc run`, `hc send`, `hc wait`, `hc events`, `hc get --json` status & turn) across `claude`, `codex --no-daemon`, `pi`, and `agy`:**
   - *Why:* Confirm for each harness how `hc run` starts an interactive session, whether hooks report `status.state: "idle"` / `"working"` and increment `turn` on `hc send`, and whether `hc wait <t>` blocks until the reply turn finishes (`hc --skill:133-163`).
   - *Smallest call:* One 1-turn prompt (`"Reply with the single word OK"`) per harness via `hc run` + `hc send <t> "Reply with OK"` + `hc wait <t> --timeout 30s` + `hc get <t> --json` + `hc capture <t>`.
4. **Skill frontmatter & symlink loading (`claude`, `codex`, `pi`):**
   - *Why:* Confirm that the proposed `<skill-dir>/herdr/SKILL.md` (with YAML frontmatter + symlinked/included `AGENTS.md`) is listed as a valid skill by all three harnesses after `herdr-app` restarts.
   - *Smallest call:* Link into skill dirs and check startup skill discovery during Probe 3.
