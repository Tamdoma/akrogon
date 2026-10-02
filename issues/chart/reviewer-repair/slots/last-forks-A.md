# Last forks, slot A (blind)

## Operator-only exit: emdash-launch trace (framework `issues/log.jsonl`, leaf `issues/open/emdash-cms/emdash-build/emdash-launch/`)
- 10-01 14:32 first review both fix; 17:43 repair; 18:11 B fix; 18:47 A failed; 18:48 recover (fr reset to 0); 19:39 review both fix; 20:03 repair; 20:10 B failed (operator stop, review-B.md:252-258, correct per check-issue:27).
- 20:12-20:16: three recoveries, each followed by A failing again within 7-25 s. The blocker (C8 live-run authorization, `delete_repo` scope, review-A.md:153-156, review-B.md:256) was not cleared before recovery. Then 10-02 05:24 repair, 07:54 review, merged 08:15.
- review-A.md:176 told check.fix to repair F1 and only record F2's operator action, "not fail the leaf on F2 alone". So the rule did not fail at the review seat: A marked F2 operator-only inside a Fix list. The operator-only parts were inside done-criterion C8 itself (live mutations, full list-proven cleanup), so every seat that judged C8 had to stop.
- Root: the chart put operator-gated work (live provider mutation authorization, a token scope) inside a leaf criterion. chart-issues already says human-only prerequisites are completed before opening a leaf. That is a framework charting miss, not a review-rule gap.
- Recovery flaps: `src/phase.ts:185-187` says recovery is for after the blocker is resolved; nothing checks it. Recovering 3 times in 4 minutes cost no model work beyond A re-failing.

## View, fork 1
- Recommend: one Fix-bar line in check-issue: an operator-only item is never a Fix; the seat records it under "Operator blocker and exact action" and runs failed only when a done-criterion needs it, otherwise it goes into the report as a recorded limitation. Plus under repair-authority 1a, B no longer hands the local part to A, so F1-style local fixes do not wait on the operator item.
- No command refusal: akrogon cannot know whether the operator cleared a blocker.

## Round budget, fork 2
- `src/phase.ts:107-112`: fix_rounds increments only on check.review -> check.fix, resets on failed recovery. `src/routing.ts:42-44` uses fix_rounds > 0 for B-only re-check.
- With B repairing in its pass there is no check.fix move, so B repairs never count. The cap exists to stop A/B loops; B repairs inside one pass cannot loop across passes. Counting them adds state for no loop.
- The reset on recovery made A review its own repair (emdash-launch 18:48 and 20:12). Smallest change: keep fix_rounds across failed recovery. That also keeps the cap meaningful.
- Recommend: B repairs do not count; failed recovery keeps fix_rounds. Breaks: tests that assert reset (to check), docs in `docs/guide/phases.md`.
