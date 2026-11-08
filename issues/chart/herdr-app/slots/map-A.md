# Territory map: A (herdr-app chart)

Written blind, before reading map-B..E. Facts from my own reads plus two read-only Haiku lookups (lifecycle on herdr; herdr-setup), spot-checked where a fork depends on them.

## Surfaces inspected

- Trigger: `plugin/herdr-plugin.toml` (startup `pull.sh --all`, `next.sh --resume`; events `pane.agent_status_changed`, `pane.exited`, `pane.closed`, `tab.closed` run `next.sh`), `plugin/next.sh:3` (`exec akrogon next`), event schema `src/next.ts:81-103`, dispatch `nextCommand` `src/next.ts:1604-1803`.
- Slots: `allocate` `src/next.ts:513-677` (tab create, pane split, swap repair, scope adopt), `dispatchSlot` `src/next.ts:679-842` (agent start `:789`, `agent prompt --wait --until working` `:826`), delivery proof by session-file byte offset `src/session-file.ts:40-76`, stall notice `observeBusy` `src/next.ts:223-265` (STALL_MS 60 min).
- Ids: `src/state.ts:99-102` (pane A/B, prompted), `src/log.ts:36-51` (session from `agent_session.value`), `src/reconcile.ts:404-429` (tab close), `src/scope.ts:121-205` (pane shell pid boxing).
- Notices: `src/phase.ts:105-115`, `src/verify.ts:326-358`, busy notice in next.ts, watch-issues SKILL "notification show".
- Install: `src/install.ts:146-147` (`herdr integration install`, `herdr plugin link`), `src/self-update.ts:278-288`; skill roots `src/install.ts:25` already link every akrogon skill into `.claude/skills`, `.agents/skills`, `.codex/skills`, `.pi/agent/skills`.
- watch-issues: cron `*/20`, `scripts/observe.ts` uses `herdr agent list` and per-kind log lookup; auto-fix actions are `akrogon next`, `akrogon phase <slug> <failure.phase>` then next, one `esc` per seat.
- hc 0.1.18: `hc events [--label k=v] [--children-of t]` push stream; `hc templates` (empty here; `~/.config/herdr-core/templates/`); `notes = false` config; "streams end on loss, reattach"; "Tests need their own HC_SESSION and scratch XDG paths" (`hc --skill`).
- herdr-app 0.1.13: no pane weight command; `terminal.keep {terminal, place}` only; labels `herdr.space`/`herdr.tab` adopt a terminal into a tab from the core side.
- herdr-setup: config overlay (install symlinks keys, settings, mods, layouts into `~/.config/herdr-app`; `bin/herdrapp` sessions). No patch mechanism exists there today. herdr-app and herdr-core are prebuilt ELF binaries (`~/.local/share/herdr-app/herdr-app`, `~/.local/bin/herdr-core`). The precedent for "patches that survive updates" is old herdr's `~/Work/omarchy-customizations/herdr/` (`ensure-patches`, `herdr-patches.path/.service/.timer`) over a source build in `~/Work/infra/herdrdev/herdr-patched`.
- Old herdr skill: real directories (not links) at `~/.claude/skills/herdr`, `~/.codex/skills/herdr`, `~/.pi/agent/skills/herdr`.
- Old herdr sessions still running: `default`, `infra`, `mdconsultingny` (`herdr session list`).

## Material forks

1. Engine trigger (what replaces the plugin). Lean: one systemd user service `akrogon listen` per hc session, running `hc events --label akrogon.leaf=*`-style filter, calling `next` on turn end, blocked, exit; it also runs startup `pull --all` and `next --resume`. Alternative: a herdr-app mod (dies with the window, so overnight runs stop). Later risk: the event stream ends on core loss or `hc update`; the listener must reattach and catch up (done-criterion: survives a core restart in a throwaway session).
2. Who moves work forward on success. Lean: the slot's last skill step is `akrogon phase <slug> <next>`, and phase dispatches the next seat itself (the message). The listener only covers crash, blocked and exit. This is the operator's "slot sends the message" rule applied to leaves. Alternative: slots `hc send` each other directly (A and B would need each other's names and the state stays split between agents).
3. Slot identity in state. Lean: hc name `<repo prefix>-<leaf slug>-<seat>` plus labels `akrogon.repo`, `akrogon.leaf`, `akrogon.seat`; state stores the name, never an address (addresses change on restart). Names are unique per hc session, not per repo.
4. Parentage. Lean: leaf slots `--no-parent` (or `--outlive-parent`) so no door or listener restart kills them; consultants and direct-route reviewers are children of their door and die with it.
5. Visible panes for leaf slots while the window may be closed. `terminal.keep` is an app command; labels are core-side. Open: does `terminal.keep` work with no window, and does label adoption place panes in order? Probe both in a throwaway session. If keep needs the window, the start helper adopts by label and the app places panes when it next draws (order may be side by side).
6. Start helper shape (code, signpost 1a). One `akrogon start` used by door, direct reviewer and leaf slots: name, labels, argv from config `harnesses:` (codex adds `sandbox_workspace_write.network_access=true` when sandboxed), first task in the start command, pane placement in order with retry until `herdr-app ls` shows it, `first_message.sent` checked. Alternative: hc templates (`~/.config/herdr-core/templates/*.md`) hold command and instructions; rejected lean because akrogon config already holds harness templates and two sources would drift.
7. Delivery and done proof. Lean (signpost 2a): drop the session-file byte-offset proof; a seat's own report (`hc send` to its door, or `akrogon phase` for leaf slots) is done; keep only the recorded-failure guards: confirm the seat went `working` after the first task, and refuse a known codex startup popup. Later risk: a harness update adds a new popup; the listener's "no turn started" case must surface it.
8. Agent session id features (seats.yaml `session`, USAGE.md via chart-usage.ts, log `session`, watch-issues log tail). hc gives no session id. Signpost 2a drops them unless named. Operator question: keep per-chart usage measurement or drop it.
9. Notices (busy, main red, merge slow, failed). herdr-app alerts only on agent blocked/done. Lean: per signpost 3, a herdr-setup mod that shows akrogon notices from a file akrogon writes (`watchFolder`, no polling), with `notify()` toasts; or fold them into the shipped Tasks board rows only.
10. Codex reports `working` while waiting on a question; stall notice and watch-issues would misread it. Options: patch nothing (accept, watcher judges by screen), or a herdr-setup wrapper. Low confidence any patch can fix a status hc computes inside the binary.
11. watch-issues (operator: same workflow, auto-fix). Lean: keep the 20-minute cron and its rules; `observe.ts` reads `hc ls --json --label akrogon.*` and `hc get`; `agent read` → `hc read`; `esc` → `hc keys <t> esc`; log tail per harness kind dropped or kept with fork 8.
12. Chart door. peer-create/ask/wait/anchor/restart and door-reset deleted (1a); text tells the door to call `akrogon start` and `hc send`; the `HERDR_ENV=1` gate becomes `HC_TERMINAL_ID` set; temp-path rule removed (intake); A's own handover reset: self-sent `/clear` (tested 10/10) or kill and restart A.
13. Global herdr skill (signpost 5 addition). A plain symlink to AGENTS.md will not load as a skill: Claude Code, Codex and pi skills need `SKILL.md` with `name`/`description` front matter, and AGENTS.md has none and is rewritten on every app start; the session home holds its own copy (`~/.config/herdr-app-sessions/infra/AGENTS.md`). Options: (a) a tiny `SKILL.md` whose body says "read `$HERDR_APP_HOME/AGENTS.md`, then `hc --skill`" (always current, nothing copied); (b) a generated copy with front matter refreshed on app start; (c) the plain symlink, if a probe shows each harness accepts it. Owner lean: herdr-setup install (it owns herdr-app config), linked into the four skill roots, replacing the three old copies. agy's skill root is unknown (probe).
14. What "patch in herdr-setup" means. herdr-app/hc are binaries here, so patches can be mods, clones, layouts, wrapper scripts in `bin/`, and a re-apply hook like old herdr's path unit. Source patches only if you have the source. Operator question.
15. Test fakes. Lean: a small fake `hc`/`herdr-app` for unit tests (delete fake-herdr), plus a few end-to-end tests against real hc in a throwaway `HC_SESSION` (hc manual supports it) for start, report, restart, listener reattach. Signpost 2a requires e2e before deletion.
16. Bootstrap and the cut (6a + 2a + one cutover). The engine leaf must run somewhere: by hand with the operator, or in old herdr's still-running `infra` session one last time. And "test before delete" vs "one cutover": lean that each leaf replaces and deletes its own old part in the same change, proven e2e in that leaf, with a final sweep leaf that proves zero `herdr` mentions remain.
17. Sessions and repos. Today one herdr session per repo (`--session`, `resolveSession` `src/shell.ts:379`). herdr-app has one hc session (`infra`) with a space per repo, plus other hc sessions possible (`bin/herdrapp`). Lean: the engine uses the hc session in its environment; the space comes from the repo's folder or a label; one listener per hc session.

## Practitioner questions

- What runs a leaf when nobody is logged in or the window is closed? (core keeps terminals; layout commands may fail.)
- How does the listener catch events missed while it was down? (`next --resume` sweep on reattach.)
- What stops two doors or a door and a leaf from taking the same hc name across repos? (repo prefix in every name.)
- Which Claude Code permission mode do slots run in? The auto-mode classifier refused a full-access codex start (intake 2026-11-05); config `harnesses:` uses `--dangerously-skip-permissions` for claude.
- Is old herdr uninstalled from the machine at the end (binary, sessions, `~/.config/herdr`), or only removed from akrogon?

## Pitfalls

- Late `done` from a replaced seat: ignore reports from a name/turn the door no longer holds (design).
- `terminal.keep` pending race: retry until `herdr-app ls` shows the pane (start helper).
- Symlinked mod does not hot-reload in herdr-app 0.1.13 (herdr-setup lesson 2026-11-06): copy for live checks.
- Backgrounded Claude reports no status (intake 2026-11-04): watcher cannot see it; document, no fix.
- agy forced send picks option 1: never `--force` an agy question (design).
- Three equal panes impossible by halving; four are (finding 2026-11-06).
- Half-ported main auto-deploys on every merge (`docs/reference/releases-and-updates.md`): leaf order must keep main working after each merge.

## Proposed split

- akrogon epic `herdr-app`:
  1. `start-and-dispatch` (engine first): start helper, listener service replacing the plugin, next/phase/state/reconcile/scope/log on hc, install/self-update, engine tests with fake hc plus e2e on real hc. Prerequisite for all.
  2. `chart-door-hc` (blocked-by 1): chart-issues text and scripts.
  3. `watch-hc` (blocked-by 1): watch-issues observe and rules.
  4. `notices` (blocked-by 1, and the herdr-setup notice mod if chosen).
  5. `herdr-sweep` (blocked-by 2,3,4): docs, README, learnings, tests residue, other skills' mentions, zero-`herdr` proof.
- herdr-setup: global herdr skill install into the skill roots and removal of the old copies; notice mod; any wrapper patch.
- Operator machine: stop old herdr sessions, decide uninstall.

## Operations needing one real observation

`hc run --bg --name x --no-parent --label ... <harness> "<task>"` per harness; `hc events --label k=v` sees turn/exit and ends on core restart (throwaway session); `herdr-app do terminal.keep` with no window open; label adoption order; `hc send` to a `done` seat starts a turn; `hc kill` + `hc run` same name; skill load per harness for the chosen herdr skill shape; systemd user unit running `hc events`.
