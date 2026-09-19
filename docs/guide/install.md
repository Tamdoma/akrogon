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

The links point back to this checkout. Update it with:

```sh
git pull
```

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

The current checked-in seats both use pi with the devin/swe-2-max model. A and B are roles, not fixed model names.

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
