# Brief: taxonomy-rename

## What

The chart-issues skill (skills/chart-issues/SKILL.md and assets/*.md) and skills/AREA.md use the approved taxonomy: the category "Charting mode" with the values No autopilot, Semi-autopilot and Full autopilot, and the category "Build route" with the values Direct and Lifecycle. "manual" and "attended" stop naming a charting mode, and bare "autopilot" stops naming the middle mode. Record values the door writes from now on (mode record and handover entries) use the new values in lower case. One sentence lets the door read old record words as their new values. No behavior changes.

## Why

The operator approved one word set for the docs and "the entire codebase where needed" (forks/signposts.md, third correction). Today the skill says "manual", "attended" and "autopilot" for the same modes, and the operator's own "manual route" collides with "manual" mode. The public docs (charting-guide, guide-chapters) will use only the new words, so the door must speak them too.

## Done-criteria

1. In skills/chart-issues/ and skills/AREA.md, the charting mode is named "Charting mode" with exactly the values No autopilot, Semi-autopilot and Full autopilot, and the route category is named "Build route" with the values Direct and Lifecycle. Outside that `Old record words:` line, no line uses "manual" or "attended" as a mode name, uses bare "autopilot" as the middle value, or uses "autopilot signposts" as a mode name. Proof: the report lists every remaining hit of `manual`, `attended`, `autopilot signposts` and bare `autopilot` in those files with its reason, and slot B reads the diff.
2. The mode-record and handover templates (shapes.md `## Mode record`, handover.md, autopilot.md) write the new values in lower case, for example `on semi-autopilot`, `continue semi-autopilot (handover <time>)` and `continue no autopilot (handover <time>)`. SKILL.md holds one line, starting with `Old record words:`, that maps each old record word (`manual`, `attended`, `on autopilot`, `continue attended`, `continue autopilot`, `autopilot signposts`) to its new value, so an open chart with old entries still resumes. Proof: the report quotes that sentence and each changed template line.
3. Every rule keeps its behavior, including "Direct is not offered under Semi-autopilot or Full autopilot". Keys stay as they are: the `Route:` line with lower-case values `direct | lifecycle`, `## Mode record`, `## Autopilot`, `signposts: <operator | A>`, the `akrogon direct` verb and every file name. Proof: the report gives each changed rule line's meaning before and after, and slot B confirms nothing else changed.
4. Docs pages that state a charting mode word today (at least docs/reference/words.md, docs/reference/skills.md, docs/use/autopilot.md, docs/use/plan-work.md) use the new words in the same change, mode-word edits only, as docs/reference/where-things-go.md requires for a skills/ change. Unrelated words stay untouched ("unattended", "manual next", `CLAUDE_CODE_SESSION_ATTENDED` and similar), and the diff touches only skills/ and those docs pages. The destination's `checks` pass.
