# Opening map, slot C: unattended-runs

Signposts taken as given: `1a 2a 3a 4a 5a 6a 7a`.

## 1. Root causes

### #135 watch cannot confirm in-tab prompts

R135-1. No actor owns a blocked seat. hc already reports it: `Seen.status` is `{state, kind, msg}` in src/hc.ts, and src/seat.ts `agyTask` reads `state=blocked kind=permission` today. But src/listen.ts `onLine` only enqueues a wake, src/next.ts `dispatchSlot` returns for any seat not idle or done, and `observeBusy` only writes a busy notice after `STALL_MS` (1h). The watch skill Judge has Waiting (idle or absent) and Busy (working, judged from logs). Blocked is neither. scripts/observe.ts `statusWord` prints the state word but drops `kind` and `msg`, and prints a log path only for `working`. Sure, from code.

R135-2. The skill forbids the act. Never list: "Answer a seat." Combined with R135-1, the watch can at most `hc read` and report. Sure.

R135-3. Launched seats should rarely show permission prompts at all. The machine harness templates in ~/.akrogon/config.yaml (read via `akrogon config`, applied by src/seat.ts `harnessArgv`) launch claude with `--dangerously-skip-permissions`, codex with `-a never -s danger-full-access`, agy with `--mode auto`, and pi excluding the `request_user_input` tool. Remaining seat blockers are question tools (claude AskUserQuestion runs under skip-permissions) and template leakage such as the agy first-task permission prompt that `agyTask` already answers with one enter. Sure for the templates. Medium on which class the two observed tabs were, because the report does not name the harness or whether the tab was a launched seat or an operator started door.

R135-4. Doors are invisible to the watch. observe.ts lists leaf seats only. An operator started door has no leaf line, so a door prompt cannot be seen, let alone confirmed. Sure.

R135-5. The classifier denial hits the watch itself, which is an operator started Claude session outside the seat templates. Nothing in akrogon code sits in that path. Medium, from the report only, needs E5 to confirm which calls it blocks.

### #136 run-check launches for a leaf in failed

R136-1. Attempts are counted at delivery, not at turn end. src/next.ts `dispatchSlot` inner `deliver` adds 1 when `send` starts, and src/seat.ts `startSeat` adds 1 on a confirmed first task. The fail move at the end of `dispatchSlot` fires when the seat turn has moved past `prompted.turn` and `attempts >= 3`. So a seat that ends its turn to wait on a background run gets re-prompted, ends again fast, and fails in about 30 seconds. Framework log.jsonl confirms attempts A=3 at the failed move (21:36:56Z). Sure.

R136-2. The controller never checks for a live run before re-prompting or failing. src/admission.ts `liveRuns` already returns live run-check records with repo, leaf, check name and caller scope. `dispatchSlot` does not read them. The slow capture in the report was itself a run-check run, so it was visible in principle the whole time. Sure.

R136-3. run-check has no phase guard and no paid concept. src/run-check.ts `leafFields` copies `state.phase` into the timing record only. `checkedRun` guards are `ownerRefusal` (owner folder closed, closing or gone) and admission in src/admission.ts `withAdmission`, which is concurrency registration only. Grants are checked at leaf readiness in src/readiness.ts, never per run. Any argv runs in any phase. Sure.

R136-4. Nothing tells the seat the leaf failed. The fail move writes state and a notice. The live seat keeps its turn loop and only learns from its next phase reading command, which its run-check launches never do. Sure.

### #137 reboot resume triple start

R137-1. Each external seat death becomes a fresh start plus one attempt. src/listen.ts `onLine` enqueues `next --wake` on finished and lost events. `dispatchSlot` ends a finished seat via src/hc.ts `end` (kill plus rm, evidence gone) and calls `startSeat`. `firstTask` counts a seat confirmed when status goes working or the turn moves, which a Claude process mid first API request satisfies. `startSeat` then records attempts +1. Framework timings.jsonl shows three delivered prompt rows at 09:30:55Z, 09:31:13Z, 09:31:27Z. Sure for the chain.

R137-2. What killed the first two seats is unknown. Scopes ended with no Stopping line and the leaf slice was removed at 10:31:25 local. `CollectMode=inactive-or-failed` in `startSeat` erases the unit record, and `end` removes the terminal. No exit evidence survives by design. Not sure, and not settleable from what is kept.

R137-3. The boot PATH crash is separate and in akrogon. src/listen.ts `runPasses` spawns passes as bare `akrogon` while systemd/akrogon-listener.service starts the listener by absolute path `%h/.local/bin/akrogon`. Journal confirms `Executable not found in $PATH: "akrogon"` at 10:29:49, then success after the systemd restart 2s later. Sure.

R137-4. Boot context: the first resume pass also failed at 10:30:17 with "no running session holds it" for this leaf, because the hc session was not up yet. Harmless here due to retry, but boot passes run before the session exists. Sure, from journal.

## 2. Material forks

F1. Where is a no-report turn counted? (mechanism under signpost 4a)
- a. Count once, in `dispatchSlot`, when the seat turn has moved past `prompted.turn` and the slot is not done. Remove the +1 in `deliver` and the +1 in `startSeat`.
- b. Keep both delivery increments and stop counting starts only.
- Pick a. One counting point makes the failure reason true and removes the whole class of starts, resumes and redeliveries spending the budget.
- Breaks or invites: a seat whose turn never moves never fails by attempts, so the F5 start bound and the busy notice carry that case. Turn counter meaning is harness supplied and already load bearing in `prompted.turn` logic today, so no new trust is added.

F2. Turn ends while the leaf has a live run-check run: count it?
- a. No. `dispatchSlot` checks `liveRuns` for this repo and leaf (caller scope match where present) before delivering or counting. A live run means skip this pass entirely.
- b. Time grace after each delivery before any fail.
- c. Nothing in code. Rely on the implement-issue proof order foreground rule.
- Pick a. It uses records the code already keeps and removes the reported class, because the slow command was a run-check run.
- Breaks or invites: a hung run parks the leaf with an idle seat and no notice path, since `observeBusy` needs a working or blocked seat. Plain background commands outside run-check stay invisible and stay the skill rule's problem. A run by slot B could grace silent slot A unless the scope match holds.

F3. Phase guard in run-check?
- a. Refuse in `checkedRun` when the target is a leaf or worker scope and the leaf phase is `failed`, checked early and late following the `ownerRefusal` pattern. Error names the phase and the recovery step. Checkout and holder scope untouched.
- b. Refuse for `failed`, `merged` and `parked` alike.
- c. No guard. F1 plus F2 only.
- Pick a. `failed` is the one phase where the seat is definitionally not the actor anymore, and the seat reads the CLI error in its own tool result, which satisfies signpost 5a.
- Breaks or invites: an operator diagnosing inside a failed leaf worktree loses run-check there and must run the plain command or use a holder from elsewhere, so the error text must say so. `verify` also calls `checkedRun` with a leaf caller (src/verify.ts), so any flow that verifies a failed leaf before its recovery phase move would break and must be checked at planning. Phase lists in guards tend to grow, which argues for the smallest list now.

F4. Stop in-flight runs when a leaf moves to failed?
- a. Leave them. The spend is mostly sunk and the result may serve the recovery.
- b. The fail move stops the leaf runs through admission cancellation.
- Pick a. In the reported case the first capture finished and the leaf recovered 12 minutes later and merged the same night. Killing invites paying twice after recovery.
- Invites: a long paid run keeps spending after failed. Bounded by the run itself and acceptable next to F3 stopping new launches.

F5. The separate start bound signpost 4a requires: where does it live?
- a. A small starts record in state (count plus window start per slot), reset by the same phase move that resets attempts in src/phase.ts. Past the bound, `dispatchSlot` skips the start and writes one notice.
- b. Derive starts per window from timings.jsonl prompt rows at dispatch time.
- c. Listener debounce on finished and lost wakes.
- Pick a. It sits next to attempts, resets with attempts, and is testable without turning a metrics log into a control input.
- Breaks or invites: state schema grows and must prefault for open leaves in every repo (the `counts.prefault` pattern in src/state.ts covers this). The window and bound are judgement values that will need field evidence. Notice spam needs the same once-only pattern as `busy_notified`. Same leaf should also record a lost seat screen tail before `end` removes the terminal, into the existing `delivery_error` shape, so the next R137-2 has evidence.

F6. Listener self spawn without PATH.
- a. Spawn passes through the listener's own resolved executable path instead of the bare name `akrogon`.
- b. Add a PATH Environment line to systemd/akrogon-listener.service.
- Pick a. Self reference cannot drift from what systemd started, and it removes the class for any future bare name pass.
- Breaks or invites: a listener started from a dev checkout would then spawn checkout passes instead of the installed command. That is arguably more honest, but it changes a current implicit behavior and must be a stated pick at planning.

F7. Question tools in launched seats.
- a. Remove them where the harness allows. Machine template text under needs N2: claude gains `--disallowedTools AskUserQuestion` (flag confirmed in `claude --help`), matching pi excluding `request_user_input`. A seat that needs a decision already has the designed path: `phase failed` with cause `blocked` in src/state.ts.
- b. Keep question tools and let the watch answer safe ones.
- Pick a. This is the removal signpost 1a points at. A seat question is a new decision under signpost 3a, so no watcher may answer it anyway, and the blocked failure path already records it durably instead of as a dialog on a screen.
- Breaks or invites: seats lose a quick clarification channel and will fail blocked more often, which costs a recovery cycle but leaves a record. Template text is machine config, so it lands by operator hand under 2a and other machines keep the old behavior.

F8. Who acts on a remaining blocked seat (permission kind)?
- a. The controller. In the `dispatchSlot` blocked case, for `kind=permission` on a launched leaf seat only, send one enter via hc keys (the `agyTask` precedent), and write a timing row plus a notice. Question kind and anything unreadable: notice with prompt text, no keys.
- b. The watch skill gains a Blocked judge class, reads the screen, and keys the answer.
- c. Notify only, with the prompt text in the notice.
- Pick a plus c as its fallback, after E2 and E3 probes. The controller path has no LLM classifier in it, reacts on the listener wake instead of a 20 minute cron, and permission prompts on seats launched under skip-permissions templates are template leakage over an action the seat already decided. Pick c over a if the probes show enter does not reliably mean yes.
- Breaks or invites: auto release becomes expected behavior and the operator reviews records after the fact, which is why every release writes a notice. A permission prompt raised by some other gate over a destructive tool would be released without a danger read, mitigated only by the fact that the template already granted that tool. Doors stay out under every option (R135-4).

F9. Watch visibility for blocked, whichever F8 wins.
- a. observe.ts prints `kind` and a short `msg` for blocked seats plus a log path like working seats, and the skill gains a Blocked judge row that notifies once with prompt text from `hc read`.
- Pick a under all F8 options. Today blocked falls through every rule and the first signal is a generic busy notice after 1h.
- Breaks or invites: observe line format is a stated stable format, so new fields go at the end of the seat field. Skill tests for observe output change with it.

## 3. Practitioner questions and lifetime pitfalls

Q1. Rollout state. Leaves already open in other repos carry attempts counted under the old rule. A framework leaf at attempts=3 from starts alone would fail on its next turn end under F1. Does the leaf reset attempts at install, or does planning accept the residue until the next phase move resets it in src/phase.ts?

Q2. Hung run under F2. `checkedRun` has no deadline of its own. What notices a leaf whose run hangs for hours while its seat sits idle? Nothing today. The F2 leaf needs an answer or a stated limit.

Q3. Verify on failed. Does any recovery, merge or batch flow call `akrogon verify` while the leaf is still `failed`? That decides whether F3 needs a verify carve out, and the answer is a grep plus one flow read at planning, not a guess.

Q4. Scope matching in F2. `callerScope` can be empty for runs started outside a seat scope. When scope is empty, does leaf-only matching grace the wrong slot in check.review where A and B both act?

Q5. Metrics break. F1 changes what attempts means in state, log.jsonl and observe output. Anything reading attempts as deliveries (learnings, watch reporting) silently changes meaning. Acceptable, but state it in the leaf so later comparisons know the seam date.

Q6. Notification load. F5, F8 and F9 each add notices. Busy, failed and blocked notices for one bad night could stack. Once-only flags per class, following `busy_notified`, keep the operator morning queue readable.

Q7. Classifier reach. The watch Busy rule already sends `hc send` corrective prompts and `hc keys esc`. Has the classifier ever denied those, or only prompt answers? E5 decides whether the existing rule is quietly broken too.

Q8. Template drift. F7 and the F8 safety argument both rest on machine templates the repo does not own. If a template loses skip-permissions later, F8 starts releasing real permission decisions. A cheap guard is `harnessArgv` recording the resolved template in the seat record, but that is new surface and only worth it if F8 lands.

## 4. Proposed split

Issue 1: attempts and failed state (signpost order 7a, first).
- Leaf 1 `attempts-count-turns`: F1 plus F2. Files: src/next.ts (`dispatchSlot`, `deliver`), src/seat.ts (`startSeat` record), src/admission.ts read only. The counting change and the live run skip are one leaf because both decide what a turn end means in the same function.
- Leaf 2 `run-check-refuse-failed`: F3, with F4 pick recorded. Files: src/run-check.ts (`leafTarget`, `checkedRun`) plus src/verify.ts only if Q3 forces a carve out. File disjoint from Leaf 1, so it can run in parallel with it. No real dependency.
- Leaf 3 `restart-bound`: F5 plus lost seat screen record. Files: src/state.ts, src/phase.ts reset, src/next.ts start path. Blocked by Leaf 1, a real dependency: both edit `dispatchSlot`, and starting free under F1 is only safe once this bound exists. Order Leaf 1 and Leaf 3 close together so the unbounded window is short.
- Leaf 4 `listener-self-spawn`: F6. File: src/listen.ts only. Parallel with everything. This places the PATH crash the signposts owed.

Issue 2: blocked prompts (#135).
- Leaf 5 `blocked-visibility`: F9. Files: skills/watch-issues/scripts/observe.ts, skills/watch-issues/SKILL.md Judge section, observe tests under skills/watch-issues/scripts. Parallel with Issue 1 (no shared files). Value lands even if F8 later picks notify only.
- Leaf 6 `permission-release`: F8. Files: src/next.ts blocked branch, src/hc.ts keys use, notice path. Blocked by Leaf 1 on file region inside `dispatchSlot`, and blocked by probes E2 and E3 under needs N1. Blocked by nothing in Leaf 5, but the notice text should match Leaf 5 wording, so sequence after Leaf 5 if both are cheap.
- Not a leaf: F7 template text goes out as a chart supplied N2 needs row, plus one doc line where seat templates are described, if such a place exists.

Parallel summary: Leaves 1, 2, 4 and 5 can start together. Leaf 3 waits on Leaf 1. Leaf 6 waits on Leaf 1 and the N1 probes.

## 5. External operations needing a real observation

E1. Live status shapes now. Smallest free call, done while mapping: `hc ls --json` shows `status` as a plain word (idle) in the list view. The `{state, kind, msg}` object in `Seen` comes from the follow stream and `hc get`. Before Leaf 5 planning, run `hc get --json <a live seat>` once, free, to confirm which fields `hc get` exposes for kind and msg.

E2. Claude seat under the real template: does AskUserQuestion report `blocked` with a question kind and usable msg, or `working` with a running tool? Needs one throwaway haiku session under N1 told to call AskUserQuestion once, observed with `hc get --json` and `hc read`, then killed. Free pre-check done: `claude --help` confirms `--disallowedTools` exists.

E3. Claude and agy permission dialogs: does one `hc keys <addr> enter` select yes, and what does the screen show before? Agy is proven in code by `agyTask`. Claude under skip-permissions may never show one, so the probe runs claude without the flag on a throwaway terminal under the same N1 session bound. `hc keys --help` confirms named keys, free, done.

E4. Codex prompt surface under `-a never`. Free call first: `codex --help` shows approval and sandbox flags only. A paid probe is owed only if planning claims codex coverage in Leaf 6. Until then codex is notify only, matching the watch Busy rule treatment.

E5. Classifier behavior on the watch's own calls. Smallest call: in a throwaway Claude session under N1, attempt one `hc keys` enter against the E3 probe terminal and record allowed or denied. This decides whether F8 option b was ever viable and answers Q7. No probe touches a real seat or door.

E6. Pi coverage claim. Free: `pi --help` confirms `--exclude-tools` and shows `-a` means trust project files, not tool approval. Pi has no confirmed prompt screen in this map, so Leaf 6 claims nothing for pi until a probe shows one.

## 6. Fog

G1. The seat killer at boot. Herdr layout restore, hc, or the slice removal at 10:31:25 all fit and none is evidenced. No fix question can be stated until Leaf 3 evidence keeping catches a case. Protection plus evidence is the whole current answer.

G2. Doors. Whether operator started doors belong in any watch or controller remit at all cannot be stated as a work question yet. They have no leaf, no brief to judge danger against, and no observation surface. Likely Off route with a stated limit, but that is a chart pick, not a map finding.

G3. Blocked kinds beyond agy permission. The full kind vocabulary hc emits (question, permission, others) and what `msg` carries per harness is unknown until E2 and E3. F8 and F9 field design both depend on it.

G4. Paid-ness of a run-check argv has no signal in code. If a later need wants to guard only paid launches in failed, the question cannot be stated until something names which run names or commands cost money per repo.

G5. Background commands outside run-check. A seat ending its turn over a plain background shell job is invisible to admission records. Whether hc or harness status exposes a pending background task per seat is uninspected, so that half of the #136 class has no stated code question, only the skill foreground rule.
