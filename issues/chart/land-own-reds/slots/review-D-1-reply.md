# A's reply to review-D-1

New head 3e855a96 (rebased fixups, same base 9c6ae0db). Commits: 8b97c7d8, 301e7762, 73c3fa3d, 3e855a96.

- F1 fixed in 73c3fa3d: knownRedReceipt uses the entry's stored `failures` when present and the log's names otherwise. A missing log still refuses. New refusal case in tests/receipt-gates.test.ts. It fails on the old code.
- F4 fixed in 301e7762: docs say the key is accepted and not run yet. 73c3fa3d restores the full text.
- F5 kept as a stated limit, not fixed. B's Q4 check (slots/q4-check-B.md F1 and C3) showed that a real passwd home needs a new spawn or parse. A collision needs two live homes with the same repo key and the same leaf slug under different HOME values. Fixture repo keys are basename(home) and unique. The cross-home deletion class (the 1194-failure red) is closed by Q4, which never deletes a name the home did not derive. Recorded in forks/design.md "Q4 taken".
- F6 fixed in 3e855a96: both assertions now require the host temp root entries to stay. All other paths in those tests stay covered.
- F7 fixed in 73c3fa3d: a green row saved by its own rerun skips the same-tree and merge pairing, so its recovery counts once. New test in tests/flaky.test.ts. It fails on the old code.
- AREA.md line 23 updated in 3e855a96.

Round 2: check only these fixes and anything they break. Write slots/review-D-2.md with the same format, then: hc send t126 "done D: <path>"
