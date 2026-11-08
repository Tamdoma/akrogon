# Fork Notes: `cutover` — Seat E

## Q1: Drain — open leaves when the engine leaf merges

- **Pick:** **Zero open leaves required across all registered repos when the engine leaf merges** (except the engine leaf itself if merged via `akrogon done` as the final leaf on old `herdr`). No state migration (`wA:p1` -> `t1`) and no dual-engine window.
  - *Why:* `src/self-update.ts:273` flips `~/.akrogon/current` globally for every registered repo on merge. Old leaves store `w1:p1` pane IDs (`src/state.ts:26,99`), legacy session offsets, and `busctl` scopes inside old `herdr` panes; an `hc`-only binary cannot address `w1:p1` via `hc ls`/`hc send` or watch them via `hc events`. All 12 registered repos already have zero open leaves today (`forks/cutover.md:5`).
  - *Cost:* A brief dispatch freeze across registered repos (`akrogon pause` or pre-merge check that `issues/open/` is empty in all 12 repos) while the engine leaf merges.
- **Rejected options:**
  - *Finish on old `herdr`:* Impossible after `~/.akrogon/current` flips unless `src/` retains dual-engine dispatch (`herdr` + `hc`), violating `INTAKE.md:4` ("No compatibility layer, no 'both supported' period. One cutover").
  - *Carry over onto `hc`:* Requires rewriting `state.yaml` `pane: wA:pB`, respawn-and-resume logic across engines, and schema translation for a one-time event with 0 open leaves.
- **Evidence:**
  - `[local code, 2026-11-07]` `src/self-update.ts:270-296` atomically flips `~/.akrogon/current` for all repos and runs `herdr plugin link` on the new release.
  - `[local state, 2026-11-07]` `forks/cutover.md:5`: all 12 registered repos have 0 open leaves today (`~/.akrogon/repos.yaml`).
- **Pitfalls & removals:**
  - *Pitfall:* A background timer or operator starts a leaf in another repo right before the engine leaf merges. *Removal:* Run a pre-cutover check across all repos in `~/.akrogon/repos.yaml` asserting zero `issues/open/*` directories (aside from the engine leaf itself) before merging.
  - *Pitfall:* The engine leaf's own `akrogon done` runs `selfUpdate()` (`src/done.ts`), which executes `herdr plugin link` if still present in the old binary running `done`. *Removal:* In `src/self-update.ts:283-288`, the *old* binary running `done` calls `run(["herdr", "plugin", "link", ...])` before `current/plugin` is deleted, OR keepold `herdr` binary present until after the engine leaf finishes merging (removed in Q3 after 2a proof) and gate/remove the `herdr plugin link` call in `self-update.ts` in the engine leaf or final sweep leaf.
- **Unasked question:** When the engine leaf itself runs `akrogon done` under the old `akrogon` binary, `self-update.ts:285` runs `herdr plugin link --force <current>/plugin` against the newly built release — so `plugin/herdr-plugin.toml` must either stay until the post-engine cleanup leaf or `done` on the engine leaf must tolerate `herdr plugin link` failing (`self-update.ts:286` already catches and prints a warning instead of throwing!).

---

## Q2: Rollback — may `akrogon rollback` return to a pre-hc release?

- **Pick:** **Never roll back across the engine cutover.** `akrogon rollback` must refuse if `record.previous` in `~/.akrogon/deploy.yaml` is a pre-`hc` release (detected by checking whether `<previous>/plugin/herdr-plugin.toml` exists).
  - *Why:* `src/rollback.ts:30-36` flips `current` to `record.previous` and calls `install()` (`src/install.ts:146-147`), which runs `herdr integration install <kind>` and `herdr plugin link`. Once any leaf is opened on `hc` (`state.yaml` with `pane: t7`, `hc` session IDs, systemd `akrogon-hc-watch.service`), rolling back puts pre-`hc` code on `current` that cannot read `t7` panes, leaves `akrogon-hc-watch.service` pointing at a release without `hc-watch`, and crashes `install()` once `~/.local/bin/herdr` is removed.
  - *Cost:* A 5-line guard in `src/rollback.ts` before `flipCurrentSymlink`; bugs found after the engine cutover must be fixed forward (or rolled back only to an earlier post-cutover `hc` release).
- **Rejected options:**
  - *Allow until old `herdr` is deleted:* Still corrupts state if any `hc` leaf was started in the meantime, and leaves the `akrogon-hc-watch.service` systemd unit pointing at a release that lacks the listener entrypoint (`engine-shape` Taken Q2 2a).
- **Evidence:**
  - `[local code, 2026-11-07]` `src/rollback.ts:12-38` and `src/install.ts:145-148`: `rollback()` invokes `install()`, which unconditionally shells out to `herdr integration install` and `herdr plugin link`.
  - `[practitioner, 2024-2026]` Expand/contract & hard-cutover deployment patterns: across a non-backward-compatible state/engine boundary, automated binary rollback without state downgrade creates split-brain state; hard cutovers cap rollback at the boundary commit and fix forward.
- **Pitfalls & removals:**
  - *Pitfall:* Auto-rollback inside `selfUpdate()` (`src/self-update.ts:276-281`) triggers if post-flip smoke fails during the engine cutover itself. *Removal:* Auto-rollback during `selfUpdate()` happens *before* any `hc` leaf starts and while old `herdr` is still installed, so `selfUpdate`'s internal catch block remains safe during the merge; only operator `akrogon rollback` across the boundary is refused once cutover succeeds.
- **Unasked question:** Should `akrogon install` on the `hc` release also reload/restart `akrogon-hc-watch.service` (`systemctl --user daemon-reload && systemctl --user restart akrogon-hc-watch.service`) so any permitted post-cutover `hc`-to-`hc` rollback or self-update never leaves the listener running stale code? (Yes.)

---

## Q3: Removal — who removes each old `herdr` piece, in what order, and what happens to source checkouts?

- **Pick:** **Three-stage removal by owner, executed strictly after the `tests` Taken 2a proof** (full suite green + windowed & per-kind run + 1 full real leaf lifecycle + 1 consultant round + 1 watcher check on `hc`):
  1. **`herdr-setup/install` (before/at cutover, per `herdr-skill` Taken Q2 2a):** Moves real folders `~/.claude/skills/herdr`, `~/.codex/skills/herdr`, `~/.pi/agent/skills/herdr` to `~/.local/state/herdr-setup/backup-<time>/` and links `skills/herdr` across all 5 agent paths.
  2. **`akrogon` final sweep leaf (after 2a proof):** Deletes `plugin/` (`herdr-plugin.toml`, `next.sh`, `pull.sh`), `src/install.ts:146-147` and `src/self-update.ts:283-288` (`herdr` calls), `tests/fake-herdr.ts`, `tests/fake-busctl.ts`, legacy `herdr` test fixtures, and updates docs/lessons.
  3. **Machine & `omarchy-customizations` cleanup (after `akrogon` sweep leaf merges):**
     - First disable & stop `omarchy-customizations` systemd units so deleting `~/.local/bin/herdr` does not fire `herdr-patches.path` / `herdr-patches-failed.service`: `systemctl --user disable --now herdr-patches.path herdr-patches.timer herdr-patches.service herdr-patches-failed.service herdr-claude-rules.path herdr-claude-rules.service`, remove those unit files + `~/.local/share/herdr-patches/` + `omarchy-customizations/herdr/`.
     - Stop old `herdr` (`herdr server stop` / stop `app-Hyprland-herdr-*.scope`).
     - Remove `~/.local/bin/herdr` and `~/.config/herdr/`.
     - **Source checkouts (`/home/ivan/Work/infra/herdrdev/herdr-patched`, `/home/ivan/Work/infra/herdr-plugins/*`):** Leave untouched on disk as inert git checkouts (nothing on `PATH` or in `akrogon` references them; never delete git working trees under `~/Work/infra/` without explicit operator instruction).
  - *Cost:* Explicit ordered checklist in the final sweep / cutover leaf.
- **Rejected options:**
  - *Delete `~/.local/bin/herdr` before disabling `herdr-patches.*` units:* Triggers systemd unit failure notifications (`herdr-patches-failed.service`) or rebuilds `~/.local/bin/herdr` on timer (`omarchy-customizations/herdr/README.md:18-33`).
  - *Delete `~/Work/infra/herdrdev/herdr-patched` or `~/Work/infra/herdr-plugins` automatically:* Destroys local git repositories that may hold unpushed history or reference commits.
- **Evidence:**
  - `[local machine, 2026-11-07]` `systemctl --user list-units '*herdr*' --all` shows active `herdr-claude-rules.path`, `herdr-patches.path`, `herdr-patches.timer`, and `app-Hyprland-herdr-167799.scope`.
  - `[local docs, 2026-11-07]` `/home/ivan/Work/omarchy-customizations/herdr/README.md:18-33` documents those 6 user units and `~/.local/share/herdr-patches/repo`.
- **Pitfalls & removals:**
  - *Pitfall:* `herdr-patches.timer` runs nightly (`OnCalendar=daily`) and reinstalls `~/.local/bin/herdr` from `~/.local/share/herdr-patches/repo` after `~/.local/bin/herdr` was deleted. *Removal:* Disable/remove `herdr-patches.timer` and `herdr-patches.path` *before* removing `~/.local/bin/herdr`.
- **Unasked question:** Should `~/.claude/rules/herdr.md` (written by `herdr-claude-rules.service` with old `herdr` pane rules) also be removed when `herdr-claude-rules.service` is disabled? (Yes — otherwise Claude sessions still load stale `herdr` rules from `~/.claude/rules/herdr.md`.)

---

## Q4: Wording — everywhere vs `learnings/history/` and dated records exempt

- **Pick:** **Rewrite all live code, skills, tests, `README.md`, `docs/**` (including `docs/pictures/machine-parts.svg`), `AREA.md` files, and retire the 2 obsolete active lines in `learnings/LESSONS.md`; exempt `learnings/history/**`, `issues/closed/**`, and `issues/chart/**` as immutable dated records.**
  - *Why:* `learnings/LESSONS.md:3` states *"These lessons record what happened, not what is true"*, and `skills/lesson-rule.md:8` specifies how obsolete lessons are retired: remove the active bullet from `learnings/LESSONS.md` (`:11` on `src/next.ts` retryable and `:21` on `herdr plugin` cwd) and append `Applied <YYYY-MM-DD> by <commit>: ...` to the corresponding `learnings/history/*.md` file. Rewriting historical incident files in `learnings/history/` would falsify dated commit/error evidence (and `2026-11-03-headless-output-freezes-window.md` is already about `herdr-app`).
  - *Cost:* A clear path filter on the final grep check (`src/ skills/ tests/ docs/ README.md learnings/LESSONS.md`).
- **Rejected options:**
  - *Rewrite `learnings/history/**` everywhere:* Corrupts historical postmortems, commit quotes, and the `skills/lesson-rule.md` retirement trail.
- **Evidence:**
  - `[local code, 2026-11-07]` `learnings/LESSONS.md:11,21` has 2 active old-`herdr` bullets (`2026-04-06` and `2026-04-13`), while `skills/lesson-rule.md:8` defines the exact `Retire` protocol (`Applied <YYYY-MM-DD> by <commit>`).
- **Pitfalls & removals:**
  - *Pitfall:* Naive `rg -i herdr` fails on legitimate new identifiers (`herdr-app`, `herdr-core`, `herdr-setup`, `herdrapp`, `herdr.space`, `herdr.tab`, `herdr.d.ts`, `from "herdr"`, `/herdr` skill). *Removal:* Scope the done-criterion grep to `src/ skills/ tests/ docs/ README.md learnings/LESSONS.md` with an explicit negative pattern for those legitimate tokens.
- **Unasked question:** None beyond the retirement rule in `skills/lesson-rule.md:8`.
