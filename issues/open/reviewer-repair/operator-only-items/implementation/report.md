# Report: operator-only-items

Base `22c447039b192f4caae6cad4d5b56092941d1bed`, committed head `d334a7b`. Mode: subagents, one wave of three units (U1 to U3), each in its own worktree. All three were cherry-picked onto the lane in order and their worktrees removed.

## Changed files and reasons

- `skills/check-issue/SKILL.md` (U1, criterion 1, D1 to D3). Line 27 gains one sentence pointing to the rule. A new line 29 paragraph defines the operator-only rule.
- `skills/implement-issue/SKILL.md` (U2, criterion 2, D4). Line 33 gains one pointer sentence. A new line 75 paragraph says check.fix ends with the rule's one `failed` stop when `Operator actions` items remain.
- `skills/merge-issue/SKILL.md` (U3, criterion 2, D4). Line 27 gains one pointer sentence before "This stop covers only".
- `skills/AREA.md` (U3, D5). Line 23 gains one clause. The file stays at 31 lines with its four sections.
- `docs/guide/*`: unchanged (D6). The `rg -n -i "human-only blocker|operator action" docs` hits (`problems.md:18,78,80`, `in-practice.md:51`) stay true.

## Criterion evidence

1. `sed -n '25,32p' skills/check-issue/SKILL.md` shows line 29 with every element: the `Operator actions` heading, the exact operator command or action, what the seat tried, which credential or identity it used, the observed error, never a Fix for the repair seat, merge held when it gates a done-criterion, and one `failed` stop after the doable Fixes with the action first in `--reason`.
2. `rg -n "Operator actions" skills`:
   ```
   skills/AREA.md:23: ... goes under `Operator actions` by the check-issue rule, never as a Fix.            -> pointer
   skills/implement-issue/SKILL.md:75: When the review files list open items under `Operator actions`, ... the one `failed` stop of the operator-only rule in check-issue Shared context ...   -> pointer
   skills/check-issue/SKILL.md:29: An operator-only item is a finding whose fix needs ... (full rule)          -> the one definition
   ```
   The `rg -n "operator-only rule"` pointer lines are `skills/implement-issue/SKILL.md:33,75` and `skills/merge-issue/SKILL.md:27`. `git --no-pager diff --word-diff $AKROGON_BASE -- skills` shows no deletion in any own-step stop line. The only `[-...-]` is the final "." of `skills/AREA.md:23`, which became the new clause.

## Commands run

- Changed tests after each cherry-pick: `bun test --changed="$AKROGON_BASE"` ran 0 tests, 0 fail (prose only, no test affected).
- `bun run format` passed with a clean tree (1.4s).
- `bun run typecheck` passed (2.1s).
- `bun test` exit 0: 353 pass, 0 fail (86.5s). Log: `/var/tmp/akrogon-1000/operator-only-items-22cfb7b3db74/tmp.XfxPbMqGPW`.

## Notes

- D2 is the review note from the plan. A review seat never stops on an operator action. A gating item makes its verdict `fix`, and check.fix makes the one stop. This reads the brief's "the seat stops" as the repair seat, so one review seat's `failed` (`src/phase.ts:206`) cannot drop the peer's doable Fixes.
- The worker commits carried a `Co-Authored-By` trailer. It was removed by a rebase with no content change, which is why the commit IDs differ from the worker returns (`d3b3dc4`, `5c13246`, `4a1f13d`).

Known limitations: D2 adds one check.fix turn when an operator action is the only finding.
Unverified criteria: none.
