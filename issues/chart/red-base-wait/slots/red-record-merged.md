# Red record, merged A and B

## Q1 entry and clearing
- Pick (A,B): one entry per failing unit (runner/stage, file/suite, full case name) with its command, args, scope and material conditions as provenance. Units from one red command stay separate and share comparison/log refs. One repo record, additive, written under the mutation lock.
- Clearing (A,B): an entry resolves only on a fresh completed green result for that exact unit on the target side under equivalent conditions, from a run that already happens (leaf comparison, merge run, repair verification, or an explicit operator run). Partial: one unit resolves while another stays (A,B). A fix merge, issue close, or the test disappearing from output never resolves (A,B). No clock, no poll (A,B).
- History (B): the old observation and the resolving revision stay as history; old revisions are not relabelled green. A recurrence after resolution is a new entry and notifies again (B). Resolution on a target descended from last-seen sha (A) is compatible.
- Lock (A,B): update and resolve re-read and compare the entry inside the lock; a newer conflicting red observation during proof refuses the clear (lesson 2026-10-10-red-main-hold-stale-clear).
- Delivery (B): incident and notice delivery stored separately. Failed delivery is visible and retried only on an existing event or command. No exactly-once claim across a crash.
- Rejected (A,B): per-command entry; clear on fix merge; clear when main moves; resolved entry kept as a standing exemption.

## Q2 fix ownership (disagreement, A concedes)
- A pick: the seat creating a new entry runs seed-issue once; the entry stores the seed URL; seed-issue's duplicate lookup (skills/seed-issue/SKILL.md:67) folds a second reporter.
- B pick: one notice and a visible status entry; the operator owns triage and charts the fix. A seed is unverified intake, not ownership (seed-issue:67-84 makes no assignment, and a failed lookup still posts, so two seats can both file). Auto-filing also needs a gh identity proof at handoff.
- A concedes: the C8 double fix came from two leaves each repairing main inside their own work. Under waiting-leaf Taken leaves continue instead, so the fix is removed by a skill rule: a leaf never repairs a recorded red outside its own criteria. Seeds add an external call and a race without giving an owner.
- Open (B): whether the record carries an owner link (fix leaf or source issue) or status just lists active reds until the operator charts the fix.

## Q3 flaky
- Pick (A,B): green-on-retry stays in the leaf's comparison record and report only, never in the red record. Only a completed without-change red can create an entry. Repo-wide flake tracking is a separate destination.
