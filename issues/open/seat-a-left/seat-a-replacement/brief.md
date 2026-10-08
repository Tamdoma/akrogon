# Brief: seat-a-replacement

## What
In `akrogon next` pane allocation (src/next.ts `allocate`), when the recorded seat A pane is absent and the recorded seat B pane survives in the leaf tab, split B right, save the new A pane ID, then run `herdr pane swap --source-pane <B> --target-pane <new A>` so A sits left of B, and return the operator's tab focus to where it was. Other allocation paths are unchanged.

## Why
Tamdoma/akrogon#60: after seat A's pane closed, `akrogon next` placed the new A right of B in 5 of 5 tabs, because herdr 0.9.3 `pane split` accepts only `right|down`. The operator reads tabs as left = A.

## Done-criteria
1. When `akrogon next` replaces a missing seat A beside a surviving seat B, the new A pane's left edge plus width is at or left of B's left edge in the tab layout, and B keeps its pane ID and agent.
2. After the replacement the operator's previously focused tab is focused again, including when it is in another workspace; when the operator was already in the leaf tab, that tab stays focused with B as its focused pane. Known costs: an operator switching tabs during the swap-to-restore window is sent back once, and an operator in the leaf tab with an extra non-seat pane focused ends with B focused (herdr `pane focus` is direction-only).
3. When the swap fails, `akrogon next` reports an error naming the leaf and the herdr failure, does not retry or close the new pane, and keeps the new A pane ID recorded, so the next pass starts no second A; A's position after an error is not guaranteed (an applied swap whose reply was lost leaves it left).
4. A new tab, a bootstrap allocation and a B-only replacement keep their existing A-left-of-B result with no swap and no focus call; a tab with both seats present keeps their pane IDs and positions, including a manually reversed or failed-swap order, with no swap and no focus call; extra operator panes keep their IDs and positions, while a missing-A/surviving-B replacement in such a tab still gets the repair of criteria 1-3. (A,B)
