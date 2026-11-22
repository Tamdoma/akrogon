# Signposts missed angles (slot C)

## Missing direction questions

1. **Must the watch run inside an `hc` terminal?** (a) yes, refuse when `HC_TERMINAL_ID` is unset so `hc` owns delivery and parent-exit cleanup, (b) no, must also work outside `hc`.
   - Reason: `skills/watch-issues/scripts/observe.ts` (`main`) resolves the repo's session via `repoSpace` and never reads `HC_TERMINAL_ID`, while `docs/use/watch-while-away.md` § Start the watch assumes an `hc` terminal; requiring `hc` decides whether an `hc`-child timer using `hc send` is viable at all.

2. **Watch ownership and cardinality: per-terminal or per-repo?** (a) per-terminal (each watcher terminal owns its timer and `/watch-issues stop` stops only its own, as today), (b) per-repo across the `hc` session (at most one active watch per repo; duplicate start refuses and `stop` works from any terminal).
   - Reason: changes timer identity/labels, duplicate checks, cross-terminal `stop`, and whether one terminal may watch multiple repos.

3. **Tick delivery when the watcher is busy, blocked, or has an operator draft:** (a) skip or coalesce missed ticks until idle, (b) deliver every due tick as its own queued turn (as CronCreate does today).
   - Reason: `skills/watch-issues/SKILL.md` § Invocations and `tests/e2e/watch-check.e2e.ts` rely on queued ticks running back-to-back, whereas `hc send` waits on drafts, refuses `blocked`, and can steer mid-turn on active harnesses; this shapes the timer loop and `hc send` flags.

4. **Watch lifetime / expiry cap:** (a) finite expiry (e.g. 7 days, matching CronCreate today), (b) no time expiry, running until stopped or the conversation/session ends.
   - Reason: dropping CronCreate removes the 7-day cap in `skills/watch-issues/SKILL.md` § Invocations and `docs/use/watch-while-away.md` § Stop the watch; keeping one requires wall-clock deadline state and expiry reporting.

## Critique of A's draft questions

- **Q1 (mis-optioned / near-settled):** `INTAKE.md` § Source already asks for one shared script across all harnesses, and option (b) singles out Claude even though `agy` also has a native `schedule` tool; either drop Q1 or make (b) "use each harness's native scheduler where present, shared script elsewhere."
- **Q2 (mis-optioned — impossible as stated on `pi`):** option (a) conflates terminal/agent death (externally preventable via `hc` `state`/`status`/`foreground.pid`) with in-process `/clear` or `/new`. In `src/transcript.ts` (`piStart`, `transcriptFor`) and `skills/chart-issues/scripts/transcript.ts`, `pi` does not expose a `/new` session id via `/proc` until a tool runs with `PI_SESSION_FILE`, so an external timer cannot guarantee zero ticks reach a `/new`-cleared `pi` terminal; split process/terminal death from in-process reset.
- **Q3 (partially redundant with Q2):** once a watch ends with its live conversation/terminal (Q2a), surviving session loss or reboot would require auto-spawning a new harness session (a different product); the real missing lifetime question is expiry (item 4 above).
- **Q4 (conflicts with Q5 on `agy`):** `src/install.ts` (`planSkillLinks`) links skills into `.claude/skills`, `.agents/skills`, `.codex/skills`, and `.pi/agent/skills` — not `agy`'s global `~/.gemini/config/skills`. Option (a) ("skill folder only, no engine change") blocks fixing `agy` global install linking and blurs "no daemon/listener change" with "no `src/` edit" (`skills/watch-issues/scripts/observe.ts` already imports `src/hc.ts`, `src/config.ts`, and `src/transcript.ts`).
- **Q5 (too narrow on live proof):** testing only "a tick runs one check" omits the failure mode commit `3fdf8cd2` and `tests/e2e/watch-check.e2e.ts` guarded against — proving stop, `/clear`/`/new`, and exit leave no stray ticks per harness.
