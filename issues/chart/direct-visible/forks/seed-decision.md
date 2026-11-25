# Seed decision: direct-route work tracked like a lifecycle leaf

## Question

Tamdoma/akrogon#153: `## Operator decision (Ivan Juras, 2026-11-23)`

## Findings

Check record, 2026-11-24. Pull time 2026-11-24T22:57:50Z (`akrogon pull`, cwd /home/ivan/Work/infra/akrogon).

- `gh api graphql` issue 153: author `ivanjuras`, `lastEditedAt` null, `userContentEdits.totalCount` 0 (no body edits).
- `gh api repos/Tamdoma/akrogon/collaborators/ivanjuras/permission --jq .permission`: `admin`.
- Counts: author reads admin, no editors, no edit at or after the pull time.

## Taken

## Operator decision (Ivan Juras, 2026-11-23)

- Direct-route work is tracked like a lifecycle leaf, run in the charting door's current tab (not a new tab) by the current charting slot A, with whichever slot is the reviewer.
- `akrogon status` shows it exactly like a lifecycle leaf: its phase (build, review, repair, merge), its seats and its runs.
- It broadcasts on landing like a lifecycle leaf.

seed decision from Tamdoma/akrogon#153, taken at import on 2026-11-24, not asked, decided by ivanjuras

Reason: not stated. Alternatives: not stated.
