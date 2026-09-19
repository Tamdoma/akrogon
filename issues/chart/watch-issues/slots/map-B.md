# Independent territory map B: watch-issues

Build one operator-invoked `skills/watch-issues/SKILL.md`. Its job is occasional lead-agent judgment using existing commands, not a new detector or repair engine. No core code, helper script, installed service, state-schema change or automatic charting. The opt-in authorizes only the selected repo/run and ends explicitly. This follows the separation already stated in `skills/AREA.md:18-22` and the operator-invoked precedent at `skills/chart-issues/SKILL.md:3,10,23`.

Evidence paths are relative to `/home/ivan/Work/infra/akrogon`. `W` means `/tmp/claude-1000/-home-ivan-Work-personal-MDConsultingNY-boulevard-automation/71fb72b4-e62b-4095-84ee-3832308020d4/scratchpad/watchdog`. Read the full supplied intake and both skill assets. No peer map was read. Ran only `herdr agent`, `herdr notification`, and `herdr tab` to inspect syntax; no live mutations or scheduling were performed.

## What remains and what can actually resolve it

| Case | Evidence to inspect | Existing action and boundary |
|---|---|---|
| C1. Required unfinished seat idle/done, missed delivery or missed next | Current leaf phase/done, live pane/session and visible screen; distinguish waiting dependency from dispatch omission. | `akrogon next <leaf-path>` once. It rechecks done, busy and prompt grace (`src/next.ts:350-360`), then dependencies and required slots (`:470-478`). No phase promotion from artifact filenames. |
| C2. Idle seat with old busy marker | Live idle/done matters more than the stored busy age. | Same targeted `next`; observeBusy clears stale markers (`src/next.ts:180-189`). No hand editing state.yaml. |
| C3. Delivery rejection or ambiguous timeout | Read recorded delivery evidence when the handed-off delivery fix is actually deployed. | Targeted `next` delegates retry/late-receipt settlement to the command. `issues/open/seat-prompt-delivery/one-attempt-per-pass/brief.md:4,10-16` owns one attempt, offset-based session checking and third-failure stop. **Live code still has the loop** at `src/next.ts:348-428`. Do not claim that merely handing off the leaf made retries safe. |
| C4. Failed transient delivery, cause demonstrably resolved | `failure.phase`, cause, reason, current panes and blockers. Check every peer, not just failed slot. | If recovery authority is selected below: `akrogon phase <slug> <failure.phase>`, then targeted `next`. Failed has no required slot (`src/routing.ts:35-39`), but recovery still has guards (`src/phase.ts:212-217`). It resets the whole phase, not just B (`src/phase.ts:95-112`). |
| C5. Failed human prerequisite, credentials, permissions, repair exhaustion or unexplained failure | Failure reason/pass artifact. Never inspect .env to decide whether a credential appeared. | Notify once with the actual required operator action. `next` intentionally does nothing to failed leaves (`src/next.ts:463`). `cause: attempts` alone does not mean retryable delivery: review exhaustion uses it too (`src/phase.ts:234-245`). Do not recover simply because the enum says attempts. |
| C6. Seat has verifiably stopped and cannot continue but has not declared failure | Required unfinished slot and concrete blocker, with all peers quiescent. | Existing seat stop is `akrogon phase <slug> failed --reason "..." --slot <S>` (`src/phase.ts:198-209`). Default lead policy should notify and leave this declaration to the seat, unless the operator explicitly authorizes lead-declared stops. It changes lifecycle/capacity without terminating the agent and can conflict with a working peer. |
| C7. Working/blocked/unknown for a long time, including silent shell, model request or child wait | A bounded visible pane read and, if needed, `herdr agent explain <pane>`. Busy age alone is not progress evidence. | Notify on a substantiated problem, otherwise leave working. No Ctrl+C, kill, pane close, stop/restart, auto-answer or alternate input path. Akrogon treats all three states as busy (`src/next.ts:170-174`). The existing one-hour alert is observation-driven and never recovers work (`:180-209`). |
| C8. All scoped leaves complete, or already failed and awaiting human work | Authoritative open/closed inventory, failure records, run manifest. | Delete this run's cron when its selected stop condition is met. Failed attention already occurs at transition and renames the tab (`issues/closed/noninteractive-leaf-execution/failure-attention/brief.md:4,14`); do not send the same failed notice every tick. |

`akrogon next --all` is an available repo-wide reconciliation action, not an observation command. Inside a registered repo it sweeps that repo; outside one it sweeps all registered repos (`src/next.ts:610-619`). It can launch untouched eligible leaves and clean up merged worktrees/tabs (`:487-493`). Prefer targeted next for one anomaly. Neither command repairs arbitrary code, supplies missing credentials, nor proves that a silent process is stuck.

The overnight fixes are evidence, not a reusable repair cookbook: `W/history.md:161` records copying misplaced artifacts for #18; `:1942` records a silent Chromium install, explicitly not killed. The intake says the artifact bug is fixed and timeout/env controls have other owners (`issues/chart/watch-issues/INTAKE.md:46`). The new skill must not copy historical workarounds or answer old request_user_input forms. The merged no-questions contract already owns those seat behaviors (`issues/closed/noninteractive-leaf-execution/skills-never-ask/brief.md:4`).

## Material forks for the operator round

### Q1 · Should an invocation watch the whole repo or only a named existing run?

The intake alternates between every leaf in the repo and `/watch-run <epic>`. This controls spending and which unstarted work the lead may release. Keep one fixed authorization scope per invocation.

Research: **operator**, `issues/chart/watch-issues/INTAKE.md:3-4,28-30,41`, read 2026-09-19; named-run and repo-wide intents coexist. **better-than-training**, `src/next.ts:470-478,610-619`; repo-wide next is broader than watching existing seats. This makes scope an authorization decision, not a formatting preference.

- **A (recommended):** Capture a named issue/epic's current leaf identities, or the repo's current leaves when no narrower target was named. Act only on that fixed set; new leaves require a new opt-in. Use targeted next.
- **B:** Watch the whole registered repo dynamically, including newly handed-off leaves; allow repo-scoped next --all. This is simpler selection but authorizes more future launches.

Pitfalls: A targeted completion can itself invoke sweepAll (`src/next.ts:605`), so do not call next on merged leaves for observation. Resolve the registered root and correct Herdr session/workspace once; names and pane IDs alone do not establish cross-session identity. Treat a mismatch as notify-only, not permission to recreate tabs.

### Q2 · Is twenty-minute economy or two-minute response the priority?

Both numbers occur in the same operator statement. Neither is settled by arithmetic or silence. Recommend 20 minutes for a rare safety check after root-cause fixes; offer 2 minutes explicitly for a time-critical run.

Research: **operator**, `issues/chart/watch-issues/INTAKE.md:41,46`; the account says 33 of 36 ticks found no action. `W/tick.sh:10-60` emits full status, states, pane tail, worktrees, commits and a diff on every tick. `W/history.md:1446,1505,1561` shows repeated observations while work waited. Read 2026-09-19; evidence favors less frequent, smaller observations, not a claimed measured token price.

- **A (recommended):** Every 20 minutes. Three invocations/hour, 36 in 12 hours. Nominal average detection delay about 10 minutes for uniformly timed incidents while the lead remains idle.
- **B:** Every 2 minutes. Thirty/hour, 360 in 12 hours; roughly ten times the tick count and nominal average delay about one minute.

Pitfalls: Both delays can be longer because of lead activity and jitter. If average measured tick cost is C tokens, the 12-hour totals are approximately 36C versus 360C, before caching and growing-context effects. A five-line reply cap does not cap input/reasoning/tool cost. No fixed dollar/token claim is supported by the supplied history. Read status once and inspect only anomalous seats rather than replaying all logs every tick.

### Q3 · Should watch be tied to one live Claude Code lead session?

This is the smallest trigger that respects the no-core-watcher decision. It is best effort, not an unattended service guarantee.

Research: **operator**, the supplied CronCreate schema findings at `issues/chart/watch-issues/INTAKE.md:47`, read 2026-09-19: idle-only, in-memory, seven-day expiry, up-to-10% jitter and a CronDelete ID; durable has no effect. **better-than-training**, `src/install.ts:11-21` installs every skill into four harness roots. These facts require runtime capability gating and an honest availability warning.

- **A (recommended):** Require Claude Code with CronCreate, CronList and CronDelete available, create one recurring session job, record its returned ID and confirm activation only after creation succeeds. Stop/remove only that owned job. No shell timer fallback or automatic renewal.
- **B:** If the cron tools are absent, perform one explicitly described read-only check and report that no watch is active. This offers a useful inspection but no recurring coverage.

Pitfalls: The lead doing lengthy work delays ticks; session death loses the job; expiry ends coverage. Job creation is not proof future checks will happen. Do not promise continued monitoring after closing the session or across sessions. The skill must refuse to claim activation in pi/Codex even though install symlinks it there. Repeat invocation should reuse/replace its own job, not add duplicates or delete unrelated cron jobs. The current slot-B harness cannot validate Claude Cron execution; these limits come from the supplied schema, not a fabricated live test.

### Q4 · May the lead recover a failed delivery, or only resume idle active leaves?

“Fix it yourself” must mean a small set of existing guarded lifecycle actions. It cannot authorize arbitrary repairs, decisions outside the leaf contract or retries until success.

Research: **better-than-training**, `src/routing.ts:35-43`, `src/phase.ts:95-112,198-217,234-245`, read 2026-09-19; recovery is legal but discards the phase's peer results, and failed causes include human blockers and exhausted repairs. **operator**, `INTAKE.md:30,43`; no worktree/env edits and never kill working processes. This separates legal commands from safe circumstances.

- **A (recommended):** Alone, run one targeted next per newly established idle-dispatch problem. Permit one recovery of a failed transport delivery only when its recorded cause is understood, the obstacle is now demonstrably gone, the interrupted phase is known and every seat is quiescent. Recover to that recorded phase, then next. Record the outcome; recurrence is notify-only until new evidence/authorization.
- **B:** Run next only for active idle leaves; all failed recovery is notify-only. Lower autonomy, lowest risk of spending on a repeated failure.

Pitfalls: A means conditional recovery, not reset attempts every tick. Legacy failed states without failure.phase need human review. Dirty attempts-cause recovery may be refused; never stash/commit/edit to bypass it. No phase promotion from artifacts, no direct state edits, no old artifact copying, no question answering through pane run, and no notification-triggered external service. Keep lead-declared phase-failed outside default authority; the command exists but is intended as the seat's stop.

### Q5 · When should the opt-in end?

Completion alone can otherwise leave a job spending all night on a blocker no allowed action can resolve.

Research: **operator**, `INTAKE.md:30,47`, read 2026-09-19; completion/operator stop are requested and the platform expires jobs after seven days. **better-than-training**, `src/routing.ts:34-39`, `src/next.ts:463`; merged is terminal, failed remains resumable but does not advance via next. This requires distinguishing “finished” from “needs a person.”

- **A (recommended):** Stop on operator request, confirmed completion of every captured leaf, loss of safe repo/session identity, or when no scoped work can progress without the operator after one explanatory notification. Also capture an operator-selected end time for the absence; never auto-renew.
- **B:** Stop only on explicit request, confirmed completion or platform expiry; keep observing failed/human-blocked runs without repeat notices. This may catch an externally resolved blocker but spends tokens during a known wait.

Pitfalls: Empty issues/open is not proof all captured leaves merged; look them up in closed and distinguish missing/parked/error from completion. One failed leaf must not end monitoring of other progressing leaves. Deleting the cron ends monitoring, never the seats. If tool deletion fails, report that the job may still exist rather than claiming it stopped.

### Q6 · Is a small decision ledger enough, without full snapshots and diffs?

Most decisions need current state. Cross-tick memory is useful for suppressing repeated notifications and limiting recovery, not for proving a freeze.

Research: **operator**, `W/tick.sh:4-7,49-60`, `W/history.md:1452,1942`, read 2026-09-19; the old script stores full snapshots and diffs, while the meaningful outcomes are a small set of interventions. **better-than-training**, `src/status.ts:87-107`, `src/state.ts:33-44`; phase, attempts, failure and seat metadata already exist. This favors a small record instead of another snapshot pipeline.

- **A (recommended):** One Markdown record in the lead session's scratch directory, absolute path captured in the cron prompt. Store repo/session/scope, cron ID, cadence/end condition, last check time, unresolved anomaly identities, notices and recovery outcomes. Update a short current summary; append only meaningful changes/actions. No tick.sh, full transcript copies or text diff required.
- **B:** Save a compact previous/current snapshot and diff every tick in that scratch directory. More history for investigation, but more output, storage and parsing instructions.

Pitfalls: Do not write the ledger into leaf worktrees or lifecycle state. Do not copy pane text that may contain credentials, even though the skill never opens .env. An unchanged screen or phase is not proof of a hang. Distinguish a new anomaly from the same known blocker so one incident does not trigger twenty notifications. Loss of the ledger removes dedup/recovery history; reconstruct from authoritative state or suspend automatic recovery, not guess.

## Operational pitfalls and acceptance examples

- **R1 — False idle/blocked:** read live seat identity and screen before intervention; include all peer seats. Working/blocked/unknown are all intentionally undispatchable (`src/next.ts:170-174,354`). Do not interpret busy_since as CPU/output progress. A productive child wait must be left alone; a silent running command may receive a notice but never a kill.
- **R2 — Concurrent plugin passes:** startup and four events already invoke next (`plugin/herdr-plugin.toml:10-27`). Before acting, refresh current state. The global flock serializes command mutations (`src/next.ts:594-595`, `src/state.ts:126-145`), but it does not make an old lead judgment current or prevent a later duplicate pass. Let command guards and the delivery fix govern receipt/attempts. Never build another resend loop in the skill.
- **R3 — Lock contention:** a next command waiting for flock is not a hung execution seat. Do not launch more next commands while one remains in flight. The cadence is not a completion deadline. If a tool operation cannot complete, record/report that limitation; no lock breaking or process killing.
- **R4 — Notification scope:** use the inspected syntax `herdr notification show "<repo>/<slug>: attention" --body "<seat/pane; evidence; required action>" --sound request`. Failure-attention already owns failure notices and labels (`issues/closed/noninteractive-leaf-execution/failure-attention/brief.md:4`). Alert only on new actionable evidence or missing delivery, record returned outcome, and do not add tab-renaming semantics. Herdr notification is not a guarantee the sleeping operator sees it.
- **R5 — Handed off is not deployed:** the delivery contract is open and live dispatch still loops. Gate reliance on its behavior on actual deployment. Env and timeout fixes reduce specific incidents but do not prove model/network/custom-tool stalls impossible. Do not postpone this map by reimplementing those owners.
- **R6 — Test the skill's decisions, not exact wording:** walk through idle/missed prompt, healthy busy, child blocked, failed missing credential, resolved delivery failure with working peer, repeated unresolved failure, lost session, and all-scoped-merged cases. Verify supported activation/deletion in a Claude Code lead when implementing; on unsupported harnesses, verify no recurring-watch claim. All examples should resolve using the single skill file and existing tools.

## Handoff boundary and challenge check

One issue/leaf can own #25 and one skill file. The automatic installer already discovers it (`src/install.ts:11-21`), so no installer change is justified. Keep skill naming operator-invoked and its no-fallback capability check prominent. No core detector: `issues/chart/seat-stall-detection/CHART.md:14-16` rules it out, while `issues/chart/stall-notifier-removal/CHART.md:7` retains the existing notifier. The intake's older assertion that detection stays in core #24 is superseded by its final findings at `INTAKE.md:51`.

A practitioner should challenge the two-minute token budget, whether any failed recovery is acceptable without the operator, and how broad the watched run is. The hard limitation remains: no allowed observation reliably separates every productive silent process from a hang. The skill can safely recover certain missed dispatches and explain unresolved stops; it cannot promise automatic repair of every stall while never interrupting working processes.
