# Map A: autopilot-new-chart

## Locks (operator, 2026-10-26)
- O1: a handed chart that needs a separate new chart waits for the operator; A moves on within the handed list.
- Proposal step: before parking, A writes a ready-made proposal for the new chart (goal, why needed, which chart waits) so the operator only says yes or no.

## Evidence (better-than-training: inspected files)
- skills/chart-issues/SKILL.md Drain: "Write one chart folder per destination"; under autopilot drain "takes only the handed list ... imports nothing new".
- SKILL.md `## Autopilot` wait list: grant/retention/secret-save approval, mutating or paid proof, missing need, human-only prerequisite; "The door never turns autopilot on, extends the handed list ...".
- SKILL.md `## Autopilot`: outside items (seed matches, close offers, flaky tests, failed leaves) are "recorded only".
- shapes.md `## Autopilot`: `- wait: <the exact missing need, approval or prerequisite> — next: <next step>`; `- recorded only: ...`.
- SKILL.md Handoff: a criterion needing machinery absent on the default branch becomes a prerequisite leaf in the same chart, listed in `blocked-by`.
- src/next.ts:1401 `discover(repo, ...)`: blocked-by resolves inside one repo only.
- Precedent: issues/chart/config-walls/CHART.md Mode record 2026-10-22: A split handed seeds #110-#116 into three charts at the opening map. Splitting handed intake into charts is already A's.
- issues/chart/autopilot/slots/map-merged.md:18 (2026-10-16): "door findings become seeds, not new charts (A,B,C)"; shipped text instead says "recorded only". Seeds were dropped.
- docs/use/autopilot.md "What still waits for you" lists the wait kinds for operators (must change with the rule; lesson 2026-09-11 grep docs/ for a changed rule).

## Forks
Q1 Trigger. Which discovery holds the chart?
- O1a Only work outside the handed intake that the handed chart's outcome depends on and that cannot be a prerequisite leaf in the same chart's repo. Independent findings stay recorded only; splitting handed intake stays A's. (pick) Narrowest; keeps nights moving. Risk: A judges "depends on"; the proposal must cite the criterion that cannot pass.
- O1b Any new destination found mid-chart, depended on or not. Invites many holds; a busy night parks most charts.
Q2 Where the proposal lives.
- O2a In the waiting chart's CHART.md `## Autopilot`, a `proposal:` entry beside the `wait:` line. (pick) No new folder; nothing another door or attended Drain picks up.
- O2b A new chart folder in a proposed state. Another door's Drain (oldest open chart) and overlap check would treat it as an open chart: it is the chart the operator wanted held. Needs a new marker.
- O2c A seed via seed-issue. A public GitHub write overnight, not reversible; also a new external operation under autopilot.
Q3 What yes does.
- O3a The yes is operator words extending the handed list: A creates the chart from the proposal (proposal copied as door findings, the yes verbatim as operator words) and charts it under autopilot; the waiting chart resumes and hands off with `blocked-by` on the new leaf when same repo, else waits until that leaf lands. (pick)
- O3b Yes opens the new chart attended. Slower; the operator is back anyway.
Q4 What no does.
- O4a The waiting chart is marked `Held <date>` with the reason; the operator can reopen it. (pick) Its outcome cannot pass without the dependency, so nothing else is sound.
- O4b It stays waiting for more words. Leaves the mode on forever (mode ends only when all charts are handed off or closed).

## Pitfalls and the step that removes each
- Duplicate proposal: the needed work may already exist as an open chart, open leaf or seed. Step: A checks issues/chart/, issues/open/ and seeds first; an existing leaf in the same repo becomes `blocked-by` (no hold); an existing open chart is named in the wait instead of a proposal.
- Morning visibility: the pass-end line per chart must name the proposal so it is seen.
- "Recorded only" vs proposal confusion: recorded-only stays for things the handed work does not need.

## Scope (one chart, one leaf, repo akrogon)
skills/chart-issues/SKILL.md `## Autopilot` wait list; skills/chart-issues/assets/shapes.md `## Autopilot` line shapes; docs/use/autopilot.md "What still waits for you". tests/chart-shapes.test.ts parses shapes examples only.

## Fog
- Cross-repo dependency: blocked-by is per repo, so a waiting chart whose dependency lands in another repo has no machine wait. O3a's "waits until that leaf lands" needs a home.
