# Opening map: slot D (herdr-app port)

Locks applied from forks/signposts.md `## Taken`: code only for agent start; delete all old with no fallback, but only after new path proven end to end; hc/herdr-app gaps patched in herdr-setup to survive upstream updates; crash notice by event listener, recovery by watch-issues agent, workflow unchanged; global CLAUDE.md/AGENTS.md untouched, one global `herdr` skill fed from herdr-app AGENTS.md linked into pi, Claude Code, Codex; engine first; one live proof per operation per agent kind in a throwaway session within approved budget.

## Territory (inspected)

- Engine boundary is single: `src/shell.ts:226-239` `herdrArgv()`/`herdr()`, session resolved per repo by workspace label at `src/shell.ts:379-406`. Everything else (`next.ts`, `reconcile.ts:429,752`, `phase.ts:56-80`, `verify.ts:328`, `log.ts`, `scope.ts:123`) calls through it. Old model: herdr session per repo, tab per leaf, pane ids in state (`src/state.ts:99-106`: `tab`, `pane {A,B}`, `prompted` = agent session id), agent started into an existing shell pane (`src/next.ts:786-809`), prompt proven via session-file offset (`src/next.ts:819-839`, `src/session-file.ts:11`).
- Trigger today: `plugin/herdr-plugin.toml` (startup `pull --all`, `next --resume`; events status/exited/closed/tab.closed) into `src/next.ts:1603-1630`, which trusts an event only when `HERDR_SOCKET_PATH` matches a running session and ignores `working` events.
- Live now (this session, observed): one hc core holds every repo's terminals (`hc ls`: akrogon, framework, portal, herdr-setup together; `hidden_finished: 17`). Repo = herdr-app space (`herdr-app ls`: space `akrogon` `sp2209…`, tabs `c-akrogon` etc.). Consultants are hc children with panes: `hc get t6f` shows `parent: t15`, labels `herdr.space`/`herdr.tab`, `keep: true`, `die_with_parent: true`, `turn`, `status {app, state}`, foreground argv/pid. No agent session id anywhere in `hc get` output.
- `hc events` exists with `--terminal`, `--children-of`, `--label` filters, one JSON line per fact change when piped (`hc events --help`). `hc ls --label` also filters. Names are 1-32 chars `[a-z0-9-_]` (`hc run --help`).
- No notify CLI: `herdr-app commands` has no notify/toast command (grep, 154 commands). `notify()` is a mod-only API (`~/.config/herdr-app/herdr.d.ts:365-367`). Akrogon already ships and installs a herdr-app mod: `herdr-app/tasks/` via `src/install.ts:29-48`.
- herdr-setup today (`/home/ivan/Work/infra/herdr-setup`): `install` symlinks cloned mods/layouts/keys into `~/.config/herdr-app` (clones carry `cloned_from`, e.g. `mods/agents-by-tab/mod.json:4`; README warns clones do not receive upstream updates) and `bin/herdrapp` gives each session its own core via `HC_SESSION` plus app home. Its README flags `HC_SESSION` as undocumented upstream: "a Herdr update could change it". No binary patching exists there.
- Global skill homes all hold the OLD skill as real files (10746 bytes each): `~/.claude/skills/herdr/SKILL.md`, `~/.pi/agent/skills/herdr/`, `~/.codex/skills/herdr/`. Symlinked skill dirs already work for akrogon skills (`~/.claude/skills/chart-issues -> ~/.akrogon/current/skills/chart-issues`). Agy skill home: none found (low confidence).
- Global config harnesses are only `claude`, `codex`, `pi` (`~/.akrogon/config.yaml:11`); agy appears only as ad-hoc chart consultants. Launch argv comes from `src/next.ts:294-302` (config line, `{model}`/`{effort}`, must start with harness name).
- systemd is already akrogon's home for always-on work: `systemd/akrogon.slice` installed by `src/install.ts:37-38,145`; verify/land run as user units (src/AREA.md). Pane boxing is one call: `pane process-info` shell pid at `src/scope.ts:123-131`, then busctl moves that shell into the leaf slice.
- Sizes: `tests/fake-herdr.ts` 524 lines; chart scripts peer-create 105, peer-ask 141, peer-wait 347, peer-anchor 84, peer-restart 280, door-reset 295, chart-usage 720; watch observe.ts 272. Tests already fake by exe override (`herdrArgv` exe opt, `FAKE_HERDR`, `OBSERVE_HERDR` in `skills/watch-issues/SKILL.md:26`).

## Forks

F1. What does "repo" map to: one shared hc session with a space per repo, or one `HC_SESSION` per repo?
- 1a (lean) Shared session (the operator's live one), space per repo, labels `akrogon.repo/slug/slot` as engine discovery. Matches live use above; consultant name collisions in the intake already prove the shared world. Breaks/invites: every name must be repo-scoped (leaf slots too, not only consultants); the listener sees every repo and must filter by label; one core restart hits all repos at once.
- 1b `HC_SESSION` per repo (herdrapp already builds this). Cleaner isolation, old `resolveSession` maps 1:1. Invites: many windows/cores, a listener per session, work invisible in the window the operator is actually looking at, and dependence on undocumented `HC_SESSION`.

F2. How does the start step (the only code, per Taken 1a) place the pane?
- 2a (lean for consultants) `hc run --bg` as door's child, then `herdr-app do terminal.keep --place right/down` in seat order, retry until `herdr-app ls` lists the pane, restore focus to A. Proven by hand in intake; equal heights reportedly reachable by placement order (signposts Q3 note, four seats, needs probe for 2/3/5).
- 2b Labels only (`hc run --label herdr.space/tab`): one call, but placement is side-by-side arrival order (intake), so the column rule fails silently.
- 2c `herdr-app do tab.new --argv … --task …` (lean candidate for leaf tabs): app creates tab+pane+agent. Unknown: hc parent of that terminal, first-message proof, shell left behind after agent exit (AGENTS.md: agents run in a shell that stays open). Invites two different start paths to keep consistent.
- Later risk for 2a/2c: both are focus- and window-dependent. Engine dispatch while the operator types, or with the herdr-app window closed, is unproven (probe E2/E12).

F3. Who is a leaf slot's hc parent, and does it outlive?
- 3a (lean) Leaf slots: `--no-parent` (or `--outlive-parent`) plus `--keep`, deterministic names. There is no agent parent to receive sends; the engine reacts to events/state, as today. Consultants: children of the door, die with it, restart from seat record.
- 3b Leaf slots as children of a long-lived listener terminal. Invites: listener death kills all running leaves; `hc send` reports would type into a non-agent shell.
- Later risk of 3a: hc's own blocked/error/exit notes have nowhere to go (`--no-notify` semantics), so listener + watcher coverage must be total, and reconcile must find orphans by label/name, never by parent.

F4. Listener form (Taken 4a): systemd user service, hc terminal loop, or herdr-app mod?
- 4a (lean) One systemd user service per hc session running `hc events --label …` and invoking `akrogon next` per relevant event; on (re)start it first runs the resume sweep, replacing plugin startup hooks. Fits existing install (`src/install.ts:145` daemon-reload, units already used).
- 4b A mod `exec`s akrogon on shared-state changes. Dies with window/layout choices; mods are UI-lifetime.
- 4c An hc terminal running a shell loop. Visible, but killable by accident and needs its own pane/tab home.
- Later risks for 4a: service environment (does a user service reach the hc socket in `/run/user/<uid>/herdr-core/`? sandboxed codex could not, intake 2026-11-05); event storms need the old coalescing (ignore `working`, `src/next.ts:1609`) plus single-flight; `hc events` stream ends on core loss (hc --skill: streams end, reattach), so service must restart and re-sweep, never assume continuity.

F5. What identity does leaf state store after pane ids?
- 5a (lean) Deterministic hc name per slot (repo prefix + slug + slot, truncated with hash suffix to fit 32 chars, like the hash name at `src/next.ts:788`), labels as rediscovery truth, space/tab ids re-read from `herdr-app ls` when needed. State stores name only.
- 5b Store address (`t6f`) + name. Addresses change on restart (intake), so every reader needs a stale-address path forever.
- Later risk: finished terminals may hold names (`hidden_finished: 17` observed). Start must `hc rm` a finished same-name terminal before reuse (probe E5).

F6. Prompt delivery proof without `agent_session`?
Current proof is session-file offset (`src/next.ts:819-839`). Options:
- 6a (lean) First task inside `hc run` argv (9/9 in intake) and verify `first_message.sent` via `hc get` (hc --skill says it persists); later prompts verified by `turn` advancing / status leaving idle in `hc get`, read screen before any resend.
- 6b Rediscover each harness's session file by cwd+start time and keep offset proof. Per-harness forever, and `src/session-file.ts` today only resolves pi-style ids.
- Later risk of 6a: codex `/new` turn miscount (intake) if any flow still sends slash commands; kill-restart reset removes that path for consultants, leaf phase prompts must also never rely on slash commands from outside.

F7. Per-seat usage and seat records: drop, or rebuild?
`chart-usage.ts` (720 lines) requires `session` per seat (`seatSchema`); `hc get` has none.
- 7a (lean, matches Taken 2a) Drop usage measurement; seats.yaml holds seat, kind, argv, hc name, start time. If the operator wants usage back later it is a new chart, not a port tax.
- 7b Scrape harness session files (pi `~/.pi/agent/sessions`, claude/codex equivalents) keyed by terminal cwd+created_ms. Four scrapers, each an upstream format bet.

F8. Notifications after `notification show` (`src/next.ts:1046-1075`, `src/verify.ts:328`, watch SKILL.md:42)?
- 8a (lean) Delete akrogon notices where herdr-app already toasts done/blocked with sound (settings `sounds`, AGENTS.md). For merge/busy notices the operator still wants, one small mod exposing a command that calls `notify()` (`herdr.d.ts:365`), owned per F10 below.
- 8b Keep every notice through a mod from day one.
- Later risk: old callers record `shown`/`reason` and retry (`src/verify.ts` notice field, AREA.md). A fire-and-forget mod breaks that contract; either the mod command returns shown=true only after posting, or those records lose meaning and should be deleted with the notices.

F9. systemd boxing of agent panes: drop (Taken 2a lists it droppable) or wrap?
Today the agent's shell is moved into the leaf slice; `stop` and reconcile kill by slice, which also kills descendant processes (dev servers an agent started).
- 9a Wrap the harness argv inside `hc run` with the existing scope argv (`src/scope.ts:45-64` runUnitArgv pattern), so leaf slice semantics survive unchanged. Unknown: does OSC 7501 status still report through the wrapper, and what does `hc get` foreground show (probe E8)?
- 9b (lean only if E8 fails) Drop boxing; stop = `hc kill` by name. Later risk: grandchild processes survive a kill and hold worktree files/ports; reconcile's slice vetoes lose their subject.

F10. Where does the notify mod (and any other gap patch) live: akrogon repo or herdr-setup?
Taken 3 says gaps are patched in herdr-setup to survive updates. But akrogon already installs its own mod (`herdr-app/tasks`, `src/install.ts:29-48`), while herdr-setup's survival mechanism is clones, which drift (herdr-setup README).
- 10a (lean) Rule per patch: if it uses only public mod APIs (`herdr.d.ts`) it survives in either repo; put akrogon-workflow mods (notify for akrogon notices, Tasks) in akrogon where their callers and tests are, and only pure herdr-app behaviour patches (layout, keys, cloned shipped mods) in herdr-setup. Explicitly confirm this split with the operator, since Taken 3 can be read as herdr-setup for all patches.
- 10b All patches in herdr-setup, including akrogon notify. Invites cross-repo version skew: engine expects a mod command herdr-setup may not have installed yet.

F11. Global `herdr` skill mechanism (Taken 5a; operator proposed a symlink to AGENTS.md)?
Problem: a skill needs frontmatter; `~/.config/herdr-app/AGENTS.md` has none, is rewritten every app start, and is ~950 lines of mod/layout authoring. `hc --skill` is the agent-facing manual.
- 11a (lean) Tiny owned SKILL.md (frontmatter gated on `HC_TERMINAL_ID`, body: run `hc --skill`; read `$HERDR_APP_HOME/AGENTS.md` only when changing the window/mods). It points, never copies, so upstream updates flow automatically. One source (herdr-setup or akrogon `skills/`?) symlinked as a directory into the three homes, replacing the real old folders.
- 11b Literal symlink `SKILL.md -> ~/.config/herdr-app/AGENTS.md`. Likely not discovered as a skill at all (no frontmatter) - probe E10 decides cheaply.
- 11c Generated copy (frontmatter + AGENTS.md) refreshed by herdr-setup install. Goes stale between app updates and loads 950 lines for a simple `hc send` question.
- Later risk: skill triggering is description-based; outside herdr-core the body must refuse fast (env check), as the old skill did with `HERDR_ENV`.

F12. One start implementation or two?
Engine starts leaf slots from `src/`; chart door starts consultants from skill text. Taken 1a allows code only for start.
- 12a (lean) One `akrogon` CLI start command (name, labels, pane placement, harness argv incl. codex `sandbox_workspace_write.network_access=true` from intake 2026-11-05) called by both engine internals and chart skill text. Consultant argv still comes from the seat record the door writes.
- 12b Engine function plus a small chart-skill script duplicating placement logic. Two places to fix when keep/placement behaviour changes upstream.

F13. Tests: fake hc shape?
- 13a (lean) Keep the exe-override pattern: `tests/fake-hc.ts` and a fake `herdr-app` (only `do terminal.keep/pane.focus`, `ls`) emitting captured real JSON shapes (from `hc get`/`hc ls` above). Each port leaf carries its own fake extensions; no separate test leaf at the end.
- 13b Live-only e2e in throwaway sessions. Slow, paid, flaky as CI; still required once as cutover proof (Taken 2a/7a), not as the suite.

## Practitioner questions (intake does not answer)

Q1. Which hc session do repos live in - the operator's daily one (currently `infra`-style shared use) or `default`? Is that a per-repo config key, a global config key, or "wherever the engine runs" from `HC_SESSION` env? The listener service must pin the same answer.
Q2. What starts the listener and the hc core at login, before any herdr-app window opens? Does `hc events` from a systemd user service auto-start the core, and is that desirable at boot?
Q3. Leaf slot naming scheme: consultant rule is `<repo>-slot-<letter>`; leaf names need slug+slot within 32 chars. What truncation keeps names operator-readable in `hc ls`?
Q4. Two doors on the same repo at once both want `ak-slot-b`. Is that supported (second door refused) or do names need a door discriminator?
Q5. Must leaf-slot codex also get `network_access=true`? Leaf agents do not `hc send` today, but their own sub-agents and any future report step need the socket. Decide once in the start command (F12), not per skill.
Q6. Agy: leaf harnesses are claude/codex/pi only, but chart consultants include agy. Does agy get a global-config harness entry (one argv source) or stay seat-record-only? And Taken 5a links the herdr skill into pi/Claude/Codex only - is agy deliberately out?
Q7. Focus: placement steps call `pane.focus`/`terminal.keep` against the operator's live window. Old code restored focus after dispatch (`src/next.ts:641-669`). Is focus restore required behaviour for engine-started leaf tabs too, or should a new leaf tab never take focus at all?
Q8. Tasks board click-to-pane (intake carry from tasks-hierarchy): in this epic or its own? It needs the status producer to emit each seat's terminal address and the mod to run `pane.focus` (`herdr-app/tasks/main.js` currently never focuses a terminal).
Q9. Rollback boundary: `akrogon rollback` flips to the previous release (`src/rollback.ts` per src/AREA.md). After old code is deleted, rolling back resurrects herdr calls against a machine with no old herdr. Is rollback across the cutover refused, or is the cutover leaf marked no-rollback?
Q10. `learnings/history/` mentions: rewrite history files to remove herdr wording, or are history files exempt from "no herdr wording anywhere"?
Q11. Who removes the old herdr binary, its plugin link, and `~/.config/herdr` on the machine, in which step? `akrogon install` removing another program's install is a new kind of reach.
Q12. Watch-issues itself runs as a Claude Code cron session: must that session live in a herdr-app terminal (for `HC_*` env and socket access), and who starts it after a reboot?

## Pitfalls over lifetime

P1. Upstream update rewrites AGENTS.md, changes `hc get` JSON, or removes undocumented `HC_SESSION`. Removed by: engine parses `hc` output with loose schemas at one boundary (as `src/shell.ts` does now), skill points instead of copying (F11a), and `akrogon install` checks `hc -V` and names a minimum version.
P2. Core update/restart: kept terminals come back as shells, agents gone, turns frozen (hc --skill keep semantics). A leaf then looks idle-dead forever. Removed by: listener resume sweep treats "terminal live, foreground is shell, state expected an agent" as a crashed seat for watcher/next recovery. Never auto-resend the prompt (duplicate work).
P3. Operator backgrounds Claude (`/bg`): status null, agent shows as bash (intake 2026-11-04). Engine or watcher acting on null status can double-dispatch or kill live work. Removed by: done-criterion - unknown status means hands off, in engine, watcher, and start.
P4. Codex reports `working` while blocked on a question (intake): stall notices and watcher steers fire on a waiting agent. No herdr-setup patch can fix codex's OSC reporting. Removed by: codex stall judged from screen/log evidence, not status duration alone (watch-issues already judges busy seats from logs, SKILL.md:44).
P5. `terminal.keep` pending race places panes wrong or not at all (intake, repeated). Removed by: start command retries until `herdr-app ls` shows the pane in the right tab and fails loud otherwise - "started" without a visible pane is a failed start (lock).
P6. Sandboxed codex silently cannot `hc send` (intake 2026-11-05). Removed by: network flag baked into the one start command (F12) plus probe E7 per release of codex argv.
P7. Late `done` from a killed/replaced seat arrives and is acted on (intake). Removed by: brief report line carrying the return path is judged against the file on disk and the seat's current name/generation in seats.yaml, stated in chart skill text.
P8. Open leaves at cutover hold pane/tab ids and `prompted` session ids; new strict state schema (`src/state.ts:86` strictObject) will refuse or misread them. Removed by: operator step - drain or explicitly abandon every open leaf (all registered repos) before the engine leaf lands; list them in the cutover leaf's done-criteria.
P9. Deleting old code before e2e proof violates Taken 2a, but keeping both paths violates one-cutover. Removed by: order inside the epic - new engine leaf proves one real leaf end to end in the live session; deletion sweep is the last leaf and its brief cites that proof.
P10. Grandchild processes (servers, test watchers) survive `hc kill` if boxing is dropped. Removed by: probe E8 decides F9 before engine handoff; if wrap fails, reconcile needs a named replacement veto (cwd/process scan already partly exists via `/proc` checks in `src/scope.ts`).
P11. The listener is a single point of silence: if the service is down, leaves finish and nothing moves, with no error anywhere. Removed by: `akrogon status` showing listener liveness (service active + last event time), and the watcher treating "listener down" as a notify condition.
P12. Event-driven `next` passes at hc event frequency (status flaps, turn changes) cost CPU/git scans per pass. Removed by: filter at `hc events --label`, ignore `working` as today, coalesce bursts before a pass (design point in listener leaf).

## Proposed split

Destination A: akrogon repo (one epic, engine first per Taken 6a)
- L1 Engine core (direct/door-built, first): `src/shell.ts` hc + herdr-app boundary, `src/next.ts` allocate/dispatch/prompt on names+labels, state identity change, the one start command (F12), listener service + install wiring, plugin removed. Fake hc/herdr-app born here with its tests. Depends on probes E1-E6, E8.
- L2 Engine rest: `reconcile.ts`, `scope.ts`, `phase.ts`, `log.ts`, `verify.ts` notices, `self-update.ts` (drop `herdr plugin link`), `install.ts` (drop `herdr integration install`). Depends on L1 boundary and identity.
- L3 Chart-issues skill: delete peer-create/peer-wait/peer-anchor, peer-ask/peer-restart become skill-text `hc send`/kill+start via the L1 start command, door-reset shrink to A-only, seats.yaml without session, chart-usage deleted (or kept per F7). Depends on L1 start command; groundwork (brief/report wording) can start in parallel.
- L4 Watch-issues: observe.ts on `hc ls --label`/`hc get`, steer via `hc interrupt`/`hc read`/`hc send`, fixtures replaced, workflow text otherwise unchanged (Taken 4a). Depends on L1 identity; parallel with L3.
- L5 Tasks board focus: status producer emits seat terminal, mod click runs `pane.focus`. Depends on L1 identity; parallel with L3/L4. (Only if Q8 says in-epic.)
- L6 Deletion sweep (last, after L1 e2e proof recorded): `plugin/`, `tests/fake-herdr.ts`, docs/README/learnings wording, `src/AREA.md` session model. Depends on L1-L4 landed and proven.

Destination B: herdr-setup repo
- H1 Global `herdr` skill: owned pointer SKILL.md (F11a), `install` links it into the three harness homes and removes the old skill bodies. Independent - can land first, in parallel with charting. (If F11 ownership goes to akrogon instead, this becomes an akrogon leaf.)
- H2 Notify mod, only if F8/F10 place it here. Depends on F8 answer; L2 then depends on H2's command name.

Destination C: operator's machine (no repo)
- M1 Before L1 lands: drain/abandon open leaves in every registered repo (P8). Operator step, listed per repo.
- M2 At cutover: remove old `herdr` plugin link and binary, `~/.config/herdr`; enable the listener service; confirm which hc session repos live in (Q1). Sequenced in L6's brief as operator steps with exact commands.

Only real dependencies order work: L1 before L2/L3-start/L4/L5; H2 before L2 only if F10b; L6 after proof. L3 text, L4, L5, H1 are parallel-safe (different outputs, shared input is L1's names/start command).

## External operations needing one live observation (Taken 7a)

Method from intake: throwaway session, `HERDR_APP_HOME=~/.config/herdr-app-sessions/probe`, `HC_SESSION=probe`, unset `HC_TERMINAL_SOCKET/ID/SCOPE`; stop+delete after. Already proven, do not re-buy: first task in `hc run` (9/9), later `hc send` (9/9), kill+restart same name, codex sandbox socket fix.

- E1 Start per kind with the real start argv (claude, codex --no-daemon, pi, agy `-i`): `hc run --bg --name probe-x --cwd <tmp repo> <argv> "write <file>, then hc send <parent> done"`; assert return file, parent receives `<hc …>`, `hc get` shows `first_message.sent`. Parent = one cheap pi terminal in the probe session.
- E2 Pane placement: start 2, 3, then 4 consultants, `terminal.keep` right/down in order, assert column order and equal heights from `herdr-app ls` + `herdr-app shot`. Repeat once with the probe window closed (window closed at dispatch time is the engine's normal case at night).
- E3 `hc events --label akrogon.probe=1` capture: status change, exit, `hc kill`, and core restart (`hc server restart` in probe session only). Record exact JSON shapes and what ends the stream.
- E4 Later-task delivery proof: `hc send` to `idle` and to `done` seats, no `--if`; `hc get` before/after for `turn` advance. Once per kind.
- E5 Name reuse: kill a seat, `hc run --name <same>` before and after `hc rm`; record `name_taken` behaviour with finished terminals present.
- E6 Parentage: `hc run --no-parent --keep` from a plain shell (not a terminal, like systemd would); kill the starting shell; assert terminal lives, and note where blocked/exit notes go (expected: nowhere).
- E7 Codex leaf argv from global config with `-s workspace-write -c sandbox_workspace_write.network_access=true`: seat runs `hc ls` itself. (Consultant form proven in intake; leaf argv differs.)
- E8 systemd-wrapped harness: `hc run --bg -- systemd-run --user --scope … <harness argv>`; assert OSC status in `hc get`, and that stopping the scope kills agent + a child server it started.
- E9 Notify mod command: smallest mod with a `nextCommand` notify handler in the probe home, `herdr-app check`, invoke from CLI, assert toast via `herdr-app shot`. Mechanism for CLI-invoking a mod command is low confidence until this runs.
- E10 Skill discovery: link F11a skill dir and, separately, an F11b literal symlink, into one harness home at a time; ask each agent (cheap model) to use `/herdr`. Assert which form loads in pi, Claude Code, Codex.
- E11 Watcher steer primitives per kind: `hc interrupt` on a working seat, then `hc read` shows idle with empty input, then corrective `hc send` starts a new turn.
- E12 `herdr-app do tab.new --argv '["pi",…]' --task "…"`: record resulting terminal's `parent`, labels, first-message handling, and what remains after the agent exits (leaf-tab candidate, F2c).
