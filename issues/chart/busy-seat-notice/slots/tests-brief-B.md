# Brief, slot B: test authorship (independent; do not read other slots' tests-*.md)

Read first: operator verbatim and Carries in /home/ivan/Work/infra/akrogon/issues/chart/busy-seat-notice/forks/test-authorship.md, and /home/ivan/Work/infra/akrogon/issues/chart/busy-seat-notice/slots/system-merged.md (with its rebuttal corrections).

Tasks:
1. Research, newest first, Aug-Oct 2026 (state dates; mark older sources as older): evidence and practitioner views on coding agents writing their own tests (tests rigged to pass, reward hacking / specification gaming on tests, agents editing or deleting tests, endless fix loops), what posts on X and practitioner blogs report, and what agent labs and tool makers now recommend (e.g. tests written before implementation by a separate role, frozen tests, hidden/held-out tests). Also established best practice on test purpose and count (few, high-value regression tests over test-for-test's-sake; integration over unit where it pays). Cite URL and date read for each claim; say plainly where you found nothing.
2. Map akrogon's current test and proof flow end to end with path:line: who decides criteria (chart door), who sizes proof (plan-issue), who writes tests (implement-issue A vs workers, :57), who may change them (Test-Change trailers, src/test-files.ts), who builds live proof rigs, how check-issue reviews them, and what the repair loop does.
3. Systems design: list the reinforcing loops in testing to cut and the balancing loops to calibrate (target, sensor, actuator each), then propose the most elegant design: fewest moving parts, removes the problem class. Cover: who writes tests and when; how a pre-written test is protected from the executing seat; what a purposeful test is (prove the hardest parts have not regressed) and the count rule; what replaces self-built live proof rigs; what happens when a pre-written test is wrong.
4. For each recommendation: what it breaks or invites later.

Return path (write only this file): /home/ivan/Work/infra/akrogon/issues/chart/busy-seat-notice/slots/tests-B.md
