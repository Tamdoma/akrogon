# Akrogon

Akrogon is a lightweight software factory for people who already use coding agents. It runs defined work through planning, implementation, review and merge using two configurable agent seats in Herdr.

You decide what to build and when to start it. Akrogon tracks the phases and sends the next prompt. You handle product decisions and blockers that need human action. Deployment is separate.

The guide follows one example: adding CSV export to a project here:

```text
~/Work/widgets
```

## How the pieces fit

Start with init-akrogon to give agents the project's settings, checks and code map. Capture observations with seed-issue. Use chart-issues to investigate choices and write contracts.

Then release a leaf. The execution skills plan, build, review, repair and merge it. Files record the work between passes. Herdr holds the seats and triggers dispatch events.

```text
YOU + CHARTING             EXECUTION SEATS
+------------------+       +---------------------+
| Request          |       | Plan -> Implement   |
| Research         |       |           |         |
| Decisions        |       |           v         |
| Leaf contracts   |------>| Review <-> Fix      |
+------------------+       |           |         |
        handoff            |           v         |
   then manual dispatch    | Merge -> Update*    |
                           +---------------------+
* Completion update when configured
```

For export-csv, you settle the rows and columns before dispatch. The seats build, check and merge that contract.

You control the queue through dispatch, parking and dependencies. Failure records show what stopped. Sync saves issue records. An optional Claude Code watch checks progress while you are away.

## Guide

1. [The idea](docs/guide/idea.md)
2. [Parts](docs/guide/parts.md)
3. [State](docs/guide/state.md)
4. [Install](docs/guide/install.md)
5. [Setup](docs/guide/setup.md)
6. [Create](docs/guide/create.md)
7. [Chart](docs/guide/chart.md)
8. [Next](docs/guide/next.md)
9. [Phases](docs/guide/phases.md)
10. [Files](docs/guide/files.md)
11. [gacp](docs/guide/gacp.md)
12. [Merge](docs/guide/merge.md)
13. [In practice](docs/guide/in-practice.md)
14. [Limits](docs/guide/limits.md)
15. [Problems](docs/guide/problems.md)
16. [Learn](docs/guide/learn.md)
17. [Cheat sheet](docs/guide/cheat.md)

## Install

Install Bun, Git, Herdr, flock and the harness CLIs listed in [config.yaml](config.yaml). GitHub intake and issue closure also need an authenticated GitHub CLI.

From this checkout:

```sh
bun install
bun src/akrogon.ts install
```

Set the machine's seats, harness commands and registered repositories in the tool-root configuration. AKROGON_HOME can select a different configuration directory. A repository may override either seat in `issues/config.yaml`.

Installation links the command, skills and [plugin](plugin/). It also installs the configured Herdr harness integrations. Conflicting destinations stop installation and print removal commands for review.

The command directory must be on PATH. The installed paths are:

```text
~/.local/bin/akrogon
~/.claude/skills/
~/.agents/skills/
~/.codex/skills/
~/.pi/agent/skills/
```

The links use this checkout. Update it with:

```sh
git pull
```

## Initialize a repository

Run [init-akrogon](skills/init-akrogon/SKILL.md) from the project root. It inspects the project and proposes its branch, checks and grounding documents.

The skill writes a YAML proposal, then runs:

```sh
akrogon init --from /path/to/proposal.yaml
akrogon config
```

Initialization writes repository configuration, creates issue and lesson scaffolds, adds ignore entries and registers the repository. Repeating setup preserves existing choices unless you change them. Init refuses a declared index that is not a readable non-empty file. A fresh repo needs an index or an explicit `grounding: none`.

For a repository without tests, you can record a toolkit choice:

```sh
akrogon init --toolkit typescript="bun test"
```

That records the runner. It does not install dependencies.

The registration key identifies the repository. If the key is widgets, each leaf uses:

```yaml
slug: export-csv
created: '2026-09-19'
repo: widgets
phase: plan.synthesis
debate: 'no'
blocked-by: []
sources: []
```

Moving a repository or changing its worktree root requires reconciling existing worktree paths and Git metadata. A configuration edit does not move them.

This repository's [reference index](docs/reference-index.md) links its code areas.

## Command

Run commands from the registered repository unless a command says otherwise. Angle brackets mark values you supply. Square brackets mark optional arguments.

```text
| Invocation | Effect |
| --- | --- |
| `akrogon install` | Link the command, skills and Herdr integration. |
| `akrogon init [--from <proposal.yaml>] [--toolkit <lang>=<runner>]` | Initialize or update repository setup. |
| `akrogon config` | Print effective configuration. |
| `akrogon phase <slug> <phase> --slot <A\|B> [--verdict <verdict>] [--reason <text>]` | Record a pass or declare a failure with its reason. |
| `akrogon next [<slug>\|<path>\|--all]` | Dispatch eligible work. |
| `akrogon pull [--all]` | Import open GitHub issues as seeds. |
| `akrogon close <owner/repo#n> --by <text>` | Close one unowned GitHub issue with a delivered-by note. |
| `akrogon status [<slug>\|--charts]` | Show the board, leaf history or chart store. |
| `akrogon sync` | Commit eligible issue records, rebase and push. |
| `akrogon park <issue>... \| --all` | Set aside whole eligible issues. |
| `akrogon unpark <issue>... \| --all` | Restore whole issues to the open queue. |
```

A normal starting point for CSV export is:

```sh
cd ~/Work/widgets
akrogon next export-csv
akrogon status export-csv
```

A sweep with the all option covers the current repository when run inside one. Outside a registered repository, it covers every registered repository. Pull has the same all-repositories option. Status without arguments also shows all registered repositories when run outside one.

Parking uses top-level issue names. It refuses allocated work and moves that break open dependencies. Its all option skips ineligible issues. Parked records remain committed project data.

Sync requires the configured default branch in the registered checkout. It refuses unrelated staged files. It selects issue records while excluding these paths:

```text
issues/seeds/
files named .lock
the configured worktree_root
```

Sync uses the configured integration remote. GitHub intake reads the repository's GitHub origin. Reports filed through seed-issue can use a separate destination in the root configuration:

```text
akrogon.yaml
```

```yaml
issues_repo: owner/repo
```

That report destination does not redirect pull.

## Skills

| Skill | Purpose |
| --- | --- |
| [chart-issues](skills/chart-issues/SKILL.md) | Resolve open decisions and write leaf contracts. |
| [plan-issue](skills/plan-issue/SKILL.md) | Plan how to implement a leaf. |
| [implement-issue](skills/implement-issue/SKILL.md) | Build the plan or repair review findings. |
| [check-issue](skills/check-issue/SKILL.md) | Review defects and verify repairs. |
| [merge-issue](skills/merge-issue/SKILL.md) | Rebase, check and push reviewed work. |
| [seed-issue](skills/seed-issue/SKILL.md) | File an observation for investigation. |
| [broadcast-issue](skills/broadcast-issue/SKILL.md) | Send a completed-issue update to Discord. |
| [init-akrogon](skills/init-akrogon/SKILL.md) | Inspect a repository and set up its lifecycle. |
| [watch-issues](skills/watch-issues/SKILL.md) | Watch open leaves on an optional 20-minute Claude Code cron. |
