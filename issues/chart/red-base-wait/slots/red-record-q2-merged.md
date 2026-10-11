# Red record Q2 reopened, merged A and B

## Pick
- (B) One repair leaf per red entry group, opened automatically by the command under the mutation lock when a new entry is recorded, then run by the normal seats (plan, implement, review, repair, merge). Its scope is that red unit(s): exact command, unit, comparison record and logs as input. Its required criterion is that unit passing; known-red-on-base never satisfies it. Idempotent: concurrent reporters reread under the lock and reuse the owner; a deterministic slug per entry generation. Files written state last, dispatch outside the lock. max_active, pause and seat availability still govern.
- A moved to B. A's claim-in-place (reporting leaf fixes in its own branch) fails where reds are found: check.review cannot commit while its peer reads the same head, merge stacks cannot take extra commits, and a failed claimer leaves repair edits in an unrelated branch (B O2).
- New code needed (A,B): one narrow command-owned operation that turns a red entry into a repair leaf from a fixed contract template. Nothing today opens a leaf without the chart door (src/akrogon.ts commands; watch-issues SKILL.md:38,49-56; seed-issue:67-84 files intake only).

## Simplifications A proposes over B's open points
- Proof after landing (B Q3): not a new step. Merge pushes only the exact tested top by fast-forward (src/phase.ts:409-447,487-499), so a green merge run of that top IS main after push succeeds. The entry resolves inside the same locked write that commits merged, using the merge run's comparison record. If the push is refused, nothing resolves and the normal rerun on the new base applies. No seatless merged-phase job.
- Retry bound (B Q2): one repair leaf per entry generation. Its failures use the existing failed-recovery path (watch two-cycle bound, watch SKILL.md:39). When that is exhausted, the entry shows "repair failed: <reason>" in status and one notice; no endless replacement leaves. A missing permission is reported, never retried by new leaves.
- Parking (B Q4): parking the repair leaf suspends that entry's repair; no automatic re-creation while parked. Unpark resumes it.
- Fix landed elsewhere first: the repair leaf's own check finds the unit already green on its base and goes to merged with nothing to push? (open: needs an existing "nothing to do" ending or the leaf is closed by the command when the entry resolves).

## Rejected (A,B)
Auto-file seed (intake, not an owner); first reporter fixes in place (above); assign an idle existing leaf (no permission to widen its contract); watch edits or repairs directly (watch is read-and-dispatch only); time-based lease takeover (no-clock lock).
