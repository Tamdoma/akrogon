# Brief: repair-verify-merge

## What

In `skills/check-issue/SKILL.md` `## check.repair`, B runs `akrogon verify` on the committed head only when its move is `merge`. On a move to `check.fix`, or the `failed` stop, it runs none. The changed-input done-criterion proof reruns stay on every exit, and the per-Fix evidence paragraphs are unchanged.

## Why

In every check.repair to check.fix visit where B committed, B ran a full verify (about 65 min in akrogon, 51 min in framework since 2026-10-15), and A then changed the tree in 19 of 21 akrogon visits (5 of 5 since 2026-10-26). The only reader of that receipt is the check.repair to merge gate.

## Done-criteria

1. The check.repair instructions direct `akrogon verify` only on the move into `merge`, keep the changed-input criterion proof reruns on every exit, and leave the per-Fix evidence rules unchanged; the check.review reviewer confirms this by walking the changed paragraph against a pure handoff (fewer-repeat-calls `review-B.md` 2026-10-26), mixed repairs (abandoned-capture-stop `review-B.md` 2026-10-28) and any one check.repair entry that finishes in `merge`. (A,C)
2. A check.repair to check.fix move succeeds with no receipt for HEAD while check.repair to merge still refuses without one, proven by the existing gate test in the repo's `test` check.
