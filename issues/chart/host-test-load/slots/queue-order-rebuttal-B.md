Misquote, agreed tag (B,C): B did not establish that “seat abort … end[s] a waiter”. `queue-order-B.md:11`, R3 and Q3 require proof that the caller actually terminates the admission process. Installed `~/.pi/agent/extensions/tamdoma-subagents/manager.test.ts:1663-1666` explicitly leaves the child running after wait abort.

Agreed line rejected: “A timed-out acquire reads as a red test” must describe the retry-amplification risk, not the required outcome. A cancelled request that never launched is no test result (`queue-order-B.md:9-11`). Outside tool deadlines still need this distinction even with no internal admission timeout.

D1: Keep one unclassified contention policy. Resolved phase/attempt fields make C's classification feasible, but its winner-release/yield mechanism still adds scheduling policy and can starve ordinary runs. `src/next.ts:1041-1075` establishes the merge path, not measured contention requiring priority. Accept unspecified order and no starvation guarantee explicitly.

D2: Keep live waiters with elapsed wait per leaf, plus the holder. Holder-only status cannot distinguish a waiting worker from active seat work, currently shown only as busy (`src/status.ts:106-114`). One record per contender reuses its owner identity when admitted. These records report activity and never determine acquisition order or hold capacity.

D3: Keep a request/end pair keyed by run ID, with admitted or cancelled-before-launch outcome. A wait field only on check_start loses requests cancelled before that event, while a lone check_wait cannot distinguish completed cancellation from missing history. Existing check events begin at execution (`src/timing.ts:35-44`). Mark unmatched admission history incomplete and keep overlapping worker waits separate from leaf-wide timing.
