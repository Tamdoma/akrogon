# Report brief-1: failed-transition announce

Changed files and reasons:
- src/shell.ts: moved herdrErrorSchema, retryableCodes, retryable from next.ts, exported retryable (D4).
- src/next.ts: deleted moved defs, added retryable to shell import. No logic change (D4).
- tests/fake-herdr.ts: tab rename, notification {shown,reason} with --body/--sound check, failNotificationOnce, failRename (D7).
- tests/helpers.ts: added fakeHerdr mirroring fakeGh (D8).
- tests/phase.test.ts: fake env for all moves to failed, herdrCalls reader, exact argv + delivery asserts, new test for criteria 2-5 (D8, criteria 1-5,7).
- src/phase.ts: herdrCall, announceFailed, commitMove wiring (D1-D3).

Tests run:
- bun run typecheck clean after shell/next, helpers/fake, and phase changes.
- Red (before src/phase.ts): stop test fails missing delivery shown; new announce test fails with [] calls, no rename. Proves no announce yet.
- Green: bun test tests/phase.test.ts -> 30 pass, 0 fail.
- Changed: AKROGON_BASE=f91cea968ac46f5a30119e4ce03eac611cc66abd bun test --changed -> 235 pass, 1 fail. Fail is only next.test.ts stale-misses exact failure object missing delivery (see limitations). All phase tests pass.
- Criterion 6 check: bun test -t "resumes interrupted tab creation" passes. Temp repro of that dispatch shows: code 0, phase failed, failure delivery shown, notifications [["notification","show","repo/retry failed","--body","attempts: attempts exhausted","--sound","request"]], renames [["tab","rename","w1:t1","retry failed"]]. Dispatch uses same commitMove path.
- Criteria 1-5 evidence (phase tests, all pass):
  - C1: stop failed records notification ['notification','show','repo/stop failed','--body','blocked: x','--sound','request'] + rename ['tab','rename','tab-1','stop failed'], delivery shown, exit 0.
  - C2: failed->implement records rename back; with failRename two renames, phase implement, exit non-zero, timeout in stderr.
  - C3: no-tab failed records notification only, zero renames.
  - C4: failNotification -> one notification, delivery error, tab renamed, exit non-zero; failRename -> delivery shown, exit non-zero.
  - C5: failNotificationOnce -> two notifications, delivery shown, exit 0.
  - C7: all phase moves to failed pass fakeHerdr env, no real herdr.

Known limitations:
- Fake notification allows old shape (title only, no body/sound) for busy + legacy failed_notified calls. Strict require would break observeBusy (untouched) and brief-2-owned failed block. New announce always sends body/sound and is validated when present.
- failNotificationOnce uses retryable timeout, not fixture_notification_failed as written. Non-retryable would give one call + exit non-zero, not criterion 5's two calls + exit 0. Chose retry behavior to meet criterion.
- next.test.ts stale-misses fails: expected failure lacks delivery shown, got delivery shown. Needs one-line add. File owned by brief 2 per do-not, left untouched. Dispatch announce itself verified (code 0, phase failed, delivery shown).
- When announce fails and logMove also fails, log error wins (finally). Move + delivery still stand.

Unverified criteria: none. Criteria 1-7 hold with above output.
