U1 mismatch evidence (returned to A per brief-1 section 5)

Locked tests assume leaf dirs sit directly under issues/<state>/:
- tests/log-reader.test.ts:41  leaf(f,'owner','merge') -> <root>/issues/open/issue/owner
  (helpers leaf(): resolve(f.root,'issues/open',container,slug), container defaults to 'issue')
- tests/log-reader.test.ts:40  file written at .../issues/open/issue/owner/check-1.log
- tests/log-reader.test.ts:47-50 recorded args use issues/open/owner/check-1.log (no 'issue' container)
  and the nested-member case issues/open/owner/issues/chart/c/direct/nested/issues/check-x.log
  whose plain file lives at .../issues/open/issue/owner/issues/chart/...
- brief-1 section 4: first part after issues/(open|closed|parked)/ is the owner.
  Owner 'owner' -> ownerDirs issues/{open,closed,parked}/owner; issues/open/owner does
  not exist (the dir is issues/open/issue/owner) -> cases 2,3,5 return nomatch.
- Same assumption in tests/flaky.test.ts:73-90: leaf dir is issues/open/issue/leaf,
  absolute log arg locates owner 'issue' -> archive at issues/open/issue/... not found.
- tests/log-reader.test.ts cases 1 and 4 (absolute path + cwd-relative inside the leaf)
  do pass with brief-1 semantics; test 2 passes (rename makes issues/closed/owner real).
- Real layout per src/park.ts/state.ts/run-check.ts:208: issues/<state>/<issue>/<leaf>/...;
  check logs are recorded inside the leaf dir, so the owner IS the first part after the
  state folder (e.g. issues/open/check-evidence/log-reader/implementation/check-*.log).
Smallest correction: the recorded args in test 1 cases 2,3,5 need the container prefix
(issues/open/issue/owner/...) OR leaf() needs a container-free overload; both are locked
test/helper edits, outside U1 scope.

tsc: 6 pre-existing tests/flaky.test.ts "Expected 1 arguments" errors (brief said two);
all against the not-yet-updated flakyLines signature, per plan C4/U3.
