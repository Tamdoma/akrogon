# Charting proofs

Run 2026-11-07 by door A (t15) under the operator's approved budget (N3, "approve": at most 8 agent sessions × 4 tiny prompts). Identity: operator's user `ivan` (uid 1000), harness logins already on the machine, no secret values read. Versions: hc 0.1.18, herdr-app 0.1.13, claude 2.1.318, codex 0.167.0, pi 1.5.0, agy 1.5.3, systemd 262. Throwaway hc session `akr-probe` (core restarted once with a clean environment, see P0), throwaway herdr-app session `akr-probe`. Scripts and raw logs: `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/4a3df037-e5ba-4393-85f4-67eb6d4ba7e8/scratchpad/probe/` (probe.sh, window.sh, per-kind log.txt, events, doc1.json, w5.log).

Budget used: 8 sessions (claude 2, codex 1, pi 1, agy 4), each at most 4 prompts.

Cleanup: every probe terminal killed; `herdrapp session stop akr-probe`, `hc server stop`, `herdrapp session delete akr-probe`; checked: no `akr-probe` socket under `/run/user/1000/herdr-core/`, no `~/.config/herdr-app-sessions/akr-probe`, no `~/.local/state/herdr-core/akr-probe`, `akrogon-probe.slice` stopped and gone, `~/.cache/akr-probe-agy*` removed. Left in place (harness-owned history, small): probe transcripts under `~/.claude/projects/-tmp-claude-1000--…-probe-claude-cwd/`, `~/.codex/sessions/2026/11/07/rollout-2026-11-07T11-45-*`, `~/.pi/agent/sessions/--tmp-claude-1000--…-probe-pi-cwd--/`.

## P0 Core environment (finding)
- Command: the first `hc` call with `HC_SESSION=akr-probe` from the door's shell auto-started the core.
- Result: the core inherited the door's Claude Code environment (`CLAUDECODE=1`, `CLAUDE_CODE_CHILD_SESSION=1`, `CLAUDE_CODE_SESSION_ID=<door>`, …; `/proc/<core pid>/environ`), so every program it started saw it; the probe Claude ran as a child session and wrote no transcript. Restarting the core with `env -i HOME PATH XDG_RUNTIME_DIR DBUS_SESSION_BUS_ADDRESS LANG TERM HC_SESSION=akr-probe hc server start` gave 0 `CLAUDE*` variables and a normal transcript.
- Limits: the user's sessions are started by herdr-app, not from inside an agent; this bites any core an agent's `hc` call starts (test fixture cores, a session whose core died).

## P1 First task in argv, start proof, later send (delivery Q1/Q2, start-and-pane Q4)
- Command: `hc run --bg --json --no-parent --name p-<kind> --cwd <dir> --label akrogon.probe=1 -- systemd-run --user --scope --quiet --slice=akrogon-probe.slice -p TimeoutStopSec=5 -p SendSIGHUP=yes -- env TMPDIR=<dir>/tmp <harness argv> "<task>"`; then `hc send --json p-<kind> "<task>"`, reports by `hc send inbox 'done <kind> <n>'` into a `cat` terminal.
- claude (`--model claude-haiku-5-5 --effort low --dangerously-skip-permissions`), codex (`--no-daemon -m gpt-6.1-sol -c model_reasoning_effort=low -a never -s danger-full-access`), pi (`--model devin/swe-2-max --thinking low -a --exclude-tools request_user_input --session-id <uuid>`): first task ran and reported; turn reached 1; later sends returned `started: true` with the turn advancing; reports arrived.
- Right after start each reported `idle`, turn 0 before the argv task began; `hc wait` returned at once on it. A send in that window: claude and codex `{"error":{"kind":"unavailable","message":"… still starting: its output has not settled"}}` (nothing typed); pi `started: true` while turn 0, and the two prompts merged into one turn (step 1's report missing). So the start proof must wait for `working` or turn ≥ 1 (delivery Q1 as taken) and nothing is sent before it.
- Limits: one run per kind; small models; does not prove long tasks.

## P2 Containment (containment Q2)
- Result: for all four kinds the terminal's `pid` was the harness itself (systemd-run exec'd in place, `env` too) and its cgroup `…/akrogon.slice/akrogon-probe.slice/run-p<pid>-i<n>.scope`; a shell command each agent ran (`cat /proc/self/cgroup`) reported the same scope, codex with `--no-daemon` included. hc's `agent` field showed `systemd-run` at start; status `app` (claude-code, codex, pi, antigravity) came from OSC 7501 as normal.
- Limits: `--unit=<name>`, `CollectMode`, the leaf slice's limits and `SendSIGHUP` killing grandchildren were not exercised.

## P3 Transcript paths (session-id, chart-door Q2) — corrections
- codex: no rollout open until the first prompt; then `~/.codex/sessions/<date>/rollout-…<id>.jsonl` open in `/proc/<pid>/fd`. After `/new` (typed as keys) no new file until the next prompt; then a second rollout opens and the old one stays open. The current transcript is the newest rollout the process holds.
- claude: the open `tasks` handle is under the seat's `TMPDIR` (`<TMPDIR>/claude-<uid>/<cwd-mangled>/<id>/tasks`), not `/tmp/claude-<uid>` when `TMPDIR` is set (leaf seats get a leaf temp). After `/clear` the process keeps the old id's `tasks` handle open; the new conversation shows as a new `<id>` folder beside it and a new `~/.claude/projects/<cwd-mangled>/<id>.jsonl`. The open handle therefore names the old conversation after a reset.
- pi: holds no transcript open between turns; `--session-id <uuid>` gives `~/.pi/agent/sessions/--<cwd-mangled>--/<time>_<uuid>.jsonl`; after `/new` a new file with a new id appears in the same folder, so the start id no longer names the current transcript.
- agy: holds `~/.gemini/antigravity-cli/conversation_summaries.db` (sqlite), as known.
- Limits: one reset per kind; claude and door or consultant sharing one cwd and TMPDIR were not tested together.

## P4 Interrupt (watcher Q2)
- claude and pi: `hc interrupt` pressed `esc`, `outcome: stopped`, status idle.
- codex: ran `sleep 120` as a background terminal ("1 background terminal running · /ps"); `hc interrupt` pressed `esc`, `outcome: still_working`, status stayed working. Inconclusive for codex's stop key.
- agy: not reached (P5).

## P5 agy start in a new folder (config Q1) — gap
- Commands: as P1 with `--mode auto -i` (cwd under `/tmp` and under `/home/ivan`) and with `--dangerously-skip-permissions -i`.
- Result: in a folder not listed in `~/.gemini/antigravity-cli/settings.json` `trustedWorkspaces` (exact paths; `/home/ivan` listed does not cover its subfolders), agy shows "Do you trust the contents of this project?" and hc reports `blocked`, `kind: permission`, `msg: Trust this folder?`, turn 0. agy still ran the `-i` task behind the dialog (files written, report arrived) with either flag. Later sends were refused as blocked. After `hc keys enter` on the dialog: idle, turn 0 (the first task was not counted as a turn).
- Consequence: every new leaf worktree is a new folder, so an agy leaf seat starts blocked, its start proof fails, and its first turn is not counted. Consultants started in a listed folder (the repo roots in the list) are not affected.
- Limits: `--add-dir` and other trust options not tried; budget exhausted.

## P6 App home (config Q4)
- `herdrapp session list --json` lists `default` → `~/.config/herdr-app`, `infra`, `mdconsultingny`, `personal` → `~/.config/herdr-app-sessions/<name>`, matching the convention; the running throwaway `akr-probe` core had a socket and no herdrapp entry (C's point). Free.

## P7 Window (start-and-pane Q2/Q3, N2) — free
- Window closed: `hc run --bg --keep --no-parent --label herdr.space=akrprobe --label herdr.tab=leafa -- cat`; then `herdrapp --session akr-probe`: `herdr-app ls` shows space `akrprobe` (named after the cwd folder) with tab `leafa` holding the terminal.
- Window open: a terminal labelled `herdr.tab=leafb` appeared as a second tab; `herdr-app status` space, tab and focused pane unchanged before and after.
- Same tab id `leafa` for a second terminal: joined as a split in a row, weights 0.5/0.5 (`doc.get`).
- `herdr-app do tab.rename --id leafa --name probe-leaf-a`: ok; `ls` and the document show the name.
- `doc.set` with the read version (5) set weights 0.7/0.3: version 6; a second `doc.set` with stale version 5: `conflict`, "read doc.get and retry with its version"; re-read shows 0.7/0.3 and the name kept.
- Limits: the window's drawing of the new weights was not looked at; 4-seat column geometry not built.

## P8 agy start: answer the trust question, then send the first task (probe round 2b)
- Approved: operator's 2b (one more paid session). Command: clean-env core; `hc run --bg --no-parent --name p-agy5 --cwd ~/.cache/akr-probe-agy5 -- systemd-run --user --scope … -- agy --model gemini-3.8-flash-low --effort low --mode auto` (no task in argv); `hc wait` → `blocked`, `kind: permission`, `msg: Trust this folder?`, turn 0; `hc keys p-agy5 enter` → `idle`, turn 0; `hc send --json p-agy5 "<task 1>"` → `started: true`, turn 1, `done`, report arrived; second send → turn 2, report arrived.
- Side effect: answering the dialog appends the folder to `~/.gemini/antigravity-cli/settings.json` `trustedWorkspaces` (one entry per folder answered). Cleanup: the two probe entries (`akr-probe-agy4`, `akr-probe-agy5`) removed from that list (12 → 10, checked by grep), folders removed, core stopped, state folder removed.
- Limits: `--mode auto` only; one session; the trust list grows by one entry per agy leaf worktree unless removed.

## P9 Labels, self-removing helper, hc from a systemd user service (watcher Q1, session-id label, chart-door Q2, engine-shape Q2) — free
- Run 2026-11-07 by door A, throwaway session `akr-probe2` started with a clean environment (`env -i HOME PATH XDG_RUNTIME_DIR DBUS_SESSION_BUS_ADDRESS LANG TERM HC_SESSION=akr-probe2 hc server start`), hc 0.1.18, systemd 262. Log: scratchpad `probe/free2.log`, `probe/svc-events.jsonl`.
- `hc label lb akrogon.watch=akrogon akrogon.transcript=/x/y.jsonl`: both labels in `hc get --json` `labels`; `hc label lb akrogon.watch=` removed only that label.
- `hc run --bg --no-notify --rm --no-parent --name rmt -- true`: `hc wait` returned `ended: true, reason: exit`; `hc ls --all` no longer lists it.
- `systemd-run --user --wait --pipe -p Environment=HC_SESSION=akr-probe2 hc ls --json` (a transient user service, no terminal variables): listed the session's terminals. `systemd-run --user -p Environment=HC_SESSION=akr-probe2 timeout 8 hc events --json` from a service: first line a snapshot of all terminals (`seq` 6) with labels, then `foreground`, `created` and `finished` events of other terminals in order.
- Cleanup: `hc kill lb`, `hc server stop`, `~/.local/state/herdr-core/akr-probe2` removed; no `akr-probe2` socket; no `akr-probe*` units left.
- Limits: no long-running service, no `Restart=` behavior, no event stream end observed; label filtering in `hc events` not tried (the listener filters on the labels it receives).

## P10 herdr-app mod surface for notices (notices Q2) — free, documentation
- Read 2026-11-07: `~/.config/herdr-app/herdr.d.ts` of herdr-app 0.1.13: `watchFolder(path): Promise<string[]>` (recursive, changes since the last call return at once, no polling), `notify({title, body?, level?, timeout?, icon?, action?})`, `playSound("blocked")` (honors settings.json sound files), `appHome()`, `readTextFile`, `exec(command, args)` (file removal by `rm`).
- Limits: documentation only; toast drawing, deletion after posting and the closed-window wait are the notices leaves' own live criteria.

## P11 Consultant column, notice handler calls, agy skill folder (leaf review K3, K10, K16) — free
- Run 2026-11-07 by door A, throwaway session `akr-probe3` (clean-env core, `herdrapp --session akr-probe3`), hc 0.1.18, herdr-app 0.1.13, agy 1.5.3. Log: scratchpad `probe/free3.log`, `probe/doc3.json`.
- Labels alone: a `door` terminal and three children `c1..c3` (`--parent door`), all labelled `herdr.space=akp3 herdr.tab=doortab`, started with the window closed: after the window opened all four sat in one `row` of tab `doortab`, order c1, door, c2, c3, weights 0.5/0.25/0.125/0.125. Labels do not build a consultant column.
- One versioned `doc.set` rewriting that tab's root to `row[door block weight 0.65, column "consultants" weight 0.35 [c1, c2, c3 blocks weight 1]]`: accepted (version 3 → 4), `herdr-app status` `errors: []`, re-read showed the column. A fourth child `c4` with the same tab label then joined as a `row` split of the last column child (`column[c1, c2, row[c3, c4]]`), so an added consultant needs the same rewrite. Killing a kept child (`--keep`) left its pane.
- Notice handler calls from a throwaway mod `akrnotify` in that session's home, opened with `herdr-app do tab.new --mod akrnotify`: `exec("ls")` listed `akrogon-notices/n1.json`, `readTextFile` read it, `notify({title, body})` returned id `o2`, `playSound("blocked")` ran, `exec("rm")` exit 0 and the file was gone; `watchFolder` then returned both `n2.json.tmp` and `n2.json` for a temp-then-rename write, so a handler must ignore names not ending in `.json`. `herdr-app check` passed the mod.
- agy global skills: agy 1.5.3's binary documents `~/.gemini/config/skills/<name>/SKILL.md` as the global skill path; that folder already holds symlinked skill folders (omarchy).
- Cleanup: every terminal killed, `herdrapp session stop` and `delete akr-probe3`, state folder removed; no socket, home or state left.
- Limits: `herdr-app shot` returned a stale frame (the window was not repainting), so the column's drawing and the toast's drawing were not seen; the doc and API results above are what was observed. agy loading a linked skill unprompted is herdr-skill's criterion.

## P12 Old plugin registration (leaf review K2) — free, read only
- Run 2026-11-07 by door A: `herdr plugin list` shows `akrogon (akrogon) enabled [local:/home/ivan/.akrogon/releases/67f0b262…/plugin]`; `herdr plugin unlink --help`: `herdr plugin unlink <PLUGIN_ID>`; plugin id `akrogon` in `plugin/herdr-plugin.toml`. herdr 0.9.5.
- Limits: unlink not executed (it would stop the live plugin); deploy-listener-ready's test fakes it and the engine deploy runs it for real.

## P13 Plugin unlink cycle and running builds (final check B9, B5, C6, E1) — free
- Unlink, 2026-11-07, door A, herdr 0.9.5, disposable local plugin `akr-probe-plugin` (manifest only, no startup or hooks) in the scratchpad: `herdr plugin link <dir>` → `plugin_linked`, `herdr plugin list` showed it enabled beside `akrogon`; `herdr plugin unlink akr-probe-plugin` → `{"removed":true}`, exit 0, list no longer shows it; a second unlink → `{"removed":false}`, exit 0 (idempotent). Cleanup: the folder and `~/.config/herdr/plugins/config/akr-probe-plugin` removed, checked; the live `akrogon` plugin untouched. Limits: whether unlinking a plugin whose startup process is running stops that process was not observed (hence unlink runs last in the deploy).
- Running builds, read only: for each `/run/user/1000/herdr-core/<name>.sock` without a dot, `HC_SESSION=<name> hc server status --json` gave `pid` and `version`: `infra` 0.1.18 with `/proc/<pid>/exe` → `~/.local/bin/herdr-core`; `default` and `mdconsultingny` 0.1.17 with `/proc/<pid>/exe` → `~/.local/bin/herdr-core (deleted)` while `hc --version` is 0.1.18 (stale cores detected by both signs). Dotted `*.holder.*` sockets refused `hc server status` (`unavailable`) and started nothing (socket list and state folders unchanged). The window `herdr-app` pid's `/proc/<pid>/exe` → `~/.local/share/herdr-app/herdr-app`, matching `stat -L ~/.local/bin/herdr-app` (inode and mtime); mod code files (`*.js`) under linked mods newer than the window process: several (herdr-setup LESSONS:2 says linked mod folders are not hot-reloaded). Limits: whether this window reloaded those mods was not tested.

## P14 agy loads a linked global skill unprompted (herdr-skill Q2 agy probe; final check B8) — paid, 1 session
- Approved: operator 2026-11-07 final handoff review "2a" (1 agy session). Run by door A: a harmless skill folder `akr-probe-skill` (`SKILL.md`: name, description "Use when anyone asks for the probe word", body holding a random probe word) in the scratchpad, linked as `~/.gemini/config/skills/akr-probe-skill`; clean-env core `akr-probe4`; `hc run --bg --no-parent --name p-agy14 --cwd /home/ivan -- agy --model gemini-3.8-flash-low --effort low --mode auto` (cwd already trusted, no dialog); idle turn 0; `hc send` "What is the probe word? Reply with only the word." agy 1.5.3.
- Result: the screen shows "Explored 1 file (SKILL.md)" and the exact random word; agy followed the symlinked folder in its global skill path without being told about the skill. (A first attempt with a missing cwd failed to spawn; no session started.)
- Cleanup: terminal killed, core stopped, link and folder removed, state folder removed; `~/.gemini/config/skills` back to its three entries; trust list unchanged (cwd was already listed). The agy conversation stays in its own conversation store (agy has no per-conversation delete): one one-prompt conversation in `~/.gemini/antigravity-cli`, owner operator, harmless; it stays as agy history unless the operator clears agy's history (pending the operator's retention answer).
- Limits: one prompt; a description naming the answer directly; does not prove the herdr skill's own description triggers (herdr-skill criterion 2).
