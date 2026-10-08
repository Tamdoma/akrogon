# Layout scope notes, slot A (written before reading layout-scope-B)
Pick: local repair. When recorded A is absent and recorded B survives, split B right, then `herdr pane swap --source-pane <new A> --target-pane <B>`. Reason: matches #60 and the operator's verified workaround; global enforcement would move operator-arranged panes. Cost: one extra herdr call per A replacement.
Rejected: enforce A-left on every allocation (moves operator layouts); split left (herdr 0.9.3 rejects).
Evidence: src/next.ts:417-423; herdr 0.9.3 help; tests/fake-herdr.ts:123 has no order and no swap.
Pitfalls: fake must model order and swap; test asserts resulting order, not the command string.
Extra question: none.
