# Chart

Draw the map, then take every fork. A chart turns one fuzzy goal into a route you approve piece by piece. The agent walks the territory. You pick a side at every split.

What it's: a folder under issues/chart/ with CHART.md plus one file per fork. Why it exists: so big goals get decided up front, in the open, instead of re-argued in every phase. How it works: you run /chart-issues in your own agent session, it maps, you answer rounds, it hands off leaves with blocked-by wired.

Prerequisites: repo set up, seeds pulled if you use GitHub. Which directory you're in: the registered checkout for widgets. The command is not akrogon here — it's /chart-issues in your agent. What you should see: a territory map first, then rounds. What to do when it fails: if it says missing repo or unregistered, check akrogon config; handoff requires a registered destination, charting alone doesn't.

Charting starts with the territory: the whole problem space for one destination. The agent looks at it and draws a map. The map holds the forks it can see, the questions a practitioner would ask, and the places a beginner trips. It's shown to you, never saved as its own file. The chart itself is saved — CHART.md plus forks/ — but the map is just the view. I like that split. Maps go stale; decisions stay.

The sharp parts of the map become forks. A fork is one place where the route splits and you pick a side. The parts the agent can see but can't yet phrase as a sharp question stay as fog. Fog lives as bullets under ## Fog in CHART.md. One patch per bullet. It clears into forks as answers land.

Forks are put to you in rounds. One round is one screen holding every open question across all open forks. Every question lists exhaustive options with one recommended. You answer, and the fork is taken. A taken fork is never reopened as a question — corrections get appended with a date, but you don't re-vote. Every answer redraws the map. Fog clears into new forks. A challenge check or a look at a live surface can expose a fork nobody saw. New forks can appear at any round.

When no fork is open and no fog is left, the route is clear. The chart hands off: it writes the leaves with blocked-by wired between them. Then it appends Handed off plus the date to CHART.md and stops. It doesn't run akrogon next. Dispatch stays with the command.

A concrete use, with our running example. Say export-csv started fuzzy: “let people get data out somehow”. The map might show two forks and one fog patch. Fork one: format — CSV only, CSV plus JSON, or plugin system. Recommended: CSV only, because the issue says CSV and JSON already works. Fork two: errors — fail loud on bad rows, or skip with a warning count. Recommended: fail loud, because silent skips hide bugs. Fog: do we need streaming for huge stores? Can not phrase sharply yet. Round one takes both forks. Fog clears into a third fork: streaming yes or no. You pick no, with off-route noting streaming as future work. Route clear, handoff writes issues/open/export-csv/export-csv/ with brief, design, state.

Why fog has a name: a fuzzy part of the map with no name gets handled differently every time. Named, it's watched. Every round either clears it into forks or leaves it visible on the chart. I used to skip fog and regret it. Name it.

Small items? Same chart structure, straight to handoff. If the map finds no fog and no open fork, it writes the folder and hands off immediately. No theatre for small things. Export-csv as we wrote it by hand is that case — clear enough to skip rounds, still gets the same files.

Previous: [Create](create.md) · Next: [Next](next.md) · [Home](../../README.md)
