# Recorded command and narrow reproducer (2026-10-18)

## Case

Framework frozen-assignment review B raised F4 after merge-rejection repair `2802b0112`, demanding a full aggregate rerun despite passing reruns of all four formerly failing suites. During check.repair, B read implement-issue's explicit check.fix rule and corrected the finding. The remaining report gap was repaired by linking the original aggregate, the narrow red/green suites and both runs' revisions.

## Evidence

The installed implement-issue SKILL.md check.fix section says to select the narrowest reproducing command using the recorded runner, such as failing test files, otherwise the whole command. Framework's leaf review-B.md records the correction and implementation/report.md records the rejected base/head, recorded aggregate, four reproducers and passing logs. The unchanged repair head's green leaf receipt was reused by `akrogon verify`.

## Learning

When judging repair evidence, read the execution skill's rule for selecting the reproducer. Keep the recorded aggregate and selected reproducer distinct, and require the selected reproducer's red/green outcome plus revision context. Do not turn a valid narrower proof into a full-run requirement by inference. This is a review judgment, not a fixed source-pattern check.
