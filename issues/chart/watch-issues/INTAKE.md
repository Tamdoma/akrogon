# Intake: watch-issues

## Scope
An opt-in akrogon skill the operator invokes in the lead session before stepping away. On a fixed interval the lead agent observes every leaf and seat in the registered repo, judges, and moves a stalled or stopped leaf with existing akrogon commands. It is rare, it is the operator's explicit exception to the manual-dispatch rule, and it reacts only to the extreme cases that remain after the fixes handed off this week (seat-prompt-delivery, env-file-rule in akrogon; shell-timeout-bound, env-file-guard in pi-extensions; noninteractive-leaf-execution merged). Proposed grouping: one issue, one leaf, owner of Tamdoma/akrogon#25.

## Provenance
- GitHub: Tamdoma/akrogon#25
- Operator: 2026-09-19, this chart-issues pass (note below)

## Source: Tamdoma/akrogon#25
# watch-issues: opt-in skill where the lead agent checks the repo every 20 minutes and moves stuck leaves while the operator is away

Source: Tamdoma/akrogon#25
URL: https://github.com/Tamdoma/akrogon/issues/25

Unverified intake.

## Observation
During the boulevard-ghl-sync run the operator asked the charting-session agent (Claude Code, lead for the repo) to watch the run overnight. The agent built an ad hoc watchdog that worked well enough that the operator wants it as an opt-in akrogon feature. How it works today:

1. A Claude Code cron job (CronCreate, every 20 minutes, session-only, 7 day expiry) re-prompts the lead session with a fixed "Watchdog tick" prompt.
2. The prompt runs a shell script that snapshots `akrogon status`, every leaf state.yaml (phase, attempts, busy_since, panes), `herdr agent list` and `herdr tab list` for the workspace, the dispatcher pane tail, worktrees and recent commits, diffs it against the previous tick, and appends to a history file.
3. The prompt carries six judgment rules: failed leaf (read panes, summarize, notify), busy over 45 minutes with no phase change (read pane, decide stuck or working, notify once), idle seat with stale busy (run `akrogon next --all`), dispatcher error (notify), new tabs and worktrees (note only), known artifact-in-worktree bug (copy files, run next).
4. The lead agent judges and acts, replying in at most 5 lines. Over the run it also, with operator authorization, answered request_user_input questions via `herdr pane run`, restarted a hung seat (operator pressed Ctrl+C on advice), and filed akrogon issues for every systemic cause.

Operator intent, in their words: "I can activate the script and then you as the main agent can just watch over the whole process... if I go to sleep or something doesn't work, you check everything every 20 minutes and fix it yourself as if you were me... I don't want to use this all the time, only when it's important, or only when I'm away for a longer time."

## Location
akrogon skills (chart-issues hands off, then nothing watches). Related: #24 (minimal built-in tick for detection), #19, #23.

## Reproduction
Not a defect. Feature request: reproduce the ad hoc setup above on any epic by one command.

## Expected behavior
An opt-in skill, e.g. `/watch-run <epic> [--every 20m] [--until merged]`, invoked by the operator in the lead session when they step away. It installs the cron, writes the snapshot script for that repo and workspace, carries the judgment rules, and removes the cron when every leaf is merged or the operator stops it. Scope of "fix it yourself": answer a seat's question from chart and brief content, re-run `next`, apply known repairs, notify on anything else. Never touch .env, never edit worktrees, never modify state.yaml by hand. Detection stays in akrogon core (#24); judgment and repair live in this skill, so day-to-day runs pay nothing for it.

## Urgency
Medium. Workaround: the lead agent sets the cron up by hand each time, as in this run.

## Source: operator 2026-09-19
"New issues pulled. We need to get the watch-issues skill charting going. I need this functionality when I go away. I need someone to monitor the situation every twenty minutes a smart agent like you are. The intent is to use this very rarely when I'm away and I'm not able to react. At the same time I don't want the smart agent to eat the tokens by monitoring constantly. So 2 minutes is a really good timer. It just needs to take care of moving the issues if they get stalled or if they stop working. But along the way we will be fixing most of those, so this will only react in the most extreme situations."

Earlier locks carried (operator 2026-09-18/19): "I don't want an automated program to run things without me. I need to be pushing the next commands manually." "it must not kill the working processes that are not idle." "I don't want to add watchdogs and watchers because they increase complexity. Unless it's absolutely necessary to completely remove the category of bugs." No webhooks or external programs, herdr only.

## Agent findings
- The overnight ad hoc watchdog (boulevard-automation, 2026-09-18 21:41Z to 09:27Z): 36 ticks at 20 minutes. Three ticks acted or found something: one artifact-in-worktree repair (Tamdoma/akrogon#18, since fixed), one hung `npx playwright install chromium` (owned by pi-extensions leaf `bash-timeout-default`), one seat-blocked-on-question notification followed by 20 ticks of "still blocked" (request_user_input is now excluded from execution seats, commit b24717e, and seats never ask, commit b35ed04). The other 33 ticks reported "no anomalies, no actions". Tick prompt and script: scratchpad of session 71fb72b4 (`watchdog/tick.sh`, CronCreate input), cron `*/20 * * * *`, six judgment rules, "reply with at most 5 lines".
- Claude Code `CronCreate` (tool schema read 2026-09-19): session-only, in-memory, fires only while the REPL is idle, recurring jobs auto-expire after 7 days, jitter up to 10% of the period, returns an id for `CronDelete`. `durable` has no effect. The lead session harness is Claude Code; codex and pi seats have no equivalent, so the skill is usable only in a Claude Code lead session.
- Legal recovery already exists: from `failed` the command accepts `akrogon phase <slug> <phase>` to any lifecycle phase with no `--slot` (`src/routing.ts:35-39`, `src/phase.ts:200`), and a blocked-cause failure skips the clean-worktree check (`src/phase.ts:212`). `akrogon next --all` sweeps the current repo (`src/next.ts:610-616`). Failed leaves already notify and rename the tab (`issues/closed/noninteractive-leaf-execution/failure-attention/brief.md`).
- `akrogon status` prints per leaf the phase, attempts, verdicts and `busy <seat> <h>h<mm>m` from `busy_since` (`src/status.ts:87-107`); `herdr agent get <pane>` returns `agent_status` and `herdr agent read <pane>` the screen.
- Skills are installed by `akrogon install` as symlinks of every `skills/<name>` into `.claude/skills`, `.agents/skills`, `.codex/skills` and `.pi/agent/skills` (`src/install.ts:11-19`), so a new `skills/watch-issues/SKILL.md` needs no installer change.
- Prior charts ruled out any akrogon-core watcher (`issues/chart/seat-stall-detection/CHART.md`, `issues/chart/stall-notifier-removal/CHART.md`, closed 2026-09-18). This chart is the skill half only; core detection stays ruled out.
