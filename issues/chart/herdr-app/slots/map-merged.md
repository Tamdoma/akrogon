# Territory map, merged (A,B,C,D,E)

Sources: slots/map-A.md, map-B.md, map-C.md, map-D.md, map-E.md. Tags name the seats that raised or agreed with a line. Verified by A on 2026-11-06 where marked (v).

## Corrections to seat claims

- E's `pane.resize`, `pane.attach_terminal`, `app.layout.capture/apply`, `hc capture` and `hc prune` do not exist in herdr-app 0.1.13 / hc 0.1.18 (v: `herdr-app commands` lists pane close/focus/go/split/swap/zoom only; `hc capture` and `hc prune` are unrecognized). E's F4 resize plan and its "displaced shell" pitfall rest on these and are dropped. The screen read is `hc read`.
- Space folders are unreliable for repo lookup (E, v): `herdr-app ls` shows `framework` at `/home/ivan/Work/infra/akrogon`, `portal` at the framework folder, and so on, shifted by one.
- herdr-setup has no patch mechanism today; herdr-app and herdr-core are prebuilt binaries (A,B,D, v). Old herdr's survive-updates precedent is `~/Work/omarchy-customizations/herdr/` over a source build (A).
- akrogon `harnesses:` config has no `--no-daemon` on codex and no `agy` entry (D,E, v in `akrogon config`).

## Material forks (proposed fork files, in proposed order)

1. engine-shape: does signpost 1a ("code only for the start step") bind the engine itself, or only agent-to-agent steps in skills (B Q1; A,C,D,E assume the engine keeps code dispatch)? What wakes the engine without the plugin: one systemd user listener per hc session following `hc events` (A,C,D,E lean; B lean with herdr-setup owning deployment), a mod (all reject: dies with window), or nothing resident (rejected by signpost 4a)? Who advances work on success: `akrogon phase` dispatches the next seat directly, the listener only covers crash, blocked, exit (A,E; B P1 asks to map every advancement path first).
2. identity: repo to space mapping and hc session (shared session, space per repo: A,B,C,D; E wants multi-session discovery via `herdrapp session list` and both `HC_SESSION` and `HERDR_APP_HOME` threaded); how a repo is found (label `akrogon.repo` (A,C,D) or space name (E), never space folder); what state stores (hc name with repo prefix, labels as rediscovery: A,C,D; plus pane and turn: E; plus terminal instance for accepting results: B); name length 32 chars and truncation (D); two doors on one repo collide on names (B,D).
3. lifetime: leaf slots `--no-parent`/`--outlive-parent` survive door and listener restarts; consultants and direct reviewers die with their door (A,B,C,D). Late reports from a replaced seat are refused by instance identity (B,C,D). Nobody receives hc child notes for parentless leaf slots, so listener and watcher coverage must be total (C,D).
4. start-and-pane: one start command used by engine, door and direct reviewer (all). Pane placement: unlabeled start then `terminal.keep` in order with retry (A,C,D), labels only (side by side, rejected), `tab.new --argv --task` for leaf tabs (D, unknown parent and first-message behavior), or a herdr-setup patch giving one acknowledged start-and-place (B). Window closed at night: does `terminal.keep` work, and is a running agent without a pane acceptable until the window opens (A,B,D)? Three equal panes impossible by halving (A,B,v). Focus restore while the operator types (D).
5. delivery: first task in `hc run`, check `first_message.sent`; later tasks by plain `hc send`, check `turn` advanced (C,D); drop session-file byte-offset proof (A,D,E); the installed hc already tracks launch-task turns and notifies parents about children that cannot report, so probe before porting any old guard (B). A second phase prompt to a leaf slot keeps its context, so leaf slots use `hc send`, consultants use kill and restart (C).
6. session-id: hc gives no agent session id. Features on it: chart USAGE.md (`chart-usage.ts`, 720 lines), seats.yaml `session`, log `session`, watch-issues log tail (loop detection from transcripts), `timings.jsonl` `agent_session` (E, unverified). Drop (A,D lean per signpost 2a), herdr-setup patch exposing it through hc (B, needs hc source), per-harness file lookup (rejected by D,E as four format bets).
7. notices: busy, failed, main red, merge slow. No notify command in herdr-app CLI; `notify()` is mod-only (all, v). Options: Tasks board rows only (C O1), a mod that posts `notify()` from akrogon status or a notices file (C,D,E), `notify-send` (E). Where the mod lives: herdr-setup per signpost 3 (C), or akrogon because akrogon already installs its own `tasks` mod and the callers and tests live there (D). verify's notice records expect a "shown" acknowledgement (B,D).
8. containment: systemd boxing of the agent's process. Keep with pid from `hc get` (C), wrap harness argv in `systemd-run --user --scope` inside `hc run` (D,E), or drop (signpost 2a list). Risk: moving the wrong process can hit the core or other terminals (B); grandchild servers survive `hc kill` without boxing (D). Env delivery (`AKROGON_BASE`, `TMPDIR`, `GIT_EDITOR`, `HC_SESSION` for systemd-run merge work, `src/land.ts:29`) must be observed (B).
9. watcher: keep the 20-minute cron and its rules (A,B; signpost 4a); `observe.ts` on `hc ls --label`/`hc get`/`hc read`; steer by `hc interrupt` and `hc send`, `esc` by `hc keys` (A,C,D); log-tail kept or dropped with fork 6 (E). How a crash event reaches watch-issues when its Claude session is busy or gone (B P3). Does the watch session have to live in a herdr-app terminal, and who starts it after reboot (D Q12)?
10. chart-door: delete peer-create/ask/wait/anchor/restart and door-reset; skill text calls the start command and plain `hc send` (all). A's own handover reset: self-sent `/clear` (tested) or successor door (B Q7). agy stays same-session at handover (B). `HERDR_ENV=1` gate becomes `HC_TERMINAL_ID`; temp-path rule removed (intake).
11. herdr-skill: a plain symlink `SKILL.md -> AGENTS.md` likely fails discovery (no front matter) and AGENTS.md is 950 lines of mod authoring (A,C,D,E); B says unproven, not assumed broken. Lean: a tiny owned `SKILL.md` with front matter that points to `$HERDR_APP_HOME/AGENTS.md` and `hc --skill` (A,C,D). Owner herdr-setup install (A,C,D,E). Linking a skill does not make agents read it every time (B Q9, C in signposts): is description-triggered loading enough? agy's skill home unknown (A,D,E).
12. patch-mechanism: what "patch in herdr-setup" means with binary installs: mods, clones, layouts, `bin/` wrappers, a re-apply hook (A); a versioned patch series refusing an incompatible update (B Q11a) or a maintained fork (B Q11b), both need source access. Operator question: is herdr-app/herdr-core source available?
13. tests: small fake `hc` and fake `herdr-app` with captured real JSON (D,E,A) plus a few real-hc e2e tests in a throwaway `HC_SESSION` (A,C); each leaf ports its own tests (B,D), no end-of-epic test leaf (B,D) versus a test leaf (C L6). Fakes must refuse unplanned calls (B R5).
14. cutover: drain or stop open leaves in every registered repo before the engine lands, no state migration (B,C,D); rollback across the cutover resurrects herdr calls (D Q9); `learnings/history/` herdr wording exempt or rewritten (D Q10); who removes the old herdr binary, plugin link and `~/.config/herdr` (A,D Q11); main must stay working after each merge because every merge deploys (A).
15. board-focus: Tasks board click runs `pane.focus` on the seat's terminal; in this epic or its own (D Q8, B P9, E F5)?
16. config: codex `--no-daemon` and the sandbox network flag in `harnesses:`; an `agy` harness entry (D,E). Claude Code auto mode refuses full-access starts (A, intake 2026-11-05).

## Practitioner questions kept for the forks

- Listener: reconnect after `hc events` stream loss has no replay cursor (B, v in `hc events --help`); catch-up pass on start (C,D); single-flight and coalescing as today (D); listener liveness shown in status (D P11); environment reaches `/run/user/1000/herdr-core/` socket (C,D).
- Core restart turns kept agents into shells: listener treats "live terminal, foreground shell, agent expected" as a crash for the watcher, never auto-resends (B R4, D P2).
- Backgrounded Claude reports no status: unknown status means hands off (C P5, D P3).
- codex `working` while asking: judge by screen and log, not duration (A,C,D).
- Removing "herdr" must keep the new `herdr` skill and herdr-app's own `herdr` mod import (B R8).

## Proposed split (to settle after the forks)

- akrogon epic `herdr-app`: engine-and-start first (all), then chart door, watcher, notices, board focus side by side (all), final sweep after recorded e2e proof (A,B,C,D).
- herdr-setup: global herdr skill (all), notice mod if placed there (C,E), patches the probes prove necessary (B,C).
- Operator machine: drain open leaves, approve probe budget, remove old herdr after proof (B,C,D).

## Probes (pending budget approval, throwaway session)

Start with first task per kind; later `hc send` per kind; kill and restart same name with stale report refused; `hc events --label` status/exit and reconnect after core restart; parent loss with `--no-parent`/`--outlive-parent`; `terminal.keep` with window closed and for 3 and 4 seats; containment and env inside `hc run`; notify mod visible; skill discovery per harness inside and outside hc; door self-reset; codex sandboxed leaf argv reaches hc (A,B,C,D,E).
