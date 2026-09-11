# Intake: status-empty-open

## Scope
One issue, one leaf, in src/status.ts and tests/status.test.ts.

## Provenance
- GitHub: Tamdoma/akrogon#1

## Source: Tamdoma/akrogon#1

Unverified intake.

## Observation
`akrogon status` crashes with ENOENT when `issues/open` is missing, which happens after the last issue is closed. For an empty registered repo, the command prints only the repo name and nothing else.

## Location
Project: akrogon. Surface: `akrogon status` CLI command, registered repo status output.

## Reproduction
Reported, frequency not provided:
1. Close the last open issue in a registered repo so `issues/open` no longer exists.
2. Run `akrogon status`.
Also reported: run `akrogon status` against a registered repo with no open leaves.

## Expected behavior
A missing `issues/open` directory reads as zero leaves instead of crashing. An empty registered repo reports that it has no open leaves rather than printing only its name.

## Urgency
Not provided.
## Agent findings
- src/status.ts scanRepo walks resolve(repo.root, "issues/open") with readdirSync. A missing folder throws ENOENT, which the catch turns into a `{"unreadable":...}` line and exit code 1. It is a caught error, not a stack trace, but the effect matches the report: status fails for a healthy repo whose last issue closed.
- With issues/open present but empty (live state today), status prints only `akrogon`.
- readLog already treats a missing log.jsonl as empty, so the same pattern fits issues/open.
