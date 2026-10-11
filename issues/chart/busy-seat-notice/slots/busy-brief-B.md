# Fork notes brief, slot B: busy-seat-notice (trigger and bar together)

Operator context (2026-10-10, verbatim): "I don't want more complexity. I've never had this issue up until today, why do we now need to build new things around it?" Prefer the smallest change using what exists.

Task: blind notes on both forks /home/ivan/Work/infra/akrogon/issues/chart/busy-seat-notice/forks/trigger.md and /home/ivan/Work/infra/akrogon/issues/chart/busy-seat-notice/forks/bar.md (Question and Carries only; not slots/busy-A.md). Check in live code whether the existing notice path can be reached for #78's case with no new code beyond the notice text: src/next.ts:227-260 (observeBusy), :660-668 (observe runs before the blocked/failed checks in dispatchLeaf), skills/watch-issues/SKILL.md:34-40 (when the watch runs next, Busy rule), and whether running `akrogon next --all` or `next <slug>` on a leaf with a busy seat is harmless. Also: does the notice need the phase added (#78 Expected behavior)? Five-part format from questions.md "Blind peer exchange".

Permitted context: /home/ivan/Work/infra/akrogon/issues/chart/busy-seat-notice/INTAKE.md, /home/ivan/Work/infra/akrogon/issues/chart/busy-seat-notice/CHART.md, ../seat-stall-detection/CHART.md, ../stall-notifier-removal/CHART.md, live code/skills under /home/ivan/Work/infra/akrogon.

Return path (write only this file): /home/ivan/Work/infra/akrogon/issues/chart/busy-seat-notice/slots/busy-B.md
