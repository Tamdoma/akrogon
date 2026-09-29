# Merged map

## Where the split lives (A,B)
- Route table src/routing.ts:26-39. Allocation src/next.ts:321-342 (A first/left, B split right). Seat config lookup src/next.ts:222. Merged-tab close keyed on pane.A src/next.ts:748.
- Skills: plan-issue, implement-issue (+ brief-template.md, worker-protocol.md), check-issue, merge-issue, broadcast-issue (role-worded), watch-issues SKILL.md and scripts/observe.ts. skills/AREA.md:22.
- Docs: docs/guide idea, phases, merge, cheat, install. Tests: next, phase, state, status, config, init.
- State records carry seat keys in attempts, busy, verdict, pane, prompted, delivery_error, done (src/state.ts:45-57).

## Forks
1. Letter swap vs placement swap.
   - (A) Swap letters: A becomes synthesis/implement/fix, B becomes re-review/merge/broadcast. Operator said "swap the roles".
   - (B) Swap placement only: B allocated to the left pane, letters and all role text unchanged. Smallest change, meets "worker on the left".
2. Seat config follows the job (A,B). With a letter swap, swap slots.a/b values in config.yaml so pi keeps implementing and codex keeps reviewing/merging. With placement swap, config untouched.
3. Cutover (A,B). No migration code. Let update-replay finish before the change goes live. (A) Go-live is the operator fast-forwarding local main. (B) Existing tabs keep their recorded panes.
4. Pane recovery placement (B). Only for placement swap: recovery always splits right, so a lost left pane would put the worker right. Guarantee on fresh tabs only.

## Off route (A,B)
- chart-issues door A/B/C peers. Door A is already left.
- Lazy B pane creation. Both panes stay allocated up front.
- Rewriting history in learnings, issues/closed, log.jsonl.
