# Fork notes, slot A: marker, 2026-11-19

## Q1 What marks it, how far the lock reaches
- Pick 1a: fixed heading start `## Operator decision (<name>, <date>)`, anything after the closing parenthesis on that line free; lock = text under it up to the next `## ` heading; body free, `Not in scope:` and `Done when:` optional; counts only in GitHub seeds (mirrored `issues/seeds/*.md`). Reason: matches #714 exactly, one literal a door can find without judging. Cost: a decision under another heading is asked as today (safe failure).
- Rejected 1b required parts: refuses a real decision over a missing line, and #714's form would need rewording.
- Rejected 1c door judges decision-like text: #714's `## Proposed solution (operator-requested …)` would read as locked; judgment where a literal suffices.
- Evidence: operator tier, #714 body (gh issue view, 2026-11-18); better-than-training, src/pull.ts `pullRepo` keeps the body unparsed so headings survive the mirror.
- Pitfall: two copies of the literal (seed-issue is standalone, links may not leave its folder per tests/docs-links.test.ts); removed by one binding decision holding the literal, copied into both leaves.

## Q2 Whose section counts
- Pick 2a: counts only when the issue author and every body editor are the door's own gh login, read once at import with one GraphQL call (`author`, `userContentEdits.editor`); otherwise plain intake, shown in the opening map as "marked but not taken" with the reason. Reason: Tamdoma/akrogon is public, so anyone can file the heading, and 1a binds unattended. Cost: one gh call per marked seed; it proves "this account", not "this person".
- Rejected 2b marker alone: an outside issue would steer unattended charts (Invariant Labs, "GitHub MCP exploited", 2025-05-26: a public issue's text hijacked an agent; Simon Willison's "lethal trifecta" names untrusted input plus tools as the risk).
- Rejected 2c author only: misses a collaborator's later edit adding or changing the section; the edit list is in the same call.
- Evidence: proof recorded in forks/marker.md `## Findings` (#714 author and 5 editors all ivanjuras).
- Pitfall: the door reads authorship from the mirror, which has none; removed by the import-time gh read. Pitfall: GitHub API down at open; then the section stays not taken and is asked as today (safe).

## Questions the fork does not ask
- Comments: excluded by signposts 4a.
