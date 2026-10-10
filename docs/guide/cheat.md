# Cheat sheet

Use these commands from the directory named above each block. Replace the example slug when working on another leaf.

Install from the Akrogon checkout:

```sh
bun install
bun src/akrogon.ts install
```

Set up a repository from an agent opened at its root:

```text
/init-akrogon
```

Init refuses a declared index that is not a readable non-empty file. A fresh repo needs an index or an explicit `grounding: none`.

Check the example repository:

```sh
cd ~/Work/widgets
akrogon config
akrogon status
```

Override a machine seat for this repo in `issues/config.yaml`; it applies at the next agent start:

```yaml
slots:
  b:
    harness: codex
    model: gpt-5
    effort: high
```

The same block in `ISSUE.md` or `EPIC.md` front matter overrides a seat for that issue or epic, again at the next agent start:

```markdown
---
slots:
  b:
    harness: codex
    model: gpt-5
    effort: high
---
# Issue: my-issue
```

Seats are `a` or `b` with a full {harness, model, effort}. The nearest set seat wins: issue `ISSUE.md`, then epic `EPIC.md`, then repo `issues/config.yaml`, then machine `config.yaml`.

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

Report completed implementation as A:

```sh
akrogon phase export-csv check.review --slot A
```

Report B's review verdict:

```sh
akrogon phase export-csv merge --slot B --verdict nits
```

Record a blocker, then recover only after it is resolved:

```sh
akrogon phase export-csv failed --reason "Required permission is missing" --slot A
akrogon phase export-csv implement
akrogon next export-csv
```

Park and restore a whole unallocated issue:

```sh
akrogon park export-csv
akrogon unpark export-csv
```

Pause automatic dispatch for the current repository, then resume with one pass; a base-red merge run holds the repo instead, and `akrogon unhold` clears the hold:

```sh
akrogon pause
akrogon unpause
akrogon unhold
```

Start or stop the optional watcher in Claude Code only:

```text
/watch-issues
/watch-issues stop
```

Common paths, using the default worktree store:

```text
~/Work/widgets/issues/config.yaml
~/Work/widgets/issues/open/export-csv/export-csv/brief.md
~/Work/widgets/issues/open/export-csv/export-csv/state.yaml
~/.akrogon/worktrees/widgets/export-csv/
~/.config/akrogon/env
```

Remember: capacity counts leaves across repositories. Failed can resume at any active phase. Sync selects eligible issue records. Gacp commits the entire staged index.

## Pick the skill by the result you need

| Need | Skill | What you get |
| --- | --- | --- |
| Set up a project | init-akrogon | Inspected settings, checks and grounding. |
| Capture a problem | seed-issue | One unverified GitHub report, new or already covering it. |
| Decide what to build | chart-issues | Researched choices and leaf contracts. |
| Plan the change | plan-issue | File-level steps and verification. |
| Build or repair it | implement-issue | Code, checks and an implementation report. |
| Check the result | check-issue | Evidence-backed verdicts. Repairs most findings (B). |
| Land reviewed work | merge-issue | Checked code pushed to the default branch. |
| Announce completion | broadcast-issue | A factual update for a completed issue or epic. |
| Check while away | watch-issues | Optional Claude Code cron inspection. |
| Triage the lesson backlog | learn-issues | Guarded lines removed, seed lines for checkable ones. |

Invoke setup, intake, charting, watching and lesson triage when you need them. Dispatch selects the execution skills from the leaf's phase. You do not need to run every skill by hand.

Previous: [Learn](learn.md) · Next: [README](../../README.md) · [Home](../../README.md)
