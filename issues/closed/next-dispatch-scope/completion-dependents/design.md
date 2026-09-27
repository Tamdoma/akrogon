# Design: completion-dependents

## Binding decisions, verbatim
### dispatch-scope Q1: After a leaf completes, which leaves may that pass start?
Operator, 2026-09-26: "1a"
A. A completion pass starts only leaves in the same repo whose `blocked-by` names the completed leaf. Reason: keeps dependency chains (55 of 220 leaves use them) without a new state field, and nothing unrelated can start. Foreclosed: B (same-repo sweep still starts freshly handed-off unrelated leaves), C (no chaining).

### dispatch-scope Q2: What should the Herdr startup pass do?
Excluded from this leaf. Owned by startup-resume.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md
- Real invocation: tests run the real CLI through the existing `tests/helpers.ts` and `tests/fake-herdr.ts` fixtures, which are the repo's established Herdr boundary. No new mocks.
- Negative and edge cases are required: unrelated same-repo leaf, other-repo leaf, dependent with a second unmerged blocker.
- No auth, secrets or browser flow apply. The artifact is the `bun test` output recorded in the implementation report.

## Leaf architecture
Owned: `src/next.ts` completion handling in `nextCommand`, `tests/next.test.ts`, `docs/guide/limits.md`, the completion and "Manual dispatch" lines of `docs/guide/next.md`.
Interface: a helper taking `(global, repo, completedSlug, invocation)` that selects `discover(repo, invocation).leaves` with `state['blocked-by'].includes(completedSlug)` and passes them to `sweep`. The completed leaf's repo comes from the selection or hook owner already in hand.
Note: `dispatchLeaf` returns `'completed'` for any merged leaf still in `issues/open/` (`src/next.ts:524-527`), so the dependent dispatch repeats on later passes. That is fine because `dispatchLeaf` is idempotent for allocated leaves.
Excluded: `--all`, `sweepAll`'s use by `--all` outside a repo, Herdr startup, `plugin/`, CLI flags. These belong to startup-resume or stay unchanged.
Dependencies: none.
