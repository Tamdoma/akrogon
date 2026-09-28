# Round C: may the watcher restart a stuck seat?

Written 2026-09-28. Paths: `akrogon:` = `/home/ivan/Work/infra/akrogon`, `pi:` = `~/.pi/agent/extensions/tamdoma-subagents`, `pi-core:` = `pi:/node_modules/@earendil-works/pi-coding-agent/dist` (pi 0.85.1), `hs:` = `~/.pi/agent/extensions/herdr-agent-state.ts` (herdr-managed, integration v9).

## Findings

### F1. #35 root cause: a UI confirm that nothing can answer or abort

- Both hung sessions end on one assistant message holding several parallel `subagent_spawn` calls and no tool result ever follows. pool-smell-freeze session `2026-09-28T05-40-26-666Z_…jsonl` line 89 at 05:48:11Z, two spawns. effort-evidence-lag session `2026-09-28T05-47-19-248Z_…jsonl` line 110 at 05:57:16Z, three spawns. The next session files for both worktrees start 07:37Z, so the operator restarted them by hand after about 1h49m and 1h40m.
- Every child cwd was a sibling worktree (`…/issues/worktrees/pool-smell-freeze-u1`), outside the parent root `…/worktrees/pool-smell-freeze`. `pi:tools.ts:96` treats that as outside, and `:97-98` awaits `ctx.ui.confirm("Allow subagent outside parent root?")`.
- `pi:tools.ts:98` passes no `signal` to the confirm. The tool's abort signal is wired only into `waitForSpawnResult` at `:131` (`pi:manager.ts:382-425` honours it). Esc aborts the tool call, but nothing listens on the confirm, so the promise stays pending. This is the "ignores abort" in the intake.
- pi shows one extension dialog at a time and does not queue. `pi-core:modes/interactive/interactive-mode.js:1953-1975` `showExtensionSelector` creates a new component, then `disposeActiveSelector()` and `editorContainer.clear()` remove whatever was showing. The replaced dialog's promise is never resolved or rejected. So with N parallel outside-root spawns, N-1 confirms leak on arrival and the one visible confirm waits for a human. That is the "only one outside-root confirm shown". `pi-core:core/extensions/runner.js:277` wraps the call in `withUIPrompt`, which only counts depth and emits `ui_prompt_start` / `ui_prompt_end`, no serialisation.
- The seat runs unattended: `herdr pane process-info wA:pB0` shows `pi --model devin/swe-2-max --thinking max -a --exclude-tools request_user_input`. The launch already says "no human here", yet the extension still asks a human.
- Is it #32's class? Same family, different mechanism. Both are a promise inside tamdoma-subagents that no actor is responsible for settling (a retirement confirmation at `pi:manager.ts:1120-1127`, an operator confirm at `pi:tools.ts:98`), and both surface as a herdr lifecycle status that then never changes (`blocked` in #32, `working` in #35). The fixes are separate.

### F2. Why herdr says `working` and cannot say otherwise

- For pi, herdr trusts the hook integration and skips screen detection (`herdr agent explain wA:pB0`: `screen_detection_skip_reason: full_lifecycle_hook_authority`; herdrdev docs `agents.mdx:42`). `hs:191-198` reports `working` from `agent_start` until `agent_settled` (`hs:243-256`). A tool that never returns keeps `agentActive` true forever. Screen reads (`herdr agent read`) are not the authority and the screen shows an ordinary dialog or spinner.
- akrogon counts `working` as busy (`akrogon:src/next.ts:174-176`), returns before dispatch (`:414`, `:458`), and the plugin discards `working` status events at `:672`. `herdr:blocked` is emitted only for admission faults and child questions (`pi:index.ts:133-134`, seat-stall-detection finding at `CHART.md:28`), not for a UI prompt.

### F3. Evidence that proves "stuck" without a clock, poll or watchdog

Clock-free evidence exists for this defect class, not for every hang:

- E1 The pi session file's last record is an assistant message with tool calls and no `toolResult` for them (`session-file.ts` already opens these files for delivery checks at `akrogon:src/next.ts:424-427`). A running tool call is a state, not a duration.
- E2 pi emits `ui_prompt_start` before any extension dialog (`pi-core:core/extensions/runner.js`, `withUIPrompt`). A prompt with no human is by definition blocked. Reporting it as `blocked` through the existing `herdr:blocked` path (`pi:index.ts:133-134`) or a sibling hook beside `hs` (its header invites hooks "beside this file", `hs:1-3`) makes the seat's true state visible with zero timing.
- E3 `herdr pane process-info` lists the foreground pi pid and shows whether any child worker processes exist (`pi:worker-shell.ts:184-188` spawns them detached). A `working` parent with a pending spawn and no worker process is not doing work.
- A hang that produces no such state (a network promise that never resolves inside bash or an HTTP call) has no clock-free signature. seat-stall-detection accepted that on 2026-09-18 (`CHART.md:14`: "a stall produced by pure silence stays permanently invisible, accepted knowingly"). The #35 intent, "the watcher as a full replacement", contradicts that acceptance. Every practitioner mechanism in Sources uses elapsed time (probes, watchdog, heartbeat timeout, RPC deadline). If the operator keeps the no-clock rule, the honest scope is: make known hang classes visible as states and fix them at the source; silent hangs stay the operator's.

### F4. How a restart could work today

- akrogon already relaunches an empty pane. `pane.exited` fires `next.sh` (`akrogon:plugin/herdr-plugin.toml:15-17`), `dispatchSlot` sees `pane.agent === null` and runs `herdr agent start … -- <harness args>` then prompts the phase skill (`akrogon:src/next.ts:431-457`, `:470-480`). Attempts are capped at three and failure is recorded (`:386-396`). The missing piece is only "stop the harness in the pane".
- Stopping: herdr has no kill verb (CLI lists `pane close`, `send-keys`, `run`; nothing that signals a process). pi exits on Ctrl+C twice or Ctrl+D (pi README:212, `docs/keybindings.md:126-127`) and handles SIGTERM as a normal exit with `session_shutdown` (`docs/extensions.md:347`). With a selector focused, keys go to the dialog, which matches the intake's "Ctrl+C had no effect". The reliable stop is SIGTERM to the pid from `herdr pane process-info`, then SIGKILL only after a bounded wait. SIGTERM lets `pi:manager.ts:523-560` cancel children and lets `hs` report idle; SIGKILL orphans detached workers (`pi:worker-shell.ts:184-188`, group kill exists only at `:127`).
- The watch-issues Never list forbids killing an agent process and closing a pane (`akrogon:skills/watch-issues/SKILL.md`, Never). A restart therefore has to be an akrogon verb that the skill may call, not a shell kill from the watcher.
- State loss on relaunch: the harness line has no `--continue` or `--session`, so the new pi session starts empty and the phase prompt is re-sent from scratch. The worktree (commits, uncommitted edits, child worktrees `-u1…-u5`) stays on disk. `state.yaml` keeps `prompted`, `busy_since`, `attempts`; `observeBusy` clears `busy_since` once the pane is idle (`akrogon:src/next.ts:185-193`). Children spawned by the dead parent are gone or orphaned, and their worktrees keep partial work the new session must rediscover. Phase skills already re-read state, so the relaunch is a normal dispatch, not a special resume.

## Options

Q1 · When a seat is proven stuck, may the watcher stop and relaunch it without the operator?

- O1 Fix the hang at its source and make the remaining prompt state visible, no restart verb. `pi:tools.ts` stops asking a human on an unattended seat: approve cwds under the repo's `worktree_root` by policy, otherwise fail the tool call with the existing "Cannot spawn outside parent root without UI confirmation" error (`:97`). Pass the tool `signal` to any remaining confirm. Report `ui_prompt_start` as `herdr:blocked`. Result: the #35 shape cannot occur, esc works when it does, and a real prompt shows as blocked and is notified. Cost: one pi-extensions change. Pitfall: does nothing for silent hangs (F3, accepted).
- O2 O1 plus one akrogon verb `akrogon restart <slug> <slot>`: refuses unless E1 or E2 holds, sends SIGTERM to the pane's pi pid, waits for `pane.exited`, lets the existing dispatch relaunch, counts restarts against the same three-attempt cap, and notifies. The watch skill gains one rule "Hung with evidence: run `akrogon restart` once per seat per watch" and the Never list changes "kill an agent process" to "kill anything except through `akrogon restart`". Pitfall: E1 alone is also true for a long legitimate bash run, so the verb must require E2 or a pending spawn in the session file, never a bare unanswered tool call. Pitfall: orphaned child worktrees and duplicate work after relaunch.
- O3 Notify only, operator restarts (fork option B). Keeps the Never list intact and contradicts the #35 intent.

Recommendation: O1 now, O2 only if the operator confirms that absence is total. O1 removes the problem class: the seat never waits on a human it was launched without. O2 guards the symptom and adds a second lifecycle authority (akrogon killing what herdr reports), which the seat-stall-detection lock argued against. If O2 is taken, the relaunch path already exists and needs no new dispatch code.

Pitfalls common to any restart:
- Restarting on `working` with no state evidence will kill legitimate long tool runs. Kubernetes and Temporal docs below both warn that a liveness check must prove failure, not slowness.
- SIGKILL first orphans workers. SIGTERM first, bounded wait, then SIGKILL.
- A relaunch is a new session. `prompted[slot]` and `PROMPT_GRACE_MS` (`akrogon:src/next.ts:181`, `:415-421`) apply to the new session id, so the seat can be re-prompted at once.
- Restart intensity: without a cap the same hang loops (Erlang max restart intensity below). Reuse the attempts cap at `:386-396`.

## Sources

Tier 1 (primary code and docs read directly, 2026-09-28):
- `pi:tools.ts:90-133`, `pi:manager.ts:382-425, 523-560, 1120-1127`, `pi:worker-shell.ts:127, 184-188`, `pi:index.ts:133-134`.
- `pi-core:modes/interactive/interactive-mode.js:1953-1997`, `pi-core:core/extensions/runner.js:277` and `withUIPrompt`; pi `README.md:212`, `docs/keybindings.md:126-127`, `docs/extensions.md:347`.
- `hs:1-3, 57, 191-198, 236-256`.
- `akrogon:src/next.ts:174-193, 386-396, 414-480, 672`, `akrogon:src/shell.ts:100-107`, `akrogon:plugin/herdr-plugin.toml`, `akrogon:skills/watch-issues/SKILL.md` (Busy, Never).
- Session logs under `~/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-{pool-smell-freeze,effort-evidence-lag}--/` (05:40Z and 05:47Z files, restarted 07:37Z).
- herdrdev docs `docs/next/website/src/content/docs/agents.mdx:42, 56-60`, `agent-automation.mdx:16-34`; herdr skill `~/.pi/agent/skills/herdr/SKILL.md:58, 120, 128, 130`; live `herdr agent explain wA:pB0`, `herdr pane process-info --pane wA:pB0`.
- Locks: seat-stall-detection `CHART.md:7-18, 24-28` (2026-09-18), stall-notifier-removal `CHART.md:13-20` (2026-09-18), forks fault-status and status-age (Question and Carries).

Tier 2 (official docs of other systems, accessed 2026-09-28):
- Kubernetes, "Liveness, Readiness, and Startup Probes": liveness probes restart a container that cannot make progress, and must "truly indicate unrecoverable application failure, for example a deadlock".
- systemd.service(5), man7.org: `WatchdogSec=` requires `WATCHDOG=1` pings, timeout sends SIGABRT and `Restart=on-watchdog` relaunches.
- Temporal, "Detecting Activity failures": Start-To-Close and Heartbeat timeouts; "the Temporal Server relies on the Start-To-Close Timeout to force Activity retries".
- Erlang/OTP "Supervisor Behaviour": restart strategies, max restart intensity, `shutdown` timeout then `brutal_kill`.
- Google SRE Book, "Addressing Cascading Failures": deadlines on outbound requests; "you don't get credit for late assignments with RPCs".

## Empty searches

- pi 0.85.1 dist: no dialog queue for concurrent extension prompts (`dialogQueue`, `pendingDialog`, `activeExtensionDialog` not found).
- herdr CLI: no command that signals or kills a pane process (`herdr pane --help`, `herdr agent --help`, herdrdev docs grep for kill/signal).
- akrogon `src/`: no restart or stop verb, no `--continue`/`--session` in the harness launch.
- `~/.pi/agent/extensions/issues/chart/subagent-admission-stall/` referenced by seat-stall-detection: not present on disk; open charts there are `subagent-concurrency-three`, `bash-timeout-default`, `subagent-settings-per-instance`.
- freedesktop.org systemd page returned 403; man7 mirror used instead.
