# Territory map, seat C, chart door-cost, 2026-10-26

Scope held: O1b, O8, O4 only. No prose caps. Every blind step stays. One leaf edits the skill files.

Evidence basis for all picks below, stated once: `operator` = INTAKE.md locks and study findings F1 to F5 (2026-10-26). `better-than-training` = inspected live code and skill text (SKILL.md sections Open, Drain, Handoff, Autopilot, Printed footer; questions.md section Blind peer exchange; shapes.md Chart records; door-reset.ts; peer-create.ts; door-reset.test.ts), read 2026-10-26, and past CHART.md records by their dates. No outside practitioner source beats this repo's own code for these three mechanisms, so none is cited.

## O1b: attended handover to a fresh A at chart switches

### 1-Q1. What counts as a chart switch in attended mode?

Pick: exactly the Drain move-on points. The current chart hands off, closes, is held, or waits on an asynchronous approval, need or human prerequisite, and Drain names a next chart. Old A applies the Drain order, names that chart, then resets. Cost: old A spends one short turn end doing the selection it would do anyway.
Rejected: fresh A re-runs selection after reset. It repeats Open work (pull, grounding, import checks) at the 61k fresh baseline and can pick a different chart than the operator just heard about. Rejected: reset also when the operator names a different chart mid-pass. That is mid-chart by the lock's plain reading, and the outgoing chart's records may not be written yet.
Evidence: better-than-training, SKILL.md Drain move-on rule and Autopilot handover paragraph, read 2026-10-26. Autopilot already defines handover as "only when switching to the next runnable handed chart, after the outgoing chart's records are written and its span closed".
Pitfall: a presented round or handoff review looks like a wait but is not one (Drain says so). Resetting there wipes the session that must receive the operator's answer. Removed by tying the trigger to the Drain list verbatim, not to "A is idle".

### 1-Q2. How does fresh A prove it should resume, and in which mode?

Pick: reuse the autopilot record shape with a different resume word. Old A appends a `handover` entry to the next chart's Mode record (creating folder, INTAKE.md and CHART.md when absent, as autopilot does). The start prompt names A's pane, handover time, next chart folder and skill path. Fresh A continues only when the prompt matches the latest handover entry, appends its own continue entry, and starts attended. It never appends `continue autopilot` and answers nothing itself. Cost: shapes.md Mode record stops being autopilot-only, one new entry form to document.
Rejected: start prompt alone, no record. A stale or re-sent prompt can point fresh A at a chart another door has since taken, with nothing on disk to check against. Rejected: reuse `continue autopilot (handover <time>)` unchanged. The next reader (human or script) cannot tell mode from the record, and Autopilot says a different session id starts attended until the operator says continue. Rejected: a new separate handover file per chart. The Mode record already carries time, pane and session id for exactly this check.
Evidence: better-than-training, shapes.md Chart records ("Under autopilot the CHART.md carries ## Mode record"), SKILL.md Autopilot mode-change rule, read 2026-10-26. Better-than-training, issues/chart/config-walls/CHART.md and orphan-pane/CHART.md: two live autopilot handovers on 2026-10-22 completed with this record-and-match shape.
Pitfall: attended charts today may have no Mode record at all. Fresh A that requires one and finds none must start attended on no chart, not guess. Removed by stating the no-match outcome once: no match means attended, no chart entered, operator decides.

### 1-Q3. What passes to fresh A besides the chart folder: peers, seats, spans?

Pick: the start prompt names the surviving consultants by seat and pane, as the autopilot handover line does (`consultants <surviving>`). Fresh A restarts them at chart entry under the existing Open rule, defers seats.yaml creation for a folder old A just created (autopilot already overrides Open this way), and opens its first span at entry. Existing charts keep their original opened time. Cost: none new; this copies three sentences of autopilot behavior into the attended path or lifts them into a shared handover paragraph.
Rejected: old A restarts consultants before resetting itself. If the reset then fails, the consultants were wiped for nothing and old A continues with blind peers who lost the chart they were mid-exchange on. Rejected: fresh A infers peers from seats.yaml only. A brand-new chart folder has no seats.yaml yet by the deferral rule.
Evidence: better-than-training, SKILL.md Open consultant-restart paragraph, Autopilot seats deferral paragraph, shapes.md Chart records seat record, read 2026-10-26.
Pitfall: consultant restart is only legal after every prompted exchange is collected (Open). Old A must close the outgoing span under the same condition, so a handover can never strand an open peer turn. Removed by stating the collection precondition in the handover step itself, not by reference alone.

### 1-Q4. What happens when the reset cannot run or fails?

Pick: same fallbacks as autopilot, stated for attended. Unsupported A kind (not claude, codex, pi) or outside herdr: same-session behavior, no reset attempted, no operator question. door-reset.ts refused or failed after queueing: the log is the record; old A's turn has ended, so the failure surfaces when the operator next speaks and finds old A still holding context, and the Printed footer already says handover was queued, not done. Cost: a failed reset costs the operator one confused turn. That is the weakest point of O1b and the chart should price it honestly.
Rejected: old A waits to confirm the reset before ending its turn. door-reset.ts is built detached precisely because the reset kills A's own turn; waiting cannot work. Rejected: a new watcher that reports reset failure. Adds machinery to save tokens.
Evidence: better-than-training, door-reset.ts (kinds claude, codex, pi; refusal on identity mismatch; detached child writes only to the log; 600s turn bound, 60s confirm), door-reset.test.ts (every failure path logs and sends nothing further), read 2026-10-26.
Pitfall: the detached child waits for A's turn to end for up to 600s. If the operator starts a new conversation with old A in that window, the reset can still fire after that turn ends and wipe a session the operator is now using. Nothing in door-reset.ts distinguishes "the turn that queued me" from a later turn in the same session. Removed only by a leaf-level choice: either accept and document it (footer warns handover is queued), or the leaf gives door-reset.ts a turn marker. This is the one place O1b may need a script change, and the chart should decide it, not the leaf.
Pitfall: reset thrash. If Drain bounces A to chart X, then back to a waiting chart Y in the same pass, each switch pays a fresh 61k baseline plus re-reads. Two short charts can cost more than one carried session. Removed by nothing in the current lock; see Unasked.

### 1-Q5. Does O1b change door-reset.ts at all?

Pick: no script change unless 1-Q4's turn-marker pitfall is taken. The script is mode-blind: pane, session, log, start prompt. All mode meaning lives in the prose and the start prompt text. Cost: door-reset.test.ts needs at most new wording checks, since its docs test asserts SKILL.md and shapes.md contain the handover entries and footer wording.
Rejected: adding an attended flag to door-reset.ts. The script would gain a mode it cannot act on differently.
Evidence: better-than-training, door-reset.ts argument list and door-reset.test.ts docs test, read 2026-10-26.
Pitfall: two places will now describe handover (Autopilot section and the new attended text). Wording drift between them is how this skill has broken before. Removed by writing the shared mechanics once and having both modes name only their differences: trigger list, resume word, who chooses the next chart.

## O8: seat C defaults to pi when the door creates peers

### 8-Q1. Where does the default apply?

Pick: only on the peer-create path, only for the seat lettered C, only when the operator names no kind for it. Supplied panes are used as given and stay untouched. B and D and later seats are still asked once. The first reply names C as pi so the operator sees the default was taken. Cost: one operator question saved per door open that creates three or more seats; nothing saved when panes are supplied, which is the common case in the seat records I sampled.
Rejected: default every created seat to pi. The lock names C only, and B's kind is the seat the operator most often varies (chart-cost peer-effort fork, 2026-10-06). Rejected: apply the default to a supplied C pane by restarting it as pi. The skill forbids moving or altering supplied panes.
Evidence: operator, INTAKE.md O8 context (C on pi since 2026-10-17 with two named exceptions), 2026-10-26. Better-than-training, SKILL.md Open and questions.md Blind peer exchange peer-create paragraphs (identical text in both files), read 2026-10-26.

### 8-Q2. What are C's default arguments?

Pick: kind pi with empty argv, `{"seat":"C","kind":"pi","argv":[]}`, unless the operator names arguments. Asking "kind is pi, now what arguments" spends the turn O8 exists to save. Cost: if the operator's pi practice relies on launch arguments (model, system prompt), the default C is a plainer pi than they run by hand. They can still name arguments and override.
Rejected: default the kind but still ask arguments. Saves half a question and keeps the interruption. Rejected: hard-code a remembered argv from past launches. No surface I read records a standing C argv; peer-create.test.ts uses argv examples, not a default (read 2026-10-26). Inventing one bakes today's model choice into the skill.
Evidence: better-than-training, peer-create.ts (argv passes straight to `herdr agent start`), SKILL.md Open ("asking once for each created peer's harness kind and arguments"), read 2026-10-26. Operator, chart-cost cut-boundary fork (2026-10-06): "we are not hard coding into the Akrogon system any models". O8 hard-codes a harness, not a model; argv is where a model would sneak in, so empty argv keeps O8 inside that older lock.
Pitfall: peer-restart.ts restarts consultants with the same kind and argv at every chart entry. A wrong default argv repeats all session. Empty argv is the only default that cannot be wrong in that way.
Pitfall, lifetime: pi C plus pi A plus pi B is three seats of one harness, and blind diversity is the reason three seats exist (INTAKE F4, every step earns its place). The lock says pi unless the operator names another, with no exception for a pi A. Removed by nothing; flagged in Unasked rather than quietly widened.

### 8-Q3. What does O8 supersede, and where must the text change?

Pick: record that O8 replaces, for created C seats only, the chart-cost outcome "slot C's model is operator practice at pane start" (2026-10-06). Change both copies of the peer-create paragraph: SKILL.md Open and questions.md Blind peer exchange. They are near-identical today; changing one creates two rules. Cost: none beyond the edit.
Rejected: state the default once and make the other file point to it. Tempting, but it rewrites the relationship between the two files, which is outside this leaf's outcome. Keep the duplication, change both.
Evidence: better-than-training, issues/chart/chart-cost/CHART.md Forks taken (cut-boundary) and forks/cut-boundary.md, 2026-10-06; both peer-create paragraphs, read 2026-10-26.
Pitfall: a mixed open, B supplied and the operator asking the door to "add a C", fits neither paragraph cleanly today (creation assumes no panes named). O8's text should not pretend to settle it. State the default under the existing create condition only.

## O4: one round's corrections go into a single final-shape check

### 4-Q1. What is batched, exactly?

Pick: all mechanism or contract corrections from one operator reply to one presented round, for one fork, go into one proposed final shape. Each named peer gets one focused check of that shape before A records any of those corrections. A records nothing from the reply until the checks return, except restatements, which stay exempt. Cost: recording waits on peers once per reply instead of once per correction. Wall time saved is the repeat waits (INTAKE F3: 37% of chart wall time is A waiting on peers).
Rejected: batch across forks in the same reply. Corrections to two forks have separate final shapes and separate fork files; one brief would make peers check two contracts in one return and blur which check passed. Rejected: batch across separate operator replies by delaying. That suppresses recording to save a trip and stalls the reshape step Take requires after each answer.
Evidence: better-than-training, SKILL.md Take ("checks the final shape once before recording a late mechanism or contract change, with restatements exempt") and questions.md Blind peer exchange ("When a later operator reply adds a mechanism or changes a contract, send each named peer the proposed final shape and correction for one focused check before A records it"), read 2026-10-26. Operator, INTAKE.md O4 context, 2026-10-26: batch compatible corrections; fresh research, rebuttal, and the changed-contract check keep their own triggers.

### 4-Q2. What does each peer receive: the whole shape or the corrections only?

Pick: the full proposed final shape with the round's corrections identifiable inside it. The failure batching invites is two corrections that are each fine and wrong together; only the whole shape lets a peer see the interaction. Cost: more tokens per check than a diff-only brief, partly eating O4's saving. The saving that survives is round trips, which is where F3 and F5 say the cost is (turns, not fork count).
Rejected: corrections list only. Cheapest, and blind to interactions, which is the new risk batching itself creates. Rejected: full shape with no marking. Peers re-review settled text and raise settled points again.
Evidence: operator, INTAKE.md F3 and F5, 2026-10-26. Better-than-training, past final-check practice: 126 final-check return files under issues/chart/*/slots/ as of 2026-10-26, so this step fires often enough for round trips to matter.
Pitfall: a peer disagreement on the batched shape must not start a check loop. Removed by one bound: A fixes or carries the disagreement into the record for the operator; a second check fires only if A's fix itself adds a mechanism or changes the contract again, which is a new correction under the existing trigger, not a re-run.

### 4-Q3. Which checks must never be folded into the batch?

Pick: three keep their own triggers, named in the leaf text: fresh research when an answer reshapes a question (Take), the one rebuttal against the merged notes (Blind peer exchange), and leaf review at Handoff. O4 changes only the final-shape step's grouping. "Every check still runs" also means every named peer gets the batched check, not one peer for the batch. Cost: none; this is a scope sentence.
Rejected: "one check per round" read as one peer message total covering rebuttal and final shape when both fall in one round. That would cut a step the lock says stays. Rejected: letting a correction that arrives during leaf writing ride the leaf review instead of a final-shape check. Handoff already covers drafts, but Take's rule is "before recording", and by leaf writing the decision is recorded.
Evidence: operator, INTAKE.md locks and F4 (final check substantive in 58 of 84 files, rebuttal 91 of 93, leaf review 101 of 108), 2026-10-26. Better-than-training, SKILL.md Take and Handoff, read 2026-10-26.
Pitfall: file naming. Current return names hold one final check per fork per peer (fork-name-final-check-B.md). A fork corrected in two rounds would reuse the name. Removed by the existing rule that a new exchange gets a new brief or a new return path (Blind peer exchange); the leaf only needs the batched brief to name its round so returns stay distinct.

## Shape of the leaf

### L-Q1. One leaf or three?

Pick: one leaf. All three changes edit SKILL.md; O8 and O4 also touch questions.md; O1b also touches shapes.md. Three leaves over the same files would serialize on file overlap for no gain. Cost: one bigger review. The three changes are independent in meaning, so the review can still judge each on its own.
Rejected: O1b separate because it might touch door-reset.ts. Only 1-Q4's turn-marker question can force that, and splitting before deciding it guesses the answer.
Evidence: better-than-training, the live surfaces list and file contents above, read 2026-10-26. Operator, INTAKE.md: one destination, route lifecycle, 2026-10-26.

### L-Q2. How is each change proven before handoff?

Pick: per change, the smallest real proof. O1b: one live attended handover on a throwaway pair of charts or a throwaway tab proving the fresh session starts attended, enters the named chart, and answers nothing itself; the autopilot handovers of 2026-10-22 prove the script, not the attended resume rule. O8: one peer-create run on a throwaway tab with C unspecified, showing C started as pi with empty argv, panes closed after. O4: prose only, proven by the next chart's records, not by a test; no mechanical check can prove grouping happened. Cost: two short throwaway-tab runs at charting.
Rejected: new tests asserting exact skill wording for all three. door-reset.test.ts already carries a docs test of that kind; extending it to whole sentences makes future prose edits fail for form, not function. Keep wording checks to the entry names scripts or records parse (handover entry, footer line).
Evidence: better-than-training, door-reset.test.ts docs test and issues/chart/door-handover/CHART.md live proof record (throwaway tabs, 2026-10-17), read 2026-10-26.

## Practitioner questions the chart should expect

- P1. What does a fresh A cost before it does useful work (61k baseline, grounding and LESSONS re-read, pull, status) and how long must the next chart be for O1b to break even against carried context at 120k to 150k per call? INTAKE F2 gives both numbers; nobody has divided them.
- P2. When the operator is sitting in the pane, is an automatic `/clear` of A's session ever a surprise they did not ask for in that moment? Autopilot reset happens with nobody watching by design. Attended reset happens in front of the person who may have wanted to ask old A one more thing about the chart just finished.
- P3. Does the operator's real pi launch for C carry arguments today, and if so, is empty argv a different consultant than the one whose track record justifies O8? The seats.yaml records kind and session, not argv, so the chart cannot answer this from files. Only the operator can.
- P4. How often does one operator reply actually carry two or more mechanism corrections to one fork? If the honest count is near zero, O4's saving is near zero and its only effect is the interaction risk in 4-Q2. The 126 final-check files prove frequency of checks, not of multi-correction replies.

## Questions the chart does not ask

- U1. Should O1b have a floor: no reset when the outgoing chart was A's first or only short chart this session, or when Drain is returning to a chart A left earlier in the same pass? The lock says "at chart switches only", which bounds where, not how often. Without a floor, switch-heavy passes can cost more than today.
- U2. After an attended handover, who owns the outgoing chart's loose ends that were in old A's head and never written (a promised seed close, a step on main)? Autopilot answers this with the mode record and handed list. Attended mode has no handed list, so anything not in CHART.md Pending steps or Fog is gone at reset. The leaf text should say the outgoing chart's records must be written before the reset is queued, in attended words, not only by copying the autopilot sentence.
- U3. Usage accounting: with A resetting per chart, seats.yaml gains one A entry per chart and spans already split per chart. Does chart-usage still attribute A correctly when one session now covers exactly one chart, and does the shared opening map still count once when fresh A opens the second chart cold? Nobody checks the measurement this whole chart is justified by.
- U4. If C defaults to pi and the operator later wants C as something else mid-session, is that a new pane, a restart with different argv (peer-restart preserves kind and argv), or next door open? The skill has no seat-kind change path, and O8 makes the question likelier, not rarer.
- U5. Expected saving is 10 to 25% of A cost (INTAKE). What measured number, over how many later charts, would make the operator revert O1b? Without a stated bar now, the change cannot fail later either.
