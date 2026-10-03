# Report: phase-stale-tab unit 1

Commit: 8d9ede872cd154e0bf288f2bc860c9f384989c92 (detached HEAD)

Changed files and reasons:
- src/phase.ts: added renameTab helper that swallows herdr tab_not_found after one warn; both rename call sites (announceFailed, commitMove resume path) now use it. herdrCall untouched; swallowed error never assigns lastError.
- tests/fake-herdr.ts: added renameScript to databaseSchema and a scriptedFailure hook in the tab rename handler, after the tab_not_found-for-unknown-tab check and before failRename.
- tests/phase.test.ts: added four tests covering criteria 1-4 (missing tab on failed->implement resume, missing tab on failed announce clean, missing tab plus notification failure preserving fixture_notification_failed, and non-tab_not_found rename failure via renameScript still erroring with one call).

Tests run: bun test tests/phase.test.ts --timeout=30000: 48 pass, 0 fail. bun test --changed=69038ef023a8434104bb9c6335f79daa1a6c2377 --timeout=30000: 48 pass, 0 fail. bunx tsc --noEmit: clean. New tests confirmed red before the src/phase.ts change.

Known limitations: none known.

Unverified criteria: none.
