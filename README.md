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

Install Bun, Git, Herdr, flock and the harness CLIs listed in the [machine configuration](docs/guide/install.md#global-config-since-youll-stare-at-it-next). GitHub intake and issue closure also need an authenticated GitHub CLI.

From this checkout:

```sh
bun install
bun src/akrogon.ts install
```

Set the machine's seats, harness commands and registered repositories in `~/.akrogon/config.yaml`. AKROGON_HOME can select a different configuration directory. A repository may override either seat in `issues/config.yaml`.

Installation links the command, skills and [plugin](plugin/). It also installs the configured Herdr harness integrations. Conflicting destinations stop installation and print removal commands for review.

The command directory must be on PATH. The installed paths are:

```text
~/.local/bin/akrogon
~/.claude/skills/
~/.agents/skills/
~/.codex/skills/
~/.pi/agent/skills/
```

The links use this checkout. Landed work deploys itself after a merge landing and on `akrogon next`, `next --all` and `next --resume` runs: the step fetches the default branch of every registered checkout the run covers, replays local commits onto the fetched tip and pushes them when they touch only issue records, then moves the checkout with `git reset --keep`. Installing dependencies and reconciling skill links stay on the Akrogon checkout only. It prints one line per checkout and retries failures at the next trigger.

Follow the reported remedy when the checkout is on another branch or detached, ahead with commits touching more than issue records (`akrogon sync`), or blocked by an overlapping edit (commit or finish the edit). See the [install guide](docs/guide/install.md) for details.

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

Every `akrogon next` pass reconciles worktrees, scratch and run roots against leaf state, removing only the registered worktrees it knows are finished — a merged or failed leaf's own worktree, a finished leaf's `<slug>-u<N>` worker copies, and `verify-*`/`batch-*` scratch — while every other registered worktree and every git-locked worktree is kept with its reason, and each removal lands in the repo's reconcile report. The same pass stops the systemd slice of a merged or failed leaf once its tab is gone — ending processes it left running — unless a live run record names the slice or the pass itself runs inside it; a loaded `akrogon-l*` slice matching no leaf record is stopped only when it holds no process, and failed `akrogon-run-*` units are cleared. `verify-*`, `batch-*` and `<slug>-u<N>` copies in the worktree store are scratch, removed with `git worktree remove --force` once the owner is gone (an ended or dead verify run, an absent or dead `batch-<id>.owner` build record, a merged owner leaf) and kept while the owner lives, while a live pane or a surviving process sits inside, or while the pane list is unavailable. Unregistered leftovers — stray files, leaf-named dirs of finished leaves, dead-owner run records — are removed the same way behind the same vetoes. `akrogon leftovers` lists, per repo and grouped by reason, the kept paths that still exist and need a person; a `host` block adds kept units and retired host paths. Paths kept only because their leaf, worker or run is still working, or a live pane sits inside, are left out, since a later pass removes them. `akrogon status <slug>` prints the whole kept report as `Kept:` lines with path and reason.

This repository's [reference index](docs/reference-index.md) links its code areas.

## Command

Run commands from the registered repository unless a command says otherwise. Angle brackets mark values you supply. Square brackets mark optional arguments.

```text
| Invocation | Effect |
| --- | --- |
| `akrogon install` | Link the command, skills, Herdr integration and `akrogon.slice`, then reload the systemd user manager. |
| `akrogon init [--from <proposal.yaml>] [--toolkit <lang>=<runner>]` | Initialize or update repository setup. |
| `akrogon config` | Print effective configuration. |
| `akrogon preflight` | Verify the configured base remote branch and local tracking ref. |
| `akrogon phase <slug> <phase> --slot <A\|B> [--verdict <verdict>] [--reason <text>] [--check] [--attempt <id>]` | Record a pass or declare a failure with its reason. Moves except failed refuse changed old test files and drift from the frozen record written at the `plan.synthesis` to `implement` move (a recorded path changed or gone, or an added test-file-matched path outside the record; a path no branch commit touches needs it on a later trailer-only commit new since the record, not a replayed planning-era trailer) without Test-Change trailers; src/test-files.ts defines the path rule. --check runs the move's guards without recording or moving and prints ok on success. A move into `check.review`, or from `check.repair` into `merge`, needs a green leaf `akrogon verify` receipt for the worktree HEAD, and a merge `merged --check` needs a green merge receipt before it records the tested top. Merge calls carry `--attempt <id>` from the prompt; stale ids are refused, and a merge leaf reaches `merged` only through the command's push. |
| `akrogon next [<slug>\|<path>\|--all\|--resume]` | Dispatch eligible work. |
| `akrogon pull [--all]` | Import open GitHub issues as seeds. With --all, pull every registered repository from any directory. |
| `akrogon close <owner/repo#n> --by <text>` | Close one unowned GitHub issue with a delivered-by note. |
| `akrogon status [<slug>\|--charts]` | Show the board, leaf history or chart store. |
| `akrogon leftovers` | List kept paths and units that need a person, grouped by reason, plus retired host paths under `host`. |
| `akrogon timing [<slug>\|--cohort --since <iso>\|--flow --since <YYYY-MM-DD>]` | Report per-visit time from the timing record, evaluate the 20-leaf cohort gate since a marker, or report leaf-carried issue flow from a handoff date. |
| `akrogon sync` | Commit eligible issue records, rebase and push. |
| `akrogon park <issue>... \| --all` | Set aside whole eligible issues. |
| `akrogon unpark <issue>... \| --all` | Restore whole issues to the open queue. |
| `akrogon pause` | Pause automatic dispatch for the current repository. |
| `akrogon unpause` | Resume automatic dispatch with one pass for the current repository. |
| `akrogon stop <slug> \| --all` | Mark a leaf stopped and stop its systemd slice, ending every process in its panes. With --all, stop every allocated leaf of the current repository. |
| `akrogon stop-run [<run-id>]` | Stop a run the caller's pane scope launched, by the id on the `run` line printed at run start. With no id, list matching runs and stop only when exactly one is live. |
| `akrogon start <slug>` | Clear a leaf's stopped mark and run the targeted next pass for that leaf. |
| `akrogon flaky` | List each verify command and failed test that went red then green on the same tree, with its count and last time, newest first. |
| `akrogon log <path>` | Print a recorded check or verify log's bytes, resolving the path against the current or every registered repo, plain file first then the owner's `evidence.tar.zst`. |
| `akrogon run-check [--name <n>] [--leaf <path>] [--holder <dir>] -- <argv>...` | Register the run, start a command at once under the constructed check environment, and log output into the leaf. |
| `akrogon verify [--sha <rev>] [--attempt <id>] [--holder <dir>]` | Check the commit out fresh in the worktree store, run every configured check for the caller's scope under the constructed environment, log each into the leaf or holder, write one receipt to `issues/verify-runs.jsonl` and remove the checkout. Exits 0 only when every command passed. |
| `akrogon guard <ancestors\|own-modules>` | Refuse when a canonical ancestor holds node_modules or package.json, or a checkout with a package.json at its top is missing its own node_modules. |
| `akrogon pack <folder>...` | Pack a closed owner's or a chart `direct/` folder's `*.log` files into `evidence.tar.zst` under a `.closing` marker, refusing a closed owner whose tracked logs changed or vanished on disk without matching archive bytes; reports packed, tracked, untracked and deleted counts per folder. |
```

A normal starting point for CSV export is:

```sh
cd ~/Work/widgets
akrogon next export-csv
akrogon status export-csv
```

A next sweep with the all option covers the current repository when run inside one and every registered repository outside one. Pull --all pulls every registered repository from any directory. Status without arguments also shows all registered repositories when run outside one.

Parking uses top-level issue names. It refuses allocated work and moves that break open dependencies. Its all option skips ineligible issues. Parked records remain committed project data.

Sync requires the configured default branch in the registered checkout. It refuses unrelated staged files. It selects issue records while excluding these paths:

```text
issues/seeds/
files named .lock
the worktree store when inside the checkout
```

Sync uses the configured integration remote. GitHub intake reads the repository's GitHub origin. Reports filed through seed-issue can use a separate destination in the root configuration:

```text
akrogon.yaml
```

```yaml
issues_repo: owner/repo
```

A report whose named failure path lives under the installed akrogon checkout routes to that checkout's report destination instead, and reports already covering the failure end the run with their URL. That report destination does not redirect pull.

## Skills

| Skill                                              | Purpose                                                      |
| -------------------------------------------------- | ------------------------------------------------------------ |
| [chart-issues](skills/chart-issues/SKILL.md)       | Resolve open decisions and write leaf contracts.             |
| [plan-issue](skills/plan-issue/SKILL.md)           | Plan how to implement a leaf.                                |
| [implement-issue](skills/implement-issue/SKILL.md) | Build the plan or repair review findings.                    |
| [check-issue](skills/check-issue/SKILL.md)         | Review defects and verify repairs.                           |
| [merge-issue](skills/merge-issue/SKILL.md)         | Rebase, check and land the merge leaf.                       |
| [seed-issue](skills/seed-issue/SKILL.md)           | File an observation for investigation.                       |
| [broadcast-issue](skills/broadcast-issue/SKILL.md) | Send a completed-issue-or-epic update to Discord.            |
| [init-akrogon](skills/init-akrogon/SKILL.md)       | Inspect a repository and set up its lifecycle.               |
| [watch-issues](skills/watch-issues/SKILL.md)       | Watch open leaves on an optional 20-minute Claude Code cron. |
| [learn-issues](skills/learn-issues/SKILL.md)       | Remove guarded lessons and seed checkable ones.              |
