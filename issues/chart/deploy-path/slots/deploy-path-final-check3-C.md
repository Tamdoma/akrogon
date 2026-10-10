# deploy-path focused check 3, slot C

D1. Trigger a is wider than stated. `mergeWake` runs in the `finally` of every committed `akrogon phase` move for that repo (src/akrogon.ts:63-82), not only after a landing, and its signature carries no phase (`mergeWake(global, repo)`, src/next.ts:1287-1291). Placed inside mergeWake, `selfUpdate` runs a fetch plus `bun install` on every akrogon phase move (about 5 per leaf). Either accept that and say so, or pass the committed `to` phase (phaseCommand already returns `committed`) and run the step only when `to === 'merged'`. The second matches the text "after a lifecycle landing".

D2. `mergeWake` returns before mergePass when the repo is paused (src/next.ts:1294-1295). A landing into a paused akrogon repo (operator pause during a hold or fix) gets no self-update until the next trigger. Decide whether selfUpdate runs before the pause check (it changes no leaf state, so it can) or is skipped with the pause; the fork should say which.

Nothing else found. Steps 1-5 otherwise match HEAD: `git fetch <remote> <branch>` updates the tracking ref; install.ts:24-32 dangling-link removal belongs in the split link routine; akrogon has no `direct` key, so the direct route is off.
