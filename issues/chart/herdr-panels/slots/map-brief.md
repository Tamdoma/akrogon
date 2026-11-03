# Opening map brief (chart door, seat A = terminal t15)

You are a consultant seat (your letter is in the one-line prompt). Work alone; you will not see the other seats' maps until all finish. Do not edit any file except your return file. Do not contact the operator.

## Task

Read the intake and the live surfaces below, then write an independent territory map for charting this work. The map is your own position, proportional to the work, covering:

1. Material forks: decisions that change the outcome, each with the options you see, what each could break or invite later (not only now), and your recommendation with its reason.
2. Questions an experienced practitioner would ask before building this (GPUI/native panel UIs, terminal multiplexers like tmux/zellij/wezterm, agent dashboards, git UIs like lazygit/GitHub Desktop/VS Code SCM). Name sources where you have them, with tier: operator, practitioner (named person/team), better-than-training (docs, code, changelog, measured), model-knowledge (only with the searches you ran).
3. Pitfalls over the work's lifetime and what removes each (an option choice, a probe before handoff, a done-criterion, or an operator step).
4. How you would split the work into independently checkable outcomes, and any real dependency between them.
5. Anything in the intake you think is wrong, unneeded, or missing.

Specific things to settle in your map (not exhaustive): where the edited files live and how they reach every herdr-app session; what is cloned vs written new (shipped mods are read-only, AGENTS.md "Layouts"); how A4 reads leaf state across registered repos and maps a leaf to a terminal in herdr-app (akrogon is still on old herdr today, see the herdr-app intake); how A5 gets an agent's question text and sends a reply; how A6 detects coded options reliably; how agent logos/program icons are drawn while keeping the operator's theme; what "beautiful" means concretely in this theme; scroll behavior for Spaces.

## Inputs (absolute paths)

- Intake: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/bf6c9fb4-e5fd-4d8c-883f-af2eb97eb7ab/scratchpad/map/INTAKE.md
- herdr-app manual (API truth): /home/ivan/.config/herdr-app/AGENTS.md, /home/ivan/.config/herdr-app/herdr.d.ts, /home/ivan/.config/herdr-app/gpui-kit.d.ts (large; search it, do not read whole)
- Live layout in use: /home/ivan/.config/herdr-app/layouts/flat.json; shared state /home/ivan/.config/herdr-app/shared.json
- Shipped mods (read-only, clone to change): /home/ivan/.config/herdr-app/mods/{files,changes,spaces,agents,workspace-chrome,tabs,pane,worktree}/main.js
- Operator's own customizations, source of truth, git repo github.com/ivanjuras/omarchy-customizations (not registered with akrogon): /home/ivan/Work/omarchy-customizations/herdr-app/ (README.md, layouts/flat.json, layouts/board.json, mods/agents-by-tab, board, session-status, prefix, tab-left, tab-right), installed by /home/ivan/Work/omarchy-customizations/install.sh lines 296-328
- Session app homes (personal files linked in on each launch, per the README "Sessions"): /home/ivan/.config/herdr-app-sessions/{infra,personal,mdconsultingny}
- Program icons: /home/ivan/.config/herdr-app/icons/ (claude.svg, codex.svg, pi.svg, antigravity.svg, ...); Program interface in herdr.d.ts
- akrogon records (one registered repo as example): /home/ivan/Work/infra/akrogon/issues/log.jsonl (phase transitions: ts, repo, slug, from, to, slot, verdict, head), timings.jsonl, merge-attempts.jsonl, issues/open/, issues/chart/, issues/closed/; registered repos: run `akrogon config` (repos map); `akrogon status` output; akrogon docs index /home/ivan/Work/infra/akrogon/docs/reference-index.md
- akrogon's pending move to herdr-app (how consultants and leaf slots will run under hc, labels herdr.space/herdr.tab): /home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md
- `hc --help`, `hc --skill`, `herdr-app commands` for CLI facts.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work (the mod source files above are the subject). Name sections, never line ranges, when you cite process text; cite code by path:line.

## Return

Write your map as markdown to exactly: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/bf6c9fb4-e5fd-4d8c-883f-af2eb97eb7ab/scratchpad/map/map-<YOUR LETTER>.md

When the file is complete, run exactly this as your last action, with your letter:
hc send t15 "done <YOUR LETTER>: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/bf6c9fb4-e5fd-4d8c-883f-af2eb97eb7ab/scratchpad/map/map-<YOUR LETTER>.md"
