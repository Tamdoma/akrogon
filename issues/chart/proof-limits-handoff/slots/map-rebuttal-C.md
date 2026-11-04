# Rebuttal C: merged map, proof-limits-handoff

Disagreements only. The merged map's attributions of C's lines are correct.

## R1 Open, done-criterion form: withdraw C's proposal

The merged map carries C's proposed criterion, a read-only audit of the about-titles leaf draft flagging criterion 1 against `proofs[0].limits`. I withdraw it. Two reasons.

- The audit is door judgment, not a command. `shapes.md` "Preflight and validation" says the audit "reads the briefs as an implementer"; nothing runs it, so a criterion that names its result on a draft is an observable only in the door's own reading. There is no command whose exit shows it.
- The draft lives in the framework repo, outside the leaf's ownership. `shapes.md` "Leaf files" requires "an observable result in this leaf's ownership".

What to put instead: the form closed akrogon skill-text leaves already use. `issues/closed/autopilot/any-consultants/brief.md` "Done-criteria" and `issues/closed/agent-test-rules/test-rules/brief.md` "Done-criteria" state each as "a reader of `SKILL.md` ... learns that ..." per file and section, with a last criterion `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` listing only the named files. Check reviews it by reading. The about-titles draft can still be cited in the brief's Why as the worked example the text must catch, without being a criterion.

## R2 Open, "deciding property": close it with the clause rule

The merged map leaves "deciding property" open. C's map Q1 answered it and the merged map dropped the answer. Add: a done-criterion that is a compound sentence has one property per clause that names an outside system's acceptance or an existing checker's verdict, and the coverage step treats each such clause separately. Evidence: the closed leaf's criterion 1 (`issues/closed/about-titles/fixture-weave-recorder/brief.md` "Done-criteria") bundles meta fields, byte stability, finalize acceptance and verify acceptance in one sentence, and only the last clause was unproven. Without the clause rule a door can mark the whole criterion covered by the proof that reached the first clause.

## R3 Fork 1 difference, the review line: evidence the merged map omits

The merged map records A's reason for no review line as "nobody reads it under autopilot". The record from the case cuts the other way: the about-titles handoff review was written in A's pane and the only trace that survives is the one `CHART.md` "Autopilot" line ("handoff review (autopilot, A's pane): tree ...; grants ...; usage outcome partial; preflight ...; akrogon status validated"), which has no proof-coverage entry, so the intake's "whether the operator saw the limits line at review is not known" cannot be answered from the chart folder. Under autopilot the review line is the only durable record of what the door compared. The existing live-run line in `SKILL.md` "Handoff" is "information only" for the same reason. Keep the difference open, but with this evidence attached to C's side.

## R4 Pitfalls, missing: fix is not live until the next release

The merged map has the release fact under Evidence (B,C) but not as a pitfall. Add one line: the handoff review for this chart states that doors keep loading `~/.akrogon/current` (release 9ee76bf6, identical to the repo copy today) until the next release link, so #127 stays reproducible in any door run between merge and release. Prevents the operator reading "Handed off" as "fixed".
