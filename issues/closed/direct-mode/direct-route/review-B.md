# Review B: direct-route

Date: 2026-10-08
Base: `d17029e2b0a8c369ee366a91bf12346141fc508a`
Reviewed head: `3bb3fdf785057d3032d79d2b7305f05c33f2f1f1`
Verdict: **ready**

## Scope and evidence

Reviewed the complete eight-file diff against brief.md, design.md, plan.md and implementation/report.md. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read.

- Criterion 1: destination opt-in gates the offer. Off/absent preserves lifecycle review with an unavailable line. Eligible charts receive the combined route/debate choice, existing session authorization counts, and CHART.md records the route.
- Criterion 2: all five eligibility refusal groups are present, including charting-proof exclusion, unfinished dependencies, pending human prerequisites and unnamed B.
- Criterion 3: the numbered landing protocol requires B approval of a committed head, fetch/rebase, focused conflict re-check, checks then merge_checks, guards, exact-SHA non-force push, at most two push attempts, source close, configured broadcast, verified worktree and branch removal, and the closing marker. Guard invocation follows fetch/rebase. Root reset is prohibited.
- Criterion 4: repair rounds use configured fix_rounds and persistent chart counts. Exhaustion choices, growth triggers, partial commit, lifecycle adoption by branch slug, abandonment and the one-live-branch rule are present. The shape records base, head, counts, review paths and landed SHA.
- Criterion 5: the script validates argv with a tuple, loads the registered repo and calls the four unchanged exported phase guards in phase order with their default comparison target. Errors propagate directly. The CLI tests use real isolated Git repositories and exercise each refusal plus a clean cited branch. Report evidence records five passing tests and four deliberate guard removals each producing one failure before restoration.
- Criterion 6: implementation uses the named worktree and chart plan/report paths, B returns only the named review file without phase calls, broadcast accepts the direct sender/context, and the operator guide links to the owning skill rules.

The changed behavior's live documentation was reviewed in docs/guide/chart.md and docs/guide/setup.md, plus docs/guide/merge.md for the report's stale-hit claim. The merge guide describes lifecycle completion broadcasts and omits direct completion, while the chart guide and owning broadcast skill now explain it. This omission does not block the direct path or contradict an executable command, and the plan expressly excludes editing that guide.

No AREA.md file is changed. Read the reference index and the skills/tests area pointers for context.

Reused the final-head implementation evidence under the review rerun rule: format and typecheck exit 0, full suite 539 pass / 0 fail, changed suite 5 pass. The report identifies pre-existing status.ts formatting drift and records its restoration. No code changed during review and no specific failing-check concern requires a rerun. Independently ran git diff --check over the reviewed range: exit 0. Worktree status is clean.

## Test-Change trailers

None in `d17029e2b0a8c369ee366a91bf12346141fc508a..HEAD`. The only changed test file is newly added tests/direct-guards.test.ts. No existing test assertion, fixture or recorded output changed, so no trailer is required by src/test-files.ts and the phase guard.

## Findings

No Fixes or Nits. No operator actions. No reusable Nit requires a learning record.

## Merge 2026-10-08

Attempt: `adbc1a9d-7cc5-49be-a1f5-e1783da3aa4e`. Applied top: `3bb3fdf785057d3032d79d2b7305f05c33f2f1f1`. Integration base: `d17029e2b0a8c369ee366a91bf12346141fc508a`. No carried members. No fetch, rebase or commit by the seat.

Every configured check passed on the recorded top:
- `bun run format`: exit 0, 0.93 s. Restored its rewrite of the known pre-existing src/status.ts drift to the exact pre-run bytes. Log: merge-format.log.
- `bun test --timeout=30000`: exit 0, 539 pass / 0 fail, 27.01 s. Log: merge-test.log.
- `bun run typecheck`: exit 0, 1.37 s. Log: merge-typecheck.log.
- `bun test --changed="d17029e2b0a8c369ee366a91bf12346141fc508a" --timeout=30000`: exit 0, 5 pass / 0 fail, 0.10 s. Log: merge-test_changed.log.

No merge_checks or advisory commands are configured. Gathered all three direct-mode leaf briefs for the potential issue completion broadcast. Both sibling leaves are already merged.

Merge guard returned `ok`. The merge command exited 0 and printed `moved merged` and `issue complete direct-mode`, confirming delivery of the tested top and completion of the owner. Worktree and branch cleanup remain command-owned on idle/sweep.
