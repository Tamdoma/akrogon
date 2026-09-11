# Factory reliability: overnight and morning review

Recorded 2026-09-06 by helper-codex, with helper-claude cross-review. This is a cross-class
index of the overnight work and morning decisions, not a second copy of each incident report.
Commit references identify implementation evidence, not proof that every live lane recovered.
The existing [evidence-contract lesson](2026-09-05-producer-consumer-evidence-contract.md),
[ownership lesson](2026-09-05-queue-order-preempted-active-work.md),
[watchdog lesson](2026-09-05-watchdog-cleanup-evidence.md), and
[verification lesson](2026-09-05-verification-scope.md) retain the earlier evidence.

## Implemented changes and transferable lessons

| Ref | Failure or unnecessary cost                                                                                                                                                                                         | Prevention and evidence                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Valid reports were rejected for qualified Evidence labels, a refreshed finding count, backticked commit IDs, padded tables, or narrative following a table. Retrying the author could reproduce the same rejection. | Accept equivalent formatting while preserving meaning. `8bc2eb0a`, `1ffeeaa3`, `1c55deab`, `67aa333b`, and the reader portion of `b9e5b006` cover these cases. Share parsing helpers only where the field grammars intentionally agree. Test captured worker output, including empty fields and malformed near-matches.                                                                                                                         |
| F2  | A finished but rejected proof waited until expiry and was charged as worker silence. A board diagnosis alone did not leave durable evidence.                                                                        | `dcf46df3` journals rejection by seat, artifact path, and the blob actually evaluated, with commit identity/time. A changed blob cannot inherit an old diagnosis. At expiry the matching seat records rejection rather than silence, with the existing attempt charge. Missing files and placeholders remain pending. Acceptable proof wins before expiry handling. Earlier diagnostic work: `15fba67e`, `4a6eba85`, `27f0ddd9`, `e690ab12`.    |
| F3  | Accepting a CHECKED finding was interpreted as requiring a repair, even when no code change was needed.                                                                                                             | `30121318` clarifies truthful evidence-only rows for legacy accepted findings. `1c55deab` adds structured `confirmed`, which never routes to repair. Legacy `accept` still requires its row. Never infer authority from Reason prose or rewrite a disposition merely to pass a reader.                                                                                                                                                          |
| F4  | Editing an old verdict changed the apparent start of its repair window. Separately, judge exit and merge selected different verdict rounds, causing phase oscillation.                                              | `4d0aad81` anchors repair eligibility to verdict creation, while freshness keeps its own latest-commit meaning. `08ced5fe` shares latest-verdict selection by contiguous round ordinal. One definition must govern all consumers of a lifecycle decision. An artifact's creation, revision, and review round are different facts.                                                                                                               |
| F5  | A report commit touching another file was rejected even though prior report content remained protected.                                                                                                             | `67aa333b` makes co-touched paths a durable warning. Prior finding text remains protected. Remove redundant ceremony without removing the invariant it was meant to protect.                                                                                                                                                                                                                                                                    |
| F6  | Completed repairs stopped at a numerical review cap and required an operator to permit the confirming review.                                                                                                       | Under explicit operator authorization, `d08e9272` removes the round cap. Accepted repairs must still be checked before confirming review, and merge requires a current clean verdict. Existing cap-only parks resolve through machinery-written resume records. Mixed or malformed parks are not silently cleared. Per-step attempt caps remain.                                                                                                |
| F7  | Live model checks ran inside chunk verification, blocking the synchronous tick and paying again on cold execution or rebase. The chunk packet also lost the leaf-only marker while extracting bullets.              | `3dc3983f`, `7e0c1e83`, and `8d1b5e3f` keep cheap dependency checks per chunk and exact mandatory live commands at the existing leaf verifier. Carry the full Acceptance criteria body and retain coverage when moving checks. Chart repair `a575ff8f` provides contract-only script modes. Exact command/cwd deduplication is prompt-instructed, not engine-enforced. No new stage, guessed timeout, wrapper, or sidecar cache was added.      |
| F8  | Script output was overwritten, making historical paid checks impossible to reconstruct. Harness fallback could purchase another call after a paid invocation failed.                                                | `2f34b72b` retains unique runner-owned check journals/output outside worker worktrees. Chart script records `4bdace6e` preserve started/finished events, duration, exit status, and unreported cost. Chart change `1b170b13` selects an installed harness before invocation and combines readonly scenarios without dropping refusal assertions. Failure does not silently buy another harness. Interrupted started-only records remain honest. |
| F9  | A filled chunk without its QA certificate advanced the packet cursor, so retries received no actionable chunk. A consultant had also forbidden the required machinery path.                                         | `99ac1d35` keeps the chunk selected until committed QA exists, using the same path definition as the gate. `a8e3b7b3` reserves engine-required carriers in planning and advice. Version's actual recovery came from the worker committing the certificate (`563a9bcf`), following ruling addendum `83908893`; do not attribute that recovery to a cursor fix that had not caused it.                                                            |
| F10 | Stale seats survived completion, while a watchdog could race an active launch. A submitted restart was mistaken for a running reconciler.                                                                           | `65a7b736` retires seats from recorded terminal outcomes and consumed advice. `da4f9d0f` restricts watchdog cleanup to proven stopped lanes and rechecks candidates. Cleanup has one owner. Recovery requires a fresh heartbeat after startup, not command submission. A stale heartbeat during a synchronous gate is ambiguous, not proof of a dead lane.                                                                                      |
| F11 | Status output accumulated, arrow-key echo corrupted the screen, and titles showed only harness names.                                                                                                               | `a1ac6539` bounds the live frame; `b9e5b006` manages TTY echo and restores prior state. `74246777` sets role, slot, exact launch model, harness, and item as display-only pane metadata. It does not rename ownership labels or influence scheduling. Metadata is set before paid startup so its failure cannot kill a started worker.                                                                                                          |
| F12 | Generic messages hid practical value, while adding new instruction layers risked increasing cost and mental overhead.                                                                                               | `3031009c` makes broadcasts explain the problem, change, and practical benefit for busy nontechnical readers. `379993ed` strengthens existing read/planning instructions with caller tracing and an existing/native-solution search. The Ponytail review justified this bounded instruction, not wholesale skill import or claims of measured savings.                                                                                          |
| F13 | A resume with no plan repeatedly rebased and asked another operator question instead of scheduling planning.                                                                                                        | `edb5894d` returns an explicit unplanned outcome and normalizes later phases before writing the resume record. A crash must leave the original park held, with the answer preserved, rather than exposing released but stale state.                                                                                                                                                                                                             |

## Rules for the next factory

1. **D1 — Deterministic control, agent judgment.** Code owns dispatch, committed state, proof evaluation,
   attempt accounting, recovery, and resource retirement. Agents produce work and explicit decisions.
   Panes are a view, never the source of lifecycle truth. Lessons are read by maintainers and designers,
   not dynamically interpreted by the reconciler as scheduling instructions.
2. **D2 — Tolerant presentation, explicit authority.** The proof-reader keep-list is in-window commit
   ancestry, preserved prior findings, authoritative verdict dispositions, nonempty evidence, and
   placeholder detection. Other formatting checks should tolerate equivalent meaning or warn.
   This does not waive execution permissions, isolation, or safe resource ownership. A new blocking
   proof check needs a concrete invariant and a recovery path, not merely a preferred layout.
3. **D3 — Every rejection needs a next owner.** A durable diagnosis is necessary but not sufficient.
   Tell the retry what was rejected. Procedural failures should be resolved by machinery or a
   consultant. Keep design/architecture judgment with the operator and never fabricate physical
   actions. Do not claim autonomous recovery until the relevant path has run successfully.
4. **D4 — Pay for new evidence.** Keep fast local checks at dependency boundaries and expensive
   evaluation at the completed leaf. Production-tree fingerprints already preserve verification
   across proof-only commits; they do not provide general relevant-input caching. Do not add a new
   cache without demonstrating a remaining duplicate-run problem and defining trustworthy inputs.
5. **D5 — Preserve the evidence needed to improve.** Record each run once with start, finish, outcome,
   and links to retained output. Separate wall-clock, turn-active time, idle/blocked time, and
   concurrent agent-minutes. Report missing usage as unknown. Never derive dollars from unverified
   printed token lines or attribute an entire item's history to its final model.
6. **D6 — Deploy reviewed code.** A source-running reconciler can execute dirty checkout files.
   Isolate unfinished work before activation. Check both claim records and advancing heartbeats.
   Preserve workers during status-lane restarts and do not interrupt a gate without accounting for
   its children and resulting failure. Peer review must include the combined tree and actual exit codes.

## Accounting corrections and limits

Surviving chart observations bounded two interrupted gate runs at roughly 17 and 4 minutes, with
39,253 shown tokens across the observed writable calls. This is a floor from surviving output,
not all checks, verified billable usage, or an exact daily cost. Earlier output was overwritten.
A clean chart leaf invocation set contains **five** paid calls: workflow one, installer one,
interview three. The earlier claim of three total counted only the interview script.
Three one-hour silence windows are not three hours of proven wasted compute: they may overlap,
and activity versus waiting is unknown. The shared timestamped progress log is the heartbeat;
absence of separate heartbeat files does not establish worker silence.

The synchronous gate can still delay the lane heartbeat. Removing paid calls from chunk gates
reduces the observed multiplier but does not make the executor asynchronous. Log retention and
complete per-model cost collection still need their own implemented and verified policies.

## In progress, not implemented guarantees

T1–T4 procedural routing is unfinished work at this entry's writing. The agreed design reuses
existing advice dispatch, ruling, resume, and cleanup mechanisms: free proof-first reevaluation,
one bounded consultation cycle per unchanged evidence snapshot, and explicit answered/resume/hold/
operator-design rulings. Consumed snapshots prevent repeated paid cycles without changed inputs.
A ruling must be scoped to the resumed step, not injected into unrelated later tasks. Legacy
untyped operator questions need consultant-first migration. Version's attempts-exhausted park
`bde02681` / question `351fa3db` is the live proving case, not yet a success claim.

Automatic filing and execution of a machinery-repair issue after a consultant diagnoses a reader
fault is **design discussion only**. It is not in this batch. The factory is not yet demonstrated
to repair all its own defects. A wrong reader-fault decision must not weaken the keep-list.

## Application to the marketing and web factory

Inspected `/home/ivan/Work/infra/tamdoma/framework` at
`587b98de829152fa9d83c3fe458f8f9bc3c57859`. This is the requested framework checkout, not the
separate framework consumer lane under `akrogon-repos/`.

Its `.claude/workflow/orchestrator.md` assigns coordination to the default Claude instance,
which writes JSON handoffs, invokes the native Agent lane, reads execution logs, and updates state.
It already has `.claude/workflow/state-machine.json`, transition validation, handoff resolution,
library injection, and specialist skills for architecture, design, development, writing, testing,
and administration. No Herdr reference was found in the inspected workflow/hooks/integrations
search. This is a bounded source inspection, not a completed migration audit or design.

Reuse those domain assets and identify one authoritative owner for each state transition before
replacing the native spawn boundary with Herdr. Preserve the existing handoff and injected-library
contract deliberately; changing the transport alone does not reproduce it. Avoid running an
agent-owned coordinator and a deterministic coordinator as competing state writers. Domain
acceptance needs real deliverable evidence, including visual/content review where applicable,
without making every intermediate task rerun paid end-to-end evaluation. These are design inputs
for the requested future restructuring; no framework source was changed in this documentation pass.

## Remaining operational design candidates

Shared-source activation currently requires isolating unfinished edits. Running each lane from a
checkout pinned to its claimed deployment revision is under implementation to remove that coordination
hazard, not yet deployed. Likewise, a held flight slot and reused verifier role can keep
unrelated ready work queued behind a stalled item. Inspect the recorded queue after the rejection
fixes activate before increasing concurrency; another seat alone does not establish safe parallel
ownership or remove the lane's flight limit. Report queue delay separately from paid agent time.

The next efficiency review remains a consultation, not an implementation commitment:

| Ref | Candidate                                                                | Review boundary                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1  | Optimize implementer cost while keeping consultants and verifiers strong | Operator correction: the implementer is the cheaper-seat target of the running A/B comparison; this is not a proposal to downgrade consultants or verifiers. Compare verified cost per accepted output, retries, and quality. Downstream review is a safeguard, not a guarantee that every mistake is caught. Printed cumulative tokens and one sample do not establish savings. |
| O2  | Repair-focused confirming review                                         | Focus on repairs and original findings while retaining current-tree access and dependency/regression review. A changed-lines-only restriction can hide collateral defects.                                                                                                                                                                                                       |
| O3  | Another verifier                                                         | First establish queue delay and dispatch semantics. An additional configured seat can mean two agents on one step, not an additional independent flight slot.                                                                                                                                                                                                                    |
| O4  | Ruling reuse                                                             | Existing exact-step rulings already ride retries. Scope procedural rulings to the resumed step and do not carry old authority across unrelated chunks or review rounds.                                                                                                                                                                                                          |
| O5  | Shorter heartbeat threshold                                              | Existing liveness already uses timestamped progress. An unmeasured 15-minute threshold repeats the arbitrary-limit problem; establish the failure cause before changing it.                                                                                                                                                                                                      |
| O6  | Revision-pinned lane checkout                                            | Prioritize deployment isolation after current recovery work. It prevents development edits entering live execution, but does not eliminate activation and heartbeat verification.                                                                                                                                                                                                |

## Activation evidence

The committed reader, diagnostic, cap-removal, and title batch deployed at `74246777`, with
Akrogon claim `0e63609f` and framework claim `89ca20fd`. Broadcast's cap park resolved in
`7b1a1ac9` and progressed in `7d410d95`. Framework's cap park resolved in `69b21e7a`, then
confirming round 6 dispatched in `f3f75e63` and `d349243a`. These demonstrate cap-only recovery,
not T1–T4 procedural recovery or a completed merge. Both lane heartbeat files were inspected
separately after activation; the deployment claim alone is not the health test.

## Rebuttal and additional loophole review

These are source-backed findings and proposed boundaries, not shipped changes:

| Ref | Conclusion                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Healthy heartbeat-gap measurement is useful, but the maximum observed gap times an arbitrary factor is not validated death detection. Excluded killed runs and mixed producers bias the sample. Establish attribution first. Structured process absence can establish exit; an idle status alone cannot establish successful completion.                                                                                             |
| R2  | Routing repair to the implementer may suit the cost policy, but it does not create parallel throughput: `runFlightTick` still selects one flight owner per repo. Repair would also share implementation capacity and change the repair model. Audit role-dependent proof/cleanup paths and retain independent confirming review before treating this as a routing experiment. No quality-neutral or throughput claim is established. |
| R3  | The model direction is settled by the operator: strong consultants/verifiers, cheaper implementer. Measurement selects the implementer and quantifies the result; it does not reopen that direction without a new decision.                                                                                                                                                                                                          |
| L1  | A procedural hold can remain unresolved indefinitely. Display its age, cause, ruling, and next resolution trigger. Age never converts a procedural failure into an operator-design decision. Autonomous machinery-fault repair remains a separate unimplemented design.                                                                                                                                                              |
| L2  | Removing round caps leaves a possible noisy-review loop. A warning after an invented round number does not diagnose convergence. Prefer visible round history, accepted/repaired/reopened findings, and known cost/wait evidence. Even decreasing counts do not prove convergence. Never use this warning to accept an unclean verdict or automatically spend on another diagnostic agent.                                           |
| L3  | The implementer A/B legs span different reader/recovery regimes. Label the confound and separate active work from waiting; do not pool total wall time or retries as a controlled model comparison. Resampling is a spending decision, not an automatic correction.                                                                                                                                                                  |
| L4  | Basic archive cleanup already exists: rejection/warning records live under the control item directory, the finalize chain archives the leaf, and `commitFinalizeMutations` removes the item's `.akrogon/` directory from the default branch. Git history intentionally retains evidence. Unmerged-item growth and `issues/run/checks` retention remain distinct open concerns.                                                       |
| L5  | Heartbeat attribution is shared across sibling seats: `dispatch.ts:evidencePaths` gives every seat the same item progress log, and `liveness.ts:fileTimestamps` filters only by dispatch time. One sibling's timestamp can keep another sibling apparently alive. This is a source-confirmed possibility, not a demonstrated cause of a particular overnight kill. Shortening the silence window does not repair it.                 |

Sequence proposed in consultation: finish bounded procedural recovery, investigate heartbeat
attribution and deployment isolation, then evaluate repair routing and review-convergence visibility
against actual traces. No additional implementation was authorized by recording this discussion.

Pane-title refinement: after viewing the live layout, the operator removed the issue suffix because
the status pane already names the item. Titles now retain role/slot, launch model, and harness.
Lesson: decide compact display content against the whole screen, not a single widget in isolation;
duplicated context crowds out useful identity. Display metadata remains separate from ownership.

## Current implementer experiment lineup

Operator-selected lineup, replacing the earlier Astra → Terra → Luna sequence and the interim
Luna-xhigh-first choice. Collect data over multiple comparable chunks on the corrected machinery;
this is a long-running experiment, not a winner selected from one chunk.

| Order | Model / effort                    | Purpose                                                                |
| ----- | --------------------------------- | ---------------------------------------------------------------------- |
| 1     | Luna / high                       | Cheap implementation candidate.                                        |
| 2     | Luna / xhigh                      | Escalation candidate only if high has an elevated review-failure rate. |
| 3     | Terra / medium, then Terra / high | Comparison candidates.                                                 |
| 4     | Astra / low                       | Quality/cost reference, not the automatic default winner.              |

The three operator-selected benchmarks apply to the implementer role only:

1. Speed: time to accepted work, separating active work from queueing and machinery delays.
2. Cost: total attributable delivery cost, including downstream review and rework.
3. Rework: how many repair cycles are needed before acceptance.

Gate results, tokens, and stalls are diagnostic evidence for these benchmarks, not extra winner
criteria. Select the best observed balance across comparable work; no weighted score is prescribed.
Separate machinery failures from model failures, active time from waiting, and measured
usage from unverified printed totals. Include judge-authored repair cost when comparing delivery
cost, so moving work to a reviewer cannot make an implementer appear artificially cheap.

Use comparable chunk families and record the orchestrator revision and launch configuration.
Earlier runs across changing reader regimes remain labeled observations, not a controlled baseline.
Switch only at completed chunk boundaries, with no preemption of in-flight work. This document
records the future lineup, not a change to the currently running seat.

The operator explicitly rejected the proposed 20% comparison threshold. There is no numerical
acceptance-rate cutoff. The screenshot's 50M-token stop example is not an automatic kill rule:
cumulative cached-token counts alone do not establish a failed or costly run. No new timeout or
kill policy is introduced. Consultants, verifiers, and other roles are outside this experiment.

## Fixture-leak inode exhaustion (F14)

Lifecycle self-test fixtures (`issues-lifecycle-*` temp directories) were created per test case and
never deleted. Roughly 5450 accumulated in a day of lane runs and exhausted /tmp inodes at 97%,
failing a suite run with ENOSPC while 58G of space sat free. Space monitoring alone missed it.

Containment (stopgap, done): hand-removal of the 4574 directories older than 60 minutes, chosen by
age to avoid touching directories a live seat might own. Inodes returned to 41% and climbed again
within the hour, so containment without prevention only buys time.

Prevention (done, 11229ca4): fixture creation registers each root in a process-local list and a
process exit handler removes only registered roots — no age or pattern sweeps, foreign directories
untouched. A regression test covers owned-root removal, foreign-dir preservation, repeated cleanup,
and a deliberately failing subprocess under an isolated TMPDIR proving the failure path cleans up.
Signal kills bypass exit handlers; that residual is unquantified and left open, not claimed rare.

Lesson: temp-state leaks surface as inode exhaustion long before byte exhaustion, and the fix that
honors the no-babysitting directive is ownership-scoped cleanup by the process that allocated,
never a pattern-matched sweep of shared space.

## Judge-authored bounded repairs

Operator-authorized prevention for recursive review paperwork: judge slot 0 is the sole hunter
allowed to commit a small, reproduced, unambiguous in-scope fix. Other hunters remain read-only.
The author commits fixes and focused checks before its report and cannot approve its own work.
The existing independent verdict reviewer checks current HEAD, every fix commit's changed paths
against the chunk contract and engine carriers, acceptance evidence, and reachable regressions.
Verified fixes and harmless paperwork observations use the existing confirmed disposition, avoiding
an unnecessary repair handoff or full round. Unverified, out-of-scope, or material unresolved defects
still block and retain the existing repair path. No new role, stage, or severity-number filter.

The system policy explicitly overrides conflicting hunter read-only wording while retaining the
original rulebook bytes. Task templates agree with that authority. This is agent-enforced scope and
materiality review, not a new deterministic parser of Owned paths. The deterministic engine still
requires an independent current verdict and invalidates acceptance after later code changes.
Regression checks cover author/peer authority, required independent checks, hunter fix followed by
confirmed verdict advancing directly to merge, and subsequent code changes refusing that acceptance.
Deployment and live success must be recorded separately from these passing tests.

Judge policy, fixture cleanup, and shortened titles activated together at 4e47046a. Local claims
6c9122f7 (akrogon) and 54eba554 (framework), followed by advanced heartbeat timestamps, prove the
new processes loaded the batch. This does not yet prove a hunter-authored repair succeeded live.
Peer review caught mixed hunter/verifier duties in the initial policy. Role-specific branches now
keep peer hunters read-only and assign adjudication only to the verifier. Non-review system prompts
were already excluded upstream and remain unchanged. Test role boundaries, not merely presence of
policy text. Existing live titles were shortened through display metadata without restarting agents.

The efficiency consultation remains a proposal, not shipped optimization or measured savings.
Prioritize exact unresolved findings and current evidence in repair packets, then a revision range
and changed-file map as orientation only. Reuse existing planning context before adding another
summary. Evidence reuse needs complete check inputs, including runtime and external dependencies;
unknown validity requires rerunning. Heartbeats, dispatch, and completion timestamps cannot establish
turn-active time. Extra flight slots address queue elapsed time, not agent-work cost. Do not reduce
independent review merely because a diff is small. The 10–30% reduction is a target, not measured data.

## Serial-path optimization before concurrency

The operator retains one active item per repository while the current path is improved. Light
parallelism remains design work, not permission to enable a second flight slot. Learn from the
existing lifecycle's conflict history before proposing it. Separate worktrees isolate Git edits,
not shared installed skills, generated outputs, or dependent contracts. Chart's owned paths include
the global Claude, Codex, and Pi skill mirrors, so file-disjoint branches alone do not establish
independence. The chart findings inspected here demonstrate fixture and repair defects, not proof
that concurrent issues caused those defects.

Judge any concurrency proposal by total delivery time, total cost, repair effort, and code quality.
Include a conflict-resolution agent's work if proposed, repeated checks after integration, queue
waiting, and repairs to the combined result. Serial merges alone do not prevent stale-base work or
semantic conflicts. A dedicated conflict agent is an added cost and responsibility, not evidence
that the conflict risk is solved. Improve the existing serial path first; reconsider limited
concurrency only with explicit shared-resource ownership and evidence that the combined outcome
improves without weakening review.

## Evidence reuse audit

The existing quality gate already reuses successful checks. gate-memo.ts hashes scoped tracked
content and working overlays, anchored changes where required, issues/config.yaml, Bun.version,
and applicable evidence/scanner inputs. maintainer-gate.ts adds stage-specific input scopes.
Therefore a new generic cache is not the first optimization. This mechanism does not establish a
complete input set for arbitrary live-agent scenarios: installed skill homes, agent configuration,
model/runtime identity and external responses need separate validity evidence. Reusing those runs
from an import dependency graph alone would be unsound. Keep O14 as a validity audit and reuse only
where complete inputs are established; do not claim cached time as newly executed checks.

Procedural recovery and inline-code table handling landed as 08a5ff34 (development commit aba34e11).
Activation claims b8e36e17 and cd8ea513 loaded the batch. Chart advanced judge-verdict to repair at
906dfee7 without rewriting its valid seven-accept/three-confirmed verdict. Version-subcommand's
legacy attempts park dispatched consultant advice at 7a2b6437 without a manual resume. These prove
routing and parser recovery, not completion of either item's subsequent repair. Exact-step ruling
scope, accepted-proof-before-hold, one consultation per unchanged snapshot, and unresolved-cause
park deduplication are pinned by tests. Design and physical operator decisions remain protected.

## Review orientation and repair focus

O13/O8 implementation: reuse the existing parsed verdict reasons/evidence and repair-status reader to name
unresolved accepted findings and already checked repairs. The packet points to committed evidence,
pins the branch revision, and requires rechecking after HEAD moves. This does not certify old test
results against new inputs or narrow independent review. The changed-file map includes its exact
revision range, at most 100 displayed names, and a command for the complete map. The capture itself
is explicitly bounded to 1 MiB; only ENOBUFS permits partial orientation output, with complete
NUL-terminated names and a visible truncation warning. Other subprocess faults remain errors.
A large committed-tree regression covers that boundary without creating thousands of disk files.
Do not confuse an incomplete orientation hint with an acceptance proof. The reviewed batch landed
as bf2b636e after the combined suite and maintainer gate passed. Local claims c32e0c30 (akrogon)
and 3fe0b488 (framework), followed by advancing heartbeat timestamps, prove activation. Review
packet effects require a subsequent dispatch; no reduction in time or cost is measured yet.

The board renderer now carries its computed cell values beside the plain frame. Narrow terminal
layouts stack those values directly instead of recovering them by fixed offsets from padded text.
An overflowing model or stage must not shift later labels. Tests preserve the plain and wide frame
and assert whole values under the correct narrow labels. Display changes preserve deploy/fault
computation order and do not change scheduling.

Live lanes can reread source and configuration from their checkout. Restoring development edits
there exposed running lanes to unfinished changes. The lost alternate-screen errors prevent a firm
cause assignment for that crash. Development now stays in a separate worktree, main stays clean,
and status restarts retain stderr. This is development isolation, not a deployed revision-pinned
runner design. Recovery still requires advancing heartbeat evidence after launch.

## Dispatch-specific liveness

L5's red regression showed that a fresh sibling progress line kept a silent seat alive because both
read the item's shared progress.log. New dispatches now record an attempt-prefixed unique liveness_id
before launch. Their receipt and progress paths include that id, and the exact paths are delivered
in the prompt. The reader uses the same committed id, never a guessed current identity. A same-attempt
checkpoint replacement gets a new id together with its new prompt. Existing records without an id
retain legacy paths for their lifetime so deployment does not invalidate live workers. No timeout
was shortened. Tests reject sibling and prior-attempt revival, reject shared-log fallback for new
records, retain legacy behavior, and compare actual submitted prompts with committed identities.
Full reconciler suite and maintainer gate passed before peer signoff and activation.

O13 delivery was verified in the retained Claude harness transcript for version-subcommand attempt 4. The context carried the correct current verdict, but the first repair revision still cited a
pre-rebase fix SHA. The seat corrected it within the attempt, and b8091d44 advanced to judge-hunt.
This proves delivered context and autonomous correction, not measured savings or automatic ancestry
repair. Use retained harness transcripts before adding duplicate prompt logs. Pi retention has not
yet been verified. A context hash alone would not explain what instructions were delivered.

L5 activation: cd637e2a was claimed by de19cfa5 (akrogon) and a9064287 (framework), with
post-start heartbeat timestamps advancing on both lanes. Existing seats were not restarted.

## QA and late-round yield audit

The performance target is the shortest practical chunk wall time at maintained quality and total
cost, superseding the earlier 30-minute target. Keep implementation, waiting and rework separate.
There is no formal per-chunk judge stage: all chunks precede the leaf verification and judge loop.
Adding review every two or three chunks would add stages, not remove current dispatch overhead.

Eight committed QA certificates across the current broadcast, chart, spend and version branches
show no mandatory separate per-chunk QA seat. Spend chunks 2 and 3 explicitly report no separate
reviewer session. Spend chunk 1 repeats the same 13,540,390 cumulative token snapshot and session
01a072b7-622b-7c11-aa7e-bfe3653f1afc in Completion and QA; these are not two costs. The native session
exists but does not provide a QA-only charge from that repeated figure. Version preserves an earlier
independent review without a new run, so this audit does not establish that independent QA never
cost money. Keep the certificate and audit actual child sessions before claiming a saving from
removing a reviewer. Installed legacy skill instructions are not proof of what Akrogon injected.

At broadcast b791407884c33a9e365a047a07ec9400e79134b2, accepted verdict rows by round are 9,6,2,1,0.
Round 3 caught two reachable runtime defects: discovery parsed new state before testing for a
legacy pair, and refusal reporting ran through inspection but not the live tick. Round 4 corrected
a false self-clearing behavior claim. Round 5 had five confirmed rows and no accepted repairs.
These are row counts, not deduplicated defects or cost measurements.

At framework 4fb5541c117203708eeac7ea3196b284d4a734a2, rounds 3 through 6 have 0,4,4,5 accepted rows.
The later findings largely concern a faulty proof script, stale verification/gate attribution,
and contradictory provenance or unpinned citations introduced or maintained during repairs.
Hunters sometimes file the same defect independently. Better first-round review cannot catch a
mistake before a subsequent repair introduces it. Audit missed original defects, repair-introduced
defects and proof drift separately before changing review policy. Do not infer a two-round cap or
universal diminishing value from these samples.

Anthropic's research-system report describes roughly 4x agent and 15x multi-agent token use versus
chat in its own research setting, not a coding-cost multiplier for Akrogon:
https://www.anthropic.com/engineering/multi-agent-research-system
Its long-running harness guidance supports existing progress, scoped work and known verification
commands, not automatically another orientation artifact:
https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
Unspecified review papers and generic 40-70 percent routing savings remain unverified and are not
an authority for changing this factory's models or review gates.

## O6 runtime isolation: activated and independently verified

The runtime separates live records from committed code, configuration, templates and the
rulebook. A physical shell entry launches a bundled bootstrap outside the development checkout.
Prepared revisions live under `issues/run/runtime/versions/<sha>` with their own frozen-lockfile
dependency installation. The completion stamp is written only after installation succeeds.
Preparation uses a separate `flock`, not the record commit lock. A deployment claim requires the
loaded stamp to match the pending SHA, with the pending record rechecked under the commit lock.

Handoff uses `execve`, preserving the PID instead of leaving a waiting Bun parent per deployment.
Preparation reserves the next revision without dropping the loaded revision. The replacement
registers itself after loading. Retention covers current/previous lane revisions, live PID plus
process-start pins, and bootstrap launchers still needed by running processes. Normal exit releases
its pin; later cache maintenance reclaims dead owners. No age-based deletion of live runtimes.

Installer ownership includes replacing the local entry without modifying its symlink targets,
preserving the original entry for uninstall, recording interrupted shim replacements for retry,
and refusing uninstall while a pinned process is active. The administrative entry is
`bun issues/.scripts/reconciler/runtime-launcher.ts install <control-root> <full-sha> <entry-path>`;
uninstall is `bun <retained-launcher.js> uninstall <control-root>`. Bootstrap installation must use
the reviewed committed implementation, not an unfinished source tree. The physical local entry
was installed from committed `32e70d022b69874213bc1a78871e0bb32513dfbf`, preserving the original
symlink as `issues/run/runtime/original-akrogon`. Uninstall remains fixture-tested only.

Pinned config changes, including implementer A/B model switches, take effect through a deploy
entry and matching runtime claim. Editing live config alone no longer changes a pinned lane.
Keep committed policy and live item data distinct in future factories as well.

Tests cover malformed live config isolation, pinned rulebooks, control-only record writes, failed
dependency preparation without a green stamp, sibling retention, PID reuse, same-PID two-revision
handoff through the installed shim, dirty source isolation, normal-exit pin removal, interrupted
shim retry, active-process uninstall refusal and exact original-symlink restoration. Full suite and
typecheck passed. The whole maintainer gate remains red on separately identified pre-existing
lint and dependency cycles; this is not a whole-gate green claim.

Deployment `31ba33f7` was consumed by claims `e52fde3d` (akrogon) and `e13e0f84` (framework).
Independent inspection found both process command lines executing the stamped `32e70d02` tree,
both pins loaded at that SHA with no pending reservation, and both repo heartbeats advancing
after activation. Their parents were the existing shells, not waiting Bun runtime ancestors.
Same-PID handoff between two different revisions is test-proven; this first live activation
does not claim an observed later deployment handoff.

## Diagnose the exact rejected field before changing a reader

The proposed diagnosis for version-subcommand C2 report blob
`bc70a7678bfd95eaabdeaac90e8ca23a88181fca` was that a labeled Evidence field followed by a fenced
block failed the same-line value requirement. Running the shipped field reader over the actual
report disproved it: all seven Evidence fields parsed, because the whitespace expression already
spans newlines. Only F-akrogon-judge-0-10 lacked the required What breaks field. The worker also
reproduced that specific rejection. No Evidence parsing change was justified by this artifact.

The actionable defect was diagnostic precision: one generic incomplete-block message forced the
worker to reproduce the parser to locate the finding. `4bc43a4c` now reports each incomplete
finding's ID and missing fields, keeping the same defect-or-CHECKED acceptance alternatives.
Regression coverage includes missing Evidence and the captured F-10 shape with valid fenced
evidence but missing What breaks. Full reconciler suite, typecheck and touched-file lint passed,
and peer review confirmed acceptance equivalence. The change needs its own pinned deployment;
commit and push alone do not activate it.

Reproduce the complete artifact and identify the failed predicate before widening acceptance.
A plausible format diagnosis is not a failing regression. Likewise, a historical no-heartbeat
failure label does not prove an idle worker: several repair windows contained committed work
whose proof remained rejected. Timing audits must keep observed intervals separate from causal
claims, show unclassified time, and avoid counting overlapping intervals as recoverable savings.

The J1 park audit illustrates why timing must be matched to the deployed implementation.
Version-subcommand's attempts-exhausted park was written at `2026-09-06T06:11:36.556Z`.
Procedural recovery activated at `08:43:05Z` (`b8e36e17`), dispatched its consultant at
`08:43:06Z` (`7a2b6437`), and wrote the ruling-backed resume at `08:46:10.379Z`.
The roughly 152-minute wait preceded activation, not the current consultant path. Framework's
review-cap policy claim (`89ca20fd`) and automatic resume (`69b21e7a`) both occurred at
`06:49:41Z`. These historical waits do not justify another park mechanism: current computation
checks accepted proof first, otherwise requests the consultant, while the normal flight scheduler
still determines when a paid seat can run. Durable park records do not impose a waiting timer.

Initial per-dispatch heartbeat sampling is observational, not a calibrated failure threshold.
Three logs do not cover every role, tool wait, or successful attempt. Their largest observed gap
is a lower bound on what a healthy worker may require, not a safe upper bound. Before changing
the window, include completed-attempt outcomes and long tool calls, separate heartbeat-generator
activity from evidence of worker progress, and estimate false failures as well as earlier recovery.

## Conflict workers must participate in ordinary ownership selection

Broadcast's merge-conflict dispatch `7bfe5dff` at `10:46:18Z` was replaced by version's repair
dispatch `e95a8c59` at `10:47:02Z`, both using `akrogon-verifier-0`. The conflict override happened
inside flight execution, after ownership selection. On the next tick the scheduler compared the
ordinary merge step against the conflict dispatch key, released the place, and replaced the worker.
The rebase remained unfinished. Peer inspection of the retained worker session reported 44.7
seconds, $0.4261, no changed lines, and no remaining conflict pane. This was machinery retirement,
not evidence that the model failed. Historical attempt records remain unchanged.

`b28f1c8b` exposes conflict resolution as the computed dispatch before scheduling and cleanup.
It remains pending while replay stands, or while the latest conflict/advice dispatch lacks current
revision-fingerprint proof after replay. Open questions and parks retain their normal authority.
The named verifier-0 keeps one writer; standard liveness, retries and attempt caps still apply.
Completed conflict proof releases the place under normal queue policy, not merge priority, and
does not become a false backward-phase failure. Cleanup retires the completed conflict worker.

The regression first reproduced a higher-priority competitor stealing the conflict's place. Tests
now cover retained ownership, expiry with one failure and attempt two, replay complete with proof
missing, a latest advice record, and accepted-proof release with pane cleanup and no extra charge.
Full suite and typecheck passed; focused lint retains only the pre-existing seatDispatch parameter
count violation. Peer review approved. Deployment `6fcbf519` was consumed by claims `52de78c4`
(akrogon) and `c8e46b1c` (framework). Both process command lines and loaded pins independently
matched `b28f1c8b`, and both heartbeat files were written after startup. This activation also
includes the previously queued finding diagnostics. Live conflict completion remains separate
from activation proof; an already-replaced worker's historical heartbeat window is not reset by
deploying the prevention.

This case also measures a real shared-file conflict under serial item scheduling: main moved while
the branch waited, and both edited dispatch, packet, merge-stage and their tests. Serial item work
does not prevent development changes on main from overlapping an in-flight branch. Any future
parallelism proposal must count conflict repair and repeated verification in total delivery cost.

## Historical repair completion is separate from current verification

Rebasing changed commit identities while repair rows still cited the originals. Requiring every old
repair citation to remain in the current verdict-to-head range reopened completed rounds. Comparing
the repaired file with its old contents forever would cause the same problem whenever a later repair
legitimately edited that file. Historical completion and current correctness are different claims.

`88078590` records accepted repairs in the committed control ledger under the item's `repair-evidence/`
directory before phase advancement and before the shared rebase command. Initial acceptance still
requires a real in-window citation and nonempty evidence. The record binds explicit scalar item,
round, finding obligation and citation values, retaining the original content delta and repair row
for audit. Cosmetic row changes do not erase acceptance; changed obligations cannot inherit it.
Reads ignore uncommitted certificates. Later code changes still face the current verification and
verdict checks. The existing item archive carries the records at closure.

Rebase, subsequent edits, unrelated citations, pre-verdict citations, pruned objects, cosmetic rows,
changed obligations, uncommitted forgery and duplicate writes have regression coverage in the normal
self-test runner. Full reconciler tests passed. The shared-type extraction removed the introduced
import cycle; final targeted tests, typecheck and touched-file lint passed. The broader quality gate
retains baseline lint failures and three existing cycles. Commit is not activation proof. Already
rebased items without recorded acceptance still need proven historical provenance; this change does
not silently certify them. Scoped gate/verdict coverage remains separate unfinished work.

## A timer heartbeat can conceal a deadlocked check

Framework's `issue-master-liveness.ts --self-test` CLI entry spun while importing and directly calling
its test function completed normally. An old-entry probe at the same main revision hit its eight-second
diagnostic bound. Deferring the CLI body into async `main()` without a top-level await let module
evaluation finish before dynamic imports re-entered the entry API. Fixed full tests completed in
1.582 seconds; typecheck covered 745 files and focused lint passed. Framework main `97f9481e` contains
only that entry change, with no local tsconfig paths or node_modules included.

Three hung test trees persisted across worker attempts, including two reparented orphan groups.
After landing, containment checked exact PID/start/group identities and terminated those two groups
plus only the active attempt's hung test child. All seven targets stopped; the worker remained alive.
This was manual containment, not a durable child-process cleanup fix. Launch-time ownership tagging
and retirement sweeps remain unfinished. The periodic heartbeat described the still-running wrapper,
not useful progress in its test child, so cadence alone cannot establish healthy work.

Peer transcript inspection confirmed the surviving worker then performed a fresh gate run and
honestly reported its red architecture result. Its report omitted the earlier hung and externally
terminated run. Retain interrupted runs in the evidence trail even when a later run completes.
Legacy attempts had shared receipts and progress entries; missing per-dispatch files do not prove
those older launches never started. Do not label their whole elapsed windows as model failure or
verified wasted time.

## Development worktrees must not masquerade as control roots

Framework merge attempts `b307f28d`, `3b0c5467` and `b1c5f053` failed because the existing
`resolveControlRoot` considers every named worktree outside the managed worktree directory a control
root candidate. Our sibling development checkout therefore competed with actual main. The consultant
correctly prescribed relocation but returned `resume` before that relocation happened. A prescription
is not evidence that an environmental prerequisite has been satisfied.

The development checkout was moved with `git worktree move` to
`issues/worktrees/helper-procedural-recovery`, preserving branch `helper/procedural-recovery`, commit
`a61945c6` and a clean tree. Direct execution of `resolveControlRoot` then returned only the real
akrogon root. No item worktree or worker was changed. Under the current discovery contract, put our
development worktrees inside the managed directory and keep their branches outside the item branch
prefix. This relocation removes the immediate ambiguity; it does not implement automatic correction
of environmental prerequisites or prove the next merge succeeded.

## Native finalization must not invoke legacy state readers

Native state includes fields such as `ready` and `repo` that the legacy issue parser rejects.
Legacy dependent-preflight scanned every open item before filtering, so one native sibling stopped
framework finalization after archive stages had already run. Commit `28d5242e` resolves the actual
control root and leaves native dependent recovery to the reconciler. Legacy recovery remains intact.
The regression covers a native sibling, successful finalization and unchanged sibling state.
The retained finalize receipt resumed the unfinished stages without repeating the archive operation.
`01667a5a` completed reference-index-rows finalization. Both runtime claims, `476b218b` and `aae3d94c`,
loaded `28d5242e` with verified pins and advancing heartbeats. A merge commit alone is not completed
finalization, and a submitted restart command is not an activation claim.

## Cheap broadcast candidates must preserve sparse facts

Compose-only, tools-disabled evaluations exposed repeated unsupported speed claims from Haiku medium
when the packet established only reduced input. Repeating a prohibition did not correct that case.
Haiku was not adopted. Fenced stdout alone does not establish that an agent-written draft file would
contain fences, and stripping fences would not correct invented benefits.
Sonnet 4.6 low produced parseable, faithful drafts on both the technical and sparse packets. The two
harness-reported costs were $0.084933 and $0.083952, with wall times around six seconds each. Two cases
support a bounded trial, not a general reliability or savings claim against an unmeasured Opus baseline.
Candidate `479fd32e` changes only the existing broadcast role and its factual-benefit instruction.
It is prepared on the feature lineage, not activated. Other roles and publication authority are unchanged.

## Verify existing role separation and primary research before adding stages

Runtime `28d5242e` already routes plan-synthesis to `synthesizer`, independently configured as
Astra medium while the implementer is Luna high. Version-subcommand dispatch 005 records the
synthesizer seat and Astra. Implementer model rotation therefore does not rotate planning.
Adding a planner role would duplicate the existing responsibility rather than isolate the experiment.

Primary-paper checks changed the proposed research conclusions. [PEAR](https://arxiv.org/abs/2510.07505)
supports planner sensitivity in its agent-task benchmarks, not a measured planning-token share for this
repository. [D-CIPHER section 6.3.2](https://arxiv.org/html/2502.10931v1) reports lower task success with
weaker executors, including Sonnet/Haiku at 13% versus Sonnet/Sonnet at 19%; it does not show strong/weak
beating strong/strong on quality. [AlphaCodium](https://arxiv.org/abs/2401.08500) supports test-guided
iterative correction on programming problems. [The cited code-bias paper](https://arxiv.org/abs/2505.16222)
studies surface cues such as correctness claims, not a requirement for a third model family as adjudicator.
Retained-evidence tests with author identities hidden and a repair-evidence prompt audit are evaluation
candidates, not deployed changes or measured savings. Keep the implementer comparison based on speed,
total cost including rework, and repair cycles under the fixed planner.

## Rejection census and the hunter-to-verifier boundary

Committed snapshot `2f62813e` contains 18 proof-rejection records across open and archived items:
15 repair citation/evidence failures across 11 item/round/finding obligations, two hunter finding-field
failures, and one verdict-table parser failure. These are rejected proof revisions, not 18 independent
code defects. The separate 48 attempt records comprise 14 heartbeat expiries, 10 missing receipts,
seven rejected-proof expiries, six retirements, five question stops, three merge environment refusals,
two merge gate failures and one plan-budget failure. Do not add these categories to proof rejections:
one cause can appear in both. Old heartbeat labels are not proof of worker death or wasted work.

The latest live rejection names version-subcommand round 6 F-akrogon-judge-0-38. Both hunters had
committed reports, but an Evidence label ending with a period was treated as absent evidence despite
executed probes below it. An idle pane here means finished work awaiting an over-strict reader, not a
failed launch. Finding-field grammar is a report-quality warning for the independent adjudicator,
not an acceptance test for the claim. Deliver the named warning in verdict context. Preserve committed
round identity, append-only history and placeholder checks. Verdict dispositions and nonempty evidence,
and repair citation validation, retain their separate hard checks. Never weaken those to fix prose.

The warning handoff is tested locally against the actual two reports and an isolated three-tick fixture.
The fixture advances once to verdict with the warning and never redispatches the hunt. Activation and
live phase advancement must be recorded separately before claiming the running stall is resolved.

Live proof: Akrogon claimed `e61dfc45` at `045f3ab6`, recorded the warning at `83ddab82`, and advanced
version-subcommand from hunt to verdict at `d929ed89`. Both completed hunter panes disappeared through
normal retirement, with no report edits or repeated hunt. The next selected seat was broadcast repair;
version is now eligible for adjudication, not yet adjudicated. Keep that distinction in status reports.

## Serial-path speed design: finish repairs rather than repeat reviews

Current version round-6 findings separate three costs: F-37 is verification left stale by a code
repair, F-38 is a new false-green test under a space-bearing temporary path, and F-39 is a conflict
between an absolute no-write promise and Git's configurable filters. A single generic cache cannot
solve these three classes. Broadcast round-6 F-24 and F-12 are two independently filed reports of one
stale acceptance-record defect. Count repair jobs separately from finding IDs.

Design recommendation, not implemented: make repair completion include affected deterministic checks
and current verification status as an automatic next action, not another rejection followed by a wait.
Reviewers still assess test adequacy. A green run cannot establish that a test detects the defect.
Provide current-round work and settled finding IDs with exact historical references; preserve the full
archive without requiring repeated narration of it. Reopen settled claims for new evidence or relevant
input changes. Evidence-only corrections can proceed to adjudication without another code hunt;
changed code retains independent review. Contradictory locked requirements go to one explicit design
decision rather than repeated mitigation attempts. This does not authorize an agent to weaken the brief.

Do not add a check run at every round boundary, invent input coverage, or cache against the whole tree.
Reuse requires declared complete inputs including applicable environment and tools; unknown inputs
require rerunning. Repair provenance certificates remain a separate mechanism. Later hunts already have
repair/regression scope in the shipped prompt, and O8 already supplies the revision map. Repeating those
instructions is not a new optimization. No measured savings or preserved-quality claim exists yet.
Validate the proposed flow against retained F-37/F-38/F-39 and record-drift cases before activation.

## Two-day speed audit: distinguish failure labels from causes

The independent Sep 5-6 sweep at local ledger `246896a7` reproduces the earlier census:
48 attempt records, 18 proof-rejection records and 15 park records. These surfaces overlap.
An attempt signature quoting a rejected proof is not another proof revision or another code defect.
The attempt split is 14 no-heartbeat labels, 10 missing receipts, seven explicit rejected proofs,
six retirements, five question stops, three control-root refusals, two merge-test failures and one
plan-byte-budget refusal. Proof diagnostics split into 15 repair-row failures, two hunter-field
failures and one verdict-table parse failure. Parks split into four review caps, four attempt caps,
four operator questions and three phase mismatches.

Classify each event against its active runtime and committed work. Version repair-round-1's three
overnight heartbeat failures contained committed repairs and rejected evidence. They are not proof
of three dead seats or three wasted hours. Broadcast's 4124s conflict expiry followed a confirmed
machinery retirement caused by incorrect flight ownership. Framework's two judge-1 attempts had
hung CLI descendants, later reproduced and fixed at the entrypoint. Chart's 10542s expiry remains
unattributed. Its charge at `ba2f7645` (15:30:27Z) places the last observed signal about
12:34:45Z, roughly 116 minutes before charging beyond the 3600s window. The 10542s age is
not measured implementation time. The missing-receipt charge at `080afc8b` likewise reports
10524s against a 120s window. Ledger commit gaps cannot prove missing ticks, and retained
Sep 5 tick output is unavailable, so the late-charge cause remains unknown. Confirmed-exit
detection can promise evaluation on the next completed tick, not immediate wall-clock recovery.
The retained lane stderr files cover restarts, duplicate-model warnings, a garbled manual relaunch
and the archive preflight race. They are not a complete two-day crash log.

The existing receipt deadline is 120s. Confirmed worker exit needs a separate observation and prompt
recovery after proof-first evaluation. An idle/done UI is not process exit. Failed transport reads
cannot establish death. Descendant cleanup must preserve dispatch ownership and PID/start identity.
Silence sizing remains separate: successful report runs contain matching per-dispatch beat gaps of
539s (version round 6 judge-0) and 546s (broadcast round 6 judge-0). A blanket 600s deadline has almost
no margin. Bind every sample to the recorded id and seat path. Extra wrong-path heartbeat logs exist
and cannot revive the recorded attempt or inflate its coverage.

Research claims must survive reading the primary source. The proposed 400-line merge-speed rule
cited [Do Small Code Changes Merge Faster?](https://arxiv.org/abs/2203.05045), whose abstract reports
no size/time-to-merge relationship across its GitHub, Gerrit and Phabricator datasets. It does not
support that rule, and it is human-review data, not an agent benchmark. The claimed 75 percent
benefit in the first two review rounds was withdrawn because no supporting primary passage was
verified. Neither claim justifies changing our quality gates.

[Anthropic's harness experience](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
supports incremental work, tested end states and clear handoffs. It supports completing a repair
before passing it forward, without establishing a numeric speedup here.
[Cognition's context guidance](https://cognition.com/blog/dont-build-multi-agents) describes lost
implicit decisions across agents. It does not establish that removing our independent reviewers
preserves quality. [Efficient Agents](https://arxiv.org/abs/2508.02694) evaluates cost-of-pass on GAIA,
with some performance loss. Its reported savings are not a forecast for this coding factory.

The converged work remains P1-P4, confirmed-exit recovery with safe cleanup, and consultant-directed
strategy changes when the same failed approach repeats. Delta-oriented hunt context already ships.
Chunk subdivision does not reduce the leaf-end reviewed diff. Planning can settle known planning
questions, but cannot predict every contradiction introduced by a later repair. P1's implementation
is covered below. Confirmed-exit recovery is not shipped by this audit.

## Repair-completion checks: execution is evidence, not approval

P1 runs existing cheap chunk verification commands after completed repair evidence, before the
next independent hunt. It records immutable results in the control ledger and supplies their
paths to reviewers. A failed check routes corrective repair through the existing attempt and
consultant machinery. The same failed snapshot runs once and is charged once. A code commit
alone does not retire the corrective worker before its repair report is committed. If a restart
interrupts failure accounting, the next tick finishes the record without repeating the command.

Reuse depends on a complete declared set of paths, environment names and tool executables.
Hash actual worktree bytes, including untracked and ignored inputs. A committed lockfile alone
does not describe installed dependencies. Sort matched paths, represent an empty match set and
include the declaration itself. Symlinks remain unknown: hashing only their target names misses
changed target contents. Capture limits of 4096 paths, 64 MiB of files and 256 MiB of tools degrade
to unknown with a warning. Unknown or malformed declarations retain their executable command and
rerun once per completed repair snapshot. Never turn a declaration typo into a lane crash.

The whole-code snapshot dedupes scheduling only. It does not grant whole-tree green reuse.
Runner faults leave the action due without charging a code failure. Measurements retain at most
2 KiB per output stream with truncation disclosed and full run-log paths. Machine green does not
prove test adequacy, resolve accepted findings, approve contract changes or replace leaf checks.
Input completeness remains a reviewer responsibility. Undeclared inputs can cause stale reuse,
so a discovered omission must repair the declaration itself.

Validation covers changed/generated inputs, unchanged reuse, unknown-input reruns, immutable
history, red-to-retry routing, interrupted accounting, already-charged attempts and the independent
review boundary. The full reconciler suite, typecheck and focused lint pass. The broad architecture
gate retains exactly the same three cycle findings as clean main. Activation requires a pinned
deploy entry. Runtime 9f208400 is active on both lanes. Record 3005d659 is the first observed
live passing repair check for broadcast round 8. The same tick recorded two other checks failing
(4409dc23, cf794806) and immediate attempt accounting d678b19d, so one passing check was not
a green repair. No live speed or cost reduction has yet been measured for P1.

Leaf scheduling continuity is documented in [the queue-ownership lesson](2026-09-05-queue-order-preempted-active-work.md).

### Merge recovery needs an executor and acyclic proof readers

A consultant ruling that prescribes edits cannot be delivered only to a reconciler-executed
merge row. An explicit repair disposition now selects a snapshot-specific verifier task before
retrying the failed verification. Its committed proof routes through independent review. Each
subsequent merge attempt still verifies the current integration state. Legacy resume behavior
and physical/design holds remain unchanged. Recovery consumes only merge-related question entries.

Shared proof reading belongs below recovery orchestration. Moving computeItemProof into item-proof
and ProcedureResolution into a separate type module removes the dependency cycles without changing
acceptance rules. The architecture checker includes type-only edges in reported cycle paths.
Architecture now passes with zero error-severity violations in the recovery checkout. The full
reconciler suite, typecheck and diff gate pass there. Deployment is a separate step, and removing
a main-side blocker does not prove every item gate is green after integration.

Question status fields must precede embedded report headings. A consumed marker appended after
a consultant H1 falls outside the parsed question section and leaves the question open. New fields
are inserted directly below the question heading; the resume regression includes H1 and H2 prose.

Synthetic merge-repair seats need explicit completion cleanup: the ordinary merge row is machine-
executed and does not identify the verifier that authored the repair. Cleanup uses the latest
resume key, committed current repair proof, and existing newest-dispatch ownership checks. The
normal tick closes the finished repair before launching hunters. Stale or uncommitted proof never
authorizes closure; later code changes can invalidate the fingerprint before delayed cleanup.

Repair resumes must skip a doomed pre-repair gate without skipping main integration. The selected
correction flight synchronizes its worktree before a new repair or machine repair check when no
repo seat remains. Active seats defer the update. Ledger-only changes do not trigger a replay.
A completed repair is measured again at the integrated snapshot before another paid attempt;
current-snapshot records deduplicate the following tick. Authored reports and historical results
remain unchanged. Every subsequent seat receives the committed base-update notice with exact
revisions and bounded paths, explicitly distinguishing integration from a proven fix. Conflicts
remain for the existing conflict seat. Refused synchronization is recorded once and passed to the
corrective worker instead of introducing a new waiting state. Other dispatch classes are not yet
synchronized by this correction-boundary hook.

## Planning for visible completion

The planner targets cohesive chunks that include implementation and required verification in roughly
15-25 minutes. This is guidance, not a timeout, line cap, or reason to reject a completed chunk.
Keep splits inside the existing leaf unless its locked plan already calls for separate deliverables.
Judging remains leaf-level, so adding chunks does not reduce the judged diff or prove faster merging.
Measure time through the requested outcome, including checks, repairs and successor work.

## Verification currency and deploy boundaries

P1 chunk checks do not cover leaf verification: the verification contract also requires the fork gate
and Mandatory leaf checks. A green subset must never refresh the whole verification claim. At a closed
repair or merge integration boundary, a current authored pin or previously completed machine refresh
can authorize a new machine refresh request
bound to the unchanged verification blob, all chunk declaration blobs and the integrated code tree.
Strictly extracted leaf commands and the literal fork gate run through P1's existing runner and failure
accounting. Unextracted content stays with the verifier and names the reason. Unknown inputs receive
no cross-snapshot reuse. The request's originating round anchors its measurements, so a subsequent
judge record alone cannot erase them. Changed code, declarations or source proof invalidate the request.
Authored prose remains historical, and conflict/recovery proofs and code-verdict approval stay separate.
Merge revalidation consumes the same deduplicated measurements as refresh acceptance, so a command
shared by the chunk and leaf runs once. Structural completion and committed QA requirements keep
their existing precedence. Already-stale legacy reports cannot start a refresh authorization chain.

Review packets show one latest status per check: current measurement, historical pass with unchanged
declared inputs, or due rerun. They distinguish execution from test sufficiency and uncovered leaf
checks. A disconnected but resolvable prior reviewed commit still supplies an exact snapshot diff;
ancestry loss alone does not justify replacing it with the entire item diff. This is orientation only,
never permission to reuse a verdict against changed integration context.

A ready deploy must be checked after proof acceptance and completed-seat retirement, before the next
phase dispatch. Requiring a finalized item after dispatch can postpone activation through every round.
Any extant named repo seat, including idle or unknown, defers handoff. This changes activation timing,
not the safety of landing code while an accepted item is about to merge. Bundle reviewed changes and
check that merge window before landing. No new operator park or manual resume is needed for handoff.

The record commit lock is non-reentrant. Helpers such as assertCleanCheckout acquire it themselves;
inside withCommitLock, use a direct status check instead of nesting another lock acquisition.

## Independent confirmation of completion-only repairs

A completed repair whose only post-verdict change is its repair.md completion record can go directly
to independent adjudication. Code-tree equality alone is insufficient: verification.md, chunk
declarations, QA, and other evidence must remain unchanged, and the original verdict must remain
in the branch history. Unknown repair authors or no distinct configured reviewer retain the ordinary
hunt. Independence excludes every recorded repair seat and its model.

The control ledger records the qualifying head, originating verdict, and chosen reviewer. The reviewer
is an existing judge seat carrying verifier duties, including authority to accept new defects. Source
hunter reports remain verbatim at their original round. The reviewer writes either a standard verdict
or a revision-bound hunt-request.md. A hunt request starts the ordinary two-hunter pass in that same
round and approves nothing; an older engine sees an unfinished round rather than a clean verdict.
Changed inputs invalidate the shortcut. Cleanup and retirement use the recorded reviewer identity,
not the ordinary verifier role assigned to the phase. No measured speedup is claimed before live use.

## Missing-seat observations do not establish worker exit

A waiting dispatch can retain a valid file heartbeat after its registered transport name disappears.
The runtime reports that mismatch at the next completed tick, with the expected seat, step, attempt,
and file-signal state. It does not establish that delegated writers have exited and never changes
retry, park, or timeout decisions. Transport failures remain explicitly unavailable observations.
Only observation transitions reach stderr, with bounded error excerpts; the current state stays in
the tick display. No receipt PID, Herdr modification, or shortened heartbeat window is required.

## Dependency declarations need a scheduler consumer

A stored depends_on field alone does not order work. The common item-step entry blocks dependent
items without parking, launching a seat, or charging attempts. A closed prerequisite requires a
committed merge archive and ancestry on its repo's local default branch; missing objects remain
explicitly unproven. Any proven archive suffices unless an open incarnation exists. Both dependency
writers reject missing slugs and cycles, and the native writer preserves scheduling fields under
the ledger lock. Agent recovery must write dependencies only after the item's writers have closed.

## Agent decisions need executable consequences and a finite recovery path

An existing ruling file is not a valid decision by itself. Invalid arbitration output charges its
attempt once and retries through a distinct per-attempt proof path. Strong candidates run in config
order with separate budgets. Software decisions resume work, dispatch a correction, or create a
prerequisite. Only an evidenced physical prerequisite becomes an unanswered operator action.
Exhausted candidates create one native recovery issue and its parent dependency in one commit.
Recovery cannot recursively create more recovery issues. A merged recovery with unchanged inputs
leaves an explicit terminal machine blockage rather than minting another issue or inventing approval.

Retry identity excludes both lifecycle records and the configured gate certificate. Including either
would reset caps on the machinery's own writes. Code and configuration changes do renew the inputs.
Distribution checks also require new shared dependency modules in the payload manifest and policy
changes in the root authority, so downstream installs retain the validated behavior.

## Generated quality output must remain outside version control

Framework tracked 13,257 files under issues/run. The current payload build rewrote generated bundles into a roughly 1.8-million-line diff and a Git capture hit ENOBUFS. Framework commit 9cc65bf3 removes run output from the index while retaining files on disk and ignores future run output. Durable gate certificates remain separately tracked under issues/certificates. The same carrier supplies empty architecture exemptions and a zero softened-edge census, nine produced-code scopes, and matching Bun types. Payload self-tests passed. The actual quality run remains red on measured source debt, recorded in six framework issues and the 2026-09-07 coverage JSON. No timeout or buffer-limit workaround was introduced.

## Gate output must not block its own verification or synchronization

The version-subcommand freshness refusal ee65b173 named an untracked gate certificate that main
already tracked. Synchronization saves that configured output under the ignored run directory,
cleans only its unstaged copy, and unions measurements back after rebase. Staged changes remain
worker-owned. A crash can require another gate run; the raw backup remains available. Certificate
conflicts stay with the conflict worker rather than overwriting conflict markers.

The same output is excluded from P1's tracked-cleanliness check and code identity. Otherwise a
green check dirties its own tree, or committing its certificate invalidates the result just measured.
Excluding records from the replay decision alone does not fix these separate readers. Code and
issues/config.yaml still change identity, and certificate reuse still requires the gate's input digest.

## Fault backoff must not delay a ready deployment on an empty lane

After transport fault 26f545ed, Akrogon's 300-second retry backoff skipped both the safe deploy check
and the lane heartbeat. The live process appeared stale and could not load its already-merged fix.
Backoff ticks now use the ordinary heartbeat writer and the same empty-seat deployment check.
They do not dispatch work, charge attempts, change the retry deadline, or interrupt live seats.

## Exact misplaced questions must still reach their reader

Framework typecheck chunk 01 committed its blocking question at repo-root questions/ in 4de2715e,
despite receiving the full canonical .akrogon path. The reader polled only the canonical path.
The fallback accepts only the exact slug, step and attempt filename. After retiring the asking seat,
the machinery moves the committed bytes to canonical in one commit, refusing changed paths loudly.
Existing finalization then removes the record. No target code or acceptance criteria change.

The same worker wrote a future heartbeat. Receipt and heartbeat timestamps are now capped at their
signal file modification time, never at the polling time. An unchanged future line therefore expires
under the existing window. The file timestamp cannot create a signal without an authored line.

## Codex trust must exist before opening its seat

Framework's first Codex startup stopped at project onboarding. Per-invocation flags did not
establish persistent project trust. The startup writer appends only a missing exact registered-root
trust entry to the resolved CODEX_HOME/config.toml and sends that same home into the pane.
Existing trust values remain untouched. Original and prospective TOML must parse before any write.
An existing unusual project table fails before pane creation. The commit lock serializes machinery
writers, not independent Codex settings writes.

The isolated fresh-root probe on Codex 0.153.4 reached the ordinary composer without a trust dialog
and quit with exit 0, session 01a0791b-ea53-7872-809d-9aa7dac5a160. No model prompt was submitted.
The focused config fixtures and required maintainer diff gate passed. Persistent key documentation:
https://learn.chatgpt.com/docs/config-file/config-reference

## A pane command can append to stale shell input

After the verified framework reconciler exited, its shell contained an unsubmitted Claude launch.
Sending the shim command appended to that text and launched a separate unintended Claude process
with an effort argument containing medium1akrogon. The exact argv and parent PID identified that
process before SIGTERM. No worker was signalled. Relaunch from the emptied shell produced verified
framework PID 1391414 on runtime 318141ae and the first tick normalized the lost question in 22cd1003.

For future manual lane launches, verify the shell occupant and clear existing input before sending
the command. Herdr uses ctrl+u, not ctrl-u. Verify the resulting argv and runtime pin, since sending
a command alone does not prove the lane started.

## Lifecycle transitions need structured signals

Architecture completion c4ff9363 placed `## Completion instructions` before its filled
`## Completion`. The prefix-based reader selected the instructions and reported unfilled work.
That kept the finished seat open and blocked the deploy that would fix its reader. Commit 5fed5f9f
changed completion and decisions-budget readers to exact headings. The real artifact then reported
its invalid Verification state, not a fabricated pass. Recovery closed the verified idle session
only after deploy-pending existed. Akrogon claimed the upgrade in cb2c6c53.

Operator rule, 2026-09-07: lifecycle facts should come from strictly parsed structured evidence,
not interpretation of prose. Prose reads are a last resort when no deterministic representation
exists. Reuse existing machinery-written records or CLI output before adding a record format.
Human explanations remain available to reviewing agents. A worker-finished signal permits proof
evaluation and seat retirement. It does not certify acceptance or authorize merge.

Replace each lifecycle prose dependency only after its fact has a validated structured source.
Do not keep extending parsers for new wording. The completion-signal replacement is still pending
source tracing. The exact-heading patch fixes this incident but does not establish that replacement.

## Every launched seat needs an evidence-based retirement path

The research-artifact-reachability consultant committed hold ruling f3dedb09. Control records
24ae89b2 and 0fdfe6e8 parked the item, but its computed next step was arbitration. Advice cleanup
required a later base-worker dispatch, which a hold never produces. The idle consultant therefore
remained open and blocked deployment even after another item started. Recovery closed only the
verified consultant session a4790df1 in pane w5:pBN through killSeatPane, preserving its dirty
worktree and leaving the active implementer untouched.

A committed hold plus the handoff to a different arbiter dispatch now retires that advice seat.
Arbitration alone is insufficient evidence. The regression proves both cases and verifies that
successful advice incurs no failed attempt. Existing loop tests pass. This closes the observed
hold edge, not every possible pane-retirement gap. The complete release-path audit and structured
worker-finished signal remain required. Never infer completion from heartbeat age, missing panes,
or a computed phase mismatch alone. Protect any newer launch that reused the seat name.

Framework runtime 6b5cdd15 launched c65ace9e with Luna high while xhigh/fast was pending. To prevent
another old-runtime launch, PID 2295921 was paused with SIGSTOP under the control commit lock after
verifying its pinned argv. Its active implementer was not stopped. Replace that old loop at the
worker's closed boundary before dispatch resumes. A paused loop heartbeat is not a worker failure.

## Control checkout is an execution boundary

At 09:59:47 local on 2026-09-07, helper-claude ran `git pull -q` with stderr discarded in
the live control checkout. Its rebase configuration moved HEAD from ba8f0d3e onto stale
origin/main 9c6b2d33 and stopped on a conflict. A mistaken merge-abort and file restore
left the rebase active. The running reconciler then read the old checkout and committed
false parks and a real repair dispatch onto detached HEAD. Main itself remained intact.

Recovery paused the reconciler, preserved detached history as
`recovery/control-pull-20260907`, and aborted the rebase from a clean working tree.
The legitimate live bmm repair kept its original timestamp and liveness identity when
its dispatch was restored through writeDispatchRecord. State recovery ba9b32d0 restored
repair phase without touching the worker. False failure history remains on the recovery
branch, not attributed to a model or replayed into main.

The control checkout is read-only to the consultant. Fetch remote state in a separate
checkout, never pull or restore the live control root. The reconciler now checks its
configured control branch and Git-operation markers before tick effects and inside the
commit lock before running a record producer. Detached HEAD, a wrong branch, or an
in-progress merge/rebase stops the tick without item failures or worker retirement.
Tests prove zero transport, zero producer execution, unchanged HEAD/index, and normal
writes after checkout restoration. This does not make an external Git command that
ignores the lock safe midway through an operation.

Keep the control context intact when writing an item branch. Replacing its root with a
worktree bypasses the intended ownership model and conflicts with the control guard.
Control and item writers share one file-commit implementation, but validate their actual
targets separately under the control lock. Item writes pin branch and head and refuse
unfinished Git operations before invoking the producer. Question normalization uses this
boundary and preserves the committed question bytes.

## Function before report wording

The lint worker reported decisions and passing test results, but the completion reader
rejected them for missing literal reason labels and pointer-shaped proof text. Teaching
workers those arbitrary spellings would preserve the defect. Readers validate functional
structure: required content, non-placeholder proof, valid statuses and budget records.
Agents judge whether explanations and evidence are meaningful. Do not enforce exact
words, list styles or prose ordering merely as a proxy for quality. Strict syntax remains
necessary for machine-executed commands and revision-bound records.

## Remove the fragile input

Prefer removing a bug class to guarding each instance. A disposition belongs to its
pinned verdict and head. Its gaps are derived content, so including their order in the
identity creates duplicate requests without changing the work. Keep canonical inputs
in the identity and validate the request content separately. Once the smaller design
preserves the required behavior, implement it without exploring unrelated abstractions.

The lint incident also exposed a deploy dependency: the old reader could not release
the finished seat, while runtime activation waited for that seat to close. Recovery
published runtime 4808e25f first, then closed the exact idle session through killSeatPane
after verifying clean head 3aeb64e7 and filled completion under the new reader. Framework
claimed it in 96ab6df8 and advanced to verification in 38f26af7. Automatic retirement
from a deterministic finished event remains required. This manual recovery is not that
implementation, and the waiting time belongs to machinery overhead, not model work.

The architecture leaf exposed another form-over-function failure: its valid verification
table was rejected because command notes followed it in the same section. Validate table
rows independently of surrounding prose. Leading-pipe rows still require valid cells,
statuses and unique work items, including rows after explanatory text. Shell pipelines
inside prose are not table rows. The committed completion needs no wording repair.

## Closed-boundary framework activation

The historical Luna-high typecheck worker completed at 3ce1c5df with a clean worktree.
Its finished session 01a07abb-3d96-7890-aa74-e3c467168063 was closed without preemption,
and old paused loop 2295921 was retired. Clear any pending shell input before restarting
an existing pane and use the installed launcher, not the unpinned source entrypoint.
An initial restart encountered stale shell input and launched an unintended Claude
process, which was stopped without repository edits. The unpinned CLI correctly refused
the pending deployment. Installed `akrogon run framework` then claimed b0f42a7b in
0415a072. Dispatch 06abba17 and process 3498884 independently confirm Luna xhigh,
service_tier fast and fast_mode true. The old high cohort stays separate from this leg.

## Rejected completion must remain recoverable

Framework typecheck completion recorded its cost as a Markdown bullet with a prose
source. The reader ignored the bullet and also required parentheses around the source.
Normalize ordinary list formatting once before completion checks, and require an
amount and explanatory text rather than punctuation. Structured spend records retain
their strict codec. Verification failures are not converted into passes.

A partial completion returned blocked before seat recovery could run. That bypassed
both retry accounting and retirement after the worker disappeared. Rejected completion
now carries its file and blob through the existing dispatch recovery path. A live worker
keeps its assignment, changed evidence is re-read, and expired rejected evidence records
one ordinary failure before retry. Test this through the real tick, not by calling the
retry planner directly and bypassing the broken routing.

## Shared checkout refresh is a write

An operator resume pulled main while a tick was writing a park record. Git saw the
half-written record as an untracked collision and refused the refresh. A clean checkout
afterward did not undo the extra park. Base refresh now uses the same commit lock as
record writes, including the publication retry pull. Lock ownership is tracked by
resolved path in the process, so nested merge recovery can reuse its own lock without
waiting on itself. Only the outer owner releases it, including after nested failures.

The regression observes the lock during a real Git fast-forward, checks nested writes
and exceptions, and checks that another control root obtains its own lock. Network
refresh still runs inside the critical section. This change does not resolve duplicated
hold questions or prove all lifecycle cleanup complete.

## Publish the decision and its release together

Consuming a question before branch preparation and resume publication exposed an
intermediate state: the old park stood, but its question had disappeared. Another tick
could escalate that same hold again. Question consumption, optional priority, and the
resume record now share one commit after branch preparation. The writer rechecks the
park and exact question bytes, preserving a newer answer instead of overwriting it.

Agent-authored answers join that same commit, carrying the structured ruling and repair
step with the release. Operator answers are durable intent: the CLI records them and the
loop resumes exactly that entry, preserving sibling holds. A crash after an operator
answer therefore leaves a machine continuation, not a reason to launch another arbiter.
Integration's Git mutations share the existing writer lock; verification remains outside
that critical section. The regressions cover a changed answer during real rebase, CLI
exit before continuation, sibling holds, atomic agent answers, and lock ownership during
the actual replay.

A typed refused or unverified integration still records its newer park and releases the
original one. An interrupted or throwing integration publishes no agent answer; a retry
may renew arbitration if its canonical evidence changed. This does not yet prove every
precomputed procedural effect has stale-input admission protection.

## Stop reservations before waiting for a boundary

A manual boundary watch missed spend-cost-recording's completed consultant because the
same tick reserved the repair seat. Operator pause intent must share the reservation
writer's lock. It must also survive a deployment or restart, so it cannot live in the
consumed and overwritten deploy-pending record.

During a pause, the loop observes harness state and updates its heartbeat and board.
It performs no proof acceptance, item writes, integration, or pane retirement. Working,
blocked, and unknown agents keep draining; idle and done allow the loop to exit. Only
an explicit resume clears the flag. This distinguishes a finished process from accepted
evidence, which the next normal tick evaluates. A reservation racing pause returns
paused without charging an attempt.

## Runtime launch identity belongs to one process

An installed loop passed its runtime SHA and launcher environment into checkout CLI
tests, which then demanded a runtime stamp in an ordinary item worktree. Consume those
variables once at the CLI entry, retain the validated runtime in memory, and remove them
before any child can inherit them. Re-exec installs a fresh identity explicitly. Per-test
environment stripping hides the defect from the next caller.

## Consultations must not invalidate their own identity

A parked repair derived its consultation identity from a temporary focused-disposition
proof path containing the moving branch head. Each consultant ruling changed that path
and orphaned its own answer. Hash the stable phase's committed proof files and code at
one revision. Expand round placeholders against committed proof files, so changes to
repair evidence still renew the diagnosis while writing its ruling does not.

## Review a disputed check without abandoning an unfinished repair

A committed consultant ruling cannot silently replace a verdict's executable criterion.
A current failed finding with a ruling for its repair round enters the existing focused
review path, which may supply a pinned replacement criterion. The check plan owns that
admission decision so scheduling and merge approval do not make competing decisions.

Finding checks retain previous results by their stable criterion identity. A code-only
commit does not finish a corrective worker's report: the existing failure route retains
ownership while that report remains unchanged. Coverage review follows that repair duty.
The regression covers ordinary failure, scoped replacement and machine execution, plus
code-only retry progress without an extra disposition seat.

The quality gate includes the reconciler's existing aggregate once. Adding it exposed
stale fixture sources and an actual retry-order defect that isolated passing suites had
missed. Automatic entrypoint discovery remains separate from this bounded coverage fix.

## A new rejection does not create another failed attempt

After a park resume, a focused reviewer rejected the repair before a new worker launched.
The rejection reader waited for its exact failure signature, while the writer correctly
refused to charge the already-failed historical attempt again. Every tick repeated a
machine action that could never publish the record its reader required.

Rejection routing and failure recording now share the selection of an unfailed attempt
in the current resume cycle. Without one, the existing flight planner owns the retry or
park. A worker launched after the selected review began handles that review's result and
cannot be charged by it. Numbered dispatch order establishes that boundary, without Git
timestamps or live-pane reads. The worker prompt carries the current committed rejection
and its ruling path even when no new failure was recorded.

The isolated production-tick regression starts with failed attempt three, resumes its
park, commits a rejection, and observes attempt four. It preserves historical failure
bytes, protects the new worker on repeated ticks, and verifies that a new failed check
still charges once and retries normally. Code and completed repair evidence then return
to ordinary checks. The same regression fails on the prior routing implementation.
