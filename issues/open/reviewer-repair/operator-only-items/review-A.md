# Review A: operator-only-items

Base `22c447039b192f4caae6cad4d5b56092941d1bed`. Reviewed head `d334a7b042dea9845c3d37e85a70ac0a21b2bd38`, 3 commits ahead of base. `git status --porcelain` is empty.

Verdict: **nits**

## Evidence

- Diff: `skills/AREA.md`, `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md` and `skills/merge-issue/SKILL.md`, 8 insertions and 4 deletions. Each deletion is a line that was rewritten to add text. The word-diff shows the old own-step stop text intact at `check-issue:27`, `implement-issue:33` and `merge-issue:27`. The only removed token is the final "." of `AREA.md:23`.
- Criterion 1: `skills/check-issue/SKILL.md:29` has every element. It names the `Operator actions` heading, the exact command or action, what the seat tried, the credential or identity used, the observed error, and that the item is never a Fix for the repair seat. It says merge is held when the item gates a criterion, and that the stop is one `failed` call after the doable Fixes with the action first in `--reason`. Met.
- Criterion 2: `rg -n "Operator actions" skills` has 3 matches, pasted in the report. `check-issue:29` is the definition. `implement-issue:75` and `AREA.md:23` are pointers that do not restate the rule. `rg "operator-only rule"` finds pointers at `implement-issue:33,75` and `merge-issue:27`. Met.
- Checks: these are reused from the report because the code has not changed since. `bun run format` passed with a clean tree. `bun run typecheck` passed. `bun test` passed 353 with 0 fail. The changed-tests run found 0 affected tests, as expected for a prose-only change.
- Area check: `skills/AREA.md` names paths that all exist. `scripts/observe.ts` resolves under `skills/watch-issues/` and sits on an unchanged line.
- Docs: `docs/guide/problems.md:18,78,80` still hold, because seats still record the blocker and the pass still ends `failed`. No documented behavior changed.
- Exclusions: `plan-issue:29`, `watch-issues:38`, the Fix-bar paragraph and all code are untouched.
- Wiring: a gating operator action makes the verdict `fix`. That routes to check.fix, where line 75 makes the one stop. Merge reaches the same stop through its existing `check.fix` route (`merge-issue:41`). `src/phase.ts:193-215` accepts `failed` with `--reason` from slot A at check.fix.

## Nits

- N1. The rule sets a review seat's verdict to `fix`. The merge pointer (`merge-issue:27`) sends the merge seat to the same rule, but merge has no verdict, only its `check.fix` route. The path works through `implement-issue:75`, but a merge seat has to infer it. Deferred because no merge has met an operator-only item under this rule yet. It becomes a Fix if a merge seat records an operator action and then stops `failed` itself or pushes.
- N2. An operator action that gates no criterion stays only in `review-<slot>.md` when the leaf otherwise merges. The brief makes only gating items hold merge, so this follows the brief. Deferred for that reason. It becomes a Fix if a merged leaf leaves a recorded operator action the operator never saw and it caused harm.
- N3. Slot A wrote both the plan and the implementation, so this review is not independent of the D2 reading. D2 reads the brief's "the seat stops" as the repair seat, because one review seat's `failed` ends the leaf immediately (`src/phase.ts:206`) and would drop the peer's Fixes. B's blind review is the independent check on that choice.
