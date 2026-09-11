# Intake: status-no-open-leaves

## Scope
`akrogon status` treats a missing `issues/open` as zero leaves and prints a `no open leaves` line for an empty repo. Re-intake of #1: the earlier chart `issues/chart/status-empty-open` was handed off on 2026-09-11, its leaf was parked and then deleted outside akrogon, and the deletion was committed by sync in 13f92e0. The operator chose to re-intake and fix it rather than leave the GitHub issue open.

## Provenance
- GitHub: Tamdoma/akrogon#1
- Operator: chart door 2026-09-11, `14a - But if that is still an issue, we need to resolve that one as well. Not just remove it completely.`
- Prior chart: issues/chart/status-empty-open (handed off, leaf deleted)

## Source: Tamdoma/akrogon#1

# akrogon status crashes with ENOENT when issues/open is missing and prints nothing for an empty repo

Source: Tamdoma/akrogon#1
URL: https://github.com/Tamdoma/akrogon/issues/1

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
`src/status.ts` still scans `issues/open` without a missing-directory case, and the prior decision `missing-open-is-zero` remains valid: zero leaves, name plus indented `no open leaves` line, exit 0.
