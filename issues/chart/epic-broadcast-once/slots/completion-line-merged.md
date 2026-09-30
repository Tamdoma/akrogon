# Completion line

## Question
Q1. When a completion owner finishes, what line does `akrogon phase <slug> merged` print for the merge slot to trigger the broadcast?

### Carries
- Intake rule: standalone issue broadcasts on completion, epic member issues stay silent, one broadcast covers the whole epic.
- Operator: "It should be a simple change."

## Findings
Research: better-than-training · `src/phase.ts:138-175` and consumers `skills/merge-issue/SKILL.md:47`, `skills/broadcast-issue/SKILL.md:10`, read 2026-09-30 · the owner and completion flag already exist, only the print is misplaced and names the inner issue.

Options:
- 1a `issue complete <issue>` for standalone (unchanged), `epic complete <epic>` when an epic completes, nothing for an inner issue. Recommended by A: the word matches the thing, and the merge-issue rule reads "prints `issue complete` or `epic complete`". (A)
- 1b Move the print below the guard and print `issue complete <owner>`. Recommended by B: smallest contract change, one trigger token, skills only clarify that the name can be an epic. (B)

Agreed consequences (A,B):
- Merge slot gathers the completion owner's briefs (the epic's, when the leaf has one) before `merged`, since one broadcast covers the epic.
- Source closure timing, recovery silence (`justMerged=false`) and the concurrent race test's exactly-once guarantee stay unchanged.
- Tests `tests/phase.test.ts:179,181,610,646` flip to the new rule. `tests/next.test.ts:844,1007` are standalone and stay.
- Wording sweep: `skills/merge-issue/SKILL.md:3,47`, `skills/broadcast-issue/SKILL.md:3,10,14`, `docs/guide/merge.md:19-36,69`.

## Taken
