# Install

Install Akrogon on the machine where you run Herdr and your coding agents.

## Prerequisites

You need:

- Bun and Git.
- Herdr.
- The harness CLIs named in your machine configuration.
- The flock command for locking.
- An authenticated GitHub CLI for GitHub intake and issue closure.

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

Installation links the command, skills and Herdr plugin. It also installs the configured harness integrations. If a destination conflicts with an existing file, installation stops and prints removal commands for you to review.

The links point back to this checkout, so this checkout is the program you run. Landed work deploys itself: after a merge lands, and on `akrogon next`, `next --all` and `next --resume` runs that select or cover the Akrogon repository, one step fetches the default branch, fast-forwards the checkout when it is strictly behind, runs `bun install --frozen-lockfile` and reconciles the skill links.

The step prints one line: `deployed <old>..<new>` on a fast-forward, `current <sha>` when already up to date, otherwise the failing step, the git or bun error, the lag count and the remedy. A failed step retries at the next trigger; nothing else changes.

You still act when the line reports the checkout is on another branch or detached, ahead of or diverged from the remote (run `akrogon sync`), or blocked by an uncommitted edit that overlaps incoming changes (commit or finish that edit).

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

The machine configuration lives at the Akrogon root, or in the directory selected by AKROGON_HOME:

```text
config.yaml
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
