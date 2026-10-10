# Design: fix-red-base-tests

## Binding decisions, verbatim
### Targeted test-only fix
Both are stale tests, fixed in tests/ only, proven by running only the two failing files. Operator 2026-10-10: "make the new test targeted for only that so it can continue moving fast." Foreclosed: reverting f3199df's src changes, widening the leaf into a full-suite cleanup.

Standing design (/home/ivan/.claude/skills/chart-issues/assets/standing-design.md): each criterion is proven by the cheapest sufficient test. Here the two existing test files are that proof. While iterating, run only `bun test tests/peer-wait.test.ts tests/dependents-first.test.ts --timeout=30000`. The merge gate runs the full suite afterwards.

## Leaf architecture
- Owned: `tests/fake-herdr.ts` (add an `agent list` handler beside the existing `agent start/prompt/wait` handlers, returning `{result:{agents:[...]}}` with each pane's `pane_id`, `agent`, and `agent_session` when set; pane fixtures with `agent: null` are omitted), `tests/peer-wait.test.ts` only if its fixture needs a session value, and the single stale assertion at `tests/dependents-first.test.ts:103` (`code` 1 becomes 0).
- Reference: `skills/chart-issues/scripts/peer-wait.ts` `readPeerAgent` (line 87) and its zod `agentListSchema` define the response shape. `src/next.ts` dispatchLeaf (~684) and `docs/guide/next.md` "When picked work cannot start" define the exit code.
- Excluded: any change under `src/`, `skills/`, `docs/`, `issues/`; the Claude transcript path (`claudeTurnOpen`) and its tests; the merge-clean-worktree leaf.
