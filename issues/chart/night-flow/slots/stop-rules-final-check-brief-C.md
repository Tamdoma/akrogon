# Final-shape check, slot C

You are slot C. One focused check of the final shape below before A records it. Disagreements and collisions only, each with evidence (path:line). Read-only: change no repo file, run no akrogon phase/next/unhold/close.

Return path (write your answer here, nothing else): /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3439f-85f2-4472-a49d-d163111cd153/scratchpad/night/final-check-C.md

## Context you already hold
Merged map: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3439f-85f2-4472-a49d-d163111cd153/scratchpad/night/map-merged.md
Rebuttals: same folder, rebuttal-B.md and rebuttal-C.md.

## Operator answer, verbatim
"1a | 2a | 3a |"

Options as shown to the operator (simplified round):
- 1a: only the leaf whose merge fails while main also looks red waits, and retries after main changes. Everyone else keeps merging. Nothing red ever merges. The test-by-test comparison (red-base-wait) still lands later, unchanged.
- 2a: no automatic `failed` at the round limit. If B hits the same kind of problem twice, or one caused by the plan, A fixes the plan itself and keeps going. `failed` stays for things only the operator can do (missing key, human decision). Round count stays visible in status.
- 3a: check once, at creation; drop the per-check guard; move the reviewer's copy of main to the store.

## Proposed final shape (what A would record)

Chart `night-flow` in akrogon, destination: work keeps moving overnight; only human-only blockers wait for the operator. One issue, three parallel leaves, no order between them except where you show an actual dependency:

S1 `hold-retire` (1a). Takes the hold retirement out of `issues/open/red-base-wait/known-red-merge/brief.md:17` and criteria 6, 7 and the hold part of 9 (held.yaml unread/unwritten, `hold-fix`/`unhold`/`--red-on-base`/`--command` fail naming the merge rule, status hold line and unpause print go). Interim merge rule until known-red-merge lands: a merge whose check fails while a base run of the same command also fails keeps the leaf at `merge`, spends no fix round, writes no hold, and the leaf is not retried until `origin/<default>` moves past the commit it was tested on; other queued leaves keep merging. It never merges a red check, and it does not use the whole-command result to approve anything. known-red-merge keeps its known-red rule, drops the moved parts, and its rule replaces the interim wait when it lands.

S2 `plan-not-cap` (2a). `src/phase.ts:308-313` no longer moves to `failed` at `fix_rounds`; the counter stays and prints in status. B's check skill: when a finding repeats in the same area, or contradicts a named plan decision, B names that decision in the Fix. A's repair/fix skill: a named decision is corrected in `plan.md` with an executable check A runs before handoff, inside check.repair/check.fix (no automatic plan.synthesis move, no shrinking-count gate). `failed` remains reachable only by an explicit blocker move with a written reason. Docs (`docs/guide/phases.md:76`, #85) match. `fix_rounds` config key: either removed or kept as information only (say which you'd defend).

S3 `guard-at-creation` (3a). `withSetup` (`src/config.ts:276-292`) drops `akrogon guard ancestors` and `akrogon guard own-modules` from every check; `checkLocation` at `createSparseWorktree` (`src/next.ts:284`) and batch creation (`src/batch.ts:96`) stays; the `akrogon guard` verb stays for base-run's use. The hand-made base checkout in `skills/check-issue/SKILL.md:65` (and the merge/implement equivalents) is made under the store (`~/.akrogon/worktrees/<repo>/`) instead of `mktemp -d` until base-run replaces those lines with its verb.

## Answer these, disagreements only
1. Does each shape match the chosen option, and is it what you would defend? If not, the smallest change.
2. Collisions with open leaves' owned files or criteria (known-red-merge, known-red-leaf, base-run, worktree-reconciler, leaf-env-file, check-env). For each: the line, and whether it needs a contract amendment, an order, or nothing.
3. Is `guard own-modules` safe to drop with `ancestors`, or does it catch a failure that store worktrees still have?
4. What each shape could break later (one line each), and what removes it.
5. Anything in the operator's answer the shape adds or drops.
