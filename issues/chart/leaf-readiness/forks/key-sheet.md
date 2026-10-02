# Key sheet

## Question
Q1. When and where does the operator get exact step-by-step instructions for creating each missing key and other operator-supplied input, and at what point in the flow are they done?

### Carries
- [readiness-contract](readiness-contract.md): taken 1a, with operator correction 2026-10-02.
- [key-creation](key-creation.md): taken 1a and 2a.
- Operator question 2026-10-02, verbatim: "1a - but when will that happen? At what point? Do I just look at the list from the akrogon status and do it manually? How can I get the instructions from the agent to tell me how to get those keys exactly?"
- Existing door rule (skills/chart-issues/SKILL.md:53-55): every external operation gets one real call with the leaf's identity before handoff, and the handoff batch names keys absent from the consumer env.

## Findings
- Round files: slots/key-sheet-B.md, slots/key-sheet-merged.md, slots/key-sheet-rebuttal-B.md.
- (A,B) Timing is fixed by the existing rule: proofs run with the leaf's real key before handoff (skills/chart-issues/SKILL.md:53-55), so the operator completes the sheet during charting, after forks settle and before the proofs. Final review only confirms.
- (A,B) Recommended: the door shows one sheet with exact steps per need (purpose, consuming leaves, permissions and resources, official source and date checked, destination, what done looks like); steps are stored in each leaf's contract; `akrogon status` prints any still-missing need with its steps; `next` refuses. No separate command.
- B rebuttal: each item goes to its own destination (keys and values to the declared env, files to their paths, approvals to authorization records); "one batch" means one complete list, not one sitting, because some approvals are asynchronous (GitHub org token approval can stay pending).
- B pitfalls: dashboard steps go stale (record source and date, recheck on mismatch); a done sheet is not proof; a leaf-produced value cannot be proven before handoff, so that dependent's handoff waits or the gap is settled explicitly; same variable name is not the same need unless identity, target, repo and permissions match.
- Research: Google SRE Workbook "On-Call" (Cook, Smollett et al., sre.google/workbook/on-call, 2018): step-by-step playbooks go stale; keep source and date. src/status.ts:53-130 reads only open leaves, so the pre-handoff sheet comes from the door.

## Taken
2026-10-02, operator, verbatim: "1a"

The operator completes the inputs during charting, after forks settle and before the door's proof calls. The door shows one sheet listing every need across the proposed leaves, each with purpose, consuming leaves, exact permissions and resources, official source and date checked, destination (keys and values to the declared env, files to their paths, approvals to authorization records) and what done looks like. One complete list, completed at the operator's pace; asynchronous approvals are waited for before the affected proofs. The door checks presence and runs the proofs; a failed proof yields a specific repair step. Handoff stores the steps in each leaf's contract; `akrogon status` prints any still-missing need with its steps; `akrogon next` refuses dispatch. A leaf-produced value is proven after its producer delivers, so that dependent hands off after the producer. Reason: steps stay with the leaf, no lost chat context, no extra command. Foreclosed: 1b door-only sheet with names in status, 1c separate instructions command.
