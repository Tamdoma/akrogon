# Brief: herdr-skill

## What

herdr-setup ships one global `herdr` skill:

- `skills/herdr/SKILL.md` with front matter `name: herdr` and a trigger-rich description (runtime trigger first: `HC_TERMINAL_ID` set or a message in `<hc>` tags; then hc, herdr-core, herdr-app, starting, messaging or waiting on other terminals or agents, changing the window), short enough for Codex's skill budget, with no "only when the user mentions Herdr" wording;
- a body holding only the gate and directions: agents and terminals → `hc --skill`; the window → `herdr-app --skill`; layouts, keys and mods → `${HERDR_APP_HOME:-$HOME/.config/herdr-app}/AGENTS.md` and `herdr-app commands`; outside hc (`HC_TERMINAL_ID` unset) it stops hc and `herdr-app do` control but still allows reading AGENTS.md when asked to edit layouts, keys or mods;
- `./install` links the folder into `~/.claude/skills/herdr`, `~/.codex/skills/herdr`, `~/.pi/agent/skills/herdr`, `~/.agents/skills/herdr` and `~/.gemini/config/skills/herdr` with its existing `link()`, which moves the old real herdr skill folders to its backup folder in the same run.

## Why

The operator wants agents to know herdr-core and herdr-app without being reminded, from one copy that pulls from herdr-app's own docs, replacing the old herdr skill (signposts 5a, forks/herdr-skill.md).

## Done-criteria

1. Running `./install` with a scratch `HOME`, `XDG_STATE_HOME`, `HERDR_APP_HOME` and session homes holding real `herdr` skill folders in the five homes leaves each home's `herdr` a link to the repo's `skills/herdr` and the old folders in the backup folder; a second run changes nothing; nothing outside the scratch homes changes (B). Proof: own test in the `test` check.
2. For each of claude, codex, pi and agy, a fresh session inside a throwaway hc terminal, whose cwd offers the candidate skill through that harness's documented project skill folder (for example `.claude/skills/herdr`, `.agents/skills/herdr`), given an hc-shaped task and an incoming `<hc>` report, loads the `herdr` skill without being told to (told apart from the old `herdr` skill still in the live homes by the candidate's content in the log) (C); a harness that does not gets better description wording, not a new mechanism; one that still does not after that leaves the criterion unmet and the leaf stops for the operator (B). Proof: attended paid per-harness run, logs kept, under this leaf's grant; it names the live-interaction property (a fresh session choosing to load the skill) no recording proves (B).
3. The skill body holds no copied hc or herdr-app manual text and no hc facts, only the gate and the directions above. Proof: the file itself, read in the review.
