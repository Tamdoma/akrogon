# failed-stop-race rebuttal C (disagreements only)

Line numbers refer to the Findings section of ../forks/failed-stop-race.md.

R1. Limits (line 14) omit the watch as a second way out of `failed`. The Question asks that "only an operator recovery" resume the leaf. The watch recovers a "failed otherwise" leaf with a slot-less call once every required seat is idle (`skills/watch-issues/SKILL.md:39`). Under 1a the refused seat ends its pass and goes idle, so the next watch fire can resume the stopped leaf. It holds only when the stop reason reads as a credential, permission, operator decision or external step (`skills/watch-issues/SKILL.md:38`). The 2026-10-01 stop was issued by the watch pane itself, so its reason wording decides this. The fork should state it as a limit and say how an operator stop is worded, or the Question's "only an operator" is not met.

R2. Line 10 lists migrate-charts (framework log line 351, 2026-09-13, seat B) only as a count. Nobody checked whether that seat recovery was intended. 1a refuses that call from now on. The challenge check should carry it as unverified.

R3. Doc line (line 12): I withdraw "no doc change is needed". B's one line in problems.md and phases.md is cheap and tells the operator why a seat's call was refused. No disagreement remains there.

Everything else matches my round.
