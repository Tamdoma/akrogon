# quick-red

## Question

Q1. When a quick check (format, typecheck: about 2 s each) is red, should `akrogon verify` skip the slow test check on that pass, and if so by which rule (stop the sequential stage at the first red after reordering config so quick checks come first; run every quick check and skip only checks named in `full`; or something else)? Or keep running everything?

Q2. Does per-command reuse (`reuseSource`, the copy of green entries from an earlier row on the same tree into a new pass) stay, or is it deleted?

Q3. What proof shows it works, without going overboard?

### Carries

- Operator 2026-11-01: "Less is always more (less code, even removing)"; "do testing to confirm it works. Don't go overboard with testing, do something reasonable."
- Operator 2026-10-24 (verify-waste `forks/receipts.md` `## Refined at draft review`): "keep every member running after a red ... Reason: after member receipts, a same-tree rerun reuses every finished green member, so work after the first red is wasted only when the fix changes the tree. Re-measure that case after member-receipts lands." This fork is that re-measure and reopens the answer if the data says so.
- Lock cited there: "a failing run shows every failure" (framework verify-gate reporting-main-run 2026-10-03, merge-gate fail-fast 2026-10-10).
- Taken: [merge-reuse](merge-reuse.md) Q2, one row rule: a row counts only as a whole (same tree, completed, `sameCommands`), green when every entry is exit 0; `runOnce` writes a full row by copying reused entries. Scope leaves `reuseSource` if it stays.
- Related: verify-waste Q1 (member receipts, A's autopilot pick 2026-10-24) added `reuseSource` (fbac86c6). Framework's planned member split is a pending step in verify-waste `## Pending steps`; framework config today is `checks: {cheap}`, `merge_checks: {verify}`, `merge_covers: [cheap]`.
- Measured 2026-11-01 (INTAKE.md `## Agent findings`): runs with a red quick check where the test still ran: 47 of 243 before 2026-10-26, 4 of 50 after; reused entries since 2026-10-26: 6 of 150.

## Findings

Blind notes `slots/quick-red-A.md`, `-B.md`, `-C.md`, `-D.md`; merged `slots/quick-red-merged.md`; rebuttals `slots/quick-red-rebuttal-B.md`, `-C.md`, `-D.md`; final shape `slots/quick-red-final-shape.md` with `-final-check-B/C/D.md`.

- The 2026-10-24 re-measure: 51 head runs ran the test beside a red quick check, 124.6 min of test execution, median 137 s (79 s since 2026-10-26); 47 of 243 runs before 2026-10-26, 4 of 50 after; none of those test results was ever reused, every quick repair landed on a new tree (B,C,D). So "work after the first red is wasted only when the fix changes the tree" is the common case, not the exception. 13 of the 51 also had a red test, found one pass later under the new rule (B,C,D).
- Per-command reuse: akrogon 6 of 150 head entries since 2026-10-26, all format or typecheck, test never; framework 0 on 1,741 head rows, 18 reused entries all on known-red base passes over an already whole-green base tree, median 269 s at merge scope (D).
- Blocked entries are already excluded by every consumer (`src/verify.ts:228, 235`, `src/flaky.ts:33`, `slowEligible`) (B,C,D). A blocked `full` entry can never be known-red covered, so a repo whose quick check is red on base and emits failed test names would block every merge until main is fixed; in akrogon quick reds never yield test names (`src/flaky.ts:18-21`), so this is already true today (C final check D1, C notes Q1 Evidence).
- Only akrogon declares `full`; blepsis lists test before typecheck with no `full` (C rebuttal R1). A config reorder on main before the leaf lands would void every receipt with no benefit until landing (C rebuttal R2).
- An unconditional "green base means known-red fails" guard could reject a pair the gate accepts (B rebuttal R2); returning the existing judge's result avoids that.

## Taken

A's pick under autopilot, 2026-11-01 (not operator words). It reopens the operator's 2026-10-24 answer "keep every member running after a red" on the re-measure that answer asked for, and verify-waste Q1 (A's autopilot pick 2026-10-24) for per-command reuse.

1. Q1: a check named in `full` is recorded `blocked` (existing field, the blocker's exit and log, as merge members are) when setup or any non-`full` check in the pass is red. A red `full` check never blocks another `full` check; merge members keep their current stage rule. `verifyCommands` lists non-`full` checks first, then `full` checks, each in config order, then `merge_checks`; no config edit on main. Each red-disposition copy in the seat skills says a blocked check did not run and its blocker is fixed first. Recorded limitation, beside the member one: a blocked entry is never known-red cover. Reason: the slow suite on a tree that must change proves nothing; every quick failure still shows, so the "a failing run shows every failure" lock narrows only across the quick/full boundary. Rejected: stop at first red (hides the other quick check); keep (measured waste); a name or duration rule; reordering config on main (voids receipts before the skip exists); blocking full after full. Dissent: B (keep runner order and reorder config).
2. Q2: delete `reuseSource` and its two `runOnce` branches; keep the `reused` schema field and every consumer guard so old rows parse and stay excluded. In `verify --known-red`, when the merge-base tree already holds a whole-green row (the merge-reuse green predicate), run no base pass and return the existing `knownRedReceipt` judgment, the same judge the gate uses; that is today's outcome without copying entries and keeps framework's base-side saving. Skill text promising per-command reuse is amended. verify-waste's pending framework member split keeps parallel members and one setup, but a head retry repays green siblings. Reason: reuse saved six 2-second commands in akrogon and nothing on framework heads. Rejected: keep it; keep it for full checks or base passes only; delete the schema field. Dissent: C (delete the base shortcut too and let framework re-raise with data).
3. Q3: one verify case (a quick check red, the other quick check runs, the `full` command's marker absent and its entry blocked, the gate refuses; after the fix on a new tree the full check runs and the gate accepts); a red `full` check does not block a second `full` check; the known-red case with an already-green base runs no base pass and returns the judge's answer; reuse tests converted to "a same-tree retry re-executes and writes no `reused`" or deleted; the schema-compat and all-members-finish tests kept. Focused files plus the leaf's normal verify.
