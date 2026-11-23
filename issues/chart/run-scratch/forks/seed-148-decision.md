# Seed decision: Tamdoma/akrogon#148

## Question

Tamdoma/akrogon#148 — ## Operator decision (Ivan Juras, 2026-11-22)

## Findings

- ivanjuras: permission admin (author); lastEditedAt null; userContentEdits totalCount 0.
- Pull time 2026-11-22T17:54:08Z. Commands: gh api graphql (issue author, lastEditedAt, userContentEdits first:50); gh api repos/Tamdoma/akrogon/collaborators/ivanjuras/permission --jq .permission.

## Taken

## Operator decision (Ivan Juras, 2026-11-22)

- Run scratch moves to RAM (tmpfs). Do not move it as things are today: first stop run folders from piling up, then move to RAM.
- Goal: the setup that makes merges on this PC fastest overall, with the fewest failures, without overloading the host.
- This was filed after both watch consultants (Claude Fable, agy) agreed on the shape. Their plan is in the background section below and is not locked.

seed decision from Tamdoma/akrogon#148, taken at import on 2026-11-22, not asked, decided by ivanjuras
