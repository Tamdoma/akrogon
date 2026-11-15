# Coverage rule

## Question

Q1. What does `akrogon verify --known-red` accept mechanically for a red configured check?
- 1a Drop only `(no test name)` from the refusal in `knownRedReceipt`, so that marker compares like a name: a nameless head entry is covered only by a nameless red base entry of the same command; a named head is never covered by a nameless base, a nameless head never by a named base; a gone log on either side never covers; the named-test path is unchanged.
- 1b A uniform function-only gate: remove test-name comparison from acceptance for every red. Same command, red on a completed linked base run, readable logs on both sides. A named `alpha` head against a named `beta` base becomes machine-eligible and only the seat's judgment refuses it.
- 1c 1a plus the same exit code on both sides for a nameless pair.

Q2. What must the seat judge before a nameless cover counts as passing?
- 2a One rule in all four seat paths: both logs read whole; the head log shows no failure the base log lacks; the command ended by its own verdict, never a killed, timed-out or crashed run; no cause in the leaf's diff; the leaf's own done-criteria proofs pass on their own, and work the shared failure kept from running is not exempted for what the leaf changed.
- 2b 2a, and in addition never for a command the seat judges to be a test runner, whatever the failure.

Q3. What happens to a configured check recorded `blocked` behind the covered red (every `full` check after a red non-`full` check, every `merge_checks` member after a red `checks` entry)?
- 3a The existing seat rule stays word for word ("A check recorded `blocked` in a verify receipt did not run, so the check named as its blocker is fixed first"); a nameless cover lets a leaf through only where no check is blocked behind the red, as for a named base red today.
- 3b The seat runs each blocked `checks` command itself through `akrogon run-check` once the blocker is an agreed known-red; `merge_checks` members cannot run that way.
- 3c `--known-red` runs the blocked commands itself.

### Carries

- Signposts (forks/signposts.md `## Taken`, operator 2026-11-09): 1a 2a 3a 4a 5a 6a. The command checks function only; the seat judges the cause; no new configuration; every existing known-red route follows one rule and nothing else moves; local fixture proof only.
- The reopened lock: issues/chart/red-base-wait/forks/comparison.md `## Taken` Q2 2a, reopened only as far as signposts 1a and 2a state.
- Map: slots/map-merged.md.

## Findings

- Merged notes: slots/coverage-rule-merged.md (A, B); rebuttal slots/coverage-rule-rebuttal-B.md; final shape slots/coverage-rule-final-shape.md; focused check slots/coverage-rule-final-check-B.md ("no defect").
- better-than-training, src/verify.ts `knownRedReceipt` and src/flaky.ts `failedTests`, read 2026-11-09 at a93fec75: with `(no test name)` out of the refusal the existing subset line yields every 1a outcome; `(log gone)` must stay refused or two gone logs would compare equal. It turned the change into a removal (A).
- better-than-training, src/verify.ts `runOnce`: every `full` check is recorded `blocked` after a red non-`full` check and every `merge_checks` member after a red `checks` entry; `knownRedReceipt` skips blocked head entries, so only the seat text stops such a head. akrogon configures `full: [test]`, framework `merge_checks`, herdr-setup neither (A). It made the blocked rule a question of this fork.
- better-than-training, the four seat paragraphs, docs/reference/checks.md `## Known red` and its error-table row, src/AREA.md's verify paragraph, read 2026-11-09: each states the named-only contract or the unconditional blocked rule (A,B).
- operator, forks/signposts.md `## Taken`, 2026-11-09: 2a does not confine hidden work to one shell command (B's rebuttal); it moved Q3 from 3a to 3d.
- practitioner, Chromium CQ (carried from issues/chart/red-base-wait/forks/comparison.md Findings, read 2026-10-10): a without-patch run excuses only what also fails without the patch (A).
- Observation 1 (free, read-only), 2026-11-09, door t15: `jq` over runs 980c6312 (head) and ce2cf1f4 (base) in /home/ivan/Work/infra/herdr-setup/issues/verify-runs.jsonl, then `cat` of each `shell` log; identity: operator's local user, no credential; version: akrogon release a93fec755e9b4481d96feda0001841a5eb072ca9. Result: a completed head run and a completed base run linked through `compares` at the merge-base 3cef1ac2, `shell` exit 127 on both, both logs present with the same single line and no `(fail)` line, base `notice: shown`. Cleanup: none needed. Limits: shows the records the changed rule will read exist for a nameless red; it does not rerun verify and does not show the changed verdict. Record: slots/evidence/herdr-setup-pair-2026-11-09.log.
- Observation 2 (free, local), 2026-11-09, door t15: `bun test --timeout=60000 tests/verify.test.ts tests/receipt-gates.test.ts tests/flaky.test.ts` at akrogon main a93fec75 on isolated fixtures; identity: operator's local user. Result: 64 pass 0 fail. Cleanup: fixtures self-clean. Limits: shows the named covers and refusals, the nameless-head-against-named-base refusal, the gone-head-log refusal and the receipt gates hold on the base; it does not show the new nameless cover, the named-head-against-nameless-base refusal or the gone-base-log refusal, which are the leaf's own tests. Record: slots/evidence/guards-main-a93fec75.log.
- B's V1 (slots/map-B.md): a `bash -n` chain stops at a missing file with exit 127 and never runs its third command.
- Remaining disagreement: none standing. B's notes picked 1b; its rebuttal raised no remaining objection to 1a.

## Taken

A's picks under autopilot (2026-11-09T19:58Z, door t15), not operator words: `1a 2a 3d`. Checked by B as one final shape: no defect.

Q1 1a. `knownRedReceipt` stops refusing a red head entry for `(no test name)` and still refuses `(log gone)`. Everything else in it stays: the whole eligible head row, exact `name` and `command`, a completed base run linked through `compares` at the current merge-base, base entry red and not blocked, every head name among the base names, blocked head entries skipped, at least one red entry. Results: a nameless head is covered by a nameless red base entry of the same command (new); a nameless head against a named base, a named head against a nameless base, and a gone log on either side are not covered; named pairs are unchanged. `failedTests`, `flips`, `newRedUnits`, `verifyRunSchema`, `runOnce` and scheduling do not change. No new configuration, receipt field or output comparison.
Reason: signposts 1a (narrowly) and 5a (nothing else moves); it removes a special case instead of adding a path.
Rejected: 1b, a uniform gate without name comparison (B's notes), because it hands the working machine refusal of a named mismatch to judgment alone; 1c, equal exit codes, because different failures share exits and the October lock foreclosed exit comparison.

Q2 2a. One rule in the known-red paragraph of skills/implement-issue (Shared context), skills/check-issue (check.review), skills/merge-issue (red verify) and landing step 3 of skills/chart-issues `## Direct route`. A known-red exit 0 counts as passing only when the seat's judgment agrees, and the judgment is runner completeness and causal fit, meaning one of: the red command logged a real test name and that name also fails on the base (unchanged); or the red command's log names no test on the head and on the base, and the seat, having read both logs whole, finds that the head shows no failure the base lacks, judged in substance and never as exact text, that the command ended by its own verdict and was not killed, timed out or crashed, and that the leaf's diff holds no plausible cause. A command that ended by its own verdict with an ordinary error, a missing input or a load diagnostic is not excluded for naming no tests. When both logs exist but show too little to establish a cause, the seat withholds agreement and the existing blocking path applies. In both cases the leaf's own done-criteria proofs must pass on their own; a cover never stands in for them.
Reason: signposts 2a and 3a.
Rejected: 2b, a blanket test-runner exclusion, a second classification with no setting behind it.

Q3 3d (B's proposal; A's notes held 3a until the rebuttal). The sentence "A check recorded `blocked` in a verify receipt did not run, so the check named as its blocker is fixed first" gains one exception in the same four places: when the blocker is a known-red the judgment agrees with (named or nameless), the blocked check stays recorded as not run, is named as not run in the seat's record and never reported as passing, and does not by itself stop the leaf. A done-criterion whose proof is a blocked check cannot be shown, so that leaf stops under its existing rule. A blocked entry never covers on the base (unchanged code). No blocked command is run by the seat or by `--known-red`.
Reason: signpost 2a ("untouched work hidden by the same base failure does not stop it") does not confine hidden work to one shell command, and 3a would leave akrogon (`full: [test]`) and framework (`merge_checks`) stopped by the reported class.
Stated cost: while the base check is red, a leaf can pass review and land without its `full` checks or `merge_checks` having run on it.
Rejected: 3a, the blocked rule unchanged; 3b, the seat runs blocked checks itself (cannot run `merge_checks`, fills a gap the operator accepted); 3c, `--known-red` runs them (a scheduling change).
Operator confirmation (2026-11-10, door t15, after the leaf landed in release 63526537): asked to keep 3d or reverse it with the stated cost shown, the operator answered "O1", keep 3d.

Pitfalls avoided, binding: a gone log never covers; the name reader and its reporting consumers are untouched; every seat path keeps receipt eligibility and recorded causal agreement as two obligations; a blocked check is never reported as passing; every refusal case that stays true under this rule is kept.
