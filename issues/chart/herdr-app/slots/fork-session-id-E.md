# Fork Notes: `session-id` (Seat E)

## Q1. Which features keyed on agent session id are kept?

1. **Pick:** **Keep all three existing behaviors from old akrogon**, backed by one shared session/transcript resolver:
   - **(a) Watcher log-tail** ([`observe.ts`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/scripts/observe.ts#L157-L181) + [`log-tail.ts`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/scripts/log-tail.ts#L1-L498)) for loop detection on `working` leaf seats.
   - **(b) Chart usage** ([`chart-usage.ts`](file:///home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/chart-usage.ts#L1-L720) + [`seats.yaml`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/seats.yaml#L1-L24) → `USAGE.md`).
   - **(c) Diagnostic `session` field in `issues/log.jsonl` ([`src/log.ts:36-51`](file:///home/ivan/Work/infra/akrogon/src/log.ts#L36-L51)) and `issues/timings.jsonl` ([`src/next.ts:719,755`](file:///home/ivan/Work/infra/akrogon/src/next.ts#L719-L755)):** populate `session: string | null` with the resolved agent session UUID (`null` when unresolvable or `agy`), keeping `logSchema` and `timingSchema` and their recorded values matching old akrogon.
   - **Reason:** Directly honors the operator's binding correction in [`forks/signposts.md:64-66`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/signposts.md#L64-L66) (*"make sure that we have all the behavior very similar to what the old akrogon is doing for now, with the addition of all the improvements of herdr-core and herdr-app"*) and Signpost 4a (`watch-issues` workflow unchanged). Because `observe.ts` and `chart-usage.ts` already need the session/transcript resolver, calling the same helper in `log.ts` and `next.ts` keeps `log.jsonl` and `timings.jsonl` faithful at near-zero extra cost (`next.ts` already holds the `hc get` terminal record).
   - **Cost:** One small shared resolver used by `src/log.ts`, `src/next.ts`, `observe.ts`, and `chart-usage.ts`.
2. **Rejected options:**
   - **Drop `log-tail.ts` and judge busy seats from `hc read --lines 0` only:** Rejected. Stacked panes are 6–7 rows tall (`hc get --json t6c` `rows: 7`), too short to show 3x repeated commands or edit-undo hashes (`old#`/`new#`).
   - **Drop `chart-usage.ts` and `USAGE.md`:** Rejected. `chart-usage.ts` already parses local JSONL transcripts without herdr; dropping it loses operator wait-time and token accounting.
   - **Null out `session` permanently in `log.jsonl` and `timings.jsonl`:** Rejected under the [`forks/signposts.md:64-66`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/signposts.md#L64-L66) operator correction when the shared resolver can populate the real session UUID for `claude`, `codex`, and `pi`.
3. **Evidence:**
   - `operator` · [`forks/signposts.md` `## Taken` 2a, 4a, and lines 62–66 corrections](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/signposts.md#L53-L66) · read 2026-11-06.
   - `better-than-training` · [`skills/watch-issues/SKILL.md:32,44`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md#L32-L44), [`skills/watch-issues/scripts/observe.ts:157-181`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/scripts/observe.ts#L157-L181), [`skills/chart-issues/scripts/chart-usage.ts:130-149,570-628`](file:///home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/chart-usage.ts#L130-L149), [`src/log.ts:21,36-51`](file:///home/ivan/Work/infra/akrogon/src/log.ts#L21-L51), [`src/timing.ts:31`](file:///home/ivan/Work/infra/akrogon/src/timing.ts#L31) · read 2026-11-06.
   - `practitioner` · `ccusage` (`ccusage.com`) and `turnlens` (`npx turnlens@latest --provider codex`): external token/turn analyzers read local `~/.claude/projects/` and `~/.codex/sessions/` JSONL transcripts directly rather than querying the terminal multiplexer · read 2026-11-06.
4. **Pitfalls & removals:**
   - *A missing or unreadable transcript fails `logMove` or `appendTiming`:* Removed by **design part**: preserve the non-throwing diagnostic contract in [`src/log.ts:46-49`](file:///home/ivan/Work/infra/akrogon/src/log.ts#L46-L49) so any lookup miss returns `session: null`.
5. **Unasked question:** Should the shared session/transcript resolver live in `src/` (e.g. `src/transcript.ts` or `src/shell.ts`) and be imported by `observe.ts` and `chart-usage.ts` so all four callers share one implementation?

## Q2. How is a seat's session id or transcript known?

1. **Pick:** **Hybrid per-harness transcript discovery from `hc get --json <address>` (`foreground.pid`, `cwd`, `created_ms`) — no start-flag injection and no `herdr-setup` patch:**
   - **Live seat (`observe.ts` and live `chart-usage.ts`):** Read `/proc/<foreground.pid>/fd` first, falling back to `(cwd, created_ms)` directory scan:
     - `codex`: `/proc/<pid>/fd/*` symlink matching `/.codex/sessions/.../rollout-*-<uuid>.jsonl` (verified live on `t6c` PID `2617566` fd 64); fallback after exit scans `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` whose `session_meta` matches `cwd` and `created_ms`.
     - `claude`: `/proc/<pid>/fd/*` matching `/tmp/claude-<uid>/<slug-cwd>/<uuid>/tasks` → `~/.claude/projects/<slug-cwd>/<uuid>.jsonl` (verified live on `t6d` PID `2617605` fd 33, `3.89 MB`); fallback scans `~/.claude/projects/<slug-cwd>/*.jsonl` with `birthtimeMs`/`mtimeMs >= created_ms`.
     - `pi`: scan `~/.pi/agent/sessions/--<slug-cwd>--/<ISO>_<uuid>.jsonl` whose filename timestamp matches `created_ms` (verified live on `t6f`: `2026-11-06T11-12-04-049Z_*.jsonl` vs `created_ms` `11:12:03.870Z`).
   - **Reason:** Works uniformly across initial runs, door `/clear` handovers (which mint a new session ID inside the same Claude process, breaking a start-time `--session-id`), and harnesses without session-id flags (`codex`), with zero changes to `harnesses:` config or `hc`.
   - **Cost:** ~30 lines of Linux `/proc/<pid>/fd` + timestamp-fallback lookup shared by `observe.ts` and `chart-usage.ts`.
2. **Rejected options:**
   - **Pass `--session-id` at start (`claude --session-id`, `pi --session-id`):** Rejected as sole mechanism. Fails on `codex` and `agy` (no flag), breaks on `claude` after `/clear` handover (new session ID in same process), and `pi` still names its file `<ISO-timestamp>_<id>.jsonl` under `--<slug-cwd>--/`.
   - **A `herdr-setup` patch to `hc`:** Rejected. `hc` is a prebuilt stripped Rust binary (`slots/map-merged.md:9`), and scraping harness-private files does not belong in `herdr-core`.
3. **Evidence:**
   - `better-than-training` · Live `/proc/<pid>/fd` inspection on `t6c` (`2617566` codex), `t6d` (`2617605` claude), `t6f` (`2617637` pi), `t6g` (`2617645` agy); `claude --help`, `codex --help`, `pi --help`, `agy --help`; [`observe.ts:122-181`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/scripts/observe.ts#L122-L181), [`chart-usage.ts:130-149`](file:///home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/chart-usage.ts#L130-L149) · read 2026-11-06.
   - `practitioner` · `ccusage` (`~/.claude/projects/<slug-cwd>/<uuid>.jsonl`) and `codex-transcripts` (`~/.codex/sessions/YYYY/MM/DD/rollout-<ts>-<uuid>.jsonl`) path conventions · read 2026-11-06.
4. **Pitfalls & removals:**
   - *Multiple consultants share repo `cwd` (`/home/ivan/Work/infra/akrogon`) during charting:* Removed by **design part** + **probe before handoff**: `/proc/<foreground.pid>/fd` pins the exact file for live `codex` and `claude` processes even when two seats share the same `cwd`, and `created_ms` disambiguates `pi` filenames (`<ISO-ts>_<uuid>.jsonl`).
5. **Unasked question:** Should `seats.yaml` record the resolved session ID / transcript path lazily when `chart-usage.ts` runs (from `pane` address via `hc get`), so the door never has to look up session IDs manually during charting?

## Q3. What does a kept feature do when a seat's id/transcript is unknown (`agy` or lookup miss)?

1. **Pick:** **Graceful degradation using the existing fallbacks across all three features:**
   - **`watch-issues` (`observe.ts` + `SKILL.md:44`):** `observe.ts` outputs `log<seat>=-`; the watcher judges the busy seat from `hc read <seat> --lines 0` (visible screen) and reports `no log` for that seat, never failing the tick.
   - **`chart-usage.ts` (`SKILL.md:73`):** When `session` is `none`/unresolvable or `harness === "agy"`, `chart-usage.ts` outputs `<seat>=unmeasured` in the summary line, writes `seat <L>: usage unmeasured (<reason>)` in `USAGE.md`, and exits `0` with `outcome partial` (which [`SKILL.md:73`](file:///home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md#L73) already accepts without holding handoff).
   - **`log.jsonl` and `timings.jsonl` (`src/log.ts`, `src/next.ts`):** Write `session: null` without throwing, matching [`src/log.ts:46-51`](file:///home/ivan/Work/infra/akrogon/src/log.ts#L46-L51) and [`src/timing.ts:31`](file:///home/ivan/Work/infra/akrogon/src/timing.ts#L31).
   - **Reason:** Matches existing contracts in [`skills/watch-issues/SKILL.md:44`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md#L44) and [`skills/chart-issues/SKILL.md:39,73`](file:///home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md#L39-L73) with zero new failure modes.
   - **Cost:** `agy` seats show `no log` in watcher ticks and `unmeasured` in `USAGE.md` unless an `agy` transcript parser (`~/.gemini/antigravity-cli/brain/<id>/.system_generated/logs/transcript.jsonl`, found via `/proc/<pid>/fd` `.db`/`.lock`) is added later.
2. **Rejected options:**
   - **Fail `observe.ts` or `chart-usage.ts` (non-zero exit) on an unknown session or `agy` seat:** Rejected; breaks watcher ticks and chart handoffs whenever `agy` is used or a seat exits before lookup.
   - **Require an `agy` parser in `log-tail.ts` and `chart-usage.ts` in this port:** Rejected per Signpost 2a ("don't invent new stuff"); `agy` had no parser in old herdr either.
3. **Evidence:**
   - `better-than-training` · [`skills/watch-issues/SKILL.md:44`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md#L44), [`skills/chart-issues/SKILL.md:39,73`](file:///home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md#L39-L73), [`skills/chart-issues/scripts/chart-usage.ts:570-628,685,717`](file:///home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/chart-usage.ts#L570-L628), [`issues/chart/herdr-app/seats.yaml:7-22`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/seats.yaml#L7-L22) · read 2026-11-06.
   - `practitioner` · Searched for multi-harness usage tools supporting Antigravity (`agy`) transcripts alongside Claude/Codex and found none · 2026-11-06.
4. **Pitfalls & removals:**
   - *`chart-usage.ts` reports `errors` when every consultant has `session: none` in `seats.yaml`:* Removed by **design part** + **leaf done-criterion**: `chart-usage.ts` resolves `session: none` from `pane` (`hc get --json <pane>`) before falling back to `unmeasured` (`outcome partial`, exit `0`).
5. **Unasked question:** Should `agy` (`~/.gemini/antigravity-cli/brain/<id>/.system_generated/logs/transcript.jsonl`, discoverable via `/proc/<pid>/fd` `conversations/<id>.db`) be added to `log-tail.ts` later as a separate follow-up issue?
