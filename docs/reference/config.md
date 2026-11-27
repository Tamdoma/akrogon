# Settings

Akrogon reads its settings from three places. This page says what each place holds and which one wins when two of them set the same seat. The rules live in [src/config.ts](../../src/config.ts).

Seats `a` and `b` are each looked up in `ISSUE.md`, then `EPIC.md`, then the repo `issues/config.yaml`, then the machine `config.yaml`. The first file that sets the seat wins.

To see the settings that apply where you stand, run:

```sh
akrogon config
```

It prints the machine settings, the repo settings and the two seats after the lookup below. Run it inside a leaf worktree to see that leaf's seats.

## The three places

1. Machine `config.yaml`. One per machine.
2. Repo `issues/config.yaml`. One per registered checkout.
3. `slots:` front matter at the top of an issue's `ISSUE.md` or an epic's `EPIC.md`. Optional.

## Machine config.yaml

Akrogon looks for `config.yaml` in its home folder. The home folder is `$AKROGON_HOME` when that variable is set, otherwise `~/.akrogon`. If that folder has no `config.yaml` but the akrogon checkout itself has one, akrogon uses the checkout's file instead.

| Key | What it does |
| --- | --- |
| `max_active` | How many leaves may run at once across all registered repos. When that many are running, akrogon starts no new leaf. Work already running is not stopped. Leaves waiting in the merge phase do not count. A positive whole number. Default 3. |
| `slots` | The default seats `a` and `b` and the watch `consultant` recipe. All three are required, and every akrogon command refuses a file missing one, naming the file and the key. Each is a `harness`, a `model` and an `effort`. `consultant` is the recipe `akrogon seat --watch-consultant` starts; it is read from this file only, and its harness must be listed in `harnesses`. |
| `harnesses` | Maps a harness name to the command that starts it. `{model}` and `{effort}` in the command are filled from the seat. The command must start with the harness name. Every seat's harness must have an entry here. For a `claude` line, akrogon merges `permissions.denyInsteadOfPrompting: true` into the line's one `--settings` JSON object or adds it when the line has none. A `claude` line it cannot merge without dropping a setting (a non-object or missing value, a non-object `permissions`, more than one `--settings`, or a `--` token) is refused at launch naming the operand. |
| `toolkits` | Test toolkit choices per language, for example `<language>: <runner>`. Setup reads them when a repo has no tests. Default empty. |
| `repos` | Maps a repo name to its checkout folder. A relative path is read from the akrogon home folder, and `~` means your home folder. Default empty. |
| `prefixes` | Maps each registered repo name to a unique prefix of two lowercase letters. Optional in the file schema, but required when starting seats (`akrogon next`, `akrogon seat`), consultants, or the `watch-issues` timer, which use it to name terminals and refuse a missing or duplicate prefix. |
| `run_root` | Optional. When set, each check run's `TMPDIR` and Bun transpiler cache move to a fresh folder `<run_root>/run-XXXXXX`, meant for a RAM-backed path such as `/tmp/akr-ram`. The run's guard unit removes that folder when the run ends, however it ends. The run's record (`.owner`, `out.log`, `refusal.json`) and `AKROGON_EVIDENCE` stay under the leaf temp on disk, seat `TMPDIR` does not move, and a run-check nested inside another check keeps its `TMPDIR` on disk. Reconcile never reads this key. Akrogon creates the folder with mode 700 when it is missing. An absolute path of at most 40 bytes using only letters, digits, `.`, `_`, `-` and `/`, not equal to or inside the leaf temp root (`/var/tmp/akr-<uid>`) or the retired temp root (`/tmp/akr-<uid>`). To roll back, remove the key. |

```yaml
max_active: 3
slots:
  a: { harness: claude, model: <model>, effort: <effort> }
  b: { harness: codex, model: <model>, effort: <effort> }
  # The recipe `akrogon seat --watch-consultant` starts.
  consultant: { harness: agy, model: <model>, effort: <effort> }
harnesses:
  claude: claude --model {model} <other flags>
  codex: codex --model {model} <other flags>
  agy: agy --model {model} --effort {effort} --mode auto
toolkits:
  <language>: <runner>
repos:
  <repo-name>: <path-to-checkout>
prefixes:
  <repo-name>: <two letters>
```

## Repo issues/config.yaml

Each registered checkout has `issues/config.yaml`. The [init-akrogon skill](../../skills/init-akrogon/SKILL.md) proposes and writes it. Only `grounding` is required.

| Key | What it does |
| --- | --- |
| `remote` | The git remote to push to. Default `origin`. |
| `default_branch` | The branch leaves start from and land on. Default `main`. |
| `worktree_root` | Where leaf worktrees go. It must be outside the checkout. Default `~/.akrogon/worktrees/<repo-name>`. |
| `fix_rounds` | How many repair rounds a leaf may use. Default 3. |
| `max_active` | How many of this repo's leaves may run at once, under the machine `max_active`, which still limits the total. Counted like the machine limit, except that before a leaf that never started gets a seat, the repo's leaves waiting in merge, minus the one landing, count too. Optional, a positive whole number; absent means only the machine limit applies. `akrogon config` shows it as `repo_max_active`. Install a build that knows the key before adding it: an older build rejects the file. |
| `implement` | `subagents` lets seat A hand units to worker agents. `inline` makes seat A do all the work itself. Default `subagents`. |
| `setup` | A command that installs dependencies in each fresh checkout, such as `bun install --frozen-lockfile --backend=copyfile`. Akrogon runs it before check commands, and in a leaf worktree before a seat works there, once per checkout state. Optional. |
| `checks` | Named commands every leaf must pass. A red check blocks. Default empty. |
| `merge_checks` | Named commands that run only at merge, all at once once the `checks` stage is green. `akrogon config` prints `akrogon verify --attempt <id>` (the merge turn's runner) for each entry, and `akrogon run-check` refuses the command itself. Default empty. |
| `merge_covers` | Names from `checks` that a merge check already covers, so merge skips them. Needs a non-empty `merge_checks`. Default empty. |
| `rerun` | Commands that rerun a red check's failing tests once at merge, keyed by a `checks` or `merge_checks` name. When that check is red in a merge verify with at most 3 failing test names, akrogon writes the names one per line to a file, runs the rerun command once with `AKROGON_RERUN_NAMES` set to that file's path, and the rerun's exit decides the check. Base comparison runs never rerun. Optional. Install a build that knows the key before adding it: an older build rejects the file. |
| `full` | Names from `checks` or `merge_checks` that run a whole test suite. A run with one of these names, from `akrogon verify` or a seat's `run-check --name`, waits until no other `full` run of the same registered repo is running, in arrival order across that repo's leaves, seats and verifies. Other repos' runs and unlisted checks start at once. Inside a verify pass, `full` checks run after the other `checks` and are recorded `blocked` without running when setup or a non-`full` check is red. Default empty. |
| `advisory` | Commands that run but never block. Their failures are reported as small notes. Default empty. |
| `env` | Names of environment variables. Each must be set in the checkout's `.env`, and akrogon writes them into each leaf worktree's `.env`. Check commands also get them from your shell. Default empty. |
| `pass_env` | Names of environment variables check commands get from your shell, with no `.env` copy. Default empty. |
| `tools` | Command-line tools whose path and version akrogon records at the start of each merge. A missing tool stops the merge. Default empty. |
| `grounding` | Where agents find the repo's docs. `index` names the top index file, which must exist and not be empty. `docs`, `surfaces` and `indexed_scopes` are optional lists. Write `none` to have no grounding. |
| `broadcast` | Optional. `discord.webhook_env` lists the environment variable names that hold Discord webhook URLs for completion updates. |
| `slots` | Optional seat overrides for this repo, `a`, `b` or both. |

Checks run on every leaf, while merge checks run only when a leaf lands.

Environment variable names in `env` and `pass_env` use capital letters, digits and `_`. A few names akrogon sets itself, such as `TMPDIR`, `AKROGON_BASE` and `AKROGON_EVIDENCE`, are refused. So are `AKROGON_SESSIONS` and `AKROGON_SESSION_MINUTES`, because a paid test's budget is passed in its command, never stored in a repo file. `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` and `XDG_RUNTIME_DIR` reach check commands without being listed in `pass_env`, and listing them stays valid.

```yaml
remote: origin
default_branch: main
fix_rounds: 3
implement: subagents
setup: <install-command>
checks:
  <check-name>: <command>
merge_checks:
  <merge-check-name>: <command>
merge_covers: [<check-name>]
full: [<check-name>]
advisory: []
env: [<VAR_NAME>]
pass_env: []
tools: []
grounding:
  index: <path-to-index.md>
broadcast:
  discord:
    webhook_env: [<WEBHOOK_VAR_NAME>]
slots:
  b: { harness: codex, model: <model>, effort: <effort> }
```

## slots front matter in ISSUE.md or EPIC.md

An issue or epic can set its own seats. The block must be the very first thing in the file: line one is `---`, and a later `---` closes it. The block may hold only `slots:`, with `a`, `b` or both; `consultant` is refused there. A file with no block is skipped. A broken block stops akrogon with an error that names the file.

```markdown
---
slots:
  a: { harness: claude, model: <model>, effort: <effort> }
---
# <issue title>
```

## Which seat wins

Akrogon looks up seat `a` and seat `b` separately. For each seat it checks these files in order and takes the first one that sets that seat:

1. The issue's `ISSUE.md`.
2. The epic's `EPIC.md`, only when the issue sits inside an epic.
3. The repo's `issues/config.yaml`.
4. The machine `config.yaml`.

Akrogon finds the files from the leaf's folder under `issues/open` or `issues/closed`. A leaf at `<issue>/<leaf>` uses `<issue>/ISSUE.md`. A leaf at `<epic>/<issue>/<leaf>` uses `<epic>/<issue>/ISSUE.md`, then `<epic>/EPIC.md`. Outside a leaf, only the repo and machine files count.

A seat is always taken whole. If `ISSUE.md` sets seat `a`, its `harness`, `model` and `effort` all come from `ISSUE.md`. No field is mixed in from a lower file. Seat `b` can still come from a different file.

The winning seat's harness must be listed in the machine `harnesses`. If it is not, akrogon stops with an error.

Seats are the only setting these files share. Every other repo setting comes from `issues/config.yaml` alone.
