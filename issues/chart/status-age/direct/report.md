# Report: total-time-column (direct)

Base 23bce8b7533aaa4992fb4bf44c7a398c4bce47df, head d0ad061.

## Changed files
- `tests/status.test.ts`, `tests/dependents-first.test.ts` (90f84e9): TIME expectations per the operator decision, with `Test-Change:` trailers.
- `src/status.ts` (d0ad061): TIME column from first delivered prompt in `issues/timings.jsonl` to the last move into merged/failed, or now; `clock` shared with the busy note; header `TIME`.

## Proof
| Criterion | Evidence | Commit | Result |
|---|---|---|---|
| red first | `bun test tests/status.test.ts tests/dependents-first.test.ts` (check red-first) | 90f84e9 | red: header and TIME cases fail |
| 1-5 | check status-tests-head, `check-status-tests-head-*.log` | d0ad061 | 39 pass 0 fail |
| 2 deliberate break | finished end forced to now, check deliberate-break | d0ad061 + local edit | frozen test red (1 fail), edit reverted |
| types | check typecheck | d0ad061 | exit 0 |
| 6 | `akrogon verify --holder` at landing | pending | pending |

Live read (no writes): worktree `akrogon status` in framework shows block-ledger `0h29m` (first prompt 13:50:15Z to merge 14:19:41Z), new-rules-pilot `0h31m` running.

## Known limitations
- A leaf that failed and was resumed counts the time it sat in `failed` (pilot-trials `8h16m`), as decided: first prompt to merge.
- `readTimings` warns and returns `[]` on a bad timings file, so that repo shows `-` (existing behavior, unchanged).
- During the break proof, `git checkout -- src/status.ts` discarded the uncommitted implementation, and it was reapplied with the same script. Same 59-line diffstat. Tests reran green on the committed head.
