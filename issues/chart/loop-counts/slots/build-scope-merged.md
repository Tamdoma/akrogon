# build-scope merged notes

Tags name the slot whose own notes hold the line. Notes: build-scope-A.md, -B.md, -C.md.

## Q1 build at all
- Do not build now. No missed or false loop call on record, pain unmeasured, the watch turn stays either way (SKILL.md:42). Reopen on a concrete counting error or measured recurring cost. (A,B)
- Nothing records a missed or false loop call today, so that reopen trigger can stay unfired because errors are invisible. Name where an error would surface (the watch report, which already names its evidence when it steers) or say the trigger is operator notice only. (C)
- Build small: grouping the parsed entries is one pure function next to tested code; counting hashes by eye per busy seat per tick is mechanical work agents do worst, and both errors cost (a missed loop burns seat hours, a false loop stops a healthy seat). (C)
- Honest exact counts need parser work across three formats: codex and pi join inner commands into one target (log-tail.ts:208/:224, :276), pi joins multi-edits (:260/:323-327), results are cut to one excerpt (:392, :412). (A,B) C limits counting to entry granularity and whole-call edit pairs, accepting those limits. (C)

## Q2 if built, who owns the bar
- Script owns counts and the mechanical threshold match; the agent keeps the intervention decision, including judging a match as normal work. (B)
- Script prints a verdict line; skill keeps on-brief and hung-tool judgment. (A, if built) Rejected by B and C. Three identical results can be normal polling. (B) Status-only grouping flags the normal edit, test, edit, test cycle. (C) "Same result" has no exact mechanical meaning, durations and temp paths differ. (C) It must be defined before building: observed result content plus terminal status before display truncation, excluding only documented transport metadata. (B)
- Script prints counts only, grouped by command hash and status; skill keeps the thresholds and every judgment. (C) B accepts counts-only as weaker, but command/status groups are not result equality and cannot meet the command-and-result repeat bar. (B)
- Window: the last 20 printed entries, so counts match the visible lines; whole-log re-fires resolved loops. (A,B,C)

## Evidence
- skills/watch-issues/SKILL.md:42; log-tail.ts:75-92, :208, :260, :276, :379, :392, :412-420, :486; log-tail.test.ts:142-378. (A,B,C)
- Google SRE book, Monitoring Distributed Systems (Ewaschuk): simple low-noise signals that justify interruption. Anthropic, Building Effective Agents (2024-12-19): add complexity only when it improves outcomes. Both support deferral without evidence of benefit. (B)

## Pitfalls
- "Same result" from lossy data: hashes, exit codes or excerpts are not result equality. (A,B,C)
- Unknown or running entries in an error run: error means `exit N` or `error`; unknown breaks a run. (C) Mixed, pending and unknown entries need an explicit rule, and only a nonzero exit is an error, since the claude parser can print `exit 0`. (B)
- Undo across files or partial multi-edits: same file and successful inverse edits. (A,B,C) Multi-edit boundaries must be kept. (B) Match against the most recent prior edit on that file. (C)
- Counts as stop authority: the agent keeps brief judgment, idle check and one stop per seat. (A,B,C)

## Where slots differ
1. Build (C) vs defer (A,B).
2. If built: counts only (C), counts plus threshold match (B), verdict (A).

## Rebuttal corrections applied
B's rebuttal F1-F4 (build-scope-rebuttal-B.md) and C's D1-D2 (build-scope-rebuttal-C.md) applied above.
