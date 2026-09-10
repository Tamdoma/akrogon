# Brief: seed-issue

Chart skill version: 4

## What

Rewrite `skills/seed-issue` so a colleague's agent files one report as a GitHub issue with `gh issue create -R <repo>`: the target is `issues_repo` from `akrogon.yaml` at the consumer repo root when that file exists (a file that exists without a valid `owner/repo` value is malformed and stops the skill), else the current repo's GitHub origin; a missing origin or non-GitHub origin stops the skill with the reason, and the skill never asks where to post. The routing file is the framework repo's to write, outside this epic; this skill only reads it, on every harness, and does not read any harness folder. The report is unverified intake with a title line and sections observation, location, reproduction, expected behavior, urgency, no diagnosis. The file-writer mode, the FIXER submission script and every reference to consult-issue, consolidate-issues, create-issue, sync-payload and issues/.scripts are removed. The skill depends on `gh` alone and works without `akrogon install`; it runs outside any leaf, so it ends with `Next: none` and never calls `akrogon phase`.

## Why

Reports must reach the queue where colleagues' agents already are, and the target must be fixed by files, never judged (# GitHub Intake, handoff 5-A).

## Done-criteria

1. The skill under the cap names `akrogon.yaml` and `issues_repo` as the routing file and key, the origin as the fallback, says every harness reads it, names `gh` as its only dependency, and says it works without `akrogon install`.
2. On a temp repo with the routing file the `-R` value equals `issues_repo`; without it, the origin; with a file lacking a valid value, a missing origin or a non-GitHub origin the skill stops with the reason (checker follows the text on a temp repo with gh substituted, no real issue posted).
3. The report shape has title, observation, location, reproduction, expected behavior, urgency and no diagnosis; no file mode, no FIXER text, no reference to retired skills or scripts.
4. The skill ends with `Next: none` and never names `akrogon phase` or `akrogon next`.
