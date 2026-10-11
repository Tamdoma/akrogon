# Opening map, slot A

## Shared root
A repo-level fact (main is red on command X, a seat has run for hours) is only found by a per-leaf pass and stays in that leaf's record. Nothing raises it once to the operator or to the other leaves. The merge turn already solved this for itself: `--red-on-base` writes one repo hold (`held.yaml`), notifies once, and the hold drops when main changes (src/phase.ts:844-880, src/next.ts:1044-1070, src/AREA.md:30). Pre-merge phases and busy seats have no equivalent. (better-than-training, inspected 2026-10-10)

## #76 red main fails leaves one by one
- Confirmed. implement-issue SKILL.md:38 and check-issue SKILL.md:63 end a proven red-on-base with `akrogon phase <slug> failed --reason "<command> red on base <sha>"`. No step reads or writes a repo record. Each leaf runs its own base comparison (full gate, ~15 min in framework).
- Hold today is merge-only: written only at src/phase.ts:857 (merge ending with batch), read only by mergeTurn and status.
- Fork R1: what a pre-merge leaf does on red base.
  - R1a: the stop writes/joins the repo hold (sha + command, first notice only), leaf goes `failed` with a red-base cause; when the hold drops (main content changed, or `akrogon unhold`) dispatch moves those leaves back to `failure.phase` automatically. Reuses hold, no new phase. Risk: auto-resume on a main change that did not fix X loops; bounded because the resumed run re-proves and re-joins the hold (one notice per sha).
  - R1b: new `held` phase. More explicit, costs schema, status, watch and every phase table.
  - R1c: notify-only, keep manual recovery. Cheapest; leaves still each burn a full run.
- Fork R2: should a leaf skip its own base run when the hold already names the same command on the same base sha? Saves ~15 min per leaf. Risk: different failing cause on the same command attributed to main. Mitigation: skip base run only, the leaf run still ran and is red.
- Pitfall: lesson 2026-10-10 red-main-hold stale clear: any clear must revalidate under the lock.
- Pitfall: base fixed outside git (#76/#77 case: root node_modules). Sha does not change, so content-based drop never fires. Needs `akrogon unhold` (exists, src/hold.ts:104) to resume held leaves too.

## #77 stale base-red evidence reused after failed -> check.review
- Confirmed by rule text: check-issue SKILL.md:25 "an existing review and unchanged diff are evidence to resume from"; :61 rerun only for code change, missing evidence or specific concern. Base-red stop requires runs "completed" but not "in this pass". commitMove (src/phase.ts:142-156) resets done/verdict/prompted, leaves review-*.md and logs.
- Fork E1: how to make stale reuse impossible.
  - E1a (mechanical): the red-on-base stop takes the two log paths; `akrogon phase ... failed` refuses unless both logs exist, are non-empty and are newer than this seat's `prompted_at`. Removes the class for every harness.
  - E1b (prompt rule): skill text "base-red evidence is never reused across passes". Probabilistic, same class can recur.
  - E1c: `failed -> X` move archives prior review/report files. Moves records the operator may want, blunt.

## #78 busy seat notice only on `next`
- Confirmed. observeBusy (src/next.ts:230-260) runs only inside an `akrogon next` pass; herdr working-status events return early; the watch's Busy rule (skills/watch-issues/SKILL.md:40) acts only on loop evidence and runs no `next` for busy seats, so a seat doing steady but endless work never trips anything.
- Prior lock: seat-stall-detection (closed 2026-09-18) ruled out any akrogon clock, poll or watchdog; stall-notifier-removal kept the 60-min notifier. The operator-started watch (cron) is the one allowed clock.
- Fork W1: where the duration notice lives.
  - W1a: watch-issues: observe.ts already prints `busy=HhMMm` and `notified=`; watch notifies once per seat episode past a bar, with leaf, phase, elapsed. No new akrogon clock. Only works while a watch runs.
  - W1b: watch runs `akrogon next <slug>` for busy leaves so observeBusy fires. Reuses notifier but `next` on blocked leaves throws (watch SKILL.md:36).
  - W1c: reopen the 09-18 ban, add a timer. Contradicts operator rule.
- Fork W2: the bar. Fixed 60 min (STALL_MS) vs the charted per-leaf estimate (#75 review line, not stored in leaf files today).

## Split
Two independent destinations in akrogon: (1) red-base handling for pre-merge leaves (#76 + #77; E1 is a parallel leaf, R1 another), (2) watch busy notice (#78). No dependency between them. #69 is skipped (owned by merge-load-flakes).
