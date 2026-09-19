# Install

One command per machine. Do it once, then forget it. I mean that — updates are just git pull.

## Prerequisites

You need bun, git, flock, herdr, and the agent CLIs your seats use. If you'll pull GitHub issues, you also need an authenticated gh. And set your machine's slots, harness commands, and registered repos in config.yaml at the tool root first — or in the directory picked by AKROGON_HOME if you use that. Install reads that file, it doesn't invent it.

Which directory you're in: the Akrogon tool checkout. Mine is ~/Work/infra/akrogon. Yours can be anywhere, the symlinks handle it.

## The command

    cd ~/Work/infra/akrogon
    bun install
    bun src/akrogon.ts install

What you should see: not much. No output means it worked, apart from maybe a path print for the env file on first run. What it did:

1. Linked the command. ~/.local/bin/akrogon now points at the source. Edit src/ and it's live. Make sure ~/.local/bin is on your PATH, or you'll stare at command not found for longer than you would admit.
2. Linked the skills. Every folder in skills/ gets linked into all four agent skill roots: ~/.claude/skills, ~/.agents/skills, ~/.codex/skills, and ~/.pi/agent/skills. Both seats read the same skill text. When a skill changes on main, every agent sees it on its next prompt, because they are symlinks.
3. Linked the plugin and harness integrations. It runs herdr integration install for each configured harness kind, then herdr plugin link for the bundled plugin. The plugin runs akrogon pull --all and akrogon next --all at Herdr start, and akrogon next on agent status changes, pane exit/close, and tab close.

What to do when it fails: if a destination already exists and is not the right link, install prints the rm commands and stops. Run them — after you have looked, don't blindly nuke — and install again. If a harness kind is missing from config, it complains about that instead; fix config.yaml and retry.

Update the tool with git pull in the checkout. Nothing needs reinstalling. The command and skills follow the checkout through symlinks, which is why I keep saying forget it.

## Global config, since you'll stare at it next

Lives at the tool root, config.yaml — or under AKROGON_HOME if you set that. It says which agents run, how to launch them, and which repos exist. Here is a small one with our running repo widgets in it:

    max_active: 3
    slots:
      a: { harness: pi, model: devin/swe-2-max, effort: max }
      b: { harness: pi, model: devin/swe-2-max, effort: max }
    harnesses:
      pi: "pi --model {model} --thinking {effort} -a --exclude-tools request_user_input"
    toolkits:
      typescript: bun:test
    repos:
      akrogon: /home/me/Work/infra/akrogon
      widgets: /home/me/Work/widgets

Slots are seats with a configured harness and model. Both seats can be the same harness and model — mine are — or different. Vendor spread is a choice. The {model} and {effort} bits get filled in at launch. max_active is the machine ceiling across every registered repo, not per repo.

Why max_active? Each active leaf is two agents spending tokens plus a worktree on disk. Three is already a lot. Raise it when you have got budget and disk, lower it to 0 when you want everything to sit still. I keep mine low during the day and raise it overnight. Your call. You'll later run export-csv in widgets under it.

Previous: [State](state.md) · Next: [Setup](setup.md) · [Home](../../README.md)
