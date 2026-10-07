# Slot B leaf review

Draft paths below are relative to `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/1ce71920-4c64-414b-ac1c-af56890a1c4b/scratchpad/handoff/chart-door-cost/`.

D1. Settle the held prompt-path choice: the brief alone carries the return path. This changes my earlier preference. A single authoritative task file is sufficient when the prompt explicitly instructs the peer to follow it, and avoids two return-path copies disagreeing. The recorded operation proves this form worked on both harnesses (`issues/chart/chart-cost/forks/peer-packet.md:41-45`). Make the corresponding existing skill sentence change explicit so the implementer does not leave a contradiction (`skills/chart-issues/assets/questions.md:46`).

Replace `peer-notes-single-writing/design.md:80` with:
> Settled prompt-path choice: the brief alone carries the exact absolute return path. The one-line prompt names the brief's absolute path and slot letter and tells the peer to follow the brief. In questions.md replace “Every peer prompt gives the exact output path.” with “Every peer brief gives the exact absolute output path.” Do not repeat the return path in the prompt. The existing confirmed-start and fresh-return-path rules remain.

R1. Settle restatement counting by A's semantic classification, not a configured alias-word matcher. But adding one for each restated fork counts rounds, not requests, and loses multiple requests for one round or requests before a held/closed chart receives an answer. Evidence: `chart-usage-table/brief.md:12,17`, `design.md:16,64`, and the adopted requirement “count of restatement requests” at `issues/chart/chart-cost/forks/proof-of-saving.md:33,39`.

Replace the restatement-count clause of brief criterion 8 and the held-choice paragraphs at design lines 16 and 64 with:
> A classifies restatement requests by meaning. When a request arrives, A records its operator-message timestamp in the current fork file, including requests made before an answer or before the chart is held or closed. Before each report A sets seats.yaml restatements to the number of distinct recorded request timestamps. Multiple requests for one round count separately. Re-recording an answer does not increment the count. No alias vocabulary or exact-message matcher is added.

R2. The capture contract must preserve the chart's actual beginning, not the later folder-creation time, and must not label the first turn of a restarted session as another opening map. Evidence: `chart-usage-table/brief.md:10-12`, `design.md:9-10,48,57`; the map is produced before chart folders exist under `skills/chart-issues/assets/questions.md:46`. Otherwise the principal expensive stage can be omitted or misidentified.

Replace the opening-time wording in brief criterion 1 and design's seat-record description with:
> opened is the timestamp of the operator message that begins this chart's work, including its opening map. A retains that timestamp and the initial seat/session records in temporary files before the chart folder exists, then transfers them to seats.yaml. Folder creation does not reset opened. Adding a replacement session does not reset it either.

Replace “the seat's first turn (the map turn) on its own row” in brief criterion 3 with:
> the first turn attributable to that seat's opening map on its own row, labelled opening-map turn; later replacement sessions do not create additional map rows. If that turn cannot be identified or the map spans more than one turn, report that limitation rather than representing a first-turn number as the complete map cost.

R3. Turn timing and operator-wait arithmetic lack sufficient boundaries for exact fulfillment. Claude reference counts are assistant messages, while the table asks for turns. The design only defines working time as first-to-last record “of the turn,” without defining Claude turns or what happens when operator messages arrive during work. Evidence: `chart-usage-table/brief.md:12`, `design.md:23-26,59-60`. Summed overlapping operator intervals would overstate wait. Tool-result user records are already recognized as non-operator messages at design line 59.

Replace design's counting/timing sentence at line 60 with:
> Token counting follows the reference method. Report Claude assistant-message counts separately from conversational turns. A Claude turn begins with a genuine user task message, excluding tool results and harness-generated summaries/context messages, and ends with the final assistant response for that task. Codex turns use task_started/task_complete. Missing completion produces an explicitly incomplete duration, not an invented end. For each genuine operator message in A's transcript, report time to the final response that answers it; when that association is ambiguous, mark that interval unmeasured. Total operator wait is the union of the measured intervals, clipped to the chart window, never their overlapping sum. State these timing definitions in USAGE.md.

Add to brief criterion 5:
> Timing fixtures cover two operator messages received during one working interval, excluded tool-result and harness-generated messages, and an unfinished turn. The total wait does not double-count overlapping intervals, and unfinished or ambiguous durations are labelled explicitly.

R4. The adopted dollar limitation exists only in the design, while the brief promises the operator can see whether charts got cheaper. The emitted table and guide need the limitation, especially after model changes. Evidence: `chart-usage-table/brief.md:4,12-13`, `design.md:19`, and `issues/chart/chart-cost/forks/proof-of-saving.md:42`.

Add to brief criterion 3:
> USAGE.md and the chart guide state that chart-window tokens and minutes show usage and elapsed-time changes, not that dollar cost fell. Any ended-session dollar total is labelled whole-session, may include other charts and is not used as this chart's cost or saving.

R5. The note-definition decision includes a requirement omitted from the actionable criteria: fork briefs should refer to the canonical definition rather than restating five parts. Evidence: `peer-notes-single-writing/design.md:14` copies the binding decision, and `issues/chart/chart-cost/forks/cut-boundary.md:31` records it. Criterion 5 at `peer-notes-single-writing/brief.md:14` specifies task transport but leaves this obligation unstated.

Add to brief criterion 5:
> A fork-notes brief points to the five-part note definition in questions.md instead of duplicating that definition. It still supplies the current task, permitted context and exact return path. Other exchange kinds retain their own instructions.

R6. The usage leaf's brief says “Every figure needed is already in the transcripts,” although the design explicitly excludes requested draft-writing figures and uses A's classification for restatements. This overstates the implementable outcome and should not make the implementer invent missing telemetry. Evidence: `chart-usage-table/brief.md:7`, `design.md:16,37`, and `issues/chart/chart-cost/forks/handoff-script.md:35`.

Replace the last two sentences of chart-usage-table brief Why with:
> Transcripts provide the usage and timing records this leaf reports. The chart-to-session link and A's semantic restatement record must be captured separately. This leaf does not measure characters of leaf files written before and after review, grade quality or establish dollar savings.
