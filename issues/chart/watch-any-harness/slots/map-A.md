# Map A: watch-any-harness

## Live surface (inspected 2026-11-20)
- skills/watch-issues/SKILL.md § Invocations: Claude-only; CronCreate `*/20`, job identity = exact prompt `/watch-issues tick <root>`, CronList duplicate check, CronDelete stop, first-prompt-after-/clear tick stops, queued ticks each run a check, 7-day expiry, session loss ends it. § Observe/Judge/Never/Reply are harness-neutral already (hc commands, bun scripts).
- scripts/observe.ts, log-tail.ts: harness-neutral bun; observe imports src/config, src/hc, src/reconcile, src/transcript, src/state.
- tests/e2e/watch-check.e2e.ts: paid Claude tier; start = check 1 + one CronCreate; two queued ticks = checks 2-3; `/clear` typed as keys then a tick = CronDelete, no status. watch-stop.e2e.ts and kinds.e2e.ts cover stop keys per kind.
- hc: a child terminal ends when its parent's program ends unless `--outlive-parent` (`hc run --help`); `--parent` defaults to the terminal it is started from; `--label`, `--no-notify`, `hc ls --json`, `hc kill`, `hc rm`; `hc send --if idle|working`; send waits for an operator draft.
- Skill links (src/install.ts planSkillLinks): .claude/skills, .agents/skills, .codex/skills, .pi/agent/skills. agy: no watch-issues under ~/.gemini/*; whether agy reads ~/.agents/skills is unobserved.
- History: 3fdf8cd2 removed a wake that typed ticks into any idle terminal labelled `akrogon.watch`, a label that outlived /clear and the agent.

## Shape A proposes
One bun timer script `skills/watch-issues/scripts/timer.ts <root>` started by the skill from the watcher's own tool shell as an hc child of the watcher terminal (`hc run --bg --no-notify --name <prefix>-watch --label akrogon.watch-timer=<repo> ...`). Every 20 min it sends the tick to its parent terminal. It dies with the watcher's program (hc parent rule), is killed by `/watch-issues stop`, and a tick that is the first prompt of its conversation stops it (today's /clear rule, harness-neutral because the model sees its own conversation).

## Forks
F1 Tick text: (a) one plain-language text every harness's model resolves to the skill, e.g. `watch-issues tick <root>`, (b) per-kind invocation read from the parent's argv (claude `/watch-issues`, pi `/skill:watch-issues`, codex `$watch-issues`, agy ?). Needs a paid probe per harness either way.
F2 Tick while the watcher is busy or holds an operator draft: (a) wait for idle, then send one tick (coalesce), (b) send every 20 min regardless and let the harness queue (today's Claude behavior; codex Enter while working may steer mid-turn instead of queueing).
F3 /clear and /new detection: (a) skill-side rule only: a tick that is the first prompt of its conversation runs stop and no check (works on every harness, pi /new included), (b) plus timer-side transcript-path comparison where the resolver knows the path.
F4 One watch per repo: identity by (a) hc label on the timer terminal, found with `hc ls --json` in the repo's session, (b) a lock/pid file under ~/.akrogon. (a) dies with the timer; (b) can go stale.
F5 Which terminal runs checks: (a) the conversation that started the watch, as today, (b) a dedicated watcher terminal the skill starts with a chosen harness.
F6 "Never kill or remove an hc terminal" (§ Never) vs stop killing the timer: carve the timer out by label and parent.
F7 Test interval: env override for tests only (like OBSERVE_AKROGON) so E2E ticks in seconds.

## Pitfalls
- Timer outliving its watch (the 3fdf8cd2 class): removed by hc parent tie + stop kill + first-prompt rule; probe that a keep-shell replacement of the parent ends the child.
- HC_TERMINAL_ID absent inside a harness's tool shell (codex sandbox env, agy): the child would get no parent and outlive the watch. Removed by the skill refusing when `HC_TERMINAL_ID` is unset in its own shell; probe per harness.
- Codex Enter-while-working steers the current turn: F2a removes it.
- Two doors/terminals in different hc sessions watching one repo: label lookup must cover the repo's session as observe.ts resolves it.
- Timer typing into an operator draft: hc send already waits for an unfinished draft (hc manual).
- agy may not load the skill at all (no link): F1 probe shows it; fix is install linking under src/install.ts, which signpost 5a allows only as reuse — may need an exception.

## Regression inventory (today -> new)
start (check + job) -> check + timer child; duplicate (CronList 1/several) -> label lookup 1/several; tick -> timer send; queued ticks -> F2; stop (CronDelete) -> hc kill+rm of the timer; /clear -> first-prompt rule; paused -> unchanged; 7-day expiry -> removed (signpost 3a); session loss -> parent tie; reply <=5 lines -> unchanged.

## External operations needing observation before handoff
hc child ends on parent program exit and on keep-shell replacement (free, stand-in parent); `hc run` from each harness's tool shell picks the watcher as parent (paid, 4 harnesses); tick text runs the skill in claude, codex, pi, agy (paid); `hc send` into a working codex/pi/agy (paid, F2).
