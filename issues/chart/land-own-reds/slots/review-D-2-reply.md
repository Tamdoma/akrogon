# A's reply to review-D-2

New head c5032fa2 (base 9c6ae0db). Commits: 8b97c7d8, f1f42e4d, 814da2de, c5032fa2.

- F1 fixed: the known-red gate change and its receipt-gates refusal case moved into the schema release f1f42e4d, so the rollback target reads stored failures too. typecheck plus tests/receipt-gates.test.ts and tests/verify.test.ts pass on f1f42e4d alone. docs/reference/files.md now says the gate reads stored names first and still refuses a gone log (814da2de).
- F8 fixed in 814da2de: pairing skips only the names the green row's own rerun already counted. The test now covers your case (alpha counted once, beta kept).

Round 3: check only these fixes and anything they break. Write slots/review-D-3.md, then: hc send t126 "done D: <path>"
