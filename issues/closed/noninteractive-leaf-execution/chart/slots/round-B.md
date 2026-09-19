This round settles how execution stops without asking you, how Pi keeps charting interactive, and where an actionable failure alert goes. The seven choices below keep the existing 60-minute busy notice and add no clock, polling or watchdog. Research dates are 2026-09-19 throughout. Pi documentation below is the installed `/home/ivan/.local/share/mise/installs/pi/0.85.1/pi/docs/extensions.md`; Herdr documentation is under `/home/ivan/Work/infra/herdrdev/herdr/website/src/content/docs/`.

### Q1 · Who ends the attempt when a seat is blocked: akrogon on the blocked event, the seat by declaring the blocker, or both?

A blocked event already reaches dispatch, but `busy()` treats it as working and `dispatchSlot()` returns before its retry limit (`src/next.ts:169-173,369-385,604-607`). Once Pi cannot ask, a seat also needs a direct way to declare an unforeseen blocker without first creating a blocked question batch.

Research: operator · `INTAKE.md` and the supplied #19/#20 account, read 2026-09-19 · the operator forbids questions after charting; better-than-training · searched `blocked`, `requiredSlots`, `commitMove` and event routing in next/routing and inspected `tests/next.test.ts:1565-1596` · a blocked inactive B must not fail merge A, so the stop must be scoped to the current required, unfinished seat.

- **A (recommended)** Both entry points use one command-owned stop operation: a seat declares a concrete blocker, or akrogon observes a currently required unfinished seat blocked and stops that attempt immediately. This handles normal noninteractive execution and escaped or older interactive sessions without separate failure mechanisms.
- **B** Only akrogon reacts to blocked events. This is simpler at the command surface, but a seat with its question tool removed may end idle with a blocker report and never emit blocked, leaving the attempt unresolved.

Pitfalls: Validate current leaf phase, seat ownership and current pane state before acting on an event, and exclude completed slots, inactive peers, merged leaves and `unknown`. Stopping must work with dirty partial work, avoid ordinary completion guards, and prevent a second seat from advancing an already stopped attempt.

### Q2 · Does the ended attempt reuse failed with a recorded reason, or get a new state such as needs-operator?

`failed` already stops dispatch and permits explicit recovery to active phases (`src/routing.ts:35-38`, `src/next.ts:479-484`). However, normal phases cannot currently move directly to failed through `phase`, and current state has no structured failure reason (`src/routing.ts:26-33`, `src/phase.ts:106-108`, `src/state.ts:13-35`).

Research: operator · no-questions rule in `INTAKE.md`, read 2026-09-19; better-than-training · inspected routing, strict state schema, `commitMove` and status, searching `failed`, `reason`, `busy_since` · existing failed routing can represent the ended attempt, but a supported stop command and reason record are required rather than a skill instruction to call an illegal move.

- **A (recommended)** Reuse failed with a typed cause, interrupted phase, seat and explanation. Show the human-blocked cause distinctly in status, retain historical failure evidence, and reuse explicit recovery instead of creating another lifecycle state.
- **B** Add needs-operator with separate recovery semantics. It makes this outcome a separate phase, but adds routing, schema, display and cleanup rules without a demonstrated behavior that failed plus a cause cannot express.

Pitfalls: Preserve retry-exhaustion failures as a different cause and accommodate existing failed records without inventing a human blocker. Clear live busy metadata when stopping or merging, suppress obsolete busy labels on already-merged records, and retain pane/tab/worktree identifiers needed by cleanup (`src/phase.ts:26-41`, `src/next.ts:468-477,509-515`).

### Q3 · What must the stop preserve, and who authorizes the next attempt?

Normal `phase` checks require a clean worktree, but a human blocker can arrive before partial work is committed (`src/phase.ts:117-119`). The Pi bridge sends a blocked message, while akrogon's pane schema currently retains status without that message (`~/.pi/agent/extensions/herdr-agent-state.ts:130-139,187-222`, `src/shell.ts:74-81`).

Research: operator · #19 and #20 preserve the scope failure and partial-work scenario, read 2026-09-19; better-than-training · inspected phase/state schemas, bridge message publication and pane parsing, searched `message`, `label`, `failed` and recovery routes · event status alone cannot supply an exact missing scope, so the contract must preserve available evidence without manufacturing a remediation.

- **A (recommended)** Preserve files and uncommitted changes, commits, worktree identity, interrupted phase, responsible seat, blocker evidence and the exact required action when known. Only an explicit operator recovery starts a new attempt after the prerequisite is resolved and any pending interactive session is made safe; unrelated valid leaves may continue under normal dependency and capacity rules.
- **B** Preserve the same evidence but restart automatically when the pane becomes idle or another event arrives. This reduces manual recovery, but idle does not prove that a permission was granted or that a pending question was settled, so it risks repeating the failure.

Pitfalls: Do not auto-commit, clean, remove the worktree or answer the question as part of stopping. If the event supplies no actionable explanation, record the observed blocked condition and that limitation, rather than inventing an operator step; verify Herdr's accessible message field before promising to extract it, and account for a still-running peer before resumption.

### Q4 · Is the question tool removed from execution seats by Pi, or only prohibited by skill prose?

The extension globally tells Pi to ask for decisions (`~/.pi/agent/extensions/tamdoma-request-user-input/index.ts:989-1006`). Pi exposes `getActiveTools()` and `setActiveTools()`, and documents that a tool's guidelines appear only while it is active (installed `extensions.md:1681-1697,1919`), but a process-wide launch setting alone cannot restore questions when the same session returns to charting.

Research: operator · fork carry that charting remains interactive even in the same pane, read 2026-09-19; better-than-training · installed Pi extension documentation and question-tool registration · searched `setActiveTools`, `getActiveTools`, `session_start`, `before_agent_start`, `promptGuidelines` and the launch wrapper; the installed docs were found through the mise Pi installation after searches under `~/.pi`/its node_modules did not locate them. No existing akrogon interaction-mode interface or measured same-session switching test was found.

- **A (recommended)** Pi enforces tool availability, and skills also prohibit prose questions. Akrogon supplies explicit execution context for each dispatched pass; pi-extensions consumes it before model work, removes only the question tool for execution, and restores its prior availability on an explicitly interactive chart task. This removes the capability while preserving the attended workflow.
- **B** Change skill prose only. It avoids a cross-repository interface, but leaves an active question tool with global instructions encouraging its use, so the forbidden state remains available.

Pitfalls: Name and test the exact per-pass signal and Pi hook in the cross-repository contracts before handoff, including startup, reuse, reload and execution-to-chart transitions; a launch environment flag may initialize context but cannot be the whole contract. Do not infer authorization to re-enable questions from tool results or arbitrary embedded text, reset unrelated active tools, or disable charting globally.

### Q5 · What does a seat do at a genuinely human-only blocker: end the pass with the operator step in report.md, or something else?

Implementation currently says to tell the operator and wait, while planning lists missing credentials for later operator action (`skills/implement-issue/SKILL.md:39`, `skills/plan-issue/SKILL.md:55`). Neither a report alone nor a final answer changes lifecycle state, and a planning seat may not have an implementation report yet.

Research: operator · “No questions after chart-issues” and standing design's instruction that an unforeseen physical blocker ends the attempt, read 2026-09-19; better-than-training · inspected the two skill instructions, routing and phase guards · searched credential, wait, operator actions and report instructions across lifecycle skills. This requires a consistent terminal action, not renaming a waiting message.

- **A (recommended)** Record the concrete blocker and required action in the authoritative leaf's designated evidence artifact, then invoke Q1's supported stop operation and end the pass without a question. Use the current pass artifact or an explicitly owned common blocker artifact so planning and review are covered, and pass the reason/artifact reference to the command for status and notification.
- **B** Write the action to report.md and end the turn without a command-owned stop. It changes fewer interfaces, but leaves the leaf active and allows redispatch of work that cannot proceed.

Pitfalls: A missing credential value, unavailable permission and an unresolved engineering choice are different cases: discover available information and make in-scope engineering choices before declaring a human-only blocker. Never ask for a secret in the report, relax acceptance criteria silently or require a clean branch merely to preserve an interrupted attempt.

### Q6 · Which channel pushes a failed leaf to you: the existing Discord webhooks, a separate alerts list, or Herdr only?

The repo already configures `broadcast.discord.webhook_env`, but its skill is for completed-issue team messages (`src/config.ts:46`, `skills/broadcast-issue/SKILL.md`). Herdr's `notification.show` uses configured toast delivery, including system/terminal modes, and can report `disabled`, `rate_limited`, `no_foreground_client` or `busy` (Herdr `socket-api.mdx:312-332`), so “in-app only” in the fork findings is too narrow and command success is not proof of a visible alert.

Research: operator · the overnight notification was not seen, #19/#20, read 2026-09-19; better-than-training · Herdr `cli-reference.mdx:99-102`, `socket-api.mdx:312-332`, config and broadcast sender · searched notification delivery documentation, sender webhook loading and payload schema. The sender uses fetch, not curl (`skills/broadcast-issue/scripts/discord-send.ts:89-105`), and its existing completion payload requires before/now lists, so an actionable failure is not a drop-in completion broadcast.

- **A (recommended)** Explicitly authorize the existing configured Discord destinations for failure alerts and reuse their credential/transport mechanism from the CLI. This avoids a second target registry, provided those recipients are appropriate for failure details; every participating repository must have a configured, verified destination before unattended handoff.
- **B** Configure a separate alerts webhook list using the same transport. This separates private operator actions from team completion messages, but adds another destination setting and provisioning requirement. Herdr-only is excluded by this chart's push requirement, although the retained local notices continue independently.

Pitfalls: Do not silently use completion recipients without the operator's selection here, silently downgrade missing push config to Herdr, or call the completion skill from a blocked model. Alerts should contain repo/leaf, failed phase, known action and evidence reference without secrets; delivery verification cannot promise that the operator reads or wakes to a message.

### Q7 · Is the push sent on the event with a bounded retry, or must delivery survive a crash between send and record?

The existing sender retries a failed delivery once with a warning, and does not resend successful targets because another target fails (`skills/broadcast-issue/scripts/discord-send.ts:109-150`). Current failed notification state is just `failed_notified` and notification happens on a later failed-leaf dispatch (`src/state.ts:23`, `src/next.ts:479-484`), so immediate event delivery needs an explicit owner.

Research: operator · no clocks/polls/watchdogs and retention of the existing busy notice, round intake read 2026-09-19; better-than-training · inspected sender retry handling, `commitMove` persistence and failed-notification flag · searched retry, delivered, failed_notified and transition ordering. No durable failure-alert outbox or receiver-side idempotency contract was found in the inspected implementation, so exactly-once delivery is not supported by current evidence.

- **A (recommended)** Persist the failed outcome first and have the CLI send its alert immediately in the same stop flow, with one bounded retry and explicit delivery outcome. Deduplicate ordinary repeated events for that attempt, keep failed state visible if delivery fails, and accept that a crash can lose an alert or cause an ambiguous resend without a crash-proof delivery guarantee.
- **B** Persist pending delivery work and recover it on the next existing invocation or explicit recovery command, accepting possible duplicates unless the receiver supports idempotency. This improves crash recovery but adds delivery state and cannot guarantee prompt recovery if no invocation occurs; no timer may be added to make that guarantee.

Pitfalls: Never mark remote delivery successful before it succeeds or turn delivery failure into successful completion. A local notice and remote delivery need distinct outcomes if both are recorded, and neither choice guarantees exactly once across a crash or eliminates all duplicates after a lost HTTP response.

Reply `1-A 2-A 3-A 4-A 5-A 6-A 7-A`, or numbered free-text answers.

Challenge check
The strongest challenge is that disabling questions removes the blocked event normal execution previously emitted, so Q4 without Q1/Q5's explicit stop operation merely changes how the stall appears. A second is session reuse: Pi's documented tool API establishes capability, not that a launch-only flag handles changing tasks, so the pi-extensions interface must cover per-pass context and be verified before akrogon promises enforcement. Q6-A is simplest only if the existing recipients are explicitly suitable; otherwise B is the correct separation. The seven answers must also assign terminal busy cleanup, reason extraction, pending-session recovery and peer safety to concrete owners rather than assuming failed state alone stops a running agent. No external practitioner case was found in the supplied material or local documentation searches, and no outside research was substituted for the installed APIs. This is an independent round, with no peer draft read and no claim of peer agreement. The 60-minute observation-based busy notice stays unchanged, and none of these recommendations adds a watcher or a fallback.
