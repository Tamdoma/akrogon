Reviewed all five briefs and every Standing design / Leaf architecture section. Paths below are relative to the supplied scratch handoff root. Standing dissents are not repeated.

Shared brief defect

F1. The proof paragraphs in seat-budget/count-silent-turns/brief.md, seat-budget/refuse-failed-runs/brief.md and blocked-seats/blocked-seat-notice/brief.md pin acceptance to named test files (tests/next.test.ts, tests/run-check.test.ts, tests/verify.test.ts). The review brief expressly excludes criteria naming test files. Keep the behavioral proof boundary in the brief and the existing file suggestions in design/plan.

count-silent-turns

F2. brief.md criterion 1 says a confirmed delivery whose turn has not ended has 0 attempts. In the same scenario, a redelivery after two silent completions must retain attempts=2 until the next completion. A delivery must leave the existing count unchanged. Only a fresh phase starts at 0. This is a contradiction within the new behavior, independent of the standing legacy-count dissent.

F3. design.md Leaf architecture gates loss charging on allocation.seats[slot] naming a recorded seat. src/next.ts allocate obtains that value from src/reconcile.ts leafSeats, which returns undefined when the recorded terminal is gone. Therefore the missing-terminal case in criteria 4/5 has no charging/evidence path. Use recorded state.seat[slot] for the prior identity and allocation.seats only for its observed presence. This differs from the standing debate about charging one identity twice.

F4. The replacement architecture unconditionally increments lost for a finished seat before the existing silent-turn point. A finished terminal can expose turn > prompted.turn, proving its delivered task ended. Charging that as “lost ... before ending a turn” contradicts the criterion's reset-on-seen-turn-end and the picked loss definition. Classify observed completion before the replacement loss charge. Missing terminals still provide no completion evidence. Relevant code: next.ts dispatchSlot's replacement branch precedes its prompted.turn comparison.

refuse-failed-runs

F5. brief.md criterion 4's “holder or checkout run (--holder) is never refused” is broader than its actual interface. run-check.ts leafTarget resolves a leaf worktree or worker before its holder branch. Passing --holder from such a cwd still yields a leaf-backed caller and must be refused under criterion 1. Define the exemption by resolved caller ownership/absent phase, not the presence of --holder.

F6. design.md Early read conditions the check on the captured caller phase already being failed. checkedRun can receive caller.phase=implement while authoritative state has since become failed. That wording skips the promised pre-admission fresh read for exactly this stale caller. For every caller carrying a phase, read authoritative state first and decide from that fresh phase. Keep the late read as separately specified. Relevant code: run-check.ts leafTarget/checkedRun and verify-pass.ts passCaller preserve a prior phase snapshot.

blocked-seat-notice

No additional defect beyond F1. Replacement and phase cleanup now have explicit owners and cover the previous final-check finding.

claude-seat-no-questions

F7. brief.md criterion 1 requires the flag exactly once for every Claude recipe, but design.md explicitly picks append-regardless when a configured template already contains --disallowedTools. A valid template already containing --disallowedTools=AskUserQuestion would then contain it twice. config.ts globalSchema allows that template, and seat.ts harnessArgv expands arbitrary configured argv. Choose a contract consistent with unconditional append, or give existing-flag handling a home and prove its parser behavior. This is not a disagreement about code versus config ownership.

door-reads-live-address

F8. brief.md criterion 4 requires all repo checks to pass. That claims repository health outside this process-text leaf's owned surfaces, explicitly excluded by the review brief. Remove it as a product criterion. The ordinary required blocking checks still run under the standing workflow.

F9. design.md Stated limits promises that an already-written stale-address brief is collected through its return file “under the existing Collecting rule.” questions.md Blind peer exchange, Collecting requires both a non-empty return file AND a report from the current consultant address. File-only collection cannot satisfy that rule. Name the existing one-nudge recovery to request the missing report at the live door, with its normal drop outcome, or state that collection remains incomplete. Do not claim an unsupported file-only recovery.
