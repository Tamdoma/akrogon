# Review B: phase-stale-tab

Date: 2026-10-03
Phase: check.review (initial, blind)
Base: `69038ef023a8434104bb9c6335f79daa1a6c2377`
Reviewed head: `0170deb4ff1365f1fbf55c542c62a6c429d09d51`
Verdict: ready

## Findings

No Fixes or Nits. The three-file diff meets D1–D7 and all five done-criteria. Debate is off, so positions and rebuttal artifacts are absent as expected. No peer review was read.

The real source is the operator's closed recorded tab described in the brief (#55), with the structured herdr 0.9.3 response recorded in readiness.yaml. Both rename callers now use the same helper. Only CommandError with parsed `tab_not_found` is swallowed, with one structured warning. That code remains non-retryable. Notification errors retain their original failure and persisted delivery status. State.tab is preserved, and the existing finally block still logs the committed move and propagates log failures. Other errors and tab allocation behavior are unchanged.

## Verification

- `bun run format`: exit 0, every file unchanged.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 399 pass, 0 fail, 18 files, 4390 assertions, 11.83 seconds.
- Configured changed-test check: reused the implementation report's unchanged-head evidence, 48 pass, 0 fail at this base. No further change or concern justified another run.

The full run includes the three new stale-tab CLI scenarios proving saved phase, unchanged state.tab, a single rename, parsed warning fields, persisted notification delivery and one log row. The non-retryable denial scenario proves one call and nonzero exit. Existing timeout scenarios prove two rename calls and nonzero exit at both rename sites. Existing log-diagnostic scenarios remain green.

Reviewed docs/reference-index.md, src/AREA.md, tests/AREA.md, docs/guide/phases.md and docs/guide/problems.md, including the documented `phase` then `next` recovery flow. No documented behavior changed. No AREA.md is in the diff.

The worktree remained clean and HEAD unchanged after checks. No live mutation was needed. Readiness has no grants or required environment inputs, and status reports no Missing entries.

## Operator actions

None.

## Phase result

`akrogon phase phase-stale-tab merge --slot B --verdict ready`: exit 0, `moved merge`. Removed the install test's generated local evidence file after verification.

## Merge verification: 2026-10-03

Prior reviewed head: `0170deb4ff1365f1fbf55c542c62a6c429d09d51`.
Fetched and rebased onto origin/main: `e68c865d697e253de2b50f6bbca0c5d44df99555`.
Rebased head: `9651ae7b927680358e0fa03ef38a459662433325`.
No conflicts or outstanding code changes. Refreshed AKROGON_BASE is the rebase target above.

`git range-diff 69038ef023a8434104bb9c6335f79daa1a6c2377..0170deb4ff1365f1fbf55c542c62a6c429d09d51 e68c865d697e253de2b50f6bbca0c5d44df99555..9651ae7b927680358e0fa03ef38a459662433325`:

```text
1: 0d86998 = 1: 3d29197 phase: tolerate tab_not_found on tab rename (warn once, continue)
2: 0170deb = 2: 9651ae7 format: prettier after renameTab changes
```

All configured checks ran on the rebased head:
- `bun run format`: exit 0, files unchanged.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 399 pass, 0 fail, 16.98 seconds. Log: `/tmp/akrogon-1000/phase-stale-tab-ba2a1bf499d2/tmp.h1ZvYBWTIi`.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 48 pass, 0 fail, 2.19 seconds. Log: `/tmp/akrogon-1000/phase-stale-tab-ba2a1bf499d2/tmp.B6JyKOsAzS`.

No merge_checks or advisory commands configured. Removed generated install-test evidence. Completion owner is standalone issue stale-tab, with its sole leaf brief already gathered. No reusable Nits or operator blockers.

Push: `git push origin HEAD:main` exited 0 and confirmed fast-forward `e68c865..9651ae7` to origin/main.
