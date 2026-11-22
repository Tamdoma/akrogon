# Watch consults agents on hard failures (seed decision)

## Question

Tamdoma/akrogon#146, heading line: `## Operator decision (Ivan Juras, 2026-11-20)`

## Findings

- Pull time 2026-11-21T17:11:18Z (`akrogon pull`: 1 open issue pulled).
- `gh api graphql` issue 146: author ivanjuras, lastEditedAt null, userContentEdits totalCount 0.
- `gh api repos/Tamdoma/akrogon/collaborators/ivanjuras/permission --jq .permission`: admin.

## Taken

## Operator decision (Ivan Juras, 2026-11-20)

- `/watch-issues` can start consultant agents when a leaf breaks or fails and the fix is not obvious, and acts on their answer instead of asking the operator.
- The watch asks the operator only for what truly needs the operator.
- Consultants are hc terminals. Questions and answers go both ways over `hc send` (Herdr Core), the way chart-issues talks to its consultants.
- The consultant's harness, model and effort (and the other launch settings) are set in the akrogon state folder (`~/.akrogon/config.yaml`), following the existing `slots:` + `harnesses:` convention, so the operator can change them without editing the skill.

seed decision from Tamdoma/akrogon#146, taken at import on 2026-11-21, not asked, decided by ivanjuras
