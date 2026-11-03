# Brief: merge-receipt-reuse

## What

`akrogon verify` and every receipt gate judge a verify row as a whole and never by its scope. A row counts when it is completed with setup green, on the head tree, and its command list equals the expected list for the caller's scope. It is green when every entry exits 0. It is known-red when it holds at least one red entry and each red entry is covered by a linked base run failing the same test names. Merge then accepts the leaf's green row on an unchanged tree instead of running the full suite again, and verify's fast path and the gates cannot disagree. Cost: one green sample per tree lands, and merge-time flake flips on an unchanged tree stop feeding `akrogon flaky`. (A,D)

## Why

Since 2026-10-26, 13 of 17 merge verify runs re-tested a tree that already held a green leaf row under identical commands (median 70 s each), and both red merge runs were flakes on such a tree that aborted a land. The scope match that forces the rerun was restored on 2026-10-25 (9aaed138) only because the gate and the fast path had drifted into two different rules; this leaf removes the second rule instead.

## Done-criteria

1. On a head whose tree holds a completed green leaf row with the same commands merge expects, merge `akrogon verify` exits 0 without running any check command or writing a new row, and the merge receipt gate accepts that head.
2. When merge expects a command the leaf row lacks (a `merge_checks` entry), merge `akrogon verify` runs it, and with no qualifying known-red comparison the merge receipt gate refuses the head until an eligible whole-green row exists. (A,B)
3. Two completed rows on one tree, each green only in the command the other has red, satisfy neither verify's fast path nor any receipt gate.
4. A leaf red head row whose linked base comparison fails the same test names satisfies the merge receipt gate, and merge `akrogon verify --known-red` on that head writes no new head row.
5. A green row on main written at leaf scope resolves an earlier merge-scope main-red notice for the same command and test, so a later recurrence notifies again.

All five are proven by tests in the repo's `test` check.
