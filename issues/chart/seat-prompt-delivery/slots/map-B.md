# Independent territory map B: prompt delivery and attempt accounting

Read-only investigation, 2026-09-19. No peer map read, no live pane prompted, no operator question asked. Paths without a root refer to `/home/ivan/Work/infra/akrogon`. This map distinguishes confirmed behavior from hypotheses about the lost transport error.

## Evidence

- **E1 — Operator and persisted incident:** The supplied note reports an empty B input box and no B check-issue message. `/home/ivan/.pi/agent/extensions/issues/log.jsonl:48-51` confirms review entered at 07:38:34.184 and failed at 07:38:57.639, then entered at 07:42:23.958 and failed at 07:42:45.377. B attempts are 3 in both failures; the second failure contains A's nits verdict. The intervals are approximately 23.5 and 21.4 seconds, not an exact 22 seconds each.
- **E2 — Sessions independently checked:** In `/home/ivan/.pi/agent/sessions/--home-ivan-.pi-agent-extensions-issues-worktrees-child-question-parent-delivery--/`, session `2026-09-19T07-14-54-718Z_01a0b884-a07e-76dd-a7a5-21937747ba67.jsonl:72` contains the B implementation prompt at 07:21:01.724. Session `2026-09-19T07-38-39-333Z_01a0b89a-5d65-7415-a947-df00e403c3d3.jsonl:4` contains A's review prompt. No B review user message was found in the inspected 07-hour session files. The current input box was not independently inspected.
- **E3 — Logged session can identify the wrong seat:** `src/log.ts:12-15` prefers `HERDR_PANE_ID` over the failing slot's pane. Consequently log line 51, which records B's failure, names the A review session. Preserve caller identity separately from target pane/session in any new delivery evidence.
- **E4 — Confirmed loop:** `dispatchSlot()` increments a single seat counter before startup or prompt (`src/next.ts:383-388`), then immediately continues after retryable startup failure (`:406-409`) or prompt failure (`:440-444`). Only successful prompt waits populate `prompted` and `prompted_at` (`:429-436`), so the two-minute success grace does not pace the failing path (`:376-380`). Three loop iterations can exhaust the leaf without three accepted tasks.
- **E5 — Timeout is not a negative delivery acknowledgment:** Herdr patched `docs/next/website/src/content/docs/cli-reference.mdx:305` says a timeout of five seconds or less returns ordinary timeout rather than agent_prompt_stalled. Akrogon uses exactly 5000 ms (`src/next.ts:422-426`). Herdr patched `src/api/wait.rs:232-246,632-655` confirms that distinction and includes status/sequence evidence in error messages. The incident's exact error code remains unknown.
- **E6 — Research scope:** Inspected those local primary sources, next/phase/log code, retry tests, and the handed-off failed-with-cause/failure-attention briefs. Searched prompt_stalled, bracketed paste, retry, attempts, timeout and session linkage. No outside practitioner interview or live transport reproduction was performed. Installed/running Herdr server parity with the patched source has not been verified, so source behavior is a hypothesis guide, not proof of which binary handled the incident.

## Problem class

The dispatcher treats a transport operation and an accepted execution attempt as the same counter, retries an ambiguous submission immediately, then destroys useful current phase progress when the counter trips. `commitMove()` clears done/verdict/prompted/attempts for every phase change (`src/phase.ts:26-34`), including failure and recovery. This is distinct from a seat deliberately stopping because an external prerequisite is unavailable.

The elegant target is one explicit delivery outcome per seat, phase and session: accepted, explicitly rejected before delivery, or acceptance unknown. A missing status acknowledgment must not silently become “the agent tried and failed.” Keep the last concrete transport evidence and use the existing lifecycle failure/attention path when the selected recovery policy requires an operator.

## Root-cause hypotheses and discriminating checks

- **H1 — Input went to the wrong or changed foreground consumer.** A cached idle classification may coexist with an extension dialog, session transition or changed pane occupant. Herdr documents startup readiness, live prompt submission and lifecycle-based waits, not a Pi transcript receipt (patched CLI docs:299-305). In an isolated same-version Pi pane, capture target pane/terminal/session identity and foreground ownership immediately before and after one prompt, then compare its session user-message append. Inspect Pi input handlers that can consume input. Do not infer the target session from the current logMove session field (E3).
- **H2 — Terminal submission was consumed or misencoded.** Herdr promises live bracketed-paste handling and atomic text plus encoded Enter (patched CLI docs:305). An empty editor with no user message is compatible with input being consumed outside the normal prompt path, but does not prove a paste bug. Verify one harmless prompt in a scratch pane with the same Pi/extensions/version and capture the submitted terminal bytes, paste mode and Pi input events locally without secrets. Compare a clean Pi session with the affected extension set. Repair belongs to Herdr or Pi only after reproducing the failing boundary; do not add pane-run/send-keys fallback delivery to akrogon.
- **H3 — The prompt arrived, but lifecycle acknowledgment was late or wrong.** A status wait can fail after submission; patched socket-api.mdx:114 describes one atomic submit-and-wait request, and wait.rs:232-258 observes status changes rather than a persisted user-message receipt. This is less consistent with the inspected missing B message, but remains possible for a different session/occupant or delayed processing. Capture raw response, state-change sequence and correctly identified session together. A controlled delayed lifecycle callback should show whether input is present despite timeout and whether current retries duplicate it.
- **H4 — A definite pre-submission rejection or startup failure consumed the budget.** The allowlist includes agent_blocked and agent_not_ready as well as timeouts (`src/next.ts:348-354`); startup and prompt failures share the counter. Without stderr, a three-count failure cannot distinguish them. A fixture must inject each error at the actual operation and assert counters and persisted evidence. A prior successful implementation prompt only proves the pane was usable then, not at review handoff.

## Material forks

### K1 — Retry pacing without a hidden clock

**Recommend:** remove the tight resend loop for ambiguous prompt failures. Persist the outcome and return control. An explicit pre-delivery transient rejection may get one bounded immediate retry if the transport contract proves nothing was submitted; an ambiguous timeout must not be blindly resent. A later existing lifecycle event or explicit next invocation may reconcile the same target session against fresh evidence. Deduplicate events so an event burst cannot burn the budget without a meaningful readiness/session change.

**Alternative:** retain three immediate retries or add sleeps/backoff. Immediate retries repeat the same unproven condition and can duplicate accepted work; sleeping introduces pacing without establishing readiness. No new timer, watcher or polling loop is justified.

**Necessary boundary:** event-driven retry cannot guarantee progress if the unreachable pane emits no more events. Choose explicit operator recovery with the stored diagnosis for that case, using the existing attention mechanism rather than leaving an unobservable pending delivery. A command-scoped Herdr wait is distinct from a hidden recurring watchdog, but extending its deadline is not proof that input reached Pi.

### K2 — Split startup, submission and execution accounting

**Recommend:** count startup failures only for startup and record submission failures independently of accepted work. Use only the minimum state needed to distinguish those operations; do not precharge an execution attempt before `agent start` or before a prompt has a defined accepted outcome (`src/next.ts:387-388`). Make limits explicit per operation, and retain an overall terminal policy so repeatedly rejected startup cannot run forever.

**Alternative:** one shared counter with clearer labels. It is smaller but still lets failed process launch consume a seat's task budget and makes “three attempts” misleading. Adding two counters without defining acceptance does not solve timeout ambiguity.

The numeric limit of three is not validated by this incident. The decisive distinction is which operation was attempted and whether the recipient accepted it, not whether a larger number would have survived this run.

### K3 — Persist transport evidence before deciding recovery

**Recommend:** save a typed last delivery failure with operation (start/prompt), target pane and session, current phase/slot, exit code, Herdr error code/message, and enough sanitized response/request context to reproduce. Persist it before retry/return, and include its artifact/reference in the terminal failure reason. Preserve caller pane separately, as E3 demonstrates. Use an existing state/log boundary with an explicit schema owner, not an agent-written file under issues.

**Alternative:** persist only a generic “attempts exhausted” reason. That reports the consequence while losing the evidence needed to distinguish H1–H4. The current console warning (`src/next.ts:441-443`) and phase log (`src/log.ts:18-30`) do not preserve that transport response.

Redact credentials and private prompt material if a response can contain them. Bounded evidence retention is enough; do not turn this into an unbounded event recorder. A changed failure record must not invalidate historical states or confuse caller and target session identities.

### K4 — What one unreachable seat does to a two-seat phase

**Recommend:** never treat A's verdict as permission to skip required B. While delivery is unresolved, preserve A's completion and verdict and retry/reconcile only B. If the selected delivery budget is exhausted, use a visible leaf failure with a preserved phase checkpoint rather than silently discarding A's result. Reuse A's verdict on explicit recovery only if phase, reviewed head and relevant artifacts still match; otherwise rerun review. This makes stalled delivery distinct from unfinished review without inventing a successful outcome.

**Alternative:** fail and restart the whole phase, rerunning A. This is simpler and can be valid if deliberate, but sacrifices completed work and may reject A's in-flight verdict when B fails first. Current completion aggregation requires all required seats (`src/phase.ts:127-136`), while commitMove clears their current results (`:30-34`). Do not promise preservation without owning that change.

The phase transition and late peer completion must serialize safely. A running peer cannot complete an old phase into the recovered phase accidentally. If checkpoint recovery is judged too much machinery, choose whole-phase restart openly rather than treating it as an incidental effect of prompt retry handling.

## Practitioner questions for later charting, not asked here

- **Q1:** Which Herdr build/server handled the incident, and can its exact raw error or server trace still be recovered?
- **Q2:** Does Herdr expose a definitive pre-submission rejection/acceptance distinction, or is lifecycle observation its only acknowledgment? Which errors guarantee no bytes were written?
- **Q3:** Which Pi extension/input mode was active in B when review prompts were submitted, and did any input handler consume them?
- **Q4:** Is rerunning a completed blind review acceptable after a transport failure, or should a same-head completed verdict survive recovery?
- **Q5:** When no further readiness event occurs, should one unresolved submission immediately require explicit recovery, or is a small event-driven retry budget desired? Neither choice provides a timed retry guarantee under the no-clock lock.

## Ownership and split

- **D1 — New akrogon chart/leaf for delivery outcomes.** Own dispatchSlot retry flow, operation-specific accounting, persistent target-specific error evidence and tests. Include session identity and error-code diagnostics before claiming a transport root-cause fix. `src/next.ts:369-444` is the main surface; `src/state.ts`, `src/log.ts` and possibly status are supporting owners only where the selected contract needs them.
- **D2 — Reuse failed-with-cause and failure-attention, do not duplicate them.** `issues/open/noninteractive-leaf-execution/failed-with-cause/brief.md:4` already owns cause attempts, explicit failure/recovery and terminal-state visibility; its generic “attempts exhausted” text does not own detailed delivery accounting. `failure-attention/brief.md:4` owns post-transition Herdr notification/rename and persisted delivery result. The new work should consume those interfaces after they exist. Any changed typed failure/checkpoint contract needs an explicitly assigned owner; do not silently expand their emitted contracts.
- **D3 — Optional separate peer-progress recovery leaf.** K4 checkpoint preservation changes phase/recovery semantics independently of the transport loop. If selected, give it explicit ownership of done/verdict preservation and head validity. It is not automatically a prerequisite for storing errors or eliminating immediate ambiguous resends.
- **D4 — Herdr/Pi transport fix, only if measured.** A reproducible lost input, wrong occupant or extension consumption belongs to that component. Akrogon's retry policy must remain correct when delivery is ambiguous, even after a transport fix. Do not mask a upstream bug with alternate terminal-input commands.

## Acceptance evidence

- **A1:** Fake definite start rejection, definite prompt rejection and timeout after accepted submission. Verify no counter mixing, no immediate duplicate prompt on ambiguous timeout, correct target-specific persistent error, and bounded retry behavior without sleeps.
- **A2:** Replay duplicate and unrelated lifecycle events, idle/done/working/blocked/unknown states, and a replaced session. Verify that meaningful readiness governs any retry and that the two-minute success grace is not misrepresented as failed-delivery pacing. Keep the existing no-prompt behavior for busy states (`src/next.ts:169-173,375`).
- **A3:** Two-slot review where A records nits before B delivery fails, and where A completes after the failure decision. Prove the chosen checkpoint/restart policy, no premature merge, and no stale verdict accepted after the reviewed code changes.
- **A4:** One same-version scratch Herdr/Pi reproduction with a harmless unique prompt, target identity, raw response and session receipt. No production pane nudges, synthetic approvals, fallback input commands or secret-bearing transcript dumps.

The exact lost-input cause is still unknown. The confirmed fixable class is that missing transport acknowledgment consumes an execution budget in a tight loop and leaves insufficient evidence. Preserving the error and distinguishing delivery from accepted work are the smallest useful changes; making the timeout longer or adding a watchdog would not establish receipt.
