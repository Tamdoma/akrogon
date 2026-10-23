# Final-shape check brief — slot B — fact-ownership
Reading rule as in /home/ivan/Work/infra/akrogon/issues/chart/beginner-docs/slots/reader-and-home-brief-B.md, section "Reading rule".

Operator answer, verbatim: "1a | 2a | 3a | 4a - please fix those tests. Nothing old that doesn't exist anymore shouldn't survive. |"
(Read as: nothing about things that no longer exist should survive.)

Proposed final shape A will record:
- Q1 a, Q2 a, Q3 a as in /home/ivan/Work/infra/akrogon/issues/chart/beginner-docs/slots/fact-ownership-merged.md.
- Q4 a: keep the docs bans. Fix them so they keep working after the move: tests/run-permit.test.ts docs loop and tests/hold-retired.test.ts docs scan cover README.md and every docs/**/*.md (run-permit today names README.md, docs/guide/setup.md, docs/guide/files.md, src/AREA.md, which would vanish or silently stop checking). Runtime retirement tests untouched.
- The rewrite removes every mention of commands, settings, files and behaviors that no longer exist (e.g. src/akrogon.ts retired verbs, B-merges-normally, sweep-only cleanup), checked against current src and skills, not only the banned words. Docs describe current state only; no "was removed" or migration notes.
- No new prose classifier; no new banned-word list beyond what the tests hold today.

Check once: contradiction with the operator's words or a taken decision? Disagreements only, or "none", with evidence. Return to /home/ivan/Work/infra/akrogon/issues/chart/beginner-docs/slots/fact-ownership-final-check-B.md, then end your turn.
