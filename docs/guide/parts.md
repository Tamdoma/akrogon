# Parts

Twenty words cover the whole system. Read them once and the rest reads easily. I still come back here when I mix up issue and leaf — which, honestly, happens when I'm tired.

## The words

| Word      | What it's                                                                                                                                                                                                                     | Where it lives                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Repo      | A git checkout you've registered with Akrogon. It has an `issues/` folder. We call this the registered checkout, and it's the only place issue files get written.                                                             | `config.yaml` → `repos`          |
| Issue     | One unit of intent, like “add CSV export”. A folder under `issues/open/`. Ours is `issues/open/export-csv/`.                                                                                                                  | `issues/open/<issue>/`           |
| Epic      | A folder of several issues that belong together. Just a folder. Nothing treats it specially except folder targeting with `next <folder>`.                                                                                     | `issues/open/<epic>/<issue>/`    |
| Leaf      | Any folder that has a `state.yaml`. This is what agents actually work on. A small issue is an issue folder holding one leaf folder, like `export-csv/export-csv/`. A big issue holds several leaves.                          | the folder with `state.yaml`     |
| Territory | The whole problem space for one destination. Not on disk — it's what the agent looks at.                                                                                                                                      | nowhere, it's the view           |
| Map       | What the agent sees in the territory: forks, practitioner questions, beginner pitfalls. Drawn at open, redrawn after every answer, never saved as its own file.                                                               | nowhere on disk                  |
| Fog       | A part of the map the agent can see but can't yet phrase as a sharp question. One patch per bullet in `CHART.md`; clears into forks as answers land.                                                                          | `CHART.md` → `## Fog`            |
| Fork      | One topic where the route splits. A fork holds one or more questions that always travel together on one screen. Taken when every material question in it's taken, and a taken fork isn't reopened.                            | one file per fork under `forks/` |
| Question  | One Q block inside a fork: explainer, evidence, exhaustive options with one recommended, pitfalls. An explicit choice takes it; asking for an explanation doesn't.                                                            | a Q block in a fork file         |
| Round     | One screen put to you: every currently material question across all open forks, one reply key, one challenge check.                                                                                                           | one screen in your agent session |
| Chart     | The one page per destination: forks taken, forks open, fog, off route.                                                                                                                                                        | `issues/chart/<issue>/CHART.md`  |
| Off route | Work deliberately left past the destination, with the reason.                                                                                                                                                                 | a section in `CHART.md`          |
| Phase     | One word in `state.yaml`: where the leaf is right now. Planning, building, reviewing, merging. It's the main signal, but not the only one — `done`, `prompted`, panes, `hand_built`, and `blocked-by` all steer dispatch too. | `state.yaml` → `phase`           |
| Slot      | A or B. The seat a phase needs. Each slot has a configured harness and model in the global config. Same model in both is fine; vendor spread is a choice, not a rule.                                                         | `config.yaml` → `slots`          |
| Seat      | The agent running in a slot. Slot is the name, seat is who's sitting there. I use them interchangeably when I'm lazy, and everyone knows what I mean.                                                                         | the running agent                |
| Tab       | A terminal tab in Herdr, one per active leaf. Two panes: A on the left, B on the right.                                                                                                                                       | Herdr                            |
| Worktree  | A second checkout on a branch named after the leaf. Agents build there so they never touch your main checkout. Default `issues/worktrees/<slug>`, changeable via `worktree_root`.                                             | `issues/worktrees/<slug>`        |
| Skill     | The instructions an agent follows in one phase, like `plan-issue`. Plain markdown. Linked into each agent's skill folder.                                                                                                     | `skills/<name>/SKILL.md`         |
| Herdr     | The terminal manager that holds tabs, starts agents, and knows when an agent is working, idle, or blocked.                                                                                                                    | the `herdr` command              |
| Hook      | The Herdr plugin. It runs `akrogon next` on agent status changes, pane exit/close, and tab close, plus `pull --all` and `next --all` at Herdr start.                                                                          | `plugin/`                        |
| Command   | The `akrogon` tool itself. Reads files, opens tabs, prompts agents, moves phases. Runs and exits. Nothing stays running.                                                                                                      | `~/.local/bin/akrogon`           |

## Folders, because this is where everyone trips

The tool only cares about the folder with `state.yaml` in it. Everything above is organisation for you. Leaf equals folder with `state.yaml`, issue equals folder of leaves, epic equals folder of issues. Say it once and it sticks.

```
issues/
  open/
    export-csv/              <- issue folder
      export-csv/            <- leaf (has state.yaml)
        brief.md
        design.md
        state.yaml
    search/                  <- epic, a plain folder
      index/                 <- issue with two leaves inside
        ISSUE.md
        build-index/  state.yaml
        query-api/    state.yaml
  closed/                    <- finished folders move here
  worktrees/                 <- agents build here, ignored by git
  parked/                    <- issues you set aside with akrogon park
  chart/                     <- charts for issues still being planned
  seeds/                     <- GitHub issues pulled in, ignored by git
  log.jsonl                  <- one line per phase change
```

Depth matters: a leaf sits two levels under `issues/open/` (issue/leaf) or three (epic/issue/leaf). One level — `issues/open/export-csv/state.yaml` — is refused. I tried that once. It tells you straight away.

## A concrete use

You want CSV export in `widgets`. That's issue `export-csv` with leaf `export-csv`. Later you add `export-json` as a second leaf in the same issue folder, and they can run in parallel unless you wire `blocked-by` between them. If the whole thing grows, you group issues under an epic folder and target it with `akrogon next search`.

Previous: [The idea](idea.md) · Next: [State](state.md) · [Home](../../README.md)
