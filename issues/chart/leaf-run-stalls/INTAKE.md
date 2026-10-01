# Intake: leaf-run-stalls

## Scope
One destination: akrogon skills (chart-issues, implement-issue, worker-protocol), so a leaf no longer stalls overnight on provider deaths or an unmeetable criterion, and charting splits separable producers. Operator steps outside leaves: pi retry settings, framework base and `checks`, the live emdash-conversion leaf, emdash-launch's criterion.

## Provenance
- GitHub: Tamdoma/akrogon#45
- GitHub: Tamdoma/akrogon#46
- GitHub: Tamdoma/akrogon#47
- Operator: chart-issues door 2026-10-01

## Source: Tamdoma/akrogon#45
# One leaf can be charted with the scope of several, and every phase runs long as a result

Source: Tamdoma/akrogon#45
URL: https://github.com/Tamdoma/akrogon/issues/45

Unverified intake.

## Observation
The leaf `emdash-conversion` (repo tamdoma/framework, `issues/open/emdash-cms/emdash-build/emdash-conversion`) was charted as one leaf covering a whole new skill:
- `plan.md` has a 20-item ordered checklist and 11 acceptance criteria (C1-C11).
- The scope covers 9 scripts, a lib layer, gate edits in another skill (`dev-build-astro`, 11 gates), an e2e suite, unit tests, and registration.
- The implement diff is 193 files, 12,795 insertions and 93 deletions.

Phase timeline from `issues/log.jsonl`:
- plan.synthesis -> implement: 2026-09-30T18:23Z
- implement -> check.review: 2026-10-01T02:51Z (8h28m; includes an operator stop for a provider switch)
- check.review -> check.fix: 2026-10-01T03:00Z (fix_rounds=1, verdict A=nits, B=fix)
- check.fix was still running at 2026-10-01T04:14Z. Seat A spent about 2 hours writing 4 repair briefs (fix-A to fix-D, file times 05:03-05:04 CEST). Fixes A, B and C were committed at 06:10 CEST, and fix-D was still running.

The size shows up in every phase:
- Implement needed 11 worker chunks (brief-1 to brief-11) plus 5 remainder chunks.
- Review B filed 9 fix findings (F1-F9).

Six other leaves depend on this one, directly or through `emdash-launch`: emdash-content-fixes, emdash-launch, emdash-fleet-backup, emdash-health-run, emdash-offer-join and emdash-upgrade-route. All six stayed idle in plan.synthesis the whole time.

A search of akrogon `skills/` and the framework skills found no leaf size limit or split rule applied at charting.

## Location
Charting (`skills/chart-issues`) and leaf sizing. Observed on tamdoma/framework leaf `emdash-conversion`.

## Reproduction
Chart an issue whose leaf brief creates a whole skill with multiple scripts, cross-skill edits and e2e tests. Charting accepts it as one leaf. Observed once, on this leaf.

## Expected behavior
Not provided. The operator considers more than 12 hours for one leaf, while six dependents wait, unacceptable.

## Urgency
High. One leaf on the critical path blocks a six-leaf epic overnight. No workaround is known besides splitting by hand before charting.

## Source: Tamdoma/akrogon#46
# Implement workers that die on provider errors lose their report and need hand-written remainder briefs

Source: Tamdoma/akrogon#46
URL: https://github.com/Tamdoma/akrogon/issues/46

Unverified intake.

## Observation
During implement of `emdash-conversion` (tamdoma/framework), 5 of 11 worker chunks needed a second "remainder" chunk: brief-5r, 6r, 7r, 8r and 11r, under `issues/open/emdash-cms/emdash-build/emdash-conversion/implementation/`.

Reasons stated in the remainder briefs:
- **Worker died on a provider 503 (`service_overloaded`) with no report, edits left uncommitted:**
  - U5: all edits done, none committed.
  - U7: about 1,270 lines written across export/import and tests, none committed.
  - U11: died twice. The first U11r run also died on a 503.

  In each case seat A had to inspect the retained worktree and write a new remainder brief ("Finish worker UN's brief in its retained worktree...").
- **Worker finished but missed its brief:**
  - U6 did not meet the compare contract (exit semantics, output file form, read-only crawl).
  - U8 left part of C7 unmet (Croatian labels).

  Each needed a corrective remainder brief.

The pi harness runs these workers as in-process subagents. A worker that ends on a provider error produces no report, and the parent loses time writing, verifying and redispatching each remainder by hand. The U11 chain alone covered several hours of the 8h28m implement phase.

## Location
Implement phase worker dispatch (pi harness subagents, seat A). Observed on tamdoma/framework leaf `emdash-conversion`, 2026-09-30 to 2026-10-01.

## Reproduction
Run a multi-chunk implement during provider overload. Workers that hit a 503 stop without a report. Observed 4 times in one leaf (U5, U7, U11, U11r).

## Expected behavior
Not provided.

## Urgency
High. Provider errors turn into hours of manual recovery inside one leaf. The workaround is the parent agent writing remainder briefs by hand.

## Source: Tamdoma/akrogon#47
# Implement hands off to review with a done-criterion check still red, attributed to base

Source: Tamdoma/akrogon#47
URL: https://github.com/Tamdoma/akrogon/issues/47

Unverified intake.

## Observation
`emdash-conversion` (tamdoma/framework) moved from implement to check.review at 2026-10-01T02:51Z while done-criterion C1 was failing. C1 requires `bun run framework:verify` to pass.

`implementation/report.md`:
- Line 27: "`bun run framework:verify` → exit 2, but failures are pre-existing on base".
  - `lint` exit 1.
  - `skills:typecheck` exit 2, with 2 errors in `dev-cf-workers-deploy/test/access-gate.test.ts` and `emdash-profile.test.ts`, which are byte-identical to base.
- Line 69: "C1–C11 all verified per links above (C1 modulo pre-existing base red)."

Review B reproduced the failure and filed it as fix finding F1 ("C1 remains failed"). Its trace says: "The report's attribution to base does not satisfy the unchanged acceptance criterion. Resolve the blocking check or explicitly settle the criterion through the lifecycle." Review B also found the verify run stopping early on mojibake in a nested fixture's installed `node_modules/iconv-lite/README.md:112`. That is residue created by this leaf's own tests.

In check.fix round 1, seat A recorded F1 as "Documented, not repaired", because fixing the base failures would breach scope. This leaves C1 as a criterion the leaf cannot meet. Nothing settled it before implement handed off, so a full review and fix cycle was spent on it.

Logs: `issues/open/emdash-cms/emdash-build/emdash-conversion/review-B-evidence/framework.log` and `typecheck.log`.

## Location
The implement -> check.review handoff, and how done-criteria that reference repo-wide checks are written at charting. Observed on tamdoma/framework leaf `emdash-conversion`.

## Reproduction
Chart a leaf whose done-criteria require a repo-wide check (`framework:verify`) that is already red on base. Implement reports it as pre-existing and hands off. Observed once.

## Expected behavior
Not provided.

## Urgency
Medium. It costs a review and fix cycle per affected leaf, and it may recur on every leaf that cites `framework:verify` while base is red. No workaround is known.

## Source: operator 2026-10-01
Look at the new 3 pulled issues. This is unacceptable. We need to go through this and resolve it. I need the most elegant solution that builds on the entire machinery without creating new complexities if not completely necessary. Use slot B consultant (codex, spawn the pane, use default effort) and slot C consuktant (Claude Fable 5.1 with medium effort, also spawn it). We need to get to the bottom of these systemic issues. The intent is to have a smooth implementation process that doesn't get stuck like this over night, because I lose hours and hours. That leaf is still being worked on in the framework workspace, which is just crazy.

## Agent findings
See slots/map-merged.md (A, B, C) and the fork files.
