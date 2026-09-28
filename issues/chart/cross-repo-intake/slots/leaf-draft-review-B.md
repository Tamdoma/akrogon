# Disagreements

Draft paths below are relative to the supplied scratchpad/leaves directory.

## R1 · The source repo is incorrectly exempted from the later check

`chart-destination-intake/brief.md:4` limits the two checkpoints to destinations other than the source and says the opening pull covers the source. This contradicts its own criterion 1 (`:14`) and the copied decisions in `design.md:5-6`. A same-repo chart can run for hours and miss reports filed after opening. Evidence: `issues/chart/cross-repo-intake/forks/destination-intake.md:30-31` selects source plus each destination and the two checkpoints, with one check only when they coincide.

Replace the second sentence of `chart-destination-intake/brief.md:4` with:

> The door checks the source repo plus every selected registered destination by running `akrogon pull` at each checked repo's registered root from `akrogon config` `repos`, when a destination is selected and again right before the handoff review. Deduplicate roots within a checkpoint. One check satisfies coincident checkpoints, and the opening pull counts only when it coincides with that checkpoint. The source repo is not exempt from the final check, including when it is also the only destination.

## R2 · Ownership excludes an existing guide contradiction that must be resolved

`chart-destination-intake/design.md:18` owns only the handoff section of `docs/guide/chart.md`. The existing line `docs/guide/chart.md:128`, outside that section, says every mirrored duplicate is closed during charting. The existing skill has the same broad instruction at `skills/chart-issues/SKILL.md:33`. Reporting the guide contradiction without fixing it, as allowed by `brief.md:17`, leaves instructions that conflict with approved Q3-A (`forks/destination-intake.md:32`). No command behavior change is needed, but the prose must distinguish unfinished matches from duplicate reports eligible for immediate closure.

Replace `chart-destination-intake/design.md:18` with:

> Owned: skills/chart-issues/SKILL.md, skills/chart-issues/assets/shapes.md, docs/guide/chart.md (the handoff section and the existing delivered-or-duplicate closure sentence at line 128).

Replace criterion 4 in `chart-destination-intake/brief.md` with:

> 4. docs/guide/chart.md's handoff section explains the destination check in plain words. Its existing delivered-or-duplicate closure sentence and the corresponding SKILL.md instruction explicitly exempt confirmed fully covered, unowned reports of undelivered work from immediate duplicate closure: those reports remain open as sources until their completion owner delivers. Search docs/ and README.md for contradictory intake or closure instructions, correct the owned occurrences, and report any others.

## R3 · The prose leaf's verification covers only the successful cross-repo case

`chart-destination-intake/brief.md:18` verifies a positive historical replay plus a successful empty destination pull. `design.md:15` supplies no negative or edge-case verification. `skills/chart-issues/assets/standing-design.md:8` requires those cases. They matter here because the draft introduces handoff refusal and source-ownership outcomes. The historical replay also needs to specify the pre-delivery state: #5 is closed now and its former delivering leaves are already closed, so using today's state cannot demonstrate the proposed unowned-match path.

Append this text to criterion 5 in `chart-destination-intake/brief.md`, before “The configured checks pass”:

> Treat the #38 replay as the pre-handoff state, with #5 open and unowned, rather than today's closed records. Record additional scenario reviews for a same-repo chart receiving a report after opening, a partial match, an identity already owned by another leaf or chart, an unrelated destination report, and a failed destination refresh with another independent destination available. For each, identify the applicable instructions and show the resulting refresh, import/source assignment, or affected handoff refusal. Keep these as evidence in the implementation report, without changing historical issues/ records or asserting exact prose wording in automated tests.

## R4 · The pull leaf states an unproven historical cause as fact

`pull-all-repos/brief.md:7` says the startup narrowing is why #5 was first mirrored after merge. The measured runs establish current cwd-sensitive selection, and the intake reports the late mirror, but neither establishes the timing of the historical startup or whether another pull occurred. Evidence: the chart's `forks/destination-intake.md:23-25` operation proof records current reads and expressly limits what they prove. The command defect is established without asserting this causal chain.

Replace the sentence “That is why Tamdoma/pi-extensions#5 reached pi-extensions seeds only after its fix merged.” with:

> The intake reports that Tamdoma/pi-extensions#5 was first mirrored after its fix merged. The measured selection defect explains how startup can miss that repo, but does not establish the historical pull sequence.
