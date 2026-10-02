# Map C: slot B repairs its own findings

Blind peer map, written 2026-10-02. No repo file edited. No other `map-*.md` read.

## 1. What the loop costs today

Method: each log line is a phase move, so time in a phase is the gap between the move in and the move out. Legs over 240 minutes are dropped from the share figures as idle time (overnight, operator waits). "Repair size" is the change in insertions plus deletions between the review exit and the repair handoff.

| Measure | akrogon (all, 85 leaves) | framework (all, 236 leaves) | framework since 2026-09-29 (32 leaves) |
| --- | --- | --- | --- |
| Leaves with 0 / 1 / 2+ repair rounds (merged only) | 74 / 10 / 1 | 148 / 76 / 11 (max 6) | not split |
| Repair legs (review or merge sent to check.fix) | 23 | 124 | 35 |
| Review exits that went to check.fix | 12/110 | 108/364 | 35/70 (50%) |
| check.fix leg, median / P90 | 5 / 8 min | 8 / 52 min | not split |
| B re-check leg, median / P90 | 1 / 2 min | 2 / 7 min | not split |
| Full cycle (fix entry to re-check exit), median / P90 | 6 / 9 min | 10 / 57 min | 23 / 99 min |
| check.fix + re-check share of pipeline time | 7% + 1% | 14% + 3% | 25% + 6% |
| Repair size median (changed lines) | 9 | 27.5 | 121 |
| Repairs of 20 lines or fewer | 16/23 | 56/124 | 10/35 |
| Re-check result | 22 merge, 1 fix again | 101 merge, 18 fix again, 4 failed | not split |

Framework fix rate by period: 24/135 review exits (18%) in Sept 1 to 15, 49/159 (31%) in Sept 16 to 28, 35/70 (50%) since Sept 29. Sept 29 is the seat-role-swap date. I did not verify the date `gpt-6.1-sol` entered slot B.

Findings:

- F1. The akrogon repo does not have this problem. Repair plus re-check is 8% of time and 22 of 23 cycles finish within 15 minutes.
- F2. Framework has it, and it got worse after Sept 29: the loop went from 17% to 31% of pipeline time and half of all reviews now open a repair.
- F3. The re-check itself is cheap (median 2 minutes). The cost is the A repair leg and the handoff, not B's second look.
- F4. Recent framework repairs are not mostly small. Only 10 of 35 are 20 lines or fewer and 12 of 35 are 50 or fewer. A "B fixes small things" rule can remove about a third of recent cycles, not all of them.
- F5. 18 of 123 framework re-checks sent the leaf back again. Those are defects the repair introduced, found by B with a reproduction already in hand.

The example leaf, emdash-launch (framework log):

| Leg | Minutes | Note |
| --- | --- | --- |
| implement | 217 | 36 files, +6483 |
| first review (A and B) | 11 | B: 10 Fixes, A: 7 Fixes, both `fix` |
| repair 1 | 191 | +2821 lines |
| B re-check 1 | 28 | F6 repair broken (SVG upload rejected), F11 new (cache check runs on a warm page) |
| repair 2 | 36 | A ends in `failed` (operator-only C8 live run) |
| recovery, repair 2b | 39 | recovery reset `fix_rounds` to 0 |
| re-check 2 (A and B again) | 11 | F12, F13 new, both from the repair |
| repair 3 | 25 | |
| B re-check 3 | 7 | B ends in `failed`: only F1 left, operator authorization |
| 4 failed/recover flaps | 4 | 20:12 to 20:16, A fails within seconds each time |
| repair 4 | 547 | overnight, live run |
| now | | `check.review`, `done: [A]`, `fix_rounds: 0`, B busy |

A's latest review holds two Fixes: a small runner change (no image field case) and a stray GitHub repo that only the operator can delete (`gh` token lacks `delete_repo`). That pair is the "another turn for a couple of these mistakes" in the intake.

## 2. Material forks

- K1. Where B may repair. O1: in the re-check pass only. O2: also in the first review. O3: also at merge on red checks (today merge sends to check.fix: 16 times in framework, 11 in akrogon). O4: nowhere, tighten the Fix bar instead.
- K2. Which Fixes qualify. Candidate test: B already reproduced it and traced the cause, the change stays inside files the leaf already touches, no locked decision or plan change, no new slow or live run, no missing unit of work. A line count is a weak proxy. The judgment belongs to B.
- K3. Who verifies a B repair. O1: nobody beyond a failing-first test plus the `checks` and `merge_checks` that merge already runs. O2: A reviews B's repair diff (roles flip, still a handoff). O3: a fresh-context B subagent reads the repair diff. O4: the operator.
- K4. What A still owns. Large repairs, unimplemented units, anything needing a plan note, docs and `report.md`. Open point: who records B's repair commits in the report.
- K5. Operator-only findings. Today they are written as Fixes and routed to A, who cannot act. Options: they always take the `failed` exit with the exact action, or the leaf may merge with a recorded operator action when the item is cleanup and not a criterion.
- K6. Round counting. Does a B repair count toward `fix_rounds`? Should failed recovery keep resetting the counter, given that the reset also brings A back as a reviewer of its own repair?
- K7. Measurement. The realistic-fix-bar chart measures the next 20 leaves per repo against a baseline. A loop change now lands inside that window.

## 3. Practitioner research

All read 2026-10-02.

- S1. Anthropic, "Harness design for long-running application development", 2026-03-24. https://www.anthropic.com/engineering/harness-design-long-running-apps. Separating the builder from the judge "proves to be a strong lever" because agents praise their own work. The evaluator reports and does not fix. Cost: 20 minutes and $9 solo against 6 hours and $200 with the full harness. The evaluator "is worth the cost when the task sits beyond what the current model does reliably solo."
- S2. Google eng-practices, "Speed of code reviews", section "LGTM with comments" (living document, undated). https://google.github.io/eng-practices/review/reviewer/speed.html. The reviewer approves with open comments when the suggestions are minor or the author is trusted to address them. The author fixes and no second review round happens.
- S3. "Software Engineering at Google", chapter 9 (2020). https://abseil.io/resources/swe-book/html/ch09.html. The author changes the code. Reviewers may share suggested edits in the tool. The author commits after resolving all comments.
- S4. Cursor, "Closing the code review loop with Bugbot Autofix", 2026-02-26. https://cursor.com/blog/bugbot-autofix. The review bot's findings go to separate cloud agents in their own VMs that test and propose fixes on the PR. Over 35% of those fixes are merged. Resolution rate rose from 52% to 76%.
- S5. GitHub changelog, "Easily apply Copilot code review feedback with Copilot cloud agent", 2026-05-19. https://github.blog/changelog/2026-05-19-easily-apply-copilot-code-review-feedback-with-copilot-cloud-agent/. Review comments are handed, singly or in a batch, to a coding agent that commits to the same PR or a stacked PR. A human triggers it. The post does not say the fix is re-reviewed.
- S6. Park and Choi, arXiv 2607.25152, 2026-07-27, revised 2026-09-29. https://arxiv.org/abs/2607.25152. An agent judging its own loop reported progress in 54 of 54 cycles while 56% had none. A judge reading only text accepted 44% of regressions. The gap closed when success was checked against the artifact's real behavior.
- S7. GitHub docs, "Allowing changes to a pull request branch created from a fork". https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork. The platform lets maintainers commit to a contributor's branch. My search found no stronger source on the etiquette. Model knowledge only: maintainers commonly push small fixups themselves and note it, and send large changes back to the author.

Where they agree: the party that wrote code should not be its only judge (S1, S6), and minor fixes should not cost a full review round (S2, S4, S5).

Where they differ: S1 keeps the evaluator out of the code entirely. S4 and S5 let the review side produce the fix, through a separate agent, with a human accepting it. S2 skips the re-review for minor items and trusts the author.

What flips the advice:

- Size and kind. Minor, local fixes go to whoever is fastest (S2, S7). Design-level or large repairs go back to the author.
- Verification source. If the fix is proved by running the real thing, who wrote it matters less (S6). If the proof is someone reading the diff, independence matters more.
- Reviewer capability. S1 says the judge earns its cost only when the builder is unreliable solo. Here B is the stronger model and already holds the reproduction, which favors B fixing what it found.
- No source reports reviewer-repairs with zero check after. S4's 35% merge rate says about two thirds of auto-fixes were not accepted as written.

## 4. Pitfalls in the inspected files

- P1. `src/routing.ts:31` gives check.fix to A only. B repairing through a new phase needs routing and state work. B repairing inside its existing review or merge pass needs skill text only.
- P2. `src/phase.ts:233` sends any `fix` verdict to check.fix. A B that repairs and then reports `ready` goes straight to merge, where B is also the merger (`src/routing.ts:32`). B then judges and ships its own repair with no second reader.
- P3. First review is blind and shared: both seats read one worktree (`skills/check-issue/SKILL.md:33`). A B edit during that pass moves the head under A's review, and `src/phase.ts:216` refuses A's verdict while the worktree is dirty. B repair in the first review is only safe after A's verdict is recorded.
- P4. `src/phase.ts:107-112` resets `fix_rounds` to 0 on failed recovery, and `src/routing.ts:42-44` uses that counter to decide B-only re-check. After recovery both seats review, so A reviews its own repair. emdash-launch `review-A.md` says so in its independence note. The same reset means the cap of 3 at `src/phase.ts:238` never fired on a leaf with 3 repair rounds and 5 failed stops.
- P5. `skills/check-issue/SKILL.md:27` sends operator-only blockers to `failed`, yet emdash-launch `review-A.md` lists the stray repo as Fix F2 and asks check.fix to carry it. A `fix` verdict cannot express "operator action", so it costs an A turn that can do nothing. The 4 failed/recover flaps in 4 minutes are the same gap.
- P6. `skills/check-issue/SKILL.md:57` limits re-check blocks to defects the repair introduced. emdash-launch re-checks found F11, F12 and F13 that way. These are real, B had traced each to a line, and each cost a full A leg.
- P7. `skills/implement-issue/SKILL.md:75` makes A rerun criterion proof and every `checks` command after a repair. A B repair needs the same duty, or merge (`skills/merge-issue/SKILL.md:35`) is the only gate.
- P8. B already writes to the branch without review: it commits outstanding changes and resolves rebase conflicts (`skills/merge-issue/SKILL.md:35`, `:39`). Yet a red check at merge goes back to A (`skills/merge-issue/SKILL.md:41`), even for a one-line cause.
- P9. `skills/check-issue/SKILL.md:53` leaves doc and index authorship with A. `docs/guide/phases.md:12` and `:103` state that A repairs and B reviews. Both need new wording if B repairs.
- P10. `learnings/LESSONS.md:7` records that B finds defects by running code where A missed them by reading. B's repair should carry that same running proof, not a read-through.
- P11. `issues/chart/realistic-fix-bar/CHART.md` put slot B model choice, the `fix_rounds` cap, routing and state schema off route on 2026-09-30, and its follow-up measurement has not run. `issues/chart/seat-role-swap/CHART.md` locks A as the worker. This chart reopens both on purpose and should say so.

## 5. Recommended destination

B repairs a Fix itself when it has already reproduced it, the change is local to files the leaf touches, and it needs no plan change, no missing unit and no new live run. This applies in the re-check pass and at merge on red checks, where B is the only seat in the worktree, so there is no race and no routing change. Each B repair lands as its own commit with a test that failed before it, is listed in `review-B.md`, and is gated by the `checks` and `merge_checks` that merge already runs. Large repairs, unbuilt units and plan-level findings still go to A through check.fix. Operator-only items stop being Fixes: they take the `failed` exit with the exact action, once. B-only re-check is keyed on whether a repair has happened, not on the resettable counter, so A never reviews its own repair. First-review B repair stays an open fork, allowed only after A's verdict is recorded. Expected gain is bounded: about a third of recent framework repair cycles are small enough to qualify, and the emdash-launch example lost most of its time to one large repair and operator blockers, which this does not remove.
