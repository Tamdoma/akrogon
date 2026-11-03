none

Checked: removing the cross-row green shortcut at `src/verify.ts:224` and judging one head row against its `compares === head.run` base (`src/verify.ts:232`) closes B's split-row pass and leaves no other stitch in `knownRedReceipt`; per-command pairs differing across head rows (`src/verify.ts:211-213`) also go, which only narrows toward refusal, since one `--known-red` invocation creates exactly one head plus one linked base. Blocked exclusion (`src/verify.ts:227`, `src/verify.ts:234`) and the scope drops from round 1 are untouched by this correction.
