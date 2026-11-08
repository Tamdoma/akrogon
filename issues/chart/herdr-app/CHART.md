# Chart: herdr-app

## Destination

akrogon runs entirely on herdr-core (`hc`) and herdr-app with today's behavior kept, event-driven with `<hc>` messages and no polling, proven end to end before old herdr is removed from akrogon and the machine (operator note 2026-11-06, INTAKE.md; signposts).

Route: lifecycle

Split, operator "ok" 2026-11-07 (door t15):
- akrogon epic `herdr-app` (this chart): (1) deployer-first prerequisite; (2) engine on hc, built by the door or by hand (signpost 6a), `blocked-by` (1); (3) chart door on hc, (4) watcher on hc, (5) notices akrogon side, each after (2), side by side; (6) final sweep after the recorded 2a proof and after (3)-(5).
- herdr-setup (chart `issues/chart/herdr-app` in herdr-setup): global herdr skill (independent), notices in `session-status`, consultant weights helper, post-update check; each lands and `./install` runs before the akrogon e2e proof that needs it (no cross-repo `blocked-by`).
- Operator steps: drain and freeze before the engine merges; `~/.akrogon/config.yaml` harness edits (codex `--no-daemon`, agy entry); one paid probe budget; machine removal list after the proof.

## Forks taken

- [Repo, session and seat identity](forks/identity.md): space by repo name via hc doc.get; state keeps tab + seat address + turn; names `<prefix>-<slug>-<a|b>` (code only when cut); prefix stored per repo
- [Engine on hc](forks/engine-shape.md): engine keeps one small hc module; akrogon-installed systemd listener on hc events replaces the plugin; phase runs next for its leaf (3b, swap to 3a if tests say so)
- [Signposts](forks/signposts.md): same workflow on herdr-core/herdr-app, e2e proof before deleting old, gaps patched in herdr-setup, watcher auto-fix, global herdr skill from herdr-app AGENTS.md, engine first
- [Start command and visible panes](forks/start-and-pane.md): leaf seats parentless, consultants children of the door; leaf tabs by labels with akrogon naming them via `tab.rename` when the window is open; equal consultant heights by a herdr-setup weights helper keeping dragged sizes; one start verb, restart composed by the door.
- [Task delivery and report proof](forks/delivery.md): first task in start argv, proven by hc events within 60 s, unproven starts left running; later tasks by plain hc send, no blind resend; silent leaf stops re-prompted, third fails the leaf; silent consultants nudged once, then dropped
- [Features keyed on agent session id](forks/session-id.md): all four features kept; each seat records its transcript file path, found from the live agent by one resolver at the moments old herdr was asked; unknown path keeps today's unmeasured/no-log paths
- [Notices](forks/notices.md): herdr-setup's session-status bar shows akrogon notices from notice files it watches and deletes; closed window waits; sounds and texts as today, no click action
- [Process containment and environment](forks/containment.md): leaf seats boxed in their leaf slice by wrapping the harness in systemd-run --scope at start (same pid, proven); leaf env by `env` in argv; detached work resolves its own hc session
- [watch-issues on hc](forks/watcher.md): optional as today; 20-minute cron kept plus instant <hc> wakes from the listener on crash, blocked, failed and busy; same judgment rules on hc commands; operator-started, one per repo
- [Chart door on hc](forks/chart-door.md): peer scripts go; consultants started, asked and collected through the start command, `hc send` and `<hc>` reports, with one `hc wait --children all` per exchange to catch a silent stop; handover reset kept as one small helper on hc events (signpost 1a exception); supplied consultants never restarted; gate `HC_TERMINAL_ID`, seats.yaml at Open with address and transcript path
- [Global herdr skill](forks/herdr-skill.md): one small `skills/herdr/SKILL.md` in herdr-setup pointing to `hc --skill`, `herdr-app --skill` and the session AGENTS.md; symlinked into every harness skill folder by herdr-setup install, replacing the old herdr skills in the same run; trigger-rich description, proven per harness
- [Patches in herdr-setup](forks/patch-mechanism.md): patches are herdr-setup files on public surfaces only (mods, layouts, keys, settings, named helpers, the skill); no source patches, no PATH wrappers; one operator-run check after each hc or herdr-app update; patch deleted when upstream ships the feature; feedback draft per gap; tests on both sides
- [Test fakes and e2e](forks/tests.md): real throwaway hc core per test with a stand-in agent script, only herdr-app faked; real-hc tests in the normal test check, kept about as fast as today (~75 s); window and paid tiers attended; each leaf ports its own tests; full real run before old herdr is deleted
- [Cutover, drain and removal](forks/cutover.md): nothing open and nothing pushed before the switch; a tiny deployer-first leaf makes the engine deploy work; rollback across the cutover refused; old herdr removed in owner order after the full proof, source checkouts deleted after unique work is saved; current wording rewritten, history kept
- [Harness config](forks/config.md): codex gains `--no-daemon`, keeps full access; agy added to `harnesses:` (auto-approve flag by probe); Claude unchanged, door start verb proven under the existing allow rule; app home from herdr-setup's folder rule in one akrogon function; Tasks board code removed in the final sweep

## Open forks

none



## Fog

## Off route

- [Tasks board focus](forks/board-focus.md): dropped 2026-11-07, operator deleted the Tasks board ("So scrap it.")

## Pending steps

Operator steps (owner: operator), in order; each stays pending until its done check is recorded here.
- N1a before handoff: `~/.akrogon/config.yaml` `harnesses.codex` gains `--no-daemon`; `harnesses.agy` is `agy --model {model} --effort {effort} --mode auto`. Done: `akrogon config` shows both. Status: done 2026-11-07 (door A edit, operator "1a 2a").
- N1b after deploy-listener-ready deploys, before engine-on-hc merges: top-level `prefixes:` with one two-letter prefix per registered repo. Done: `akrogon config` shows every repo's prefix. Status: done 2026-11-07 (door A edit, operator "1a | 2a | 3a | 4a | 5a | 6a" 5a).
- N5 hold before the switch: when engine-on-hc reaches `check`, `akrogon stop engine-on-hc` if herdr-setup has open leaves, `./install` has not run, prefixes are missing, or another leaf has seats; `akrogon start engine-on-hc` once done; clear the stale `stopped.yaml` mark `framework/relay-obrazac` (done 2026-11-08 by door A under the overnight delegation: no such leaf exists, so `akrogon start` cannot clear it; the file, holding only that entry, moved to ~/.local/state/akrogon-door-backup/stopped.yaml.20261108). Status: pending.
- N6 after herdr-setup's leaves land: run `/home/ivan/Work/infra/herdr-setup/install`, restart the herdr-app window, check per harness that `herdr` resolves to the linked skill. Status: done 2026-11-07 (install run by door A on operator "7a", herdr-setup main fast-forwarded first; window restarted by operator 23:38, status errors empty; skill links resolve in all five homes).
- E2E after engine-on-hc, chart-door-on-hc, watcher-on-hc and notices-on-hc merge and N6: door A runs the final end-to-end proof (needs N7 grant) and writes `forks/e2e-proof.md` on main; herdr-sweep waits on that file. Status: done 2026-11-08 (forks/e2e-proof.md, 7 of 7 sessions).
- Removal after herdr-sweep merges (cutover removal list; herdr-sweep's report refines the commands):
  1. `herdr plugin unlink akrogon` (if still listed) and `herdr integration uninstall <kind>` for every kind ever installed; check `herdr plugin list`, `herdr integration status`; remove the dead `herdr agent` permission lines and the legacy `herdr agent start` `autoMode.allow` entry from `~/.claude/settings.json` (N2).
  2. Disable and remove `herdr-patches.path/.timer/.service`, `herdr-patches-failed.service`, `herdr-claude-rules.path/.service`; omarchy hooks `apply-omarchy-theme` and `ensure-herdr-after-omarchy-update`; `~/.local/share/herdr-patches`, `~/.cache/herdr-patches`; `omarchy-customizations/herdr/` and its `install.sh` lines; check `systemctl --user list-units 'herdr*'`.
  3. Move or remove the Moshi hook's `MOSHI_HERDR_PATH` dependency.
  4. Stop old herdr servers and sessions; remove `~/.local/bin/herdr`, `/usr/bin/herdr` (pacman), `~/.config/herdr/`, the old desktop shortcut, `~/.config/herdr-app-sessions/infra/mods/tasks`; check `pacman -Q herdr` fails and each path is absent.
  5. Source checkouts `infra/herdrdev/` and `infra/herdr-plugins/`: list every commit, branch, stash and worktree change only on disk; operator picks a pushed fork branch or a `git bundle`; delete only after that is confirmed.
  Status: pending.

## Mode record

Handed off 2026-11-07
