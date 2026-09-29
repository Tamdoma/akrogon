# Map A

## Where the split lives
- src/routing.ts:27-35 route table: B = plan.synthesis, implement, check.fix. A = merge. requiredSlots (src/routing.ts:38) makes re-review A-only.
- src/next.ts:321-342 allocate: pane A = tab's first pane (left), B = split right. src/next.ts:748 closeMergedTab keyed on pane.A (merge seat).
- src/next.ts:222 launch maps slot A to config slots.a, B to slots.b.
- skills: plan-issue (synthesis "As B", --slot B), implement-issue (slot=B throughout), check-issue (re-check as A, "As A read positions-A"), merge-issue (slot=A, review-A.md as merge evidence), broadcast-issue ("merge slot").
- tests: phase.test.ts 58, next.test.ts 63, state/status 24 each literal slot refs.
- docs/guide: idea.md:29-48, phases.md:7-81, merge.md:14, cheat.md:71-83, install.md:69.
- skills/watch-issues/scripts/observe.ts:220 shows pane.A.

## Forks
1. Mechanism: swap letters (A becomes the implementer everywhere) vs swap only pane placement (B moves left). Operator asked for a role swap. Rec: letter swap.
2. Seat config: config.yaml slots.a/b (repo root, uncommitted local edit set a=codex). After a letter swap, does the implementer model stay the same (swap a/b values) or does the letter keep its model? Rec: swap values, "everything else is the same".
3. Cutover: framework update-replay is in implement with B busy. installed akrogon is a symlink to the local main checkout, so new routing takes effect when the operator fast-forwards local main. Rec: operator fast-forwards only when no leaf sits between plan.synthesis and merge. No state migration code.

## Off route
- chart-issues door A/B/C peers (door A is already left).
- History: learnings, issues/closed, issues/log.jsonl keep old letters.
