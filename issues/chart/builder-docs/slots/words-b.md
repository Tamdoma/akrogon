# Docs word choices: slot B

## Category X: "autopilot mode" (short: "mode")

- **Name:** write "autopilot mode" at first use on a page, "mode" after. The chart file already has a `## Mode record` and the skill says "mode", so it matches the screen. "Mode" alone is too generic for a first use. "Autopilot mode" tells the reader which dial it is.
- **Rejected:** "autonomy level" (research jargon, printed nowhere, and the door already dropped loop terms). "Autopilot setting" (reads like a config file, and the mode is set in plain words per session).
- **Values:** "no autopilot", "semi-autopilot", "full autopilot".
  - Reason: these are the operator's own three words, and each has its own modifier. No value is the bare word "autopilot", so "autopilot" can name the category without also naming one value.
  - Confusion avoided: the skill's bare "autopilot" (the middle value) sounds like the agent does everything.
  - Screen match: the mode record prints `on autopilot` for semi and `full autopilot` for full. The docs say this once, next to the definition. The reader starts a mode in plain words, so "semi-autopilot" works as input.
- **Rejected values:**
  - "manual" for no autopilot. The operator uses "manual" for the direct route (correction: "manual versus lifecycle route"), so the word would sit in both categories. The docs do not use "manual" at all.
  - "attended" (the skill prints `continue attended`). The reader does not know it. Gloss it once as "no autopilot".

## Category Y: "build route" (short: "route")

- **Name:** write "build route" at first use on a page, "route" after. The chart file prints `Route: direct` and `Route: lifecycle`. "Build" says what the route decides, and it keeps "route" from sounding like a second kind of mode.
- **Rejected:** "path" (collides with file paths). "Workflow" (this reader uses it for Zapier and n8n chains). "Track" (printed nowhere).
- **Values:** "direct route", "lifecycle route".
  - "Direct" matches `akrogon direct` and `Route: direct`. It reads plainly: the planning agent builds the change directly, with no handoff.
  - "Lifecycle" matches `Route: lifecycle` and the operator's own phrase ("the lifecycle process"). Gloss it at first use as "plan, build, review, merge by a fresh pair of agents".
- **Rejected values:**
  - "quick fix" (operator: not always a fix).
  - "manual route" (an agent builds it, nothing is done by hand, and it collides with category X).
  - "fast route" (speed is a result, not the definition, and it makes lifecycle the "slow route").
  - "full route" for lifecycle ("full" already belongs to "full autopilot").

## Sentences that tell them apart

- **X:** "Autopilot mode decides who answers the questions while the work is being planned: you, the agent, or a split of the two."
- **Y:** "Build route decides who builds the plan once every question is answered: the planning agent itself (direct route) or a fresh pair of agents working from written task contracts (lifecycle route)."

## One fact the docs must state with these words

The two are linked, not free to mix. Under semi or full autopilot every chart takes the lifecycle route and the direct route is not offered (skills/chart-issues/assets/autopilot.md:15, docs/use/autopilot.md:31). A two-row table works: no autopilot offers both routes, semi and full offer lifecycle only.

## Out of this chart

The screen says `autopilot` where the docs say "semi-autopilot", and `attended` where the docs say "no autopilot". A later change to the skill's words would remove both glosses. skills/ is out of scope here.
