# Merged notes: filing-rule (A: map-A.md, B: map-B.md)

## Q1 · Who files, and on what trigger?
- (a) The seat files through the existing `seed-issue` skill right after its known-red judgment agrees, on every route: implement end and check.fix (`skills/implement-issue/SKILL.md` Shared context), check.review and check.repair (`skills/check-issue/SKILL.md` check.review paragraph), merge red verify (`skills/merge-issue/SKILL.md`), and the door's direct landing (`skills/chart-issues/SKILL.md` `## Direct route` 5.3). Covers configured checks (verify `--known-red` pass with agreeing judgment) and commands outside `checks` (done-criterion proof or ad-hoc suite) when the seat's own completed base run of the same command fails the same tests. Reason: the judgment gate already decides "main's defect"; seed-issue already routes (framework test -> `Tamdoma/tamdoma-framework` via framework `akrogon.yaml:1`) and dedupes; linked in claude, codex, pi. Cost: an agent obligation, not mechanically guaranteed. (A,B)
- (b) `akrogon verify` files via `gh` in `sendMainRedNotice`. Rejected: configured checks only (the #121 suite is not one), runs before the seat's causal judgment (`src/verify.ts` finally block), re-implements routing and dedupe, cannot cover manual proofs. (A,B)
- (c) Local record under `issues/`. Rejected: leaf branches cannot write `issues/`; not "filed as a bug". (A)
- Boundaries kept (A,B): filing changes no verification status; a red done-criterion stays blocking; a green retry stays `inconsistent` and is not filed; a killed or incomplete base run is not a comparison (`src/verify.ts` completed check, `tests/verify.test.ts` incomplete case).
- Pitfall (B): seed-issue ends with `Next: none` and stops (`skills/seed-issue/SKILL.md` Submit and finish). Removed by the seat rule saying the filing runs inside the pass, its outcome line goes into the pass record, and the pass continues to its own phase action and footer.
- Pitfall (B): implement's operator-blocker stop could fire on a `gh` permission failure. Removed by stating a filing failure is not an operator blocker for the leaf.

## Q2 · What does one filing hold?
- (a) One report per supported common cause: the commands and failing tests it explains listed together, unrelated defects separate; it names the exact command and scope, head and compared base SHAs, retry result, short failing excerpt, kept log paths and the leaf, with cause kept apart from observation as seed-issue already requires. (A per command, B per supported mechanism; merged as one per cause, which is per command when nothing connects them.) (A,B)
- (b) One per failing test name. Rejected: 38 reports for one stub leak. (A,B)
- Pitfall (B): the compared base is the merge-base with the tracked default branch, not today's tip. Removed by the filing naming the exact compared SHA and claiming no more.
- Pitfall (B): seed-issue allows one-hop file reads only; the filing reuses the evidence the pass already gathered and starts no extra verification.

## Q3 · What counts as already filed?
- (a) seed-issue's existing lookups decide: an open report covering the same defect suppresses filing and its URL goes in the pass record; best-effort, not exactly-once (search then create is not atomic). (A,B)
- Closed reports: seed-issue today treats any covering report, open or closed, as covering. A red seen again after that report closed is a recurrence the outcome needs filed. (B picks a new linked report for a recurrence; A agrees.) Change: in seed-issue, a closed report covers only a failure seen before it closed; a recurrence posts with the closed report on its Related line, never reopening or commenting. Cost: one rule change in seed-issue that applies to every caller. (A,B)
- Rejected: notice reservation as GitHub dedupe (B F2), permanent suppression by test identity. (B)

## Q4 · What if filing fails?
- (a) The created or found URL, or the failing command and error, goes in the pass record (`implementation/report.md`, `review-B.md`, or `<chart>/direct/report.md`); the leaf continues; a later encounter files again through the ordinary lookup; no retry queue, timer or wait. Stated limit: no eventual-delivery guarantee. (A,B)
- (b) Block until filed. Rejected: reintroduces the base-red wait foreclosed 2026-10-10 and 2026-10-17. (A,B)

## Off route (A,B)
- Removing or changing the herdr main-red notice in `src/verify.ts`.
- Skipping base comparison because a filed report exists; auto-charting repair; closing issues on green.
- #120: owned by `killed-check-log`.

## Where slots differ
- Q2 grain: A per command, B per supported mechanism. Merged above.
- Q3 closed recurrence: raised by B only; A adopted it.
