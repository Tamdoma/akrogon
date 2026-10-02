# Last forks, slot C (blind, 2026-10-02)

Framework log lines are `/home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl:<n>`. Leaf files are under `framework/issues/open/emdash-cms/emdash-build/emdash-launch/`. No outside source applies to either fork.

## Fork 1: operator-only exit

Trace of emdash-launch:

- T1. log:1251, 10-01 20:10. B stops correctly from check.review. Its file lists three operator actions, one of them the `delete_repo` scope (`review-B.md:299-306`). The stop reason B gave was base-red, with the scope item second.
- T2. log:1252-1258, 20:12 to 20:16. One session (`9983ec1e`) recovers the leaf to check.fix four times. A fails again after 17 s, 7 s and 6 s. Nothing had changed between tries. The fourth time A runs for 547 min (log:1259).
- T3. log:1260, 10-02 07:54. Recovery had reset `fix_rounds` to 0, so A reviews again. A writes the repo deletion as Fix F2 with "Repair: operator action only" (`review-A.md:152-156`) and verdict `fix`, and says check.fix should "not fail the leaf on F2 alone" (`review-A.md:176`). check.fix lasts 50 s (log:1261), then B repairs and merges.

Findings:

- F1. The stop rule covers the seat's own step, not a finding. All three lines say "when a step physically requires the operator" (`skills/check-issue/SKILL.md:27`, `skills/merge-issue/SKILL.md:27`, `skills/implement-issue/SKILL.md:33`). A's review step needed no operator, so A did not stop.
- F2. The Fix bar admits the item. A leftover repo is a "broken contract ... with a concrete consequence today" (`skills/check-issue/SKILL.md:45`). No line says an operator-only item is not a Fix.
- F3. The item was mixed with a real Fix (F1). Stopping would have blocked a repair a seat could do. A chose `fix` for that reason (`review-A.md:176`).
- F4. The flap in T2 is a recovery problem, not a review problem. `akrogon phase` lets a failed leaf go to any phase with no sign the blocker is cleared (`src/phase.ts:185-187`, `docs/guide/phases.md:73`). The watch skill says never recover a human prerequisite (`skills/watch-issues/SKILL.md:38`) and has a cycle bound (`:39`), and the leaf was still recovered four times. The log holds no failure reason, so I cannot say what text the recovering session read.

Options:

- O1 wording only: an operator-only item is never a Fix. Seats list it under "Operator actions" with the exact command. It does not set the verdict.
- O2 O1 plus one stop point: repairable Fixes go ahead first (B repairs them under the taken rule). The last seat to finish non-operator work does one `failed` stop naming every open operator action. For a leaf with no other Fix that is the review itself.
- O3 command refusal: `akrogon phase` refuses recovery unless the operator confirms the action, or refuses a second identical failed stop.
- O4 nothing.

Recommendation: O2. It fixes F1 to F3 with skill wording and one Fix bar line, and gives "stops exactly once" a defined place. Not O3: the command cannot tell whether a token scope was granted.

Pitfalls:

- P1. O2 does not stop the T2 flap. That needs the recovery side to obey `watch-issues/SKILL.md:38`. If the seat's `--reason` leads with something else (T1 led with base-red), the watcher may read it as recoverable. The stop wording should require the operator action to be named first in `--reason`.
- P2. An operator action can gate a criterion (C8 cleanup did). Then merge must not happen before it. O2's single stop has to come before merge, not after.
- P3. A seat may label a hard repair "operator-only" to drop it. The item needs the exact command and the error that proves the seat cannot run it (here HTTP 403, `review-A.md:153`).

## Fork 2: round budget

- F5. The counter goes up only on check.review to check.fix and returns to 0 on any move out of `failed` (`src/phase.ts:107-112`). A count above 0 makes re-check B-only (`src/routing.ts:42-44`, `src/next.ts:585`). At the cap the leaf goes to `failed` with "fix rounds exhausted" (`src/phase.ts:237-249`).
- F6. emdash-launch: resets at log:1247 (2 to 0) and log:1252 (1 to 0). The cap of 3 never fired, and A reviewed its own repair at log:1249 and log:1260 (`review-A.md:94` notes the independence problem).

Q "should B repairs count": no. The cap exists to bound A and B passing a leaf back and forth. A B repair inside B's pass makes no handoff, so there is nothing to bound. Trips that still go to A keep counting with no change. If the operator wants it anyway, the smallest change is a second integer in state (for example `b_repairs`) that B bumps through a new command flag. It needs a schema default so existing `state.yaml` files load (`src/state.ts`, `src/status.ts:35`), new tests, and a new line in the check and merge skills. It also rests on B reporting its own repairs, the same trust gap as the checks gate that is off route.

Q "should recovery stop resetting": yes, with one exception. Smallest change: at `src/phase.ts:110-111` keep the count on recovery unless the stored failure is the cap itself (`cause: 'attempts'` with reason "fix rounds exhausted", `src/phase.ts:248`). Without the exception a capped leaf could never be recovered, since its next `fix` verdict would fail it again at once.

- Breaks: `tests/phase.test.ts:828-837` asserts the reset to 0 and must change. `tests/phase.test.ts:110` should be checked. `docs/guide/phases.md:73` needs one sentence. No state file changes shape. Open leaves that were recovered already hold 0 and stay 0.
- Still needed once B repairs most Fixes: yes for the reset, since the A-bound trips left are the big ones (missing units, live runs), which is what looped in emdash-launch. The reset also decides who reviews, and A reviewing its own repair is wrong at any trip count.
- P4. A leaf stopped for an operator action and recovered keeps its count, so it can hit the cap sooner. That is the intended effect. The watch skill's wording on recovery bounds (`skills/watch-issues/SKILL.md:39`) should be read against the new rule.
