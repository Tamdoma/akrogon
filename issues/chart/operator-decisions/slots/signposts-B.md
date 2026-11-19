# Signposts angles, slot B, operator-decisions, 2026-11-18

Read: INTAKE.md, signposts-draft.md, `gh issue view 714 -R Tamdoma/tamdoma-framework`. Nothing else read, nothing run.

## 1. Missed angles

M1. Does a recorded decision bind when the operator is not in the session (autopilot, watch)?
- Why evidence cannot settle it: agents file seeds under the operator's GitHub account (#714 author is `ivanjuras`), so nothing on GitHub tells an operator's decision from an agent that wrote the same heading. Draft 1a leans on "one cheap confirmation", and an unattended run has nobody to give it.
- M1a (pick) The marker alone binds in every mode. Autopilot never picks against it and lists each decision it took as binding in its report.
- M1b Unattended runs hold that chart and report a need until the operator confirms.
- M1c Manual asks once, autopilot binds without asking.
- Reason for M1a: M1b turns every decided seed into a stall, which is the cost #144 reports. A false marker needs an agent to break the seed-issue rule, and the report line makes it visible.
- Steers: the entry check, autopilot.md, whether 1a keeps its confirmation, the seed-issue rule on who may write the section.

M2. How far does the lock reach: the door only, or plan, implement and check too?
- M2a (pick) Whole lifecycle, by recording the decision as ordinary taken forks that cite the seed section. Later steps already treat taken forks as settled, so no new rule in plan-issue or check-issue. A reviewer who finds a contradicting fact reports the fact and does not redesign.
- M2b Door only. Later steps may still raise the design as a finding.
- M2c New rules in plan, implement and check that name recorded decisions.
- Steers: which skills are touched, leaf count, what the brief carries, draft 3. Not checked: that plan and check honor taken forks today. A should confirm before the round.

M3. Where and when may a decision enter?
- M3a (pick) One entry: the marked section in the seed body as it stands when the chart opens. The door pulls before it imports. After open, the operator decides in fork rounds as today.
- M3b Also later edits to the issue, issue comments and door messages, re-read during the chart.
- M3c Any operator text anywhere (repo files, chat) that carries the marker.
- Reason for M3a: the operator asked for a small gate. #714's decision was added by an edit after filing, and an INTAKE copy made before the edit never changes, so M3b needs a re-read rule and a rule for a decision that lands after a fork was taken.
- Steers: seed-issue Report text, chart-issues Open, intake freshness, draft 3 (M3b pushes toward code).

## 2. Disagreements

D1. Draft 1a: I pick it, minus "plus one cheap confirmation". A confirmation is the decision asked again, and it cannot happen unattended. Show the decision as taken in the opening map. The operator objects there if it is wrong. Depends on M1.

D2. Draft 4a: I pick it, with one gap named. Free proofs can show the rule text exists. They cannot show a door stops re-asking. The first real observation is the later chart of #714. Say in signposts that #714 is the live check and is outside this chart's done-test, so no proof here claims door behavior it did not observe.

D3. Draft 5a: I pick it. Add the order: #714 is charted after this lands. Charted before, it hits the defect.

No disagreement on 2a or 3a. 3a holds only if no code strips or refuses an unknown `## Operator decision` section. Intake says `pullRepo` copies the body as is. A should check any seed shape test before the round.

## 3. Needs

N1. None under 4a and 5a.
N2. 4b would need the operator's approval for a paid launch.
N3. Unverified: the door in buffalo-exterminators and tamdoma-framework runs the installed release, so the fix reaches #714 only after a release and install. If that step is the operator's, it is a human action before D3's live check.
