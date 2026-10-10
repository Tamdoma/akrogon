# Case 4 — lesson about an akrogon skill, found in a consumer repo

Consumer repo: Tamdoma/tamdoma-framework (registered root /home/ivan/Work/infra/tamdoma/framework; root `akrogon.yaml` contains `issues_repo: Tamdoma/tamdoma-framework`).

New occurrence: during a check.review pass in the framework repo, the seat recorded a lesson whose failure names `skills/check-issue/SKILL.md` — the review seat judged a diff against a plan section that had been superseded by a later implementation note, because the skill's read list does not point at the notes section explicitly. The path `skills/check-issue/SKILL.md` does not exist under the framework repo root but exists under the akrogon checkout.

Environment facts for the decision: `command -v akrogon` resolves to a script inside `/home/ivan/Work/infra/akrogon`, whose git root is `/home/ivan/Work/infra/akrogon`; that repo has no `akrogon.yaml` and its `origin` is `https://github.com/Tamdoma/akrogon.git`. Assume the akrogon root can be resolved.

