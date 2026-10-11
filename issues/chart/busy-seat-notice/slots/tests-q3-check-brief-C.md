# Focused check, slot C

Operator answered 2026-10-10: "1a | 2a | 3 - I don't want anything to move over to next issues. Can we make it work inside of the same leaf / runtime?" Context: slots/tests-merged.md Q3, forks/test-authorship.md Taken.

Proposed final shape for Q3 (3c):
A review finding about a case outside the done-criteria, with no observed failure, blocks only after the reviewer tries it against the leaf head with a quick local run (existing checks or one direct local invocation, never a live chain; scratch probe discarded, nothing committed). If it fails now, it is a real bug and takes the existing route in the same leaf: fail-first reproduction test, then the fix (check-issue/SKILL.md:79). If it passes, or cannot be tried without a live run, it is a Nit: written in the review, not blocking, no test, no new issue. The missing-test Fix without an observed failure (check-issue/SKILL.md:55) is removed. Nothing leaves the leaf.

Check this shape once: does it break anything, contradict a Taken decision, or have a smaller alternative that keeps everything in the leaf? Disagreements only, with evidence. Short.
Return path (write only this file): /home/ivan/Work/infra/akrogon/issues/chart/busy-seat-notice/slots/tests-q3-check-C.md
