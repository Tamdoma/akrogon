# Worker report: sub-brief 5, wiring (plan U5, wave 3)

Commits: 5386214 (src/akrogon.ts + src/next.ts), cdc57f6 (tests/next.test.ts, Test-Change trailer).

Changed files and reasons:

- src/akrogon.ts — criterion 1: phase case records { repo, to } from the phaseCommand result or MoveCommittedError and calls mergeWake(readGlobal(), committed.repo, committed.to); imports type Phase from ./routing.
- src/next.ts — criteria 2 and 3: mergeWake gains committedTo?: Phase before pressureDir and runs await selfUpdate(repo) as the first statement inside the existing try when committedTo === 'merged'. nextCommand computes updating repos after the selection line and before the global-lock withLock: every registeredRepos repo for --all/--resume, selection.repo for a manual next, none for hooked/tab_closed paths; each call is wrapped in a try/catch that console.warns so a hypothetical throw cannot alter the dispatch result. Imports selfUpdate from ./self-update and type Phase.
- tests/next.test.ts — criterion 4: appended selfUpdateMock script template, selfUpdateCli spawned-entry helper, selfUpdateCalls log reader, and four tests: (a) phase merged records f.root once with 'moved merged' and exit 0; (b) phase failed records zero calls; (c) SELF_UPDATE_THROW=1 mock still exits 0 on phase merged and still dispatches next (prompt asserted); (d) next --all/--resume record [repo, other], manual next records [repo] only, each entry preceding the dispatch herdr calls in the .calls log, and a tab_closed hook records nothing. The mock writes repo.root to SELF_UPDATE_LOG and appends ['self-update', root] to the fake-herdr .calls file for cross-ordering assertions.

Tests run:

- bun test tests/next.test.ts -t 'self-update' --timeout=30000 — 3 pass, 0 fail.
- bun test tests/next.test.ts -t 'record the registered or selected' --timeout=30000 — 1 pass, 0 fail.
- bun test tests/next.test.ts --timeout=30000 — 223 pass, 0 fail, 2019 expects.
- bun run typecheck — clean (tsc --noEmit).
- AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed=9e2dfbebcfd98e647d34bed995741410ce95c2e4 --timeout=30000 — 273 pass, 0 fail across 3 files.

Known limitations:

- A throwing selfUpdate inside nextCommand warns on stderr but is not reported through report(), deliberately: report() would set exit code 1 and mutate invocation.skipped, violating "merge/next result unchanged" (criterion 7, plan D8). mergeWake needs no such guard beyond its existing try/catch.
- Calls for --all/--resume run sequentially per repo; trivial since selfUpdate no-ops on non-self roots.

Unverified criteria: none.
