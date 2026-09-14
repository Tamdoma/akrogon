# Process review: claude

Four passes over the prompt in `process-review-prompt.md`: measured cost and speed (section F), charting and handoff (A, B), lifecycle skills and prose versus machinery (C, E), command and herdr coupling (D). Criteria in order: simplicity, clarity, elegance, function over form, cost, speed. Every finding names what it removes and what it breaks. Slot B's report is separate.

## Summary

1. The process works. Steady-state leaf merges in about 9 minutes (akrogon) or 21 minutes (framework) over four phase moves, failed reached 3 times in 132 leaves, and every failure was a stalled seat, never the fix-round cap.
2. Wall clock is lost to stalled seats, not to phases. 58% of framework phase time sits in 17 intervals over 60 minutes, 13 of them implement at attempts 1. Plan phases cost under 1% of time. The fix is the result-hash loop guard leaf in pi-extensions, not anything in akrogon.
3. Two reviewers earn their cost. check.review is about 40% of sessions, but in 17 of 23 framework fix routings only one slot found the defect. Halving review would save 20% of sessions and lose those catches.
4. Merge bounces are the one lifecycle waste: 22% (akrogon) and 14% (framework) of merges go back to check.fix, almost all for rebase conflicts A could resolve in place. That is 5 to 12% of sessions.
5. The stand-in seat is harmful. In 11 firings it never rescued a dead pane, twice put two agents in one worktree, and twice made one session write both blind reviews.
6. The twenty-fork cap and the one-fork-per-session rule were right to remove. akrogon-loop ran 30 forks with the cap in force and nothing fired. Fog plus the new-intake-on-contract-change rule guard the actual condition.
7. Most of what can go is prose nobody reads or code that fired once and did the wrong thing. Fourteen findings below, twelve of them deletions.

## Findings

Ordered by value. Code F, criteria named where they apply.

**F1. Drop the stand-in seat and stop treating `unknown` as a failed attempt.**
Evidence: `next.ts:212` `seatFor`, `:387`, `:504`; `:391-398` jumps to attempts 2 on an `unknown` herdr reading, which herdr's own contract says "does not prove completion". `status` and `init-issues` reached A:3 within 144 s and 139 s of entering review, impossible through two 2-minute graces. `retire-issue-scripts`: B's pane got implement twice, A's pane got `implement slot=B`, both panes implemented in one worktree for ten minutes. `run-trace-and-advance`: A's pane session recorded B's verdict, B's pane never got a review prompt. `status/review-A.md` line 7 says so itself. Both `plan.positions -> failed` cases still failed with the stand-in.
Proposal: `busy()` includes `unknown`; a slot is prompted only in its own pane. Removes `seatFor`, the unknown jump, the problems page row "third try goes to the other pane", `next.test.ts:430`. Breaks: a truly wedged pane waits for the operator. Observed wedged panes: zero. Criteria: simplicity, elegance, the blind-slot constraint. Verdict: drop.

**F2. Merge conflicts stay with A. `fix_rounds` counts only check.review.**
Evidence: akrogon merge -> check.fix 10 records vs review -> check.fix 4. `tree-preflight` took three conflict rounds, reached fix_rounds 3 with zero defects, one more and `phase.ts:138` fails a clean leaf. `pull-close` spent two sessions and 26 minutes routing one import block through B and back. tamdoma review-A merge sections show A resolved in place 25 times and routed 12. Proposal: merge-issue line 33 becomes "resolve the rebase yourself, rerun checks, only red checks after a clean rebase go to check.fix". `commitMove` increments fix_rounds only from check.review. Removes the preserve-rebase-for-B rule, the integration re-check, the counter special case. Breaks: A's integration diff is not reviewed by B, which is already the majority practice and is covered by full checks. Criteria: simplicity, clarity, cost, speed. Verdict: drop conflict routing, keep red-check routing, change the counter.

**F3. `failed` exits to any working phase.**
Evidence: `routing.ts:35` allows implement only. All three real failures were attempts failures, two in plan phases. The operator hand-edited `state.yaml` back both times, and a hand edit without resetting attempts re-fails at `next.ts:406`. Proposal: `failed.next` lists every non-terminal phase, `commitMove` resets counters as it already does. Removes the hand-edit workaround. Breaks nothing. Criteria: clarity, function. Verdict: change.

**F4. Delete `recoverMerge`, refuse an empty diff at review handoff.**
Evidence: 134 merge -> merged records, 131 at A:1 where the merge slot ran `phase merged` itself. The one `recoverMerge` firing is `migrate-charts` with `diff: ""`, an empty branch two reviewers passed ready/ready and then "merged" with no checks and no broadcast. It runs `git fetch` with a 60 s retry inside the global lock on every hook event of a merge leaf. Proposal: drop `phase.ts:156-167` and `next.ts:503-511`; `requireCodeOnly` also refuses an empty diff. Breaks: a merge session that dies after pushing needs a hand `akrogon phase <slug> merged --slot A`. Observed: zero. Criteria: simplicity, elegance, cost. Verdict: drop, add the gate.

**F5. Delete the repo lock. `pull` runs unlocked.**
Evidence: every repo-lock holder except `pull` already holds the global lock. `pull` writes only `issues/seeds/*.md`, which no command reads. Concurrent pulls write identical content. Effects today: one `flock` spawn per leaf per sweep, and dispatch waits behind GitHub pagination at startup. With F16 from the audit-fixes leaf, one global lock remains. Removes `state.ts:136-138`, five call sites, `issues/.lock`, README text. Criteria: simplicity, elegance. Verdict: drop.

**F6. `design.md` points to forks, does not copy them.**
Evidence: only `plan-issue/SKILL.md:14` reads design.md; implement and check read plan.md and the brief. 108 of 135 designs carry the stale "chunk parks at dispatch" wording and 123 carry a "Current interpretation" paragraph explaining what the copy means now. Copied share of design.md: 78 to 92%. The Playwright standing line gave static docs leaves trace-on Playwright tests three times. Proposal: design.md = leaf architecture + the fork paths under `chart/forks/` + one line to `standing-design.md`. Removes the copy rule (`shapes.md:148`), the carry rule (`standing-design.md:7`), the interpretation paragraph. Breaks: design.md is no longer self-contained; a fork edited after handoff is seen by later plans. Criteria: simplicity, cost, clarity. Verdict: merge.

**F7. Fog must be empty at handoff. Drop Forks open.**
Evidence: `SKILL.md:43` "no fog requires guessing" is not checked and 4 of 26 handed-off charts have fog bullets. Forks open is never read by code, absent from akrogon-loop, stale in two framework charts. Proposal: preflight refuses handoff when Fog has a bullet, accepted unknowns move into a leaf brief, Forks open leaves the template. Criteria: clarity, simplicity. Verdict: drop the section, merge the fog rule into preflight.

**F8. Lifecycle prose that never fires. One leaf, five deletions.**
- Peer-question paragraph: `questions/` exists in zero of 132 closed leaves, paragraph repeated in five skills plus two guide pages.
- `Next:` footer line and the scrambled-context paragraph: the command ignores `Next:` (plan-issue line 66 says so), routing lives in `routing.ts`.
- Failed-diagnosis rule: 0 of 3 failed leaves have one, because all failures happen in `next` where no agent runs.
- `check-issue/ponytail.md`: byte-identical to the implement copy, read by two reviewers per leaf, the Fix verdict already requires a defect.
- Lesson removal and dating: one line ever removed in akrogon, zero in tamdoma over 32 lessons, two lessons recorded twice.
Keep `Last operation:`. Criteria: simplicity, clarity, cost. Verdict: drop all five.

**F9. Chart shape: small rounds may be small, corrections are dated additions.**
Evidence: `questions.md:25` "never cut, even for a small item" produces full round blocks for one-finding forks; nothing mechanical reads the shape (`status.ts` reads `## Taken` and Fog only). `shapes.md:80` says a correction is a supersede fork; the only supersede fork ever written is the rule's own fork, every real correction is a dated block in place (`config-shape.md:82-84`, `implementer-brief.md:50-54`). Proposal: sections with nothing are omitted; "the Taken line is never rewritten, a correction is a dated block below it, a full reversal is a new fork". Criteria: function over form, simplicity. Verdict: merge both.

**F10. `park` takes a running leaf. Drop `hand_built` and `sync`.**
Evidence: there is no way to stop a running leaf. `park` refuses it, closing the tab re-spawns it, closing a pane re-splits it, only `hand_built: true` stops it and no guide page says so. `hand_built` has 2 uses in 134 states, both bootstrap. `sync` was run zero times in shell history against 236 hand commits in framework; the operator uses gacp. Proposal: park closes the tab, removes the worktree, moves the folder, and is the one verb for taking a leaf off the board; `issues/parked/` stays. Bootstrap work becomes a taken fork with a done date. Removes `sync.ts`, the `hand_built` key and branch, `next.ts:491-494`, `state.ts:22`, three guide pages. Breaks: a bootstrap leaf has no EPIC row. Criteria: simplicity, clarity. Verdict: drop sync and hand_built, change park.

**F11. Drop per-repo `max_active`.** Added 09-12, unset in all three repos. `config.ts:32`, `:125-130`, `next.ts:306`. Criteria: simplicity. Verdict: drop.

**F12. Typed `akrogon next` inside a leaf pane skips cleanup.** `next.ts:641-647` takes the hook path when cwd is a leaf worktree. Fix: `hooked = event !== undefined`. Criteria: clarity. Verdict: change.

**F13. Peer B rebuttal per round is rare but keep it.** One rebuttal file across 18 charts with slots, yet the map rebuttal changed 3 of 10 recommendations and B leaf review is the largest catcher of real defects (19 findings in `handoff-contract-gaps`, 5 revisions in `muse-audit-fixes`). The per-round blind answer costs one session and removing it delays disagreement past later rounds. Verdict: keep.

**F14. Keep the busy notice, note its flaw.** `busy_since` clears on any idle reading, and a parent pane with subagent workers reads idle, so the two-hour implements it targets are where it resets. It still fired on `unit-specs-lane` and `portal-activation`. `status` shows phase age, and the operator ran `status` 61 times. Revisit once the result-hash loop guard has run for a week. Verdict: keep for now.

## Keep as is

- Two initial reviewers, B reviewing its own code included: 13 of 14 logged pairs share a session and B still finds defects A misses.
- Debate opt-in: 6% of leaves, four sessions each, corrected the synthesizer once.
- `requireClean`, `requireCodeOnly`, verdict aggregation, A-only re-check, three attempts then failed, same-pane re-prompt with the 2-minute grace.
- Global `max_active`, tab match by id or label+cwd, pane re-split, `skipped`, `sweepAll`, the four hook events and two startup commands.
- Worker protocol in implement, sequential workers, the mismatch return that never fired but costs one paragraph.
- Map before grilling, blind maps with one rebuttal, B leaf review, all material questions in one round, prototype discard, one chart per destination, `Handed off <date>`.
- `blocked-by`, `sources`, `debate` keys. Broadcast by the merge slot.
- The four grounding lines in every skill.
- The removals already settled: fork cap, one-fork-per-session, types, tiers, dry-run subagents, decision coverage.

## Holes

- **H1** Stalled seats hold 58% of framework wall clock. The result-hash loop guard leaf in pi-extensions is the fix. Nothing in akrogon.
- **H2** Artifacts in the wrong place pass every gate: `manifest-lint` closed with both reviews under `implementation/`, `handoff-contract-slim` with no `implementation/brief.md`. Fix: gate, a non-empty-file check for the phase's own artifact in `transition()`.
- **H3** A chart closed without handoff has no terminal state; `status --charts` shows it charting forever and `phase.ts:93-94` only moves charts at epic completion. Fix: gate, status reads `^Closed` as terminal, plus a rule that the operator moves it.
- **H4** Post-handoff fork edits reach nothing, design.md is read at plan only. Fix: rule, a change after plan is a new leaf.
- **H5** `questions.md:31` waits on B with no timeout. Fix: rule, bounded wait then re-prompt.
- **H6** A GitHub source judged off route at charting has no closer, so it re-mirrors every pull. Fix: rule, off route records the source and the operator closes it.
- **H7** Chart-level `issues/` moves cannot ride a leaf, so `rename-vocabulary` did them uncommitted at root, and one "sync issues" commit (eed65fb) swept non-compiling `src/` onto main. Fix: rule, the operator commits chart moves as one commit before handoff and looks at `git status` before any root commit.
- **H8** Broadcast outcome vanishes with the closing tab. Fix: rule, the merge slot appends the sender result to review-A.md before `herdr tab close`.
- **H9** Both slots are pi with devin/swe-2-max. Cross-vendor is off and nothing surfaces it. Fix: nothing, state it.
- **H10** Every herdr pane event runs a three-repo discovery before finding no owner. Cost only.
- **H11** The pi-extensions log writes `repo: extensions` and `repo: pi-extensions` for the same repo. Fix: one value.

## Answers to the prompt's numbered questions

A1 map earns its place on large charts, duplicates round 1 on tiny ones (F9). A2 types gone, nothing lost. A3 F9. A4 8 to 10 B sessions per four-round chart, map rebuttal changes 3 of 10, keep (F13). A5 tiers gone, unenforceable. A6 prototype keep, 1 of 30 forks. A7 cap never fired, fog guards the condition. A8 F7. A9 F9. A10 B leaf review and preflight catch defects, dry-run and coverage never did. A11 line is fork = what, plan = how, overlap is restating not citing.
B1 F6. B2 standing-design changed behavior once, badly. B3 blocked-by 31%, sources 20%, debate 6%, hand_built 2 uses (F10).
C1 pull-close walk: 84 min, 16 sessions, 27 min on a failed prompt, 27 min on one import block. C2 debate rare, cheap, corrected once. C3 keep two reviewers. C4 cap never stopped anything, nearly failed a clean leaf (F2). C5 no inline leaf exists to compare, zero worker mismatches. C6 merge slot stays, routing after conflict is wrong (F2). C7 broadcast by merge slot, no delivery record (H8). C8 F8. C9 grounding lines keep, peer-question drop. C10 F8.
D1 F1, F11, F14. D2 F5. D3 F10. D4 F3. D5 F1.
E1 to E7: conflict routing and counter wrong (F2), stand-in wrong (F1), failed diagnosis cannot fire (F8), lesson removal never fires (F8), artifact existence needs a gate (H2), AREA.md path check ran in 157 reviews with zero fix findings, requireClean and requireCodeOnly are on the right side.
F measured: above in Summary.
G holes: above.
