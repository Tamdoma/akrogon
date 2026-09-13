# Does pull keep reading issues from origin?

## Question
Should intake follow the configured `remote` or a root `akrogon.yaml`?

### Carries
`tests/pull.test.ts:167` locks origin intake. seed-issue reads root `akrogon.yaml` `issues_repo` for outbound reports.

## Findings
(both) origin-only is deliberate; docs gap. Operator raised the Ripple framework: consumer projects file reports to the framework repo. That path already exists: seed-issue posts to `issues_repo`, and the framework repo pulls from its own origin, which is that same GitHub repo.

## Taken
Operator 2026-09-11: `13a` after explanation. Keep origin intake. README states that intake reads the repo's GitHub origin, `remote` is where code integrates, and a consumer project routes reports with a root `akrogon.yaml` `issues_repo`. Foreclosed: switching intake to `remote`.
