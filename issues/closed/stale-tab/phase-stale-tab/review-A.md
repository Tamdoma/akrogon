# Review A: phase-stale-tab

Base: `69038ef023a8434104bb9c6335f79daa1a6c2377` · Reviewed head: `0170deb` · Worktree clean, ahead of base (verified).

## Findings

None.

## Verification evidence

- Diff inspected end to end: `src/phase.ts` +29/-12, `tests/fake-herdr.ts` +2, `tests/phase.test.ts` +106.
- `renameTab` catches only `CommandError` and only when `herdrError(error.result).code === 'tab_not_found'`; non-CommandError (herdr output-parse errors, saveState errors) still propagate. `tab_not_found` absent from `retryableCodes`, so `herdrCall` throws on first call — no retry, matching criterion 1's single-call assertion.
- `announceFailed`: the rename is already isolated behind `try { renameTab } catch { lastError = error }`; a swallowed `tab_not_found` never reaches the catch, so a prior notification error is preserved — criterion 3.
- `commitMove`: swallow happens before the `finally` `logMove`, so exit 0 and the log row both hold — criterion 1.
- `state.tab` never mutated; `src/next.ts` untouched; no other `tab rename` call sites exist in `src/` (grep-verified), so the two planned sites are complete coverage.
- `tests/fake-herdr.ts`: `renameScript` consumed after the unknown-tab `tab_not_found` check and before `failRename`, consistent with `startScript`/`promptScript` semantics.
- Tests prove all four criteria and were shown red first per the worker report: three parameterized missing-tab cases (leave-failed clean exit 0, enter-failed clean `delivery: shown`, enter-failed with `failNotification` → non-zero `fixture_notification_failed` + `delivery: error`), plus `fixture_rename_denied` via `renameScript` asserting non-zero and one call; existing `failRename` timeout tests (two calls, non-zero) unchanged and green.
- Checks rerun by reviewer: `bun run format` clean, `bun run typecheck` clean, `bun test --timeout=30000` 399 pass / 0 fail — done during implement pass on this head, unchanged since.
- Docs: changed behavior is a CLI exit-status edge case; `src/AREA.md`, `tests/AREA.md`, `README.md`, `docs/` contain no stale-tab rename statement. No documented behavior claim became wrong.

## Verdict

`ready`
