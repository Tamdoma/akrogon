# Territory map: watch-any-harness (slot C)

## Forks that change the outcome

1. **Tick prompt syntax across harnesses:** (a) harness-neutral plain text (`watch-issues tick <root>`, matching `src/next.ts` `promptFor`), (b) per-harness command syntax (`/watch-issues`, `/skill:watch-issues`, `$watch-issues`, plain text), (c) keep `/watch-issues tick <root>` everywhere.
   - Tradeoff: `/watch-issues` risks unknown-command errors on `pi`/`codex`/`agy`; per-harness branching breaks on CLI changes; plain text needs live proof that every harness activates the skill reliably.
2. **Timer host process (under lock 5a):** (a) background `hc` terminal (`hc run --bg --parent $HC_TERMINAL_ID --no-notify --rm --label ...`), (b) detached OS process tracked by a state/PID file.
   - Tradeoff: (a) gives `hc` parent-exit cleanup, live registry discovery (`hc ls --label`), and atomic `--name` uniqueness, but appears in `hc ls` and needs an explicit carve-out (or self-exit signal) for `skills/watch-issues/SKILL.md` § Never ("Kill or remove an hc terminal"); (b) hides from `hc ls` but invites orphan timers and stale PID files.
3. **Target conversation:** (a) the invoking terminal's conversation (as today), (b) a newly spawned dedicated watcher terminal.
   - Tradeoff: (a) preserves zero-config "watch from whichever CLI I'm in" UX, but shares the terminal with operator chat, drafts, and `/clear`/`/new`; (b) isolates the watch but requires harness/model/permission config (`src/seat.ts`) and breaks operator-driven harness choice.
4. **Ticks while watcher is busy, blocked, or has a draft:** (a) wait until idle and deliver one coalesced tick, (b) deliver every due tick (preserving queued ticks in `tests/e2e/watch-check.e2e.ts`), (c) skip due ticks when not idle/done.
   - Tradeoff: `hc send` waits up to 60s on drafts, exits 9 on `blocked`, and while `working` may steer mid-turn instead of queueing on `codex`/`pi`/`agy`; (a) avoids backlog storms and mid-turn corruption, (b) preserves Claude's queued-tick behavior literally, (c) risks 40-minute gaps.
5. **Pre-tick liveness and reset guard (lock 2a):** (a) snapshot watcher address + harness PID/`procStart` + initial `transcriptFor` path (`src/transcript.ts`), subscribe to `hc events --terminal <watcher>` for `finished`/`lost`/`status:null`, and re-verify PID/`procStart` and `transcriptFor` before every send, plus keep first-turn self-stop for `pi` `/new`, (b) `hc events` exit/shell-return only plus skill self-stop on reset.
   - Tradeoff: (b) lets ticks hit a cleared `claude`/`codex`/`agy` session once the operator types another prompt; (a) catches exit, shell return, agent replacement, and detectable resets pre-send, isolating `pi` `/new` as the only stated limit.
6. **One-watch-per-repo enforcement & cross-terminal `stop` (lock 4a):** (a) `hc` label (`akrogon.watch=<repo>`) plus deterministic hashed `--name` (32-char `hc` limit, like `src/hc.ts` `seatName`) or `withLock` (`src/state.ts`), letting `stop` work from any terminal in the session, (b) watcher-local tracking only.
   - Tradeoff: without atomic `--name`/lock, concurrent starts race and double-steer seats; (a) also allows `/watch-issues stop` from another terminal if the watcher is busy or lost context.
7. **`agy` global skill linking vs lock 5a:** (a) allow adding `.gemini/config/skills` to `src/install.ts` (`planSkillLinks`), (b) leave `src/install.ts` untouched and limit `agy` to workspaces with `.agents/skills`.
   - Tradeoff: `src/install.ts` (`planSkillLinks`) currently links `.claude/skills`, `.agents/skills`, `.codex/skills`, and `.pi/agent/skills` — not `~/.gemini/config/skills`; without (a), `agy` cannot discover `watch-issues` in normal operator repos.

## Practitioner questions

- **Cross-session watcher:** If the watcher runs in a different `hc` session (`$HC_SESSION`) than `repoSpace(repo)` (`src/hc.ts`), should `start` refuse or bind ticks to `$HC_SESSION` while `observe.ts` reads `repoSpace`?
- **Core restart / stream drop:** When `hc events` drops on `hc server restart` (`hc --skill` § Status, recovery, and cleanup), should the timer reconnect once and re-verify identity, or exit cleanly?
- **Script path resolution:** How does `SKILL.md` tell every harness to locate `<skill-folder>/scripts/` reliably across four symlinked skill roots?
- **Test-speed interval override:** Will the timer take an env interval override (like `OBSERVE_AKROGON` in `skills/watch-issues/scripts/observe.ts` `main` and `DOOR_RESET_TURN_BOUND_MS` in `skills/chart-issues/scripts/door-reset.ts`) so E2E tests do not wait 20 minutes?

## Pitfalls over the work's lifetime

- **Shell-hosted agent exit bypasses `hc --parent`:** `hc` only kills child terminals when the parent's *root* process exits (`hc --skill` § Status, recovery, and cleanup). Exiting an agent started inside an interactive shell leaves the shell `live`; only watching `status: null` plus the harness PID/`procStart` stops ticks into the bare shell or a replacement program.
- **Wrong PID captured at `start`:** While the harness runs `bun <timer> start`, `hc get`'s `foreground.pid` is the shell/bun tool child, not the harness (`src/transcript.ts` `seatPids`). The script must walk `/proc/<pid>/stat` ancestors up to terminal root `t.pid` (recording `procStart` per `src/transcript.ts` `procStart`) to pin the harness process itself.
- **Transient `null` transcript at `start`:** `claude` writes `<config>/sessions/<pid>.json` before its first JSONL (`src/transcript.ts` `claudeTranscript`), and interactive `pi` without `--session-id` returns `null` until `PI_SESSION_FILE` is published (`skills/chart-issues/scripts/transcript.ts`). Pinning `null` or failing start on `null` breaks fresh sessions.
- **`hc send` partial delivery & blocking:** `hc send` can return `started: false` needing an extra `enter` (`skills/chart-issues/scripts/door-reset.ts`), blocks up to 60s on drafts, and fails on `blocked` (`hc send --help`); unguarded sends can stall the timer or drop a tick.
- **Codex without `--no-daemon`:** `hc --skill` notes Codex commands execute outside `hc` without `--no-daemon`, breaking `HC_TERMINAL_ID` discovery at `start`.
- **`agy` refuses shell `sleep`:** `tests/e2e/watch-stop.e2e.ts` notes `agy` rejects `sleep` timers; timing must live inside the Bun script, never a shell `sleep` instruction in `SKILL.md`.
- **Self-update & docs/test drift:** `akrogon` self-updates flip `~/.akrogon/current`, leaving a long-running timer on its launch release while ticks call current `observe.ts`; `docs/use/watch-while-away.md`, `docs/reference/skills.md`, `skills/watch-issues/SKILL.md`, and `tests/e2e/watch-check.e2e.ts` must drop CronCreate/7-day references, and `tests/watch-issues-scripts.test.ts` gates script tests and typecheck.

## Regression inventory (Claude-only watch -> shared script)

| Today's function (`SKILL.md` § Invocations, `watch-while-away.md`) | Mapping on shared timer |
| --- | --- |
| **Start** (check now, create 20m job, report id) | Run one check now, call timer script `start` (checks `HC_TERMINAL_ID`, pins watcher + repo), report timer address/name. |
| **Duplicate report** (1 or >1 matching jobs reported, no create/delete) | Query live timers for repo label; 1 or >1 reported with no start/stop; atomic `--name`/lock prevents concurrent race (lock 4a). |
| **Tick** (20m fire runs one check, never creates job) | Timer verifies liveness/identity and sends tick prompt; skill runs one check and never starts a timer even if none is found. |
| **Queued ticks** (ticks arriving while busy each run a check) | **Must settle in Fork 4:** wait-and-run each due tick vs coalesce to one post-idle check (changes `watch-check.e2e.ts`). |
| **Stop** (1 match stopped; 0 already stopped; >1 report only) | Script `stop` resolves repo timer(s) by label: 1 stopped & reported, 0 already stopped, >1 reported untouched (works from any terminal). |
| **`/clear` detection** (first prompt after `/clear` stops job, no check) | Timer detects transcript change pre-send on `claude`/`codex`/`agy` and exits; on `pi` `/new` (no `/proc` signal), first-turn self-stop + stated limit (lock 2a). |
| **Paused repo** (check reports paused only; start still creates job) | Unchanged: `akrogon status` gate stays in `SKILL.md` § Observe; `start` still launches timer when paused. |
| **7-day expiry** (reported at start, auto-ends at 7d) | **Removed by lock 3a:** no expiry; update `SKILL.md` § Invocations, `docs/use/watch-while-away.md`, `docs/reference/skills.md`. |
| **Session loss** (Claude exit ends cron) | Terminal exit ends `--parent` timer; agent exit to shell or replacement ends timer via `hc events` (`status:null`) + PID/`procStart` check. |

## External operations needing real observation before handoff (N1)

1. **Tick invocation per harness (`claude`, `codex`, `pi`, `agy`):** whether `hc send` with plain `watch-issues tick <root>` vs slash/skill syntax activates `watch-issues` and sets `started: true` without an extra `enter`.
2. **Shell tool env & process tree per harness:** whether `HC_TERMINAL_ID` and `HC_SESSION` survive into each harness's shell tool (including `codex --no-daemon`), and how the harness PID sits between `bun` (`ppid` chain) and `hc get`'s `pid`/`foreground.pid`.
3. **Busy-terminal `hc send` per harness:** whether sending while `working` queues a follow-up turn, steers mid-turn, or returns `started: false` on each of the four harnesses.
4. **Reset signal timing per harness:** whether `src/transcript.ts` (`transcriptFor`) changes immediately on `/clear` (`claude`, `agy`) and `/new` (`codex`, `pi`) *before* a post-reset prompt is submitted, and what `hc events` emits.
5. **`agy` skill discovery:** whether `agy` discovers `watch-issues` via `~/.agents/skills` in an arbitrary repo or strictly requires `~/.gemini/config/skills` (`src/install.ts` `planSkillLinks`).
