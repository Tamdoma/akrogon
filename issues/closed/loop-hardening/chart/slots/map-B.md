# Independent territory map B

Read against live HEAD `13f92e0376d8b0a59ac7f9e61276e9667b0b2bf0` on 2026-09-11. Intake is exactly Tamdoma/akrogon#5 through #14. Seeds #1 and #2 are excluded. No A map was read. Recommendations below are not operator decisions.

This is a bounded peer map, not a chart handoff. No repository files were written, no pull was run because it rewrites the supplied seeds, and no external message, GitHub mutation, or real agent dispatch was performed. The supplied no-write instruction supersedes the skill's normal door refresh and chart writes. README, REFERENCE.md, configured grounding and LESSONS.md were read. Existing repository dirt was left alone. Only the requested map persists outside the repository.

## Evidence and reproduction

“Confirmed by inspection” means the code permits the reported behavior. It does not claim a live incident. Temporary probes used real Git repositories, local bare remotes, actual CLI invocations, and the existing fake Herdr process adapter where necessary. No authentication was mocked. The source-closure probe used an invalid source rejected locally before any GitHub request. No real Discord delivery was attempted.

### F5 · Source closure cannot recover after a successful folder move

**Confirmed, with a boundary correction.** `src/phase.ts:61-76` moves the completion owner before calling `closeSources`, and returns immediately for a closed leaf at line 65. `src/phase.ts:163-164` now attempts completion before the terminal transition check, so a failed *rename* can recover. It still cannot recover a failure after a successful rename. `src/phase.ts:87` then rejects a repeated merged transition. `src/next.ts:309-311` calls the same early-returning completion function.

The closure implementation is in `src/pull.ts:105-204`, not phase.ts as the old report implies. It retries command failures once, aggregates per-source failures, and continues later sources. Invalid source text fails at line 107. The retry mechanism handles an individual invocation, not later invocations.

**Reproduced:** a merge leaf with a real Git working directory and `sources: [malformed]` exited 1 and moved to closed. Repeating phase exited 1 with `Merged is terminal`. `next closure` exited 0 with no error. No network access occurred. Existing `tests/phase.test.ts:251-330` explicitly covers failed closure followed by a phase retry making no additional gh calls. `tests/next.test.ts:492-533` instead covers recovery after a failed rename, which must remain working.

Consequence: moving folders is not proof that external completion succeeded. Also, `next --all` removes merged worktrees before its completion sweep (`src/next.ts:368-372`), while source closure needs the triggering worktree HEAD (`src/pull.ts:185-189`). A recovery contract must survive cleanup and process restart, not just change the closed-folder early return.

### F6 · A bad record or operation aborts dispatch

**Core observation confirmed.** Eager repository reads in `src/next.ts:340,369,378`, recursive strict state reads in `src/state.ts:45-60`, dependency resolution at `src/state.ts:106-107`, and sequential uncaught dispatch at `src/next.ts:355-359` let one error stop the remaining work. Capacity also scans every registration (`src/next.ts:133-142`). Even explicit selection goes through `currentRepo`, which probes every registered root (`src/config.ts:92-101`). Isolation only inside `dispatchLeaf` would therefore be insufficient.

Cleanup closes the tab before attempting non-forced worktree removal (`src/next.ts:330-335`). A dirty worktree can abort startup before the sweep. Fetch failure propagates from `src/phase.ts:139`. Errors are printed by the failing process, so “nothing tells the operator” overstates the claim. There is no dedicated notification for these failures, unlike failed leaves at `src/next.ts:313-315`.

**Refuted at this HEAD:** malformed or working hook-event JSON does not suppress explicit `--all`. `src/next.ts:363` reads the environment event only when input is undefined, and `src/akrogon.ts:46` supplies `--all` explicitly. A temp invocation with malformed JSON and no leaves exited 0.

**Reproduced:** `next --all` with one missing dependency exited 1 and reported `Missing leaf: missing`. In this run the healthy leaf was dispatched first, with one prompt recorded. Thus “dispatches nothing” depends on traversal order. The reliable claim is that traversal stops at the error. Corrupt-state, deleted-registration and dirty-cleanup variants are inspection-confirmed, not separately executed in this pass.

### F7 · Sync can publish unrelated work and the wrong branch

**Confirmed.** `src/sync.ts:7-12` stages everything, commits the existing index, rebases the current branch and pushes its HEAD to the configured default branch. There is no branch check or lock. This includes pre-staged unrelated changes, so narrowing only `git add` would not fix the whole problem. `src/park.ts:47-64` takes the global lock for moves, whereas phase takes global then repository locks (`src/phase.ts:159-166`). Sync must serialize with both paths.

`src/init.ts:38` ignores only `issues/worktrees/`, while `src/config.ts:29` accepts another worktree root. The exposure is real for an unignored root inside the repository. Git can stage an embedded checkout as a gitlink rather than copying its whole contents. External roots are not staged by root-level add. Do not overstate this as always committing every checkout file.

**Reproduced:** from a side branch, create an unrelated `unrelated.txt`, run sync against a local bare remote. Exit 0, local branch still `side`, remote `main:unrelated.txt` contains `operator work`. `tests/sync.test.ts:7-32` exercises successful sync of records and remote integration, but supplies no unrelated dirty file, pre-staged file, or wrong-branch negative case.

### F8 · Renames break identity only under specific conditions

**Partly confirmed.** Leaf identity is compared to the registration key in `src/state.ts:58` and `src/status.ts:48`. Init derives a registration key from basename (`src/init.ts:28-45`). Changing that key without migrating existing states breaks reads. There is no rename command in `src/akrogon.ts:25-71`.

**Refuted as an unconditional directory-rename claim.** Runtime registration uses the configured key, not the current directory basename (`src/config.ts:69-74`). Moving the directory and updating its registered path while retaining its key leaves repo identity valid. Active leaves can still contain stale absolute worktree paths, a separate path-lifecycle problem (`src/next.ts:102-104`). Leaving the registration path unchanged produces a missing-path failure rather than an identity mismatch.

**Reproduced:** move a temp repo, retain key `repo`, update its path, then `status identity` exits 0. Change the key to `renamed` without editing leaf state and the command exits 1 with `Leaf repo mismatch`. This probe had no active worktree. Status overview reports the mismatch and exits nonzero rather than crashing indiscriminately (`src/status.ts:62-70,138-156`).

### F9 · Busy, blocked, session and allocation behavior

**Confirmed by inspection:** busy includes working and blocked (`src/next.ts:72-74`), and `dispatchSlot` returns without attempt consumption or notification at line 221. There is no timestamp or progress marker in `src/state.ts:10-31` and no timeout on that branch. A permanently busy seat can therefore persist indefinitely. The reported actual context-limit incident is not independently verified here. `tests/next.test.ts:94-114` deliberately expects blocked agents to wait without consuming attempts, so treating every blocked agent as failed changes policy.

**Confirmed:** merge recovery only suppresses recovery for `working`, unlike the dispatch busy predicate (`src/next.ts:299-307`). A blocked merge can reach fetch/clean checks and fail on its unfinished worktree (`src/phase.ts:139-140`). Both start and prompt wait use 5000 ms (`src/next.ts:249-250,275-276`), with attempts incremented beforehand at lines 235-236. They are readiness waits, not whole-pass execution deadlines. Slow readiness can consume attempts, but exact elapsed timing depends on returned statuses and retryable errors.

**Reproduced:** after allocating a leaf, clear its prompt markers, set the existing B agent to idle with null session, and dispatch again. Exit 0, zero new prompts, attempts remain A:0/B:0. The undefined-equals-undefined branch at `src/next.ts:230` is the cause.

**Confirmed with qualifications:** allocation rejects more than two panes (`src/next.ts:170-171`). Stale fields alone do not inflate capacity: a live pane must match the tab or worktree (`src/next.ts:138-140`). Startup cleanup acts on merged leaves, not all stale active state (`src/next.ts:368-371`). The alleged missing-seat parse is not a demonstrated reachable normal path: allocate writes both pane IDs (`src/next.ts:183-187`) before dispatch receives its state at lines 321-324, under the dispatch locks. External state mutation could violate that contract, but adding speculative null guards is unwarranted.

### F10 · Several small config/documentation claims have different verdicts

**Confirmed, intentional in tests:** pull uses origin (`src/pull.ts:44-51`). `tests/pull.test.ts:167-189` explicitly asserts origin intake despite configured `remote: upstream`. README does not explain this distinction (`README.md:14,27,33-41`). Calling remote “merge-only” would itself be inaccurate because sync uses it (`src/sync.ts:11-12`). Whether intake should change is an operator choice, not a self-evident bug.

**Refuted for this machine's installed Pi:** install only links `.claude/skills` and `.agents/skills` (`src/install.ts:16`), but installed Pi 0.85.1 explicitly supports `~/.agents/skills/` as well as `~/.pi/agent/skills/` (`/home/ivan/.local/share/mise/installs/pi/0.85.1/pi/README.md:354-368`). The shipped command in `config.yaml:14` adds no skill-directory restriction. Therefore a separate Pi skills link is not justified by this evidence. Older Pi compatibility is not established, and no interactive Pi session was started.

**Confirmed:** the README table omits sync, park and unpark (`README.md:33-41`, versus `src/akrogon.ts:52-60`). Parked folders are moved under issues and not ignored by init (`src/park.ts:63`, `src/init.ts:38`), so default sync stages them. Their committed status is absent from README.

**Refuted:** the state template is internally consistent. It pairs `phase: plan.synthesis` with `debate: 'no'` and directly explains the yes variant (`skills/chart-issues/assets/shapes.md:150-161`). There is no reason for a literal dual-template test.

**Confirmed:** changing worktree_root with an existing recorded worktree produces the mismatch error (`src/next.ts:101-104`). Whether to migrate or forbid such live changes remains unspecified. Apart from the directory-move probe in F8, this was inspected, not executed.

### F11 · Failed notifications repeat

**Confirmed and reproduced.** Every selected failed leaf calls notification show (`src/next.ts:313-315`), with no persisted or other dedup marker (`src/state.ts:10-31`). Three temp `next --all` invocations produced three notifications, all exit 0. `tests/next.test.ts:148-173` even expects repeated notification calls and unchanged state, including visible notification failure. The symptom repeats when a sweep selects the failed leaf. An unrelated hook that selects only its own leaf does not necessarily re-notify every failed leaf.

### F12 · Concurrent reviewers can mutually wait

**Confirmed as a reachable instruction-level cycle, not a live reproduced hang.** Both slots review initially (`skills/check-issue/SKILL.md:10`), and both receive the unrestricted wait-for-idle peer question flow (`:21`). If both enter that flow while active, neither can become idle. No phase boundary or role ordering breaks this cycle. The skill expects each to write its own verdict only later (`:31,43-45`). A generic agent timeout would mask rather than remove this protocol error. No word-matching test of skill prose should be added (`:35`).

### F13 · Completion granularity and Discord partial delivery

**Behavior confirmed, defect characterization partly rejected.** `src/phase.ts:63-68` reports a child issue complete before all sibling issues merge. `tests/phase.test.ts:124-143` intentionally asserts one completion signal per child issue. `skills/merge-issue/SKILL.md:43` and `skills/broadcast-issue/SKILL.md:10` explicitly broadcast that completed issue, not an unfinished epic. A truthful child-issue message is not inherently misleading. GitHub sources wait for enclosing-owner movement (`src/phase.ts:67-76`, `src/pull.ts:183`). Source ownership in `skills/chart-issues/assets/shapes.md:163` permits an issue or epic owner, so a child issue's GitHub source can also wait for its siblings under current completion code.

**Timing correction:** the completion line is printed before closeSources, but the merge skill runs the phase invocation and then invokes broadcast. On the final successful phase call, closure finishes before that invocation returns. “Every broadcast happens before closeSources” is false. Early child-issue broadcasts do precede later epic closure. A completion line followed by a closure failure leaves the skill's success condition ambiguous because it keys only on printed text (`skills/merge-issue/SKILL.md:43-45`).

**Confirmed:** a second delivery error leaves `sendWithRetry` immediately, skipping later chunks of that target (`skills/broadcast-issue/scripts/discord-send.ts:106-115`). Other targets continue and a final AggregateError is raised (`:130-139`). It is not silent success. A durable delivery record is explicitly excluded today (`skills/broadcast-issue/SKILL.md:31,43-45`). No real send was run. F13's proposed expectations require decisions about granularity and partial delivery, not an automatic “continue every chunk” patch.

### F14 · Split the hygiene bundle by actual consequence

- **F14a, confirmed with correction:** no scheduling reader of `state.slot` or priority was found in src. Slot is written at `src/next.ts:235`; priority is schema-required at `src/state.ts:15`; dispatch sorting only favors merged leaves (`src/next.ts:355-358`). Both remain observable through raw detail serialization (`src/status.ts:131`), so “never read” is too absolute. Removing schema fields can reject stored states under strictObject (`src/state.ts:11`), making this more than deletion cleanup.
- **F14b, reproduced:** an unowned Herdr hook exits 0 with empty output (`src/next.ts:375-385`), and a file target produces raw ENOTDIR from spawning Git with a file cwd (`src/next.ts:392-393`, `src/config.ts:83-89`, `src/shell.ts:18`). Quiet unowned hooks may be appropriate for machine-wide event routing. File-target failure merits a useful argument error.
- **F14c, confirmed and covered by a passing test:** phase saves state and prints movement before diagnostic logging (`src/phase.ts:50-56`). Git or Herdr diagnostics can fail in `src/log.ts:9-15`. `tests/phase.test.ts:150-168` verifies state remains committed after a failed log and is not replayed. Diagnostic failure must remain visible, but committed movement must be distinguishable from an uncommitted transition.
- **F14d, confirmed:** lookup scans only open and closed (`src/state.ts:54,64-67`). Status detail calls it directly (`src/status.ts:127`), as do phase/next. Parked names are shown on the overview (`src/status.ts:154`), but explicit leaf lookup reports only Missing leaf.
- **F14e, confirmed by path analysis:** discovery allows arbitrary recursive depth (`src/state.ts:45-50`), whereas leaf locks infer exactly issue plus optional epic (`:96-103`) and completion infers owner from two parents (`src/phase.ts:62-67`). At issues/open/state.yaml, withRepoLock already holds issues/.lock and withLeafLocks tries the same issues/.lock again. At excessive depth, it locks and completes a middle container instead of the intended outer owner. No destructive/deadlocking probe was run. Shapes describes supported depths (`skills/chart-issues/assets/shapes.md:83-116`) but runtime validation does not enforce them.
- **F14f, confirmed and more severe than “low hygiene”:** fetch has no subprocess deadline (`src/phase.ts:139`, `src/shell.ts:17-28`). Dispatch holds repository and global locks (`src/next.ts:292,367`), so a hung fetch can stop the entire machine's dispatcher, not only its repository. One retry cannot help an invocation that never returns.
- **F14g, confirmed by inspection:** Herdr stdout is parsed without contextual handling (`src/shell.ts:71-74`), unlike the contextual GitHub listing parse (`src/pull.ts:17-26`). A successful command with non-JSON stdout throws SyntaxError without deliberately preserving the response. Do not conflate this with stderr parsing: next's retryable function already handles invalid stderr (`src/next.ts:202-211`).
- **F14h, confirmed:** a closed owner basename collision blocks completion (`src/phase.ts:71-72`). Shapes checks proposed paths and globally unique leaf slugs, but does not explicitly reserve the eventual closed owner path (`skills/chart-issues/assets/shapes.md:167`). Rejecting that collision before handoff is smaller and safer than inventing automatic renames. The passing rename-failure test at `tests/phase.test.ts:161-168` exercises the collision.

## Consolidation by destination and speed

The seed titles are not a useful issue split. They mix policy, defects and documentation, and several claims are false. Proposed destination charts and issues follow. “Small” means a bounded contract with local negative tests. “Medium” needs several state/process scenarios. “Policy first” needs operator answers or additional evidence before a leaf is specifiable. These are relative sizes, not elapsed-time promises.

| Issue | Observable destination | Parallel leaves, scope and speed | Intake |
| --- | --- | --- | --- |
| I1 safe-record-sync | Sync publishes only owned records from an authorized branch, without swallowing operator work or racing lifecycle moves. | L1 scoped-index-and-branch-sync, medium, owns index isolation, branch refusal and shared locking. L2 configured-worktree-exclusion, small, owns exclusion of in-repo configured worktree roots and init ignore behavior. | #7, relevant #10 |
| I2 dispatch-progress | Healthy eligible work continues despite local failures, and stalled/failed work has useful bounded signals. | L3 isolated-dispatch-errors, medium, owns discovery, selection, capacity and cleanup error boundaries. L4 bounded-recovery-processes, medium, owns fetch deadlines/lock implications. L5 session-and-merge-busy-correctness, small, owns null-session prompt and blocked-merge guard. L17 owned-agent-seats, small after Q13, owns extra-pane and replacement-seat behavior. L6 stall-and-failure-signals, policy first, owns stalled-agent policy and per-failure notification lifecycle. L7 nonblocking-review-questions, small, owns the two-reviewer protocol. | #6, #9, #11, #12, #14f |
| I3 recoverable-completion | Completed code, source closure and broadcasts have explicit outcomes and recoverable failures. | L8 resumable-source-closure, medium, owns post-move retry, triggering commit durability, cleanup ordering and partial source progress. L9 completion-broadcast-contract, policy first, owns issue/epic signaling and its merge-skill consumer. L10 partial-discord-outcomes, policy first, owns chunk failure policy and useful partial-delivery diagnostics. | #5, #13 |
| I4 valid-lifecycle-records | Supported identity, path and hierarchy changes remain readable or fail before corrupting lifecycle operations. | L11 hierarchy-and-owner-preflight, medium, owns supported depth validation, closed owner reservation and contextual parked lookup. L12 registration-and-worktree-moves, policy first, owns stable registration identity and live worktree path policy. L13 state-field-contract, policy first, owns any elected priority/slot changes, otherwise omitted. | #8, #10 worktree-root, #14a/d/e/h |
| I5 understandable-command-outcomes | Operators can tell what a command supports and whether state changed when an error occurs. | L14 invocation-and-response-errors, small, owns file-target argument errors and contextual Herdr response parsing. L15 committed-transition-errors, small/medium, owns explicit committed-state diagnostics without replay. L16 command-config-reference, small after decisions, owns missing verbs, parked tracking and intake-remote explanation. | #10 docs/remote, #14b/c/g |

No dedicated Pi-install leaf or phase-template leaf is justified. No arbitrary-tree support, watchdog daemon, new secret mechanism, automatic force-removal, or broad cleanup is implied.

**Actual dependencies only:** L16's remote paragraph requires the remote-policy decision, and its sync behavior paragraph requires L1's settled contract. L9 requires the completion event/closure ordering contract from L8 only if the selected broadcast gate depends on external closure. L8 owns its own cleanup integration, so it does not have to wait for generic dispatch isolation. L3 and L4 can implement independently under a shared error/deadline contract. L7 is independent of generic stall detection. All other leaves can proceed in parallel once their own decisions are settled. Shared files and an epic container are not blocked-by edges.

**Source completion ownership:** #10 and #14 span multiple destinations. Shapes line 163 forbids copying one GitHub source into unrelated completion owners. Recommend one administrative epic containing I1-I5, with #10 and #14 owned by that epic and copied into every descendant leaf. Narrow sources can have their listed issue as owner and appear in every leaf beneath that issue. Record all imported text verbatim once per relevant intake with provenance, separate from this map's findings. Do not silently drop confirmed subclaims to close a mixed report early. Under current completeOwner, even issue-owned sources inside this epic wait for the epic move. Q6 below settles whether to retain that delay. There is no implementation dependency between the issues merely because closure ownership groups them.

## Material operator forks

This batch settles choices that change acceptance criteria or compatibility. Findings above provide the evidence. None is assumed answered.

### Q1 · Should sync refuse a non-default branch and preserve unrelated staged and unstaged work?

F7 demonstrates that a side branch and unrelated file reach main today. Choosing a branch/index contract is necessary before narrowing Git paths.

- **A (recommended)** Refuse non-default or detached HEAD before mutation, commit only owned issue records, and preserve unrelated index/worktree contents. It prevents accidental publication without creating another managed checkout.
- **B** Sync through a dedicated checkout or independent index/commit flow that works from any branch. It needs additional integration and recovery behavior.

Pitfalls: `git add issues` alone still commits pre-staged unrelated changes. Decide owned paths to exclude seeds, locks and configured worktrees, including roots outside issues.

### Q2 · How should dispatch continue when an unreadable record makes ownership or capacity uncertain?

F6 affects repository discovery and capacity, not only one leaf's execution. A duplicate slug can make both records unsafe to address.

- **A (recommended)** Continue independently verifiable work, report every skipped scope, and return an aggregate nonzero result. Treat ambiguous identities together and do not assume unknown active occupancy is zero when admitting new work.
- **B** Skip an entire faulty repository and continue healthy repositories, accepting less progress within a repo for a simpler first boundary.

Pitfalls: even B requires fixing cross-repo capacity and currentRepo lookup. The exact admission rule for unreadable occupancy remains U1 below, and must be settled before handoff.

### Q3 · Should an apparently stalled agent be reported for intervention or automatically interrupted?

F9 shows busy is not evidence of progress, but current tests deliberately wait on blocked agents. There is no measured safe inactivity threshold yet.

- **A (recommended)** Preserve busy ownership, surface a bounded stale-progress signal, and require explicit recovery until a trustworthy progress measure exists. This avoids interrupting a legitimate long-running operation or rebase.
- **B** Automatically interrupt and consume a retry after a defined progress deadline. This can recover unattended but requires a reliable signal and interruption contract.

Pitfalls: elapsed time since prompt is not elapsed time without progress. A dead session can report working. Q3 chooses behavior, not an invented threshold.

### Q4 · Should failed-leaf notifications be once per failure episode across process restarts?

F11 reproduces three notices in three sweeps. The current state has no failure-delivery marker.

- **A (recommended)** Notify once for each entry into failed, persist successful delivery, and reset on an explicit restart/new failure. This stops sweep spam while allowing a later failure to notify.
- **B** Notify only when transitioning into failed, accepting that a crash or failed notification can lose the notice while status still exposes failure.

Pitfalls: mark delivery only after success. A crash after send and before recording can still duplicate a notice without transport idempotency. Promise recoverable deduplication, not impossible exactly-once delivery.

### Q5 · Should initial reviewers finish independently before asking each other questions?

F12's mutual idle wait is a protocol cycle.

- **A (recommended)** Forbid synchronous peer questions during concurrent initial review. Each reviewer records its unresolved issue and verdict, using the existing aggregation/repair path. This removes the cycle.
- **B** Introduce an explicitly ordered peer-question turn after both initial reviews. This permits discussion but adds an orchestration contract.

Pitfalls: merely shortening agent waits leaves mutual waiting possible. Preserve A-only repair review and do not enforce prose with exact-word tests.

### Q6 · Should source closure and completion broadcasts follow the source's completion owner?

F13 shows a completed child issue can be broadcast while epic sources remain open. Shapes permits both issue and epic source owners, but runtime movement gates all closures on the outer container.

- **A (recommended)** Preserve factual per-issue shipped-work broadcasts, and close sources when their declared issue/epic owner completes. Make external-closure failure a separate visible, retryable outcome. This keeps the user-facing message about shipped work and respects source ownership.
- **B** Use one outer-owner completion signal and broadcast only after every source closes. This aligns one message with GitHub closure but delays all child updates during sibling work or GitHub outages.

Pitfalls: owner identity is not explicitly stored as source metadata today. F5 recovery must retain the triggering commit after cleanup. Do not gate broadcast only on text printed before a failing phase invocation.

### Q7 · After one Discord chunk exhausts its retry, should later chunks for that target still be attempted?

F13 confirms target-local truncation and continued delivery to other targets, with a final error.

- **A (recommended)** Stop that target, continue other targets, and report delivered/failed/unattempted chunk counts without a durable delivery ledger. It avoids sending an unexplained tail after a missing middle and improves the existing failure result.
- **B** Attempt all remaining chunks and aggregate their failures. This maximizes delivered content but can leave discontinuous messages.

Pitfalls: resending the whole payload duplicates earlier successful chunks. Durable resumable delivery is a separate scope choice and conflicts with the current skill's explicit no-record policy.

### Q8 · Should the registration key remain stable when the directory moves?

F8 reproduces success with a stable key and failure when changing the key. Active absolute worktree paths are a separate complication.

- **A (recommended)** Treat the registration key as persistent identity, document/update the path separately, and reject live worktree-root changes until a defined idle relocation step. Avoid rewriting every leaf for an ordinary directory rename.
- **B** Add an explicit transactional rename/move operation covering registration, open/closed/parked states and Git worktree metadata. This provides flexibility but is a larger compatibility contract.

Pitfalls: rerunning init under a new basename can add a second registration for the same Git common directory (`src/init.ts:28-45`, `src/config.ts:101`). A naive string replacement cannot repair Git worktree metadata.

### Q9 · Should pull continue using origin independently of the configured code remote?

F10 establishes intentional origin-only behavior in the tests. Changing it can import another repository's reports when origin and upstream differ.

- **A (recommended)** Keep origin as the intake identity and document the code-remote distinction. No reported consumer requirement establishes another intake mapping.
- **B** Use the configured remote for both intake and code integration, updating tests and explaining the migration for repos with different origin/upstream identities.

Pitfalls: this changes GitHub provenance and mirror replacement, not just a Git flag. A separately configurable intake source is additional scope unless a concrete requirement establishes it.

### Q10 · Should priority affect dispatch?

F14a establishes that priority exists without influencing scheduling. This is a scheduling contract, not cosmetic cleanup.

- **A (recommended)** Retain priority as operator metadata and keep scheduling unchanged. No ordering or starvation policy was supplied.
- **B** Give priority h/n/l scheduling meaning, with explicit tie behavior and capacity interaction.

Pitfalls: priority's presence does not specify preemption or starvation behavior. The operator can rule scheduling changes out of scope.

### Q11 · Should supported tree depth and closed owner names be enforced before dispatch and handoff?

F14e/h shows invalid structure can deadlock or fail only at completion.

- **A (recommended)** Validate the existing two supported shapes at the input boundary and reserve the eventual closed owner basename at handoff. This removes invalid ancestor inference without adding hierarchy machinery.
- **B** Support arbitrary nesting and repeated owner names with explicit identity and ancestor metadata. This is substantially larger and lacks a supplied use case.

Pitfalls: validation must cover existing imported states as well as newly authored contracts. Never force overwrite an occupied closed owner.

### Q12 · Should the unused persisted slot field be removed?

F14a shows no scheduling reader, but stored states accept this field under a strict schema.

- **A (recommended)** Leave it in place and rule deletion out of this drain. It has no demonstrated user-facing failure, and removal requires compatibility work.
- **B** Remove it with an explicit migration for existing states, including parked and closed records.

Pitfalls: simply deleting the schema field makes old records invalid. This does not concern slot configuration or the slot recorded in lifecycle history.

### Q13 · Should a leaf tab allow extra operator panes?

F9 confirms that allocation rejects a third pane even if the two agent seats are still present.

- **A (recommended)** Permit extra panes while preserving explicitly owned A/B seats. An operator's extra shell should not prevent existing agents from progressing.
- **B** Reserve leaf tabs for exactly two panes and report that restriction clearly, relying on dispatch isolation to keep other leaves progressing.

Pitfalls: do not adopt an arbitrary extra pane as an agent seat when one owned pane disappears. Replacement-seat ownership must be specified if A is selected.

Reply by Q code and option, or provide a short free-text answer.

**Challenge check:** The strongest challenge to Q2 is machine-wide capacity: continuing healthy work cannot justify silently undercounting unreadable active leaves. The strongest challenge to Q6 is that owner semantics are only implicit in leaf source sets, so exact closure timing needs a representable identity contract. Q3's recommendation provides visibility but does not yet promise automatic unattended recovery. Those are real scope constraints, not solved by longer retry loops. No A/B disagreement is claimed because this map is independent.

## Practitioner pitfalls and material work not yet specifiable

- **R1 · Retry after mutation.** F5 and F14c commit state before later effects. A nonzero command is not permission to replay the lifecycle transition. Recovery must inspect committed state and pending effects.
- **R2 · Locks and slow dependencies.** F14f holds the global lock during fetch. A timeout contract must terminate the subprocess and release locks, not merely abandon a Promise while Git continues.
- **R3 · Errors remain errors.** Isolation should continue unrelated work and aggregate failures, not convert malformed state, auth failure or cleanup refusal into successful empty results. Never force-remove dirty worktrees to make dispatch pass.
- **R4 · Verification must exercise behavior.** Add negative/edge cases for pre-staged files, detached HEAD, failed/mixed repos, duplicate identities, null sessions, blocked merge, notification failures, interrupted closure and invalid depth. Use real local Git and command invocations. Do not mock auth or inspect a skill for literal wording as a substitute for review of the protocol.
- **R5 · Source ownership and speed differ.** A broad report spanning multiple issues can wait for a whole epic to close even when its small fixes finish early. Keep implementation parallelism and closure ownership separate.
- **R6 · Avoid work based on disproved premises.** No Pi-specific link, duplicate phase example, missing-seat guard, or stale-field cleanup should be created without new evidence. Unowned machine hooks being quiet is not automatically a CLI usability defect.

- **U1 · Unknown active capacity.** Need a precise definition of which live panes count when their record or registration cannot be read. Repository ownership, capacity accounting and whether new allocations are safe must be decided together after Q2.
- **U2 · Stall measurement and cold-start budget.** Need supported Herdr progress/session signals, representative healthy start/long-pass evidence, and an explicit recovery deadline policy. The seed's reported context-limit incident supplies no safe threshold. No automatic watchdog acceptance criterion is ready.
- **U3 · Source-owner representation and interrupted completion.** If Q6 chooses per-source owners, define how runtime derives or stores owner identity, what commit each source cites, how already-closed partial completions migrate, and where recoverable closure status remains after worktree cleanup. The current sources array alone does not explicitly name its owner.
- **U4 · Existing configuration move policy.** If automatic relocation is elected, enumerate active/parked/closed worktrees and how interrupted moves resume. The simple stable-key probe does not establish safe active-worktree migration.
- **U6 · Replacement-seat identity.** If extra panes are permitted under Q13, specify whether replacement creates a new pane or reuses an explicitly designated free pane. Never infer permission to prompt an unrelated operator pane.
- **U5 · Priority scheduling.** If elected, define ordering, tie behavior and interaction with max_active before authoring criteria. Metadata presence alone does not imply priority scheduling was promised.

No human-only prerequisite was discovered for the local work. Future authenticated GitHub/Discord end-to-end validation requires an agreed real test destination and authorization for its external mutations, not mocked auth. This map neither sends messages nor claims delivery verification.

## Verification record

Temp probes completed for F5, F6, F7, F8, F9's null-session case, F11 and F14b. Each temporary repository was removed in a finally block. The temporary probe script was removed after results were recorded. No artificial auth endpoint or secret was introduced.

Ran `bun test tests/next.test.ts tests/sync.test.ts tests/phase.test.ts --test-name-pattern 'blocked agent|notifies failed|sync commits|completion reports each|failed log preserves'`: **5 passed, 0 failed, 52 assertions**, 23 filtered out. These existing tests verify current behavior, including several behaviors the intake proposes changing. They do not establish that every seed was dynamically reproduced. The specifically claimed origin-vs-remote test and source retry tests were inspected, not executed with their fake GitHub adapter.

This map supplies evidence and a proposed split. It does not authorize handoff or settle the questions above.
