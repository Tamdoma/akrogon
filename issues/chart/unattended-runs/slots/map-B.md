Independent map B

Root causes and confidence

F1. #135: confirmed policy gap, incomplete runtime diagnosis. watch-issues/SKILL.md Judge has no routine-confirmation branch and Never says “Answer a seat.” scripts/observe.ts formatLeaf prints status but drops status.kind/msg, and observes leaf seats rather than chart doors. src/hc.ts Seen already carries kind/msg, so no new prompt registry is needed. A watch that follows today's rules cannot deliver the reported behavior. Which actual prompts remain under today's recipes is unproven.

F2. #135: current akrogon config already launches Claude with --dangerously-skip-permissions, Codex with -a never, and pi with --exclude-tools request_user_input. Local CLI help confirms those flags exist and their documented effects. The report involved an auto-mode classifier denial, so the reported process may have different effective settings or a different prompt class. Do not claim another permissive flag fixes it. chart-issues/SKILL.md already requires printed questions instead of question tools, so the reported chart dialog also violates an existing instruction.

F3. #136: high confidence. src/run-check.ts leafTarget captures phase, checkedRun only records it, and ownerRefusal checks ownership/closure rather than execution phase. src/admission.ts withAdmission manages run registration and queueing, not leaf phase. Framework timings independently show three successful paid captures starting with phase=failed at 21:41:23Z, 21:43:59Z and 21:46:38Z. A failed launch at 21:40:38Z is additional evidence, not one of those three successful captures.

F4. #136: high confidence contributing cause. capture-buffalo ran 21:36:32–21:39:09Z. dispatchSlot redelivered at 21:36:35Z and 21:36:46Z, and the phase log failed the leaf at 21:36:56Z. dispatchSlot does not consult live checked runs. implement-issue Shared context, Proof order already says foreground execution and waiting for exit. Correcting start accounting alone does not prevent this case because the seat really ended its turns while its command continued.

F5. #137: high confidence counter defect, unknown original killer. src/seat.ts firstTask treats working as proof of delivery, and startSeat increments attempts immediately. src/next.ts dispatchSlot restarts absent/finished seats before its attempt-limit branch, so repeated losses can grow attempts without checking that limit. Framework timings and this boot's listener journal confirm deliveries at 09:30:55Z, 09:31:13Z and 09:31:27Z. No completed turn is established by those deliveries. phase.ts commitMove resets attempts on phase changes.

F6. #137: teardown loses diagnostics. dispatchSlot calls src/hc.ts end, which kills and removes the finished terminal. Removal explains missing old hc records without identifying who originally killed the process. reconcile.ts sliceKeepReason/stopSlice can also stop a slice lacking a live tab, but the inspected evidence does not establish that path caused either death. Do not select hc or herdr as the culprit yet.

F7. Separate boot PATH defect is confirmed. Journal at 10:29:49 CET shows Bun.spawn failing to find akrogon in listenCommand. systemd/akrogon-listener.service uses an absolute executable, but listenCommand runPasses uses bare akrogon for children. Place this in the recovery issue as a separate small leaf. It is not the explanation for the three later successful launches.

Material forks

Q3. How does the watch release routine work? Options: correct avoidable question-producing instructions first and add narrowly proven confirmation for residual prompts; add generic screen-driven confirmation; notifications only. Pick the first. It removes avoidable dialogs using existing authority. Generic confirmation invites accidental new decisions after UI changes. Notification-only leaves #135 unresolved. Actual harness denials and operator approvals remain pending under the signposts.

Q4. Which failed-leaf checks are refused? Options: every leaf/worker run-check; only commands believed paid; warnings only. Pick every leaf/worker run-check while failed, with recovery through phase. Arbitrary argv cannot reliably reveal cost. Paid classification creates bypasses and new configuration. Warnings preserve the observed spend. Keep explicit non-leaf holders working. Re-read authoritative state after admission waits and before child launch, not only the phase snapshot passed into checkedRun. Persist refusal evidence where the caller can find it.

Q5. What happens to a command accepted before the leaf fails? Options: finish and retain its output; cancel it on phase change. Pick finish for this chart. A valid in-flight capture is different from a new launch. Cancellation can waste already-paid results and needs a separate cross-process cancellation contract. Define launch ordering against phase transitions explicitly so a queued command cannot use stale authority.

Q6. What prevents background execution from becoming silent-turn failure? Options: rely only on the existing foreground rule plus the launch refusal; defer redispatch while an existing registered run remains live. Pick defer using admission.ts liveRuns, filtered by repo and leaf, including queued runs. This reuses PID/boot-aware execution facts and removes the false inference that an idle seat means no work. The first option contains later spending but still fails leaves doing work. Do not create a second liveness tracker or infer execution from old check_start/check_end pairs. Ensure completion wakes dispatch or existing recovery reaches it. Existing command deadlines/stop-run remain relevant, so “live run” cannot mean unlimited waiting without an escape.

Q7. How are repeated infrastructure losses bounded? Options: retain delivery counting; separate consecutive start-loss accounting from ended-turn accounting; stop at the first unexplained loss. Pick separate accounting, reset by demonstrated useful progress rather than merely another start. Delivery counting violates settled signpost 4. First-loss stop sacrifices ordinary reboot recovery. New accounting must be checked before replacements, survive listener restarts and preserve the last loss evidence. Do not pick the numerical bound without showing its lifecycle and reset rules.

Q8. How does the listener find itself? Options: resolve the installed launcher independently of PATH; change service environment; retry PATH lookup. Pick the first inside akrogon. It removes the PATH dependency. Preserve the existing release-update behavior: pinning children to an old source release can defeat pull/self-update. Environment edits expand reach and retry leaves the cause intact.

Practitioner questions and lifetime pitfalls

P1. Is an ended turn consumed once across repeated wakes, duplicate snapshots and a listener restart? Use the recorded seat identity and prompt turn, not only a mutable counter. A new process's turn zero cannot be compared directly with the dead seat's turn.

P2. Can a full-suite admission wait outlive phase eligibility? A check before queue admission alone is insufficient. Do not hold a phase lock for a whole slow command and block the very recovery needed to stop it.

P3. Can a live worker run hold off an unrelated seat indefinitely? Match owner and runtime identity precisely. Existing liveRuns includes waiting records and validates process/boot identity, unlike historical timing records.

P4. Does an operator draft or changed screen arrive between inspection and a keypress? Never clear drafts or reuse a prior prompt's authority. Routine confirmation needs observed harness-specific behavior, a current target and a durable action record. “blocked” alone does not identify a safe prompt.

P5. How are existing attempts interpreted after the definition changes? Old persisted values count deliveries. Carrying them forward as completed turns falsely fails old leaves. State compatibility and recovery semantics belong in the accounting leaf, not a manual repair of framework state.

Proposed split and dependencies

A1. Issue “leaf execution authority” from #136, one leaf: fresh failed-state refusal for leaf and worker run-check, including queued admission, caller-visible durable evidence and preserved accepted-run output. This can run independently once Q4/Q5 are settled.

A2. Issue “truthful unattended recovery” from #136/#137, one leaf for completed-turn accounting, bounded start-loss recovery, evidence retention and checked-run-aware redispatch. These share dispatchSlot and one counter contract, so splitting them invites conflicting state semantics. Tests should cover repeated wakes, replaced addresses, active commands and restart persistence.

A3. Same recovery issue, separate leaf for PATH-independent listener child launch. Independently checkable and parallel with A1/A2. No dependency on finding the old seat killer.

A4. Issue “routine unattended prompts” from #135, one leaf after residual prompt behavior and authority are demonstrated. Instruction correction and targeted observation precede any confirmer. It runs alongside A1/A2/A3. Any outside harness configuration stays an explicit needs row. The unknown seat killer is investigation fog or Off route once attributed, not a guessed prerequisite for accounting.

External observations before handoff

E1. Already free and observed here: akrogon config, claude --help, codex --help and pi --help. These establish current recipe/flag surfaces only, not real dialog handling. Actual prompted process settings still need comparison without changing the process.

E2. Already free and observed here: hc get own-terminal --json, hc get --help and hc keys --help. Metadata supplies state/status/turn; keys accepts named keys. A permission/question screen and successful response remain unobserved. Only an isolated harness probe under N1 can prove that part. No keys were sent.

E3. For restart semantics, the smallest existing free call is bun test tests/next.test.ts -t 'a finished seat restarts with its task'. For live command tracking, use bun test tests/run-check.test.ts -t 'run-check writes .owner'. These are existing fixture surfaces, not proofs of the proposed changes. Extend them for loss before a turn, repeated wakes and a fake slow command crossing phase failure. No tests were run during this read-only map.

E4. For listener self-launch, the existing free surface is bun test tests/hc-listener.test.ts -t 'startup pulls and resumes'. Extend its stand-ins with a child environment whose PATH omits akrogon while the chosen launcher remains reachable. Also preserve its existing self-update test. No shared systemd or hc restart is required.

Fog

G1. The two vanished boot seats' original exit cause is not recoverable from the inspected logs. Root-cause repair outside accounting cannot yet be stated responsibly. Retain exit/signal/screen evidence before teardown so a recurrence can settle it.

G2. No real residual permission/question screen under today's effective templates was observed. Therefore harness-specific confirming keys, a supported harness matrix and whether N2 is required remain unsettled. A generic “safe prompt” matcher is not a handoff-ready design.
