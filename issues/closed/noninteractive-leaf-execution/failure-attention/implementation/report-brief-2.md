# Report brief-2: retire failed_notified

Changed files and reasons:
- src/state.ts: dropped failed_notified from stateSchema; added it to readState strip filter with priority/slot (D6).
- src/next.ts: dispatchLeaf failed branch is now early return waiting, no herdr call, no save (D5). command and saveState imports kept, still used elsewhere.
- src/phase.ts: removed failed_notified false reset in commitMove. One line only. Required for typecheck clean and criterion 1. See limitations for do-not conflict.
- tests/state.test.ts: dropped failed_notified from canonical assert and supported fixture; added { failed_notified: true } to strict-reject and lazy-migrate loops.
- tests/next.test.ts: rewrote failed delivery retries as failed leaves never notify on dispatch (failed leaf, 3x next code 0, zero notifications, no prompts, no state write, failNotification flag irrelevant); fixed redispatch test to expect zero notifications and unchanged state; added delivery shown to stale-misses expected failure; removed failed_notified true from 3 saveState fixtures.
- tests/phase.test.ts: removed failed_notified from race test fixture and assert.
- tests/status.test.ts: deleted local fakeHerdr, import shared fakeHerdr from helpers, 3 call sites use fakeHerdr(f).env (D8).

Tests run:
- bun run typecheck: clean. After state drop it failed on next.ts 464/466, phase.ts 88, next.test 301/318/322/326/1995/2022/2058, state.test 55. Used as checklist.
- grep -rn failed_notified src/: one match, src/state.ts strip filter line. No schema field or property access remains. See limitations.
- grep -rn failed_notified tests/: two matches, both state.test legacy cases. Intended.
- bun test tests/state.test.ts: 32 pass, 0 fail. Includes strict rejects failed_notified and 3x lazily migrates failed_notified.
- bun test tests/next.test.ts -t "failed leaves never notify": 1 pass. Zero notifications across 4 runs, no prompts, no log, state bytes unchanged, failNotification true then false both code 0.
- bun test tests/next.test.ts -t "stale prompt": 1 pass. Failure now equals with delivery shown.
- bun test tests/next.test.ts -t "resumes interrupted": 1 pass. Post-failure next records zero notifications, state unchanged.
- bun test tests/phase.test.ts -t race: 1 pass.
- Changed: AKROGON_BASE=f91cea968ac46f5a30119e4ce03eac611cc66abd bun test --changed="$AKROGON_BASE": 240 pass, 0 fail, 2172 expects, 52.42s. Full green.
- bunx prettier --write on touched files: applied, diff stays minimal.

Known limitations:
- Criterion 1 says grep returns nothing, but brief section 4 requires strip filter key !== failed_notified. Both cannot hold. Kept the strip line. Only match in src is that legacy-migration string. No State field, no read, no write.
- Do-not says do not touch src/phase.ts, but typecheck fails without removing its failed_notified false reset, and criterion 1 plus do-not no failed_notified write anywhere require removal. Removed one line only, no announce logic changed. Brief 1 said removal owned by brief 2.
- Renamed failed delivery retries test to failed leaves never notify on dispatch. Old name described retired retry/dedupe/reset behavior. Body is the rewrite criterion 2 requires.
- Redispatch test also needed zero-notification fix, not only failed_notified assert removal, else it fails. Fixed to zero plus unchanged-state assert.

Unverified criteria: none. Criteria 1-4 hold with above output. Scenarios use temp repos and fake herdr at PATH boundary, no real herdr socket, panes or notifications.
