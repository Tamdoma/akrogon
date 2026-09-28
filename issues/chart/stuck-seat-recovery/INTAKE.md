# Intake: stuck-seat-recovery

## Scope
A seat whose subagent admission fault has ended, or never needed a human, stops showing as herdr blocked, so akrogon dispatches it again. A seat hung inside a tool call that ignores abort is restarted without the operator. Owns akrogon#32 and akrogon#35.

## Provenance
- GitHub: Tamdoma/akrogon#32
- GitHub: Tamdoma/akrogon#35
- GitHub: Tamdoma/akrogon#36 (duplicate of #35, recorded after handoff)
- Operator: 2026-09-28 "go with all recommendations" (P1: #36 is a duplicate of #35)
- Operator: 2026-09-28 "go, create the handoff structure", "for everything needed"

## Source: Tamdoma/akrogon#32
# watch-issues cannot see or clear a seat stuck in herdr "blocked" (stale subagent admission fault)

Source: Tamdoma/akrogon#32
URL: https://github.com/Tamdoma/akrogon/issues/32

Unverified intake.

## Observation
In the tamdoma/framework watch, content-batch's seat B (`wA:pBN`) stayed stuck for about 3.5 hours before anyone noticed, and the watch took no action the whole time.

Timeline (CEST):
- 09:48: helper agent sa-11 finished, but its shutdown never confirmed before the deadline. The tamdoma-subagents manager records this as a rejected retirement (`manager.ts` `retireHandle`, reason "shutdown not confirmed before deadline").
- After that, every `subagent_spawn` failed with "Cannot spawn subagent: admission blocked by rejected retirement child=sa-11" (5 times, 09:48 to 09:59). The manager also sent `herdr:blocked` active, so herdr marked the pane `agent_status: blocked`. The fault clears only if sa-11's shutdown resolves or the manager closes, and neither happened.
- 10:33: the seat finished implement on its own (commit 85d9c8f17) and moved the leaf to check.review. Its screen showed "Parent Idle · subagents Done:11", but herdr still said `blocked`.
- akrogon counts `blocked` as busy (`src/next.ts:175`), so `akrogon next --all` never started B's check.review. Seat A finished its review and went idle, and the leaf stopped there.
- Recovery fails too: `herdr agent prompt wA:pBN "/reload"` is refused with `{"code":"agent_blocked","message":"agent wA:pBN is blocked and requires interactive input"}`. Only `herdr pane run wA:pBN "/reload"` gets past that check.

Gaps in `skills/watch-issues`:
- F1. `SKILL.md:36` (Waiting) only acts on seats that are idle or absent. `SKILL.md:40` (Busy) only judges working seats. No rule covers a `blocked` seat, and akrogon treats it as busy, so nothing owns it.
- F2. `SKILL.md:40` uses the screen as the only evidence (`herdr agent read`), and judges subagents "through the parent screen". The failed `subagent_spawn` results were only in the seat's pi session log (`~/.pi/agent/sessions/--<worktree>--/*.jsonl`). The screen showed nothing wrong.
- F3. The Busy triggers are loops, repeated errors and hung tools. There is no time limit on seats that make no progress, and `busy_notified` is recorded in state but no rule uses it.
- F4. `scripts/observe.ts:224-225` builds the `+HhMMm` age from `busy_since` (when the seat's job started), not from when the seat entered its current status. The watch reported "blocked 9h" when the seat had been blocked for about 3.5h.
- F5. The only allowed fix is `esc` plus a corrective prompt. That can't clear a stale flag, and `herdr agent prompt` is refused on blocked panes anyway. There is no allowed `/reload` or other remedy for a stale flag on an idle seat.
- The watch also never sent a `herdr notification show` for this seat. It only mentioned the problem in its chat replies on each tick.

## Location
- akrogon: `skills/watch-issues/SKILL.md` (Judge rules), `skills/watch-issues/scripts/observe.ts`, `src/next.ts:175`
- Consumer: tamdoma/framework, leaf `content-batch` (issues/open/satellite-network-simplify), pane `wA:pBN`, session `2026-09-27T01-47-21-014Z_01a0e08b-9c36-7465-837f-61487e14656f.jsonl`
- Related pi-extensions code: `tamdoma-subagents/manager.ts` `retireHandle` / `updateAdmissionFault` / `impossibleAdmission`, `tamdoma-subagents/index.ts:133` `onAdmissionFault` sending `herdr:blocked`, and `herdr-agent-state.ts` (blockedCount). Relevant pi-extensions commits: ca69dbb "refuse admission when retirement passes deadline" and 6eb2a10. Open pi-extensions worktrees: deadline-admission-refusal, retirement-stage-diagnostic.

## Reproduction
1. Run a leaf whose seat spawns helper agents one at a time.
2. Let one helper agent's shutdown pass the retirement deadline.
3. Every later spawn is refused, the pane shows `blocked` in herdr, and the seat finishes its phase without helpers.
4. The next phase needs that seat. Observe prints `B=<pane>/blocked+...`, the Judge rules match nothing, and `akrogon next` skips the seat.

Seen once on 2026-09-27. Any rejected retirement should cause it again.

## Expected behavior
- The watch detects a `blocked` seat whose screen or session is idle, or whose session log shows repeated failed `subagent_spawn`/`subagent_wait` calls, on the first tick.
- The watch has an allowed remedy that clears the stale flag, such as `herdr pane run <pane> "/reload"` on an idle seat with empty input, and notifies when that is not safe.
- A seat that makes no progress past a set time gets notified or acted on.
- The observe age shows how long the seat has been in its current status.

## Urgency
High. One stale flag stopped a leaf on the critical path (blueprint-route and its 4 downstream leaves wait on it) for about 3.5 hours with no alert. Workaround: an operator runs `herdr pane run <pane> "/reload"` by hand.

## Source: Tamdoma/akrogon#35
# watch-issues cannot restart a hung seat, so a wedged leaf waits for the operator forever

Source: Tamdoma/akrogon#35
URL: https://github.com/Tamdoma/akrogon/issues/35

Unverified intake.

## Observation
Two implement seats (framework leaves pool-smell-freeze, pane wA:pC1, and effort-evidence-lag, pane wA:pC3) hung for over 1h40m inside a tool call that ignores abort. The watch-issues skill's only lever is one `esc` per seat plus a resteer prompt. Esc, Enter and Ctrl+C had no effect. Its Never list forbids killing an agent process, so the watcher could only notify and wait. The operator's intent is to be absent entirely, with the watcher as a full replacement.

## Location
watch-issues skill (Busy rule and Never list), akrogon seat lifecycle.

## Reproduction
A seat's tool call waits on a promise that never resolves and does not honor the abort signal (here: parallel subagent_spawn calls in tamdoma-subagents, only one outside-root confirm shown). Watch ticks then see the seat "working" indefinitely, esc does nothing, and the skill has no restart path. Seen 2026-09-28, 5 consecutive ticks.

## Expected behavior
When a seat is proven hung (no session writes for N minutes, esc ignored), the watcher has a sanctioned way to restart the seat, for example an akrogon verb that stops the harness in that pane and relaunches the phase prompt, then continues the leaf without operator involvement.

## Urgency
High. Every hung tool blocks the leaf and its dependents (here live-replay and update-replay) until a human returns. Workaround: operator presses Ctrl+C/kills pi in the pane manually.

## Source: Tamdoma/akrogon#36
# watch-issues cannot see or answer a seat waiting on a pi confirmation prompt, so the leaf waits for the operator

Source: Tamdoma/akrogon#36
URL: https://github.com/Tamdoma/akrogon/issues/36

Unverified intake.

## Observation
On 2026-09-28, in the akrogon watch, `create-peer-panes` seat B (`w8:pCS`, pi) moved to implement and spawned a subagent. pi then showed a confirmation prompt and waited for a human:

```
Allow subagent outside parent root?
Resolved child cwd:
/home/ivan/Work/infra/akrogon/issues/worktrees/create-peer-panes-u1
This is coordination, not a filesystem sandbox.
→ Yes
  No
```

Gaps:
- F1. herdr and `scripts/observe.ts` report the seat as `working` (`B=w8:pCS/working busy=0h11m`). The watch treats that as normal busy work, so the prompt goes unnoticed.
- F1. `herdr agent read <pane> --lines 80` is refused while the seat is working (`agent_not_idle`). Only `--source visible` shows the prompt, and the skill's Busy rule does not mention that flag.
- F2. `skills/watch-issues/SKILL.md` says "Never answer a seat", and no rule lets the watch read and confirm a prompt. So the watch cannot stand in for the operator, even to approve the leaf's own worker worktree.
- F2. When the watch agent tried `herdr agent send-keys w8:pCS enter`, the Claude Code auto-mode classifier denied it as a remote shell write. So even an allowed answer needs a permission path.

## Location
- akrogon: `skills/watch-issues/SKILL.md` (Busy rule, Never list), `skills/watch-issues/scripts/observe.ts`
- Leaf `create-peer-panes` (issues/open/chart-peer-layout), pane `w8:pCS`
- pi subagent spawn confirmation ("Allow subagent outside parent root?")

## Reproduction
1. Run a leaf on a pi seat whose implement step spawns a subagent in a worker worktree outside the seat's cwd (for example `issues/worktrees/<slug>-u1`).
2. pi shows the "Allow subagent outside parent root?" prompt.
3. Observe prints the seat as `working`. The watch takes no action, and the leaf stalls until the operator answers.

Seen once on 2026-09-28.

## Expected behavior
- The watch detects a seat waiting on a confirmation prompt on the first tick.
- The watch can read the prompt and confirm it when it is safe (for example, the resolved path is the leaf's own worktree), through a permitted command. Otherwise it notifies the operator.

## Urgency
The leaf stops making progress until the operator answers the prompt by hand, which defeats the watch while the operator is away. Workaround: the operator presses Enter on Yes in the pane.

## Agent findings
Full drain maps in slots/ (A, B, C, merged, rebuttals), read 2026-09-28.
- Chain (A,B,C): pi manager.ts:1120-1127 records a retirement that missed its shutdown deadline. :1252-1258 keeps the admission fault while capacity is 0. It clears only if the shutdown later resolves (:1143-1150) or the manager closes. index.ts:133-134 emits herdr:blocked. herdr-agent-state.ts:191-193 lets blockedCount > 0 win over activity. akrogon src/next.ts:175 counts blocked as busy and :414 skips dispatch. src/shell.ts:100 marks agent_blocked retryable, so dispatch retries in a loop. (C)
- Root cause (C): a lasting admission fault is published under herdr blocked, a status meant for human input, so no consumer owns clearing it.
- An unconfirmed retirement does not prove the child stopped. The parent can be idle with a real unresolved fault. (B)
- The held blocked claim was a deliberate choice of pi-extensions leaf admission-fault-surface (issues/closed/subagent-admission-stall/admission-fault-surface/brief.md), made for Tamdoma/akrogon#16. (A)
- watch-issues SKILL.md:40 acts on busy seats with evidence, but has no admission-fault diagnosis or recovery. The 1 h notifier in next.ts:184,200 runs only inside akrogon next, which a blocked-only leaf need not trigger. (B)
- busy_since is kept across working to blocked (next.ts:196), so observe.ts:224 can overstate blocked age. (B)
- #35 (A, not yet peer-mapped): both hangs sat in tamdoma-subagents parallel subagent_spawn calls, the same extension as #32. The report states the operator intent: be absent entirely, with the watcher as a full replacement. That intent conflicts with the seat-stall-detection rule "no clock, poll or watchdog anywhere" and with the watch-issues Never list (no killing an agent process).
- #36 (A, 2026-09-28, after handoff): duplicate of #35. The prompt is the tamdoma-subagents outside-parent-root confirm, removed by pi-extensions leaf same-repo-worktree-cwd (brief done-criteria 5-6). The asks to let the watch read and answer prompts are foreclosed by restart-hung-seat Q2-A (Never list unchanged). The prompt appeared because create-peer-panes put its worker at repo level against skills/implement-issue/worker-protocol.md:11, which is charted in ../worker-worktree-location/. Observe reporting `working` during a dialog is off route: no dialog remains after the fix.
