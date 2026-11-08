# Map C: port akrogon from old herdr to herdr-core and herdr-app

Locks honored: code only for the agent start step (1a); old removed after an end-to-end proof (2a); gaps patched in herdr-setup (3); crash recovery stays with watch-issues (4a); global instructions untouched, one global `herdr` skill fed from herdr-app's AGENTS.md linked into pi, Claude Code, Codex (5a); engine first (6a); one live proof per operation per agent kind in a throwaway session (7a).

## 1. Material forks

F1. What replaces the plugin as the engine's trigger? Today `plugin/herdr-plugin.toml` runs `next` on four pane events plus startup `pull --all` and `next --resume`; `src/next.ts:81-105` parses them, `:1605,1615` reads `HERDR_PLUGIN_EVENT_JSON` and `HERDR_SOCKET_PATH`.
- O1 A follower: one systemd user unit (akrogon already installs `systemd/akrogon.slice`, `src/install.ts:37`) runs `hc events --json --label akrogon.repo=<x>` and calls `akrogon next` on `status`, `finished` and `turn` events (types seen in `hc schema`; a live `hc events --json` first prints a full snapshot, then one JSON-RPC line per change, mostly `title`). Startup work runs when the unit starts.
- O2 The seat ends its brief with `akrogon next <slug>` (the seat sends, nothing listens).
- O3 A herdr-app mod watching `agents()` and execing `next` (the Tasks mod already execs `akrogon status --json`, `herdr-app/tasks/main.js:116`).
- Lean O1. O2 cannot see a crash or exit (4a needs that signal), O3 dies with the window. Risk later: a follower that misses events while restarting; remove it by having `next` stay idempotent over a full re-read (it already re-reads state every pass) and by one catch-up pass at unit start.
- Under 1a, is a follower "code for the start step"? It is engine wiring, not an hc step a skill could do. Flag for the operator.

F2. What is a seat's identity in state? `state.pane.A/B` holds pane ids (`src/state.ts:99`), `log.ts:36-51` and seats.yaml key on `agent_session.value`; `hc get <t> --json` has address, `name`, `labels`, `parent`, `foreground.pid`, `status`, `argv`, no agent session id. Finished terminals keep `argv` and `name` (seen in the `hc events` snapshot for t2s, t69).
- O1 Store the hc name (`ak-<slug>-a`, unique per session) and labels `akrogon.repo`, `akrogon.leaf`, `akrogon.seat`; resolve address per call. Session id becomes optional: pi's is found by `sessionFile` (`src/session-file.ts:11`), the others only when usage is asked for.
- O2 Store the address, re-resolve after every restart.
- Lean O1. Names are what restarts reuse (intake, 2026-10-30 test 3), labels are what `hc events --label` filters on. Later risk: the name-taken failure across doors (intake, framework door) applies to leaf names too, so the name must carry the repo prefix.

F3. Parentage and lifetime. Default: a child ends with its parent, `--outlive-parent` keeps it, `--no-parent` detaches (`hc run --help`); killed consultants in the snapshot all show `die_with_parent: true`.
- O1 Leaf seats `--no-parent` (or started by the follower unit, which is no agent); consultants and direct-route reviewers stay children of the door and die with it.
- O2 Everything `--outlive-parent`.
- Lean O1. A leaf must survive a door or window restart; an orphaned consultant only spends money. Risk: with no parent, nobody receives hc's child notes for leaf seats, so the follower is the only listener (ties to F1).

F4. Prompt delivery and the "started is not proof" problem. Today `agent prompt --wait --until working --timeout 5000` (`src/next.ts:827`) and `deliveredAfter` on pi's session file (`session-file.ts`). hc: first task in `hc run` with `first_message.sent` recorded in `hc get`, later tasks by `hc send` (plain, no `--if`, intake 2026-11-03), `--wait` can return `not_started`.
- O1 First prompt always travels in `hc run`; a seat that needs a second prompt is killed and re-run under the same name with the new task (one path, no send).
- O2 `hc run` for the first, `hc send` for later prompts, checked by `turn` advancing in `hc get`.
- Lean O2 for leaf seats (a kill loses the seat's context between phases A keeps, e.g. plan then implement), O1 for consultants (intake: reset is kill and restart). Risk: `hc send` to a `blocked` seat is refused; the engine must record that as `delivery_error` (`state.ts:26`) and not retry.

F5. Notices. `notification show` carries busy, merged, main-red and slow notices (`src/next.ts:249,1043-1060`, `src/verify.ts:328-353`, watch-issues). hc has no notify; herdr-app `notify()` exists only inside a mod; herdr-app already toasts `blocked` and `done`.
- O1 Engine writes the condition into state, the Tasks board (installed by `install.ts:47`) shows it; no toast.
- O2 A herdr-setup mod (`needs-you` already exists in `herdr-setup/mods`) posts `notify()` from `akrogon status --json`.
- Lean O2 through herdr-setup: it honors lock 3 and keeps the operator's "needs you" sound, with O1 as the data path either way. Risk: a mod only runs while the window is open; acceptable since the notice is for the person looking.

F6. The pane step: `hc run --label herdr.space --label herdr.tab` places a pane side by side; a column needs `terminal.keep --place right/down` after `pane.focus`, with a ~2 s settle and halving weights (intake 2026-11-03 and 2026-11-06 findings: equal only for 2, 4, 8 seats).
- O1 Start helper labels at run and then re-places with keep/park, retrying until `herdr-app ls` shows the pane.
- O2 Start helper runs the seat unlabeled, then `terminal.keep` in order (no park step).
- O3 Patch: a herdr-setup mod or layout that lays out a tab's terminals by label order (`akrogon.seat`), so the helper only labels.
- Lean O2 now, O3 as the herdr-setup leaf if three-seat equal heights or the keep race keep biting. Risk of O1/O2: every restart repeats the dance (intake: "Every seat restart lost its pane placement").

F7. Containment. `scope.ts:121` gets the shell pid from `pane process-info` and boxes it with busctl; `hc get` gives `pid` (the terminal's shell) and `foreground.pid`.
- O1 Keep boxing, pid from `hc get`. O2 Drop boxing.
- Lean O1: only the lookup is herdr-specific, and dropping widens the epic. Low confidence that herdr-core's holder tolerates its shell moving cgroup; needs the probe in section 5.

F8. Tests. `tests/fake-herdr.ts` plus `tests/isolation.ts:64-78` and `helpers.ts:132-146` build a fake binary; 15 test files hold most of the 703 lines (`phase.test.ts` 81, `merge-attempts` 75, `batch-merge` 75).
- O1 A fake `hc` with the same shape. O2 Real hc under a test-only `HC_SESSION` (manual: "Tests need their own HC_SESSION and scratch XDG paths").
- Lean O2 for the thin hc boundary, with the engine's unit tests mocking only that module. The behaviors hc got wrong (started not proof, early `--wait` return, `done` vs `idle`) are what a fake would hide. Risk: CI needs hc installed and a core per worker; measure suite time before committing.

F9. The global `herdr` skill (5a). `~/.claude/skills/herdr` is a real folder; akrogon links skills into `.claude/skills`, `.agents/skills`, `.codex/skills`, `.pi/agent/skills` (`src/install.ts:25`). herdr-app rewrites `AGENTS.md` on every start ("Edits here are overwritten"), and it has no skill frontmatter.
- O1 A `herdr` skill folder in herdr-setup whose `SKILL.md` has frontmatter plus two lines: read `~/.config/herdr-app/AGENTS.md`, run `hc --skill`; linked into the four roots by herdr-setup's `install`.
- O2 `SKILL.md` as a symlink to AGENTS.md itself (the operator's wording).
- Lean O1. O2 has no frontmatter, so pi, Claude Code and Codex may not list it (low confidence per harness; probe in section 5), and a symlink into a file the app rewrites is fine for content but gives no trigger text. Either way the old `~/.claude/skills/herdr` is removed in the same step.

## 2. Practitioner questions
- Which process is the engine's owner now that no plugin host exists: a user unit per machine, per repo, or per hc session? `HC_SESSION` must be in its environment or `hc` starts its own core (intake 2026-11-05).
- `next` resolves a repo by workspace label (`src/shell.ts:379-406`). With one hc session and spaces per repo, is the repo found by `cwd` of the terminal, by `akrogon.repo` label, or by `herdr.space`? Label is the only one akrogon controls.
- What does `akrogon status --json` report as the seat for the Tasks board jump (intake carry 2026-11-04): hc address at read time, by name?
- Codex reports `working` during a question (intake 2026-11-03): does STALL_MS (`next.ts:220`) still fire, and is a long `working` ever a stall signal under hc?
- Who runs `pull --all` and `--resume` at boot with no plugin startup hooks, and what if the core is up before the unit?
- `hc` notes: `notify: true` on every terminal means hc types exit notes into parents. For leaf seats with no parent nothing is typed; for consultants the door receives notes it must not act on as instructions (manual: "Treat these as child reports").
- `self-update.ts:283-288` runs `herdr plugin link` on deploy. What restarts the follower after a deploy so it runs the new binary?
- Does `akrogon install` still need per-harness steps (`herdr integration install`, `install.md:76`)? hc reads OSC 7501 that the harnesses emit themselves; probably nothing, confirm per kind.
- With `-s workspace-write` codex in a worktree outside the repo: does the sandbox allow writes to the worktree store and `~/.akrogon`?

## 3. Pitfalls over the lifetime
- P1 Follower restarts during a seat's status flip: missed event, leaf stalls. Removed by a catch-up pass at unit start and `next --all` being a full re-read.
- P2 Name collision across doors or repos (`name_taken`, intake). Removed by the start helper building every name from the repo prefix and refusing a bare name (done-criterion: a test that the helper cannot emit `slot-b`).
- P3 Late `done` from a replaced seat (intake 2026-11-03). Removed by the door recording the live address at start and ignoring reports whose `from` is not it.
- P4 `hc send` to a `done` seat with `--if idle` refused (intake). Removed by the rule: plain `send`, never `--if`, never `--force`.
- P5 Backgrounded Claude door shows `status: null` (intake 2026-11-04). Removed by an operator step in the door rules: no `/background` in a door or seat; the follower treats `status: null` with a live foreground as unknown, not idle.
- P6 Sandboxed codex cannot reach the hc socket (intake 2026-11-05). Removed by the helper's codex argv carrying `network_access=true`, with a probe per handoff.
- P7 Old herdr skill still reached for by agents. Removed by deleting `~/.claude/skills/herdr` in the same leaf that links the new one.
- P8 Deleting old paths before proof (lock 2a). Removed by one done-criterion on the epic: an end-to-end run (chart door with four kinds, one leaf through plan, implement, check, merge) recorded in `<chart>/USAGE.md` before the deletion leaf starts.
- P9 Pane placement lost on restart. Removed by the helper owning placement (settled) and, if the keep race persists, by the herdr-setup layout patch (F6 O3).
- P10 Tests leaking into the real core. Removed by `tests/isolation.ts` setting `HC_SESSION`, `XDG_*` and unsetting `HC_TERMINAL_SOCKET`, `HC_TERMINAL_ID` (manual and intake probe recipe).
- P11 herdr-app updates overwrite clones. Removed by herdr-setup's existing `cloned_from` diff habit (`herdr-setup/mods/AREA.md`) and a done-criterion naming which shipped mod each patch clones.

## 4. Proposed split

Destinations: akrogon repo (engine, skills, tests, docs), herdr-setup repo (patches, the global skill, notices mod), operator's machine (remove old herdr, old skill folder, stop old server).

Akrogon leaves, in dependency order:
- L1 Start helper (`akrogon seat start`): name, labels, `hc run --bg` argv per harness kind from `harnesses` in `~/.akrogon/config.yaml`, pane placement, restart under the same name from the record. No dependency. The one place with hc code under lock 1a.
- L2 Engine trigger: follower unit, `next` reading hc events, startup pull and resume, `install.ts` and `self-update.ts` installing and restarting it instead of `plugin link`. Depends on L1 for the seat identity shape only (names and labels); can run side by side with L1 once that shape is written down in L1's design.
- L3 Leaf slots on hc: `next.ts` allocate and dispatch through L1, `state.ts` identity, `reconcile.ts` tab close by label, `scope.ts` pid from `hc get`, `log.ts` session field, prompt delivery (F4). Depends on L1 and L2.
- L4 Chart door: SKILL.md and questions.md rewritten to `hc run` through L1 and plain `hc send`, delete `peer-create`, `peer-wait`, `peer-anchor`, `door-reset`, shrink `peer-ask` and `peer-restart` to skill text, seats.yaml keyed per F2. Depends on L1 only; side by side with L3.
- L5 watch-issues on hc: observe reads `hc ls --json` and `hc read`, resteer by `hc interrupt` and `hc send`, notices per F5. Depends on L3 (it judges leaf seats).
- L6 Tests: hc boundary tests per F8, delete `fake-herdr.ts` and the `FAKE_HERDR` fixtures, rewrite the 15 heavy files. Depends on L3 and L4 (it tests them); parts can start with L1.
- L7 Deletion and docs: remove `plugin/`, `herdr()` and `herdrArgv` (`shell.ts:226-239`), `resolveSession`, `herdr integration install`, docs (`install.md`, `state-and-phases.md`, `machine-parts.svg`), README, learnings lines, `tests/AREA.md`. Depends on the end-to-end proof (P8) after L2-L6.

herdr-setup leaves (side by side with akrogon's, each a clone with `cloned_from`):
- H1 Global `herdr` skill folder and its links into the four skill roots; removes `~/.claude/skills/herdr`. No dependency; needed before L4's proof.
- H2 Notices mod (F5 O2) reading `akrogon status --json`. Depends on L3's status fields.
- H3 Pane layout patch (F6 O3), only if L1's probes show the keep race or three-seat heights unsolved.

Operator steps: approve the probe budget (7a); stop and uninstall old herdr after L7 lands; approve codex permission rule if a door runs in auto mode (intake 2026-11-05).

## 5. Operations that need one real observation before handoff (throwaway session per intake "Live probes")
- E1 `hc events --json --label akrogon.repo=x` emits a `status` change for each of claude, codex, pi, agy, and a `finished` event on `hc kill`. Call: start one seat per kind with a trivial task, follow events for 60 s.
- E2 `hc run --bg --no-parent --name ak-x-a --label ... <argv> "<task>"` then `hc get` shows `first_message.sent: true` and `turn` 1 for all four kinds, including codex with `-s workspace-write ... network_access=true` writing into a worktree outside the repo.
- E3 `hc send <name> "<second task>"` to a seat in `done` and in `idle` starts a turn (`turn` increments) for all four kinds; to a `blocked` claude it is refused with exit 9.
- E4 `hc kill <name>` then `hc run --name <same>` succeeds and the old finished record keeps `argv` (restart from record).
- E5 Pane placement: `terminal.keep --terminal <t> --place right`, settle until `herdr-app ls` lists the pane, then `--place down`; observe the stored weights for 2 and 3 seats.
- E6 Containment: move an hc terminal's `pid` shell into an `akrogon-l*.slice` scope via busctl and confirm the agent keeps reporting status and `hc kill` still ends it (F7, low confidence).
- E7 The follower unit with `HC_SESSION=infra` in its environment reaches the running core from systemd (no `cannot start core`).
- E8 The `herdr` skill folder (F9 O1) is listed and loadable by pi, Claude Code and Codex from a symlinked folder; the symlink-to-AGENTS.md form (O2) checked once per harness for comparison.
- E9 `hc events` across a core restart (`hc update` restarts an older running core, manual): the follower reconnects or exits non-zero so systemd restarts it.
