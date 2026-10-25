# Autopilot story: three speed fixes

This is a true story from a project that builds client websites. Three bug reports were about speed: a client texture image was shipped as a heavy raw file, built sites had no measured speed floor, and an SEO audit called its own speed data a gap. The operator handed them to a chart door in [Autopilot](../use/autopilot.md). Seat A charted them alone, three leaves ran through the lifecycle, and all three landed on main.

## The operator switched autopilot on

The operator typed one message in the chart door's pane. It named autopilot, the batch of reports, and one chart consultant, B. The door was running [chart-issues](../../skills/chart-issues/SKILL.md). It saved the words in the chart's `INTAKE.md` and added a mode line to `CHART.md`.

The batch held several charts. The door worked them one at a time. Between charts it handed itself to a fresh conversation in the same pane, so its context stayed small. Each handover was written in the mode record.

Before the speed chart started, consultant B stopped answering because its server was overloaded. The door dropped B for the rest of the session. The speed chart ran with seat A only, and the `## Autopilot` section says so.

## The door answered its own forks

The chart's destination named the three outcomes. Seat A wrote each fork as a full question in its pane, read the code, and picked an answer itself. Each fork file under `forks/` records the pick as A's, with the reason and the rejected options.

- Where to measure speed. A picked a new blocking gate on the built site, with one pinned Lighthouse version and the browser the project already used. A preview deploy would have added a deploy step.
- How to handle heavy images. A picked encoding raster brand images to WebP in the one place that already publishes them, reusing the photo encoder. A format ban would have added a manual step to every build.
- Who ranks the speed data. A picked the audit's existing preflight script, so the skippable second step went away. Another option needed a paid model session.
- How to split the work. A picked three standalone issues with one leaf each, and no `blocked-by`. The fixes did not need each other.

Two things stayed off route: moving another audit's Lighthouse runner, and changing how analytics scripts load. Both are listed under `Off route`.

Every handed chart takes the lifecycle route in autopilot. The door wrote three leaves, `pagespeed-rank-preflight`, `brand-raster-webp` and `lighthouse-floor-gate`, each starting at `plan.synthesis`. `akrogon status` read all three without error. The chart's last marker became `Handed off`, and the mode turned itself off because no handed chart was left open.

The whole chart took one operator turn. The usage lines in `USAGE.md` came from the door's usage script, run just before the handoff review.

## The leaves ran

Handed-off leaves do not start by themselves. They started through `akrogon next`, which prompts the seats each phase needs. See [Run work](../use/run-work.md) and [commands.md](../reference/commands.md#run-work).

Each leaf followed the phases in [state-and-phases.md](../reference/state-and-phases.md#phases). A wrote the plan with [plan-issue](../../skills/plan-issue/SKILL.md), then built it with [implement-issue](../../skills/implement-issue/SKILL.md). Tests went in first and failed. The product change then made them pass. A got a green `akrogon verify` receipt before moving to `check.review`.

In `check.review`, A and B each reviewed the diff with [check-issue](../../skills/check-issue/SKILL.md). Each review is a file in the leaf folder.

### brand-raster-webp

A found no fixes. B found one: a logo declared by the design system was still converted to WebP when it lived in the mockup bundle. B proved it with a small run. The leaf moved to `check.repair`. B wrote a test that failed, fixed the path comparison, showed the test passing, and moved the leaf to `merge`.

### pagespeed-rank-preflight

A and B both said `ready`. In `merge`, the land run's full check went red on tests outside the leaf's files. B judged the leaf did not cause them and sent it to `check.fix` with the failing output. A reran the same checks on the same commit. They passed, and A made no change. B checked again and said `ready`.

### lighthouse-floor-gate

A said `nits`. B found two fixes. A failed Lighthouse run did not print the tool versions. One done-criterion was proved with a stub instead of a real Lighthouse run. In `check.repair`, B fixed the first one with a red then green test. B moved the leaf to `check.fix` for the second, because it needed a new proof. A added the real run and B said `ready`.

Then the merge check went red. An old recorded test listed the gates in their earlier order and did not expect the new gate. That was a test expectation change, so it went to A through `check.fix` again. A updated the test with a `Test-Change:` trailer, the full check passed, and B said `ready`.

## The merges

Each leaf took the repo's one merge turn in order. `akrogon next` rebased the branch and started the land run. The land run ran every check with `akrogon verify`, pushed the tested commit and moved the leaf to `merged`. Each issue folder moved to `issues/closed/`, and the leaf state recorded a broadcast for seat B to send. See [Merge and announce](../use/merge-and-announce.md) and [merge-issue](../../skills/merge-issue/SKILL.md).

All three leaves landed on main:

- `brand-raster-webp`: landed
- `pagespeed-rank-preflight`: landed
- `lighthouse-floor-gate`: landed

The operator wrote none of the forks. The record shows every pick as A's, with its reason, so it could be read before the leaves ran.

Next: [Watch while away](../use/watch-while-away.md)
