# Report an observation

Optional: the [seed-issue](../../skills/seed-issue/SKILL.md) skill files something you saw go wrong as one GitHub issue, marked as unverified intake. Use it when you want a problem written down for later charting, even while its details are incomplete. It never proposes a fix.

[A working day](a-working-day.md) shows where this intake sits in a normal day.

## File the report

In an agent session inside the repository, run the skill with what you saw:

```text
/seed-issue CSV export drops the last row when the list has 500 rows
```

The skill needs an authenticated `gh` and nothing else. It works without `akrogon install`, registration or a leaf.

## What the skill does

1. It reads the files the failure names and follows them one step to their caller. It only reads. It runs no project commands and edits nothing.
2. It picks where to post. That is the `issues_repo` in the repository's root `akrogon.yaml`, or the GitHub `origin` when that file is missing. When the failure names a path that belongs to akrogon itself, the report goes to akrogon's own issue destination. If it cannot settle the destination, it stops and names the path and reason.
3. It searches that repository twice with `gh`: your reports from the last two days, and a short keyword search. If an existing report already covers the same failure, it files nothing and prints that report's URL.
4. Otherwise it creates one issue. The body holds Observation, Location, Reproduction, Expected behavior, Urgency and Suspected cause. Details you did not give read "Not provided". The suspected cause is a hypothesis the evidence supports, or "no supported hypothesis" plus the evidence needed next.

It ends with two lines: `Last operation:` with the issue URL, the found report's URL or the failure, and `Next: none`. When several open reports share one suspected cause, it may also print one `/seed-issue` line you can run to file a root report.

## Bring reports into your checkout

Optional: copy the repository's open GitHub issues into `issues/seeds/` so charting can read them:

```sh
akrogon pull
```

It reads the open issues of the repository's GitHub `origin` and writes one file per issue. It removes seed files whose issue is no longer open. `akrogon sync` never commits `issues/seeds/`. Run `akrogon pull --all` to pull every registered repository from any directory. See [Commands](../reference/commands.md) for the full list.

Next: [Run work](run-work.md)
