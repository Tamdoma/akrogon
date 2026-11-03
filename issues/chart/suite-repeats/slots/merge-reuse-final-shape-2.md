# merge-reuse final shape, correction 2 (from B's final check)

B found (`slots/merge-reuse-final-check-B.md`): `knownRedReceipt` skips a command when any head row on the tree holds it green (`src/verify.ts:224`), so split rows A=0/B=1 and A=1/B=0 pass the gate through the known-red fallback while the O-whole fast path refuses.

Correction [changed]: `knownRedReceipt` judges one head row at a time. A head row covers when, for every expected command, its own entry is exit 0 or is red with every failed name extractable and failing in a linked base run (`compares === head.run`, merge-base sha). The cross-row `heads.some(... exit === 0)` shortcut goes. Then every acceptance in `src/verify.ts` reads one row: whole-green, or one head row plus its linked base. Open for the plan: existing known-red tests that relied on green from a different head row.

Everything else in `slots/merge-reuse-final-shape.md` stands.
