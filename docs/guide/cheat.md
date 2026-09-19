# Cheat sheet

Use these commands from the directory named above each block. Replace the example slug when working on another leaf.

Install from the Akrogon checkout:

```sh
bun install
bun src/akrogon.ts install
```

Set up a repository from an agent opened at its root:

```text
/init-issues
```

Check the example repository:

```sh
cd ~/Work/widgets
akrogon config
akrogon status
```

Create or investigate work in your agent session:

```text
/seed-issue Describe the observation and evidence
/chart-issues Add CSV export to widgets
```

Import reports and save eligible issue records:

```sh
akrogon pull
akrogon sync
```

Dispatch one leaf, a folder, or the current repository:

```sh
akrogon next export-csv
akrogon next issues/open/export-csv
akrogon next --all
```

Inspect the leaf:

```sh
akrogon status export-csv
akrogon status --charts
tail issues/log.jsonl
```

Report completed implementation as B:

```sh
akrogon phase export-csv check.review --slot B
```

Report A's review verdict:

```sh
akrogon phase export-csv merge --slot A --verdict nits
```

Record a blocker, then recover only after it is resolved:

```sh
akrogon phase export-csv failed --reason "Required permission is missing" --slot B
akrogon phase export-csv implement
akrogon next export-csv
```

Park and restore a whole unallocated issue:

```sh
akrogon park export-csv
akrogon unpark export-csv
```

Start or stop the optional watcher in Claude Code only:

```text
/watch-issues
/watch-issues stop
```

Common paths, using the default worktree root:

```text
~/Work/widgets/issues/config.yaml
~/Work/widgets/issues/open/export-csv/export-csv/brief.md
~/Work/widgets/issues/open/export-csv/export-csv/state.yaml
~/Work/widgets/issues/worktrees/export-csv/
~/.config/akrogon/env
```

Remember: capacity counts leaves across repositories. Failed can resume at any active phase. Sync selects eligible issue records. Gacp commits the entire staged index.

## Pick the skill by the result you need

| Need | Skill | What you get |
| --- | --- | --- |
| Set up a project | init-issues | Inspected settings, checks and grounding. |
| Capture a problem | seed-issue | One unverified GitHub report. |
| Decide what to build | chart-issues | Researched choices and leaf contracts. |
| Plan the change | plan-issue | File-level steps and verification. |
| Build or repair it | implement-issue | Code, checks and an implementation report. |
| Check the result | check-issue | Evidence-backed verdicts. |
| Land reviewed work | merge-issue | Checked code pushed to the default branch. |
| Announce completion | broadcast-issue | A factual issue update. |
| Check while away | watch-issues | Optional Claude Code cron inspection. |

Invoke setup, intake, charting and watching when you need them. Dispatch selects the execution skills from the leaf's phase. You do not need to run every skill by hand.

Previous: [Learn](learn.md) · Next: [README](../../README.md) · [Home](../../README.md)
