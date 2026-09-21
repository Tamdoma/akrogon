# Intake: source-closure

## Scope
Destination: the akrogon command and the chart-issues door. A GitHub report that the door finds already delivered, or a duplicate of another identity, gets closed on GitHub by the command with a comment naming what delivered it, so `akrogon pull` stops re-mirroring it. One chart, one destination.

## Provenance
- GitHub: Tamdoma/akrogon#26
- Operator: 2026-09-21 message "Ok, now let's try the updated chart-issues on the one leftover issue that was pulled. You can delete the one that was a duplicate that got fixed."

## Source: Tamdoma/akrogon#26
# Sources found already fixed at chart intake are never closed on GitHub, so pull re-mirrors them forever

Source: Tamdoma/akrogon#26
URL: https://github.com/Tamdoma/akrogon/issues/26

## Observation

A GitHub issue that the chart door finds already fixed, or a duplicate of a merged leaf's source, is never closed on GitHub. `akrogon pull` re-mirrors it into `issues/seeds/` on every run and the chart door skips it silently because a chart intake mentions it. The issue looks open forever and nobody is told.

Two live cases in the framework repo today:

| Seed | Filed | Fixed by | Merged | Leaf sources |
|---|---|---|---|---|
| Tamdoma/tamdoma-framework#16 | 2026-09-18 06:45 | leaf `fixture-isolation` | 2026-09-16 09:05 | `#7` |
| Tamdoma/tamdoma-framework#30 | 2026-09-18 14:01 | leaf `subagent-stop-completion` | 2026-09-18 10:10 | `#15` |

Both reports came from a consumer running a bundle older than the fix. Both were correctly judged "already fixed, no leaf" at chart intake on 2026-09-19 (recorded in CHART.md Off route). Both are still OPEN on GitHub and `akrogon pull` prints `framework: 2 open issues pulled` every time.

## Mechanism

The only path that closes a GitHub source is `closeSources` in `src/pull.ts`, called from `src/phase.ts:161-166` when a leaf reaches `merged`. It closes exactly the identities in the merged leaves' `sources`. A report that arrives after its fix has merged is never in any leaf's `sources`, so nothing ever reaches `gh issue close` for it.

The chart door has a verdict for this case (fixed at intake, duplicate, off route) but the command has no operation that turns that verdict into a GitHub close. The dedup rule in the door (skip identities present in any chart intake) then hides the seed on later passes, so the leak is invisible.

## Expected

Every GitHub identity that enters the mirror ends in one of two states: closed on GitHub by the command with a comment naming what delivered it, or carried in the `sources` of an open leaf. Nothing sits open on GitHub with no leaf and no close.

## Suggested shape

One command-owned close for a source with no leaf, for example `akrogon close <owner/repo#n> --by <slug|commit>`, reusing `closeSource` and posting a comment like `delivered by leaf fixture-isolation (commit ...)`. The chart door calls it when it records "closed at intake". A `pull` that finds a mirrored identity already named as delivered in a chart should warn instead of silently re-writing the seed.


## Source: operator 2026-09-21
Ok, now let's try the updated chart-issues on the one leftover issue that was pulled. You can delete the one that was a duplicate that got fixed.

## Agent findings
- Live case in this repo on 2026-09-21: Tamdoma/akrogon#21 is in `issues/closed/noninteractive-leaf-execution/chart/INTAKE.md` provenance, off-routed in that CHART.md as seeded to Tamdoma/pi-extensions#1 (closed 2026-09-19, comment `merged f9aa1e8`), and still OPEN on GitHub; `akrogon pull` printed `2 open issues pulled` and rewrote its seed.
- `src/pull.ts:64-75`: pull rewrites every open issue's seed and deletes any seed not in the open listing, so deleting a seed by hand is undone on the next pull. The only durable removal is a GitHub close.
- `src/pull.ts:107-182` `closeSource`: view state, skip when CLOSED, close with comment `merged <commit>`, one retry with a comment-existence check. `src/pull.ts:184-206` `closeSources` requires a leaf worktree for the commit. Called only from `completeOwner` in `src/phase.ts:138-176` for merged leaves' `sources`.
- `src/akrogon.ts:9-18,27-75`: verbs are a literal table with per-verb options; no verb closes a source outside the merge path.
- The door's dedup rule (`skills/chart-issues/SKILL.md:29`) skips identities already in any chart intake without printing them, which is why the leak is silent.
- A door pane running `gh issue close` directly was denied by the Claude Code permission classifier on 2026-09-21 (External System Writes); the operator had to be told to close #21 by hand.
- `tests/fake-gh.ts` already models a stateful `gh issue view/close` pair used by the closure tests.
