# Map A · watch-issues

## Cases that remain (after this week's handoffs)
- C1 failed leaf. Announced by failure-attention (`issues/closed/noninteractive-leaf-execution/failure-attention/brief.md`). Residual: nobody moves it. `akrogon phase <slug> <phase>` from `failed` needs no `--slot` (`src/phase.ts:200`, `src/routing.ts:35-39`); a `blocked` cause skips the clean-worktree check (`:212`). This is the one "move" the operator asked for.
- C2 leaf waiting for a pass. Idle seats, no busy marker, phase needs dispatch: a missed or dropped herdr event (`src/next.ts:585` drops `working` events). `akrogon next <slug>` or `next --all` is idempotent under the flock (`:596`) with attempts and prompted guards. seat-prompt-delivery makes each pass exactly one delivery attempt and settles `timeout` against the session file; the watcher's pass is the "next manual pass" that leaf's contract expects.
- C3 seat busy for a long time. Hung shell command owned by pi-extensions `bash-timeout-default`; admission stall owned by pi-extensions `subagent-admission-stall`. Residual: model stream hang, network hang outside bash. Signal: `busy <seat> NhMMm` in status and unchanged `herdr agent read` screen across two ticks. Action: notify only. Killing is locked out.
- C4 dispatcher error. `akrogon next` exits non-zero (lock, herdr transport, foreign leaves). Action: record and notify.
- Gone: seat blocked on a question (request_user_input excluded b24717e, never-ask b35ed04), artifact-in-worktree (#18 fixed), stale env prompts (env-file-rule).

## Forks
### F1 Interval
Operator said "every twenty minutes" and "2 minutes is a really good timer" in one note. Cost per tick: one Bash call (status + agent list, ~2-4k tokens in, cached prefix) plus a 1-5 line reply. 20 min = 72 ticks/day; 2 min = 720 ticks/day, ten times the spend for a reaction window that the overnight run never needed (36 ticks, 3 findings, none where 18 minutes mattered). A: default 20 min, `--every` override. B: 2 min.
Research: better-than-training, overnight history (36 ticks, actions at ticks 1, 4, 31) and CronCreate schema (jitter up to 10% of period).

### F2 Trigger
A (recommended): no scheduling inside the skill. The skill is one tick. The operator starts it with `/loop 20m /watch-issues` (Claude Code docs, scheduled-tasks.md read 2026-09-19: "You can also pass a skill as the prompt, for example `/loop 20m /review-pr 1234`"); the loop is a CronCreate job, restored on `--resume`, expires after 7 days, fires only while the REPL is idle, jitter up to half the interval for sub-hourly cadences. The tick ends the loop itself with CronList/CronDelete when every leaf is merged. B: the skill creates and manages its own cron job. B duplicates what /loop already does and adds a second way to stop.
Either way the skill is Claude Code only; installed symlinks land in codex and pi roots too (`src/install.ts:11-19`), so SKILL.md states the harness requirement and stops when the cron tools are absent. Compaction: the skill file is re-read on every fire, so the rules never depend on chat memory; only the previous-tick snapshot needs a file.
Research: better-than-training, https://code.claude.com/docs/en/scheduled-tasks.md (2026-09-19).

### F3 What the tick may do alone
A (recommended): `akrogon next <slug>` / `next --all`; `akrogon phase <slug> <phase>` out of `failed` once per leaf per watch, to the phase named in `failure.phase`; `herdr notification show` for everything else. Never send keys, never kill, never edit state.yaml or worktrees, never open .env, never answer a seat (seats no longer ask). B: notify only, move nothing. B contradicts the note ("take care of moving the issues").

### F4 Stop
A: cron removed when every leaf in the repo is `merged` or the operator runs `/watch-issues stop`; 7-day expiry is the hard cap. B: fixed count of ticks.

### F5 Snapshot
A: a script `skills/watch-issues/tick.sh` (precedent: `skills/broadcast-issue/scripts/`) prints `akrogon status`, `herdr agent list` filtered to the repo's leaf panes, last 3 main commits, and the diff against the previous tick kept in the session scratchpad. Small deterministic output keeps the token cost low. B: prompt lists raw commands; the model reads full JSON each tick (more tokens, more variance).

## Pitfalls
- Double dispatch with plugin event passes: serialized by flock; `next` is idempotent, so a tick pass and an event pass cannot both prompt the same seat (attempts, prompted).
- herdr calls have no deadline (`src/shell.ts`), a hung herdr holds the lock: the tick runs `akrogon next` under a Bash timeout and reports, never retries in-tick.
- False `unknown`/`blocked` status from the subagent signal (#21): the tick trusts status only together with an unchanged screen across two ticks.
- Recovery loop: re-dispatching a failed leaf that fails again for the same reason. One recovery per leaf per watch; the second failure is notify-only.
- `next --all` outside a repo sweeps every registered repo: the tick always `cd`s into the watched repo.
- Compaction of the lead session mid-watch: cron survives (in-memory job), the prompt carries everything.
