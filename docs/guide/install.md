# Install

Install Akrogon on the machine where you run Herdr and your coding agents.

## Prerequisites

You need:

- Bun and Git.
- Herdr.
- The harness CLIs named in your machine configuration.
- The flock command for locking.
- An authenticated GitHub CLI for GitHub intake and issue closure.
- A systemd user manager (`systemctl --user`).

Check that the commands are available:

```sh
bun --version
git --version
herdr --help
flock --version
gh auth status
```

## The command

From the Akrogon checkout, install dependencies and create the links:

```sh
bun install
bun src/akrogon.ts install
```

Installation links the command, skills and Herdr plugin, links `systemd/akrogon.slice` to `~/.config/systemd/user/akrogon.slice` and runs `systemctl --user daemon-reload`. The slice caps everything akrogon runs: CPUWeight=20, MemoryHigh=64G, MemoryMax=96G and no swap. It also installs the configured harness integrations. If a destination conflicts with an existing file, installation stops and prints removal commands for you to review.

The links point back to this checkout, so this checkout is the program you run. Landed work deploys itself: after a merge lands, and on `akrogon next`, `next --all` and `next --resume` runs, one step updates every registered checkout the run covers. It fetches the default branch and, when every commit not yet on the remote touches only issue records, replays those commits onto the fetched tip in a temporary worktree and pushes them, then moves the checkout with `git reset --keep`, which keeps uncommitted edits. Nothing is staged and nothing is stashed. On the Akrogon checkout it also runs `bun install --frozen-lockfile` and reconciles the skill links and the slice link, then reloads the systemd user manager.

When this containment first ships, close every running leaf tab once. The next `akrogon next` recreates them boxed.

The step prints one line per checkout: `deployed <old>..<new>` when the checkout moved, `pushed <n> record commit(s)` when replayed commits went to the remote, `checkout pending` with the dirty path when an incoming change touches an uncommitted edit, `record conflict: <paths>; run akrogon sync` when a record changed on both sides, `current <sha>` when already up to date, or the failing step, the git or bun error, the lag count and the remedy. `checkout pending` keeps the local commits and the edit; finishing the edit lets the next trigger move. A refused or failed step retries at the next trigger; nothing else changes.

You still act when the line reports the checkout is on another branch or detached, holds a local commit that touches more than the issue records (run `akrogon sync`), or is blocked by an uncommitted edit that overlaps incoming changes (commit or finish that edit). Incoming active coordination lock paths and ignored operator paths colliding with the incoming tree refuse the move with the `akrogon sync` refusal wording.

Make sure your shell can find the command directory:

```text
~/.local/bin
```

Skills are linked into these roots:

```text
~/.claude/skills
~/.agents/skills
~/.codex/skills
~/.pi/agent/skills
```

A linked skill still needs the tools it was written for. In particular, watch-issues runs only in Claude Code.

## Global config, since you'll stare at it next

The machine configuration lives at `~/.akrogon/config.yaml`, or in the directory selected by AKROGON_HOME:

```text
~/.akrogon/config.yaml
```

It defines the harness commands, the two seats, registered repositories and a global capacity limit.

A and B are roles, not fixed model names. Check `config.yaml` for the current seats.

For the examples in this guide, register the project under the name widgets:

```yaml
repos:
  widgets: ~/Work/widgets
```

The max_active setting limits new leaf allocations across registered repositories. It does not count individual seats or stop work already running. The value must be a positive integer.

## What installation gives you

You get one command for the lifecycle and the same skill files in the supported harness roots. Each seat can use the configured harness without changing the leaf contract.

The plugin connects Herdr events to dispatch. You still choose when to release new work. Installation does not turn every open request into a running agent.

Previous: [State](state.md) · Next: [Setup](setup.md) · [Home](../../README.md)
