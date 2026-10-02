# Key sheet: merged A + B

A and B reached the same answer independently.

## Timing (A,B)
The keys must exist before handoff, because the door's existing rule runs one real call per outside operation with the leaf's own key before handoff (skills/chart-issues/SKILL.md:53-55). So the operator does the batch during charting, after the forks settle and before the door's proof calls. Final handoff review only confirms completion and evidence.

## Flow (A,B)
1. Door lists every need across all proposed leaves: keys, scopes, files, hostnames, approvals, values produced by other leaves, including indirect and cleanup calls.
2. Door shows one sheet with exact steps per item: what it is, which leaves use it, exact permissions and resources, where to click (official doc link and date checked), which repo's `.env` and variable name it goes in, what "done" looks like. Values go straight into `.env`, never into chat.
3. Operator does the sheet in one sitting and says done.
4. Door checks presence by name, runs the proof calls with the leaf's key. A failed proof produces a specific repair step on the same sheet.
5. Handoff writes the steps into each leaf's contract. Later, `akrogon status` prints any still-missing need with its stored steps, and `akrogon next` refuses dispatch. No separate command.

## Recommendation (A,B)
1a: door sheet before proofs, steps stored in the contract, printed by status for later gaps.
1b: door sheet only, status shows names. Cost: steps lost in the chat; later repair means re-asking.
1c: separate command. Cost: another surface showing what status already shows.

## Pitfalls (B)
- Dashboard steps go stale: record source and date; door rechecks on mismatch, never guesses.
- A filled-in sheet is not proof; the proof call is.
- A value another leaf produces cannot be proven before handoff: that dependent's handoff waits for the producer, or the gap is settled explicitly.
- Same variable name is not the same need unless identity, target, repo and permissions match.

## Research
- better-than-training · skills/chart-issues/SKILL.md:53-55 · proofs with the real key before handoff fix the timing.
- practitioner · Cook, Smollett et al., Google SRE Workbook "On-Call" (sre.google/workbook/on-call, 2018) · step-by-step playbooks go stale as systems change; keep source and date, refresh on change.
- better-than-training · src/status.ts:53-130 · status reads only open leaves today, so the pre-handoff sheet must come from the door, not status.
