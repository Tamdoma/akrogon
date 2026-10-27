# Install

Install Akrogon on the machine where you run Herdr and your coding agents. This page covers what the machine needs, a quick check that skips the rest when it is ready, and the install itself.

> **What you need**
>
> - A Linux desktop with a running systemd user manager (`systemctl --user`).
> - Bun.
> - Git.
> - flock, from util-linux.
> - Herdr.
> - One agent CLI: Claude Code, Codex or pi.
> - An authenticated GitHub CLI (`gh`), only if you bring in or close GitHub issues.

![Machine parts: the akrogon command reads the machine config.yaml in ~/.akrogon, which lists repos, slots and harnesses, and reads each registered repo's issues/config.yaml. It starts seats inside one systemd user slice per leaf, under akrogon.slice, where Herdr pane A and Herdr pane B each run an agent CLI started from that seat's harness template.](../pictures/machine-parts.svg)

## Check your machine

Run these commands. The comment after each one says what a ready machine prints.

```sh
systemctl --user is-system-running   # running or degraded
bun --version                        # a version number, such as 1.x.y
git --version                        # git version <number>
flock --version                      # flock from util-linux <number>
herdr --version                      # herdr <number>
claude --version                     # or codex --version, or pi --version: a version number
gh auth status                       # Logged in to github.com account <you>
akrogon config                       # only if Akrogon is already installed: your settings as YAML
```

`degraded` means a user service failed, but the user manager runs, which is enough. Any other answer, or an error, means there is no running user manager.

When Akrogon is already installed, `akrogon config` prints your machine settings and ends with `repo: none` when you run it outside a registered project. When every line gives the expected result, skip to [Set up a project](set-up-a-project.md).

## Write the machine config

Akrogon reads `~/.akrogon/config.yaml`. Write it before you install, because install reads it to know which agent CLIs to connect to Herdr.

A minimal file:

```yaml
slots:
  a: { harness: claude, model: <model>, effort: <effort> }
  b: { harness: claude, model: <model>, effort: <effort> }
harnesses:
  claude: claude --model {model} --effort {effort} <other flags>
repos: {}
```

- `slots` sets seat A and seat B. Each seat names a harness, a model and an effort.
- `harnesses` maps a harness name to the command that starts that agent CLI. Akrogon fills `{model}` and `{effort}` from the seat. The command starts with the harness name. Every harness a seat names needs an entry here. Seats run unattended, so add the flags your CLI needs to run without stopping for approval.
- `repos` lists registered projects. Leave it empty. Setting up a project adds it.

The two seats can use the same harness, or different ones, for example `codex` for seat B with its own entry under `harnesses`. Every key is described in [config.md](../reference/config.md).

To keep this folder somewhere else, set `AKROGON_HOME` to that folder. Akrogon then reads `config.yaml` there.

## Install from a checkout

From your Akrogon checkout, for example `~/code/akrogon`, run:

```sh
bun install --backend=copyfile
bun src/akrogon.ts install
```

Install creates these links:

- `~/.local/bin/akrogon`, the command.
- Each skill folder into `~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills` and `~/.pi/agent/skills`, so every supported agent CLI finds the same skills.
- `~/.config/systemd/user/akrogon.slice`, the systemd slice that holds everything Akrogon runs. Install then reloads the systemd user manager.
- The Herdr plugin, which tells Akrogon when a seat finishes, so it can prompt the next one.

It also runs `herdr integration install` for each harness in your config. On a fresh install, the links go through `~/.akrogon/current`, which points at your checkout.

If a destination already exists and is not an Akrogon link, install stops and prints one `rm` command per conflicting path. Read them, remove what you no longer need, and run install again.

## Put the command on PATH

The command lives in `~/.local/bin`. If your shell cannot find `akrogon`, add this line to your shell profile and open a new terminal:

```sh
export PATH="$HOME/.local/bin:$PATH"
```

Then `akrogon config` prints your settings.

## Updates and rollback

When your Akrogon checkout is itself registered as the project `akrogon`, Akrogon builds a release from each merged change and runs from that release instead of the checkout. How releases are built and switched is in [Releases and updates](../reference/releases-and-updates.md). To go back to the previous release, see [Roll back a release](../use/roll-back-a-release.md).

Next: [Set up a project](set-up-a-project.md)
