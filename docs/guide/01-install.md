# Install Akrogon

**You install Akrogon once per machine, not once per project.** One install serves every registered repository on that machine.

Install Akrogon on the Linux desktop where you run Herdr (`herdr-core` and `herdr-app`) and your coding agent CLI. This page checks that your machine is ready, walks through every install step in order, and shows how to add extra agent CLIs later.

## Check your machine

Before installing, run these checks in a terminal. Each row shows the command and what a ready machine prints.

| Prerequisite | Check command | What a ready machine prints |
| --- | --- | --- |
| Linux desktop with a `systemd` user manager (Linux's per-user background service manager) | `systemctl --user is-system-running` | `running` or `degraded` |
| Bun (the JavaScript and TypeScript runtime Akrogon runs on) | `bun --version` | A version number, such as `1.4.5` |
| Git | `git --version` | `git version` followed by a version number |
| `flock` (file-locking tool from `util-linux`) | `flock --version` | `flock from util-linux` followed by a version number |
| `herdr-core` (`hc`, Herdr's background terminal controller) | `hc --version` | `hc` followed by a version number |
| `herdr-app` (the Herdr terminal workspace window) | `herdr-app --version` | `herdr-app` followed by a version number |
| One coding agent CLI (`claude`, `codex`, `agy`, or `pi`; the starter config below uses `claude`) | `claude --version` | A version number (or check `codex --version`, `agy --version`, or `pi --version`) |
| Optional: GitHub CLI (`gh`), only if you mirror or close GitHub issues | `gh auth status` | `Logged in to github.com account ...` |

For `systemctl --user is-system-running`, `degraded` means an unrelated user service failed while the user manager itself is running, which is enough for Akrogon. Any other output or an error means no `systemd` user manager is running.

If Akrogon is already installed on this machine, run `akrogon config`. Outside a registered repository, it prints your active machine settings as YAML ending with `repo: none`. When every check above matches, skip straight to [Set up a repo](02-set-up-a-repo.md).

## Install step by step

Run these steps in order from a fresh machine.

### 1. Clone Akrogon

```sh
git clone https://github.com/Tamdoma/akrogon.git ~/code/akrogon
cd ~/code/akrogon
```

Expected result: Git downloads Akrogon into `~/code/akrogon` (creating `src/`, `skills/`, `systemd/`, and `docs/`) and moves your shell into that folder.

### 2. Write `~/.akrogon/config.yaml`

Write your machine config before running the installer, because `install` validates `~/.akrogon/config.yaml` first and stops if the file is missing or invalid. (To store Akrogon's home folder somewhere else, set the `AKROGON_HOME` environment variable to that folder.)

Create the folder:

```sh
mkdir -p ~/.akrogon
```

Then save this complete starter `~/.akrogon/config.yaml`. It works as written with a single agent CLI (`claude`), with no placeholders to fill in:

```yaml
max_active: 3
slots:
  a: { harness: claude, model: claude-opus-5-5, effort: high }
  b: { harness: claude, model: claude-opus-5-5, effort: high }
  consultant: { harness: claude, model: claude-opus-5-5, effort: high }
harnesses:
  claude: "claude --model {model} --effort {effort} --settings '{\"env\":{\"CLAUDE_CODE_SUBAGENT_MODEL\":\"{model}\",\"CLAUDE_CODE_SUBAGENT_MODEL_FORCE\":\"1\"}}' --dangerously-skip-permissions"
repos: {}
prefixes: {}
```

Expected result: `~/.akrogon/config.yaml` exists on disk.

What each key sets:

- **`max_active`**: maximum number of tasks (leaves) that may run at once across every registered repository on this machine (positive whole number; defaults to `3`).
- **`slots`**: default agent recipes for **slot A** (the builder), **slot B** (the reviewer), and **`consultant`** (the helper agent a background watcher starts on its own when a task fails while you are away). All three are required; every `akrogon` command refuses a file missing one. Pick a `consultant` model you trust to act unattended, and change `model` or `effort` to match what your CLI supports.
- **`harnesses`**: maps each **harness** (agent CLI name) to the command that launches it unattended. Akrogon fills `{model}` and `{effort}` from the slot, and the command must begin with the harness name. For `claude`, Akrogon also merges `permissions.denyInsteadOfPrompting: true` into the `--settings` JSON object and appends `--disallowedTools=AskUserQuestion` at launch so seats never freeze on an interactive prompt.
- **`repos`**: registered repositories on this machine. Leave it empty (`{}`); setting up a repository adds entries here.
- **`prefixes`**: unique two-letter lowercase prefix per registered repository, used to name agent terminals in Herdr. Leave it empty (`{}`); you add each repository's prefix when you set it up.

### 3. Install dependencies and run the installer

From `~/code/akrogon`, run:

```sh
bun install --frozen-lockfile --backend=copyfile
bun src/akrogon.ts install
```

Expected result: `bun install` installs Akrogon's packages cleanly without changing `bun.lock`, and `bun src/akrogon.ts install` exits `0` after creating these links and services:

- **`~/.akrogon/current`**: a symlink (file shortcut) pointing to your checkout on a fresh install. All other links go through `current`.
- **`~/.local/bin/akrogon`**: the `akrogon` command, linking to `~/.akrogon/current/src/akrogon.ts`.
- **Skill folders**: every skill under `skills/` linked into `~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.pi/agent/skills`, and `~/.gemini/config/skills`, so every supported agent CLI sees the same Akrogon skills.
- **Systemd user units under `~/.config/systemd/user/`**:
  - `akrogon.slice`: holds Akrogon's seats and checks (`CPUWeight=20`, slows processes at `MemoryHigh=50%`, caps them at `MemoryMax=75%` with `MemorySwapMax=0`) so your desktop keeps its memory.
  - `akrogon-land.slice`: runs merge-time checks with higher CPU weight (`CPUWeight=1000`).
  - `akrogon-listener.service`: background user service running `~/.local/bin/akrogon listen`, which follows `hc` events from seats and triggers the next pass without you.

Install then runs `systemctl --user daemon-reload`, enables and restarts `akrogon-listener.service`, and removes stale Akrogon links (including retired links under `~/.config/herdr-app/mods`).

If a destination path already exists and is not an Akrogon link, `install` stops before changing links and prints one `rm -r -- <path>` line per conflict. Review those paths, remove what you no longer need, and run `bun src/akrogon.ts install` again.

### 4. Put `~/.local/bin` on your `PATH`

`PATH` is the list of folders your shell searches for commands. If your shell does not already include `~/.local/bin`, add this line to your shell profile (such as `~/.bashrc` or `~/.zshrc`) and open a new terminal:

```sh
export PATH="$HOME/.local/bin:$PATH"
```

Check that your shell finds the command:

```sh
command -v akrogon
```

Expected result: prints `~/.local/bin/akrogon` expanded with your home directory (for example `/home/alex/.local/bin/akrogon`).

### 5. Verify with `akrogon config`

From your home folder (outside any registered repository), run:

```sh
akrogon config
```

Expected result: prints your active settings as YAML, showing your machine `max_active`, `slots`, `harnesses`, empty `repos` and `prefixes`, default repo keys, and `repo: none` at the end:

```text
max_active: 3
slots:
  a:
    harness: claude
    model: claude-opus-5-5
    effort: high
  b:
    harness: claude
    model: claude-opus-5-5
    effort: high
  consultant:
    harness: claude
    model: claude-opus-5-5
    effort: high
harnesses:
  claude: ...
repos: {}
prefixes: {}
...
repo: none
```

You can also confirm the background listener is running with `systemctl --user is-active akrogon-listener.service`, which prints `active`.

## Optional: add more agent CLIs

You can run Akrogon with a single CLI or mix different CLIs across `a`, `b`, and `consultant` (for example, building with one CLI and reviewing with another). To enable `codex`, `agy`, and `pi` alongside `claude`, add their launch lines under `harnesses:` in `~/.akrogon/config.yaml`:

```yaml
harnesses:
  codex: "codex --no-daemon -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access"
  agy: "agy --model {model} --effort {effort} --mode auto"
  pi: "pi --model {model} --thinking {effort} -a --exclude-tools request_user_input"
```

Keep `claude:` under `harnesses:` if any slot still uses `claude`. Every harness referenced by `slots` (in `~/.akrogon/config.yaml`, a repository's `issues/config.yaml`, or an issue's front matter) must have a matching entry here. For `pi`, Akrogon automatically appends a fresh `--session-id` at launch; for `agy`, Akrogon handles the startup trust prompt once the terminal opens.

For every key `~/.akrogon/config.yaml` accepts, see [Settings](../reference/config.md).

## Updates and rollback

If you also register your Akrogon checkout as the repository `akrogon`, Akrogon builds a release under `~/.akrogon/releases/<commit>` from each merged update and switches `~/.akrogon/current` to that release automatically instead of running directly from your checkout. See [Releases and updates](../reference/releases-and-updates.md) for how deploys work, and [Roll back a release](../reference/roll-back-a-release.md) if an update ever breaks `akrogon`.

Previous: [Docs home](../README.md) · Next: [Set up a repo](02-set-up-a-repo.md)
