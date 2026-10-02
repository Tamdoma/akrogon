# Brief: operator-only-items

## What
One rule in `skills/check-issue/SKILL.md` Shared context defines an operator-only item: a finding whose fix needs something only the operator can grant (a permission, a token scope, a live-mutation authorization). The review seat records it under an `Operator actions` heading in `review-<slot>.md`, never as a Fix for the repair seat, with the exact operator command or action, what the seat tried, which credential or identity it used and the observed error. When an operator-only item gates a done-criterion, the leaf cannot merge until it is resolved. When no doable Fix remains, the seat stops with `akrogon phase <slug> failed --reason "<operator action first; see review-<slot>.md>"`. When doable Fixes remain, the verdict reflects them and the repair seat finishes them first, then makes one `failed` stop naming every open operator action, action first in `--reason`. The own-step stop lines (`skills/check-issue/SKILL.md:27`, `skills/implement-issue/SKILL.md:33`, `skills/merge-issue/SKILL.md:27`) stay for a seat's own blocked step and each gains one pointer to the rule for findings; `skills/implement-issue/SKILL.md` check.fix ends with the one stop for open operator actions by pointing to the rule. (A,C)

## Why
In framework emdash-launch, A's review wrote a stray-repo deletion needing a `delete_repo` scope as Fix F2 and told check.fix not to fail on it (`review-A.md:152-156,176`); the stop rules only covered a seat's own step, not a finding. The item later turned out deletable with existing access, so repairing doable work first gives a second look before the one stop.

## Done-criteria
1. `skills/check-issue/SKILL.md` Shared context states the operator-only rule as above: the `Operator actions` heading, the exact action, what was tried, which credential, the observed error, never a Fix for the repair seat, merge waits when it gates a criterion, one `failed` stop after doable Fixes with the action first in `--reason`. (A,B,C)
2. `skills/implement-issue/SKILL.md` (own-step line and check.fix end) and `skills/merge-issue/SKILL.md:27` point to that rule without restating it, and their own-step stop text is unchanged. The report pastes `rg -n "Operator actions" skills` and judges each match by meaning: one definition, the rest pointers. (A,C)

Credentials: none. Human prerequisites: none.
