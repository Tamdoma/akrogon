# Akrogon

Akrogon runs an issue lifecycle through paired coding agents in Herdr. Skills shape work, plan it, implement it, review it and merge it. The command tracks phases and dispatches the next pass.

## Install

Install Bun, Git, Herdr and the harness CLIs configured in [config.yaml](config.yaml). Make `flock` available for locking and install authenticated GitHub CLI (`gh`) for GitHub intake and issue closure. Keep dependencies in this checkout:

```sh
bun install
bun src/akrogon.ts install
```

Before installation, set the machine's slots, harness commands and registered repositories in `config.yaml` at the tool root, or in the directory selected by `AKROGON_HOME`. Installation reads that configuration, links `akrogon` into `~/.local/bin`, links each skill into `~/.claude/skills` and `~/.agents/skills`, installs each configured Herdr harness integration and links the [plugin](plugin/). Put `~/.local/bin` on `PATH`. Conflicting destinations stop installation and print removal commands for review.

Update with `git pull` in the tool checkout. The installed command and skills use that checkout through symlinks.

## Initialize a repository

Run [init-issues](skills/init-issues/SKILL.md) from the repository root. It inspects the repository and proposes its branch, checks, grounding index and other lifecycle choices. The skill writes a complete proposal to a temporary YAML file, then invokes:

```sh
akrogon init --from /path/to/proposal.yaml
akrogon config
```

Initialization writes `issues/config.yaml`, creates `issues/open` and the lessons scaffold, adds generated-path ignore entries and registers the repository in the machine configuration. Repeat setup preserves existing choices. For repositories without tests, `--toolkit <lang>=<runner>` records a toolkit choice without installing dependencies. `akrogon config` shows the effective machine and repository settings.

The registration key in the machine configuration is persistent repository identity and must match each leaf’s `repo` value. Its registered directory path may change independently while keeping the same key. Changing the repository root or `worktree_root` requires manual reconciliation of existing worktree locations, Git metadata and recorded `state.worktree` paths before dispatch can resume.

This repository's [reference index](REFERENCE.md) links its areas.

## Command

| Invocation | Effect |
| --- | --- |
| `akrogon install` | Link this checkout's command, skills and Herdr integration. |
| `akrogon init --from <proposal.yaml> [--toolkit <lang>=<runner>]` | Initialize or update repository configuration and registration. |
| `akrogon config` | Print effective configuration for the current repository. |
| `akrogon phase <slug> <phase> --slot <A\|B> [--verdict <verdict>]` | Record a lifecycle pass through validated phase transitions. |
| `akrogon next [<slug>\|<path>\|--all]` | Dispatch eligible work for a leaf, path or all registered repositories. With no argument, use the current directory or Herdr hook context. |
| `akrogon pull [--all]` | Import open GitHub issues into seeds for the current repository or all registered repositories. |
| `akrogon status [<slug>]` | Show the registered repository board, or a current-repository leaf's state and recent history. |

## Skills

| Skill | Purpose |
| --- | --- |
| [chart-issues](skills/chart-issues/SKILL.md) | Turn operator notes and imported reports into decisions and leaf contracts. |
| [plan-issue](skills/plan-issue/SKILL.md) | Write an execution plan, with paired discussion when enabled. |
| [implement-issue](skills/implement-issue/SKILL.md) | Implement a plan or repair review findings using the configured worker mode. |
| [check-issue](skills/check-issue/SKILL.md) | Review concrete defects and verify repairs. |
| [merge-issue](skills/merge-issue/SKILL.md) | Rebase reviewed work, run checks and push a fast-forward merge. |
| [seed-issue](skills/seed-issue/SKILL.md) | File one observation as unverified GitHub intake. |
| [broadcast-issue](skills/broadcast-issue/SKILL.md) | Send a factual completed-issue update to configured Discord targets. |
| [init-issues](skills/init-issues/SKILL.md) | Inspect a repository and initialize its lifecycle configuration. |
