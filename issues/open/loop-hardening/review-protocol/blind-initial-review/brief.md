# Brief: blind-initial-review

## What
`skills/check-issue/SKILL.md` forbids peer questions during `check.review`; each reviewer records unresolved points in its own `review-<slot>.md` and verdict. Peer questions remain permitted in `check.fix` re-check as A.

## Why
Two concurrent reviewers each waiting for the other to go idle is an unrecoverable cycle (#12).

## Done-criteria
1. The peer-question paragraph is scoped to `check.fix` only and the `check.review` section states that both reviewers work blind and record open questions as findings; read by a reviewer, the two sections cannot be followed into a mutual wait.
2. No word-matching test is added; the skill's existing footer and verdict rules are unchanged.
3. `bun run format` passes (prose files untouched by formatter are fine).
