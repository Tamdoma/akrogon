# Brief: hold-fix-leaf

## What
`akrogon hold-fix <slug>` names one fix leaf in the current repo's hold. While the hold exists and names it, that leaf may take the merge turn: mergeTurn selects it as holder when it is in merge even though it is not first in the queue, runs it solo (no members), the full gate runs as for any holder, its merge_stamp is untouched, and phase authorization (src/phase.ts:770-783) accepts it as holder. The override ends when the hold clears. The selection override replaces the holder before src/next.ts:975, so re-prompting an applied record for F works (C). F stays authorized while it holds a batch record even when the hold clears mid-attempt, matching the active-holder rule (C). Status shows the named fix leaf.

## Why
During a hold the only other way out is the operator pushing to main. A fix delivered through the lifecycle could never land because the turn is held and the leaf is not the queue head (#64, #67).

## Done-criteria
1. With a hold naming fix leaf F in merge behind other leaves, the next merge turn builds a solo attempt with F as holder and no members.
2. `akrogon phase F merged` with that attempt is accepted while the hold names F; the same call for another leaf during the hold is refused.
3. After F lands and main changes outside `issues/` and `learnings/`, the hold and the override are gone and normal queue order returns.
4. `akrogon hold-fix` with no hold, or with a slug not in the repo, fails with a message and changes nothing.
5. F's merge_stamp is unchanged by naming it or by its attempt.
6. If the hold clears while F holds a batch record, `akrogon phase F merged` with that attempt is still accepted (C).
7. `akrogon status` shows the fix leaf on the held repo; the command reference documents `hold-fix`.
8. The blocking `checks` pass.
