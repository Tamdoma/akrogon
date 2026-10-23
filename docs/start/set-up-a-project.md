# Set up a project

Each project needs a one-time setup before Akrogon can run work in it. Setup writes the project's settings, adds the `issues/` folders and registers the project on your machine. The examples use a project at `~/code/my-app`.

## Run init-akrogon

Open your agent CLI at the project root and run the [init-akrogon](../../skills/init-akrogon/SKILL.md) skill:

```text
/init-akrogon
```

The skill reads the project: its package files, lockfile, tests, lint and type checks, docs and Git remote. Then it shows you one proposal for the project's settings and asks only what it could not work out by reading.

When you accept, the skill writes the proposal to a temporary file and runs:

```sh
akrogon init --from <proposal.yaml>
akrogon config
```

`akrogon init` does the writing:

- `issues/config.yaml`, the project's settings.
- The `issues/open/` folder and `learnings/LESSONS.md`.
- Ignore lines in `.gitignore` for seeds, locks and check logs, and a `.gitattributes` line so `learnings/LESSONS.md` merges by keeping both sides.
- A new entry under `repos` in your machine `config.yaml`. The project is registered under its folder name, here `my-app`.

`akrogon config` then prints the settings that apply in this project, so you can see the result. Running setup again keeps your existing choices unless the new proposal changes them.

![Project folders: the registered checkout's issues folder holds seeds for imported reports, chart for charts of open forks, open for active issues and leaves, parked for issues set aside and closed for completed issues, plus record files with one JSON line per event. A separate worktree store outside the checkout, by default ~/.akrogon/worktrees/<repo>, holds one worktree per leaf.](../pictures/project-folders.svg)

## The settings you touch

These are the keys in `issues/config.yaml` a beginner is most likely to change. The rest are in [config.md](../reference/config.md#repo-issuesconfigyaml).

- `checks`: named commands every leaf must pass, such as `test: npm test`. Each one blocks: a red check stops the leaf from moving to review and from landing. `akrogon verify` runs them all on a fresh checkout of a commit. Default empty. See [Checks](../reference/checks.md).
- `grounding.index`: the path, from the project root, of the top docs index agents read first, such as `docs/reference-index.md`. The file must exist and not be empty. See Grounding below.
- `default_branch`: the branch leaves start from and land on. Default `main`.
- `remote`: the Git remote Akrogon fetches from and pushes to. Default `origin`.
- `slots`: optional seat overrides for this project only. Set `a`, `b` or both, each with a `harness`, a `model` and an `effort`, like the machine config. The harness must exist under `harnesses` in your machine config. Leave it out to use the machine seats.

```yaml
remote: origin
default_branch: main
checks:
  test: npm test
grounding:
  index: docs/reference-index.md
slots:
  b: { harness: codex, model: <model>, effort: <effort> }
```

## Grounding

Grounding gives agents a short route into your code, so they find the right files without reading the whole project.

![Grounding: grounding.index in issues/config.yaml names a top index such as docs/reference-index.md, which links to AREA.md files with commands, key files and local constraints, which point to real source files and tests. The plan agent reads the index, the relevant areas and their files and writes a read-first list. The implement agent works from that read-first list and opens the index only on a gap.](../pictures/grounding.svg)

It has two layers:

1. The index file named by `grounding.index`. It has one line per area of your code, each linking to a real file or folder.
2. `AREA.md` files, one next to each area that one index line cannot explain. Each is at most 40 lines, with four sections: Commands, Key files, Non-obvious patterns and See also. They point to real files instead of copying the code.

The setup skill reuses a suitable index your project already has. If there is none, it writes a small one, and adds an `AREA.md` only where an area needs it.

The seats use grounding like this:

- The plan agent reads the index, the areas that matter for the leaf, and `learnings/LESSONS.md`. It copies the useful paths into the plan's read-first list. See [plan-issue](../../skills/plan-issue/SKILL.md).
- The implement agent works from that read-first list and opens the index only when something is missing. It updates any `AREA.md` or doc that its change makes out of date. See [implement-issue](../../skills/implement-issue/SKILL.md).
- The reviewers check that every path named in a changed `AREA.md` still exists.

`akrogon init` refuses a `grounding.index` file that is missing, unreadable or empty. To run without grounding, set `grounding: none`. That is an explicit choice, and the setup skill proposes it only when you ask for it.

Next: [One change, start to finish](one-change.md)
