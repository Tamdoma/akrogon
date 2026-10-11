# Red record

## Question
Q1. What is one entry in the repo red record: a command, or a failing test within a command? How is an entry cleared (a green run of that test on main, the merge of a fix leaf), and can one test clear while another in the same command stays red?
Q2. Who owns fixing a recorded red: one notice to the operator only, or an automatically filed seed (seed-issue) naming the check, so two leaves do not fix the same test separately (today C8 was fixed twice)?

### Carries
- Operator partial answer Q3 3a: one record, one notice per newly red check, joins silent.
- B final check F6: per-test identity with command/scope provenance; partial clearing.

## Findings
Merged: slots/red-record-merged.md (A, B, rebuttal B). Q1 and Q3 agreed (A,B). Q2: A moved to B's position (no auto seed). Rebuttal corrections:
- R1: the record also feeds base-evidence reuse; incident status stays separate from immutable run records, and a resolved entry is never a current exemption.
- R2: only a run on landed main (or same sha after an environment repair) resolves an entry; a green candidate, repair or merge-stack run does not, until that exact candidate lands. Ancestry alone is not enough.
- R3: B recommends a persistent fix-leaf link, set when the operator charts the fix; until then status shows triage pending. A source issue is intake, not an owner.
- R4: the "no repair outside own criteria" rule stops incidental fixes only; two leaves whose own criteria both need the same fix is a scope conflict for the operator, not a waiver.


Operator, 2026-10-10: "1a | 2 - I'm not touching anything manually. This needs to be automatically done. Find the best systemic solution with what we already have | 3a |"
Q1 1a and Q3 3a taken (see Taken when written). Q2 reopened: fix ownership must be automatic, built from existing mechanisms. Facts: no akrogon command opens a leaf without the chart door (src/akrogon.ts commands: config, preflight, init, phase, next, pull, close, sync, park, unpark, unhold, hold-fix, pause, unpause, status, install); watch-issues SKILL.md:38 routes repair to a newly charted fix leaf.
Q2 reopened findings: slots/red-record-q2-{A,B,merged,rebuttal-B}.md. Agreed (A,B): one automatically opened repair leaf per red entry, opened by the command under the lock, run by normal seats; A dropped claim-in-place (review seats cannot commit on a shared head, merge stacks take no extra commits). New code: narrow repair-leaf opener. Rebuttal B: R1 merge run counts as landed proof only when the pushed revision equals the tested one (src/phase.ts:487,553-558,657-659 can push a restacked top under reuse); R2 resolve wherever landing is confirmed, including late confirmation (src/phase.ts:743-765), idempotent; R3 failed leaves recover only via operator-started watch (src/next.ts:674-676, src/phase.ts:241-243), so automatic recovery needs command-owned reconciliation and a cumulative bound; R4 park refuses allocated leaves (src/park.ts:22-25,54-56); R5 no truthful "fixed elsewhere" ending exists (nonempty branch checks src/phase.ts:283,413,422; no cancelled phase), needs a narrow retirement path.

Operator, 2026-10-10: "I don't want more complexity. I've never had this issue up until today, why do we now need to build new things around it?" Door reply proposed cuts C1 (no automatic repair job) and C2 (no base result reuse). Operator: "cut"

## Taken
- Q1 1a: one entry per failing unit with command/args/scope/material-conditions provenance. Additive repo record under the mutation lock. An entry resolves only on a completed green run of that unit on landed main under equivalent conditions, from a run that already happens; partial resolution allowed; fix merge, issue close or disappearance never resolve; recurrence is a new entry and a new notice. Update/resolve rereads and compares inside the lock (lesson 2026-10-10-red-main-hold-stale-clear). Incident and notice delivery stored separately; no timer.
- Q2 cut: the record only dedupes notices: one operator notice per new entry, joins silent. No automatic repair leaf, no seed filing, no owner field. Fixing a red is ordinary charted work. A leaf does not repair a recorded red outside its own criteria (B R4).
- Q3 3a: green-on-retry stays in the leaf's comparison record and report only.
Reason: today's red was one false red from nested worktrees (worktree-location) plus one real test bug already fixed; with differential gating nothing waits on a red, so an automatic repair system adds code for a rare event.
Foreclosed: per-command entries; automatic repair leaf; claim-in-place fixing; auto seed; owner link.


## Proofs
- herdr notification for a new red entry, 2026-10-10. Command: `herdr notification show "akrogon charting proof: red-base-wait" --body "Test of the red-record notice call. No action needed." --sound none`. Identity: operator's local herdr session (no credential), run from the akrogon registered root inside herdr workspace w8. Version: herdr 0.9.3. Result: exit 0, stdout `{"id":"cli:notification:show","result":{"reason":"shown","shown":true,"type":"notification_show"}}`. Cleanup: none, a desktop notification with no stored state. Limits: proves the call shape and the `{shown, reason}` reply the existing hold notice parses (src/phase.ts:868-880); does not prove delivery outside herdr or with `--sound request`.
