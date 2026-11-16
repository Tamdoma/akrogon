# Signposts angles, slot C

## 1. Angles A missed

Q1. Which prompts may the watch answer?
- a. Only yes or no confirmations of an action already in the seat brief and inside its grant.
- b. Option a plus AskUserQuestion dialogs where the brief plainly gives the answer.
- c. None. Detect, record and notify only.
- Recommended: a. A question dialog and a chart approval row ask for a new decision. A confirmation only releases a decided action. N11b in #135 is an approval row, so this line decides real cases.
- Steers: the Never list edit in watch-issues, the dangerous test, keys per harness, the confirmation record and the #135 done claim.

Q2. What counts as an attempt?
- a. Only an observed turn that ends without a report. Starts and resumes cost no attempt, and a separate cap bounds starts per leaf in a time window.
- b. A start counts only after evidence the seat ran a turn.
- c. Keep current counting and fix only the triple start cause in #137.
- Recommended: a. The code adds 1 on a confirmed fresh start in seat.ts and 1 on redelivery in next.ts. One counter now punishes reboot resumes, seats killed before a turn and turns ended over a background run.
- Steers: the fail move in next.ts, counting in seat.ts, tests for both #136 and #137 and whether those leaves can run apart.

Q3. What does entering failed do to a live seat and its launches?
- a. run-check refuses grant covered paid launches for the leaf. The seat runs on.
- b. Option a plus the seat gets told to stop and report at the move or the next pass.
- c. Refuse every leaf scoped run-check in failed, read only runs included.
- Recommended: b with the scope of a. A refusal alone leaves the seat spending model time and editing a failed leaf. Option c blocks diagnosis and recovery checks.
- Steers: guard scope in run-check, behavior at the failed move, which phases count as wrong for a launch and proof design for #136.

Q4. How does the chart treat the unknown seat killer in #137?
- a. Cause free protection now. Seats dying before a turn burn no attempts, fast restarts hit a cap and terminal exit evidence is kept before removal.
- b. Diagnose first with an operator reboot repro and hc and herdr logs, then fix the found cause.
- c. Keep evidence only and wait for the next case.
- Recommended: a. The cause may sit in hc or herdr and may not recur on demand. The protection is testable locally now.
- Steers: leaf type for #137, needs rows and whether the chart waits on an outside cause.

Q5. What if the only working fix sits outside akrogon?
- a. The chart outcome includes the exact operator applied outside change. The leaf counts as done only after that change is applied and proven live.
- b. Record it as Off route and call the akrogon part done.
- c. Avoid the need and cut #135 to detect and notify.
- Recommended: a for the Claude permission rule behind #135. Skill text alone does not beat the reported classifier denial.
- Steers: done tests, the needs sheet and the honest scope of the #135 leaf.

Q6. Refuse or continue, split by harm?
- a. Refuse loudly for paid or destructive acts. For recoverable resume states, continue with no penalty and leave a notice and a record.
- b. Refuse loudly for every wrong state.
- c. Log and continue for every wrong state.
- Recommended: a. With the operator away, a loud refusal nobody hears is a stall. Log and continue is how #136 spent money.
- Steers: the run-check refusal, resume guards and watch action on prompt screens it cannot fully read.

Q7. Order and drop order?
- a. Settle Q2 first and run one shared attempts leaf for #136 and #137. Run #135 after, since it needs an outside permission and live prompt proof.
- b. Three parallel leaves.
- c. #135 first, because the operator named confirming as the watch job.
- Recommended: a. If work must drop, drop live confirming in #135 first and keep the money and attempts fixes.
- Steers: map grouping, parallel safety and when needs rows fall due.
- Placement owed: the listener boot PATH crash in #137 goes in the #137 boot chain work or out as its own seed. Do not leave it unplaced.

## 2. Disagreements with A's draft

D1. Draft 3 blocks #135 as written. The operator said to confirm when it is not dangerous. Narrow operator only to originating approvals: chart rows, grants, paid launches past a grant and new decisions raised as questions. Confirming a decided action is a separate class under Q1.

D2. Draft 1 needs a rank below authority and cost bounds. Removing the cause of prompts can mean wider standing tool permissions so no prompt appears. That has fewer parts and more risk. Remove first only inside the same authority.

D3. Draft 2 is right for agent edits and wrong as an outcome limit. For #135 see Q5. For #137, if hc or herdr killed the seats, akrogon can only protect against it. The chart outcome must say that plainly.

D4. Draft 4 as a blanket rule fails both ways, see Q6. A refusal also needs a reader. A background seat may never read printed output, so the refusal record must land where the seat or the next pass will read it.

D5. Draft 5 is incomplete on proof types. Paid sessions can show prompt screens for #135. They cannot prove the reboot case. Proof for #137 is local attempts tests plus an operator reboot only under Q4 or N4.

D6. Draft 6 overstates independence. #136 and #137 share the attempts counter and the dispatch path. Parallel leaves can set conflicting attempt rules. Parallel is safe only after Q2 is settled in the chart.

## 3. Hard limits to add

L1. The watch never confirms a destructive, outward facing, credential, .env, push, merge or past grant prompt. It never confirms a prompt it cannot read in full, and never confirms the same stall twice.

L2. No loosened attempts rule without a separate bound. A truly silent seat must still fail within a limit, and fast restarts must stop and notify within a limit. No unbounded restart or re-prompt loop can run overnight.

L3. Every watch confirmation and every run-check refusal leaves a durable record with leaf, prompt text or run name, phase and time. If the record cannot be written, the watch does not confirm.

L4. Proofs use throwaway terminals and fake slow commands only. No real paid external API such as DataForSEO, no keys into real doors or seats and no agent reboot of the host.

L5. Agent edits stop at the akrogon repo. Outside files such as Claude settings change only by the operator hand, from exact text the chart supplies.

L6. Guards on failed leaves must keep an operator path to diagnose and recover the leaf. The guard targets agent launches under a grant.

L7. Prompt confirming is claimed only for harnesses where a probe showed the real prompt screen and the working keys. Every other harness stays notify only.

## 4. Needs sheet rows

N1. Operator applied Claude permission rule allowing the watch session to run the hc keys and hc send calls used for confirming. Purpose: pass the classifier denial reported in #135. Destination: Claude settings, applied by the operator from exact rule text supplied by the leaf. Needed before any live confirming claim.

N2. Operator approval of the delegable prompt list and dangerous bounds settled under Q1. Purpose: standing authority for the watch to confirm, given once and not per prompt. Destination: an approvals record in this chart.

N3. Bounded paid throwaway sessions on the cheapest model for each harness in reach. Purpose: observe real permission and question prompt screens and the keys that answer them. Destination: approval record in this chart, with a session count bound.

N4. Operator reboot window with a throwaway leaf in implement. Purpose: live check of resume protection, or cause hunting if Q4 picks diagnose first. Destination: evidence notes in the #137 leaf. Only the operator reboots the host.

N5. Operator started real watch-issues run. Purpose: end to end proof of the confirm path under the real cron and classifier, since only the operator starts and stops the watch. Destination: a watch session at a repo root the operator picks.

N6. Read use of the framework evidence named in the intake, covering timings, the leaf log and the two dead seat transcripts. Purpose: settle attempt timing from records that already exist, with no new spend. Destination: read only, with findings copied into this chart.
