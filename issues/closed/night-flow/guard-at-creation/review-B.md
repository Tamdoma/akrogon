# Review B: guard-at-creation

Date: 2026-10-11
Phase: check.review
Base: c53f6196533289555518577f08907ec9c713721c
Reviewed head: 500d2154ec3066621587738e35a076fc8a00c53e
Target ref inspected: origin/main (ad5008138bcbddb9d04b808c7226168b2f45f6e5)
Verdict: ready

## Findings

No Fixes or Nits. No operator actions. Debate is off, so positions-B.md and rebuttal-B.md are not expected. Review was independent of the peer's review.

## Verification

- Read brief, plan, design, implementation report, worker briefs, the affected documentation, and the complete base-to-head diff. The two withSetup forms only lose the ancestor prefix. Setup remains flocked, own-modules remains before the check, and checks, merge_checks and advisory share the same composition.
- Traced creation through ensureWorktree -> createSparseWorktree -> checkLocation and buildStack -> createSparseWorktree -> checkLocation. All creation code is unchanged. base-run's separate ancestor prefix is unchanged as required by design D2.
- Independently ran `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'` successfully, then `bun test tests/config.test.ts tests/guard.test.ts tests/worktree-store.test.ts tests/batch.test.ts --timeout=30000`: 51 pass, 0 fail, exit 0. Output: implementation/review-B-criteria.log. This consolidates the plan's proof commands for criteria 1–3 at the same files and timeout.
- Tests exercise real printed CLI commands with and without setup under a dirty ancestor, own-modules refusal before check execution, fresh-worktree installation, setup lock behavior, and both leaf and batch creation refusal. Existing package.json ancestor coverage exercises the same checkLocation predicate. No planned test was removed, skipped, filtered or disabled.
- Reused unchanged implementation evidence: full suite 793 pass / 0 fail, format clean, typecheck clean, and changed-test run 628 pass / 0 fail. Inspected implementation/check-test_changed-1791713923526-3892582.log, including its terminal summary. Plan records fail-before results; report records deliberate ancestor-prefix restoration producing three failures and subsequent restoration. No code changed during this review.
- All three temp-file sentences place only temp files and logs under TMPDIR and require base copies through akrogon base-run. Reviewed skills sweep by meaning, including unchanged base-run paragraphs, worker-worktree instructions, chart brief temp paths, init proposal mktemp, and watch script fixture-provenance comments. No manual base-checkout instruction found. Out-of-scope hits are recorded in the report.
- Changed src/AREA.md accurately describes the composed commands and creation-time guard. README's explicit guard command remains accurate, and docs/guide/phases.md and tests/AREA.md remain consistent. Listed every file path named by src/AREA.md in one repository-root command: docs/reference-index.md, src/akrogon.ts, src/base-run.ts, src/compare.ts, src/config.ts, src/init.ts, src/phase.ts, src/preflight.ts, src/readiness.ts, src/red-record.ts, src/shell.ts, tests/helpers.ts all exist. issues/base-runs.jsonl and issues/red-records.jsonl are absent in both this sparse worktree and the registered checkout. They are generated record destinations written under repo.root, not navigation pointers to required source files, so absence has no current dead-pointer consequence.
- `git diff --check` passed. Worktree is clean and HEAD remains the reviewed commit. No lessons were removed and no reusable Nit remains to record.

## Test-Change trailers

Inspected all trailers in origin/main..HEAD. Commit 1f82d8d48f44a7b098ddc1a5b5ca1c43f0fda365 contains:

- `Test-Change: tests/config.test.ts brief done-criterion 1: composed check commands drop 'akrogon guard ancestors'` — valid source. The old prefix expectation contradicts criterion 1. Only the helper and setup-form expectation change.
- `Test-Change: tests/guard.test.ts brief done-criterion 2: dirty-ancestor refusal inverted into completion under both config forms` — valid source. The old refusal contradicts criterion 2. Own-modules refusal coverage stays intact, and the revised case verifies completion under both forms.
- `Test-Change: tests/batch.test.ts added buildStack store-refusal case; no existing expectation changed` — valid explanation of an added test proving criterion 3. No old expectation is changed or deleted.

All three paths match src/test-files.ts. No test-runner configuration changed.

## Merge verification: 2026-10-11

Attempt: 0656f69f-83b5-4389-823d-f0d06e14aca5
Base: ad5008138bcbddb9d04b808c7226168b2f45f6e5
Tested top: ec6abce36675cd5100b02f0f2191cc56f6aaa82b

The command applied the holder alone, with no carried members. HEAD matched the prompt, and the worktree was clean. Range-diff from the reviewed range to the applied range shows all three commits unchanged. No fetch, rebase or commit performed by this seat.

- `format`: `akrogon run-check --name 'format' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"'bun run format'"'"''`. Exit 0. Log: `/home/ivan/Work/infra/akrogon/issues/open/night-flow/guard-at-creation/implementation/merge-format.log`.
- `test`: `akrogon run-check --name 'test' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"'bun test --timeout=30000'"'"''`. Exit 0. Log: `/home/ivan/Work/infra/akrogon/issues/open/night-flow/guard-at-creation/implementation/merge-test.log`.
- `typecheck`: `akrogon run-check --name 'typecheck' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"'bun run typecheck'"'"''`. Exit 0. Log: `/home/ivan/Work/infra/akrogon/issues/open/night-flow/guard-at-creation/implementation/merge-typecheck.log`.
- `test_changed`: `akrogon run-check --name 'test_changed' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'"'"''`. Exit 0. Log: `/home/ivan/Work/infra/akrogon/issues/open/night-flow/guard-at-creation/implementation/merge-test_changed.log`.

Results: format clean, full suite 814 pass / 0 fail, typecheck clean, changed tests 649 pass / 0 fail. All configured checks ran with the refreshed AKROGON_BASE above. merge_covers, merge_checks and advisory are empty.

Completion-owner check: night-flow/ISSUE.md lists this leaf alongside pass-refresh, plan-not-cap, records-sync and seat-retry, whose states remain open. This batch cannot close night-flow, so there is no completion owner to broadcast.

Merge guard: `akrogon phase guard-at-creation merged --slot B --check --attempt 0656f69f-83b5-4389-823d-f0d06e14aca5` returned `ok`.
Landing: `akrogon phase guard-at-creation merged --slot B --attempt 0656f69f-83b5-4389-823d-f0d06e14aca5` exited 0 and printed:

```text
moved merged
deployed ad5008138bcb..ec6abce36675
```

No issue/epic completion line was printed, so no broadcast was triggered.
