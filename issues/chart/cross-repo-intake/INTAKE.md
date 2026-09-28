# Intake: cross-repo-intake

## Scope
Destination akrogon. One issue `cross-repo-intake` owning Tamdoma/akrogon#38, two parallel leaves: `pull-all-repos` (the `pull --all` command covers every registered repo from any cwd) and `chart-destination-intake` (the chart-issues door checks each handoff destination's open reports and attaches full matches to leaf sources).

## Provenance
- GitHub: Tamdoma/akrogon#38
- Operator: 2026-09-28 "let's do #38", "Use slot b and ask it too", round 1 answer "1a | 2a | 3a |"

## Source: Tamdoma/akrogon#38
# Cross-repo duplicate report stays open: chart hands leaves to another repo without seeing that repo's intake

Source: Tamdoma/akrogon#38
URL: https://github.com/Tamdoma/akrogon/issues/38

Unverified intake.

## Observation
Tamdoma/pi-extensions#5 (parallel `subagent_spawn` outside parent root hangs on a dropped confirm) was filed 2026-09-28 07:37 UTC. The same bug was charted in akrogon as `issues/chart/stuck-seat-recovery` from Tamdoma/akrogon#32 and #35, and handed off the same day as pi-extensions leaves `seat-subagent-freezes/same-repo-worktree-cwd` and `seat-subagent-freezes/admission-fault-no-block`. Both leaves carry `sources: Tamdoma/akrogon#32, Tamdoma/akrogon#35` only. When the issue completed, #32 and #35 were auto-closed, but pi-extensions#5 stayed open until closed by hand with `akrogon close Tamdoma/pi-extensions#5 --by "same-repo-worktree-cwd 3b478e9"`. pi-extensions#5 was first pulled into pi-extensions `issues/seeds/` after the fix had merged.

Two observed behaviors around this:
1. The chart-issues door pulls and imports seeds only from the repo it is opened in, while a chart can hand leaves to a different registered repo.
2. `akrogon pull --all` run from inside a registered repo pulls only that repo. `src/pull.ts` `pullCommand` resolves `currentRepo` for `--all` and returns early when it is non-null, so all registered repos are pulled only when run outside any of them. README describes the command as `akrogon pull [--all]` "Import open GitHub issues as seeds."

## Location
chart-issues door (seed import at open), `akrogon pull --all` (`src/pull.ts` `pullCommand`), phase completion source closing (`src/phase.ts` around lines 149-167).

## Reproduction
Open a chart in repo X from repo X's GitHub issues, hand leaves to registered repo Y while an open GitHub issue describing the same bug exists in Y, and complete the issue. X's sources close, Y's report stays open. For the pull behavior, run `akrogon pull --all` from inside any registered repo: only that repo reports pulled issues. Seen once for the cross-repo case.

## Expected behavior
A report in the destination repo describing the handed-off work is visible to the chart before handoff, so it can enter leaf `sources` and close with the delivering issue. `akrogon pull --all` refreshes every registered repo.

## Urgency
Medium. Fixed bugs stay open on GitHub and reappear as fresh intake in the destination repo, costing a re-investigation. Workaround: `akrogon close <owner/repo#n> --by <leaf commit>` by hand.


## Agent findings
See forks/destination-intake.md Findings and slots/. Summary: (1) herdr runs plugin commands with the plugin directory as cwd, which is inside the akrogon repo, so the startup `pull --all` takes the early return at `src/pull.ts:81-87` and pulls akrogon only; live run from `plugin/` pulled 1 repo, from `/tmp` all 7. (2) The narrowing contradicts the recorded contract (`issues/closed/akrogon-loop/github/pull-close/plan.md:18` D1) and arrived in hand commit 373538a. (3) Cross-repo closure already works through leaf `sources` (`src/pull.ts:123`, `src/phase.ts:149-167`); the pi-extensions leaves carried only #32 and #35. (4) pi-extensions#5 is already closed by hand with `delivered by same-repo-worktree-cwd 3b478e9`.
