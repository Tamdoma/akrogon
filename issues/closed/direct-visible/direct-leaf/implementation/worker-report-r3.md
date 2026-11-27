Changed files and reasons: `src/timing-report.ts` now uses the existing leaf inventory and `leafStart` from `src/status.ts` to join direct leaves at creation. Lifecycle leaves still join via delivered planning prompts. Both routes use the same cutoff, chronological order, 20-member cap, and 600-line diff limit. The same inventory supplies the direct flag for gap suppression. Run pairing is unchanged.

Tests run:

- `bun install --frozen-lockfile --backend=copyfile` passed before edits.
- `akrogon run-check --name r3-timing -- bun test tests/direct-timing.test.ts tests/timing-report.test.ts --timeout=120000` passed: 19 tests, 0 failures.
- `bun run typecheck` passed.
- `bunx prettier --check src/timing-report.ts` passed after formatting.

Kept check:

```text
check r3-timing: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r3-timing-1795641953577-1773496.log
```

Known limitations: None known.

Unverified criteria: None. The existing cohort tests exercise the shared membership limits, and the direct timing test verifies creation-based membership, gap suppression, and run pairing.
