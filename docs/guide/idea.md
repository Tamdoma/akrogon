# The idea

You write one piece of work into a folder. Akrogon's loop picks it up and walks it to merge.

Here's the whole thing, and I mean the whole thing: a file says the phase, a hook fires, the next agent gets prompted, repeat until merged. File to hook to next to prompt. That's the loop. No server. No database. Nothing to restart when something crashes, because there's nothing running.

Say you've got a repo called `widgets`. It's a registered checkout, which just means a git checkout you've listed in `config.yaml` so Akrogon knows where its `issues/` folder lives. Inside it you've got an issue, that's a folder under `issues/open/` holding one unit of intent. Ours is `export-csv`: add `widgets export --format csv` that prints `id,name,price` rows to stdout. Small. Checkable. Perfect.

That'ssue holds a leaf. A leaf is the folder with a `state.yaml` in it, and it's the thing agents actually work on. Ours lives at `issues/open/export-csv/export-csv/` with `slug: export-csv`. The nesting looks redundant at first — issue folder holding a leaf folder with the same name — but that's the rule: a leaf sits two or three levels under `issues/open/`, so an issue can grow more leaves later without moving.

The leaf's `state.yaml` has a `phase` line. A phase is one word saying where the leaf is right now: planning, building, reviewing, merging. When an agent finishes, it runs `akrogon phase export-csv <next-phase>` and that line changes. That's the only way phases move. You don't edit the file to move forward, you run the command, because the command also resets the bookkeeping (we'll get to that in [State](state.md)).

Who does the work? Two seats, A and B. A slot is just the name `A` or `B`, and a seat is the agent running in it. Each seat has a configured harness and model in `config.yaml` — that's it, no vendor requirement. In my checkout both seats run the same setup, and that's fine. B tends to plan and build, A tends to review and merge, but that's routing, not destiny. The routing table lives in code and says which seat each phase needs.

Each running leaf gets a tab. A tab is one terminal tab in Herdr, with two panes: A on the left, B on the right. Agents build in a worktree, which for us means a second checkout on a branch named `export-csv` at `issues/worktrees/export-csv/`. Your registered checkout stays on `main` holding issue files; the worktree holds code. The branch never touches `issues/`, and the command refuses it if it tries.

A skill is the markdown instructions an agent follows for one phase, like `plan-issue` or `check-issue`. Plain files under `skills/`. And a hook is the Herdr plugin that ties it together: whenever an agent changes status or a pane exits or closes, or a tab closes, it runs `akrogon next`, and at Herdr start it runs `pull --all` and `next --all`. `next` reads the files and prompts whoever's next. The prompt is five fields — skill, slug, slot, phase, leaf folder — and the agent reads the skill and goes.

## Why a file and not a program

A running program can be in a wrong state. A file can't. If Akrogon crashes mid-dispatch, nothing's lost; the files still say the truth. If you want to know what's happening, you read `state.yaml` and the leaf folder. Both seats, git, and you can all read the same file with nothing running. I didn't trust this at first — felt too simple — but after watching a merge die halfway and resume cleanly from the files, I'm sold.

## Why two seats instead of one smart agent

One mind reviewing its own work misses the same things twice. I like B building and A checking because they fail differently. In one early run I watched, A caught style nits by reading while B caught real bugs by running. Different angles. You don't need two vendors for this to help — even the same model with different prompts and different artifacts (plan vs diff) catches more than one pass. My take: keep both seats, don't overthink which model sits where until you've seen your own failure patterns.

## The concrete use

You write `brief.md` and `state.yaml` for `export-csv`, sync them, run `akrogon next export-csv`. A tab opens, B plans, B builds, both review, A merges. You answer when asked and read when it fails. You don't watch it work. That's the job.

Previous: [README](../../README.md) · Next: [Parts](parts.md) · [Home](../../README.md)
