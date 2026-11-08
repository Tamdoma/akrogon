# Leaf Final Check — Slot E

## Confirmation of Prior K Items

- **K1 (`prefixes:` optional in `deploy-listener-ready`, required for dispatch in `engine-on-hc`):** Applied cleanly in `deploy-listener-ready` (`brief.md:10,23`, `design.md:109,116,121`) and `engine-on-hc` (`brief.md:15,33`, `design.md:243,259`).
- **K4 (`readiness.yaml` file inputs for `herdr-setup` artifacts):** Applied cleanly in `chart-door-on-hc/readiness.yaml:1-9` (`herdr-consultant-column`) and `notices-on-hc/readiness.yaml:1-9` (`mods/session-status/notices.js`). All 10 `readiness.yaml` files pass `readReadiness()` schema validation in `src/readiness.ts`.
- **K5 (live-run criteria session counts and `chart-usage.ts` / `peer-*.ts` scope):** Applied in `chart-door-on-hc/brief.md:7,10,22-26`, `chart-door-on-hc/design.md:204`, and `watcher-on-hc/brief.md:22-23`. (See Item 4 below for stale criterion numbers in `chart-door-on-hc/design.md:196-198`.)
- **K7 (`src/shell.ts` helper exports across leaves):** Applied cleanly across `engine-on-hc`, `watcher-on-hc`, `notices-on-hc`, and `herdr-sweep`.
- **K8 (`docs/reference/commands.md` and `tests/command-reference.test.ts`):** Applied cleanly in `engine-on-hc` and `notices-on-hc`.

---

## Remaining Disagreements

### 1. `update-check` rests on an unrun proof `limits:` entry (`shapes.md:371`) and conflates `/proc/<pid>/exe` targets / symlink dereferencing

- **Leaf:** `herdr-setup/herdr-app/update-check` (and `issues/chart/herdr-app/forks/proofs.md`)
- **File & line:**
  - `issues/chart/herdr-app/slots/handoff/herdr-setup/herdr-app/update-check/readiness.yaml:14`
  - `issues/chart/herdr-app/slots/handoff/herdr-setup/herdr-app/update-check/brief.md:8,21-22`
  - `issues/chart/herdr-app/slots/handoff/herdr-setup/herdr-app/update-check/design.md:66`
  - `issues/chart/herdr-app/forks/proofs.md:61-65`
- **Problem:**
  1. **Handoff blocker (`shapes.md:371`):** `update-check/readiness.yaml:14` has a single proof (`P9`, `hc --version && herdr-core --version`) whose `limits:` is `clone diff and loaded-build observation not run`. Done-criteria 1 and 2 (`brief.md:21-22`) require live-run verification of clone diff, `hc server status --json`, and `/proc/<pid>/exe`. Under `shapes.md:371` (*"The door checks each criterion against the leaf's `proofs` entries and refuses the handoff when one rests only on a proof's `limits` or on no proof"*), `update-check` cannot be handed off until the loaded-build and clone-diff observation is recorded as a proof rather than listed in `limits:`.
  2. **Symlink dereferencing and process target split (`design.md:66`, `brief.md:8`):** `design.md:66` specifies `/proc/<pid>/exe of the running herdr-app process (its inode and mtime, or (deleted) suffix, compared with ~/.local/bin/herdr-app and ~/.local/bin/herdr-core)`.
     - `/home/ivan/.local/bin/herdr-app` is a **symlink** to `/home/ivan/.local/share/herdr-app/herdr-app` (`stat` without `-L` reports symlink inode `540995863`; `stat -L` reports target ELF inode `574043300`, matching `/proc/<app_pid>/exe`). Without `-L` / `readlink -f`, `herdr-app` will always appear mismatched.
     - `herdr-app` (found via `pgrep -x herdr-app`) and the session's `herdr-core` (whose PID is `.pid` in `HC_SESSION=<name> hc server status --json`) are two separate processes with two separate binaries (`~/.local/bin/herdr-app` vs `~/.local/bin/herdr-core`). Comparing `herdr-app`'s `/proc/<pid>/exe` against `~/.local/bin/herdr-core` always mismatches.
- **Evidence:**
  Live read-only observation on this machine (`2026-11-07`):
  - `HC_SESSION=infra hc server status --json` -> `{"pid":933463,"version":"0.1.18",...}`; `readlink /proc/933463/exe` -> `/home/ivan/.local/bin/herdr-core`; `stat -L -c '%i %Y' /home/ivan/.local/bin/herdr-core /proc/933463/exe` -> both `576798075 1793864378` (current).
  - `HC_SESSION=default hc server status --json` -> `{"pid":1255717,"version":"0.1.17",...}`; `readlink /proc/1255717/exe` -> `/home/ivan/.local/bin/herdr-core (deleted)`; `stat -L -c '%i %Y' /proc/1255717/exe` -> `549728152 1793630798` (lagging core detected by both `.version` and `/proc/<core_pid>/exe`).
  - `pgrep -x herdr-app` -> `933008`; `readlink /proc/933008/exe` -> `/home/ivan/.local/share/herdr-app/herdr-app`; `stat -L -c '%i %Y' /home/ivan/.local/bin/herdr-app /proc/933008/exe` -> both `574043300 1793803224` (whereas `stat -c '%i %Y' /home/ivan/.local/bin/herdr-app` without `-L` is `540995863 1793309058`).
- **Fix:**
  1. Record the live loaded-build observation above in `forks/proofs.md` (either updating P9 or adding P13) and in `update-check/readiness.yaml` so `limits:` no longer says `loaded-build observation not run`.
  2. In `update-check/brief.md:8` and `update-check/design.md:66`, specify that `bin/herdr-update-check` compares:
     - the session core's `/proc/<core_pid>/exe` (where `<core_pid>` is `.pid` from `HC_SESSION=<name> hc server status --json`) against `stat -L ~/.local/bin/herdr-core` (and checks `readlink /proc/<core_pid>/exe` for ` (deleted)`), and
     - the running `herdr-app` process's `/proc/<app_pid>/exe` against `stat -L ~/.local/bin/herdr-app` (dereferencing the symlink to `~/.local/share/herdr-app/herdr-app` and checking for ` (deleted)`).

---

### 2. `consultant-weights`: pure `doc.get` transform cannot read a killed non-`--keep` consultant's weight after `hc kill`

- **Leaf:** `herdr-setup/herdr-app/consultant-weights` (and `akrogon/herdr-app/hc-doors/chart-door-on-hc`)
- **File & line:**
  - `issues/chart/herdr-app/slots/handoff/herdr-setup/herdr-app/consultant-weights/brief.md:9,18-19`
  - `issues/chart/herdr-app/slots/handoff/herdr-setup/herdr-app/consultant-weights/design.md:73,108`
  - `issues/chart/herdr-app/slots/handoff/akrogon/herdr-app/hc-doors/chart-door-on-hc/brief.md:7`
  - `issues/chart/herdr-app/slots/handoff/akrogon/herdr-app/hc-doors/chart-door-on-hc/design.md:208`
- **Problem:**
  `consultant-weights/brief.md:9,18` and `design.md:108` specify that `herdr-consultant-column` is a pure function of `doc.get` JSON and the passed `<door terminal> <consultant terminal>...` arguments, and that on replacement it *"transfers the replaced block's weight to it while keeping the other blocks' weights intact"*.
  However, in `chart-door-on-hc/brief.md:7`, `chart-door-on-hc/design.md:208`, and `consultant-weights/brief.md:19` (Done-criterion 2), consultants are started **without `--keep`**, and replacement runs in the order: `hc kill <old>` -> `hc start <new>` -> `herdr-consultant-column <door> <c1> <c2_new> <c3>`.
  When `hc kill <old>` runs on a non-`--keep` consultant while `herdr-app` is connected, `herdr-app` immediately removes `<old>`'s block from `doc.get` (`forks/start-and-pane.md:18`, `forks/proofs.md:73` P11). By the time `herdr-consultant-column` runs and calls `doc.get`, `<old>`'s block (and its prior weight) is already gone from `doc.get`.
- **Evidence:**
  - `forks/start-and-pane.md:18`: *"Normal child exit (`--keep` off): pane closes when process exits."*
  - `forks/proofs.md:73` (P11): only *"Killing a kept child (`--keep`) left its pane"*.
  - `consultant-weights/brief.md:19` (Criterion 2) itself tests `killing one consultant, starting a replacement, and re-running bin/herdr-consultant-column <door> <c1> <c2_new> <c3>` and expects `"the replacement at the killed consultant's position and the remaining weights preserved"`.
- **Fix:**
  In `consultant-weights/brief.md:9,18` and `design.md:108`, either:
  - **(Option A — pure over `doc.get`):** Specify that when the replaced consultant's block is still present in the column in `doc.get`, `herdr-consultant-column` transfers its weight to the replacement block; when the replaced block was already closed and removed from `doc.get` by `hc kill`, `herdr-consultant-column` places the new consultant block at its position in the `<consultant terminal>...` argument order (keeping its existing/default weight) while preserving every surviving consultant block's weight in the column (which already satisfies Criterion 2 at `brief.md:19`).
  - **(Option B — preserve replaced slot's dragged weight across `hc kill`):** Either start the replacement and run `herdr-consultant-column` before `hc kill <old>`, or have `herdr-consultant-column` persist the last column weights per `<door terminal>` in `$XDG_RUNTIME_DIR/herdr-core/consultant-column-<door>.json` when writing `doc.set`.

---

### 3. `deploy-listener-ready`: `brief.md` requires unconditional `herdr plugin unlink akrogon` while `design.md` gates it on `herdr plugin list`

- **Leaf:** `akrogon/herdr-app/hc-engine/deploy-listener-ready`
- **File & line:**
  - `issues/chart/herdr-app/slots/handoff/akrogon/herdr-app/hc-engine/deploy-listener-ready/brief.md:8,21`
  - `issues/chart/herdr-app/slots/handoff/akrogon/herdr-app/hc-engine/deploy-listener-ready/design.md:115`
- **Problem:**
  `design.md:115` states: *"otherwise `herdr plugin unlink akrogon` (plugin id `akrogon` in `plugin/herdr-plugin.toml`), tolerating an already unlinked plugin only by checking `herdr plugin list` first (D,B)"*.
  In contrast, `brief.md:8` and `brief.md:21` (Done-criterion 2) state unconditionally that deploying a release with no `plugin/` *"runs `herdr plugin unlink akrogon`"*.
  Because `engine-on-hc`, `chart-door-on-hc`, `watcher-on-hc`, and `notices-on-hc` all deploy releases without `plugin/` before `herdr-sweep` removes the `herdr` binary, `engine-on-hc`'s deploy unlinks `akrogon`, and the next three leaves deploy when `akrogon` is already unlinked.
- **Evidence:**
  Compare `deploy-listener-ready/brief.md:8,21` with `deploy-listener-ready/design.md:115`.
- **Fix:**
  Update `deploy-listener-ready/brief.md:8,21` to match `design.md:115`: when `plugin/` is absent and the `herdr` binary exists, `deploy` checks `herdr plugin list` and runs `herdr plugin unlink akrogon` if `akrogon` is still linked (and skips `unlink` cleanly when `akrogon` is already absent from `herdr plugin list`).

---

### 4. `chart-door-on-hc`: off-by-one criterion numbers in `design.md` (`### Standing design`)

- **Leaf:** `akrogon/herdr-app/hc-doors/chart-door-on-hc`
- **File & line:**
  - `issues/chart/herdr-app/slots/handoff/akrogon/herdr-app/hc-doors/chart-door-on-hc/design.md:196-198`
  - `issues/chart/herdr-app/slots/handoff/akrogon/herdr-app/hc-doors/chart-door-on-hc/brief.md:21-27`
- **Problem:**
  When the attended consultant nudge criterion was inserted as Done-criterion 2 in `brief.md:22` (shifting old Criteria 2–5 to Criteria 3–6 and adding Criterion 7), `design.md:196-198` was not updated:
  - Line 196 says `(criteria 1, 2)` instead of `(criteria 1, 2, 3, 7)`
  - Line 197 (`src/chart-status.ts`) says `(criterion 3)` instead of `(criterion 4)`
  - Line 198 (`tests/chart-status.test.ts`) says `(criterion 5)` instead of `(criterion 6)`.
- **Evidence:**
  Compare `chart-door-on-hc/brief.md:21-27` with `chart-door-on-hc/design.md:196-198`.
- **Fix:**
  Update `chart-door-on-hc/design.md:196-198` to reference `(criteria 1, 2, 3, 7)`, `(criterion 4)`, and `(criterion 6)`.

---

### 5. `slots/needs-sheet.md`: stale helper name `herdr-consultant-heights` in N6

- **Leaf:** Chart support file (`slots/needs-sheet.md`)
- **File & line:**
  - `issues/chart/herdr-app/slots/needs-sheet.md:10`
- **Problem:**
  Row N6 in `slots/needs-sheet.md:10` still names `herdr-consultant-heights`, whereas `forks/start-and-pane.md:64`, `chart-door-on-hc/readiness.yaml:3`, and `consultant-weights/brief.md:5` all use `herdr-consultant-column`.
- **Evidence:**
  `issues/chart/herdr-app/slots/needs-sheet.md:10`: `| N6 | weights helper (herdr-setup/herdr-app/consultant-weights) | herdr-consultant-heights | ...`
- **Fix:**
  Change `herdr-consultant-heights` to `herdr-consultant-column` in `slots/needs-sheet.md:10`.

Verdict: changes needed
