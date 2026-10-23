# final check — slot C: config-refusals

No disagreement.

## Verification notes

- D1 correction applied: Interpretation now names tests/sync.test.ts `remoteFixture`'s default `worktreeRoot = 'issues/worktrees'` (becomes external) and tests/init.test.ts `rootCases` repo-equal flipping from success to refusal; both added to owned surfaces (A,C). Matches the review.
- D2 correction applied: `worktreeStore` canonicalizes both operands itself, with the init call-site rationale (`initialize` uses raw `git rev-parse --show-toplevel` at src/init.ts:37 vs readRepo's realpathSync at src/config.ts:220). Matches the review.
- Criterion 6 matches the Retire section of /home/ivan/.akrogon/current/skills/lesson-rule.md verbatim in shape: remove the LESSONS.md line, append `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>` to the history file, same diff. The refusal qualifies as a stop "by a reader or writer that refuses loudly at the point of use": every store consumer resolves via `worktreeStore` (verify, batch, next, reconcile, sync, self-update, config — all confirmed at HEAD), so the mechanism is stopped on every reachable path.
- Conditional form is correct: `learnings/history/2026-10-22-in-repo-worktree-store-guard.md` is absent at this checkout and on origin/main at 92dddada (no file, no LESSONS.md line — verified). If it lands at the leaf's base via sync from the reporter's checkout, the retire branch applies; otherwise the report-only branch does.
- #113's exclusion is consistent with the rule: the own-modules message change is not a complete stop (the failure mechanism stays reachable), so its lesson line must be kept — "a failure after the harm is not a stop."
