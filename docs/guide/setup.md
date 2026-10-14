# Setup

Initialize each repository before dispatching work. The examples use:

```text
~/Work/widgets
```

## The easy way

Open an agent at the repository root and invoke the setup skill:

```text
/init-akrogon
```

It inspects the project and proposes the branch, checks and documentation used to guide agents. It also maps the code areas and creates missing grounding documents.

Review the proposal. Then let the skill call the initialization command.

## The direct way

You can supply a YAML proposal yourself:

```sh
cd ~/Work/widgets
akrogon init --from /path/to/proposal.yaml
akrogon config
```

The command writes repository configuration, creates the issue and lesson scaffolds, adds ignore entries, sets the `learnings/LESSONS.md merge=union` attribute and registers the repository.

It writes configuration. It does not inspect your code and decide how to divide it into areas.

Running init again preserves existing settings unless the proposal changes them. For a project without tests, the toolkit option records your choice. It does not install the test runner:

```sh
akrogon init --toolkit typescript="bun test"
```

## Repo config, the parts you'll care about

Repository settings live here:

```text
~/Work/widgets/issues/config.yaml
```

Check these choices:

- **default_branch** is where reviewed work lands.
- **remote** selects the Git remote used for integration.
- **checks** lists the commands that must pass before merge. `akrogon verify` runs them on a fresh checkout of a commit and records a receipt; the `check.review` move, the `check.repair` move into `merge`, and the merge and direct routes require a green one for the exact commit and command set.
- **merge_checks** lists slow commands that run only at merge, on the rebased leaf before push, except a `check.fix` pass after a red merge ending reruns the reproducing command of the rejected run. A cheap check never runs only at merge, even when a merge command also runs it — a check cheap enough for the leaf's own check belongs in `checks`, and a merge command may rerun it on the integrated candidate but is never its only home.
- **merge_covers** lists `checks` names skipped at merge because `merge_checks` covers them. Empty by default.
- **grounding** points agents to the project's reference index, or disables that lookup.
- **worktree_root** says where leaf checkouts go. Unset defaults to `~/.akrogon/worktrees/<repo name>`; `~` expands to the machine home directory. Only a store inside the checkout is gitignored.
- **rebuttal** controls the paired planning rebuttal.
- **fix_rounds** bounds the chart door's direct-route repair rounds. Leaf handoffs and merge bounces are counted in `fix_rounds` and shown in status.
- **slots** optionally replaces a machine seat for this repo — a full {harness, model, effort} per seat (a or b); it applies at the next agent start.
- **setup** optionally runs before your checks, usually to install dependencies.
- **env** lists names copied from the registered checkout's `.env` into each leaf's `.env` and into each check command's constructed environment. Dispatch refuses a leaf when a listed name is missing from that `.env`.
- **pass_env** lists session variables, such as `DISPLAY`, passed from the caller into each check command's constructed environment. They are never read from or written to `.env`; a name that is unset stays unset. `DBUS_SESSION_BUS_ADDRESS` is reserved in both lists: every check runs with the session bus cut so test browsers stay in akrogon's cgroup.
- **tools** lists PATH tools resolved at merge dispatch and recorded on merge attempts.

`setup` runs before every `checks`, `merge_checks` and `advisory` command that `akrogon config` prints, and once per `akrogon verify` checkout before its commands run. It runs under a per-worktree lock kept under the git dir, so the lock never shows in `git status` and is removed with the worktree. The setup skill proposes it only when a lockfile is committed. Every printed check command runs under `akrogon run-check`, which refuses forbidden caller environment (`NODE_PATH`, `BUN_OPTIONS`, `BUN_INSTALL_CACHE_DIR`, `FFMPEG_BIN`, `CHROME_PATH`, `CDP_BROWSER_BINARY`, a global bunfig) and runs the command in a constructed environment. Many check commands can run at a time on the host; every run registers a record and starts at once. Each run lives in its own `akrogon-run-<id>.scope` systemd scope under the leaf slice and prints a `run <id>` line on stderr; `akrogon stop-run <id>` ends it. A run started inside a live run (matching `AKROGON_RUN`) prints no `run` line and creates no unit.

Use the effective configuration to check the result:

```sh
akrogon config
```

The machine registration key is the repository's identity. For our example, each leaf uses widgets as its repo value. Moving the project directory does not require changing that identity.

If you move the repository or its worktree root, reconcile existing worktrees and recorded paths before dispatching again. Changing a config path does not move a checkout.

## Grounding: help agents find the right code

Grounding gives the agent a short route into an unfamiliar repository. The reference index points to areas. An area's document names useful commands, files and local constraints.

The setup skill reuses a suitable existing index. If none exists, it creates a small one. It adds an AREA file only where an index line is not enough.

For widgets, a possible layout is:

```text
~/Work/widgets/docs/reference-index.md
~/Work/widgets/src/export/AREA.md
```

That is an example layout, not a required source directory. Existing projects can keep their own documentation locations.

```text
docs/reference-index.md
       |
       +--> src/export/AREA.md
       |       |
       |       +--> exporter code
       |       +--> export tests
       |       +--> commands and local constraints
       |
       +--> simple area's code or document directly
```

For export-csv, the index points the planner to the export area, then to the files and checks it needs. A simple area can link straight to code without adding an AREA file.

AREA files stay short: at most 40 lines, with Commands, Key files, Non-obvious patterns and See also sections. They point to real files rather than duplicate the code.

Planning reads the configured index and relevant areas. It carries useful paths into the plan's read-first list. Implementation uses that list and updates affected docs and area entries. Review follows affected pointers and checks paths in changed AREA files.

For CSV export, this can lead the planner straight to the existing JSON exporter and its tests. It also gives later leaves an updated route to the new CSV code.

## What init-akrogon adds to init

The skill chooses settings from the repository it inspects. The command writes and validates configuration.

You get checks that use the project's actual tools, plus a map of the code. Calling the command alone does not perform that investigation. Init refuses a declared index that is not a readable non-empty file. A fresh repo needs an index or an explicit `grounding: none`.

Previous: [Install](install.md) · Next: [Create](create.md) · [Home](../../README.md)
