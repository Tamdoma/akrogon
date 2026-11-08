# Fork Notes: `watcher` (Seat E)

## Q1. What wakes the watcher: 20-minute cron, listener `<hc>` messages, or both?

1. **Pick:** **Both — keep the 20-minute Claude Code cron (`*/20 * * * *`, `/watch-issues tick <root>`) AND have the listener send `/watch-issues tick <root>` via `hc send` when an actionable anomaly occurs** (seat crash/exit, seat replaced by a `--keep` shell, `blocked` seat, leaf entering `phase=failed` including the 3rd-prompt silent-stop bound from `delivery` `Taken` Q3, or `delivery_error`), whenever a watcher terminal for that repo is live and `idle`/`done`.
   - **Reason:**
     1. **Immediate `<hc>` push on crashes/failures:** Honors Signpost 4a (*"an event listener notices crashes, and crash recovery is an automatic fix by the watch-issues agent"*) and the operator's 2026-11-06 direction (*"using `<hc>` wherever possible for communication"*) so a crashed seat or failed leaf is recovered in seconds rather than waiting up to 20 minutes.
     2. **Why the 20-minute cron is still required:** While a seat is stuck in an in-turn tool loop (`skills/watch-issues/SKILL.md:44` "Busy": 3x repeated command, 3x consecutive tool errors, edit-undo cycle) or waiting on a Codex question (`INTAKE.md:154`, where Codex stays `status.state === "working"`), **`hc events` emits zero events** because the seat's `hc` status and turn never change. The 20-minute cron is also what triggers `akrogon next` to cross the 60-minute `observeBusy` threshold when all seats are continuously `working`, and catches any event that fired while the watcher itself was `working`.
   - **Cost:** ~15 lines in the listener to `hc send` `/watch-issues tick <root>` (debounced/coalesced, only when the watcher terminal's status is `idle` or `done`).
2. **Rejected options:**
   - **Listener `<hc>` messages only (drop the 20-minute cron):** Rejected. Blind to in-turn `working` tool loops (`SKILL.md:44`), Codex `working` question stalls (`INTAKE.md:154`), and 60-minute busy leaves while no `hc` status/turn event fires.
   - **20-minute cron only (no listener `<hc>` wake):** Rejected. Leaves crashed seats and failed leaves waiting up to 20 minutes despite the listener already seeing the `hc events` transition (`forks/signposts.md:55,206`).
3. **Evidence:**
   - `operator` · [`forks/signposts.md` `## Taken` 4a and lines 62–66](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/signposts.md#L55-L66), [`INTAKE.md:154,204-208`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md#L154-L208) · read 2026-11-06.
   - `better-than-training` · [`skills/watch-issues/SKILL.md:10-45`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md#L10-L45), [`src/next.ts:223-265`](file:///home/ivan/Work/infra/akrogon/src/next.ts#L223-L265), [`forks/engine-shape.md:32`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/engine-shape.md#L32), [`forks/delivery.md:33-35`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/delivery.md#L33-L35), `hc events --help` · read 2026-11-06.
   - `practitioner` · Multi-layered coding-agent supervision patterns (cron watchdog + log-tail loop detector): event hooks catch process exits, while periodic timer ticks are required to detect silent in-turn reasoning/tool loops and stalls where process status stays active · searched 2026-11-06.
4. **Pitfalls & removals:**
   - *Listener sends `/watch-issues tick <root>` while the watcher is already `working`, queueing duplicate ticks:* Removed by **design part**: the listener sends only when the watcher terminal's status is `idle` or `done` and coalesces rapid events per repo.
5. **Unasked question:** None.

## Q2. How does it observe and act on `hc`?

1. **Pick:**
   - **`observe.ts` ([`skills/watch-issues/scripts/observe.ts`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/scripts/observe.ts#L1-L272)):** Resolve the repo's `hc` session via `repoSession(repo)` (`identity` `Taken` Q1 1a); query seat terminals with `hc ls --json --label akrogon.repo=<repo>` (or `hc get --json <addr>` per recorded leaf seat); map a live terminal whose `foreground.name` dropped to a shell (`--keep` after agent exit/core restart, `map-merged.md:34`) or `state === 'exited'` to `-` so the Waiting rule dispatches `akrogon next`, and map a live agent with `status: null` (backgrounded Claude, `map-merged.md:35`) to `unknown` (hands off); resolve `log<seat>=<path|->` for `working` seats via the shared `session-id` `Taken` Q2 transcript-path resolver.
   - **Read screen (`SKILL.md:34,44`):** `HC_SESSION=<name> hc read <pane> --lines 0` for `working` seats (`--source visible` equivalent); `HC_SESSION=<name> hc read <pane> --lines 80` otherwise.
   - **Stop and resteer (`SKILL.md:44`):** Run `HC_SESSION=<name> hc interrupt --json --timeout 10 <pane>` (or `hc keys <pane> esc` + `hc wait <pane> --timeout 10`), then `hc get --json <pane>` + `hc read <pane> --lines 0` to confirm `status.state` is `idle`/`done` with empty input and the same terminal/transcript, then `HC_SESSION=<name> hc send --json <pane> "<evidence>; the brief wants <target>; next: <step>"`.
   - **Notices (`SKILL.md:42-44`):** Call the `akrogon` notice verb from `notices` `Taken` Q2 2a (`forks/notices.md:33`).
   - **Reason:** 1-to-1 replacement of every `herdr` call in `observe.ts` and `SKILL.md` using public `hc` commands and the binding `identity`, `session-id`, and `notices` `Taken` decisions.
   - **Cost:** Porting `observe.ts`, `observe.test.ts`, and 6 command templates in `skills/watch-issues/SKILL.md`.
2. **Rejected options:**
   - **Use `hc send --force` on a `blocked` seat from the watcher:** Rejected. `SKILL.md:55` ("Never: Answer a seat") and `INTAKE.md:155` prohibit forcing answers to `blocked` seats.
   - **Treat `status: null` on a live agent process as crashed/`idle`:** Rejected (`map-merged.md:35`, `INTAKE.md:173-174`); backgrounded Claude reports `status: null` while still working, so `status: null` with a live harness process must map to `unknown` (hands off).
3. **Evidence:**
   - `better-than-training` · [`skills/watch-issues/SKILL.md:20-58`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md#L20-L58), [`skills/watch-issues/scripts/observe.ts:87-263`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/scripts/observe.ts#L87-L263), [`slots/map-merged.md:34-36`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/map-merged.md#L34-L36), [`forks/session-id.md:30-32`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/session-id.md#L30-L32), [`forks/notices.md:33`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/notices.md#L33), `hc interrupt --help`, `hc keys --help`, `hc read --help`, `hc send --help` · read 2026-11-06.
4. **Pitfalls & removals:**
   - *`hc interrupt` vs `hc keys <pane> esc` behaves differently across harnesses (`claude`, `codex`, `pi`, `agy`) when stopping a mid-turn tool:* Removed by **probe before handoff**: test stopping a busy turn with `hc interrupt --timeout 10` vs `hc keys <pane> esc` per harness in the throwaway session.
5. **Unasked question:** Should `OBSERVE_HERDR` (`SKILL.md:26`, `observe.ts:218`) be renamed `OBSERVE_HC` in `observe.ts` and `observe.test.ts`?

## Q3. Where does the watch session run and who starts it, including after a reboot?

1. **Pick:** **An operator-started Claude Code terminal in the repo's `herdr-app` space as today (`SKILL.md:3,8,16`), which labels its own terminal (`hc label $HC_TERMINAL_ID akrogon.role=watcher akrogon.repo=<repo>`) on `/watch-issues` start and removes those labels on `/watch-issues stop`.**
   - **Reason:** Preserves `SKILL.md:3` (*"started and stopped only by the operator"*) and `forks/signposts.md:64` (*"behavior very similar to what the old akrogon is doing for now"*). Because `herdr-core` terminals live in the core daemon (`AGENTS.md:19`), the operator-started watcher terminal survives closing the `herdr-app` window overnight. After a machine reboot, the listener's own startup `pull --all` and `next --resume` (`engine-shape` `Taken` Q2 2a) automatically resumes normal leaf work without needing a watcher session, and the operator starts `/watch-issues` when leaving the machine unattended.
   - **Cost:** Two `hc label` lines in `skills/watch-issues/SKILL.md` (`Invocations` section) so the listener can find the repo's watcher terminal by label.
2. **Rejected options:**
   - **Listener automatically starts a Claude Code watcher session per repo (at boot or on crash):** Rejected. Violates `SKILL.md:3` (*"started and stopped only by the operator"*), spawns unattended paid Claude sessions across all registered repos when the operator has not requested a watch, and invents new lifecycle state (`forks/signposts.md:62`).
3. **Evidence:**
   - `operator` · [`forks/signposts.md:55,62-66`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/signposts.md#L55-L66) · read 2026-11-06.
   - `better-than-training` · [`skills/watch-issues/SKILL.md:3,8,10-19`](file:///home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md#L3-L19), [`forks/engine-shape.md:32`](file:///home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/engine-shape.md#L32), [`~/.config/herdr-app/AGENTS.md:19`](file:///home/ivan/.config/herdr-app/AGENTS.md#L19) · read 2026-11-06.
4. **Pitfalls & removals:**
   - *The watcher's Claude process exits or the operator runs `/clear`, leaving `akrogon.role=watcher` on a shell or fresh session without the cron:* Removed by **design part**: the listener checks that the labeled terminal's `foreground.name` is an agent (`claude`) and `status.state` is `idle` or `done` before sending `/watch-issues tick <root>`, and `/watch-issues tick <root>` works even in a fresh `/clear`ed Claude session because `/watch-issues` is a global skill.
5. **Unasked question:** None.
