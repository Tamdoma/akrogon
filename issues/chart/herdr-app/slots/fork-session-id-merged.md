# session-id: merged notes (A,B,C,D,E)

Sources: fork-session-id-A.md .. -E.md. Operator direction applied by all: behavior very similar to old akrogon plus hc improvements (no polling or waiting, `<hc>` for communication).

## Live facts gathered by seats (2026-11-06)
- codex holds its rollout open: `/proc/<pid>/fd` shows `~/.codex/sessions/.../rollout-*-<id>.jsonl` (C,E, t6c).
- claude writes `~/.claude/sessions/<pid>.json` with `sessionId`, `cwd`, `startedAt` (C: door A's file matches seats.yaml); E saw a claude fd under `/tmp/claude-<uid>/<cwd>/<uuid>/tasks`.
- agy holds `~/.gemini/antigravity-cli/conversations/<uuid>.db` open (C,E); no akrogon reader exists for it.
- pi holds no transcript fd (C); its file name carries the start timestamp (E).
- codex's own tool environment has `CODEX_THREAD_ID`, matching its rollout `session_meta` (B).
- Flags: `claude --session-id <uuid>` and `pi --session-id <id>` exist; codex and agy have none (all).
- `hc` Terminal has `pid` (the program hc started) and `foreground.pid` (a tool child during a turn); use `pid` (C).

## Q1. Features kept
- All: chart usage, seats.yaml session, watcher log tail, `session` in log.jsonl and timings.jsonl (A,B,C,D,E). Only the id source changes. agy stays unmeasured as today (all).

## Q2. How the id is known
- Claude: chosen at start with `--session-id` (A,D) vs read live from `~/.claude/sessions/<pid>.json` (C) or a `/proc` fd (E). B,C,E: a start-time id goes stale after the door's `/clear` handover, which mints a new id in the same process; today's door re-reads A's id live.
- pi: `--session-id <fresh id>` at start (A,C,D; fresh per start because the flag resumes an existing id, D,B); E finds it by start timestamp.
- codex: open rollout in `/proc/<pid>/fd` (A,C,E) vs before/after snapshot of new rollout files with an exactly-one and cwd check (D) vs codex publishing `CODEX_THREAD_ID` itself by `hc send` (B).
- agy: conversation id from `/proc/<pid>/fd` (C, id only) vs unknown (A,D).
- When it is read: live, where today's code read `herdr agent list` (observe, log, door at each exchange, usage) (C,E, closest to old herdr which detected ids itself) vs captured once at start and stored (D) vs stored and refreshed on native session change (B). C adds a verb `akrogon seat-session <address>` that writes label `akrogon.session`; E resolves lazily inside each caller from one shared resolver in `src/`.
- Rejected by A,B,C,D: cwd plus start-time scans (A and B of a leaf share a worktree); E keeps them as fallback after exit. Rejected by all: a herdr-setup patch (no source; agents report no id through hc).

## Q3. Unknown id
- Today's paths, unchanged (all): usage lists the seat unmeasured with the reason, `outcome partial`, handoff proceeds; observe prints `log<seat>=-`, the watcher judges from the screen and reports `no log`, a read failure alone never justifies a steer; log and timings write `session: null`; a missing id never fails a start.
- seats.yaml: keep `session: none` as today (C) vs model unavailable explicitly, the non-empty schema at `chart-usage.ts:11` and SKILL's "never with a null session" rule need changing (B,D). B: unmeasured is never zero; an unmeasured A makes operator-wait unavailable, not zero.
- Door A's own id (D): A is operator-started, so start cannot choose it; how A knows its own id goes to the chart-door fork.

## Probes
Per kind: id resolves to the right transcript for two same-kind seats in one cwd; claude id after `/clear`; codex after `/new` and under `--no-daemon`; pi fresh id per restart; a lookup miss gives the unmeasured/no-log path.

## Corrections after rebuttals (2026-11-06)
- B: B did not reject a targeted herdr-setup patch, only a universal parser; a patch stays possible for a proved missing binding. `session: none` is not an existing stored-seat rule (SKILL.md:29 appends only when not none); a sentinel would be a new convention.
- B,E: `pid` alone fails for an operator-started terminal: door A's `pid` is bash, `foreground.pid` is claude (E, t15). On `hc run` seats `pid == foreground.pid`, and tool children do not take the foreground (E, t6g). Lookup checks `foreground.pid` then `pid`.
- C: claude also resolves through `/proc/<pid>/fd` (its open `/tmp/claude-<uid>/<cwd>/<uuid>/tasks` path carries the session id); the undocumented pid file is not needed. E prefers `~/.claude/sessions/<pid>.json`. Door A's own id comes from its own environment (`CLAUDE_CODE_SESSION_ID`, codex `CODEX_THREAD_ID`), read by skill text; refresh after `/clear` to be probed. No seats.yaml schema change needed: chart-usage already prints a seat unmeasured when its transcript is not found.
- D: withdraws snapshot-diff for codex in favor of the `/proc/<pid>/fd` read; keeps capture once at start and store, an fd miss records unknown.
- E: drops the cwd/time scan; adopts pi `--session-id` at start; the id read while live is persisted (label `akrogon.session` or state/seats.yaml) so usage after exit still has it.
