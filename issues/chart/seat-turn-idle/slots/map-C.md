# Territory Map: Slot C

Destination repo: `/home/ivan/Work/infra/akrogon` (HEAD `085f2f88`, `main`).
Session locks honored: `#157` operator decision (`seed-decision.md` `## Taken`), `#153` operator decision (`seed-decision.md` `## Taken`), session signposts (`signposts.md` `## Taken`: 1a fix the mechanism, 2a free tests at the real boundary, 3a extend existing records only, 4a one leaf per chart, 5a order `#157 → #156 → #155 → #154 → #153`, 6a old records keep parsing).

---

## 1. `seat-turn-idle` (Tamdoma/akrogon#157)

### 1.1 Mechanism today
- **Confirmed on the akrogon side; two distinct failure paths live behind `src/next.ts:dispatchSlot`.**
  1. **Background shell after turn end:** `src/next.ts:dispatchSlot` calls `observeBusy` (`src/next.ts:159`), then returns early on `if (status !== 'idle' && status !== 'done') return;` (`src/next.ts:618`). `src/listen.ts:listenCommand` (`src/listen.ts:95`) only wakes `next --wake` on hc events `turn`, `finished`, `lost`, or `status` with `state === 'blocked'`. `src/phase.ts:commitMove` (`src/phase.ts:199`) saves the new phase, clears `prompted`, and runs `phaseWake`, but terminates nothing in the seat's systemd scope (`akrogon-l<hash>-<seatName>-<hex>.scope`, created in `src/seat.ts:startSeat:304,326`). `src/reconcile.ts:broadcastInProgress` (`src/reconcile.ts:197`) has the same `status !== 'idle' && status !== 'done'` gate, so a broadcast seat with a background shell also stalls cleanup.
     - *Low confidence on `hc` internals (herdr-core source is not in this workspace):* We observed `hc get --json t3fp` after the operator killed the loop (`state: 'live'`, `status: { app: 'claude-code', state: 'done' }`, `turn: 3`), not during the stall. It is unverified whether `hc 0.1.22` kept `status.state === 'working'` because of Claude Code's screen/status text (`done ... · 1 shell still running`) or child-process presence, and whether `hc` emitted a `turn` event at turn end while keeping `status.state === 'working'`.
  2. **Reboot recovery pane (live bash shell, `status: null`):** Confirmed and explained by `keep: true`. Live inspection of `hc get --json t3fp` shows `keep: true` even though `src/seat.ts:startSeat` does not pass `--keep` (likely set by `herdr-app` or hc defaults). `hc --help` documents `server stop parks kept terminals; next core start gives them shells`. After a reboot, `hc` recreates kept terminals as `/usr/bin/bash` with `state: 'live'`, `status: null`, `turn: 0`, `reported: false`, `argv: ['/usr/bin/bash']`, `foreground: { argv: ['/usr/bin/bash'], name: 'bash', ... }` (verified shape on live shell `t3d8`). In `src/next.ts:dispatchSlot:535`, only `seat === undefined || seat.state === 'finished'` enters the seat-replacement path. A recovered shell falls through to line 618 and stalls forever while `src/next.ts:liveSeat` (`src/next.ts:114`), `allocate` (`src/next.ts:465`), and `activeCount` (`src/next.ts:403-411`) still count it as a live seat holding capacity.

### 1.2 Material forks

1. **Idle-with-background-shell boundary (`hc` vs akrogon)**
   - **Option A (Fix in `hc` + phase-advance sweep in akrogon):** Fix herdr-core so a Claude turn ending with background shells reports `status.state: 'done'` and emits `turn`; akrogon sweeps leftover seat shells on phase advance and handles rebooted shells.
     - *Breaks/invites:* Requires an upstream `hc` release outside this repo if `hc` is what withholds `turn`/`done`.
   - **Option B (Akrogon-only):** Sweep leftover seat shells on phase advance (removing the shell before or right as the seat ends its turn), and in `src/next.ts:dispatchSlot` also treat a seat whose turn advanced (or whose harness transcript shows turn completion) as deliverable despite `status.state === 'working'`.
     - *Breaks/invites:* If `hc` emits *no* `turn` event while a background shell runs (for a turn that does *not* call `akrogon phase`, e.g. a silent turn end or a shell started after `akrogon phase`), `src/listen.ts:95` will never wake `next --wake`, `observeBusy` will still fire false 1h busy notices, and calling `hc send` while `hc` thinks the pane is `working` risks racing a genuinely working turn.
   - **Pick:** **Option A if the pre-handoff `hc` probe shows `hc` withholds `turn` or `done` with a background shell; Option B (akrogon-only) if `hc` already emits `turn` or if killing the shell on phase advance is sufficient.** Either way, the akrogon leaf owns the phase-advance shell sweep, rebooted-shell recovery, and `dispatchSlot` turn/status handling; an upstream `hc` fix is a separate external dependency if the probe confirms `hc` stays silent.

2. **How leftover seat shells are targeted and ended on phase advance (`src/phase.ts:commitMove` / `transition`)**
   - **Option A (Cgroup sweep of non-agent, non-caller process groups in the seat's `.scope`):** Locate the leaf's seat `.scope` cgroup under `/sys/fs/cgroup/.../<leaf-slice>/` (via `/proc/<seat.pid>/cgroup`), enumerate `cgroup.procs`, and SIGTERM → SIGKILL processes whose PID is neither `seat.pid` nor on `process.pid`'s own ancestor chain (the tool call running `akrogon phase`), restricted to shell/job process groups not belonging to the harness's own persistent helpers (e.g. MCP servers).
     - *Breaks/invites:* Over-broad killing can kill a harness's own MCP servers or internal helpers; under-broad filtering can miss a detached `setsid` background loop if matching only by direct PPID.
   - **Option B (Kill every non-harness descendant except the `akrogon phase` ancestry chain inside the seat's `.scope`):** Rely on the fact that each seat has its own systemd `.scope` (`src/seat.ts:304,326`), while `run-check` runs in sibling `akrogon-run-*.scope` units (`src/run-check.ts:349-350`), so anything else in the seat `.scope` is seat-spawned. Exclude `seat.pid`, the `process.pid` ancestor chain, and verified persistent harness helpers (from the pre-handoff cgroup inspection).
     - *Breaks/invites:* If `akrogon phase` runs *from inside* a seat's bash tool call, killing the caller's own shell aborts `akrogon phase` before its exit prints; if a seat spawns a background shell *after* `akrogon phase`, it won't be caught until the next phase advance.
   - **Option C (End and relaunch the seat terminal on phase advance):** Guaranteed clean slate, zero cgroup heuristics.
     - *Breaks/invites:* Destroys conversation reuse across phases, pays cold-start latency and prompt-cache misses on every phase transition.
   - **Pick:** **Option B** (bounded strictly to the seat's own `.scope` cgroup, excluding `seat.pid`, `process.pid` and its ancestors, and any harness-owned helper processes verified in the pre-handoff probe). Note: also evaluate whether `transition` (`src/phase.ts:522-534`) should sweep only on actual phase advance (per the lock: *"when the leaf's phase advances"*) or also when one slot records `done` in `check.review`. Honoring the lock literally (on `commitMove` phase advance, across both seats of the leaf) avoids killing seat B's active review shells while A records `done` early.

3. **Detecting and recovering rebooted seat panes (`src/next.ts:dispatchSlot`, `src/hc.ts:terminalSchema`)**
   - **Option A (Inspect `argv` / `foreground` on `live` seats in `dispatchSlot` and `liveSeat`):** Extend `terminalSchema` (`src/hc.ts:21`) with `argv: z.array(z.string()).default([])` and `reported: z.boolean().default(false)` (both already returned by `hc get --json` and `terminal.list`). Treat a `live` seat whose `argv[0]` is no longer `systemd-run` (or whose `foreground` is a login shell with `status === null` and `reported === false`) as a dead-agent recovered shell: end it and relaunch via `startSeat`.
     - *Breaks/invites:* Must not misclassify a freshly launched seat during its first 1–2s before the harness reports status. Checking `argv[0] !== 'systemd-run'` (since `startSeat` always launches `['systemd-run', ...]`, while hc keep-recovery replaces `argv` with `['/usr/bin/bash']`) is immune to startup races, *provided* the pre-handoff probe confirms hc replaces `argv` on recovery.
   - **Option B (Call `hc keep --off <address>` after `startSeat`):** Prevents `hc` from turning dead seats into shells on reboot.
     - *Breaks/invites:* If `herdr-app` re-enables `keep` when adopting/displaying panes, shells still come back; also does not recover already-running seats.
   - **Pick:** **Option A** (with Option B as optional defense-in-depth if `herdr-app` does not overwrite `keep`). Decide whether a reboot recovery charges `state.lost[slot]` (`src/next.ts:596`): do **not** charge `lost` when `boot_id` changed or when `argv` is a recovery shell, or cap it at 1 — charging `lost` across 3 host reboots shouldn't permanently fail healthy leaves.

### 1.3 Practitioner questions & lifetime pitfalls
- **Questions:**
  - When Claude Code prints `done ... · 1 shell still running`, does `hc 0.1.22` increment `turn` and emit a `turn` event, or stay completely silent until the shell exits?
  - Which child processes do `claude`, `codex`, `pi`, and `agy` keep alive inside their seat `.scope` between turns (e.g. MCP servers, LSPs, node helpers)?
  - On `check.review` when slot A calls `akrogon phase` first (moving only `done: [A]`) and B is still running, sweeping on `commitMove` (phase advance) runs only once both are done — what if A leaves a shell while waiting for B?
  - Does `akrogon status` (`busy_since`) clear properly once the seat becomes idle, or does `commitMove` (`src/phase.ts:245`, which preserves `busy_since` across non-terminal phases!) keep stale `busy_since`?
- **Pitfalls & removals:**
  - *Self-kill during `akrogon phase`:* `akrogon phase` is invoked by a subshell of the seat. Remove by walking `/proc/<pid>/stat` PPIDs from `process.pid` up to `seat.pid` and excluding every ancestor PID (and its PGID if shared only with the tool wrapper).
  - *Killing the wrong seat's work in `check.review`:* Sweeping a seat that is still mid-turn in a two-seat phase would kill its active commands. Remove by sweeping on `commitMove` only for seats whose turn finished or whose phase ended, and never sweeping sibling `akrogon-run-*.scope` units (already separate cgroups).
  - *Relaunch loop on a slow-booting seat:* Treating any `live` + `status: null` terminal as dead would kill seats still starting up (`startSeat` before first status). Remove by keying dead-agent detection on `argv` / recovery-shell identity (verified against `hc` probe), never on `status === null` alone.
  - *False capacity hold by rebooted shells:* `activeCount` (`src/next.ts:403`) counts all `akrogon=1` live terminals. Remove by reusing the same live-agent predicate in `activeCount` and `dispatchSlot` so recovered shells don't block other leaves before recovery runs.

### 1.4 Leaves & dependencies
- **Smallest set:** **1 leaf in `akrogon`** (phase-advance seat-scope shell sweep + dead-agent/rebooted-shell detection & replacement + `dispatchSlot` turn-idle handling).
- **Potential external dependency:** If the pre-handoff `hc` probe proves `hc 0.1.22` emits neither `turn` nor `done` while a Claude background shell runs, a companion fix in `herdr-core` is needed for the non-phase-advance case; the akrogon leaf still lands cleanly on its own and resolves both the phase-advance stall and the reboot stall.
- **Between charts:** No prerequisite from the other 4 charts; lands first per Signpost 5a.

### 1.5 Pre-handoff observations needed
1. **Real `hc 0.1.22` + Claude background-shell probe:** Start a Claude pane in a throwaway `HC_SESSION`, launch a background shell (`sleep 60 &` via Claude's background Bash tool), let the turn finish, and record `hc get --json` (`status`, `turn`, `foreground`, `argv`, `reported`) and `hc events --json` output, plus `hc send --json` behavior while the shell runs.
2. **Real `hc 0.1.22` keep-recovery probe:** In a throwaway `HC_SESSION`, start a kept `systemd-run --user --scope` terminal, run `hc server stop && hc server start`, and inspect `hc get --json` (`state`, `argv`, `foreground`, `status`, `reported`, `turn`, `keep`) to confirm exact fields on a reboot-recovered pane.
3. **Resting harness cgroup census:** Inspect `/sys/fs/cgroup/.../<seat>.scope/cgroup.procs` and `ps` on live resting `claude`, `codex`, `pi`, and `agy` seats to confirm what persistent child processes (if any) live inside a seat scope between turns.

---

## 2. `fresh-leaf-base` (Tamdoma/akrogon#156)

### 2.1 Mechanism today
- **Confirmed, with two critical adjacent mechanisms uncovered.**
  1. **`src/next.ts:ensureWorktree` (`src/next.ts:283-316`):**
     - When `existsSync(path)` (`src/next.ts:289-295`): checks only that `path` is a git worktree root sharing `commonDirectory(repo.root)`. It never checks whether `leaf.state.worktree === undefined` (first allocation vs resume), never compares `HEAD` to `trackingRef(repo)`, never checks `git status --porcelain`, and never checks which branch is checked out.
     - When `!existsSync(path)` (`src/next.ts:296-305`): if `refs/heads/<slug>` already exists, it runs `createSparseWorktree(repo, path, slug, { branch: undefined })` — checking out the stale branch as-is. Only when both worktree and branch are absent does it branch from `trackingRef(repo)`.
  2. **Why `AKROGON_BASE` went stale:** `src/config.ts:base` (`src/config.ts:467`) runs `git merge-base HEAD <trackingRef>`. When `HEAD` is an ancestor of `trackingRef(repo)`, `merge-base` returns the old `HEAD`.
  3. **Why withdraw left the worktree behind:** There is no `akrogon withdraw` verb (`src/akrogon.ts`). When an operator deletes `issues/open/<owner>` manually, `src/reconcile.ts:1032-1035` sees a registered worktree with no matching leaf in `leafBySlug` and classifies it as `unmanaged worktree` (kept forever), and `refs/heads/<slug>` also stays.
  4. **No fetch on leaf creation:** `src/next.ts:dispatchLeaf:816-817` calls `checkBase(repo, mustCreate)` (`src/preflight.ts:65`), which only runs `git rev-parse` (`localBase`) and `git ls-remote` (`remoteBase`), never `git fetch`. So even a brand-new slug starts on whatever commit `refs/remotes/<remote>/<default_branch>` happened to hold locally.
  5. **Existing intentional reuse contract (DO NOT BREAK):** `skills/chart-issues/assets/direct-route.md` (`Growth stop` continuation) commits partial work on `refs/heads/<slug>`, unlocks the worktree, and hands off a leaf with the same slug explicitly relying on `ensureWorktree` adopting that committed worktree as-is!

### 2.2 Material forks

1. **Policy when `ensureWorktree` sees a pre-existing worktree or `refs/heads/<slug>` on first allocation (`leaf.state.worktree === undefined`)**
   - **Option A (Fast-forward clean, commit-free leftovers; preserve clean committed branches; refuse dirty or wrong-branch trees):**
     - Gate strictly on `leaf.state.worktree === undefined` (never touch an already-active leaf's worktree on resume!).
     - If worktree exists: verify it is on `refs/heads/<slug>` (not detached or another branch) and `git status --porcelain` is empty (note: `.env` is gitignored, so ignored files don't trip it). If dirty or wrong branch → **refuse loudly** naming the path and files (never destroy uncommitted work, never silently plan on stale edits).
     - Check `git rev-list --count <trackingRef>..<branch>` (own commits):
       - **0 own commits** (stale leftover, behind `trackingRef`): fast-forward/move `refs/heads/<slug>` (and worktree `HEAD`, with sparse-checkout intact) to `trackingRef(repo)`.
       - **>0 own commits** (e.g. direct-route growth-stop handoff, clean): adopt as-is, preserving the growth-stop contract (note: optionally check if it also needs `trackingRef`? No — growth stop explicitly says *"the planner decides what to keep"*).
     - *Breaks/invites:* If an earlier withdrawn attempt had committed work (not just uncommitted edits) AND the same slug is reused, Option A would adopt those commits. (Low risk because withdrawn handoffs rarely have commits, and `plan.synthesis` sees them in `git log <base>..HEAD` rather than silently missing main's commits — though if behind main, `AKROGON_BASE` is still the old merge-base.)
   - **Option B (Always refuse any pre-existing worktree or branch on first allocation unless an explicit marker/opt-in exists):**
     - *Breaks/invites:* Breaks `skills/chart-issues/assets/direct-route.md` Growth stop unless that protocol is also updated; forces manual deletion even for clean, empty leftover branches/worktrees.
   - **Option C (Force-reset and wipe dirty files when 0 commits ahead):**
     - *Breaks/invites:* Violates data-preservation guarantees (`src/reconcile.ts:worktreeRemovable` refuses dirty worktrees); can silently destroy an operator's unsaved work in that folder.
   - **Pick:** **Option A** — fixes `#156` completely (clean stale worktrees/branches advance to `trackingRef`, dirty stale worktrees refuse loudly before any seat opens), preserves direct-route growth-stop adoption, and never destroys uncommitted data.

2. **Refreshing `trackingRef(repo)` before first allocation**
   - **Option A (Fetch `<remote> <default_branch>` before `ensureWorktree` when `leaf.state.worktree === undefined`):** Run `git fetch <remote> <default_branch>` (or `git fetch <remote>`) in `dispatchLeaf` / `ensureWorktree` on first allocation; fail (or warn and fall back? Fail on `mustCreate`, matching `checkBase(repo, true)`) so `trackingRef(repo)` actually holds dependencies that just merged remotely.
     - *Breaks/invites:* Adds one network fetch per *new* leaf start (not on resumes); offline test repos with local bare remotes fetch in milliseconds.
   - **Option B (Do not fetch; use existing local `trackingRef(repo)`):**
     - *Breaks/invites:* Even a brand-new slug starts behind `origin/main` if a prerequisite merged via direct push or another host and no `mergeTurn` fetched in between.
   - **Pick:** **Option A** — `dispatchLeaf:817` already makes a network `git ls-remote` call on creation; fetching `trackingRef` on first allocation guarantees the tracking ref is current, not just reachable. (Also note: `mustCreate` at `src/next.ts:816` currently checks `!existsSync(path)`; change it to `leaf.state.worktree === undefined` so a reused path also gets remote proof + fresh tracking ref!)

### 2.3 Practitioner questions & lifetime pitfalls
- **Questions:**
  - When an existing worktree is reused on first allocation (`existsSync(path)`), is its sparse-checkout still configured (`/*`, `!/issues/`)? If someone created it without sparse-checkout, should `ensureWorktree` verify/apply sparse-checkout too?
  - What about `akrogon seat <slug> A` (`src/next.ts:seatCommand:1292`), which also calls `allocate` → `ensureWorktree` without calling `checkBase` first? Putting the freshness check inside `ensureWorktree` covers BOTH `dispatchLeaf` and `seatCommand`!
  - What if a stale worktree has *untracked* files (not just modified tracked files)? `git status --porcelain` reports untracked non-ignored files (`??`), so Option A refuses those too — while `.env` (gitignored per `writeLeafEnv:323`) does not trigger a false refusal.
  - Has Need N1 (`signposts.md` `## Needs`: commit `learnings/LESSONS.md` line + `learnings/history/2026-11-24-leaf-worktree-stale-base.md` to `origin/main`) landed before handoff? Without it, the leaf cannot retire the lesson line in its diff.
- **Pitfalls & removals:**
  - *Touching an active leaf on resume:* If the reset/refusal ran whenever `existsSync(path)`, resuming a leaf in `implement` (which is behind `origin/main` or has uncommitted work) would fail or wipe it. Remove by gating strictly on `leaf.state.worktree === undefined`.
  - *Forgetting the branch-only case (no worktree dir, stale `refs/heads/<slug>`):* `ensureWorktree:296` checks out existing `refs/heads/<slug>` when the dir is missing. Remove by checking `0 own commits` on `refs/heads/<slug>` in the `!existsSync(path)` branch too, advancing it to `trackingRef(repo)` before `createSparseWorktree` (or `git branch -f <slug> <trackingRef>` when 0 commits ahead).
  - *Ignoring a pre-existing locked worktree:* A direct-route worktree is `git worktree add --lock`. If a direct attempt is still locked and shares the slug, `ensureWorktree` should refuse a locked worktree (or let git fail clearly). Remove by checking `registeredWorktrees` lock state on first allocation if `existsSync(path)`.

### 2.4 Leaves & dependencies
- **Smallest set:** **1 leaf in `akrogon`** (update `ensureWorktree` + first-allocation fetch in `src/next.ts`, retire `learnings/history/2026-11-24-leaf-worktree-stale-base.md` line from `learnings/LESSONS.md`).
- **Dependencies:** Depends on **Need N1** (operator commits the uncommitted lesson files to `origin/main` before handoff). No code dependency on `#157`, `#155`, `#154`; should land before `#153` (`direct-visible`) so direct-route leaf creation uses the updated `ensureWorktree`.

### 2.5 Pre-handoff observations needed
1. Confirm Need N1 is on `origin/main` (`git log origin/main --oneline -- learnings/history/2026-11-24-leaf-worktree-stale-base.md`).
2. Verify in a temp git repo that `git -C <wt> merge --ff-only <trackingRef>` (or `git update-ref` + `git checkout`) preserves sparse-checkout rules (`/*`, `!/issues/`) and leaves a gitignored `.env` untouched while `git status --porcelain` stays empty.

---

## 3. `run-check-display` (Tamdoma/akrogon#155)

### 3.1 Mechanism today
- **Confirmed, plus three additional env-forwarding boundaries the seed did not inspect:**
  1. **`src/run-check.ts:constructedEnv` (`src/run-check.ts:49-85`):** Copies only `copied = ['HOME', 'PATH', 'XDG_CACHE_HOME', 'FAKE_SYSTEMD_RUN_LOG', 'AKROGON_HOME']`, sets `LANG = 'C.UTF-8'`, copies `repo.config.env` + `repo.config.pass_env`, cuts `DBUS_SESSION_BUS_ADDRESS = 'unix:path=/nonexistent'`, and sets `TMPDIR` + `BUN_RUNTIME_TRANSPILER_CACHE_PATH`. With Himne's `pass_env: []`, `DISPLAY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`, and `XAUTHORITY` are all dropped.
  2. **`src/scope.ts:runUnitArgv` (`src/scope.ts:48-81`, called at `src/run-check.ts:436`):** For held runs, `run-check` passes the real `XDG_RUNTIME_DIR` to `systemd-run` so it can reach the user manager, and then `runUnitArgv` explicitly runs `env -u XDG_RUNTIME_DIR` inside the scope whenever `env.XDG_RUNTIME_DIR === undefined`! Thus `XDG_RUNTIME_DIR` is actively stripped unless `constructedEnv` includes it.
  3. **`src/verify.ts:passForwarded` (`src/verify.ts:906-925`) and `src/land.ts:launchLand` (`src/land.ts:28-63`):** `akrogon verify` runs in a transient `systemd-run --user` service forwarding `passForwarded` (has `XDG_RUNTIME_DIR`, lacks `DISPLAY`, `WAYLAND_DISPLAY`, `XAUTHORITY`) plus `repo.config.env`/`pass_env`. `launchLand` sets `XDG_RUNTIME_DIR` only, not `DISPLAY`/`WAYLAND_DISPLAY`/`XAUTHORITY`. On this host, `systemctl --user show-environment` currently holds `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000`, so transient services accidentally inherit the desktop session's display today — but a caller using a different `DISPLAY` (e.g. Xvfb) or a host without manager-imported display vars would lose it in `verify`/`land`.
  4. **Existing repo config compatibility (`src/config.ts:repoSchema:110-137`):** `tamdoma/framework/issues/config.yaml` already declares `pass_env: [DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR]`. Adding these names to `copied` (not to `constructed` reserved names in `src/config.ts:110`) preserves backward compatibility with `framework` and any other repo that already lists them in `pass_env`.

### 3.2 Material forks

1. **Which display variables `constructedEnv` copies by default**
   - **Option A (`DISPLAY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`, `XAUTHORITY` in `copied`):** Copy all four whenever set in the caller's environment; also add `DISPLAY`, `WAYLAND_DISPLAY`, `XAUTHORITY` to `src/verify.ts:passForwarded` (which already has `XDG_RUNTIME_DIR`) and forward them in `src/land.ts:launchLand` when present.
     - *Breaks/invites:* Exposes `XDG_RUNTIME_DIR` to every `run-check` child by default (note: `DBUS_SESSION_BUS_ADDRESS` stays cut to `unix:path=/nonexistent`, and `/run/user/<uid>` was already accessible by literal path under the same UID). Any existing akrogon test asserting `XDG_RUNTIME_DIR` is unset inside a run-check child will need inspection/update (and `runUnitArgv`'s `-u XDG_RUNTIME_DIR` path must remain tested when the caller itself lacks `XDG_RUNTIME_DIR`).
   - **Option B (`DISPLAY`, `WAYLAND_DISPLAY`, `XAUTHORITY` only — omit `XDG_RUNTIME_DIR`):**
     - *Breaks/invites:* Native Wayland browsers (`ELECTRON_OZONE_PLATFORM_HINT=wayland` is set on this host!) cannot reach `$XDG_RUNTIME_DIR/$WAYLAND_DISPLAY`, and Chromium/Playwright may still fail or degrade without `XDG_RUNTIME_DIR` (both Himne logs passed `XDG_RUNTIME_DIR=/run/user/1000` alongside `DISPLAY=:0`).
   - **Option C (Copy `XDG_RUNTIME_DIR` only when `DISPLAY` or `WAYLAND_DISPLAY` is set):**
     - *Breaks/invites:* Subtle conditional env rule; harder to explain and test than a flat `copied` list, with minimal isolation gain since desktop sessions always have `DISPLAY`/`WAYLAND_DISPLAY` set anyway.
   - **Pick:** **Option A** — matches the exact tuple `framework` already relies on plus `XAUTHORITY` for Xauth-protected displays, works uniformly for X11/XWayland and native Wayland, and keeps `src/config.ts:constructed` untouched so existing `pass_env` entries stay valid.

2. **Desktop toolkit / Ozone variables (e.g. `ELECTRON_OZONE_PLATFORM_HINT`, `GDK_BACKEND`, `QT_QPA_PLATFORM`)**
   - **Option A (Do not copy toolkit-specific hints by default):** Keep `copied` minimal to display-server connection vars (`DISPLAY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`, `XAUTHORITY`); toolkit hints stay opt-in via `pass_env`.
     - *Breaks/invites:* Clean and predictable across browsers/toolkits; avoids leaking HiDPI/IME/Wayland quirks (`GDK_SCALE=2`, `QT_IM_MODULE=fcitx`) into screenshot or layout assertions.
   - **Option B (Also copy `XDG_SESSION_TYPE`, `ELECTRON_OZONE_PLATFORM_HINT`, etc.):**
     - *Breaks/invites:* Leaks host-specific scaling/IME/platform hints into test runs, making visual/layout tests host-dependent.
   - **Pick:** **Option A** — pass only the display-server connection variables.

### 3.3 Practitioner questions & lifetime pitfalls
- **Questions:**
  - Does `npx playwright test ... --headed` on this host (`DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000`) succeed with `DISPLAY` + `WAYLAND_DISPLAY` + `XDG_RUNTIME_DIR` + `XAUTHORITY` copied and `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`?
  - Do any existing akrogon tests (e.g. `tests/run-check.test.ts`, `tests/scope.test.ts`, `tests/hc*.test.ts`) assert that `XDG_RUNTIME_DIR` is unset under `run-check`, or accidentally discover live `/run/user/1000/herdr-core` sockets if `XDG_RUNTIME_DIR` passes through?
  - Notice `learnings/LESSONS.md` line 60 (`run-check drops DISPLAY`) is on main, while `learnings/history/2026-11-24-run-check-drops-display.md` has uncommitted additions in the working tree: should those additions be committed with N1 before handoff so the leaf cleanly retires the lesson line?
- **Pitfalls & removals:**
  - *Breaking repos that already put `DISPLAY` in `pass_env`:* Adding display vars to `src/config.ts:constructed` would reject `framework/issues/config.yaml`. Remove by keeping them in `copied` only, never `constructed`.
  - *`run-check` passing `XDG_RUNTIME_DIR` while `verify` or `land` drops `DISPLAY`:* Headed tests pass in leaf `run-check` and fail at merge `verify`. Remove by mirroring the display vars in `src/verify.ts:passForwarded` and `src/land.ts:launchLand`.
  - *Nested `akrogon` tests discovering real host `hc` sockets via inherited `XDG_RUNTIME_DIR`:* Check the akrogon test suite under `akrogon run-check` — any test calling `hc` must already set its own scratch `XDG_RUNTIME_DIR`, or a bug there surfaces immediately in `bun test`.

### 3.4 Leaves & dependencies
- **Smallest set:** **1 leaf in `akrogon`** (extend `copied` in `src/run-check.ts`, `passForwarded` in `src/verify.ts`, `launchLand` in `src/land.ts`, update docs, retire `learnings/history/2026-11-24-run-check-drops-display.md` line from `learnings/LESSONS.md`).
- **Dependencies:** Independent of the other 4 charts.

### 3.5 Pre-handoff observations needed
1. **Real headed browser probe under `run-check`:** Verify in Himne (or a minimal Playwright `--headed` invocation) with `pass_env: []` that copying `DISPLAY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`, `XAUTHORITY` (with `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`) opens a visible browser window and passes, and check whether `WAYLAND_DISPLAY` without `XDG_RUNTIME_DIR` fails or works.
2. **Existing test-suite check:** Grep `tests/` for `XDG_RUNTIME_DIR` and `constructedEnv` to confirm whether any test asserts `XDG_RUNTIME_DIR` is stripped by default.

---

## 4. `merge-test-facts` (Tamdoma/akrogon#154)

### 4.1 Mechanism today
- **Confirmed, with a critical scale constraint found in live framework records:**
  1. **Log deletion at owner close (`src/phase.ts:completeOwner:402`, commit `b9fe5027`):** Deletes every `*.log` under the completing owner before moving to `issues/closed`, writing no `evidence.tar.zst`.
  2. **What survives on `issues/verify-runs.jsonl` (`src/verify.ts:verifyRunSchema:58-99`, `commandRow:657-691`):** Uses `z.strictObject` on both row and `commands[]` and `rerun`. Stores only `failures?: string[]` from `src/flaky.ts:failureNames(first.output)` (`src/flaky.ts:27-49`), which matches only `(fail)` titles and `Exited with code <n>` lines. It discards both:
     - **Timeout lines:** Verified in archived framework log `one-gate-path/evidence.tar.zst` (`check-verify-1795361945654-324662.log`): Bun prints two distinct timeout lines immediately after the `(fail)` line on the **same stream prefix**:
       - `  ^ this test timed out after 300000ms.` (after `(fail) <title> [310599.01ms]`)
       - `  ^ a beforeEach/afterEach hook timed out for this test.` (after `(fail) (unnamed) [30812.86ms]`)
     - **Durations:** Every `(pass)` / `(fail)` line carries `[<N>ms]` (or `[<N>s]`), and file headers appear as `<prefix> | <path>.test.ts:`.
  3. **Measured scale constraint (live framework data):**
     - `framework/issues/verify-runs.jsonl` already has **3,636 rows** (1,559 merge rows), and **every `verify` run reads, JSON-parses, Zod-validates, and rewrites the entire file** (`src/verify.ts:805,880`), while `akrogon status` parses the entire file (`src/status.ts:118`).
     - A single framework merge verify log (`one-gate-path`) contains **11,568 individual test lines** across **772 test files** (`>= 100ms`: 3,503 tests; `>= 500ms`: 1,555; `>= 1000ms`: 953; `>= 5000ms`: 212; files `>= 1000ms`: 322; files `>= 5000ms`: 161).
     - Storing all 11,568 per-test durations per row would add **~1 MB per merge row** (~1.5 GB per 1,500 merges), breaking `verify-runs.jsonl` rewrite and `akrogon status` latency!
  4. **Missing attempt-to-verify join (`src/attempts.ts:attemptRecordSchema:28-45`, `src/land.ts`, `src/phase.ts`, `src/next.ts`):**
     - `attemptRecordSchema` has no verify run id field.
     - `appendAttempt` is called from **six** sites: `src/land.ts:repairExit:96`, `keepPlace:115`, `commandFailed:133`; `src/phase.ts:batchPush:822`, `finishPush:905`; `src/next.ts:reconcileBatch:1011,1016`, `mergeTurn:1087`, `mergeTurnExit:1193`.
     - Notably, `PassRecord` (`src/verify.ts:1029`) *already* carries `caller.attempt` from `state.batch.attempt`, yet `runOnce` never writes `attempt` onto the `verify-runs.jsonl` row! And `state.batch` (`src/state.ts:batchSchema`) never persists verify run ids, so a crashed land recovered by `reconcileBatch` loses any in-memory run id.

### 4.2 Material forks

1. **Timeout representation on `verify-runs.jsonl` command rows**
   - **Option A (Add optional `timeouts?: string[]` on `commands[]` and `commands[].rerun`):** Deduplicated list of failing test names (using the exact same naming rules as `failures`) whose `(fail)` line was followed on the same stream prefix by a Bun test-timeout or hook-timeout line.
     - *Breaks/invites:* Zero breakage to existing readers of `failures` (`flaky.ts`, `verify.ts:knownRedReceipt`, `uncoveredMainRedUnits`, `newRedUnits`). Minor edge case: if two `(unnamed)` tests in the same script fail — one assertion, one hook timeout — both map to `(unnamed) <script>`, so `timeouts` proves at least one `(unnamed) <script>` timed out (cannot distinguish counts of identically-named unnamed tests without a count/object shape).
   - **Option B (Replace `failures: string[]` with structured `{ test, timeout?: boolean }[]`):**
     - *Breaks/invites:* Churns every existing reader and needs a union schema for old rows.
   - **Pick:** **Option A** — smallest additive optional field on `commands[]` and `commands[].rerun`, old rows keep parsing (Signposts 3a, 6a).

2. **Test duration granularity & size bound on `verify-runs.jsonl`**
   - **Option A (All per-test durations in `verify-runs.jsonl`):**
     - *Breaks/invites:* ~1 MB/row on framework; ruins `verify-runs.jsonl` full-file rewrite (`src/verify.ts:880`) and `akrogon status` (`src/status.ts:118`). Unviable.
   - **Option B (Per-file total ms in `files?: Record<string, number>` for merge-scope commands, e.g. rounded integer ms, plus failing tests' ms or slow-test threshold):**
     - Look closely at the censoring trap! The seed (`#154`) specifically cites `capture-review.test.ts` dropping from 88–169s at merge to **3.3s** alone. A high threshold (like `>= 5s` or top-50) would **censor `capture-review.test.ts` as soon as it gets fixed** so its post-fix median disappears!
     - Recording **per-file total ms** (all test files that ran, or files `>= 500ms`) in a compact `Record<string, number>` on `commands[]` (merge scope only, excluding `compares` or including `compares` for base comparison!) costs ~20–30 KB/row for all 772 files (or ~15 KB/row for files `>= 500ms` — never censoring a 3.3s file!).
     - What if a question asks about one specific *test* inside a multi-test file? Adding an optional `slow_tests?: Record<string, number>` (e.g. individual tests `>= 2000ms` or `>= 5000ms`, ~212 entries = ~12 KB at `>= 5s`, plus all failing tests' durations) gives per-test visibility for every slow/failing test without storing 11,000 sub-second tests.
   - **Option C (Per-file durations for every file `>= 500ms` or all files, stored on `commands[]` for merge-scope runs only, no per-test map except `failure_ms` or slow tests `>= 5000ms`):**
     - *Wait — check growth over time:* Even 35 KB/row × 1,500 merge runs = 52 MB in a single JSONL file that `akrogon status` parses on every invocation! Keep the row compact (e.g. files `>= 1000ms` ≈ 322 entries ≈ 16 KB, or top/thresholded `files` + `test_ms` for failing tests) OR consider whether `status.ts:118` only reads the tail for `slow` (a cheap optimization if needed, though still bounded by `verify.ts` full rewrite).
   - **Pick:** **Option B/C hybrid — on merge-scope `commands[]` (and `rerun`), store compact optional `files?: Record<string, number>` (integer ms per test file `>= 500ms`, or all files if total file count is modest) + `timeouts?: string[]`, and optionally `slow_tests?: Record<string, number>` for tests `>= 5000ms` (plus all failing tests).** Measure exact byte size on `one-gate-path` before locking the threshold at charting so `verify-runs.jsonl` stays well under ~20–30 KB per merge row and never censors 1–5s post-fix medians like `capture-review.test.ts` (3.3s).

3. **Joining `merge-attempts.jsonl` to `verify-runs.jsonl`**
   - **Option A (Bidirectional join: `verify_runs?: string[]` on `attemptRecordSchema` + `attempt?: string` on `verifyRunSchema`):**
     - Persist each verify run id returned during `landAttempt` onto `state.batch` (e.g. `verify_runs?: string[]` in `src/state.ts:batchSchema`) before push/exit so even a crashed land recovered by `src/next.ts:reconcileBatch` writes the join!
     - Write `attempt?: string` on `verifyRunSchema` (`src/verify.ts:runOnce`) from `record.caller.attempt` (already present in `PassRecord`!).
     - *Pros:* Handles single verify, restack retries (multiple head runs), taken-8 `--known-red` (head + base run), receipt reuse (where the reused receipt carries an older attempt id, so `attemptRecord.verify_runs` still points to it!), and mid-verify crash recovery (`verify-runs.jsonl` already has `attempt` stamped at start before checkout!).
     - *Cons:* Two tiny optional fields instead of one; older akrogon binaries cannot parse `verify-runs.jsonl` rows with `attempt` (`verifyRunSchema` is `z.strictObject` — note `src/AREA.md` already documents this for every `verify-runs.jsonl` addition; deploy order handles it).
   - **Option B (`verify_run?: string` on `attemptRecordSchema` only):**
     - *Breaks/invites:* Drops earlier runs on restack retries, drops base verdict runs, and fails to join if `land` dies mid-verify before `verify()` returns.
   - **Pick:** **Option A** — guarantees 100% joinability across normal merges, red exits, restacks, `--known-red`, receipt reuse, and crash recovery.

### 4.3 Practitioner questions & lifetime pitfalls
- **Questions:**
  - In `bun run framework:verify`, `hooks:selftest` runs multiple `.test.ts` files concurrently or sequentially under one stream prefix (`hooks:selftest |`). Does Bun interleave `(pass)` lines from two `.test.ts` files under the *same* stream prefix (making stateful "last seen file header per stream" attribution wrong)? **MUST PROBE before handoff!**
  - What about non-Bun runners (e.g. Vitest in Himne)? Should the parser stay Bun-first and simply omit `timeouts`/`files` when a command emits no matching lines? (Yes — omitting empty fields keeps non-Bun repos clean and zero-overhead.)
  - When `akrogon verify` runs a `rerun` (`src/verify.ts:commandRow:673-690`), should both the top-level command row (rerun result) and `rerun` (first-run result) carry `timeouts` and duration summaries? (Yes — the first run is where the load timeout happened!)
  - In `one-gate-path`, `capture-review.test.ts` appeared once as a file header and also `Ran N tests` summaries appeared; does Bun print per-file wall time, or must file time be summed from its test lines (which over-counts if tests in one file run concurrently)?
- **Pitfalls & removals:**
  - *Interleaved multi-stream timeout misattribution:* `bun run framework:verify` runs parallel scripts whose lines interleave. A naive regex checking "previous line in file" binds a timeout to the wrong stream's `(fail)`! Remove by tracking the last `(fail)` entry **per stream prefix tuple** (reusing `chain()` from `src/flaky.ts:16`).
  - *Duplicate `(fail)` lines in Bun's end-of-run failure summary:* Notice in `one-gate-path`, Bun prints `(fail) <name> [310599.01ms]` ONCE during execution AND AGAIN in the `N tests failed:` summary block at the end! Summing durations naively double-counts failing tests (observed in our probe: `341082ms` and `310599ms` each appeared twice!). Remove by deduplicating per `(stream, test)` or stopping test-duration accumulation at the `N tests failed:` / `N pass` summary boundary.
  - *`verify-runs.jsonl` bloat slowing `akrogon status` and `verify`:* `verify.ts:805` parses and rewrites the whole file under lock. Remove by bounding stored durations (file-level and/or thresholded slow tests, merge-scope only) and verifying serialized row size on real `framework` logs.
  - *`reconcileBatch` missing `verify_runs` after a killed land unit:* Remove by persisting run ids on `state.batch` immediately after `verify()` returns AND stamping `attempt` on the `verify-runs.jsonl` row at `runOnce` start.
  - *Missing `mergeTurnExit` / `keepPlace` / `commandFailed` call sites:* Audit all 6 `appendAttempt` callers (`src/land.ts`, `src/phase.ts`, `src/next.ts`) so every path passes the same batch `verify_runs` (omitted when empty, as in pre-verify conflict exits).

### 4.4 Leaves & dependencies
- **Smallest set:** **1 leaf in `akrogon`** (parser for Bun timeouts + bounded durations in `src/flaky.ts` / `src/verify.ts`, schema extensions on `verifyRunSchema`, `batchSchema`, `attemptRecordSchema`, wiring across `land.ts`/`phase.ts`/`next.ts`).
- **Dependencies:** Independent of `#157`, `#156`, `#155`. Should land before `#153` (`direct-visible`) to avoid merge churn in `src/state.ts`, `src/phase.ts`, `src/next.ts` and so direct-route merges inherit these facts automatically.

### 4.5 Pre-handoff observations needed
1. **Bun output interleaving & summary probe:** Inspect 2–3 archived `framework` `check-verify-*.log` files (including `one-gate-path`) to verify: (a) whether `bun test --parallel` interleaves tests from different `.test.ts` files under the same stream prefix (breaking stateful file-header tracking!), (b) every timeout phrasing Bun emits (`this test timed out`, `beforeEach/afterEach hook timed out`, `beforeAll/afterAll`), and (c) exact summary markers (`N tests failed:`) to prevent double-counting.
2. **Size & parse benchmark:** Compute serialized JSON byte size per merge row for candidate duration shapes against `one-gate-path` and time `readVerifyRuns` on `framework/issues/verify-runs.jsonl` (3,636 rows) + projected 1,500 new rows.
3. **Audit the 7-of-73 unjoinable attempts** in `framework/issues/merge-attempts.jsonl` to confirm every cause (crashed land, pre-verify conflict, code-2 verify, receipt reuse) is closed by bidirectional `attempt` + `verify_runs`.

---

## 5. `direct-visible` (Tamdoma/akrogon#153)

### 5.1 Mechanism today
- **Visibility confirmed; broadcast mechanism is prose-only (untracked by the command):**
  1. **Why direct work is invisible in `akrogon status`:** By design (`skills/chart-issues/SKILL.md` `## Direct route`, `skills/chart-issues/assets/direct-route.md`, `docs/use/quick-fix.md` `## What it skips and what it keeps`), direct route writes **no leaf folder and no `state.yaml`**. Progress lives only in `<chart>/direct/{plan.md,report.md}`, `<chart>/slots/review-B-<n>.md`, and `CHART.md` `## Direct attempt`. `src/status.ts` builds the leaf table and `status --json` `leaves` strictly from `repoInventory(repo, ['open', 'closed'])` (`src/status.ts:88-101,254-279`), while charts get only `CHART, TAKEN, FOG, STAGE, AGE` (`src/status.ts:379,476-492`).
  2. **Why direct broadcast differs from lifecycle broadcast:** Lifecycle merges (`src/phase.ts:commandMerged:348-357`, `src/next.ts:broadcastPass:1201-1229`, `src/state.ts:broadcastPending:176-178`) persist `state.broadcast`, show `broadcast pending` in `akrogon status`, hold cleanup until broadcast is prompted, and dispatch `broadcast-issue` automatically. Direct route (`skills/chart-issues/assets/direct-route.md` step 7) relies solely on the door remembering to invoke `broadcast-issue` in prose, with no `state.broadcast`, no `status` visibility, and no retry/pending marker.
  3. **Live terminal label mismatch discovered on `t126` and `t3k7`:** `hc get --json t126` (door A) has **no** `akrogon=1` or `akrogon.leaf` labels; `hc get --json t3k7` (consultant C) has `akrogon=1, akrogon.repo=akrogon, akrogon.seat=c` and **no** `akrogon.leaf`. Meanwhile `src/reconcile.ts:leafSeats` (`src/reconcile.ts:402-416`) filters by `akrogon.leaf=<slug>`, and `src/reconcile.ts:closeTabOf` (`src/reconcile.ts:732-746`) + `closeMergedTab` (`src/reconcile.ts:432-443`) kill recorded seats and **close `state.tab`** via `tabLive(panes, state.tab)` when a leaf merges!

### 5.2 Material forks

1. **Tracking representation: real lifecycle leaf with a `direct` field vs chart-local state file**
   - **Option A (Real leaf under `issues/open/<chart>/<slug>/` with an optional `direct` field on `state.yaml`):**
     - At direct attempt start, create a real leaf folder `issues/open/<chart>/<slug>/` (`ISSUE.md` with `slots:` front matter for door A and the chosen reviewer slot, `brief.md`, `design.md`, `readiness.yaml`, `state.yaml` starting at `phase: 'implement'` with e.g. `direct: { chart: '<chart-slug>' }`, `tab: <door-tab>`, `seat: { A: <door-ref>, B: <reviewer-ref> }`, `worktree: <store>/<slug>`).
     - *What comes for free:* `akrogon status`, `status <slug>`, `status --json`, `run-check` (`leafTarget` auto-matches `state.worktree`, no `--holder` needed!), `verify`, `lineRuns()`, `phase` (`moveGuards`, `log.jsonl`, `timings.jsonl`), `mergeQueue`, `land`, `completeOwner` (source closing + log deletion + move to `issues/closed`), and `broadcastPending`!
     - *What it could break if unguarded:*
       1. **`src/reconcile.ts` killing the door or closing the door's tab:** `closeLeaf`, `closeMergedTab`, `endSeats`, and `stopSlice` MUST skip closing `state.tab` and skip ending `state.seat.A`/`B` when `state.direct !== undefined` (cleanup still removes the direct worktree and branch after merge!).
       2. **`src/next.ts:dispatchLeaf` / `dispatchSlot` / `allocate`:** MUST NOT open a new tab or launch new seat A/B terminals for a `direct` leaf (only `observeBusy` on the recorded door/reviewer terminals when active in the relevant phase, or skip `dispatchSlot` for non-merge phases because the door orchestrates A and reviewer B in its own tab!).
       3. **`src/next.ts:renameTabs` (`src/next.ts:1330`) & `src/status.ts:unnamedTabs` (`src/status.ts:709`):** MUST NOT rename the door's tab to `<slug>` or warn `tab unnamed`!
       4. **`src/stop.ts:stopLeaf` (`src/stop.ts:64`):** MUST NOT kill the door's terminal or slice if someone runs `akrogon stop <direct-slug>`.
   - **Option B (Chart-local state file `issues/chart/<chart>/direct/state.yaml`, read by `src/status.ts`):**
     - *Breaks/invites:* Violates Signpost 3a (new record kind), duplicates status table/JSON/timing/run-line/broadcast logic, leaves direct work outside `mergeQueue` (so direct pushes can race `akrogon land`), and guarantees future drift between direct and lifecycle leaves.
   - **Pick:** **Option A** — maximum reuse and literal lifecycle parity ("tracked like a lifecycle leaf", "`akrogon status` shows it exactly like a lifecycle leaf", "broadcasts on landing like a lifecycle leaf"), strictly respecting Signposts 3a and 6a, with explicit `state.direct` guards on every tab/seat-lifecycle mutation (`dispatchLeaf`, `reconcile`, `renameTabs`, `unnamedTabs`, `stopLeaf`, `broadcastPass`).

2. **Phase names for direct leaves**
   - **Option A (Reuse existing lifecycle phases: `implement`, `check.review`, `check.repair`, `check.fix`, `merge`, `merged`, `failed`):** Start direct leaves at `implement` (skipping `plan.synthesis`).
     - *Breaks/invites:* Shows `implement`/`check.review`/`check.repair`/`merge` rather than the literal English word `build` from the operator's note `(build, review, repair, merge)` — which matches *"shows it exactly like a lifecycle leaf"*. Zero churn in `routing.ts`, `log.ts`, `timing-report.ts`, `status.ts`.
   - **Option B (Add new `build`/`review`/`repair` phase enum values):**
     - *Breaks/invites:* Breaks `status --json` consumers, `timing-report.ts`, `routing.ts`, and `phaseColor`; diverges from lifecycle leaves instead of matching them.
   - **Pick:** **Option A** — reuse the existing `phaseSchema` starting at `implement`.

3. **Landing and broadcasting ownership on a direct leaf**
   - **Option A (Command-owned `merge` + in-tab `broadcast`):** When the reviewer approves (`check.review` → `merge`), the direct leaf enters the repo's `mergeQueue` and `akrogon land` rebases, runs `verify`, runs `landGates`, pushes, closes sources, moves the owner to `issues/closed`, and sets `state.broadcast` (`commandMerged`). Then `broadcastPass` (recognizing `state.direct`) sends `broadcast-issue` to the recorded direct reviewer (or door A) in the door's tab — never spawning a new tab or seat — OR the door itself sends `broadcast-issue` and records broadcast ack.
     - *Breaks/invites:* Eliminates duplicated landing logic (`direct-route.md` steps 5–9 and `direct-guards.ts`), serializes direct pushes with the merge queue, and guarantees broadcast runs identically to lifecycle leaves. Nuance: if the repo is `paused`, the door triggers `akrogon next <slug>` (explicit target bypasses `isAutomatic` pause check at `src/next.ts:725,1041`!) so direct landing doesn't stall behind a repo pause. Also: if `akrogon land` runs asynchronously, the door waits on `landAlive` / phase change (`merged` or `check.repair`) before moving on to the next chart!
   - **Option B (Door runs manual rebase/verify/push/close/broadcast and only calls `akrogon phase` to flip status):**
     - *Breaks/invites:* Keeps two parallel merge engines (`src/land.ts` vs `direct-route.md`), direct pushes race `akrogon land`, `status` misses `land` job state and `mergeQueue` turn, and broadcast stays prose-driven rather than command-tracked.
   - **Pick:** **Option A** — one merge engine, one broadcast mechanism, zero duplicate landing code. For broadcast delivery specifically: when `state.direct` is set and `broadcastPending(state)` is true, `broadcastPass` sends `broadcast-issue` to `state.seat.B` (the direct reviewer, if live and idle/done, falling back to `state.seat.A` / door) without calling `startSeat` or opening a tab, and records `prompted.B` as ack — matching *"run in the charting door's current tab (not a new tab) ... broadcasts on landing like a lifecycle leaf"*.

4. **How `direct` leaf creation & phase transitions are triggered (CLI verb vs door writes)**
   - **Option A (Minimal CLI entry or `akrogon direct` / `akrogon phase` support):** Because `state.yaml` is `0o444` command-owned (`src/state.ts:217`) and `state.worktree`, `state.tab`, `state.seat`, `state.direct` must be valid hc addresses and worktree paths, provide one small command (e.g. `akrogon direct start <chart> <slug> --reviewer <addr> ...` or flags on existing setup) that validates the chart, creates the leaf folder + sparse worktree + `state.yaml` (`phase: implement`, `direct`, `tab`, `seat.A`, `seat.B`) under the global lock, and lets standard `akrogon phase`, `akrogon run-check`, `akrogon verify`, `akrogon next <slug>` drive the rest!
     - *Breaks/invites:* Adds one small command/flag surface, but prevents LLMs from hand-crafting `state.yaml` seat/tab IDs or forgetting `ISSUE.md` `slots:` front matter.
   - **Option B (Door hand-writes `state.yaml` with `direct: true` and runs `git worktree add` manually):**
     - *Breaks/invites:* Fragile hand-authored `state.yaml` with hc session/tab/seat IDs, bypasses `ensureWorktree` (reintroducing `#156` stale-base bugs on direct route!), and contradicts `shapes.md` (`state.yaml` runtime fields belong to the command).
   - **Pick:** **Option A** — one small command (or sub-mode) creates the direct leaf + worktree + recorded door/reviewer seats atomically, using `ensureWorktree` directly; everything after uses the standard lifecycle commands.

### 5.3 Practitioner questions & lifetime pitfalls
- **Questions:**
  - When the charting door (`slot A`) works on a direct leaf in `implement`, `state.seat.A` is the door terminal itself. Should `observeBusy` track `busy_since` for `A` and `B` on direct leaves (so `status` shows `busy A` / `busy B`), and should `dispatchSlot` be bypassed for `direct` leaves while `observeBusy` still runs during `next --wake`? (Yes — `observeBusy` gives live `busy A`/`busy B` in `status` without ever sending prompts to the door!)
  - `skills/chart-issues/SKILL.md` `## Direct route` currently forbids direct under autopilot, while `#153 INTAKE` observed 5 direct charts in a full-autopilot session. Does `#153` keep that eligibility rule unchanged or update it? (Keep eligibility unchanged unless explicitly opened — `#153` is about tracking/status/broadcast, not autopilot eligibility.)
  - What happens on **growth stop** (converting direct → full lifecycle)? With Option A, the leaf already lives at `issues/open/<chart>/<slug>/` with its worktree! Clearing `direct` (and moving phase to `plan.synthesis`, clearing `seat` and `tab`) seamlessly hands it to normal `akrogon next` dispatch!
  - What happens on **abandon**? Move to `failed` (or remove open folder) and clean up worktree/branch without touching the door's tab/seats.
  - What if the door has **no `slots:` model/effort** for itself (e.g. operator launched `claude` directly so `seats.yaml` has only `{ harness: claude }`)? `ISSUE.md` `slots:` schema (`src/config.ts:17`) requires `{ harness, model, effort }` non-blank. Either resolve door A's model/effort from `hc get --json <A>` `foreground.argv` / transcript or fall back to `global.slots.a` when writing `ISSUE.md`.
  - What about `status --charts` and `unpackedEntries` (`src/status.ts:436`)? Once direct runs store check logs in `issues/open/<chart>/<slug>/implementation/` and `completeOwner` deletes them at merge, `<chart>/direct/` holds no logs (legacy charts with `<chart>/direct/*.log` still work with `akrogon pack`).
- **Pitfalls & removals:**
  - **CATASTROPHIC — `reconcile` killing the charting door or closing its tab:** `src/reconcile.ts:closeMergedTab`, `closeTabOf`, `closeLeaf`, `endSeats`, `stopSlice`, and `mergedWorktree` (`tabLive(panes, tab)` / `foreignPaneInside`) all assume `state.tab` and `state.seat` belong exclusively to that leaf. Remove by gating EVERY seat/tab/slice teardown in `src/reconcile.ts` and `src/stop.ts` on `state.direct === undefined`, and adding free regression tests asserting that merging or failing a direct leaf removes its worktree/branch while leaving `state.seat.A`, `state.seat.B`, and `state.tab` untouched!
  - **`renameTabs` / `unnamedTabs` renaming the door's tab:** `src/next.ts:1330` and `src/status.ts:709` expect `state.tab` to be named `<slug>`. Remove by skipping `state.direct !== undefined` in both functions.
  - **`activeCount` / `dispatchLeaf` blocking or double-dispatching a direct leaf:** `dispatchLeaf` must never call `allocate` (new tab) or `startSeat` or `dispatchSlot` for a direct leaf's build/review/repair phases. Remove by handling `state.direct !== undefined` cleanly in `dispatchLeaf` (observe busy on recorded seats, allow `merge` / `merged` / `completeOwner`, never auto-spawn seats/tabs).
  - **Check `check.review` two-slot requirement (`src/routing.ts:37`):** For a normal leaf, `check.review` at `fix_rounds === 0` requires `['A', 'B']`, whereas on the direct route only reviewer B reviews (A just implemented it!). Either A records `--slot A --verdict ready` when handing off to B, OR `requiredSlots` returns `['B']` when `state.direct !== undefined`. Returning `['B']` for direct `check.review` (or having the direct review handoff record it) avoids a deadlocked `waiting on A` review phase!
  - **Stale `direct-guards.ts` and skill prose drift:** `skills/chart-issues/assets/direct-route.md`, `skills/chart-issues/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`, and `docs/use/quick-fix.md` all currently state *"no leaf files or state.yaml are written"* and *"--holder <chart>/direct"*. Remove by updating every affected skill/doc surface in the same leaf (per lesson `2026-09-11-stale-rule-in-docs.md`).
  - **Twin conflict if chart slug collides with an existing closed/open issue folder:** `src/turn.ts:twinConflict` (`src/turn.ts:14`) refuses `issues/open/<owner>` if `issues/closed/<owner>` exists. Verify owner folder uniqueness at direct-attempt start (same check as `shapes.md` `## Preflight and validation`).

### 5.4 Leaves & dependencies
- **Smallest set:** **1 leaf in `akrogon`** (command tracking + `state.direct` schema/guards in `state.ts`, `next.ts`, `reconcile.ts`, `phase.ts`, `status.ts`, `stop.ts`, `akrogon.ts` + direct-route skill and doc updates).
- **Dependencies:** Real benefit/dependency on **`fresh-leaf-base` (#156)** (direct worktree creation reuses `ensureWorktree`), **`seat-turn-idle` (#157)** (shared `next.ts`/`phase.ts` surfaces), and **`merge-test-facts` (#154)** (shared `state.ts`/`phase.ts`/`next.ts`, and direct merges inherit test facts). Lands last per Signpost 5a.

### 5.5 Pre-handoff observations needed
1. **Confirm `status --json` consumers:** Check whether any active `herdr-app` mod or external consumer parses `akrogon status --json` `leaves`/`charts` and verify how an extra direct leaf row renders (note: `src/install.ts` already retired the old Tasks board mod; verify no other consumer exists).
2. **Verify `hc` labels on door & consultant terminals:** We confirmed `t126` (door) lacks `akrogon=1` and `t3k7` (consultant) lacks `akrogon.leaf`, while both carry `herdr.space` and `herdr.tab`. Verify `hc get --json <addr>` by direct address works for both door A and consultant B/C/D in `observeBusy` and `broadcastPass`.
3. **Verify `broadcast-issue` live config surface (read-only):** Confirm `~/.config/akrogon/env` exists and lists key names matching `akrogon/issues/config.yaml` (`DISCORD_WEBHOOK_URL`, `DISCORD_WEBHOOK_URL_2`) without printing values or sending a message, to verify whether the `#148` broadcast doubt was a missing env key or a missed prose step.

---

## Cross-Chart Summary & Ordering

| Order | Chart | Seed | Leaves | Shared Code Surfaces | External / Pre-handoff Blockers |
|---|---|---|---|---|---|
| 1 | `seat-turn-idle` | `#157` | 1 | `next.ts`, `phase.ts`, `hc.ts`, `seat.ts`, `reconcile.ts` | Probe `hc 0.1.22` bg-shell status/events + keep-recovery `argv` + resting harness cgroups (may surface companion `herdr-core` need) |
| 2 | `fresh-leaf-base` | `#156` | 1 | `next.ts`, `preflight.ts`, `learnings/LESSONS.md` | Need N1 committed on `origin/main` before handoff |
| 3 | `run-check-display` | `#155` | 1 | `run-check.ts`, `verify.ts`, `land.ts`, `learnings/LESSONS.md` | Real headed browser probe under `run-check`; check `tests/` for `XDG_RUNTIME_DIR` assertions |
| 4 | `merge-test-facts` | `#154` | 1 | `flaky.ts`, `verify.ts`, `attempts.ts`, `state.ts`, `land.ts`, `phase.ts`, `next.ts` | Probe Bun `--parallel` file-header interleaving + timeout formats + JSONL row size on real `framework` logs |
| 5 | `direct-visible` | `#153` | 1 | `state.ts`, `next.ts`, `reconcile.ts`, `phase.ts`, `status.ts`, `stop.ts`, `akrogon.ts`, `skills/*`, `docs/*` | Benefits from `#157`, `#156`, `#154` landing first; verify `status --json` consumers & `broadcast` env key names |

Total: **5 leaves (one per chart)**.
