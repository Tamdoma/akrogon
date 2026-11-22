# Seed decision: Tamdoma/akrogon#149

## Question

Tamdoma/akrogon#149 — ## Operator decision (Ivan Juras, 2026-11-22)

## Findings

- ivanjuras: permission admin (author); lastEditedAt null; userContentEdits totalCount 0.
- Pull time 2026-11-22T17:54:08Z. Commands: gh api graphql (issue author, lastEditedAt, userContentEdits first:50); gh api repos/Tamdoma/akrogon/collaborators/ivanjuras/permission --jq .permission.

## Taken

## Operator decision (Ivan Juras, 2026-11-22)

- Goal, in the operator's words: "I want Akrogon to be fast, lean, merge things fast, and also use the computer in an optimal way so it doesn't get overloaded while making sure that none of the pros or testing ceremony gets in the way."
- File every audit finding that improves akrogon's lifecycle together, as this one report. P1 (rerun the failing units inside the land run) comes first.
- Not in scope: the land-red ownership work already in #147, and the temp placement in #148.

seed decision from Tamdoma/akrogon#149, taken at import on 2026-11-22, not asked, decided by ivanjuras
