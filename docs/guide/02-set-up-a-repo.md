# Set up a repo

Each **repository** (project folder tracked by Git) needs a one-time setup before Akrogon can chart or build work in it. Setup writes the repository's `issues/` settings and starter folders, registers the repository on your machine, and gives agents a short map of the codebase.

## One Akrogon install, many repositories

Because you install Akrogon once per machine, a single `~/.akrogon/config.yaml` serves every repository you register. For example, an agency running one shared upstream library (`acme-core`) and two product apps built on it (`client-portal` and `partner-hub`) lists all three in one machine config:

```yaml
max_active: 3
slots:
  a: { harness: claude, model: claude-opus-5-5, effort: high }
  b: { harness: claude, model: claude-opus-5-5, effort: high }
  consultant: { harness: claude, model: claude-opus-5-5, effort: high }
harnesses:
  claude: "claude --model {model} --effort {effort} --settings '{\"env\":{\"CLAUDE_CODE_SUBAGENT_MODEL\":\"{model}\",\"CLAUDE_CODE_SUBAGENT_MODEL_FORCE\":\"1\"}}' --dangerously-skip-permissions"
repos:
  acme-core: ~/code/acme-core
  client-portal: ~/code/client-portal
  partner-hub: ~/code/partner-hub
prefixes:
  acme-core: ac
  client-portal: cp
  partner-hub: ph
```

Each entry under `repos:` maps a repository name (its checkout folder name) to its checkout path. Each entry under `prefixes:` gives that repository a unique two-letter lowercase prefix (`ac`, `cp`, `ph`). Akrogon uses the prefix to name every terminal it starts for that repository in Herdr (such as `cp-csv-export-a` for slot A, `cp-slot-b` for a charting consultant, `cp-watch` for the watcher timer, and `cp-watch-consult` for a watch consultant) and refuses to start work if a repository's prefix is missing or shared with another repository.

Repeat the four steps below for each repository you want to register. The walk-through uses `client-portal` at `~/code/client-portal`.

## Set up `client-portal` step by step

### 1. Open your agent CLI at the repo root and run `/init-akrogon`

```sh
cd ~/code/client-portal
claude
```

Inside the agent session, run the [init-akrogon](../../skills/init-akrogon/SKILL.md) skill:

```text
/init-akrogon
```

Expected result: The skill runs `akrogon config`, inspects `client-portal` (its package manifests, committed lockfile, tests, lint and typecheck commands, existing docs, and Git remote and default branch), asks only what it could not work out by reading, and presents one concrete `issues/config.yaml` proposal.

### 2. Accept the proposal so the skill initializes the repo

Reply to approve the proposal (or adjust any check command first).

What runs when you accept: if `client-portal` does not already have a top docs index, the skill writes `docs/reference-index.md` (and any needed `AREA.md` files). It then writes the proposal to a temporary file outside the repository, runs:

```sh
akrogon init --from <proposal-file>
```

deletes the temporary file, and verifies that the proposed checks run.

`akrogon init` writes or updates every one of these files:

- **`issues/config.yaml`**: the repository's settings (`remote`, `default_branch`, `fix_rounds`, `implement`, optional `setup`, `checks`, `merge_checks`, `merge_covers`, `advisory`, `grounding`, and optional `broadcast` or `slots`).
- **`issues/open/`**: the folder where active tasks (leaves) live.
- **`learnings/LESSONS.md`**: starter lessons file (`# Lessons`), created if it does not already exist, where seats read and record lessons from completed tasks.
- **`.gitignore`**: adds `issues/seeds/`, `.lock`, `issues/open/**/*.log`, `issues/parked/**/*.log`, and `issues/chart/*/direct/**/*.log` (skipping any line already present).
- **`.gitattributes`**: adds `learnings/LESSONS.md merge=union` so concurrent lesson additions from parallel tasks merge by keeping both sides.
- **`repos` entry in `~/.akrogon/config.yaml`**: adds `client-portal: /home/alex/code/client-portal` (registered under the checkout's folder name).

If `~/.config/akrogon/env` does not exist yet, `akrogon init` also prints that path so you know where shared machine secrets live if you use them later.

Expected result: the skill checks the generated files, index links, and test commands, and finishes with `Last operation: ...` and `Next: none`. Running `/init-akrogon` again later keeps your existing choices unless the new proposal changes them.

### 3. Add `client-portal: cp` under `prefixes:` in `~/.akrogon/config.yaml`

`akrogon init` adds the `repos:` entry automatically, but it does not pick a two-letter prefix for you. Open `~/.akrogon/config.yaml` and add a unique two-letter lowercase prefix matching the repository name:

```yaml
prefixes:
  client-portal: cp
```

Akrogon checks this prefix before allocating a task in `akrogon next` or launching any seat or consultant in `akrogon seat`, and stops with an error if the prefix is missing (the error names `~/.akrogon/config.yaml`) or collides with another repository (the error names both repositories and the shared prefix).

Check the merged settings from inside `~/code/client-portal`:

```sh
akrogon config
```

Expected result: prints your combined machine and repository settings, including `client-portal: cp` under `prefixes:`, your wrapped `checks`, `repo: client-portal`, and `worktree_store: /home/alex/.akrogon/worktrees/client-portal`.

### 4. Check `akrogon status`

From inside `~/code/client-portal`, run:

```sh
akrogon status
```

Expected result:

```text
Listener: live
client-portal
  no open leaves
```

Running `akrogon status` inside a registered repository shows just that repository; running it outside any registered repository lists every registered repository on the machine.

Once `akrogon status` shows `client-portal`, commit the generated setup files (`issues/config.yaml`, `learnings/LESSONS.md`, `.gitignore`, `.gitattributes`, and your grounding docs) to your default branch so every future task worktree starts with them.

## Settings you are most likely to touch

A typical `issues/config.yaml` for `client-portal` looks like this:

```yaml
remote: origin
default_branch: main
setup: bun install --frozen-lockfile --backend=copyfile
checks:
  typecheck: bun run typecheck
  test: bun test
grounding:
  index: docs/reference-index.md
```

- **`remote`** and **`default_branch`**: the Git remote and branch tasks branch from and land on (defaults: `origin` and `main`).
- **`setup`**: optional command to install dependencies in each fresh task worktree (proposed automatically only when a lockfile such as `bun.lock`, `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` is already committed in `HEAD`).
- **`checks`**: named commands every task must pass before review and before merging. A red check blocks progress. Slower full suites go under `merge_checks` (which run only at merge time); non-blocking commands go under `advisory`. See [Checks](../reference/checks.md).
- **`grounding.index`**: repository-relative path to the top docs index agents read first. See [Grounding](#grounding) below.
- **`slots`** (optional): overrides `a`, `b`, or both for this repository only, using harnesses already declared in `~/.akrogon/config.yaml`. Leave it out to inherit your machine defaults (`consultant` is always read from `~/.akrogon/config.yaml` only).

Every key in `issues/config.yaml` is documented in [Settings](../reference/config.md#repo-issuesconfigyaml).

## Grounding

**Grounding** gives agents a compact map of your codebase so they open the right files immediately instead of reading the whole repository on every task.

It has two layers:

1. **Top index (`grounding.index`)**: a short Markdown file named in `issues/config.yaml`, usually `docs/reference-index.md`. It lists one line per area of your codebase, each linking to a real existing file or folder.
2. **Area files (`AREA.md`)**: placed next to any area that one line in the index cannot explain. Each `AREA.md` is **at most 40 lines** and contains exactly four second-level sections:
   - `Commands`
   - `Key files`
   - `Non-obvious patterns`
   - `See also`
   Each file points to real repository-relative paths instead of copying code or writing a long overview.

The `/init-akrogon` skill reuses a suitable index if your repository already has one. Otherwise it creates `docs/reference-index.md` and adds `AREA.md` files only where an area needs one.

How agents use grounding across a task:

- **Charting and planning** ([plan-issue](../../skills/plan-issue/SKILL.md)): reads `grounding.index`, the relevant `AREA.md` files, and `learnings/LESSONS.md`, and copies useful paths into the plan's read-first list.
- **Building** ([implement-issue](../../skills/implement-issue/SKILL.md)): works from that read-first list, opens the top index only when something is missing, and updates any `AREA.md` or doc its change makes stale.
- **Reviewing** ([check-issue](../../skills/check-issue/SKILL.md)): checks that every path named in a changed `AREA.md` still exists in the repository.

`akrogon init` refuses a `grounding.index` path that is missing, unreadable, or empty. To run a repository without grounding docs, set `grounding: none` in `issues/config.yaml`. That is an explicit choice, and `/init-akrogon` proposes `grounding: none` only when you ask for it.

Previous: [Install](01-install.md) · Next: [Your three tabs](03-your-three-tabs.md)
