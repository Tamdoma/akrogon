# Seed decision: Tamdoma/akrogon#152

## Question

Tamdoma/akrogon#152 — ## Operator decision (Ivan Juras, 2026-11-23)

## Findings

- ivanjuras: permission admin (author); lastEditedAt null; userContentEdits totalCount 0. Checked 2026-11-23T09:34:08Z.

## Taken

## Operator decision (Ivan Juras, 2026-11-23)

Operator's words: "So, I don't want to get all the way to the end of the subscription limit usage either. I just want the agent to smartly decide what it thinks the current test should have the budget limits for, and then if it fails, then expand it itself. This should be a smart feature, not something that is kept anywhere." Earlier the same day: "But I don't want these artificial caps or whatnot, this should be decided by the agent on a per case basis."

Decided points:

- No stored budget ceiling. Nothing in `~/.akrogon/config.yaml` or any other file holds a standing session or minute cap that paid runs reserve against.
- Per paid test, the seat chooses the budget (sessions, minutes) that it judges fits that test.
- When the run fails because of that budget, the seat raises the budget itself and reruns, with no operator approval.
- The seat's judgment keeps spend well short of the subscription's usage limit. Running until the subscription limit stops it is not acceptable.

seed decision from Tamdoma/akrogon#152, taken at import on 2026-11-23, not asked, decided by ivanjuras

Correction (operator, 2026-11-23, signposts reply): "I don't want you to worry about my limits ... don't worry about the actual current account limits ... I just don't want the failures because of the budget to happen ever. So, be even more lenient about the budget." The point "keeps spend well short of the subscription usage limit" is dropped; budgets are generous and raised on any budget failure.
