# Setup

Once per repo you want agents in. After this, the repo knows its branch, its checks, and where its leaves live.

## The easy way

Open your own agent session in the repo and run the init-issues skill. It inspects the repo, proposes the settings below, writes the proposal to a temp file outside the repo, and calls akrogon init --from for you. Then it verifies. You answer the questions it can't settle by looking. That's it.

I use the skill for real repos. The direct way is for empty or test-less toys, or when you want to feel the sharp edges.

## The direct way

Prerequisites: Akrogon installed. No registration yet — that happens here. You just need a git checkout and to know if it has tests.

Which directory you're in: the repo root. For our running example, that's the widgets checkout:

    cd ~/Work/widgets
    akrogon init --toolkit typescript="bun test"
    akrogon config

The first command initialises. --from is optional — without it, init reuses the existing issues/config.yaml if there's one, or starts empty. --toolkit records a toolkit choice without installing anything, for repos without tests yet. The second command prints what an agent will see: effective global plus repo settings.

What you should see: init's quiet. config prints YAML with your slots, checks, repo name widgets, all of it. If it says repo none, you're not in a registered checkout — check you ran init in the right root.

What to do when it fails: Repo name already registered means the folder name is taken by a different path. Rename the folder or fix the global config.yaml. Expected toolkit pair means you forgot the equals sign. I do that about half the time.

What init writes: issues/config.yaml, creates issues/open/ and learnings/LESSONS.md, adds ignore lines for worktrees, seeds, and lock files, and registers the repo in the global config under its folder name. Running it again keeps existing choices.

## Repo config, the parts you'll care about

    remote: origin
    default_branch: main
    worktree_root: issues/worktrees
    rebuttal: true
    fix_rounds: 3
    implement: subagents
    checks:
      format: bun run format
      test: bun test
      typecheck: bun run typecheck
    advisory: []
    grounding:
      index: docs/reference-index.md
    broadcast:
      discord:
        webhook_env: [DISCORD_WEBHOOK_URL]

Quick tour. remote and default_branch say where code integrates. worktree_root says where leaf checkouts go — default issues/worktrees, and changing it later means reconciling existing paths by hand, so pick once. rebuttal says whether debate mode gets a reply round. fix_rounds caps review-to-fix loops before failed. implement is subagents or inline. checks must all pass before review and before merge; advisory failures get reported as nits but don't block. grounding.index is the short map planners read first. broadcast is optional Discord routing when an issue completes.

For changed-tests, use the AKROGON_BASE form from the skill — it compares against the leaf branch point, and Akrogon sets that variable in every pane. Secrets like webhook URLs go in ~/.config/akrogon/env, one NAME=value per line, never in the repo.

One more thing, since it bites: the registration key in the machine config is persistent repo identity and must match each leaf's repo value. Ours is widgets everywhere. Changing the repo root or worktree_root means manual reconciliation of worktree locations, git metadata, and recorded state.worktree paths before dispatch resumes. The export-csv leaf will use repo widgets here.

Previous: [Install](install.md) · Next: [Create](create.md) · [Home](../../README.md)
