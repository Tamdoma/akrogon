# Seats never wait on a human approval (seed decision)

## Question

Tamdoma/akrogon#161: `## Operator decision (Ivan Juras, 2026-11-25)`

## Findings

- Pull time: 2026-11-25T22:37:16Z (captured immediately before `akrogon pull`).
- `gh api graphql -f query='query{repository(owner:"Tamdoma",name:"akrogon"){issue(number:161){author{login} lastEditedAt userContentEdits(first:50){totalCount nodes{editor{login} editedAt}}}}}'` → author `ivanjuras`, `lastEditedAt` null, `totalCount` 0.
- `gh api repos/Tamdoma/akrogon/collaborators/ivanjuras/permission --jq .permission` → `admin`.
- Caller identity: `ivanjuras` (admin), so the permission read is proven for this caller.

## Taken

## Operator decision (Ivan Juras, 2026-11-25)

- Seats must never depend on a human approving a command. Autopilot means no manual approvals, ever.
- The fix is valid across all harnesses — pi, codex and agy as well as claude code — not a claude-only patch.
- Achieve it without complicating the system or increasing complexity.

seed decision from Tamdoma/akrogon#161, taken at import on 2026-11-25, not asked, decided by ivanjuras
