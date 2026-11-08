# Signposts angles from C (herdr-app chart)

Settled in the intake, not asked again: one cutover with no compatibility layer or fallback; every agent terminal gets a visible pane in its start step and after restart, owned by the start helper; consultant names `<repo prefix>-slot-<letter>`; A left 50%, consultants stacked right in order; chart folder exists from open, no temp paths; consultant reset is kill and restart, never `/clear` by send; a child's own `hc send` report is the finish signal, one bounded wait is the net; no polling anywhere; codex sandboxed runs carry `sandbox_workspace_write.network_access=true`; removing over adding, large deletions expected.

## Q1 Who triggers the engine once the plugin is gone?
Today `plugin/herdr-plugin.toml` fires `akrogon next` on four pane events and `src/next.ts:1605,1615` reads `HERDR_PLUGIN_EVENT_JSON` and `HERDR_SOCKET_PATH`. hc has no plugins; it has `hc events --json --label k=v` (a push stream, not a poll).
- O1 A resident follower: one systemd user service runs `hc events --label akrogon=1` and calls `next` on status, turn and exit changes. Startup `pull --all` and `next --resume` run when the service starts.
- O2 The slot itself: the brief's last line runs `akrogon next <slug>` (or `hc send` to a coordinator terminal). No resident process.
- O3 A herdr-app mod (akrogon already installs `herdr-app/<name>` mods, `src/AREA.md` install line) that watches `agents()` and execs `next`.
- Recommend O1. A crashed, exited or blocked slot sends nothing, and only the event stream sees that; O3 dies with the window.
- Steers: what replaces `plugin/`, `install.ts` (unit instead of `plugin link`), the hook-event schema in `next.ts`, whether `next` keeps a per-event entry at all, what tests feed the engine.

## Q2 Parentage and lifetime: who owns each agent terminal?
`hc run` has `--parent`, `--no-parent`, `--outlive-parent`; by default a child ends with its parent, and `hc` types notes about children into the parent.
- O1 Leaf slots: `--no-parent`, found by labels only; consultants and direct-route reviewers: children of the door, die with it.
- O2 Everything is a child of whoever started it, all with `--outlive-parent`.
- O3 Leaf B is a child of leaf A (A gets B's notes for free), both outlive.
- Recommend O1. A leaf must survive any door, window or follower restart; a consultant left alive after its door dies only spends money, and the intake already found children die with a killed parent terminal.
- Steers: the start helper's flags, `reconcile.ts` liveness vetoes, what a door crash does to seats, whether `hc` child notes are ever read by akrogon.

## Q3 Seat identity: what is the key, and does usage still need a session id?
State stores pane ids (`src/state.ts:99`); seat records, usage and end-of-turn signals key on `agent_session.value` (`skills/chart-issues/SKILL.md:39`). `hc get t15 --json` gives address, name, labels, foreground pid and status, no agent session id. Addresses change on restart.
- O1 Key on hc name plus akrogon labels (`akrogon.repo`, `akrogon.leaf`, `akrogon.seat`) in the one shared hc session; the session id becomes optional, found by a per-harness lookup only when usage is wanted.
- O2 Key on hc address, re-resolved after every restart.
- O3 One `HC_SESSION` per repo, so `--session` maps one-to-one and `resolveSession` (`src/shell.ts:379`) survives.
- Recommend O1. Names are what the operator already uses to restart, labels are what `hc events --label` filters on, and O3 splits the window the operator works in.
- Steers: `state.ts` schema, deletion of `resolveSession` and `herdrArgv` (`shell.ts:226`), seats.yaml shape, whether usage measurement stays in this epic, how the Tasks board jumps to a pane.

## Q4 Notices: port `notification show` or drop the class?
Busy, merge, main-red and slow notices all go through `herdr notification show` (`src/next.ts:249`, `src/verify.ts`, watch-issues). hc has no notify; herdr-app's `notify` is reachable only from a mod, and herdr-app already toasts and plays sounds on `blocked` and `done`.
- O1 Drop the class: the engine writes the condition into state, the shipped Tasks board shows it as a Needs-you row, herdr-app's own alerts cover blocked and done.
- O2 Add a small notify path: the Tasks mod posts `notify()` for conditions the engine writes.
- O3 Desktop `notify-send`.
- Recommend O1 first, O2 only where the operator says a toast is missing. One fewer moving part, and the board is already installed.
- Steers: `STALL_MS` logic (`next.ts:220`), verify notice records, watch-issues notices, whether a mod change is in this epic.

## Q5 Awareness: how does an agent know it runs inside herdr-core?
The operator's open debate. `~/.claude/skills/herdr` is loaded only when the agent thinks of it and checks `HERDR_ENV`; herdr-app sets `HC_TERMINAL_ID`, `HC_SESSION`, `HERDR_APP_HOME`.
- O1 Two layers: every akrogon brief states it (akrogon owns its agents), and one env-gated line in the global CLAUDE.md/AGENTS.md ("if `HC_TERMINAL_ID` is set, run `hc --skill`") covers agents outside akrogon. The old herdr skill is deleted, not replaced.
- O2 Replace the herdr skill with an hc skill, nothing in global instructions.
- O3 Briefs only; outside akrogon nothing changes.
- Recommend O1. The operator wants awareness every time, and only an always-read file gives that; one gated line is not pollution, a skill is opt-in by the agent.
- Steers: brief templates in every skill, whether `akrogon install` owns the global line and the skill removal or the operator does it by hand, what the chart door's "outside herdr" rule (`SKILL.md:27,137`) becomes.

## Q6 Tests: fake `hc` or real `hc` in a throwaway session?
`tests/fake-herdr.ts` re-encodes herdr semantics (rects, `agent_session`, `tests/fake-herdr.ts:12-30`) and 48 test files mention herdr. The hc manual says tests need their own `HC_SESSION` and scratch XDG paths, so real hc in tests is a supported path.
- O1 Real hc: each test run gets `HC_SESSION=test-<id>`; akrogon's hc boundary is one thin module tested against the real binary.
- O2 A fake `hc` like the fake herdr.
- O3 Record real hc transcripts once, replay them.
- Recommend O1. The things hc got wrong in testing (`started: true` not proof, early `--wait` return, `done` vs `idle`) are exactly what a fake hides.
- Steers: `tests/isolation.ts`, `tests/helpers.ts`, CI prerequisites, how slow the suite may get, how much of the 703 lines is deleted versus rewritten.

## Q7 Order and drops inside the epic
- O1 Start helper (names, labels, pane placement, per-harness argv) first, then engine trigger and leaf slots, then chart door, then watch-issues, docs and learnings last. watch-issues loses its observe half (it polls on a cron, which the operator ruled out) and keeps only the judge, retriggered by the follower. `peer-create`, `peer-wait`, `peer-anchor`, `door-reset` deleted; `pane swap` repair deleted.
- O2 Door first, since nothing else can be charted in herdr-app until it works.
- O3 Same as O1 but drop watch-issues whole and re-intake it after the port.
- Recommend O1. Both the door and the engine call the start helper, so it is the one shared leaf; and the judge's loop and recovery rules have no other home.
- Steers: leaf dependency graph, whether the epic blocks on any herdr-app feature (equal heights, a notify CLI, codex `working` on questions) or files feedback and ships with today's behavior (recommend ship today, feedback separately).
